# Product Brief: FHIR Training Web App

**Date:** 2026-09-22
**Author:** Patrick W. Jamieson, M.D.
**Status:** Draft
**Version:** 1.0

---

## 1. Executive Summary

Lesson 12 of the Vanderbilt/InterSystems FHIR Developer Training Series currently teaches FHIR Bundle concepts through Python CLI scripts. This works for Python-savvy learners but creates a barrier for the broader audience the training series wants to reach. This project replaces the CLI with a visual Angular web application that the instructor demos live, walking learners through FHIR resource creation, bundle construction, and server submission via an organized dashboard UI.

**Key Points:**
- Problem: CLI-based FHIR training requires Python fluency, limiting audience reach
- Solution: Angular dashboard with staged workflow buttons backed by a FastAPI layer wrapping existing FHIR logic
- Target Users: Instructor (primary demo operator); healthcare IT learners (observers/audience)
- Primary Metric: Instructor can complete the full FHIR Bundle lifecycle demo without switching to a terminal

---

## 2. Problem Statement

### The Problem

The current Lesson 12 teaches critical FHIR concepts — Batch Bundles, Transaction Bundles, Patient/Observation resource construction, and server submission — but requires learners to read and run Python scripts from the command line. This makes the material inaccessible to learners without Python experience and makes the demo less visually compelling during live instruction.

### Who Experiences This Problem

**Primary Users:**
- Instructor (Dr. Jamieson) — needs a polished, visual tool to demo FHIR workflows live
- Healthcare IT learners — need to see and understand FHIR concepts without getting lost in Python syntax

**Secondary Users:**
- Co-instructor (Dr. Leftwich) — may use the demo for clinical interoperability discussions

### Current Situation

**How Users Currently Handle This:**
The instructor runs Python scripts (`mainhr.py`, `batchbundle.py`, `transactionbundle.py`) from a terminal, explaining the code and output line by line. Learners follow along by reading source files.

**Pain Points:**
- Terminal output is plain text with no visual structure — hard to follow in a presentation
- Learners must understand Python to follow the demo
- No visual representation of the FHIR Bundle structure before posting
- Switching between scripts and explaining CLI arguments breaks demo flow

### Impact & Urgency

**Impact if Unsolved:**
The training series continues to limit its audience to Python-comfortable developers, missing healthcare analysts, project managers, and clinical informaticists who need to understand FHIR.

**Why Now:**
The training series is actively expanding its learner base. A visual demo tool makes Lesson 12 accessible to this broader audience immediately.

**Frequency:**
The training is delivered on a recurring cohort basis. The demo tool would be used every time Lesson 12 is taught.

---

## 3. Target Users

### User Personas

#### Persona 1: The Instructor

- **Role:** Technical Product Manager and FHIR training instructor
- **Goals:** Deliver a compelling, visual demo of FHIR Bundle workflows without terminal context-switching
- **Pain Points:** CLI demos are hard to follow for non-technical audiences; explaining code takes time away from concepts
- **Technical Proficiency:** High (Python, FHIR, REST APIs)
- **Usage Pattern:** Runs the app locally before and during live training sessions; clicks through workflow stages while explaining concepts

#### Persona 2: The Learner (Observer)

- **Role:** Healthcare IT professional, clinical informaticist, or analyst in the training series
- **Goals:** Understand how FHIR Bundles work, what Patient and Observation resources look like, and how they flow to a FHIR server
- **Pain Points:** Python CLI output is hard to parse visually; can't easily see the "before and after" of bundle construction and posting
- **Technical Proficiency:** Varies — some developers, many non-developers
- **Usage Pattern:** Watches the instructor's screen during live demo; may later run the app locally as a self-study exercise

### User Needs

**Must Have (MVP):**
- Dashboard organized by workflow stage so the instructor can walk through FHIR concepts in order
- Visual display of FHIR JSON (Patient resources, Observations, Bundles) with syntax highlighting
- Buttons to trigger bundle creation and posting without touching a terminal
- Clear display of server responses and assigned FHIR IDs after posting

**Should Have:**
- Side-by-side view of bundle JSON before posting and server response after posting
- Visual indicator distinguishing Batch vs. Transaction bundle workflows

**Nice to Have (Future):**
- Learner can run the app locally and explore independently
- Textual annotations/tooltips explaining each FHIR field in the displayed JSON
- Additional FHIR resource types beyond Patient and Observation

