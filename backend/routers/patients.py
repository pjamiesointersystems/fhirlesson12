from typing import Optional

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from backend.services.patient_service import (
    patient_service,
    PatientNotFoundError,
    FHIRServerUnreachableError,
    FHIRServerError,
)
from backend.models.responses import (
    success_response,
    error_response,
    PATIENT_NOT_FOUND,
    FHIR_SERVER_UNREACHABLE,
    FHIR_SERVER_ERROR,
)

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("")
def list_patients():
    patients = patient_service.list_patients()
    return success_response(data={"patients": patients})


@router.get("/{identifier}")
def get_patient(identifier: str):
    result = patient_service.get_patient(identifier)
    if result is None:
        body, status_code = error_response(
            code=PATIENT_NOT_FOUND,
            message=f"No patient found with identifier '{identifier}'",
        )
        return JSONResponse(content=body, status_code=status_code)
    return success_response(data=result)


@router.post("/{identifier}/post")
def post_patient(identifier: str, session_id: Optional[str] = Query(None)):
    try:
        result = patient_service.post_patient(identifier)
    except PatientNotFoundError as e:
        body, status_code = error_response(
            code=PATIENT_NOT_FOUND,
            message=str(e),
        )
        return JSONResponse(content=body, status_code=status_code)
    except FHIRServerUnreachableError as e:
        body, status_code = error_response(
            code=FHIR_SERVER_UNREACHABLE,
            message=str(e),
            status_code=502,
        )
        return JSONResponse(content=body, status_code=status_code)
    except FHIRServerError as e:
        body, status_code = error_response(
            code=FHIR_SERVER_ERROR,
            message=f"FHIR server returned status {e.status_code}",
            details=e.detail,
            status_code=502,
        )
        return JSONResponse(content=body, status_code=status_code)

    return success_response(
        data=result,
        message="Patient posted successfully",
    )
