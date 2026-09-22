import os
import sys

import requests
from requests.auth import HTTPBasicAuth

# Add project root to path so we can import existing modules
_project_root = os.path.join(os.path.dirname(__file__), "..", "..")
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from patients import Patients
from backend.config import FHIR_SERVER_URL, FHIR_SERVER_USER, FHIR_SERVER_PASS


class PatientNotFoundError(Exception):
    pass


class FHIRServerUnreachableError(Exception):
    pass


class FHIRServerError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class PatientService:
    def __init__(self):
        # Save and restore cwd since Patients class uses relative path
        original_cwd = os.getcwd()
        os.chdir(_project_root)
        try:
            self._patients = Patients()
        finally:
            os.chdir(original_cwd)

    def list_patients(self) -> list[dict]:
        return [
            {"name": name, "identifier": identifier}
            for name, identifier in self._patients.get_short_form_patients()
        ]

    def get_patient(self, identifier: str) -> dict | None:
        patient = self._patients.get_patient(identifier)
        if patient is None:
            return None
        return {
            "patient": patient.dict(),
            "fhir_id": self._patients.get_patient_id(identifier),
        }

    def get_fhir_id(self, identifier: str) -> str | None:
        return self._patients.get_patient_id(identifier)

    def store_fhir_id(self, identifier: str, fhir_id: str) -> None:
        self._patients.store_patient_id(identifier, fhir_id)

    def get_patient_resource(self, identifier: str):
        return self._patients.get_patient(identifier)

    def post_patient(self, identifier: str) -> dict:
        patient = self._patients.get_patient(identifier)
        if patient is None:
            raise PatientNotFoundError(f"No patient found with identifier '{identifier}'")

        patient_json = patient.json()
        endpoint = f"{FHIR_SERVER_URL}/Patient"
        headers = {
            "Accept": "*/*",
            "Content-Type": "application/fhir+json",
            "Accept-Encoding": "gzip, deflate, br",
            "Prefer": "return=representation",
        }

        try:
            response = requests.post(
                endpoint,
                data=patient_json,
                headers=headers,
                auth=HTTPBasicAuth(FHIR_SERVER_USER, FHIR_SERVER_PASS),
                timeout=10,
            )
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            raise FHIRServerUnreachableError(
                f"Could not connect to FHIR server at {FHIR_SERVER_URL}"
            ) from e

        if response.status_code not in (200, 201):
            raise FHIRServerError(
                status_code=response.status_code,
                detail=response.text,
            )

        resource = response.json()
        fhir_id = resource.get("id")
        if fhir_id:
            self._patients.store_patient_id(identifier, fhir_id)

        return {
            "fhir_id": fhir_id,
            "server_response": resource,
        }


# Singleton instance loaded at import time
patient_service = PatientService()
