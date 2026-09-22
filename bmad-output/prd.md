# Product Requirements Document (PRD)

**Project Name:** FHIR Training Web App
**Version:** 1.0
**Date:** 2026-09-22
**Author:** John the PM (BMAD)
**Status:** Draft
**Track:** BMad Method

> Source of truth for *what* and *why*. It does not prescribe *how* (that is the architecture skill).
> Overflow / deferred detail lives in `addendum.md`. Decisions are logged in `decision-log.md`.

---

## Executive Summary

**Problem Statement:** Lesson 12 of the Vanderbilt/InterSystems FHIR Training Series teaches FHIR Bundle concepts (Batch, Transaction, Patient, Observation) via Python CLI scripts. This limits the audience to Python-fluent learners and produces a visually flat demo experience that is hard to follow in live instruction.

**Proposed Solution:** An Angular web application (Angular Material + Tailwind CSS) backed by a Python FastAPI API server that wraps the existing FHIR logic. The UI is a dashboard organized by workflow stage — Patients, Observations, Bundle Construction, Server Submission, Results — with buttons that trigger each action and panels that display FHIR JSON and server responses.

**Business Value:** Extends training reach to non-Python healthcare IT professionals. Provides a polished, visual demo the instructor can drive live without touching a terminal.

**Target Outcome:** Instructor completes the full FHIR Bundle lifecycle demo entirely within the browser UI.

---

## Project Overview

### Background

The InterSystems FHIR Developer Training Series is a multi-lesson curriculum. Lesson 12 focuses on building FHIR applications with Python — constructing Patient and Observation resources, assembling Batch and Transaction Bundles, and posting them to a local FHIR server. The existing codebase includes `patients.py`, `observation.py`, `batchbundle.py`, `transactionbundle.py`, and a CLI menu (`mainhr.py`). The training series is expanding its audience beyond developers to include analysts, clinical informaticists, and project managers who need FHIR literacy but not Python skills.

### Current State → Desired State
- **Current:** Instructor runs Python scripts from the terminal, explains code and output line by line. Learners must read Python to follow along.
- **Desired:** Instructor clicks through a visual dashboard in the browser. Each workflow stage has clear buttons and JSON display panels. Learners watch the UI and focus on FHIR concepts, not Python syntax.

### Stakeholders
| Stakeholder | Role | Interest | Influence |
|-------------|------|----------|-----------|
| Patrick W. Jamieson, M.D. | Technical Product Manager / Instructor | Primary builder and demo operator | High |
| Russ Leftwich, M.D. | Senior Clinical Advisor | Clinical accuracy, interoperability concepts | Medium |

---

## Goals and Objectives

### Business Goals
1. **BG-1:** Make Lesson 12 accessible to learners without Python experience
2. **BG-2:** Provide the instructor with a polished, visual demo tool for live training

### User Goals
1. **UG-1:** Instructor can demo the complete FHIR Bundle lifecycle without leaving the browser
2. **UG-2:** Learners can visually follow the flow: select patient → generate observations → build bundle → review JSON → post → see results

---

## Functional Requirements

> Format: `FR-###: <PRIORITY> — <capability>`. One capability each, with 3-5 testable acceptance criteria. Describe WHAT, not HOW. IDs are immutable; never renumber — append new ones.

### FR-001: Patient List Display — MUST
**Description:** The system displays all patients from the edge gateway in a list/table, showing name and identifier for each.
**Acceptance Criteria:**
- Given the app is loaded, when the patient list panel renders, then all 5 patients from patients.txt are displayed with name and identifier
- Given the patient list is displayed, when the instructor looks at the list, then each row shows the patient's full name and identifier value
- Given the backend is running, when the frontend requests the patient list, then the response returns within 2 seconds
**Related Epic:** EPIC-001

---

### FR-002: Patient Detail View — MUST
**Description:** The system displays the full FHIR Patient JSON resource when a patient is selected from the list.
**Acceptance Criteria:**
- Given a patient is selected, when the detail panel renders, then the complete FHIR Patient resource is displayed as formatted JSON
- Given the Patient JSON is displayed, then it includes name, address, birthDate, gender, telecom, and identifier fields
- Given no patient is selected, then the detail panel shows a placeholder message
**Related Epic:** EPIC-001

---

