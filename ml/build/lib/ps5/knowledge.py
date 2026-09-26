import hashlib
import json
import re
import threading
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote

from .models import Citation

ALIASES = {
    "bfs": "blast furnace slag", "blast-furnace slag": "blast furnace slag",
    "natural aggregate": "aggregate", "virgin aggregate": "aggregate",
    "rice husks": "rice husk", "rice hulls": "rice husk",
    "coal fly ash": "fly ash",
}
NON_MATERIAL_OUTPUTS = {"thermal stability", "soil ph", "soil organic carbon", "reduced soil bulk density", "reduced greenhouse gas emissions", "environmental benefit", "cost savings"}


def normalize(text):
    text = re.sub(r"\s+", " ", text.lower().strip())
    return ALIASES.get(text, text)


def citations(reference):
    result = []
    for ref in re.split(r",\s*", reference or ""):
        match = re.fullmatch(r"(10\.\d{4,9}/\S+?)(?:_chunk(\d+))?", ref.strip())
        if match:
            doi, chunk = match.groups()
            result.append(Citation(doi=doi, url="https://doi.org/" + quote(doi, safe="/"), chunk=chunk).model_dump())
    return result


def route_id(inputs, output, process=""):
    payload = json.dumps([inputs, output, process], ensure_ascii=False)
    return "route-" + hashlib.sha256(payload.encode()).hexdigest()[:20]


class Similarity:
    def __init__(self, settings):
        self.backend = settings.embedding_backend
        self.lock = threading.RLock()
        self.encoder = None
        self.embeddings = {}
        if self.backend == "sentence_transformers":
            from sentence_transformers import SentenceTransformer
            # No remote model code is executed. Use a compatible reviewed/local model.
            self.encoder = SentenceTransformer(settings.embedding_model, trust_remote_code=False)

    def prepare(self, names):
        if self.encoder:
            keys = sorted({normalize(n) for n in names} - self.embeddings.keys())
            if keys:
                vectors = self.encoder.encode(keys, normalize_embeddings=True, batch_size=32)
                self.embeddings.update(zip(keys, vectors))

    @lru_cache(maxsize=10000)
    def score(self, a, b):
        a, b = normalize(a), normalize(b)
        if a == b:
            return 1.0
        if self.encoder:
            with self.lock:
                self.prepare([a, b])
                return max(0.0, min(1.0, float(self.embeddings[a] @ self.embeddings[b])))
        # Explicitly labelled lexical fallback, never described as semantic inference.
        aw, bw = set(re.findall(r"[a-z0-9]+", a)), set(re.findall(r"[a-z0-9]+", b))
        return len(aw & bw) / len(aw | bw) if aw and bw else 0.0


class Knowledge:
    def __init__(self, settings, store):
        self.store = store
        self.similarity = Similarity(settings)
        self.lock = threading.RLock()
        self.routes = {}
        self.output_index = defaultdict(list)
        self.input_index = defaultdict(list)
        self.output_tokens = defaultdict(set)
        self.input_tokens = defaultdict(set)
        self.quarantined = 0
        self.raw_count = 0
        path = Path(settings.graph_path)
        if not path.exists():
            raise RuntimeError(f"Knowledge graph missing: {path}")
        raw = json.loads(path.read_text(encoding="utf-8"))
        self.raw_count = len(raw)
        for entry in raw:
            if not isinstance(entry, dict):
                self.quarantined += 1
                continue
            waste = str(entry.get("waste", "")).strip()
            output = str(entry.get("transformed_resource", "")).strip()
            refs = citations(entry.get("reference", ""))
            if not waste or not output or not refs or normalize(output) in NON_MATERIAL_OUTPUTS:
                self.quarantined += 1
                continue
            process = entry.get("transforming_process", "")
            if isinstance(process, list):
                process = "; ".join(process)
            process = str(process)
            rid = route_id([waste], output, process)
            self._index({"id": rid, "inputs": [waste], "output": output, "process": process,
                         "references": refs, "evidence_status": "machine_extracted_unreviewed",
                         "application_terms": [], "processing_required": True,
                         "dependencies_known": False,
                         "warning": "Aggregated extraction: process and reference lists may contain multiple contexts. Inspect original sources; this is not a validated process recipe."})
        for _, route in store.all("route"):
            self._index(route)
        self.similarity.prepare(list(self.output_index) + list(self.input_index))

    def _index(self, route):
        with self.lock:
            if route["id"] in self.routes:
                self.routes[route["id"]] = route
                return
            self.routes[route["id"]] = route
            self.output_index[normalize(route["output"])].append(route["id"])
            for token in re.findall(r"[a-z0-9]+", normalize(route["output"])):
                self.output_tokens[token].add(normalize(route["output"]))
            for material in route["inputs"]:
                self.input_index[normalize(material)].append(route["id"])
                for token in re.findall(r"[a-z0-9]+", normalize(material)):
                    self.input_tokens[token].add(normalize(material))

    def add_reviewed(self, payload):
        data = payload.model_dump(mode="json")
        rid = route_id(data["inputs"], data["output"], data["process"] + data["supporting_text"])
        route = {**data, "id": rid, "evidence_status": "reviewer_recorded", "dependencies_known": True,
                 "warning": "Reviewer-recorded evidence is not buyer-specific approval."}
        self.store.put("route", "admin", route, rid)
        self._index(route)
        return route

    def candidates(self, material, target, threshold=0.75):
        material, target = normalize(material), normalize(target)
        if material == target:
            yield {"id": "direct:" + hashlib.sha256(material.encode()).hexdigest()[:16],
                   "inputs": [material], "output": target, "process": "No substitution process inferred",
                   "references": [], "application_terms": [], "processing_required": False,
                   "dependencies_known": True, "evidence_status": "direct_listing",
                   "warning": "Direct material identity still requires specification checks."}, 1.0
        # Exact/alias paths use indices; embedding paths expand names before graph traversal.
        with self.lock:
            if self.similarity.backend == "lexical":
                input_names = set().union(*(self.input_tokens[t] for t in re.findall(r"[a-z0-9]+", material)))
                output_names = set().union(*(self.output_tokens[t] for t in re.findall(r"[a-z0-9]+", target)))
            else:
                input_names = tuple(self.input_index)
                output_names = tuple(self.output_index)
        inputs = {n: self.similarity.score(material, n) for n in input_names}
        outputs = {n: self.similarity.score(target, n) for n in output_names}
        ids = set()
        for name, score in outputs.items():
            if score >= threshold:
                ids.update(self.output_index[name])
        found = []
        for rid in ids:
            route = self.routes[rid]
            left = max(inputs.get(normalize(i), 0) for i in route["inputs"])
            right = outputs[normalize(route["output"])]
            if left >= threshold:
                primary = max(route["inputs"], key=lambda i: inputs.get(normalize(i), 0))
                found.append(({**route, "matched_input": primary}, min(left, right)))
        yield from sorted(found, key=lambda x: (-x[1], x[0]["id"]))

    def search(self, term, limit=20):
        term = normalize(term)
        scored = []
        with self.lock:
            routes = tuple(self.routes.values())
        for route in routes:
            score = max(self.similarity.score(term, route["output"]), *(self.similarity.score(term, i) for i in route["inputs"]))
            if score >= 0.5:
                scored.append((score, route))
        return [r for _, r in sorted(scored, key=lambda x: (-x[0], x[1]["id"]))[:limit]]
