from datetime import datetime, timezone
from typing import Optional, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis"],
)


# ============================================================
# Pydantic Models
# ============================================================

class AnalysisWeights(BaseModel):
    population: float = 1.0
    accessibility: float = 1.0
    land_suitability: float = 1.0
    environment: float = 1.0
    facility_gap: float = 1.0
    infrastructure: float = 1.0


class AnalysisFilters(BaseModel):
    max_road_distance: Optional[float] = None
    max_transport_distance: Optional[float] = None
    min_population_served: Optional[float] = None
    environmental_risk: Optional[
        Literal["low", "medium", "high", "critical"]
    ] = None
    ownership_type: Optional[
        Literal["government", "private", "disputed", "unknown"]
    ] = None
    land_use_compatibility: Optional[list[str]] = None
    existing_facility_distance: Optional[float] = None


class AnalysisRequest(BaseModel):
    region: str
    facility: Literal[
        "school",
        "hospital",
        "fire_station",
        "police_station",
        "bus_terminal",
        "public_office",
        "waste_management",
        "other",
    ]
    minimum_area: float = Field(gt=0)
    objective: Literal[
        "population_coverage",
        "travel_distance",
        "development_cost",
        "environmental_impact",
        "balanced",
    ]
    weights: AnalysisWeights
    filters: Optional[AnalysisFilters] = None


# ============================================================
# Temporary in-memory analysis storage
# ============================================================

analyses = {}


# ============================================================
# Mock parcel data
# Later this will come from PostgreSQL/PostGIS
# ============================================================

parcels = [
    {
        "parcel_id": "A102",
        "area": 4200,
        "land_use": "vacant",
        "ownership": "government",
        "location": "Yelahanka",
        "population_nearby": 12500,
        "distance_to_road": 180,
        "nearest_facility_distance": 2.8,
        "environmental_risk": "low",
    },
    {
        "parcel_id": "C221",
        "area": 3800,
        "land_use": "vacant",
        "ownership": "government",
        "location": "Yelahanka",
        "population_nearby": 10800,
        "distance_to_road": 240,
        "nearest_facility_distance": 3.2,
        "environmental_risk": "low",
    },
]


# ============================================================
# Helper
# ============================================================

def calculate_score(parcel, weights):
    population_score = min(
        parcel["population_nearby"] / 15000 * 100,
        100
    )

    accessibility_score = max(
        0,
        100 - parcel["distance_to_road"] / 10
    )

    land_suitability_score = (
        100 if parcel["land_use"] == "vacant" else 60
    )

    environment_score = {
        "low": 100,
        "medium": 70,
        "high": 40,
        "critical": 10,
    }.get(parcel["environmental_risk"], 50)

    facility_gap_score = min(
        parcel["nearest_facility_distance"] / 5 * 100,
        100
    )

    infrastructure_score = accessibility_score

    total_weight = (
        weights.population
        + weights.accessibility
        + weights.land_suitability
        + weights.environment
        + weights.facility_gap
        + weights.infrastructure
    )

    score = (
        population_score * weights.population
        + accessibility_score * weights.accessibility
        + land_suitability_score * weights.land_suitability
        + environment_score * weights.environment
        + facility_gap_score * weights.facility_gap
        + infrastructure_score * weights.infrastructure
    ) / total_weight

    return {
        "overall_score": round(score, 2),
        "scores": {
            "population_score": round(population_score, 2),
            "accessibility_score": round(accessibility_score, 2),
            "land_suitability_score": round(land_suitability_score, 2),
            "environment_score": round(environment_score, 2),
            "facility_gap_score": round(facility_gap_score, 2),
            "infrastructure_score": round(infrastructure_score, 2),
        },
    }


# ============================================================
# POST /api/analysis
# ============================================================

@router.post("")
def submit_analysis(request: AnalysisRequest):
    analysis_id = f"ANL-{len(analyses) + 1:03d}"

    matching_parcels = [
        parcel
        for parcel in parcels
        if request.region.lower() in parcel["location"].lower()
        and parcel["area"] >= request.minimum_area
    ]

    recommendations = []

    for parcel in matching_parcels:
        result = calculate_score(parcel, request.weights)
        score = result["overall_score"]

        if score >= 85:
            recommendation = "highly_suitable"
            confidence = "high"
        elif score >= 70:
            recommendation = "suitable"
            confidence = "high"
        elif score >= 50:
            recommendation = "moderate"
            confidence = "medium"
        else:
            recommendation = "unsuitable"
            confidence = "low"

        recommendations.append({
            "parcel_id": parcel["parcel_id"],
            "overall_score": score,
            "confidence": confidence,
            "scores": result["scores"],
            "risk_level": parcel["environmental_risk"],
            "recommendation": recommendation,
            "reasons": [
                "Government-owned parcel",
                "Suitable land-use classification",
                "Good accessibility",
                "Low environmental risk",
            ],
            "warnings": [],
        })

    recommendations.sort(
        key=lambda item: item["overall_score"],
        reverse=True
    )

    now = datetime.now(timezone.utc).isoformat()

    result = {
        "analysis_id": analysis_id,
        "status": "completed",
        "region": request.region,
        "facility": request.facility,
        "objective": request.objective,
        "parcels_analyzed": len(matching_parcels),
        "suitable_parcels": sum(
            1
            for item in recommendations
            if item["recommendation"]
            in ["highly_suitable", "suitable"]
        ),
        "recommendations": recommendations,
        "created_at": now,
        "completed_at": now,
    }

    analyses[analysis_id] = result

    return {
        "analysis_id": analysis_id
    }


# ============================================================
# GET /api/analysis/recent
# ============================================================

@router.get("/recent")
def get_recent_analyses():
    results = []

    for analysis in reversed(list(analyses.values())):
        top_score = (
            analysis["recommendations"][0]["overall_score"]
            if analysis["recommendations"]
            else 0
        )

        results.append({
            "analysis_id": analysis["analysis_id"],
            "region": analysis["region"],
            "facility": analysis["facility"],
            "date": analysis["created_at"],
            "status": analysis["status"],
            "top_score": top_score,
        })

    return results


# ============================================================
# GET /api/analysis/{analysis_id}
# IMPORTANT: keep this AFTER /recent
# ============================================================

@router.get("/{analysis_id}")
def get_analysis_result(analysis_id: str):
    if analysis_id not in analyses:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    return analyses[analysis_id]