### FR-003: File-Based Heart Rate Observation Generation — MUST
**Description:** The system generates heart rate observations for a selected patient by reading from the patient's pre-existing heart rate data file.
**Acceptance Criteria:**
- Given a patient is selected, when the instructor clicks "Generate from File," then observations are created from the patient's data file (e.g., 3564449972.txt)
- Given observations are generated, then the count of observations created is displayed
- Given the data file does not exist for the patient, then an error message is displayed
- Given observations are generated, then at least the first two observations are displayed as formatted FHIR JSON
**Related Epic:** EPIC-002

---

### FR-004: Synthetic Heart Rate Observation Generation — MUST
**Description:** The system generates a user-specified number of synthetic heart rate observations for a selected patient with random values and timestamps.
**Acceptance Criteria:**
- Given a patient is selected, when the instructor enters a count (1–1000) and clicks "Generate Synthetic," then that many observations are created
- Given a count > 1000 is entered, then the system caps at 1000
- Given a count < 1 is entered, then the system defaults to 1
- Given synthetic observations are generated, then at least the first two are displayed as formatted FHIR JSON
**Related Epic:** EPIC-002

---

### FR-005: Transaction Bundle Construction — MUST
**Description:** The system constructs a FHIR Transaction Bundle containing the Patient resource and all generated observations, using urn:uuid references, and displays the bundle JSON.
**Acceptance Criteria:**
- Given observations exist and the patient has no known FHIR server ID, when the instructor clicks "Build Transaction Bundle," then a Transaction Bundle is constructed
- Given the bundle is constructed, then it contains a Patient entry with a urn:uuid fullUrl and Observation entries referencing that UUID
- Given the bundle is constructed, then the full bundle JSON is displayed in a panel with the total entry count shown
- Given the bundle JSON is displayed, then each entry shows its request method (POST) and resource URL
**Related Epic:** EPIC-003

---

### FR-006: Batch Bundle Construction — MUST
**Description:** The system constructs a FHIR Batch Bundle containing observations referencing an already-known Patient FHIR ID, and displays the bundle JSON.
**Acceptance Criteria:**
- Given observations exist and the patient has a known FHIR server ID, when the instructor clicks "Build Batch Bundle," then a Batch Bundle is constructed
- Given the bundle is constructed, then each observation's subject references the Patient's FHIR ID
- Given the bundle is constructed, then the full bundle JSON is displayed in a panel
**Related Epic:** EPIC-003

---

### FR-007: Bundle Type Auto-Selection — SHOULD
**Description:** The system automatically selects the appropriate bundle type (Transaction if no FHIR ID, Batch if FHIR ID exists) and indicates the selection to the user.
**Acceptance Criteria:**
- Given a patient with no FHIR server ID, when building a bundle, then "Transaction" is selected and visually indicated
- Given a patient with a known FHIR server ID, when building a bundle, then "Batch" is selected and visually indicated
- Given the bundle type is auto-selected, then a label or badge shows which type was chosen and why
**Related Epic:** EPIC-003

---

### FR-008: Post Bundle to FHIR Server — MUST
**Description:** The system posts the constructed bundle to the local FHIR server and displays the server response.
**Acceptance Criteria:**
- Given a bundle has been constructed, when the instructor clicks "Post Bundle," then the bundle is sent to the FHIR server
- Given the server returns 200/201, then the response JSON is displayed including assigned FHIR IDs for each resource
- Given the server returns an error, then the status code and error message are displayed
- Given a Transaction Bundle is posted successfully, then the patient's FHIR ID is stored for subsequent Batch operations
**Related Epic:** EPIC-004

---

### FR-009: Response Viewer with Assigned IDs — MUST
**Description:** After posting, the system displays the server-assigned FHIR IDs for the Patient and all Observations in a clear summary.
**Acceptance Criteria:**
- Given a bundle has been posted successfully, then the Patient FHIR ID is displayed
- Given a bundle has been posted successfully, then all Observation FHIR IDs are listed
- Given IDs are displayed, then they are clearly labeled (Patient ID vs. Observation IDs)
**Related Epic:** EPIC-004

---

### FR-010: Backend API for Patient Operations — MUST
**Description:** The backend exposes REST endpoints to list patients, get patient details, and post patients to the FHIR server.
**Acceptance Criteria:**
- Given the API is running, when GET /patients is called, then all patients are returned as JSON
- Given the API is running, when GET /patients/{identifier} is called, then the patient detail is returned as FHIR JSON
- Given the API is running, when POST /patients/{identifier}/post is called, then the patient is posted to the FHIR server and the response is returned
**Related Epic:** EPIC-005

