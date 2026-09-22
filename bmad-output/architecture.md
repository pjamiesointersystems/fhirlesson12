# System Architecture: FHIR Training Web App

**Document Version:** 1.0
**Date:** 2026-09-22
**Author:** Winston (Architect)
**Track:** BMad Method
**Status:** Draft
**Source PRD:** `bmad-output/prd.md`

> This is the single source of truth for cross-cutting technical decisions. Every
> story compiled by bmad-scrum-master inherits the LOCKED decisions recorded here.
> Catching alignment at this layer is ~10x cheaper than during implementation.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Pattern](#2-architecture-pattern)
3. [Architecture Decision Records](#3-architecture-decision-records)
4. [Component Design](#4-component-design)
5. [Data Model](#5-data-model)
6. [API Specifications](#6-api-specifications)
7. [FR / NFR Coverage Matrix](#7-fr--nfr-coverage-matrix)
8. [Technology Stack](#8-technology-stack)
9. [Trade-off Analysis](#9-trade-off-analysis)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Future Considerations](#11-future-considerations)

---

## 1. System Overview

### Purpose

A two-tier web application for live FHIR training demos. An Angular frontend provides a dashboard UI organized by workflow stage; a Python FastAPI backend wraps existing FHIR logic (Patient management, Observation generation, Bundle construction) and proxies requests to a local InterSystems FHIR R4 server.

### Scope

**In Scope:**
- Angular dashboard with workflow-stage panels (Patients, Observations, Bundle, Results)
- FastAPI backend exposing REST endpoints for all FHIR operations
- Integration with local InterSystems FHIR server (localhost:8080)
- JSON display with syntax highlighting for FHIR resources and bundles

**Out of Scope:**
- Production deployment, cloud hosting, CI/CD
- User authentication (single instructor, local use)
- Mobile/responsive design
- FHIR resource types beyond Patient and Observation

### Architectural Drivers

The NFRs that most constrain the design:

1. **NFR-003: Usability for Live Demo** — the entire architecture serves a single instructor clicking through a dashboard. Simplicity and reliability trump scalability.
2. **NFR-004: Code Separation** — frontend and backend must be independent projects with separate dependency management and startup.
3. **NFR-006: Error Visibility** — every error must surface in the UI, which drives the error-response convention and frontend error handling.

### Stakeholders & Constraints (from project-context.md)

- **Users:** Single instructor operating the demo; learners observe
- **Team:** One builder (Dr. Jamieson)
- **Existing constraints:** Python 3.11+, fhir.resources 6.1.0, pydantic <2.0, Angular + Angular Material + Tailwind CSS, local FHIR server with Basic auth

---

## 2. Architecture Pattern

**Pattern:** Two-Tier Client-Server (SPA + API)

**Justification:**
- Single builder, local-only deployment — no need for microservices, message queues, or service mesh
- Clean separation between Angular frontend (presentation) and FastAPI backend (FHIR logic) satisfies NFR-004
- The backend is a thin API layer wrapping existing Python classes — minimal new logic

**Alternatives considered:**
- **Single-tier (server-rendered HTML):** Rejected because the requirement is Angular + Material + Tailwind (a rich SPA). Server-rendered templates would not meet the frontend stack constraint.
- **Three-tier with database:** Rejected because there is no persistent storage need — patient data comes from files, FHIR state lives on the FHIR server. In-memory session state on the backend is sufficient.

**Application:**
```
┌─────────────────────┐     HTTP/JSON     ┌──────────────────────┐     HTTP/FHIR     ┌─────────────────┐
│   Angular Frontend  │ ◄──────────────► │   FastAPI Backend    │ ◄──────────────► │  InterSystems    │
│   (localhost:4200)  │                   │   (localhost:8000)   │                   │  FHIR Server     │
│                     │                   │                      │                   │  (localhost:8080) │
│  - Dashboard UI     │                   │  - PatientService    │                   │                   │
│  - JSON viewer      │                   │  - ObservationService│                   │                   │
│  - Workflow panels  │                   │  - BundleService     │                   │                   │
└─────────────────────┘                   └──────────────────────┘                   └─────────────────┘
```

---

## 3. Architecture Decision Records

> The core artifact. Each cross-cutting choice is one ADR. These are exactly the
> decisions that, left implicit, cause parallel dev agents to diverge.

| ADR | Title | Status | Drives |
|-----|-------|--------|--------|
| ADR-001 | REST API with JSON responses | Accepted | FR-010–FR-012, NFR-001 |
| ADR-002 | In-memory session state, no database | Accepted | FR-003–FR-009, NFR-004 |
| ADR-003 | Backend-only FHIR server credentials | Accepted | NFR-002 |
| ADR-004 | Server-side session state with session ID | Accepted | FR-005–FR-009 |
| ADR-005 | Standardized error response envelope | Accepted | NFR-006 |
| ADR-006 | Naming and coding conventions | Accepted | NFR-004 |
| ADR-007 | Angular proxy for dev, CORS for fallback | Accepted | NFR-004 |

---

### ADR-001: REST API with JSON responses

**Status:** Accepted   **Drives:** FR-010, FR-011, FR-012, NFR-001

**Context:** The frontend needs to call the backend to list patients, generate observations, build bundles, and post bundles. The backend wraps existing Python classes. We need a simple, well-understood protocol. The instructor audience understands REST from FHIR training.

**Decision:** All backend endpoints are REST over HTTP, returning JSON. No GraphQL, no gRPC. Endpoints are grouped by resource domain: `/api/patients`, `/api/observations`, `/api/bundles`. All responses use a consistent JSON shape (see ADR-005).

**Consequences — LOCKED for all stories:**
- All endpoints return `application/json`
- URL structure: `/api/{domain}/{action}` — no versioning needed (local tool, single consumer)
- HTTP methods: GET for reads, POST for actions that create or mutate
- Easier: Simple to debug, matches FHIR REST concepts being taught
- Accepted cost: No real-time push (e.g., WebSockets). Mitigation: not needed — all actions are request/response triggered by button clicks.

**Alternatives:**
| Alternative | Pros | Cons | Why rejected |
|-------------|------|------|--------------|
| GraphQL | Flexible queries | Overkill for fixed UI; adds complexity | Single consumer with known data needs |
| Server-Sent Events | Real-time updates | No real-time need | All actions are synchronous button clicks |

**Revisit when:** A second frontend consumer with different data needs is added.

---

### ADR-002: In-memory session state, no database

**Status:** Accepted   **Drives:** FR-003–FR-009, NFR-004

**Context:** The app needs to hold generated observations and constructed bundles between API calls (generate → build → post). We need to decide where this state lives. There is no need for persistence across server restarts — this is a live demo tool.

**Decision:** The FastAPI backend holds session state in-memory using a Python dictionary keyed by session ID. State includes: loaded patients (from files at startup), generated observations (per patient), constructed bundles, and known FHIR IDs (after posting). No database. No file-based persistence of session state.

**Consequences — LOCKED for all stories:**
- Backend services store state in a shared `SessionState` object (Python dataclass or dict)
- State is lost on server restart — acceptable for a demo tool
- No ORM, no migrations, no database connection config
- Easier: Zero infrastructure beyond Python; instant startup
- Accepted cost: State lost on restart. Mitigation: Patients reload from files automatically; observations/bundles are regenerated with a click.

**Alternatives:**
| Alternative | Pros | Cons | Why rejected |
|-------------|------|------|--------------|
| SQLite | Persistent across restarts | Unnecessary complexity; demo state is transient | No persistence need |
| Redis | Fast, supports TTL | External dependency for a local demo tool | Over-engineered |

**Revisit when:** The app is used for self-study where learners expect state to persist between sessions.

---

### ADR-003: Backend-only FHIR server credentials

**Status:** Accepted   **Drives:** NFR-002

**Context:** The FHIR server requires Basic auth (`_System:ISCDEMO`). The PRD requires credentials never appear in frontend code or API responses. Currently they are hardcoded in multiple Python scripts.

**Decision:** FHIR server URL and credentials are configured in the backend only, via environment variables (`FHIR_SERVER_URL`, `FHIR_SERVER_USER`, `FHIR_SERVER_PASS`) with defaults matching the current hardcoded values. The frontend never sees or sends FHIR server credentials — it calls the FastAPI backend, which adds auth when proxying to the FHIR server.

**Consequences — LOCKED for all stories:**
- Frontend code must never contain FHIR server URLs or credentials
- Backend reads config from env vars with defaults: `FHIR_SERVER_URL=http://127.0.0.1:8080/csp/healthshare/demo/fhir/r4`, `FHIR_SERVER_USER=_System`, `FHIR_SERVER_PASS=ISCDEMO`
- All FHIR server HTTP calls originate from the backend only
- Easier: Single place to update credentials; frontend is a pure UI
- Accepted cost: Extra hop (frontend → backend → FHIR server). Mitigation: Negligible latency on localhost.

**Alternatives:**
| Alternative | Pros | Cons | Why rejected |
|-------------|------|------|--------------|
| Frontend calls FHIR server directly | Simpler architecture | Credentials in browser; CORS issues with FHIR server | Security (NFR-002) and CORS complexity |

**Revisit when:** Never — this is a fundamental security boundary.

---

### ADR-004: Server-side session state with session ID

**Status:** Accepted   **Drives:** FR-005–FR-009

**Context:** The workflow is multi-step: select patient → generate observations → build bundle → post bundle. Generated observations and bundles must persist between API calls. We need to decide whether the frontend or backend holds this intermediate state.

**Decision:** The backend maintains workflow state server-side. The frontend receives a `session_id` (UUID, generated on first request or app init) and includes it in all API calls. The backend uses this ID to look up the current patient selection, generated observations, and constructed bundles. This avoids sending large FHIR JSON payloads back and forth.

**Consequences — LOCKED for all stories:**
- Every API request includes `session_id` as a query parameter or header
- Backend `SessionState` is keyed by `session_id`
- Frontend stores only the `session_id` and display data (JSON for rendering)
- One session at a time is the expected use case (single instructor)
- Easier: Frontend stays thin — no complex state management library needed
- Accepted cost: Backend is stateful (not horizontally scalable). Mitigation: Single user, local deployment — horizontal scaling is irrelevant.

**Alternatives:**
| Alternative | Pros | Cons | Why rejected |
|-------------|------|------|--------------|
| Frontend holds all state | Stateless backend | Large JSON payloads in every request; complex frontend state management | Unnecessary complexity for single-user local app |
| NgRx/Redux on frontend | Structured state management | Heavy machinery for a demo tool | Over-engineered |

**Revisit when:** Multiple concurrent users need independent sessions (self-study mode).

---

### ADR-005: Standardized error response envelope

**Status:** Accepted   **Drives:** NFR-006

**Context:** NFR-006 requires all errors to be visible in the UI. We need a consistent response shape so the frontend can reliably detect and display errors regardless of which endpoint is called.

**Decision:** All API responses use a consistent envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "FHIR_SERVER_UNREACHABLE",
    "message": "Could not connect to FHIR server at localhost:8080",
    "details": "Connection refused"
  }
}
```

Error codes are uppercase snake_case strings. HTTP status codes: 200 for successful operations, 400 for bad input, 502 for FHIR server errors, 500 for unexpected backend errors.

**Consequences — LOCKED for all stories:**
- Every FastAPI endpoint returns this envelope shape — no raw data responses
- Frontend has a single error-handling interceptor that checks `success` field
- Error codes: `PATIENT_NOT_FOUND`, `FILE_NOT_FOUND`, `FHIR_SERVER_UNREACHABLE`, `FHIR_SERVER_ERROR`, `INVALID_INPUT`, `NO_OBSERVATIONS`, `NO_BUNDLE`, `INTERNAL_ERROR`
- Easier: One frontend error handler works for all endpoints
- Accepted cost: Slightly more verbose responses. Mitigation: Negligible for a local tool.

**Alternatives:**
| Alternative | Pros | Cons | Why rejected |
|-------------|------|------|--------------|
| Raw HTTP status codes only | Simpler backend | Frontend can't distinguish error types or show useful messages | NFR-006 requires clear error display |
| Problem Details (RFC 7807) | Standard | Overhead for a local teaching tool | Over-specified for the context |

**Revisit when:** Never — consistent error handling is always beneficial.

---

### ADR-006: Naming and coding conventions

**Status:** Accepted   **Drives:** NFR-004

**Context:** One builder, but future story agents need clear conventions to avoid inconsistency.

**Decision:**

**Backend (Python/FastAPI):**
- snake_case for all Python variables, functions, file names
- PascalCase for class names
- FastAPI router files: `routers/{domain}.py` (e.g., `routers/patients.py`)
- Service classes: `services/{domain}_service.py` (e.g., `services/patient_service.py`)
- Pydantic response models: `models/{domain}.py`

**Frontend (Angular/TypeScript):**
- Angular CLI naming: kebab-case for files, PascalCase for classes/components
- Components: `{name}.component.ts` with selector `app-{name}`
- Services: `{name}.service.ts`
- Models/interfaces: `models/{name}.model.ts`
- Tailwind utility classes preferred over custom CSS; Angular Material theme for component styling

**API:**
- Endpoint paths: lowercase, kebab-case for multi-word segments (e.g., `/api/observations/from-file`)
- JSON keys in API responses: snake_case (Python native, matching FHIR convention)

**Consequences — LOCKED for all stories:**
- All file names, variables, endpoints follow the above conventions
- No custom CSS classes unless Tailwind utilities are insufficient
- Angular Material components used for buttons, cards, tables, toolbars
- Easier: Consistent codebase; any story agent can read/extend any file
- Accepted cost: Slightly more verbose file naming. Mitigation: Clarity outweighs brevity.

**Alternatives:** None seriously considered — these are standard conventions for each stack.

**Revisit when:** Never.

---

### ADR-007: Angular proxy for dev, CORS for fallback

**Status:** Accepted   **Drives:** NFR-004

**Context:** During development, the Angular dev server (port 4200) and FastAPI (port 8000) run on different ports. Cross-origin requests will be blocked without configuration.

**Decision:** Primary: Use Angular CLI's proxy configuration (`proxy.conf.json`) to forward `/api/*` requests from the Angular dev server to FastAPI. Fallback: FastAPI also configures CORS middleware allowing `http://localhost:4200` as an origin, for cases where the proxy isn't used (e.g., running Angular build output separately).

```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false
  }
}
```

**Consequences — LOCKED for all stories:**
- Frontend calls `/api/...` (relative path), never `http://localhost:8000/api/...`
- `proxy.conf.json` is committed to the frontend project
- FastAPI includes `CORSMiddleware` with `allow_origins=["http://localhost:4200"]`
- Easier: No CORS issues during development; clean relative URLs in frontend code
- Accepted cost: Proxy config is dev-server specific. Mitigation: CORS fallback covers other scenarios.

**Alternatives:**
| Alternative | Pros | Cons | Why rejected |
|-------------|------|------|--------------|
| CORS only | Works without proxy | Frontend must use absolute URLs; more CORS config complexity | Proxy is simpler for development |
| Reverse proxy (nginx) | Production-like | Unnecessary infrastructure for a local teaching tool | Over-engineered |

**Revisit when:** The app is deployed behind a real web server.

---

## 4. Component Design

### Component Overview

```
Frontend (Angular)
├── AppComponent (shell: toolbar + dashboard layout)
├── PatientListComponent (EPIC-001)
├── PatientDetailComponent (EPIC-001)
├── ObservationPanelComponent (EPIC-002)
├── BundlePanelComponent (EPIC-003)
├── ResultsPanelComponent (EPIC-004)
├── JsonViewerComponent (shared, EPIC-006)
└── Services
    ├── ApiService (HTTP calls to backend)
    └── SessionService (manages session_id)

Backend (FastAPI)
├── main.py (FastAPI app, CORS, lifespan)
├── routers/
│   ├── patients.py
│   ├── observations.py
│   └── bundles.py
├── services/
│   ├── patient_service.py (wraps existing Patients class)
│   ├── observation_service.py (wraps HeartRateObservation + generators)
│   └── bundle_service.py (wraps BatchBundle + TransactionBundle)
├── models/
│   ├── responses.py (API response envelope)
│   └── requests.py (API request models)
└── state.py (SessionState management)
```

### Component: PatientListComponent

**Responsibility:** Display all edge gateway patients in a Material table, emit selection events.

**Interfaces Provided:** Patient selection event (identifier)
**Interfaces Required:** ApiService.getPatients()
**Data Owned:** None (display only)
**ADRs that constrain it:** ADR-001 (REST calls), ADR-006 (naming), ADR-007 (proxy)
**NFRs Addressed:** NFR-003 (one-click selection)

### Component: PatientDetailComponent

**Responsibility:** Display selected patient's FHIR JSON and provide "Post Patient" action.

**Interfaces Provided:** Post Patient button
**Interfaces Required:** ApiService.getPatient(identifier), ApiService.postPatient(identifier)
**Data Owned:** None (display only)
**ADRs that constrain it:** ADR-001, ADR-005 (error display), ADR-006
**NFRs Addressed:** NFR-006 (error visibility on post failure)

### Component: ObservationPanelComponent

**Responsibility:** Provide buttons to generate observations (from file or synthetic), display observation count and sample JSON.

**Interfaces Provided:** "Generate from File" button, "Generate Synthetic" button (with count input)
**Interfaces Required:** ApiService.generateFromFile(identifier), ApiService.generateSynthetic(identifier, count)
**Data Owned:** None
**ADRs that constrain it:** ADR-001, ADR-004 (server holds observations), ADR-005
**NFRs Addressed:** NFR-003 (single click + optional count input), NFR-006

### Component: BundlePanelComponent

**Responsibility:** Provide "Build Bundle" button, display bundle type indicator (Batch vs Transaction) and full bundle JSON.

**Interfaces Provided:** "Build Bundle" button, "Post Bundle" button
**Interfaces Required:** ApiService.buildBundle(identifier), ApiService.postBundle(identifier)
**Data Owned:** None
**ADRs that constrain it:** ADR-001, ADR-004, ADR-005
**NFRs Addressed:** NFR-003, NFR-006

### Component: ResultsPanelComponent

**Responsibility:** Display server response after posting, including assigned FHIR IDs (Patient ID, Observation IDs) and any errors.

**Interfaces Provided:** Display only
**Interfaces Required:** Receives results from BundlePanelComponent or PatientDetailComponent via shared state/events
**Data Owned:** None
**ADRs that constrain it:** ADR-005 (error envelope for display)
**NFRs Addressed:** NFR-006

### Component: JsonViewerComponent (shared)

**Responsibility:** Render any FHIR JSON with syntax highlighting in a scrollable panel.

**Interfaces Provided:** Input: JSON object or string. Output: rendered highlighted JSON.
**Interfaces Required:** None (pure display)
**Data Owned:** None
**ADRs that constrain it:** ADR-006 (Tailwind styling)
**NFRs Addressed:** FR-014 (syntax highlighting)

### Component: ApiService (Angular)

**Responsibility:** Centralized HTTP client for all backend calls. Handles session_id injection and error envelope parsing.

**Interfaces Provided:** Methods for each API endpoint (getPatients, getPatient, postPatient, generateFromFile, generateSynthetic, buildBundle, postBundle)
**Interfaces Required:** HttpClient, SessionService (for session_id)
**Data Owned:** None
**ADRs that constrain it:** ADR-001, ADR-004 (session_id), ADR-005 (envelope parsing), ADR-007 (relative URLs)
**NFRs Addressed:** NFR-001, NFR-006

### Component: PatientService (Backend)

**Responsibility:** Wraps existing `Patients` class. Loads patients from files, provides patient lookup, manages FHIR ID storage.

**Interfaces Provided:** list_patients(), get_patient(identifier), post_patient(identifier)
**Interfaces Required:** Existing `patients.py` classes, FHIR server config (ADR-003)
**Data Owned:** Patient data (loaded from patients.txt), FHIR ID mappings
**ADRs that constrain it:** ADR-002 (in-memory), ADR-003 (credentials), ADR-005 (error responses)
**NFRs Addressed:** NFR-001

### Component: ObservationService (Backend)

**Responsibility:** Wraps existing `HeartRateObservation`, `HeartRateFileBundleGenerator` logic. Generates observations from file or synthetically, stores them in session state.

**Interfaces Provided:** generate_from_file(session_id, identifier), generate_synthetic(session_id, identifier, count)
**Interfaces Required:** Existing `observation.py`, heart rate data files, SessionState
**Data Owned:** Generated observations (in session state)
**ADRs that constrain it:** ADR-002, ADR-004
**NFRs Addressed:** NFR-001

### Component: BundleService (Backend)

**Responsibility:** Wraps existing `BatchBundle` and `TransactionBundle` classes. Builds the appropriate bundle type, posts to FHIR server, parses response.

**Interfaces Provided:** build_bundle(session_id, identifier), post_bundle(session_id, identifier)
**Interfaces Required:** SessionState (observations), PatientService (FHIR IDs), FHIR server config
**Data Owned:** Constructed bundles (in session state)
**ADRs that constrain it:** ADR-001, ADR-002, ADR-003, ADR-004, ADR-005
**NFRs Addressed:** NFR-001, NFR-006

---

## 5. Data Model

> Governed by ADR-002 (in-memory, no database).

### Entity: Patient (from file)

**Purpose:** FHIR Patient resource loaded from patients.txt at backend startup.

**Attributes:**
- `identifier` (string, key) — e.g., "356-444-9972"
- `resource` (fhir.resources.Patient) — the full FHIR Patient object
- `fhir_id` (string, optional) — server-assigned ID after posting, initially None
- `name` (string) — display name extracted from resource

**Relationships:** One-to-many with Observations (by identifier)

### Entity: SessionState

**Purpose:** Holds per-session workflow state between API calls.

**Attributes:**
- `session_id` (UUID, key)
- `selected_patient` (string, optional) — identifier of currently selected patient
- `observations` (dict: identifier → list of HeartRateObservation) — generated observations per patient
- `bundle` (Bundle, optional) — most recently constructed bundle
- `bundle_type` (string, optional) — "batch" or "transaction"
- `post_result` (dict, optional) — most recent server response with assigned IDs

**Relationships:** References Patient by identifier

### Storage Strategy

- **Primary store:** Python dict in memory (ADR-002)
- **Cache:** Not applicable
- **File/blob:** Patient data files (patients.txt, heart rate .txt files) read at startup / on demand
- **Retention / backup:** None — state is transient, expected to be lost on restart

---

## 6. API Specifications

> Governed by ADR-001 (REST/JSON) and ADR-005 (error envelope).

**Protocol:** REST over HTTP (ADR-001)   **AuthN:** None (local tool)   **Versioning:** None (single consumer)

All endpoints are prefixed with `/api`. All responses use the envelope from ADR-005. All requests requiring session context include `session_id` as a query parameter.

### `GET /api/patients`
**Purpose:** List all edge gateway patients (name + identifier).
**Auth:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "patients": [
      {"name": "Mary Johnson", "identifier": "356-444-9972"},
      ...
    ]
  }
}
```

---

### `GET /api/patients/{identifier}`
**Purpose:** Get full FHIR Patient JSON for a specific patient.
**Auth:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": { "resourceType": "Patient", ... },
    "fhir_id": "123" | null
  }
}
```

**Errors:** 400 `PATIENT_NOT_FOUND`

---

### `POST /api/patients/{identifier}/post`
**Purpose:** Post the patient resource to the FHIR server.
**Auth:** None (backend handles FHIR server auth per ADR-003)

**Query params:** `session_id` (UUID)

**Response:**
```json
{
  "success": true,
  "data": {
    "fhir_id": "742",
    "server_response": { ... }
  },
  "message": "Patient posted successfully"
}
```

**Errors:** 400 `PATIENT_NOT_FOUND`, 502 `FHIR_SERVER_UNREACHABLE`, 502 `FHIR_SERVER_ERROR`

---

### `POST /api/observations/from-file`
**Purpose:** Generate heart rate observations from the patient's data file.
**Auth:** None

**Body:**
```json
{
  "session_id": "uuid",
  "identifier": "356-444-9972"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 100,
    "sample_observations": [ { "resourceType": "Observation", ... }, { ... } ]
  },
  "message": "Generated 100 observations from file"
}
```

**Errors:** 400 `PATIENT_NOT_FOUND`, 400 `FILE_NOT_FOUND`

---

### `POST /api/observations/synthetic`
**Purpose:** Generate synthetic heart rate observations.
**Auth:** None

**Body:**
```json
{
  "session_id": "uuid",
  "identifier": "356-444-9972",
  "count": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 50,
    "sample_observations": [ { ... }, { ... } ]
  },
  "message": "Generated 50 synthetic observations"
}
```

**Errors:** 400 `PATIENT_NOT_FOUND`, 400 `INVALID_INPUT` (count out of range)

---

### `POST /api/bundles/build`
**Purpose:** Construct a Batch or Transaction bundle from generated observations.
**Auth:** None

**Body:**
```json
{
  "session_id": "uuid",
  "identifier": "356-444-9972"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bundle_type": "transaction",
    "bundle_type_reason": "Patient has no FHIR server ID — using Transaction Bundle with urn:uuid references",
    "entry_count": 101,
    "bundle_json": { "resourceType": "Bundle", "type": "transaction", ... }
  }
}
```

**Errors:** 400 `PATIENT_NOT_FOUND`, 400 `NO_OBSERVATIONS`

---

### `POST /api/bundles/post`
**Purpose:** Post the constructed bundle to the FHIR server.
**Auth:** None (backend handles FHIR server auth)

**Body:**
```json
{
  "session_id": "uuid",
  "identifier": "356-444-9972"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient_id": "742",
    "observation_ids": ["743", "744", "745", ...],
    "bundle_type": "transaction",
    "server_response": { ... }
  },
  "message": "Bundle posted successfully — 101 resources created"
}
```

**Errors:** 400 `NO_BUNDLE`, 502 `FHIR_SERVER_UNREACHABLE`, 502 `FHIR_SERVER_ERROR`

---

## 7. FR / NFR Coverage Matrix

> Required. One row per FR and per NFR. No orphans.

| ID | Type | Requirement | Component(s) | ADR(s) | Status |
|----|------|-------------|--------------|--------|--------|
| FR-001 | FR | Patient list display | PatientListComponent, PatientService, GET /api/patients | ADR-001, ADR-006 | Addressed |
| FR-002 | FR | Patient detail view | PatientDetailComponent, GET /api/patients/{id} | ADR-001, ADR-005 | Addressed |
| FR-003 | FR | File-based observation generation | ObservationPanelComponent, ObservationService, POST /api/observations/from-file | ADR-001, ADR-004 | Addressed |
| FR-004 | FR | Synthetic observation generation | ObservationPanelComponent, ObservationService, POST /api/observations/synthetic | ADR-001, ADR-004 | Addressed |
| FR-005 | FR | Transaction bundle construction | BundlePanelComponent, BundleService, POST /api/bundles/build | ADR-001, ADR-002, ADR-004 | Addressed |
| FR-006 | FR | Batch bundle construction | BundlePanelComponent, BundleService, POST /api/bundles/build | ADR-001, ADR-002, ADR-004 | Addressed |
| FR-007 | FR | Bundle type auto-selection | BundleService (logic), BundlePanelComponent (display) | ADR-004 | Addressed |
| FR-008 | FR | Post bundle to FHIR server | BundlePanelComponent, BundleService, POST /api/bundles/post | ADR-001, ADR-003, ADR-005 | Addressed |
| FR-009 | FR | Response viewer with assigned IDs | ResultsPanelComponent | ADR-005 | Addressed |
| FR-010 | FR | Backend API for patient operations | routers/patients.py, PatientService | ADR-001, ADR-003 | Addressed |
| FR-011 | FR | Backend API for observation generation | routers/observations.py, ObservationService | ADR-001, ADR-004 | Addressed |
| FR-012 | FR | Backend API for bundle operations | routers/bundles.py, BundleService | ADR-001, ADR-003, ADR-004 | Addressed |
| FR-013 | FR | Dashboard layout with workflow stages | AppComponent, all panel components | ADR-006 | Addressed |
| FR-014 | FR | JSON syntax highlighting | JsonViewerComponent | ADR-006 | Addressed |
| FR-015 | FR | Post individual patient | PatientDetailComponent, POST /api/patients/{id}/post | ADR-001, ADR-003 | Addressed |
| FR-016 | FR | Heart rate data file generation | ObservationService (optional endpoint) | ADR-002 | Addressed |
| NFR-001 | NFR | API response time < 2s (p95) | All backend services, FastAPI | ADR-001 | Addressed |
| NFR-002 | NFR | FHIR credentials backend-only | Backend config, all FHIR-calling services | ADR-003 | Addressed |
| NFR-003 | NFR | Usability — ≤ 10 clicks for full lifecycle | All frontend components, dashboard layout | ADR-004, ADR-006 | Addressed |
| NFR-004 | NFR | Code separation — independent projects | Frontend/backend directory structure | ADR-006, ADR-007 | Addressed |
| NFR-005 | NFR | Chrome + Firefox compatibility | Angular, Material, Tailwind (all support both) | ADR-006 | Addressed |
| NFR-006 | NFR | Error visibility in UI | All components + ApiService error interceptor | ADR-005 | Addressed |

### Detailed NFR notes

**NFR-001 (Performance):** The backend wraps existing Python classes with minimal overhead. FHIR server round-trip is the bottleneck for POST operations. The <2s target applies to backend processing; FHIR server latency (for bundle posting) is external and covered by the 10s allowance for large bundles.

**NFR-003 (Usability):** Click path for full lifecycle: (1) select patient → (2) generate observations → (3) build bundle → (4) post bundle → 4 clicks minimum. Viewing details/JSON doesn't require extra clicks — panels update reactively. The ≤ 10 click budget is achievable.

**NFR-006 (Error Visibility):** The ApiService interceptor checks the `success` field of every response (ADR-005). On `success: false`, it extracts the error message and surfaces it in the relevant panel. Individual components can show contextual error messages (e.g., "FHIR server unreachable" in the results panel).

---

## 8. Technology Stack

| Layer | Choice | Version | Rationale (→ driver) | ADR |
|-------|--------|---------|----------------------|-----|
| Frontend Framework | Angular | 18+ (latest stable) | Required by project constraints | — |
| Frontend UI Library | Angular Material | 18+ | Required by project constraints; provides Material Design components | ADR-006 |
| Frontend CSS | Tailwind CSS | 3.x | Required by project constraints; utility-first styling for layout and spacing | ADR-006 |
| Frontend JSON display | ngx-json-viewer or custom pipe | latest | Lightweight JSON syntax highlighting for FR-014 | — |
| Backend Framework | FastAPI | 0.100+ | Chosen for Pydantic compatibility with fhir.resources; auto-generates OpenAPI docs | ADR-001 |
| Backend FHIR Library | fhir.resources | 6.1.0 | Existing codebase dependency; pinned | ADR-002 |
| Backend Validation | Pydantic | <2.0 | Required by fhir.resources 6.1.0 | — |
| Backend HTTP Client | requests | 2.x | Existing codebase dependency for FHIR server calls | ADR-003 |
| Backend Server | uvicorn | latest | Standard ASGI server for FastAPI | — |
| Runtime | Python 3.11+ / Node.js 18+ | — | Python version required; Node for Angular CLI | — |

**Alternatives considered:**
- **Flask** instead of FastAPI: Rejected because FastAPI has native Pydantic integration (matching fhir.resources), async support, and auto-generated OpenAPI docs that are educational.
- **httpx** instead of requests: Considered for async, but existing code uses requests and all FHIR calls are synchronous in the demo workflow. Not worth the migration.

---

## 9. Trade-off Analysis

### Trade-off: Server-side vs Client-side State

**Decision:** Server-side session state (see ADR-004)

**Options:**
- A: **Server-side** — backend holds observations/bundles in memory, frontend just renders
- B: **Client-side** — frontend holds all state in NgRx/services, sends full payloads to backend

**Rationale:** Single-user local demo tool. Server-side state eliminates complex frontend state management and avoids large JSON payloads in every request. The cost (stateful backend) is irrelevant at this scale.

**Accepted:** Benefit: simple frontend / Cost: stateful backend / Mitigation: single user, no horizontal scaling need

**Revisit when:** Multi-user self-study mode is added.

---

### Trade-off: Pydantic v1 Compatibility

**Decision:** Use Pydantic v1 mode throughout backend (required by fhir.resources 6.1.0)

**Options:**
- A: **Stay on Pydantic v1** — use `.dict()`, `.json()`, `parse_obj()` throughout
- B: **Migrate to Pydantic v2** with compatibility layer — requires upgrading fhir.resources

**Rationale:** fhir.resources 6.1.0 is pinned to Pydantic v1. Upgrading fhir.resources would require validating all existing FHIR logic still works. Not worth the risk for a teaching tool.

**Accepted:** Benefit: existing code works as-is / Cost: can't use Pydantic v2 features / Mitigation: API layer is thin; v1 is sufficient

**Revisit when:** fhir.resources releases a Pydantic v2-compatible version.

---

### Trade-off: Wrapping Existing Code vs Rewriting

**Decision:** Wrap existing Python classes in a service layer; refactor minimally (replace prints with returns).

**Options:**
- A: **Wrap** — create service classes that instantiate existing classes and capture their output
- B: **Rewrite** — rewrite FHIR logic from scratch in clean service classes

**Rationale:** The existing code works. The main refactor needed is changing `print()` calls to return values. Wrapping preserves proven FHIR logic and reduces risk.

**Accepted:** Benefit: lower risk, faster delivery / Cost: some awkward code wrapping / Mitigation: service layer provides clean interface regardless of internal implementation

**Revisit when:** Existing code becomes unmaintainable or needs significant new features.

---

## 10. Deployment Architecture

### Environments

**Development (only environment needed):**
- Angular dev server: `ng serve` on port 4200 with proxy to port 8000
- FastAPI dev server: `uvicorn main:app --reload` on port 8000
- InterSystems FHIR server: pre-existing on port 8080

No staging or production environments — this is a local teaching tool.

### Topology

```
[Instructor's Machine]
├── Browser → http://localhost:4200 (Angular)
├── Angular Dev Server (port 4200) → proxies /api/* to port 8000
├── FastAPI (port 8000) → calls FHIR server on port 8080
└── InterSystems HealthShare FHIR Server (port 8080)
```

### Strategy

- **Deployment method:** Manual — `ng serve` and `uvicorn` started in separate terminals
- **Rollback:** Git revert (code is in a repository)
- **Scaling:** Not applicable — single user, local machine

---

## 11. Future Considerations

**Anticipated changes:**
- **Near term:** Add tooltips/annotations to JSON viewer for self-study mode (DEF-001 in addendum)
- **Medium term:** Support additional FHIR resource types (Condition, MedicationRequest)
- **Long term:** Package as a containerized app (Docker Compose) for easy distribution to learners

**Scalability path:** Current: single user on localhost → Next tier: Docker Compose for easy setup on any machine → Further: cloud-hosted version for remote training.

**Revisit triggers (aggregated from ADRs):**
- fhir.resources releases Pydantic v2 support → revisit ADR-002 trade-off
- Multi-user self-study mode requested → revisit ADR-004 (session state) and ADR-002 (persistence)
- Second frontend consumer → revisit ADR-001 (API style)

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| Edge Gateway | Conceptual local system holding patient data before submission to the FHIR server |
| Transaction Bundle | FHIR Bundle where all entries succeed or fail atomically; uses urn:uuid references |
| Batch Bundle | FHIR Bundle where each entry is processed independently |
| Session State | In-memory backend state holding generated observations and bundles between API calls |
| Envelope | Standardized JSON response wrapper with success/error fields (ADR-005) |

### References

- PRD: `bmad-output/prd.md`
- Decision log: `bmad-output/decision-log.md`
- Project context: `bmad-output/project-context.md`
- Product brief: `bmad-output/product-brief-fhir-training-web-app-2026-09-22.md`

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-09-22 | Winston (Architect) | Initial architecture |

---

**END OF DOCUMENT** — Ready for handoff to bmad-epics-and-stories once validation passes.
