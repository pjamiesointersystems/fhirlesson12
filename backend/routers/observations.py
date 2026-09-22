from fastapi import APIRouter
from fastapi.responses import JSONResponse

from backend.services.observation_service import (
    observation_service,
    FileNotFoundForPatientError,
)
from backend.services.patient_service import PatientNotFoundError
from backend.models.requests import SessionRequest, SyntheticObservationRequest
from backend.models.responses import (
    success_response,
    error_response,
    FILE_NOT_FOUND,
    PATIENT_NOT_FOUND,
)

router = APIRouter(prefix="/api/observations", tags=["observations"])


@router.post("/from-file")
def generate_from_file(req: SessionRequest):
    try:
        result = observation_service.generate_from_file(req.session_id, req.identifier)
    except PatientNotFoundError as e:
        body, status_code = error_response(
            code=PATIENT_NOT_FOUND,
            message=str(e),
        )
        return JSONResponse(content=body, status_code=status_code)
    except FileNotFoundForPatientError as e:
        body, status_code = error_response(
            code=FILE_NOT_FOUND,
            message=str(e.args[0]),
            details=f"Expected file: {e.args[1]}" if len(e.args) > 1 else None,
        )
        return JSONResponse(content=body, status_code=status_code)

    return success_response(
        data=result,
        message=f"Generated {result['count']} observations from file",
    )


@router.post("/synthetic")
def generate_synthetic(req: SyntheticObservationRequest):
    try:
        result = observation_service.generate_synthetic(
            req.session_id, req.identifier, req.count
        )
    except PatientNotFoundError as e:
        body, status_code = error_response(
            code=PATIENT_NOT_FOUND,
            message=str(e),
        )
        return JSONResponse(content=body, status_code=status_code)

    return success_response(
        data=result,
        message=f"Generated {result['count']} synthetic observations",
    )