---

### FR-011: Backend API for Observation Generation — MUST
**Description:** The backend exposes REST endpoints to generate observations from file or synthetically.
**Acceptance Criteria:**
- Given the API is running, when POST /observations/from-file is called with a patient identifier, then observations are generated from the file and returned
- Given the API is running, when POST /observations/synthetic is called with a patient identifier and count, then synthetic observations are generated and returned
- Given an error occurs (file not found, invalid count), then a meaningful error response with appropriate HTTP status is returned
**Related Epic:** EPIC-005

---

### FR-012: Backend API for Bundle Operations — MUST
**Description:** The backend exposes REST endpoints to construct and post bundles.
**Acceptance Criteria:**
- Given observations have been generated, when POST /bundles/build is called, then the appropriate bundle type is constructed and the bundle JSON is returned
- Given a bundle has been built, when POST /bundles/post is called, then the bundle is posted to the FHIR server and the response is returned
- Given the bundle is posted, then the response includes assigned FHIR IDs
**Related Epic:** EPIC-005

---

### FR-013: Dashboard Layout with Workflow Stages — MUST
**Description:** The frontend is organized as a dashboard with visually distinct panels/sections for each workflow stage: Patients, Observations, Bundle, Post/Results.
**Acceptance Criteria:**
- Given the app is loaded, then the dashboard shows distinct sections for each workflow stage
- Given the sections are visible, then they are laid out in a logical left-to-right or top-to-bottom flow
- Given a workflow stage section, then its action buttons and display panels are grouped within it
**Related Epic:** EPIC-006

---

### FR-014: JSON Display with Syntax Highlighting — SHOULD
**Description:** All FHIR JSON displayed in the UI uses syntax highlighting for readability.
**Acceptance Criteria:**
- Given FHIR JSON is displayed (patient, observation, bundle, response), then JSON keys, values, strings, and numbers are color-coded
- Given large JSON payloads, then the display panel is scrollable
- Given JSON is displayed, then it is formatted with indentation (pretty-printed)
**Related Epic:** EPIC-006

---

### FR-015: Post Patient to FHIR Server — SHOULD
**Description:** The system can post an individual Patient resource (outside of a bundle) to the FHIR server from the patient detail view.
**Acceptance Criteria:**
- Given a patient is selected, when the instructor clicks "Post Patient," then the Patient resource is posted to the FHIR server
- Given the server returns success, then the assigned FHIR ID is displayed and stored
- Given the server returns an error, then the error is displayed
**Related Epic:** EPIC-001

---

### FR-016: Heart Rate Data File Generation — COULD
**Description:** The system can regenerate synthetic heart rate data files for all patients (equivalent to running heartratedatagenerator.py).
**Acceptance Criteria:**
- Given the instructor clicks "Regenerate Data Files," then new heart rate data files are generated for all 5 patients
- Given files are generated, then a confirmation message shows the filenames created
**Related Epic:** EPIC-002

---

---

## Non-Functional Requirements

> Every NFR must be measurable, with a stated measurement method. Categories: Performance, Security, Usability, Maintainability.

### NFR-001: API Response Time — MUST (Performance)
**Description:** Backend API responses return within acceptable time for a live demo.
**Acceptance / Threshold:** p95 response time < 2 seconds for all endpoints except bundle posting (which depends on FHIR server); bundle posting < 10 seconds for 100 observations.
**Measurement Method:** Manual timing during demo rehearsal; FastAPI request logging.

### NFR-002: FHIR Server Credentials — MUST (Security)
**Description:** FHIR server credentials are not hardcoded in frontend code.
**Acceptance / Threshold:** Credentials exist only in backend configuration (environment variables or config file), never in Angular source or API responses.
**Measurement Method:** Code review; grep for credentials in frontend source.

### NFR-003: Usability for Live Demo — MUST (Usability)
**Description:** The dashboard workflow is completable with single clicks per stage, no text input required except for synthetic observation count.
**Acceptance / Threshold:** Instructor completes full lifecycle in ≤ 10 clicks from app load to viewing posted results.
**Measurement Method:** Walkthrough test counting clicks.

