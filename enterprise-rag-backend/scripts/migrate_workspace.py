"""Move single-workspace demo data into a Clerk workspace. Safe to rerun.

Usage: uv run python scripts/migrate_workspace.py --to org_XXXX --owner user_XXXX
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db import connection  # noqa: E402
from app.vector import index, namespace  # noqa: E402

OLD_OWNER = "demo-operator"
TABLES = ("documents", "chat_messages", "approvals", "feedback", "audit_events")


def move_rows(old: str, new: str, owner: str):
    with connection() as conn:
        for table in TABLES:
            n = conn.execute(
                f"UPDATE {table} SET tenant_id=%s WHERE tenant_id=%s", (new, old)
            ).rowcount
            print(f"{table}: {n} rows moved")
        conn.execute(
            "UPDATE documents SET owner_sub=%s WHERE tenant_id=%s AND owner_sub=%s",
            (owner, new, OLD_OWNER),
        )
        conn.execute(
            "UPDATE chat_messages SET user_sub=%s WHERE tenant_id=%s AND user_sub=%s",
            (owner, new, OLD_OWNER),
        )
        for col, table in (("requester", "approvals"), ("reviewer", "approvals"), ("actor", "feedback")):
            conn.execute(
                f"UPDATE {table} SET {col}=%s WHERE tenant_id=%s AND {col}=%s",
                (owner, new, OLD_OWNER),
            )


def move_vectors(old: str, new: str, owner: str):
    idx = index()
    src, dst = namespace(old), namespace(new)
    copied = 0
    for ids in idx.list(namespace=src):
        ids = list(ids)
        if not ids:
            continue
        fetched = idx.fetch(ids=ids, namespace=src).vectors
        batch = []
        for v in fetched.values():
            meta = dict(v.metadata or {})
            if meta.get("owner_sub") == OLD_OWNER:
                meta["owner_sub"] = owner
            batch.append({"id": v.id, "values": list(v.values), "metadata": meta})
        for i in range(0, len(batch), 50):
            idx.upsert(vectors=batch[i : i + 50], namespace=dst)
        idx.delete(ids=ids, namespace=src)
        copied += len(batch)
    print(f"pinecone: {copied} vectors moved {src} -> {dst}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="old", default="demo-workspace")
    ap.add_argument("--to", dest="new", required=True, help="Clerk organization id (org_...)")
    ap.add_argument("--owner", required=True, help="Clerk user id (user_...)")
    a = ap.parse_args()
    if not a.new.startswith("org_") or not a.owner.startswith("user_"):
        print("ERROR: --to must be an org_ id and --owner a user_ id")
        return 1
    move_rows(a.old, a.new, a.owner)
    move_vectors(a.old, a.new, a.owner)
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