---

## 4. Proposed Solution

### Solution Overview

A two-tier web application: an Angular frontend (Angular Material + Tailwind CSS) serving as a dashboard UI, backed by a Python FastAPI server that wraps the existing FHIR logic. The dashboard is organized by workflow stages — patient selection, observation generation, bundle construction, and server submission — with buttons at each stage that trigger actions and display results visually.

### Key Capabilities

1. **Patient Dashboard**
   - Description: Display patients loaded from the edge gateway (patients.txt data), show FHIR Patient JSON on selection
   - User Value: Instructor can show learners what a Patient resource looks like without reading Python code

2. **Bundle Builder**
   - Description: Generate heart rate observations (from file or synthetic), construct Batch or Transaction bundles, display the full bundle JSON
   - User Value: Learners see the bundle structure — entries, request methods, urn:uuid references — before anything is sent to the server

3. **Server Submission & Response Viewer**
   - Description: Post bundles to the local FHIR server, display the response including assigned IDs, status codes, and any errors
   - User Value: Learners see the complete lifecycle — request and response — reinforcing how FHIR REST operations work

4. **Workflow Stage Dashboard**
   - Description: Dashboard layout grouping buttons and panels by stage (Patients → Observations → Bundle → Post → Results)
   - User Value: Instructor navigates the demo fluidly; learners follow the logical flow of FHIR operations

### Unique Value Proposition

A purpose-built FHIR teaching dashboard that makes Bundle mechanics visible and interactive, without requiring the audience to know Python or use a terminal. The instructor drives the demo; the UI tells the FHIR story.

### MVP Scope

**Core Features for Launch:**
- Patient list and detail view (loaded from existing patients.txt data via backend)
- Heart rate observation generation (file-based and synthetic) via backend API
- Batch and Transaction bundle construction with JSON preview
- Bundle posting to local FHIR server with response display
- Dashboard layout organizing the above by workflow stage

**Deferred to Future Phases:**
- Self-study mode with guided tooltips and annotations
- Support for additional FHIR resource types
- Ability to edit Patient or Observation fields in the UI before bundling

---

## 5. Goals & Constraints

### Business Goals

- Make Lesson 12 accessible to learners without Python experience
- Provide the instructor with a polished, visual demo tool for live training sessions

### Constraints

**Non-Negotiable Constraints:**
- Frontend must use Angular with Angular Material and Tailwind CSS
- Backend must use Python FastAPI, reusing/adapting existing FHIR logic
- Must work with the local InterSystems HealthShare FHIR R4 server (localhost:8080, Basic auth)

**Technical Constraints:**
- Python backend requires `fhir.resources==6.1.0` with `pydantic<2.0`
- Python 3.11+ required
- Desktop browser only (no mobile requirement)

---

## 6. Success Metrics

### Primary Metrics

**Demo Completeness**
- Baseline: Instructor must switch between 4+ Python scripts and terminal to demo the full workflow
- Target: Instructor completes the full FHIR Bundle lifecycle (patient → observations → bundle → post → results) entirely within the web UI
- Timeline: MVP delivery
- Measurement: Instructor walkthrough of all workflow stages without opening a terminal

**Audience Comprehension**
- Baseline: Non-Python learners report difficulty following CLI-based demos
- Target: Learners with no Python background can describe what a Transaction Bundle does after watching the demo
- Timeline: First training cohort after MVP
- Measurement: Informal post-session feedback

**Bundle Lifecycle Visibility**
- Baseline: Bundle JSON only visible as terminal print output
- Target: Full bundle JSON displayed with syntax highlighting before and after posting, with server-assigned IDs clearly shown
- Timeline: MVP delivery
- Measurement: All bundle types (Batch, Transaction) render correctly in the UI

### Success Vision

- **3 months:** MVP deployed locally, used in at least one live training session
- **6 months:** Refined based on instructor experience, possibly shared with co-instructor
- **12 months:** Considered for self-study distribution to training participants

---

## 7. Market & Competition

### Market Context

**Market Size:** Internal training tool — the "market" is the Vanderbilt/InterSystems FHIR training cohorts.

**Key Trends:**
- Growing demand for FHIR literacy beyond developer audiences (analysts, PMs, clinical informaticists)
- Shift toward interactive, visual teaching tools over code-first approaches

