# Epics — FHIR Training Web App

> The epic MAP. A thin index, not a context object. Each epic lists its goal, the
> requirements it covers (cited to prd.md), its ordered stories, and cross-epic
> dependencies. Story detail lives in the individual {epic}.{story}.{slug}.story.md files.
>
> Track: BMad Method
> Sources: prd.md, architecture.md

---

## Epic 1: Backend API Foundation

**Goal:** Stand up the FastAPI backend with patient endpoints, CORS, session state, and the standardized response envelope — the foundation all other epics build on.

**In scope (cited):**
- FR-010 — Backend API for patient operations [Source: prd.md#FR-010]
- NFR-001 — API response time < 2s [Source: prd.md#NFR-001]
- NFR-002 — FHIR credentials backend-only [Source: prd.md#NFR-002]
- NFR-004 — Code separation [Source: prd.md#NFR-004]
- NFR-006 — Error visibility [Source: prd.md#NFR-006]

**Architecture touchpoints:** FastAPI main.py, routers/patients.py, services/patient_service.py, models/responses.py, state.py [Source: architecture.md#4-component-design]

**Out of scope:** Observation and bundle endpoints (Epic 2), frontend (Epics 4-6)

**Stories (ordered):**

| ID | Slug | Intent | Status |
|------|------|--------|--------|
| 1.1 | fastapi-scaffold | Scaffold FastAPI project with CORS, env config, response envelope, and session state | backlog |
| 1.2 | patient-endpoints | Implement GET /api/patients and GET /api/patients/{identifier} | backlog |
| 1.3 | post-patient-endpoint | Implement POST /api/patients/{identifier}/post to FHIR server | backlog |

**Cross-epic dependencies:**
- Blocked by: none (foundational)
- Blocks: Epic 2, Epic 3, Epic 4, Epic 5, Epic 6

---

## Epic 2: Backend Observation & Bundle Endpoints

**Goal:** Add observation generation and bundle build/post endpoints to the backend API.

**In scope (cited):**
- FR-011 — Backend API for observation generation [Source: prd.md#FR-011]
- FR-012 — Backend API for bundle operations [Source: prd.md#FR-012]

**Architecture touchpoints:** routers/observations.py, routers/bundles.py, services/observation_service.py, services/bundle_service.py [Source: architecture.md#4-component-design]

**Out of scope:** Frontend display of observations/bundles (Epics 4-6)

**Stories (ordered):**

| ID | Slug | Intent | Status |
|------|------|--------|--------|
| 2.1 | observation-endpoints | Implement POST /api/observations/from-file and /api/observations/synthetic | backlog |
| 2.2 | bundle-build-endpoint | Implement POST /api/bundles/build with auto-selection of Batch vs Transaction | backlog |
| 2.3 | bundle-post-endpoint | Implement POST /api/bundles/post to FHIR server with ID extraction | backlog |

**Cross-epic dependencies:**
- Blocked by: Epic 1 (needs FastAPI scaffold, session state, response envelope)
- Blocks: Epic 5 (frontend bundle/observation panels need these endpoints)

---

## Epic 3: Angular App Shell & Dashboard Layout

**Goal:** Scaffold the Angular project with Material + Tailwind, create the dashboard layout with workflow-stage sections, and build the shared JSON viewer component.

**In scope (cited):**
- FR-013 — Dashboard layout with workflow stages [Source: prd.md#FR-013]
- FR-014 — JSON display with syntax highlighting [Source: prd.md#FR-014]
- NFR-003 — Usability for live demo [Source: prd.md#NFR-003]
- NFR-005 — Browser compatibility [Source: prd.md#NFR-005]

**Architecture touchpoints:** AppComponent, JsonViewerComponent, ApiService, SessionService, proxy.conf.json [Source: architecture.md#4-component-design]

**Out of scope:** Feature panel content (Epics 4-6)

**Stories (ordered):**

| ID | Slug | Intent | Status |
|------|------|--------|--------|
| 3.1 | angular-scaffold | Scaffold Angular project with Material, Tailwind, proxy config, and ApiService | backlog |
| 3.2 | dashboard-layout | Create dashboard shell with toolbar and workflow-stage section panels | backlog |
| 3.3 | json-viewer | Build shared JsonViewerComponent with syntax highlighting | backlog |

**Cross-epic dependencies:**
- Blocked by: Epic 1 (ApiService needs backend running to test)
- Blocks: Epic 4, Epic 5, Epic 6

---

## Epic 4: Patient Management UI

**Goal:** Instructor can see all patients in a list, view FHIR Patient JSON, and post a patient to the FHIR server.

**In scope (cited):**
- FR-001 — Patient list display [Source: prd.md#FR-001]
- FR-002 — Patient detail view [Source: prd.md#FR-002]
- FR-015 — Post patient to FHIR server [Source: prd.md#FR-015]

**Architecture touchpoints:** PatientListComponent, PatientDetailComponent [Source: architecture.md#4-component-design]

**Out of scope:** Observation generation, bundle construction

**Stories (ordered):**

| ID | Slug | Intent | Status |
|------|------|--------|--------|
| 4.1 | patient-list | Build PatientListComponent displaying all patients in a Material table | backlog |
| 4.2 | patient-detail | Build PatientDetailComponent showing FHIR JSON and Post Patient button | backlog |

**Cross-epic dependencies:**
- Blocked by: Epic 1 (patient endpoints), Epic 3 (dashboard shell, JSON viewer)
- Blocks: Epic 5 (observation panel needs patient selection)

---

## Epic 5: Observation & Bundle UI

**Goal:** Instructor can generate observations, build bundles with JSON preview, and see the bundle type indicator.

**In scope (cited):**
- FR-003 — File-based observation generation [Source: prd.md#FR-003]
- FR-004 — Synthetic observation generation [Source: prd.md#FR-004]
- FR-005 — Transaction bundle construction [Source: prd.md#FR-005]
- FR-006 — Batch bundle construction [Source: prd.md#FR-006]
- FR-007 — Bundle type auto-selection indicator [Source: prd.md#FR-007]

**Architecture touchpoints:** ObservationPanelComponent, BundlePanelComponent [Source: architecture.md#4-component-design]

**Out of scope:** Bundle posting and results display (Epic 6)

**Stories (ordered):**

| ID | Slug | Intent | Status |
|------|------|--------|--------|
| 5.1 | observation-panel | Build ObservationPanelComponent with file and synthetic generation buttons | backlog |
| 5.2 | bundle-panel | Build BundlePanelComponent with Build Bundle button, type indicator, and JSON preview | backlog |

**Cross-epic dependencies:**
- Blocked by: Epic 2 (observation/bundle endpoints), Epic 3 (dashboard shell, JSON viewer), Epic 4 (patient selection)
- Blocks: Epic 6 (post + results needs bundle built)

---

## Epic 6: Server Submission & Results UI

**Goal:** Instructor can post bundles and see server-assigned FHIR IDs and error details — completing the demo lifecycle.

**In scope (cited):**
- FR-008 — Post bundle to FHIR server [Source: prd.md#FR-008]
- FR-009 — Response viewer with assigned IDs [Source: prd.md#FR-009]
- NFR-006 — Error visibility [Source: prd.md#NFR-006]

**Architecture touchpoints:** BundlePanelComponent (post button), ResultsPanelComponent [Source: architecture.md#4-component-design]

**Out of scope:** FR-016 (data file regeneration — deferred as COULD)

**Stories (ordered):**

| ID | Slug | Intent | Status |
|------|------|--------|--------|
| 6.1 | post-bundle-ui | Add Post Bundle button to BundlePanelComponent, wire to backend | backlog |
| 6.2 | results-panel | Build ResultsPanelComponent showing Patient ID, Observation IDs, and errors | backlog |

**Cross-epic dependencies:**
- Blocked by: Epic 2 (bundle post endpoint), Epic 5 (bundle panel)
- Blocks: none (final epic)

---

## Delivery Tracking (count-based)

No story points, velocity, or burndown. Track by COUNT only:

- Total stories: 15
- Done: 0
- Remaining: 15
- Completion rate: 0%

## Notes

**Sequencing rationale:** Backend-first approach. Epic 1 (backend scaffold) unblocks everything. Epic 2 (remaining backend endpoints) and Epic 3 (Angular scaffold) can run in parallel once Epic 1 is done. Epics 4-6 layer frontend features on top. Epic 6 is the capstone that completes the demo lifecycle.

**Recommended build order:** 1 → (2 + 3 in parallel) → 4 → 5 → 6

**FR-016 (data file regeneration)** is COULD priority and has no story — it can be added later if needed.