### NFR-004: Code Separation — MUST (Maintainability)
**Description:** Frontend and backend are cleanly separated projects that can be started independently.
**Acceptance / Threshold:** Frontend and backend each have their own directory, dependency management, and start command. No shared source files.
**Measurement Method:** Verify independent startup: `ng serve` for frontend, `uvicorn` for backend.

### NFR-005: Browser Compatibility — SHOULD (Usability)
**Description:** The app works in current versions of Chrome and Firefox.
**Acceptance / Threshold:** All functional requirements work correctly in latest Chrome and Firefox.
**Measurement Method:** Manual testing in both browsers.

### NFR-006: Error Visibility — MUST (Usability)
**Description:** All errors (FHIR server unreachable, file not found, invalid input) are displayed clearly in the UI, not silently swallowed.
**Acceptance / Threshold:** Every error scenario produces a visible message in the relevant dashboard panel.
**Measurement Method:** Test each error scenario (server down, missing file, bad input) and verify UI feedback.

---

## Epics and User Stories (Outline)

> This is an OUTLINE. Detailed, ready-for-dev story files are compiled later by the sprint/story skills.

### EPIC-001: Patient Management
**Business Value:** Instructor can show learners what FHIR Patient resources look like, selected from the edge gateway.
**User Segments:** Instructor
**Related Requirements:** FR-001, FR-002, FR-015

**User Stories (sketch):**
- **STORY-001:** As an instructor, I want to see all edge gateway patients listed in the dashboard, so that I can select one to demo.
  - Given the app is loaded, when the patient panel renders, then 5 patients are listed with name and identifier.
- **STORY-002:** As an instructor, I want to click a patient and see their full FHIR JSON, so that I can explain the Patient resource structure to learners.
  - Given the patient list is shown, when I click a patient row, then the detail panel shows formatted FHIR Patient JSON.
- **STORY-003:** As an instructor, I want to post a single patient to the FHIR server, so that I can show how individual resource creation works.
  - Given a patient is selected, when I click "Post Patient," then the server response and assigned ID are displayed.

---

### EPIC-002: Observation Generation
**Business Value:** Instructor can demonstrate how clinical observations are created — from existing data files or synthetically.
**User Segments:** Instructor
**Related Requirements:** FR-003, FR-004, FR-016

**User Stories (sketch):**
- **STORY-004:** As an instructor, I want to generate observations from a patient's data file, so that I can show file-based clinical data ingestion.
  - Given a patient is selected, when I click "Generate from File," then observations are created and the count is displayed.
- **STORY-005:** As an instructor, I want to generate a custom number of synthetic observations, so that I can demo scalable data generation.
  - Given a patient is selected, when I enter a count and click "Generate Synthetic," then that many observations are created.
- **STORY-006:** As an instructor, I want to see sample observation JSON after generation, so that I can explain the Observation resource structure.
  - Given observations have been generated, when the observation panel updates, then the first two observations are shown as formatted JSON.

---

### EPIC-003: Bundle Construction & Preview
**Business Value:** The core teaching moment — learners see how Patient + Observations become a Bundle, and understand the difference between Batch and Transaction.
**User Segments:** Instructor
**Related Requirements:** FR-005, FR-006, FR-007

**User Stories (sketch):**
- **STORY-007:** As an instructor, I want to build a Transaction Bundle when the patient has no FHIR ID, so that I can explain urn:uuid references and atomic submission.
  - Given observations exist and patient has no FHIR ID, when I click "Build Bundle," then a Transaction Bundle JSON is displayed.
- **STORY-008:** As an instructor, I want to build a Batch Bundle when the patient already has a FHIR ID, so that I can contrast independent vs. atomic processing.
  - Given observations exist and patient has a FHIR ID, when I click "Build Bundle," then a Batch Bundle JSON is displayed.
- **STORY-009:** As an instructor, I want the system to indicate which bundle type was chosen and why, so that learners understand the selection logic.
  - Given a bundle is built, then a visual indicator shows "Transaction" or "Batch" with a brief explanation.

---

### EPIC-004: Server Submission & Results
**Business Value:** Completes the lifecycle — learners see the bundle posted and server-assigned IDs returned.
**User Segments:** Instructor
**Related Requirements:** FR-008, FR-009

