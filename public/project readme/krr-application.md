# KRR-APP Deep Project Documentation

---

## 1. Project Overview

KRR-APP (Knowledge Repository and Review) is a full-stack AI-assisted research paper workflow system. It solves a common research bottleneck: turning raw PDF papers into searchable, summarized, comparable knowledge.

### Purpose

The platform provides:
- PDF ingestion and metadata extraction.
- AI-generated structured summaries.
- Cross-paper comparative analysis.
- Synthetic literature review generation.
- Semantic vector search.
- Paper-grounded chat (RAG-style, single-document context).

### Target Users

- Students doing literature reviews.
- Researchers managing many papers.
- Engineers who need quick synthesis of technical docs.
- Knowledge workers who need faster read-triage and synthesis loops.

### Maturity Assessment

Current state is MVP-to-early production:
- Core architecture and authentication are in place.
- CI exists for backend tests and frontend lint/type/build.
- Dockerized deployment path exists.
- Major feature set is functional.
- Some production-hardening gaps remain (noted in the tech-debt section).

### End-to-End System Summary

1. User authenticates via JWT-based auth endpoints.
2. User uploads PDF through frontend multipart request.
3. Backend stores file, creates paper record, and launches background processing.
4. Processing pipeline extracts PDF text/metadata, calls Groq LLM for summary, optionally generates embedding vector.
5. Frontend polls for status and displays summary/content when processing is done.
6. User can run comparative or synthetic analyses across selected processed papers.
7. User can query semantic search and chat against individual paper content.

---

## 2. Project Structure

```text
KRR-APP/
├── README.md                            # Product overview, setup, API summary
├── docker-compose.yml                   # Main local stack: db + backend + frontend
├── docker-compose.screenshot.yml        # Alternate stack for screenshot/demo runs
├── .gitignore                           # Root ignores for backend/frontend/env/build files
├── .github/workflows/ci.yml             # CI: backend tests + frontend type/lint/build
├── backend/
│   ├── requirements.txt                 # Python dependency lock-style pins
│   ├── Dockerfile                       # Python app image build
│   ├── .env.example                     # Backend runtime environment template
│   ├── pytest.ini                       # Pytest defaults
│   ├── alembic.ini                      # Alembic migration config
│   ├── alembic/
│   │   ├── env.py                       # Alembic async migration environment
│   │   ├── script.py.mako               # Alembic migration template
│   │   └── versions/                    # DB migration revisions
│   ├── app/
│   │   ├── main.py                      # FastAPI app bootstrap + router registration
│   │   ├── database.py                  # SQLAlchemy async engine/session/base
│   │   ├── auth.py                      # Password hashing + JWT verification
│   │   ├── models/                      # SQLAlchemy ORM models
│   │   ├── schemas/                     # Pydantic request/response schemas
│   │   ├── services/                    # Business logic and external service adapters
│   │   └── routes/                      # FastAPI route layers
│   ├── tests/                           # Backend integration/API tests
│   └── uploads/                         # Uploaded PDF storage volume
└── frontend/
    ├── package.json                     # Next.js app scripts/deps
    ├── package-lock.json                # NPM lock file
    ├── Dockerfile                       # Next standalone production image
    ├── .env.local.example               # Frontend env template
    ├── next.config.mjs                  # Next config (standalone output)
    ├── tailwind.config.ts               # Theme tokens and utility setup
    ├── postcss.config.mjs               # Tailwind postcss plugin config
    ├── tsconfig.json                    # TypeScript compiler options
    ├── app/                             # App Router pages/layout/styles
    ├── components/                      # Shared UI and feature components
    ├── lib/
    │   ├── api.ts                       # Axios client + typed API wrappers
    │   └── utils.ts                     # className merge helper
    └── hooks/                           # Placeholder directory
```

### Naming Conventions

- Backend uses clear layered naming: `routes`, `services`, `models`, `schemas`.
- Route files map to domain nouns: `papers.py`, `analysis.py`, `search.py`, `auth.py`.
- Frontend component names are PascalCase and domain-specific (`PaperCard`, `AnalysisResult`).
- CSS uses prefixed class namespace `krr-*` for design-system consistency.

---

## 3. Design and Architecture

### Architectural Pattern

The backend follows a layered monolith pattern:
- Route layer handles HTTP contracts and auth guards.
- Service layer handles business workflows and external integrations.
- Model layer handles persistence schema.
- Schema layer controls transport contracts.

