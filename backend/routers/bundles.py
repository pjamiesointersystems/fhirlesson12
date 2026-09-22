from fastapi import APIRouter
from fastapi.responses import JSONResponse

from backend.services.bundle_service import (
    bundle_service,
    NoObservationsError,
    NoBundleError,
)
from backend.services.patient_service import (
    PatientNotFoundError,
    FHIRServerUnreachableError,
    FHIRServerError,
)
from backend.models.requests import SessionRequest
from backend.models.responses import (
    success_response,
    error_response,
    NO_OBSERVATIONS,
    NO_BUNDLE,
    PATIENT_NOT_FOUND,
    FHIR_SERVER_UNREACHABLE,
    FHIR_SERVER_ERROR,
)

router = APIRouter(prefix="/api/bundles", tags=["bundles"])


@router.post("/build")
def build_bundle(req: SessionRequest):
    try:
        result = bundle_service.build_bundle(req.session_id, req.identifier)
    except PatientNotFoundError as e:
        body, status_code = error_response(
            code=PATIENT_NOT_FOUND,
            message=str(e),
        )
        return JSONResponse(content=body, status_code=status_code)
    except NoObservationsError as e:
        body, status_code = error_response(
            code=NO_OBSERVATIONS,
            message=str(e),
            details="Generate observations before building a bundle",
        )
        return JSONResponse(content=body, status_code=status_code)

    return success_response(
        data=result,
        message=f"{result['bundle_type'].title()} Bundle built with {result['entry_count']} entries",
    )


@router.post("/post")
def post_bundle(req: SessionRequest):
    try:
        result = bundle_service.post_bundle(req.session_id, req.identifier)
    except PatientNotFoundError as e:
        body, status_code = error_response(
            code=PATIENT_NOT_FOUND,
            message=str(e),
        )
        return JSONResponse(content=body, status_code=status_code)
    except NoBundleError as e:
        body, status_code = error_response(
            code=NO_BUNDLE,
            message=str(e),
            details="Build a bundle before posting",
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
            message=f"FHIR server returned error {e.status_code}",
            details=e.detail,
            status_code=502,
        )
        return JSONResponse(content=body, status_code=status_code)

    obs_count = len(result["observation_ids"])
    total = obs_count + (1 if result["patient_id"] else 0)

    return success_response(
        data=result,
        message=f"Bundle posted successfully — {total} resources created",
    )
