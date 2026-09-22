from typing import Any, Optional


# Error code constants
PATIENT_NOT_FOUND = "PATIENT_NOT_FOUND"
FILE_NOT_FOUND = "FILE_NOT_FOUND"
FHIR_SERVER_UNREACHABLE = "FHIR_SERVER_UNREACHABLE"
FHIR_SERVER_ERROR = "FHIR_SERVER_ERROR"
INVALID_INPUT = "INVALID_INPUT"
NO_OBSERVATIONS = "NO_OBSERVATIONS"
NO_BUNDLE = "NO_BUNDLE"
INTERNAL_ERROR = "INTERNAL_ERROR"


def success_response(
    data: Any = None, message: Optional[str] = None
) -> dict:
    response = {"success": True, "data": data}
    if message:
        response["message"] = message
    return response


def error_response(
    code: str,
    message: str,
    details: Optional[str] = None,
    status_code: int = 400,
) -> tuple[dict, int]:
    body = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
    }
    if details:
        body["error"]["details"] = details
    return body, status_code
