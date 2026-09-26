import json
import os
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


@dataclass
class Settings:
    database: str = field(default_factory=lambda: os.getenv("PS5_DATABASE", str(ROOT / "var/ps5.sqlite")))
    graph_path: str = field(default_factory=lambda: os.getenv("PS5_GRAPH_PATH", str(ROOT / "data/W2RKG_08.json")))
    demo: bool = field(default_factory=lambda: os.getenv("PS5_DEMO", "0") == "1")
    tokens: dict[str, str] = field(default_factory=lambda: json.loads(os.getenv("PS5_TOKENS", "{}")))
    bridge_token: str = field(default_factory=lambda: os.getenv("PS5_BRIDGE_TOKEN", ""))
    admin_token: str = field(default_factory=lambda: os.getenv("PS5_ADMIN_TOKEN", ""))
    origins: list[str] = field(default_factory=lambda: os.getenv("PS5_CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(","))
    embedding_backend: str = field(default_factory=lambda: os.getenv("PS5_EMBEDDINGS", "lexical"))
    embedding_model: str = field(default_factory=lambda: os.getenv("PS5_EMBEDDING_MODEL", "Alibaba-NLP/gte-large-en-v1.5"))
    llm_url: str = field(default_factory=lambda: os.getenv("PS5_LLM_BASE_URL", ""))
    llm_model: str = field(default_factory=lambda: os.getenv("PS5_LLM_MODEL", ""))
    llm_key: str = field(default_factory=lambda: os.getenv("PS5_LLM_API_KEY", ""))

    def __post_init__(self):
        if self.demo:
            self.tokens = {"demo-buyer-token": "demo-buyer", "demo-seller-token": "demo-seller", **self.tokens}
        if self.embedding_backend not in {"lexical", "sentence_transformers"}:
            raise ValueError("PS5_EMBEDDINGS must be lexical or sentence_transformers")
