# Dossiq

Ask questions about your own documents and get answers with citations.

Dossiq is an enterprise RAG (retrieval-augmented generation) system. You upload PDF, DOCX, TXT, or Markdown files. The system indexes them. Then you ask questions in plain language, and Dossiq answers using only those documents, with numbered links to the source passages.

## Features

- **Cited answers.** Every answer points to the exact document and page it came from.
- **No guessing.** If no matching passage is found, Dossiq says so instead of making something up.
- **Follow-up questions.** Conversation history is saved, so "summarize that" works.
- **Access control.** Search only returns passages from documents the user is allowed to see. Data is split per tenant.
- **Guardrails.** Prompt-injection attempts are blocked on input. Answers that contain secrets (keys, passwords) are hidden on output.
- **Human approval.** Risky requests (delete, export, send to, update policy) go to an admin queue instead of running.
- **Audit log.** Uploads, blocks, and approvals are recorded.
- **Insights.** Admin view of document status, feedback, and guardrail events.

## How it works

```
Browser ──> Next.js (:3000) ──proxy /api/*──> FastAPI (:8000)
   │                                            │
   │ direct PUT (presigned URL)                 ├── PostgreSQL  (documents, chat, approvals, audit)
   └──────────────> Amazon S3 <─── read ────────┤
                                                ├── OpenAI      (embeddings + chat)
                                                └── Pinecone    (vector search, one namespace per tenant)
```

**Uploading a document**

1. The UI asks the API for an upload slot. The API returns a presigned S3 URL.
2. The browser uploads the file straight to S3.
3. The API reads the file, splits it into chunks, embeds them with OpenAI, and stores them in Pinecone.

**Answering a question**

1. Check the question against the input guardrails and the approval rules.
2. Embed the question and search Pinecone, filtered by what the user may access.
3. Drop weak matches. If nothing is left, reply "no evidence".
4. Send the passages to the chat model and ask for a cited answer.
5. Check the answer for secrets, then save the turn.

The pipeline is a small LangGraph graph in [enterprise-rag-backend/app/graph.py](enterprise-rag-backend/app/graph.py).

## Tech stack

| Part | Tools |
|------|-------|
| Backend | Python 3.14, FastAPI, LangGraph, psycopg, uv |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| Storage | PostgreSQL, Amazon S3, Pinecone |
| Models | OpenAI (`text-embedding-3-small`, `gpt-4o-mini` by default) |
| Tracing | Rius (optional, off by default) |

## Repository layout

```
Dossiq/
├── enterprise-rag-backend/    FastAPI API, RAG pipeline, ingestion
│   ├── app/                   API routes, graph, guardrails, storage clients
│   ├── worker/ingest.py       Parse, chunk, embed, and index a document
│   ├── infra/schema.sql       Database schema
│   └── scripts/init_db.py     Apply the schema
└── enterprise-rag-frontend/   Next.js UI
    ├── app/                   Page shell and navigation
    ├── components/            Ask, Documents, Approvals, Insights views
    └── lib/api.ts             Typed API client
```

## Getting started

### Prerequisites

- Python 3.14 and [uv](https://docs.astral.sh/uv/)
- Node.js 20 or newer
- A PostgreSQL database
- An S3 bucket, with a CORS rule that allows `PUT` from `http://localhost:3000`
- An OpenAI API key
- A Pinecone API key

### 1. Backend

```bash
cd enterprise-rag-backend
cp .env.example .env          # then fill in your keys
uv sync
uv run python scripts/init_db.py
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The Pinecone index is created on first use if it does not exist.

API docs: http://127.0.0.1:8000/api/docs

### 2. Frontend

```bash
cd enterprise-rag-frontend
cp .env.example .env.local    # API_URL defaults to http://127.0.0.1:8000
npm install
npm run dev
```

Open http://localhost:3000.

### Run both at once

```bash
cd enterprise-rag-frontend
npm run dev:all
```

## Configuration

Backend settings are read from `enterprise-rag-backend/.env`. The main ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` | S3 access for uploads |
| `OPENAI_API_KEY`, `OPENAI_EMBED_MODEL`, `OPENAI_CHAT_MODEL` | Models for embeddings and answers |
| `EMBED_DIMENSION` | Vector size. Must match the Pinecone index (default 1024) |
| `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` | Vector store |
| `CORS_ORIGINS` | Allowed frontend origins, comma-separated |
| `RIUS_API_KEY` | Turns on tracing. Leave empty to keep it off |

Optional tuning: `MIN_RELEVANCE` (default 0.25), `MEMORY_TURNS` (default 6), `HITL_ENABLED` (default true), `MAX_UPLOAD_BYTES` (default 10 MB).

## API overview

| Method | Path | What it does |
|--------|------|--------------|
| `POST` | `/api/documents/uploads` | Get a presigned S3 upload URL |
| `POST` | `/api/documents/complete` | Index an uploaded file |
| `POST` | `/api/documents/{id}/abort` | Cancel a pending upload |
| `GET` | `/api/documents` | List documents |
| `POST` | `/api/chat` | Ask a question |
| `GET` | `/api/conversations/{id}/messages` | Load a conversation |
| `POST` | `/api/feedback` | Rate an answer |
| `GET` | `/api/approvals` | List approval requests (admin) |
| `POST` | `/api/approvals/{id}/decision` | Approve or reject (admin) |
| `GET` | `/api/admin/metrics` | Document and feedback counts |
| `GET` | `/api/admin/guardrails` | Guardrail block counts (admin) |
| `GET` | `/health/live`, `/health/ready` | Health checks |

## Current limits

This is a single-workspace demo. Keep these in mind before using it for real:

- **No login.** Every request runs as one fixed admin user in one tenant.
- **Guardrails are simple rules.** They use regex patterns, not a managed safety service.
- **Approvals only record a decision.** Approving a request does not run any action.
- **Indexing is synchronous.** Large files make the upload request wait until indexing ends.
- **No OCR.** Scanned PDFs with no text layer cannot be indexed.
- **No tests yet.**
