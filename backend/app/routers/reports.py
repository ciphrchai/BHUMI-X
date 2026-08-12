from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.routers.analysis import analyses


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


# Temporary in-memory report storage.
# Later this will be replaced with a database.
reports = []


class GenerateReportRequest(BaseModel):
    analysis_id: str


@router.get("")
def get_reports():
    return reports


@router.post("/generate")
def generate_report(request: GenerateReportRequest):

    # Find the analysis
    analysis = analyses.get(request.analysis_id)

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    recommendations = analysis.get("recommendations", [])

    # Determine top parcel
    if recommendations:
        top_recommendation = max(
            recommendations,
            key=lambda item: item["overall_score"],
        )

        top_parcel = top_recommendation["parcel_id"]
        top_score = top_recommendation["overall_score"]

    else:
        top_parcel = "N/A"
        top_score = 0

    report_id = f"REP-{len(reports) + 1:03d}"

    report = {
        "report_id": report_id,
        "analysis_id": analysis["analysis_id"],
        "region": analysis["region"],
        "facility": analysis["facility"],
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "status": "completed",
        "top_parcel": top_parcel,
        "top_score": top_score,
    }

    reports.insert(0, report)

    return report