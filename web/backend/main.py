from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from passwordlens.analyzer import analyze_password
from passwordlens.exposure import (
    EXPOSURE_EXPOSED,
    EXPOSURE_UNKNOWN,
)


app = FastAPI(
    title="PasswordLens API",
    description="Web API for the PasswordLens security analyzer.",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



class AnalyzeRequest(BaseModel):
    password: str
    check_exposure: bool = False


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    result = analyze_password(
        request.password,
        check_exposure=request.check_exposure,
    )

    exposure = {
        "status": "not_checked",
        "label": "Exposure status: Not checked",
        "detail": "Breach exposure checking was not requested for this analysis.",
    }

    if request.check_exposure:
        exposure_result = result.exposure

        if exposure_result.status == EXPOSURE_EXPOSED:
            exposure = {
                "status": "exposed",
                "label": "Exposure status: Exposed",
                "detail": (
                    f"This password appears in known breach data "
                    f"({exposure_result.breach_count:,} occurrences)."
                ),
            }
        elif exposure_result.status == EXPOSURE_UNKNOWN:
            exposure = {
                "status": "unknown",
                "label": "Exposure status: Unknown",
                "detail": (
                    "The breach lookup could not be completed. "
                    "Exposure status could not be verified."
                ),
            }
        else:
            exposure = {
                "status": "not_exposed",
                "label": "Exposure status: Not found",
                "detail": (
                    "This password was not found in the breach dataset "
                    "returned by the exposure service."
                ),
            }

    return {
        "length": result.length,
        "has_uppercase": result.has_uppercase,
        "has_lowercase": result.has_lowercase,
        "has_number": result.has_number,
        "has_symbol": result.has_symbol,
        "score": result.score,
        "strength": result.strength,
        "risk": result.risk,
        "findings": [
            {
                "code": finding.code,
                "title": finding.title,
                "message": finding.message,
                "severity": finding.severity,
                "category": finding.category,
            }
            for finding in result.findings
        ],
        "exposure": exposure,
    }