import json
import os
import sys

import requests
from requests.auth import HTTPBasicAuth

_project_root = os.path.join(os.path.dirname(__file__), "..", "..")
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from batchbundle import BatchBundle
from transactionbundle import TransactionBundle
from backend.config import FHIR_SERVER_URL, FHIR_SERVER_USER, FHIR_SERVER_PASS
from backend.services.patient_service import (
    patient_service,
    PatientNotFoundError,
    FHIRServerUnreachableError,
    FHIRServerError,
)
from backend import state


class NoObservationsError(Exception):
    pass


class NoBundleError(Exception):
    pass


class BundleService:
    def build_bundle(self, session_id: str, identifier: str) -> dict:
        # Validate patient exists
        patient_data = patient_service.get_patient(identifier)
        if patient_data is None:
            raise PatientNotFoundError(
                f"No patient found with identifier '{identifier}'"
            )

        # Get observations from session state
        session = state.get_session(session_id)
        if session is None or identifier not in session.observations or not session.observations[identifier]:
            raise NoObservationsError(
                f"No observations found for patient {identifier}"
            )

        observations = session.observations[identifier]
        fhir_id = patient_service.get_fhir_id(identifier)

        if fhir_id:
            # Batch Bundle — patient already on server
            bundle_obj = BatchBundle(fhir_id, list(observations))
            bundle_type = "batch"
            bundle_type_reason = (
                "Patient has known FHIR server ID — using Batch Bundle with direct references"
            )
        else:
            # Transaction Bundle — patient needs to be created
            patient_resource = patient_service.get_patient_resource(identifier)
            bundle_obj = TransactionBundle(patient_resource, list(observations))
            bundle_type = "transaction"
            bundle_type_reason = (
                "Patient has no FHIR server ID — using Transaction Bundle with urn:uuid references"
            )

        bundle_json = json.loads(bundle_obj.bundle.json())
        entry_count = len(bundle_obj.bundle.entry)

        # Store in session state
        session.bundle = bundle_json
        session.bundle_type = bundle_type

        return {
            "bundle_type": bundle_type,
            "bundle_type_reason": bundle_type_reason,
            "entry_count": entry_count,
            "bundle_json": bundle_json,
        }


    def post_bundle(self, session_id: str, identifier: str) -> dict:
        # Validate patient exists
        patient_data = patient_service.get_patient(identifier)
        if patient_data is None:
            raise PatientNotFoundError(
                f"No patient found with identifier '{identifier}'"
            )

        # Retrieve bundle from session state
        session = state.get_session(session_id)
        if session is None or session.bundle is None:
            raise NoBundleError(
                f"No bundle found for patient {identifier}"
            )

        bundle_json = session.bundle
        bundle_type = session.bundle_type

        # Post to FHIR server
        endpoint = f"{FHIR_SERVER_URL}"
        headers = {
            "Accept": "*/*",
            "Content-Type": "application/fhir+json",
            "Accept-Encoding": "gzip, deflate, br",
            "Prefer": "return=representation",
        }

        try:
            response = requests.post(
                endpoint,
                data=json.dumps(bundle_json),
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

        server_response = response.json()

        # Extract FHIR IDs from response
        patient_id = None
        observation_ids = []

        for entry in server_response.get("entry", []):
            resource = entry.get("resource", {})
            resource_type = resource.get("resourceType", "")
            resource_id = resource.get("id")

            if resource_type == "Patient" and resource_id:
                patient_id = resource_id
            elif resource_type == "Observation" and resource_id:
                observation_ids.append(resource_id)

        # Store patient FHIR ID if transaction bundle
        if bundle_type == "transaction" and patient_id:
            patient_service.store_fhir_id(identifier, patient_id)

        entry_count = len(server_response.get("entry", []))

        return {
            "patient_id": patient_id,
            "observation_ids": observation_ids,
            "bundle_type": bundle_type,
            "server_response": server_response,
        }


bundle_service = BundleService()