The frontend is a client-heavy Next.js App Router UI shell:
- Pages orchestrate data fetching and local state.
- Shared components encapsulate rendering and interactions.
- `lib/api.ts` centralizes API access and auth header injection.

### System Diagram

```text
┌─────────────────────────────────────────────────────┐
│ Frontend (Next.js 14, Client Components)           │
│ - Auth pages, dashboard, papers, analysis, settings│
│ - Axios client with Bearer token                   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP + SSE
┌───────────────────────▼─────────────────────────────┐
│ Backend (FastAPI, Python 3.11)                     │
│ Routes -> Services -> Models/DB                    │
│                                                     │
│ Papers: upload -> parse -> summarize -> embed      │
│ Analyses: comparative/synthetic generation          │
│ Search: vector similarity                           │
└───────────────┬──────────────────────┬──────────────┘
                │                      │
┌───────────────▼──────────────┐  ┌────▼────────────────┐
│ PostgreSQL + pgvector        │  │ Groq LLM API        │
│ users, papers, analyses      │  │ summary/analysis/RAG│
└──────────────────────────────┘  └─────────────────────┘
```

### Design Patterns Identified

- Dependency Injection: FastAPI `Depends` for DB session and current user.
- Service Layer: core workflows isolated in `backend/app/services/*`.
- Gateway/Adapter pattern: `groq_service.py` and `embedding_service.py` abstract external AI tooling.
- Repository-like access through service functions wrapping ORM queries.
- Context provider pattern on frontend for toast notifications.

### Scalability and Modularity Notes

Strengths:
- Clear separation between transport and business logic.
- Pluggable AI providers possible by swapping service internals.
- Vector search persisted in DB reduces infra complexity.

Limits:
- Background jobs are in-process FastAPI background tasks, not a durable queue.
- `init_db()` auto-creates tables while Alembic also exists (migration authority split).
- SSE and polling coexist; no unified eventing abstraction.

---

## 4. Tech Stack and Dependencies

### Runtime

- Backend: Python 3.11
- Frontend: Node 20 (Docker), Next.js 14.2.35
- Database: PostgreSQL 16 with pgvector

### Backend Libraries and Roles

- FastAPI: HTTP API framework.
- Uvicorn: ASGI server.
- SQLAlchemy async + asyncpg: ORM and PostgreSQL async driver.
- Alembic: migrations.
- pdfplumber: PDF extraction.
- groq: LLM API client.
- sentence-transformers: embedding generation model.
- pgvector Python binding: vector column/operator support.
- python-jose + bcrypt: JWT and password hashing.
- pytest + pytest-asyncio + httpx: tests.

### Frontend Libraries and Roles

- Next.js + React 18: rendering and routing.
- Axios: API client.
- Tailwind CSS: utility styling.
- clsx + tailwind-merge + cva: class composition.
- react-markdown + remark-gfm: render markdown summaries/results.
- framer-motion, lucide-react: animation and iconography.

### Dependency Risk Notes

- `docker-compose.screenshot.yml` contains a literal Groq API key string and should be treated as credential exposure risk.
- `sentence-transformers` adds heavy runtime footprint; startup and memory characteristics should be monitored.

---

## 5. Configuration and Environment

### Configuration Files

- Root `docker-compose.yml`: local multi-service orchestration.
- Root `.github/workflows/ci.yml`: CI execution plan.
- Backend `alembic.ini` + `alembic/env.py`: migration context.
- Frontend `next.config.mjs`: standalone build output.
- Frontend `tailwind.config.ts`: theme token mapping.
- Frontend `tsconfig.json`: strict TS configuration.

### Environment Variables

| Variable | Layer | Required | Purpose | Example |
|---|---|---|---|---|
| `GROQ_API_KEY` | backend | yes for AI features | LLM API authentication | `gsk_...` |
| `SECRET_KEY` | backend | yes | JWT signing secret | `long-random-secret` |
| `DATABASE_URL` | backend | yes | async SQLAlchemy DSN | `postgresql+asyncpg://...` |
| `UPLOAD_DIR` | backend | no (defaulted) | local file storage path | `./uploads` |
| `AUTH_PASSWORD` | backend | no/legacy | documented but not actively used in route logic | `mypassword` |
| `NEXT_PUBLIC_API_URL` | frontend | yes | backend base URL for axios client | `http://localhost:8000` |

### Build and Deployment Flow

Backend container:
1. Install system deps (`libpq-dev`, `gcc`).
2. Install Python requirements.
3. Copy source.
4. Create `uploads` dir.
5. Run uvicorn.

