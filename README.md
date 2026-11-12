<div align="center">

<img src="docs/images/logo.svg" width="120" alt="Dossiq logo" />

# Dossiq

**Ask your company documents anything. Get answers you can check.**

Dossiq reads your PDFs, Word files, and notes, then answers questions in plain language.<br/>
Every answer points to the exact page it came from. Every team gets its own private workspace.

<br/>

Designed and built by **[Syket Bhattachergee](https://syketb.vercel.app/)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Syket_Bhattachergee-a78bfa?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/syketb)
[![Website](https://img.shields.io/badge/Website-syketb.vercel.app-5eead4?style=flat-square&logo=vercel&logoColor=white)](https://syketb.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-syket--git-fdba74?style=flat-square&logo=github&logoColor=white)](https://github.com/syket-git)

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-0e0b1f?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-0e0b1f?style=for-the-badge&logo=react&logoColor=5eead4)
![FastAPI](https://img.shields.io/badge/FastAPI-0e0b1f?style=for-the-badge&logo=fastapi&logoColor=5eead4)
![Python](https://img.shields.io/badge/Python_3.14-0e0b1f?style=for-the-badge&logo=python&logoColor=fdba74)
![LangGraph](https://img.shields.io/badge/LangGraph-0e0b1f?style=for-the-badge&logo=langchain&logoColor=a78bfa)
![OpenAI](https://img.shields.io/badge/OpenAI-0e0b1f?style=for-the-badge&logo=openai&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-0e0b1f?style=for-the-badge&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0e0b1f?style=for-the-badge&logo=postgresql&logoColor=93c5fd)
![Amazon S3](https://img.shields.io/badge/Amazon_S3-0e0b1f?style=for-the-badge&logo=amazons3&logoColor=fdba74)
![Clerk](https://img.shields.io/badge/Clerk-0e0b1f?style=for-the-badge&logo=clerk&logoColor=a78bfa)

<br/>

<img src="docs/images/ask-answer.png" alt="Dossiq answering a travel question with numbered citations and matching source cards" width="100%" />

</div>

<br/>

## What is Dossiq?

Every company has answers buried in documents. Policies, handbooks, playbooks, guides. Finding the right line takes time, and people often guess.

Dossiq fixes that. A team creates a workspace, uploads its files once, and invites teammates. After that, anyone on the team can ask a question like *"How much paid time off do I get?"* and get a short, clear answer with the source attached.

What makes it trustworthy:

- **It only uses your documents.** It does not make things up from the internet.
- **It shows its work.** Each fact has a small colored number. Click it, and you see the exact passage and page.
- **It says when it does not know.** If nothing in your files covers the question, it tells you so.
- **Each team stays separate.** A workspace never sees another workspace's files, chats, or approvals.
- **Admins stay in control.** Risky requests wait for an admin, and only admins see the review queue and usage numbers.

<br/>

## Highlights

| | |
|---|---|
| 🎯 **Cited answers** | Every claim links to a page in a real document. Colors match the source cards. |
| 🏢 **Multiple workspaces** | One account, many teams. Switch workspaces in one click. Data never crosses over. |
| 🔑 **Real sign-in** | Email or Google login powered by Clerk. New users name themselves and their workspace. |
| 👥 **Roles** | Admins manage members, review requests, and see Insights. Members ask and upload. |
| ✋ **Approvals that answer back** | Risky requests wait for an admin. Once approved, the answer lands in the asker's chat by itself. |
| 🔒 **Private chats** | Each person's conversations belong to them, even inside a shared workspace. |
| 🧠 **Remembers the conversation** | Follow-ups like "summarize that" just work. Chats survive a page reload. |
| 🛡️ **Guardrails** | Blocks prompt-injection tricks. Hides answers that would leak keys or passwords. |
| 📜 **Audit trail** | Uploads, blocks, and decisions are all recorded per workspace. |
| ✨ **Polished UI** | Animated assistant, word-by-word answers, drag-and-drop uploads, works on phones. |

<br/>

## A walk through Dossiq

> The screenshots below are from a demo workspace for **Kestrel Ridge Outfitters**, a made-up outdoor gear company. The people (Maya Chen, Daniel Okafor) and documents are fictional, but every screen is the real app with real answers.
>
> - **Maya Chen** is Head of People Operations. She is the workspace **admin**.
> - **Daniel Okafor** runs store operations. He is a **member**.

### 1. Sign in and create a workspace

Maya signs in with email or Google. On her first visit, Dossiq asks her to name her team's workspace. She calls it **Kestrel Ridge**, and becomes its admin.

<table>
  <tr>
    <td width="50%"><img src="docs/images/sign-in.png" alt="Dossiq sign-in screen with Google and email options" /></td>
    <td width="50%"><img src="docs/images/workspace-setup.png" alt="Set up your organization screen with the name Kestrel Ridge" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Sign in with email or Google</sub></td>
    <td align="center"><sub>Name the workspace on first visit</sub></td>
  </tr>
</table>

### 2. Upload the team's documents

Maya drops in the company handbook, the travel policy, the security policy, the store returns playbook, and the onboarding checklist. Dossiq shows each step while it uploads and indexes the file.

<table>
  <tr>
    <td width="50%"><img src="docs/images/documents.png" alt="Five Kestrel Ridge documents, all marked Ready" /></td>
    <td width="50%"><img src="docs/images/documents-upload.png" alt="Upload in progress: preparing, uploading, indexing" /></td>
  </tr>
  <tr>
    <td align="center"><sub>The workspace library, all ready</sub></td>
    <td align="center"><sub>Three clear steps for every upload</sub></td>
  </tr>
</table>

### 3. Ask a question, check the answer

Maya is planning a supplier trip. She asks what she needs to know. The orb tells her what it is doing, then the answer appears word by word. Each colored number links to the exact page in the travel policy.

<table>
  <tr>
    <td width="50%"><img src="docs/images/ask-empty.png" alt="Empty Ask screen with suggested questions, signed in as Maya Chen" /></td>
    <td width="50%"><img src="docs/images/ask-thinking.png" alt="Dossiq searching documents for the Tokyo trip question" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Ready for a question</sub></td>
    <td align="center"><sub>Searching, reading, then writing</sub></td>
  </tr>
</table>

<img src="docs/images/ask-answer.png" alt="Answer about a Tokyo trip with citations to pages 2 and 3 of the travel policy" width="100%" />

### 4. Invite the team and set roles

From the workspace menu, Maya opens **Manage** and invites Daniel as a **member**. Admins can change roles or remove people at any time.

<img src="docs/images/members.png" alt="Members list showing Daniel Okafor as Member and Maya Chen as Admin" width="100%" />

| Role | Ask and upload | See Approvals | Approve or reject | See Insights | Manage members |
|---|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | | | | |

### 5. A member asks for something risky

Daniel only sees **Ask** and **Documents**. He gets normal answers right away. When he asks Dossiq to *send* something to his team, Dossiq does not act. It holds the request and tells him an admin will review it. Maya sees it in her queue, with Daniel's name on it.

<table>
  <tr>
    <td width="50%"><img src="docs/images/member-request.png" alt="Daniel's chat: a cited answer, then a send request held for approval" /></td>
    <td width="50%"><img src="docs/images/approvals-pending.png" alt="Maya's Approvals queue with two requests from Daniel Okafor" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Daniel (member): the request is held</sub></td>
    <td align="center"><sub>Maya (admin): the review queue</sub></td>
  </tr>
</table>

### 6. Approve, and the answer arrives

Maya approves. Dossiq answers the question **with Daniel's own access rights**, not Maya's, and posts the answer into Daniel's chat. Daniel does not need to refresh. If Maya rejects it, Daniel gets a short note instead. Nothing is ever executed, only answered.

<table>
  <tr>
    <td width="50%"><img src="docs/images/approvals.png" alt="Approvals: one approved request with Answer sent, one still waiting" /></td>
    <td width="50%"><img src="docs/images/member-answered.png" alt="Daniel's chat now shows the answer under the held request" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Reviewed by Maya Chen. Answer sent.</sub></td>
    <td align="center"><sub>The answer appears in Daniel's chat</sub></td>
  </tr>
</table>

### 7. Many workspaces, fully separate

Maya also runs **Kestrel Ridge Finance**, a second workspace with the confidential budget. She switches with one click. When she asks the Finance workspace about store returns, it finds nothing, because that playbook lives only in the main workspace.

<table>
  <tr>
    <td width="50%"><img src="docs/images/workspace-switcher.png" alt="Workspace switcher showing Kestrel Ridge Finance and Kestrel Ridge" /></td>
    <td width="50%"><img src="docs/images/finance-isolation.png" alt="In the Finance workspace, a returns question finds no evidence" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Switch between workspaces</sub></td>
    <td align="center"><sub>Finance cannot see the main workspace's files</sub></td>
  </tr>
</table>

### 8. See how the workspace is used

Insights is for admins. It shows document health, how people rate the answers, and how often the guardrails stepped in, for the current workspace only.

<img src="docs/images/insights.png" alt="Insights: 5 documents ready, 2 helpful ratings, 0 guardrail events" width="100%" />

### 9. Works on your phone

On small screens, the navigation moves to the top, and sources slide up from the bottom when you tap a citation.

<p align="center">
  <img src="docs/images/mobile-chat.png" alt="Dossiq chat on a phone answering a paid time off question" width="30%" />
  &nbsp;&nbsp;&nbsp;
  <img src="docs/images/mobile-sources.png" alt="Sources sheet on a phone showing the handbook page" width="30%" />
</p>

<br/>

## How it works

### The big picture

```mermaid
flowchart LR
    U([👤 You]) --> FE["Dossiq web app<br/>Next.js"]
    FE -- "sign in" --> CK["Clerk<br/>users, workspaces, roles"]
    FE -- "/api/* + session token" --> BE["Dossiq API<br/>FastAPI + LangGraph"]
    BE -- "verify token" --> CK
    FE -- "file upload<br/>(direct, signed URL)" --> S3[("Amazon S3<br/>original files")]
    BE --> S3
    BE --> PG[("PostgreSQL<br/>documents, chats,<br/>approvals, audit log")]
    BE --> PC[("Pinecone<br/>one namespace<br/>per workspace")]
    BE --> AI["OpenAI<br/>embeddings + answers"]
```

The web app never talks to the databases directly. It only calls the Dossiq API, which checks the Clerk session token on every request. Files are the one exception: the browser sends them straight to S3 using a short-lived signed link, so large files do not pass through the API.

### Who you are, and which workspace you are in

```mermaid
flowchart LR
    T["Clerk session token"] --> V{"Signature and<br/>issuer valid?"}
    V -- no --> R401["401 Sign in again"]
    V -- yes --> O{"Active workspace?"}
    O -- no --> R403["403 Choose a workspace"]
    O -- yes --> P["Principal<br/>user id + workspace id + role"]
    P --> Q["Every query is limited<br/>to this workspace"]
    P --> A{"Admin-only route?"}
    A -- "member" --> R["403 Admin only"]
```

- **One Clerk Organization is one Dossiq workspace.** The workspace id becomes the tenant for every database query, every S3 path, and the Pinecone namespace.
- **Roles come from Clerk.** `admin` and `member` are checked on the server, not just hidden in the UI.
- **Chats are private.** Conversations are stored per user, so teammates cannot open each other's chats.

### What happens when you upload a file

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant API as Dossiq API
    participant S3 as Amazon S3
    participant AI as OpenAI
    participant V as Pinecone
    participant DB as PostgreSQL

    B->>API: I want to upload "Employee Handbook 2026.pdf"
    API->>DB: Save document as "pending" in this workspace
    API-->>B: Here is a signed upload link (5 min)
    B->>S3: Upload the file
    B->>API: Upload finished, please index it
    API->>S3: Read the file
    API->>API: Pull out the text, split into small pieces
    API->>AI: Turn each piece into numbers (embeddings)
    API->>V: Store the pieces in this workspace's namespace
    API->>DB: Mark document as "ready"
    API-->>B: Done
```

### What happens when you ask a question

Each question goes through a small pipeline built with LangGraph:

```mermaid
flowchart TD
    Q["❓ Your question"] --> G{"Input guardrail<br/>Is this a trick or attack?"}
    G -- blocked --> X["⛔ Request blocked"]
    G -- ok --> H{"Risky action?<br/>delete, export, send, update policy"}
    H -- yes --> AP["✋ Held for admin approval"]
    H -- no --> R["🔎 Retrieve<br/>Find the closest passages<br/>in this workspace"]
    R --> E{"Good matches found?"}
    E -- no --> NE["🤷 No evidence found<br/>Dossiq says it does not know"]
    E -- yes --> GEN["✍️ Generate<br/>Write a short answer<br/>with [1] [2] citations"]
    GEN --> V{"Output guardrail<br/>Does it leak secrets?"}
    V -- yes --> HID["🙈 Answer hidden"]
    V -- no --> OK["✅ Answer + sources"]
```

### What happens after an approval

```mermaid
sequenceDiagram
    autonumber
    participant M as Member (Daniel)
    participant API as Dossiq API
    participant A as Admin (Maya)

    M->>API: "Send to my team the refund rules"
    API->>API: Hold it: save the request and a notice in Daniel's chat
    API-->>M: Waiting for an admin
    A->>API: Approve
    API->>API: Answer the question with Daniel's access rights
    API->>API: Post the answer into Daniel's chat
    M->>API: (chat checks every few seconds)
    API-->>M: Here is the answer, with sources
```

A few details that matter:

- **Follow-ups work** because the last question is added to the search when you ask something short like "summarize that".
- **Weak matches are dropped.** Only passages above a relevance score are used, so the answer stays on topic.
- **Documents are treated as data, not instructions.** Text inside a file cannot take control of the assistant.
- **Approvals never run actions.** Approving only lets Dossiq answer the question. It never deletes, exports, or sends anything.

<br/>

## Tech stack

| Layer | What we use | Why |
|---|---|---|
| Web app | Next.js 16, React 19, Tailwind CSS 4, TypeScript | Fast, modern UI |
| Sign-in and workspaces | Clerk (Organizations, roles) | Secure login, invites, and roles without building them |
| Motion and UI | Motion, Lucide icons, React Markdown | Smooth animation, clear icons, formatted answers |
| API | Python 3.14, FastAPI, uv, PyJWT | Simple, fast, typed. Verifies every session token |
| AI pipeline | LangGraph | Clear, step-by-step answer flow |
| Models | OpenAI `text-embedding-3-small`, `gpt-4o-mini` | Good quality at low cost |
| Search | Pinecone | Fast similarity search, one namespace per workspace |
| Database | PostgreSQL | Documents, chats, approvals, audit log |
| File storage | Amazon S3 | Original uploaded files |
| Tracing | Rius (optional, off by default) | Traces timing only, never content |

<br/>

## Project layout

```
Dossiq/
├── enterprise-rag-backend/       The API
│   ├── app/
│   │   ├── main.py               API routes
│   │   ├── auth.py               Clerk token check, workspace and role
│   │   ├── users.py              Look up display names from Clerk
│   │   ├── graph.py              The question-answering pipeline
│   │   ├── guardrails.py         Input and output safety checks
│   │   ├── vector.py             Pinecone search, one namespace per workspace
│   │   ├── memory.py             Private conversation history
│   │   └── aws.py                S3 and OpenAI clients
│   ├── worker/ingest.py          Read, split, and index a document
│   ├── infra/schema.sql          Database tables
│   └── scripts/
│       ├── init_db.py            Create or update the tables
│       └── migrate_workspace.py  Move old demo data into a real workspace
│
├── enterprise-rag-frontend/      The web app
│   ├── app/                      Page shell, sign-in, workspace picker
│   ├── components/               Ask, Documents, Approvals, Insights
│   ├── lib/api.ts                Typed API client (sends the session token)
│   └── proxy.ts                  Clerk session handling
│
└── docs/images/                  Logo and screenshots
```

<br/>

## Run it yourself

### What you need

- Python 3.14 and [uv](https://docs.astral.sh/uv/)
- Node.js 20 or newer
- A PostgreSQL database
- An Amazon S3 bucket, with a CORS rule that allows `PUT` from `http://localhost:3000`
- An OpenAI API key
- A Pinecone API key
- A free [Clerk](https://clerk.com) account

### 1. Set up Clerk

1. Create a Clerk application with **Email** and **Google** sign-in.
2. Turn on **Organizations**. Each organization becomes a Dossiq workspace.
3. Optional: under **User model**, require first and last name, so approvals show real names.
4. From **API keys**, copy the publishable key, the secret key, and the Frontend API URL.

### 2. Start the API

```bash
cd enterprise-rag-backend
cp .env.example .env          # then add your keys, including the Clerk ones
uv sync
uv run python scripts/init_db.py
uv run python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The Pinecone index is created for you on first use. API docs live at http://127.0.0.1:8000/api/docs.

### 3. Start the web app

```bash
cd enterprise-rag-frontend
cp .env.example .env.local    # add the Clerk publishable and secret keys
npm install
npm run dev
```

Open http://localhost:3000, sign in, name your workspace, and upload your first document.

### Or start both at once

```bash
cd enterprise-rag-frontend
npm run dev:all
```

### Coming from the single-workspace version?

Old data was stored under `demo-workspace`. Move it into your new workspace once:

```bash
cd enterprise-rag-backend
uv run python scripts/migrate_workspace.py --to org_XXXX --owner user_XXXX
```

You can find both ids in the Clerk dashboard.

<br/>

## Settings

The API reads its settings from `enterprise-rag-backend/.env`, and the web app from `enterprise-rag-frontend/.env.local`. Never commit these files. They are already in `.gitignore`.

**API (`enterprise-rag-backend/.env`)**

| Setting | What it does |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` | Where uploaded files are stored |
| `OPENAI_API_KEY`, `OPENAI_EMBED_MODEL`, `OPENAI_CHAT_MODEL` | Which AI models to use |
| `EMBED_DIMENSION` | Size of each embedding. Must match the Pinecone index (default 1024) |
| `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` | The search index |
| `CLERK_ISSUER` | Your Clerk Frontend API URL, for example `https://your-app.clerk.accounts.dev` |
| `CLERK_JWKS_URL` | `CLERK_ISSUER` + `/.well-known/jwks.json`. Used to verify session tokens |
| `CLERK_SECRET_KEY` | Used to look up display names for approvals |
| `AUTH_MODE` | `clerk` (default). `demo` skips login with one built-in admin, for local testing only |
| `CORS_ORIGINS` | Web addresses allowed to call the API. Tokens from other sites are rejected |
| `RIUS_API_KEY` | Turns on tracing. Leave empty to keep it off |

Optional tuning: `MIN_RELEVANCE` (default 0.25), `MEMORY_TURNS` (default 6), `HITL_ENABLED` (default true), `MAX_UPLOAD_BYTES` (default 10 MB).

**Web app (`enterprise-rag-frontend/.env.local`)**

| Setting | What it does |
|---|---|
| `API_URL` | Where the FastAPI server runs (default `http://127.0.0.1:8000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key, used by the Next.js server |

<br/>

## API at a glance

Every route needs a Clerk session token, and works inside the active workspace.

| Method | Path | Who | What it does |
|---|---|---|---|
| `GET` | `/api/info` | Everyone | Current user, workspace, and role |
| `POST` | `/api/chat` | Everyone | Ask a question |
| `GET` | `/api/conversations/{id}/messages` | Owner of the chat | Load a past conversation |
| `POST` | `/api/feedback` | Everyone | Rate an answer |
| `POST` | `/api/documents/uploads` | Everyone | Get a signed upload link |
| `POST` | `/api/documents/complete` | Everyone | Index an uploaded file |
| `POST` | `/api/documents/{id}/abort` | Uploader | Cancel an upload |
| `GET` | `/api/documents` | Everyone | List documents |
| `GET` | `/api/approvals` | Admin | List approval requests, with names |
| `POST` | `/api/approvals/{id}/decision` | Admin | Approve (sends the answer) or reject |
| `GET` | `/api/admin/metrics` | Admin | Document and feedback counts |
| `GET` | `/api/admin/guardrails` | Admin | Guardrail counts |
| `GET` | `/health/live`, `/health/ready` | Public | Health checks |

<br/>

## Good to know

Dossiq now supports real sign-in, many workspaces, and roles. A few things to keep in mind:

- **Two roles for now.** Admin and member. A read-only viewer role is planned.
- **Approvals answer, they do not act.** Approving lets Dossiq answer the question. It never runs a delete, export, or send.
- **Risky requests are spotted by keywords.** Words like *delete*, *export*, *send to*, and *update policy* trigger an approval. Per-workspace rules are planned.
- **Everyone in a workspace sees all its documents.** Limiting a document to a group, like HR or Finance, is planned.
- **Guardrails are rule-based.** They catch common attacks, but they are not a full safety service.
- **Indexing happens while you wait.** Very large files keep the upload open until indexing finishes.
- **No OCR yet.** Scanned PDFs without a text layer cannot be read.

<br/>

## About the author

**Syket Bhattachergee** is a Forward Deployed Engineer building AI products. Syket designed and built Dossiq end to end: the AI pipeline, the API, the data layer, multi-workspace sign-in, and the interface.

- 💼 LinkedIn: [linkedin.com/in/syketb](https://www.linkedin.com/in/syketb)
- 🌐 Website: [syketb.vercel.app](https://syketb.vercel.app/)
- 🐙 GitHub: [@syket-git](https://github.com/syket-git)

Want to talk about AI products, RAG systems, or this project? Reach out on LinkedIn.

<br/>

<div align="center">
  <img src="docs/images/logo.svg" width="40" alt="" />
  <br/>
  <sub>Dossiq is designed and built by <a href="https://syketb.vercel.app/">Syket Bhattachergee</a>.</sub>
</div>