**Target Segment:** Healthcare IT training programs teaching HL7 FHIR

### Competitive Landscape

#### HAPI FHIR Playground / Public FHIR test servers
- Strengths: Available online, no setup required
- Weaknesses: Generic — not tailored to teaching bundle construction workflows; no storyboard or guided flow
- Positioning: General-purpose FHIR testing, not instructional

#### Postman / REST client demos
- Strengths: Flexible, widely known
- Weaknesses: Requires REST API knowledge; no visual representation of bundle structure; learners see raw HTTP, not FHIR concepts
- Positioning: Developer tooling, not teaching tool

#### Jupyter Notebook walkthrough
- Strengths: Combines code and explanation; can show outputs inline
- Weaknesses: Still requires Python literacy; linear format doesn't support dashboard-style exploration
- Positioning: Developer-oriented documentation

### Our Differentiation

**Advantages:**
- Purpose-built for the specific training curriculum (Lesson 12 concepts)
- Dashboard UI organized by FHIR workflow stage — tells a visual story
- Backed by real FHIR logic (not mock data), posting to a real FHIR server

**Gaps to Close:**
- Initial version is local-only; no hosted option for learners to try independently

---

## 8. Risks & Assumptions

### High-Priority Risks

**Risk 1: Pydantic v1 constraint limits FastAPI features**
- Probability: Medium
- Impact: Medium — some FastAPI features (response models, OpenAPI generation) work differently with Pydantic v1
- Mitigation: Use FastAPI's Pydantic v1 compatibility mode; keep API layer thin with manual JSON serialization where needed
- Owner: Dr. Jamieson

**Risk 2: CORS / local networking between Angular dev server and FastAPI**
- Probability: High (will definitely need configuration)
- Impact: Low — standard problem with known solutions
- Mitigation: Configure FastAPI CORS middleware from the start; document the local dev setup
- Owner: Dr. Jamieson

**Risk 3: Existing FHIR logic tightly coupled to file I/O and print statements**
- Probability: Medium
- Impact: Medium — refactoring needed to return data instead of printing to stdout
- Mitigation: Create a thin API service layer that wraps existing classes, replacing print calls with return values
- Owner: Dr. Jamieson

### Critical Assumptions

- The local InterSystems FHIR server will be running and accessible during all demos
- The existing Python FHIR logic (patients.py, observation.py, bundle classes) is correct and can be wrapped without major rewrites
- Angular Material + Tailwind CSS can coexist without significant style conflicts

**Validation Plan:**
Stand up a minimal FastAPI endpoint wrapping one existing class (e.g., Patients) and confirm Angular can call it and display results before building out the full dashboard.

---

## 9. Dependencies

### Internal Dependencies

- Existing Python FHIR classes (patients.py, observation.py, batchbundle.py, transactionbundle.py) as the backend logic foundation
- Patient data files (patients.txt, heart rate .txt files) for demo data

### External Dependencies

- Local InterSystems HealthShare FHIR R4 server running at localhost:8080
- Angular CLI and Node.js for frontend development
- Python 3.11+ with fhir.resources 6.1.0 and pydantic <2.0

### Current Blockers

- None — all dependencies are available locally

---

## 10. Next Steps

### Immediate Actions

1. Hand off to Product Manager to create the PRD with detailed functional requirements
2. Architecture design: define the FastAPI endpoint structure and Angular component hierarchy
3. Spike: confirm FastAPI + Pydantic v1 + fhir.resources integration works for one endpoint

### Recommended Handoff

**Hand off to:** Product Manager (PRD creation)

**Required before handoff:**
- Product brief reviewed and confirmed by Dr. Jamieson
- Track choice (bmad-method) confirmed

---

## Appendix

### Research Sources

- Existing Lesson 12 codebase and Readme.md
- InterSystems FHIR Developer Training Series materials

### Stakeholders Consulted

- Patrick W. Jamieson, M.D. — Technical Product Manager, primary instructor
- Russ Leftwich, M.D. — Senior Clinical Advisor, Interoperability

### Additional Notes

The existing Python scripts (mainhr.py CLI menu, individual script entry points) will remain in the repo as reference material. The web app is an addition, not a replacement.

---

**Document Status:** Draft — awaiting review
**Last Updated:** 2026-09-22
