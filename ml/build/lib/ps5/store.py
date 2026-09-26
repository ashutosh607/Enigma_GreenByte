import json
import sqlite3
import threading
from pathlib import Path
from uuid import uuid4


class Store:
    """Small persistent store; locked transactions support multiple request threads."""

    def __init__(self, path: str):
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.lock = threading.RLock()
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("CREATE TABLE IF NOT EXISTS records(kind TEXT,id TEXT,owner TEXT,data TEXT,PRIMARY KEY(kind,id))")
        self.db.execute("CREATE INDEX IF NOT EXISTS owner_index ON records(kind,owner)")
        self.db.commit()

    def put(self, kind, owner, data, record_id=None):
        record_id = record_id or uuid4().hex
        value = {**data, "id": record_id}
        with self.lock, self.db:
            self.db.execute("INSERT INTO records VALUES(?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET owner=excluded.owner,data=excluded.data", (kind, record_id, owner, json.dumps(value)))
        return value

    def get(self, kind, record_id):
        with self.lock:
            row = self.db.execute("SELECT owner,data FROM records WHERE kind=? AND id=?", (kind, record_id)).fetchone()
        return (row[0], json.loads(row[1])) if row else None

    def all(self, kind, owner=None):
        with self.lock:
            query = "SELECT owner,data FROM records WHERE kind=?"
            args = [kind]
            if owner is not None:
                query += " AND owner=?"
                args.append(owner)
            rows = self.db.execute(query, args).fetchall()
        return [(row[0], json.loads(row[1])) for row in rows]

    def consent(self, buyer, seller, actor, value, context):
        pair = context
        with self.lock:
            existing = self.get("consent", pair)
            data = existing[1] if existing else {"buyer": buyer, "seller": seller, "buyer_consent": False, "seller_consent": False}
            data["buyer_consent" if actor == buyer else "seller_consent"] = value
            return self.put("consent", buyer, data, pair)

    def revealed(self, buyer, seller, context):
        row = self.get("consent", context)
        return bool(row and row[1]["buyer_consent"] and row[1]["seller_consent"])

    def close(self):
        self.db.close()