Frontend container:
1. Install NPM deps.
2. Build Next app in standalone mode.
3. Copy `.next/standalone` + static assets into runtime image.
4. Launch `server.js`.

CI pipeline:
1. Backend job starts pgvector PostgreSQL service.
2. Installs backend deps and runs pytest.
3. Frontend job installs deps, runs type check, lint, and production build.

---

## 6. Entry Points and Bootstrapping

### Backend Bootstrap

Entry file: `backend/app/main.py`

Boot sequence:
1. FastAPI app object is created with metadata and lifespan hook.
2. Lifespan calls `init_db()` from `database.py`.
3. CORS middleware allows `http://localhost:3000`.
4. Routers registered: auth, papers, analysis, search.
5. Health endpoint available at `/api/health`.

### Frontend Bootstrap

Entry file: `frontend/app/layout.tsx`

Boot sequence:
1. Fonts configured via `next/font/google`.
2. Theme initialization script reads localStorage before first paint.
3. `ToastProvider` wraps all pages.
4. Page-level routing then renders selected route component.

Error handling:
- Backend route-level exceptions converted to HTTP status responses.
- Frontend route components redirect to login on auth/load failures.

---

## 7. Modules and Components

This section lists the most significant implementation units.

### Backend Route Modules

#### Auth Routes (`backend/app/routes/auth.py`)
- Purpose: registration, login, profile lookup, password change.
- Inputs: email/password payloads, bearer token.
- Outputs: JWT token response, user info, HTTP 204 for password change.
- Logic: validate payload, query user by email, hash/verify passwords, generate JWT.
- State: user table records.
- Edge cases: duplicate email, weak password, invalid token, wrong current password.

#### Papers Routes (`backend/app/routes/papers.py`)
- Purpose: paper CRUD, upload processing trigger, citations, chat, SSE status and chat stream.
- Inputs: multipart PDF, paper IDs, query params (`page`, `limit`, `q`), citation format, chat question.
- Outputs: paper objects, paginated list, status streams, citation text, chat response.
- Logic: validates uploads, persists files, dispatches processing task, serves filtered lists and utility endpoints.
- Edge cases: empty file, invalid MIME, missing paper, missing extracted content.

#### Analysis Routes (`backend/app/routes/analysis.py`)
- Purpose: create and list higher-order analyses from selected papers.
- Inputs: type (`comparative` or `synthetic_review`), paper IDs.
- Outputs: analysis object(s).
- Logic: validates type/count, delegates to analysis service.
- Edge cases: fewer than two papers, invalid analysis type.

#### Search Routes (`backend/app/routes/search.py`)
- Purpose: semantic retrieval over embedded paper vectors.
- Inputs: query text + limit.
- Outputs: ranked papers.
- Logic: embed query, order by cosine distance in SQL.
- Edge cases: embedding model unavailable returns HTTP 503.

### Backend Service Modules

#### Paper Service (`backend/app/services/paper_service.py`)
- Purpose: file persistence, ingestion orchestration, paper CRUD, summary re-trigger.
- Key internal flow:
  1. Save file to `UPLOAD_DIR`.
  2. Create placeholder paper row.
  3. In background: mark processing, extract PDF, update metadata/content.
  4. Generate summary via Groq.
  5. Attempt embedding generation.
  6. Mark processed or error.

#### PDF Service (`backend/app/services/pdf_service.py`)
- Purpose: robust text extraction from single and two-column PDFs.
- Core techniques:
  - word-level extraction and re-lineation.
  - two-column detection by x-position distribution.
  - abstract extraction heuristics from first page.
  - normalization of whitespace/hyphenation artifacts.

#### Groq Service (`backend/app/services/groq_service.py`)
- Purpose: all LLM interactions.
- Capabilities:
  - structured summary generation.
  - comparative analysis generation.
  - synthetic review generation.
  - RAG answer generation and token streaming.
- Notable design: prompt templates centralized and model constants shared.

#### Embedding Service (`backend/app/services/embedding_service.py`)
- Purpose: sentence-transformer vectorization.
- Pattern: lazy singleton model load via `@lru_cache`.

#### Analysis Service (`backend/app/services/analysis_service.py`)
- Purpose: retrieve selected user papers and produce synthesized outputs.
- Logic: validates minimum count, prepares prompt payloads, persists output.

### Backend Core Modules

#### Auth Core (`backend/app/auth.py`)
- Handles password hash/verify and JWT decode/encode.
- Dependency `get_current_user` provides auth guard for routes.

