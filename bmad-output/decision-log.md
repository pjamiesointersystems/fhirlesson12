# Decision Log — FHIR Training Web App

A threaded, append-only record of decisions made across BMAD planning workflows.
Every later skill (brief, PRD, architecture, stories) appends here so the reasoning
behind the plan stays visible and consistent.

**How to use:** add a new entry at the top of the log (newest first). Never rewrite
or delete past entries — supersede them with a new entry that references the old one.

## Entry format

```
### YYYY-MM-DD — <short title>
- **Decision:** <what was decided>
- **Rationale:** <why; alternatives considered>
- **Made by:** <skill/workflow, e.g. bmad-init, prd, architecture>
- **Supersedes:** <link to prior entry, if any>
```

---

### 2026-09-22 — Epics and stories completed (6 epics, 15 stories)
- **Decision:** Epic map (`epics.md`) and 15 story context objects compiled and marked
  `ready-for-dev`. Scope-conflict check passed — all conflicts are between sequentially
  dependent stories (expected). Parallel-safe pairs confirmed across backend/frontend tracks.
  - Epic 1: Backend API Foundation (3 stories)
  - Epic 2: Backend Observation & Bundle Endpoints (3 stories)
  - Epic 3: Angular App Shell & Dashboard Layout (3 stories)
  - Epic 4: Patient Management UI (2 stories)
  - Epic 5: Observation & Bundle UI (2 stories)
  - Epic 6: Server Submission & Results UI (2 stories)
  Build order: 1 → (2 + 3 parallel) → 4 → 5 → 6.
  FR-016 (data file regeneration, COULD priority) deferred — no story created.
- **Rationale:** Backend-first sequencing ensures API endpoints exist before frontend
  components consume them. Epics 2 and 3 can run in parallel (zero scope overlap between
  backend and frontend). Story sizing verified at one dev-day each.
- **Made by:** bmad-epics-and-stories
- **Supersedes:** none

### 2026-09-22 — Architecture completed (7 ADRs)
- **Decision:** Architecture document created and validated (`architecture.md`). Two-tier
  client-server pattern (Angular SPA + FastAPI API). 7 ADRs recorded:
  - ADR-001: REST API with JSON responses
  - ADR-002: In-memory session state, no database
  - ADR-003: Backend-only FHIR server credentials
  - ADR-004: Server-side session state with session ID
  - ADR-005: Standardized error response envelope
  - ADR-006: Naming and coding conventions
  - ADR-007: Angular proxy for dev, CORS for fallback
- **Rationale:** Architecture right-sized for a single-user local demo tool. No database,
  no cloud infra, no auth beyond FHIR server credentials in backend config. Server-side
  session state keeps the frontend thin. Availability NFR intentionally not addressed
  (local tool, no uptime requirement).
- **Made by:** bmad-architecture
- **Supersedes:** none

### 2026-09-22 — PRD completed
- **Decision:** PRD created and validated (`prd.md`). 16 functional requirements (FR-001–FR-016),
  6 non-functional requirements (NFR-001–NFR-006), 6 epics, ~20 stories outlined.
  MoSCoW applied: 12 MUST FRs (core demo workflow), 3 SHOULD (enhancements), 1 COULD (convenience).
- **Rationale:** Requirements derived directly from product brief scope. Core demo lifecycle
  (patients → observations → bundle → post → results) is all MUST. JSON highlighting and
  bundle type auto-selection are SHOULD — demo works without them but benefits from them.
  Data file regeneration is COULD since files already exist in the repo.
- **Made by:** bmad-prd
- **Supersedes:** none

### 2026-09-22 — Product brief completed
- **Decision:** Product brief created and validated (`product-brief-fhir-training-web-app-2026-09-22.md`).
  Key decisions captured: FastAPI backend, Angular Material + Tailwind dashboard UI,
  instructor-driven demo (not self-study), workflow-stage dashboard layout (not linear wizard).
- **Rationale:** Instructor will drive the demo live for learners. Dashboard layout gives
  flexibility to jump between workflow stages during teaching. FastAPI chosen for natural
  Pydantic compatibility with existing fhir.resources code.
- **Made by:** bmad-product-brief
- **Supersedes:** none

### 2026-09-22 — Track selected: bmad-method
- **Decision:** Initialized this project on the **bmad-method** track.
- **Rationale:** ~20-30 stories estimated across frontend (Angular + Material + Tailwind),
  backend API (Python/FastAPI wrapping existing FHIR logic), and integration with the
  local FHIR server. Multiple epics (patient UI, observation generation, bundle
  construction/visualization, posting workflow, storyboard flow). Single builder but
  the teaching audience benefits from clear PRD and architecture documentation. No
  hard compliance requirements beyond FHIR conformance, so Enterprise track unnecessary.
  Quick Flow too light for the scope.
- **Made by:** bmad-init
- **Supersedes:** none
