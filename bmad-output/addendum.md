# PRD Addendum — FHIR Training Web App

**Companion to:** `prd.md`
**Version:** 1.0
**Date:** 2026-09-22

> Overflow and working notes that would bloat the PRD. Nothing here is the source of truth for *what* to build — that stays in `prd.md`. This file holds detail, deferred items, open questions, and supporting research. Decisions belong in `decision-log.md`, not here.

---

## Open Questions

| # | Question | Owner | Needed By | Status |
|---|----------|-------|-----------|--------|
| Q1 | Should the backend maintain in-memory session state (generated observations, built bundles) or should the frontend pass data back and forth? | Dr. Jamieson | Architecture | open |
| Q2 | Should the Angular app proxy API calls through `ng serve --proxy` in dev, or rely solely on CORS? | Dr. Jamieson | Architecture | open |
| Q3 | Should bundle JSON preview and server response be displayed side-by-side or in sequential panels? | Dr. Jamieson | UI design | open |

---

## Deferred Requirements (parked, not cut)

- **DEF-001:** Self-study mode with guided tooltips explaining each FHIR field — *reason deferred:* MVP is instructor-driven; self-study adds significant UI complexity
- **DEF-002:** Support for additional FHIR resource types (Condition, MedicationRequest) — *reason deferred:* Lesson 12 scope is Patient + Observation only
- **DEF-003:** In-UI editing of Patient or Observation fields before bundling — *reason deferred:* Not needed for demo flow; adds form validation complexity

---

## Detailed Acceptance Criteria Overflow

### FR-005 (Transaction Bundle Construction)
- Given the bundle JSON is displayed, then the Patient entry's fullUrl starts with "urn:uuid:"
- Given the bundle JSON is displayed, then each Observation entry's subject.reference matches the Patient entry's fullUrl
- Given the bundle is a Transaction, then bundle.type equals "transaction"
- Given the bundle has N observations, then the entry array has N+1 elements (1 Patient + N Observations)

### FR-006 (Batch Bundle Construction)
- Given the bundle JSON is displayed, then each Observation entry's subject.reference equals "Patient/{fhirId}"
- Given the bundle is a Batch, then bundle.type equals "batch"
- Given the bundle has N observations, then the entry array has exactly N elements (Observations only, no Patient)

---

## Prioritization Working Notes

MoSCoW was applied directly based on the product brief's MVP scope definition. RICE was not needed — the priorities are clear from the teaching workflow (you can't demo bundles without patients and observations). The only contested items were FR-007 (bundle type auto-selection) and FR-014 (syntax highlighting), both placed at SHOULD because the demo works without them but is noticeably better with them.

---

## Supporting Research / References

- Existing Lesson 12 codebase: patients.py, observation.py, batchbundle.py, transactionbundle.py, mainhr.py
- InterSystems FHIR Developer Training Series materials (Building FHIR Applications with Python)
- FHIR R4 Bundle specification for Batch and Transaction types

---

## Glossary

| Term | Definition |
|------|------------|
| Edge Gateway | Conceptual local system holding patient data before submission to the FHIR server |
| urn:uuid | Temporary identifier used in Transaction Bundles to link resources before server assigns real IDs |
| LOINC 8867-4 | The standard code for heart rate observations |
| FHIR ID | Server-assigned identifier for a resource after it has been created on the FHIR server |
