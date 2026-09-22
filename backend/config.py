import os


FHIR_SERVER_URL = os.getenv(
    "FHIR_SERVER_URL",
    "http://127.0.0.1:8080/csp/healthshare/demo/fhir/r4",
)
FHIR_SERVER_USER = os.getenv("FHIR_SERVER_USER", "_System")
FHIR_SERVER_PASS = os.getenv("FHIR_SERVER_PASS", "ISCDEMO")
