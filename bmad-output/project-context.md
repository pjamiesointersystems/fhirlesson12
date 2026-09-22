# Project Context — FHIR Training Web App

> The project **constitution**. This document is loaded by every BMAD planning skill
> so they all share the same ground truth. Keep it tight, current, and authoritative.
> When a major decision changes scope, update this file and append the change to
> `decision-log.md`.

- **Track:** bmad-method  _(quick-flow | bmad-method | enterprise)_
- **Created:** 2026-09-22T17:21:44Z

---

## Project Goal

Replace the existing CLI-based Python FHIR training lesson (Lesson 12) with an interactive web application that visually demonstrates FHIR Bundle creation and submission. The app should make FHIR concepts (Patient resources, Observations, Batch Bundles, Transaction Bundles) accessible to learners who may not have deep Python experience, using a polished UI with a clear "storyboard" flow.

## Primary Users

Healthcare IT learners in the Vanderbilt/InterSystems FHIR Developer Training Series. They need to understand how FHIR Bundles work (batch vs. transaction), how Patient and Observation resources are constructed, and how resources are posted to a FHIR server — without needing to read through Python scripts. The visual, button-driven UI lowers the barrier to entry.

## Scope

- **Patient management UI** — display patients loaded from data, view patient details as FHIR JSON
- **Heart rate observation generation** — generate observations from file data or synthetically
- **Bundle construction & visualization** — build Batch and Transaction bundles, display the resulting FHIR JSON before posting
- **Bundle posting** — submit bundles to the local FHIR server, display server responses and assigned IDs
- **Storyboard flow** — guided step-by-step walkthrough showing the lifecycle: select patient → generate observations → build bundle → review JSON → post to server → view results
- **Backend API** — Python (FastAPI or Flask) exposing the existing FHIR logic as REST endpoints for the Angular frontend

## Core Constraints

- **Frontend:** Angular with Angular Material and Tailwind CSS
- **Backend:** Python — reuse/adapt existing FHIR logic (fhir.resources 6.1.0, pydantic <2.0)
- **FHIR server:** Local InterSystems HealthShare at `http://127.0.0.1:8080/csp/healthshare/demo/fhir/r4/` with Basic auth `_System:ISCDEMO`
- **Python 3.11+** required
- **Teaching context:** UI must be clear and demonstrative, not a production clinical app

## Non-Goals

- Production deployment or cloud hosting
- User authentication/authorization beyond the hardcoded FHIR server credentials
- Support for FHIR resources beyond Patient and Observation (heart rate)
- Mobile-responsive design (desktop browser is sufficient)
- Replacing the existing Python scripts — they remain as reference material

## Key Stakeholders / Roles

- **Patrick W. Jamieson, M.D.** — Technical Product Manager, primary builder
- **Russ Leftwich, M.D.** — Senior Clinical Advisor, Interoperability
- Single builder; learners are the audience, not co-developers

## Glossary

- **FHIR** — Fast Healthcare Interoperability Resources (HL7 standard)
- **Bundle** — A FHIR container resource holding multiple resources for batch or transactional submission
- **Batch Bundle** — Bundle where each entry is processed independently (used when Patient already has a server ID)
- **Transaction Bundle** — Bundle where all entries succeed or fail atomically, uses `urn:uuid:` references (used when Patient needs to be created)
- **Observation** — FHIR resource for clinical measurements (here: heart rate, LOINC 8867-4)
- **Edge Gateway** — Conceptual local system holding patient data before submission to the FHIR server

---

## Decision Thread

Running decisions live in [`decision-log.md`](./decision-log.md). The first entry is
the track choice from initialization. Consult it before making decisions that might
contradict earlier ones.

## Planning Status (count-based)

- **Track:** bmad-method
- **Stories defined:** _(updated by sprint-planning / story creation)_
- **Stories remaining:** _(count-based delivery — no points, no velocity)_

_This document plans the work. Implementation is handed to external dev tools via
ready-for-dev story files; the planning plugin never writes or tests application code._