#### Database Core (`backend/app/database.py`)
- Creates async engine/session maker.
- Defines declarative `Base` and `get_db()` session dependency.
- `init_db()` performs `Base.metadata.create_all` at startup.

### Backend Models

#### User (`backend/app/models/user.py`)
- Fields: UUID id, unique email, hashed password, created_at.

#### Paper (`backend/app/models/paper.py`)
- Fields include metadata (`title`, `authors`, `abstract`), file pointers, status flags, AI outputs, vector embedding.

#### Analysis (`backend/app/models/analysis.py`)
- Stores analysis type, source paper IDs/titles, generated result markdown.

### Frontend Pages

#### Dashboard (`frontend/app/page.tsx`)
- Loads papers + analyses, computes summary metrics, and presents recent items.

#### Login/Signup (`frontend/app/login/page.tsx`, `frontend/app/signup/page.tsx`)
- Form-based auth with localStorage token persistence and redirects.

#### Papers List (`frontend/app/papers/page.tsx`)
- Upload, search debounce, polling for in-progress papers, card grid rendering.

#### Paper Detail (`frontend/app/papers/[id]/page.tsx`)
- Displays metadata, abstract, summary markdown, raw text, citation exporter, and streaming chat.

#### Analysis Workspace (`frontend/app/analysis/page.tsx`)
- Type selection, paper selection, run analysis, result history switching.

#### Settings (`frontend/app/settings/page.tsx`)
- Change password, theme switch, and logout with confirmation dialog.

### Frontend Shared Components

- `AppLayout`: responsive shell with sidebar, topbar, mobile drawer.
- `ThemeToggle`: persists `krr_theme` in localStorage and updates `data-theme`.
- `ToastProvider`: app-wide transient notifications.
- `UploadForm`: drag-drop and click upload interactions.
- `PaperCard`: list card with delete confirmation.
- `PaperSelector`: selectable checklist for analysis input set.
- `AnalysisResult`: markdown renderer for generated analysis output.
- `StatusBadge`: status-to-style adapter for paper processing states.
- `ConfirmDialog`: reusable modal confirmation primitive.

---

## 8. Functions and Methods Reference (Significant)

### Backend

- `init_db()` in `backend/app/database.py`
  - Purpose: initialize schema at app startup.
  - Side effect: executes `create_all` on configured DB.

- `create_access_token(user_id)` in `backend/app/auth.py`
  - Purpose: issue JWT with `sub` and expiration.
  - Returns: signed token string.

- `get_current_user(...)` in `backend/app/auth.py`
  - Purpose: bearer token decoding and user lookup.
  - Error behavior: 401 for missing/invalid token or unknown user.

- `extract_pdf(file_path)` in `backend/app/services/pdf_service.py`
  - Purpose: parse PDF into title/authors/abstract/content/page_count.
  - Returns: dictionary payload used to enrich paper record.

- `generate_summary(content)` in `backend/app/services/groq_service.py`
  - Purpose: produce strict markdown summary.
  - External side effect: calls Groq completions API.

- `generate_comparative(papers)` and `generate_synthetic_review(papers)` in `backend/app/services/groq_service.py`
  - Purpose: produce synthesized multi-paper analyses.

- `embed(text)` in `backend/app/services/embedding_service.py`
  - Purpose: generate normalized embedding vector.
  - Side effect: lazy model load on first call.

- `process_paper(paper_id, file_path)` in `backend/app/services/paper_service.py`
  - Purpose: full async background processing pipeline.
  - Error behavior: captures exception and marks paper as `error` with message.

- `create_analysis(...)` in `backend/app/services/analysis_service.py`
  - Purpose: orchestrates comparative/review generation and persistence.
  - Error behavior: raises `ValueError` on invalid input domain.

### Frontend

- `getPapers(...)`, `uploadPaper(...)`, `chatWithPaper(...)`, `createAnalysis(...)` in `frontend/lib/api.ts`
  - Purpose: typed wrappers over axios endpoints.
  - Behavior: request interceptor attaches JWT token from localStorage.

- `handleRun()` in `frontend/app/analysis/page.tsx`
  - Purpose: execute selected analysis type over selected papers.
  - Side effects: updates analysis history and active selection.

- `handleChat()` in `frontend/app/papers/[id]/page.tsx`
  - Purpose: perform streaming SSE chat and incrementally append assistant response.

