# Lesson 12 – Building FHIR Applications with Python

Welcome to Lesson 12 of the InterSystems FHIR Developer Training Series. This module takes learners beyond working with FHIR data into **application development**, leveraging Python and the **Textual** library to build terminal-based interactive UIs. The lesson focuses on creating, managing, and submitting FHIR resources while organizing code in a modular and testable fashion.

---

## 🎯 Learning Objectives

By the end of this lesson, students will be able to:

- Create dynamic FHIR Bundles (Batch and Transaction) programmatically using Python.
- Send and process FHIR resources over RESTful APIs.
- Generate and manipulate real-world clinical data such as vital signs.
- Build terminal-based interactive UIs with the **Textual** library.
- Understand and apply `.tcss` (Textual CSS) for interface styling.
- Use Python generators and `yield` effectively for scalable data workflows.

---

## 📁 Repository Structure
Lesson-12/
├── README.md # This file
├── requirements.txt # Python dependencies
├── batchbundle.py # Constructs and sends a FHIR batch bundle
├── transactionbundle.py # Constructs a FHIR transaction bundle with UUIDs
├── heartratedatagenerator.py # Simulates heart rate data for Patient resources
├── fhirpatientwithrest.py # REST interaction with FHIR server
├── printresource.py # Utility to print FHIR resource JSON
├── test.http # Example HTTP request for testing/debugging


## 🧰 Setup Instructions

### 1. Create and Activate a Virtual Environment
```bash
python3 -m venv fhir-app-env
source fhir-app-env/bin/activate   # Windows: fhir-app-env\Scripts\activate
```

pip install -r requirements.txt

This installs:

fhir.resources==6.1.0: FHIR R4 resource models

pydantic<2.0: Required version for fhir.resources

requests: HTTP client for interacting with FHIR servers

fhirpathpy: Optional support for FHIRPath

textual: Terminal UI framework

textual-dev: Development tools for Textual apps

🛠 Key Components
✅ FHIR Bundle Automation
Use batchbundle.py and transactionbundle.py to generate JSON bundles for multi-resource operations. These scripts demonstrate:

Batch mode (independent requests)

Transaction mode (atomic execution)

Use of urn:uuid for local references in transaction entries

✅ Simulated Clinical Data
heartratedatagenerator.py outputs synthetic heart rate observations over time, ideal for testing workflows and UIs.

✅ Textual UI Framework
This lesson introduces Textual, a Python-native library to build terminal-based UIs. Key features:

Widgets like Label, Static, Input, Button

Declarative lifecycle methods (compose, on_mount)

Styling with .tcss files, similar to CSS but tailored for terminals

🎨 Textual Styling Highlights
Use class selectors to target specific widgets (.patientId, .vitalsPanel)

Apply styles like border, padding, text-align, background

Use responsive layout without relying on HTML/JS

Example .tcss:

tcss
Copy
Edit
Static.patientId {
  text-align: center;
  border: heavy;
  padding: 1 2;
}
💡 Concepts & Techniques
Python yield: Used in compose() methods to construct widget trees dynamically

Resource marshaling: Convert Python objects to JSON for API requests

Functional modularity: Separate data generation, formatting, and UI concerns

🧪 Try It Yourself
Start with fhirpatientwithrest.py to verify server connectivity

Generate test vitals using heartratedatagenerator.py

Post batch/transaction bundles using batchbundle.py or transactionbundle.py

Begin building a terminal UI prototype using Textual

✍️ Authors
Developed by:

Patrick W. Jamieson, M.D., Technical Product Manager

Russ Leftwich, M.D., Senior Clinical Advisor, Interoperability




