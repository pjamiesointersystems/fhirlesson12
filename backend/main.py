from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.models.responses import success_response, error_response, INTERNAL_ERROR
from backend.routers import patients, observations, bundles

app = FastAPI(title="FHIR Training Web App API", version="1.0")

# Mount routers
app.include_router(patients.router)
app.include_router(observations.router)
app.include_router(bundles.router)

# CORS middleware — allow Angular dev server (ADR-007)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return success_response(
        data={"status": "ok", "version": "1.0"},
        message="FHIR Training API is running",
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    body, status_code = error_response(
        code=INTERNAL_ERROR,
        message="An unexpected error occurred",
        details=str(exc),
        status_code=500,
    )
    return JSONResponse(content=body, status_code=status_code)