- `handleResummarize()` in `frontend/app/papers/[id]/page.tsx`
  - Purpose: trigger summary regeneration and transition UI to processing state.

---

## 9. API and Routes

### Authentication

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | no | create account and issue token |
| POST | `/api/auth/login` | no | login and issue token |
| GET | `/api/auth/me` | yes | return current user identity |
| POST | `/api/auth/change-password` | yes | update password |

### Papers

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/papers` | yes | paginated paper listing with optional search |
| POST | `/api/papers/upload` | yes | upload PDF and enqueue processing |
| GET | `/api/papers/{id}` | yes | fetch one paper details |
| DELETE | `/api/papers/{id}` | yes | delete paper and file |
| POST | `/api/papers/{id}/summarize` | yes | rerun summary generation |
| GET | `/api/papers/{id}/stream` | yes | stream status updates via SSE |
| GET | `/api/papers/{id}/cite` | yes | export citation text |
| POST | `/api/papers/{id}/chat` | yes | non-stream chat answer |
| POST | `/api/papers/{id}/chat/stream` | yes | streaming chat answer via SSE |

### Analysis and Search

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/analyses` | yes | list user analyses |
| POST | `/api/analyses` | yes | create comparative or review analysis |
| GET | `/api/analyses/{id}` | yes | retrieve one analysis |
| GET | `/api/search` | yes | semantic vector search |
| GET | `/api/health` | no | health probe |

Response patterns:
- Success responses are structured Pydantic JSON models for core entities.
- Errors use FastAPI standard `{ "detail": ... }` with relevant status codes.

---

## 10. Data Layer and Models

### Storage Strategy

- DB: PostgreSQL primary store.
- Vectors: pgvector `Vector(384)` column on `papers.embedding`.
- Files: local filesystem path stored on paper record.

### Model Field Summary

#### `users`
- `id` UUID PK.
- `email` unique indexed string.
- `hashed_password` string.
- `created_at` timestamp.

#### `papers`
- Core metadata: `title`, `authors` (JSONB), `abstract`.
- File metadata: `file_name`, `file_path`, `file_size`, `page_count`.
- Processing lifecycle: `status`, `error_message`, timestamps.
- AI payload: `summary`, `content`, `embedding`.
- Ownership: `user_id` FK with cascade delete.

#### `analyses`
- `type`: comparative or synthetic_review.
- Source references: `paper_ids` + `paper_titles` (JSONB).
- Generated output: `result` markdown text.
- Ownership: `user_id` FK.

### Migration Notes

- Alembic has two revisions.
- One migration adds embedding column.
- Initial migration is currently empty (`pass`) which indicates migration history is not authoritative versus runtime `create_all` behavior.

---

## 11. Data Flow and State Management

### End-to-End Flow Diagram

```text
User Action (upload/select/chat)
        │
        ▼
Next.js Page State (useState/useEffect)
        │
        ▼
Axios API Wrapper (Bearer token attached)
        │
        ▼
FastAPI Route + Auth Dependency
        │
        ▼
Service Layer Orchestration
        │         ├── PostgreSQL writes/reads
        │         ├── PDF extraction
        │         ├── Groq generation
        │         └── Embedding generation
        ▼
Response / SSE Stream
        ▼
UI update + toasts + status badges
```

### Frontend State Approach

- Local component state via React hooks.
- No global state manager beyond context for toast notifications.
- Auth state derived from localStorage token/email.
- Async states represented explicitly (`loading`, `running`, `error`, `chatLoading`, etc.).

---

## 12. Security Implementation

### Implemented Controls

- Password hashing with bcrypt.
- JWT bearer token validation for protected endpoints.
- User-scoped query filtering by `user_id` on all domain reads/writes.
- MIME and extension checks for PDF uploads.

### Security Concerns

- Credential leakage risk in `docker-compose.screenshot.yml` where API key is hardcoded.
- Auth tokens stored in localStorage (XSS-exposure tradeoff).
- Default `SECRET_KEY` fallback is weak if not overridden.
- CORS is fixed to localhost only, which is safe for local but needs env-driven config for deployed environments.

---

## 13. Testing Suite

### Tooling

- `pytest` + `pytest-asyncio` for async tests.
- `httpx` ASGI transport for API-level test calls.
- Dedicated DB setup fixture with extension creation and full schema reset.

### Coverage Scope

Covered:
- Health endpoint.
- Auth flows: register/login/me/unauthorized.
- Basic papers validation and isolation behavior.
- Analysis endpoint validation and not-found behavior.

