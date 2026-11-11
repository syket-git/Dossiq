#!/usr/bin/env bash
# Start the FastAPI backend and the Next.js frontend together.
# Stop both with Ctrl+C.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
BACKEND="${BACKEND_DIR:-$HERE/../enterprise-rag-backend}"

if [ ! -d "$BACKEND" ]; then
  echo "Backend folder not found: $BACKEND (set BACKEND_DIR to override)" >&2
  exit 1
fi

cleanup() { kill 0 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "Starting FastAPI on http://127.0.0.1:8000"
(cd "$BACKEND" && uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &

echo "Starting Next.js on http://localhost:3000"
(cd "$HERE" && npx next dev) &

wait
