# Sharding Context — FHIR Training Web App

> Shared context for story-author subagents. Read this plus the specific epic/story
> assignment before compiling a story file.

## Track
BMad Method

## Sizing Rule
One dev-day max (~2-8h). No story points. Split if larger.

## Key Sources
- PRD: `bmad-output/prd.md`
- Architecture: `bmad-output/architecture.md`
- Epics map: `bmad-output/epics.md`
- Story template: use the template structure exactly

## LOCKED Cross-Cutting Decisions (from architecture.md ADRs)

**ADR-001 (API style):** REST over HTTP, JSON responses. Endpoints prefixed `/api/`. GET for reads, POST for mutations.

**ADR-002 (State):** In-memory Python dict keyed by session_id. No database.

**ADR-003 (Credentials):** FHIR server URL/user/pass from env vars only. Defaults: `FHIR_SERVER_URL=http://127.0.0.1:8080/csp/healthshare/demo/fhir/r4`, `FHIR_SERVER_USER=_System`, `FHIR_SERVER_PASS=ISCDEMO`.

**ADR-004 (Session):** Server-side session state. Frontend sends `session_id` (UUID) with every request. Backend looks up observations/bundles/FHIR IDs by session_id.

**ADR-005 (Error envelope):** All responses: `{"success": true/false, "data": {...}, "message": "...", "error": {"code": "...", "message": "...", "details": "..."}}`. Error codes: PATIENT_NOT_FOUND, FILE_NOT_FOUND, FHIR_SERVER_UNREACHABLE, FHIR_SERVER_ERROR, INVALID_INPUT, NO_OBSERVATIONS, NO_BUNDLE, INTERNAL_ERROR.

**ADR-006 (Naming):**
- Backend: snake_case vars/functions/files, PascalCase classes. Routers in `routers/`, services in `services/`, models in `models/`.
- Frontend: Angular CLI kebab-case files, PascalCase classes. Components `{name}.component.ts`, services `{name}.service.ts`, models `models/{name}.model.ts`. Tailwind utility classes preferred. Angular Material for UI components.
- API paths: lowercase, kebab-case. JSON keys: snake_case.

**ADR-007 (CORS/Proxy):** Angular proxy.conf.json forwards `/api/*` to `http://localhost:8000`. FastAPI CORS middleware allows `http://localhost:4200`. Frontend uses relative `/api/...` URLs only.

## Backend Project Structure
```
backend/
├── main.py                  # FastAPI app, CORS, lifespan
├── routers/
│   ├── patients.py
│   ├── observations.py
│   └── bundles.py
├── services/
│   ├── patient_service.py
│   ├── observation_service.py
│   └── bundle_service.py
├── models/
│   ├── responses.py
│   └── requests.py
├── state.py                 # SessionState management
└── config.py                # Env var config for FHIR server
```

## Frontend Project Structure
```
frontend/
├── src/app/
│   ├── app.component.ts/.html/.css
│   ├── components/
│   │   ├── patient-list/
│   │   ├── patient-detail/
│   │   ├── observation-panel/
│   │   ├── bundle-panel/
│   │   ├── results-panel/
│   │   └── json-viewer/
│   ├── services/
│   │   ├── api.service.ts
│   │   └── session.service.ts
│   └── models/
│       ├── patient.model.ts
│       ├── api-response.model.ts
│       └── bundle.model.ts
├── proxy.conf.json
└── tailwind.config.js
```

## Existing Python Code Being Wrapped
- `patients.py` — `Patients` class loads from `patients.txt`, stores Patient resources keyed by identifier
- `observation.py` — `HeartRateObservation` extends Observation, LOINC 8867-4, custom extension
- `batchbundle.py` — `BatchBundle` wraps observations for a known patient FHIR ID
- `transactionbundle.py` — `TransactionBundle` wraps patient + observations with urn:uuid refs
- `heartratefilebundlegenerator.py` — reads heart rate tuples from `{identifier_no_dashes}.txt`
- `heartratedatagenerator.py` — generates synthetic HR data files
- `printresource.py` — utility to print FHIR resource fields (replace with JSON serialization in API)

## API Endpoints (from architecture.md §6)
- `GET /api/patients` — list all patients
- `GET /api/patients/{identifier}` — patient detail
- `POST /api/patients/{identifier}/post` — post patient to FHIR server
- `POST /api/observations/from-file` — generate from file (body: session_id, identifier)
- `POST /api/observations/synthetic` — generate synthetic (body: session_id, identifier, count)
- `POST /api/bundles/build` — build bundle (body: session_id, identifier)
- `POST /api/bundles/post` — post bundle (body: session_id, identifier)