Missing/limited:
- No deep happy-path upload+processing integration against real PDFs in CI.
- No frontend unit/integration tests.
- No performance, load, or security tests.

### Commands

- Backend tests: `cd backend && pytest tests/ -v`
- Frontend quality in CI: `npx tsc --noEmit`, `npm run lint`, `npm run build`

---

## 14. External Integrations

### Groq API

- Used for summary generation, comparative synthesis, synthetic review, and chat answers.
- Model default: `llama-3.3-70b-versatile`.
- Streaming API used for token-by-token chat endpoint.

### Sentence Transformers

- Local embedding model `all-MiniLM-L6-v2`.
- Used for query and document embeddings in semantic search.

### pgvector

- Stores and ranks embedding vectors directly in PostgreSQL.
- Uses cosine distance ordering in search route.

---

## 15. Developer Guide

### Local Setup

1. Start PostgreSQL with pgvector support.
2. Backend setup:
   - create virtual env.
   - install `requirements.txt`.
   - copy `.env.example` to `.env` and fill values.
   - run `alembic upgrade head`.
   - run uvicorn.
3. Frontend setup:
   - install NPM deps.
   - copy `.env.local.example` to `.env.local`.
   - run `npm run dev`.

### Feature Extension Guidance

- New backend endpoint:
  1. add route contract in `routes/`.
  2. place logic in `services/`.
  3. extend schemas/models as needed.
  4. add tests in `backend/tests`.

- New frontend page/feature:
  1. add App Router page under `frontend/app`.
  2. keep API interaction in `frontend/lib/api.ts`.
  3. use existing shell/components and `krr-*` tokenized styles.

---

## 16. Known Issues, TODOs, and Technical Debt

### TODO/FIXME/HACK/XXX scan

- No first-party TODO/FIXME/HACK/XXX markers found in backend or frontend source directories.

### Technical Debt Observations

1. Migration drift risk:
   - `backend/alembic/versions/7eb9dbd489d9_initial_schema.py` has no table creation logic.
   - Runtime `create_all` in startup can hide migration correctness issues.

2. Secrets management risk:
   - Hardcoded API key in `docker-compose.screenshot.yml`.

3. Background processing durability:
   - Uses FastAPI background tasks instead of queue workers.
   - Long-running extraction/LLM calls can be interrupted by process lifecycle.

4. File storage growth:
   - `backend/uploads/` contains many PDFs and no lifecycle policy.

5. Testing scope gap:
   - No frontend test suite.
   - No E2E workflow tests.

---

## 17. Codebase Metrics and Observations

### File Counts (source/config focus)

- Python (`.py`): 30
- TSX (`.tsx`): 18
- TS (`.ts`): 3
- Markdown (`.md`): 1
- YAML (`.yml`): 3
- JSON (`.json`): 4
- MJS/INI/TXT tracked by search: 5
- Total indexed workspace files (tool discovery): 78

### Complexity Hotspots

Largest/most complex source units:
- `frontend/app/globals.css` (design system and full app style contract).
- `frontend/app/papers/[id]/page.tsx` (paper details + citations + chat stream + tabs).
- `frontend/app/analysis/page.tsx` (analysis orchestration and result switching).
- `backend/app/routes/papers.py` (broad endpoint surface including SSE and chat).
- `backend/app/services/groq_service.py` (all prompt templates and generation logic).

### Most Central Modules

- Backend: `app.database`, `app.auth`, `app.services.paper_service`, `app.services.groq_service`.
- Frontend: `frontend/lib/api.ts`, `frontend/components/AppLayout.tsx`, `frontend/components/ToastProvider.tsx`.

### Consistency Assessment

Strong consistency:
- Clear backend layering and user scoping.
- Consistent frontend style namespace and design tokens.
- Typed transport models in both backend and frontend.

Inconsistent/fragile areas:
- Mixed migration authority (`create_all` + Alembic).
- Minor schema/docs drift (`AUTH_PASSWORD` documented but not actively used).
- Polling and SSE patterns coexist without unified strategy.

### Overall Quality Assessment

Overall implementation quality is good for MVP maturity with strong feature completeness and readable structure. Primary improvements for production readiness should focus on secret hygiene, durable background jobs, migration discipline, and broader test coverage.

---

## Appendix: Operational Commands

```bash
# full stack
docker compose up --build

# backend local
cd backend
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# frontend local
cd frontend
npm run dev

# backend tests
cd backend
pytest tests/ -v
```
