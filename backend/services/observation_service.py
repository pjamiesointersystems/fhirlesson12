import ast
import os
import random
import sys
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

_project_root = os.path.join(os.path.dirname(__file__), "..", "..")
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from observation import HeartRateObservation
from backend.services.patient_service import patient_service, PatientNotFoundError
from backend import state


class FileNotFoundForPatientError(Exception):
    pass


class ObservationService:
    def generate_from_file(self, session_id: str, identifier: str) -> dict:
        # Validate patient exists
        patient = patient_service.get_patient(identifier)
        if patient is None:
            raise PatientNotFoundError(
                f"No patient found with identifier '{identifier}'"
            )

        # Read the data file
        file_name = f"{identifier.replace('-', '')}.txt"
        file_path = os.path.join(_project_root, file_name)

        if not os.path.exists(file_path):
            raise FileNotFoundForPatientError(
                f"Data file not found for patient {identifier}",
                file_name,
            )

        raw_tuples = []
        observations = []
        with open(file_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                tup = ast.literal_eval(line)
                heart_rate_value, effective_date_str = tup
                raw_tuples.append({"heart_rate": heart_rate_value, "datetime": effective_date_str})
                effective_dt = datetime.fromisoformat(effective_date_str)
                obs = HeartRateObservation(
                    identifier, heart_rate_value, effective_dt=effective_dt
                )
                observations.append(obs)

        # Store in session state
        session = state.get_or_create_session(session_id)
        session.observations[identifier] = observations

        # Build response with raw data and FHIR samples
        sample_raw = raw_tuples[:5]
        sample_fhir = [obs.dict() for obs in observations[:5]]
        return {
            "count": len(observations),
            "sample_raw": sample_raw,
            "sample_observations": sample_fhir,
        }

    def generate_synthetic(
        self, session_id: str, identifier: str, count: int
    ) -> dict:
        # Validate patient exists
        patient = patient_service.get_patient(identifier)
        if patient is None:
            raise PatientNotFoundError(
                f"No patient found with identifier '{identifier}'"
            )

        # Cap and floor
        count = max(1, min(count, 1000))

        # Generate synthetic observations
        tz = ZoneInfo("America/New_York")
        base_date = datetime.now(tz)
        observations = []
        for i in range(count):
            heart_rate = random.randint(60, 160)
            offset = timedelta(minutes=i)
            effective_dt = base_date - offset
            obs = HeartRateObservation(
                identifier, heart_rate, effective_dt=effective_dt
            )
            observations.append(obs)

        # Store in session state
        session = state.get_or_create_session(session_id)
        session.observations[identifier] = observations

        # Build response
        sample = [obs.dict() for obs in observations[:2]]
        return {
            "count": len(observations),
            "sample_observations": sample,
        }


observation_service = ObservationService()
