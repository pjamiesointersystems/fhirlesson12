# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lesson 12 of the Vanderbilt/InterSystems FHIR Developer Training Series. A Python application that creates, manages, and submits FHIR R4 resources (Patient, Observation) to a local InterSystems FHIR server. Includes heart rate observation generation (from files and synthetic), FHIR Bundle construction (batch and transaction), and a CLI menu interface.

## FHIR Server

All scripts target a local InterSystems HealthShare FHIR R4 endpoint:
- Base URL: `http://127.0.0.1:8080/csp/healthshare/demo/fhir/r4/`
- Auth: HTTP Basic `_System:ISCDEMO`

## Setup

```bash
python3 -m venv fhir-app-env
source fhir-app-env/bin/activate
pip install -r requirements.txt
```

There is also a `pyproject.toml` for uv-based setup (`uv sync`). Two virtual envs exist: `.venv` (uv) and `fhir-app-env` (pip).

**Python 3.11+** required. Key constraint: `pydantic<2.0` (required by `fhir.resources==6.1.0`).

## Running

```bash
# CLI menu app (main entry point for heart rate workflows)
python mainhr.py

# Individual scripts can be run standalone:
python patients.py              # List patients from patients.txt
python fhirpatientwithrest.py   # GET a patient from FHIR server
python observation.py           # Create sample HeartRateObservation
python heartratedatagenerator.py # Generate synthetic HR data files
python batchbundle.py           # Create/post a batch bundle
python transactionbundle.py     # Create/post a transaction bundle
```

## Architecture

**Data flow:** `patients.txt` → `Patients` → `HeartRateObservation` → `Bundle` → FHIR server

- **`patients.py`** — `Patients` class loads patient data from `patients.txt` (pipe-delimited: Name|Address|DOB|Gender|Telecom|Identifier). Stores `fhir.resources.Patient` objects keyed by identifier value. Also tracks FHIR server IDs after posting.
- **`observation.py`** — `HeartRateObservation` extends `fhir.resources.Observation`. Creates heart rate observations with LOINC code 8867-4, vital-signs category, and a custom extension (`http://mobilemonitor.com/heartrate`).
- **`batchbundle.py`** — `BatchBundle` wraps observations into a FHIR batch Bundle. Used when patient already has a FHIR server ID.
- **`transactionbundle.py`** — `TransactionBundle` wraps a Patient + observations into a FHIR transaction Bundle with `urn:uuid` references. Used when patient needs to be created on the server.
- **`heartratefilebundlegenerator.py`** — `HeartRateFileBundleGenerator` reads heart rate tuples from `{identifier_no_dashes}.txt` files and builds the appropriate bundle type based on whether the patient has a FHIR ID.
- **`heartratedatagenerator.py`** — `HeartRateDataGenerator` generates synthetic heart rate data files (100 entries each) for the 5 patients.
- **`mainhr.py`** — `MainHR` CLI menu app orchestrating all workflows. Also imports a `HeartRateBundleGenerator` (not yet in repo) for synthetic bundle generation.
- **`printresource.py`** — `print_fhir_resource()` utility that recursively prints non-None FHIR resource fields.
- **`fhirpatientwithrest.py`** — Standalone script to GET a Patient from the FHIR server.

**Data files:** `patients.txt` defines 5 patients. The `.txt` files named by identifier digits (e.g., `3564449972.txt`) contain heart rate tuples `(rate, iso_datetime)`.

## Key Patterns

- FHIR resources are built using `fhir.resources` Pydantic v1 models (`.dict()`, `.json()`, `.parse_obj()`, `.construct()`).
- Bundle type selection (batch vs transaction) depends on whether a patient FHIR ID is already known.
- Transaction bundles use `urn:uuid:` fullUrl references to link observations to their patient before server assignment.