**User Stories (sketch):**
- **STORY-010:** As an instructor, I want to post the bundle to the FHIR server with one click, so that learners see the submission step.
  - Given a bundle has been built, when I click "Post Bundle," then the bundle is sent and the response is displayed.
- **STORY-011:** As an instructor, I want to see all assigned FHIR IDs after posting, so that I can show learners what the server returns.
  - Given the bundle has been posted successfully, then Patient ID and all Observation IDs are listed in a summary panel.
- **STORY-012:** As an instructor, I want to see error details if posting fails, so that I can explain error handling to learners.
  - Given the server returns an error, then the status code and message are shown in the results panel.

---

### EPIC-005: Backend API Layer
**Business Value:** Provides the data and operations the frontend needs, wrapping existing Python FHIR logic.
**User Segments:** System (frontend ↔ backend integration)
**Related Requirements:** FR-010, FR-011, FR-012

**User Stories (sketch):**
- **STORY-013:** As the frontend, I want a GET /patients endpoint, so that I can populate the patient list.
- **STORY-014:** As the frontend, I want a GET /patients/{identifier} endpoint, so that I can display patient details.
- **STORY-015:** As the frontend, I want POST endpoints for observation generation (file-based and synthetic), so that I can trigger generation and display results.
- **STORY-016:** As the frontend, I want POST endpoints for bundle build and bundle post, so that I can trigger bundle operations and display results.
- **STORY-017:** As the frontend, I want a POST /patients/{identifier}/post endpoint, so that I can post individual patients.

---

### EPIC-006: Dashboard UI Shell & Styling
**Business Value:** The visual presentation layer that makes the demo compelling and easy to follow.
**User Segments:** Instructor, Learners (observers)
**Related Requirements:** FR-013, FR-014

**User Stories (sketch):**
- **STORY-018:** As an instructor, I want a dashboard layout with distinct workflow stage sections, so that I can walk through the demo in logical order.
  - Given the app loads, then I see labeled sections for Patients, Observations, Bundle, and Results.
- **STORY-019:** As an instructor, I want FHIR JSON displayed with syntax highlighting, so that learners can read the resource structure easily.
  - Given JSON is shown in any panel, then it is pretty-printed with color-coded syntax.
- **STORY-020:** As an instructor, I want the UI styled with Angular Material components and Tailwind CSS, so that the demo looks professional.

---

## Prioritization Summary (MoSCoW)

| Priority | Requirements | Rationale |
|----------|--------------|-----------|
| Must | FR-001 through FR-006, FR-008 through FR-013, NFR-001 through NFR-004, NFR-006 | Core demo workflow: list patients, generate observations, build bundles, post, view results. Without these the demo cannot function. |
| Should | FR-007, FR-014, FR-015, NFR-005 | Bundle type auto-selection, JSON highlighting, individual patient posting, Firefox support. Enhance the demo but not blocking. |
| Could | FR-016 | Data file regeneration is a convenience; files already exist. |
| Won't (this release) | Self-study mode with tooltips, additional FHIR resource types, in-UI field editing, mobile responsive, cloud deployment | Out of scope per product brief. Revisit in future phases. |

---

## Success Metrics

| Metric | Baseline | Target | Measurement Method | Frequency |
|--------|----------|--------|--------------------|-----------|
| Demo completeness | 4+ script switches per demo | Full lifecycle in browser, 0 terminal switches | Instructor walkthrough | Each training session |
| Click count for full lifecycle | N/A (CLI) | ≤ 10 clicks from load to results | Walkthrough count | MVP validation |
| Bundle JSON visibility | Plain terminal text | Syntax-highlighted, formatted JSON in UI panels | Visual inspection | MVP validation |

---

## Assumptions and Dependencies

### Assumptions
1. The local InterSystems FHIR server is running and accessible at localhost:8080 during all demos
2. Existing Python FHIR logic (patients.py, observation.py, batchbundle.py, transactionbundle.py) is functionally correct and can be wrapped in an API layer without major rewrites
3. Angular Material and Tailwind CSS can coexist without significant style conflicts
4. The instructor's machine has Node.js (for Angular) and Python 3.11+ available

### Dependencies
| Dependency | Type | Owner | Status | Risk | Mitigation |
|------------|------|-------|--------|------|------------|
| InterSystems FHIR server (localhost:8080) | External | Training infra | Available | Server not running during demo | Document startup steps; verify before each session |
| fhir.resources 6.1.0 + pydantic <2.0 | Technical | Backend | Pinned | Pydantic v1 limits some FastAPI features | Use compatibility mode; keep API layer thin |
| Angular CLI + Node.js | Technical | Frontend | Available | Version mismatch | Pin versions in package.json |
| patients.txt + heart rate data files | Data | Repo | Committed | Files missing or corrupted | Include in repo; regenerate with heartratedatagenerator.py |

---

## Constraints

- **Technical:** Backend must use pydantic <2.0 due to fhir.resources pinning. Desktop browser only.
- **Business:** Teaching tool, not production. Single instructor operator.
- **Timeline:** No hard deadline; quality over speed.

---

## Out of Scope

| Excluded | Reason | Revisit? |
|----------|--------|----------|
| Self-study mode with guided tooltips | MVP is instructor-driven demo | Future phase |
| Additional FHIR resource types (Condition, MedicationRequest, etc.) | Lesson 12 scope is Patient + Observation only | Future phase |
| In-UI editing of Patient/Observation fields | Not needed for demo flow | Future phase |
| Mobile / responsive design | Desktop demo only | Unlikely |
| Cloud deployment / hosting | Local training tool | Future phase |
| User authentication | Single instructor; FHIR server auth handled in backend only | No |

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Pydantic v1 constrains FastAPI response models | Medium | Medium | Manual JSON serialization; keep API layer thin | Dr. Jamieson |
| CORS between Angular dev server and FastAPI | Low | High | Configure FastAPI CORS middleware from project start | Dr. Jamieson |
| Existing code uses print() for output, not return values | Medium | Medium | Create service layer wrapping existing classes, replacing prints with returns | Dr. Jamieson |
| FHIR server not running during demo | High | Low | Pre-demo checklist; display clear error if server unreachable | Dr. Jamieson |

---

## Traceability Matrix

> Every requirement traces up to a goal and down to an epic/story. Orphans (either direction) are defects.

| Requirement | Business Goal | Epic | User Story | Status |
|-------------|---------------|------|------------|--------|
| FR-001 | BG-2 | EPIC-001 | STORY-001 | Defined |
| FR-002 | BG-1, BG-2 | EPIC-001 | STORY-002 | Defined |
| FR-003 | BG-2 | EPIC-002 | STORY-004 | Defined |
| FR-004 | BG-2 | EPIC-002 | STORY-005 | Defined |
| FR-005 | BG-1, BG-2 | EPIC-003 | STORY-007 | Defined |
| FR-006 | BG-1, BG-2 | EPIC-003 | STORY-008 | Defined |
| FR-007 | BG-1 | EPIC-003 | STORY-009 | Defined |
| FR-008 | BG-2 | EPIC-004 | STORY-010 | Defined |
| FR-009 | BG-1, BG-2 | EPIC-004 | STORY-011 | Defined |
| FR-010 | BG-2 | EPIC-005 | STORY-013, STORY-014 | Defined |
| FR-011 | BG-2 | EPIC-005 | STORY-015 | Defined |
| FR-012 | BG-2 | EPIC-005 | STORY-016 | Defined |
| FR-013 | BG-1, BG-2 | EPIC-006 | STORY-018 | Defined |
| FR-014 | BG-1 | EPIC-006 | STORY-019 | Defined |
| FR-015 | BG-2 | EPIC-001 | STORY-003 | Defined |
| FR-016 | BG-2 | EPIC-002 | — | Defined |
| NFR-001 | BG-2 | (cross-cutting) | — | Defined |
| NFR-002 | BG-2 | (cross-cutting) | — | Defined |
| NFR-003 | BG-1 | (cross-cutting) | — | Defined |
| NFR-004 | BG-2 | (cross-cutting) | — | Defined |
| NFR-005 | BG-1 | (cross-cutting) | — | Defined |
| NFR-006 | BG-2 | (cross-cutting) | — | Defined |

---

## Handoff

- **To Architecture:** Define FastAPI endpoint structure, Angular component hierarchy, state management approach, CORS configuration, and JSON serialization strategy given the Pydantic v1 constraint.
- **To Sprint/Story Planning:** epics outline above is the source for story compilation. 6 epics, ~20 stories.
- **Open questions / overflow:** see `addendum.md`.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-09-22 | BMAD PRD Facilitator | Initial draft |
