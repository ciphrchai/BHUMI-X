from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/simulation",
    tags=["Simulation"],
)


class SimulationRequest(BaseModel):
    parcel_id: str
    facility_type: str
    radius: float


# Temporary parcel information.
# Later this will come from the database / GIS layer.
parcel_data = {
    "A102": {
        "population_nearby": 12500,
        "distance_to_road": 180,
        "area": 4200,
    },
    "C221": {
        "population_nearby": 10800,
        "distance_to_road": 240,
        "area": 3800,
    },
}


@router.post("/impact")
def simulate_impact(request: SimulationRequest):

    parcel = parcel_data.get(request.parcel_id)

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found",
        )

    # Simple prototype impact calculation.
    # Later this will be replaced with GIS/network analysis.

    radius_km = request.radius / 1000

    base_population = parcel["population_nearby"]

    # Larger radius → greater potential population coverage.
    coverage_factor = min(radius_km / 2.0, 1.5)

    additional_population = int(
        base_population * 0.25 * coverage_factor
    )

    current_distance = parcel["distance_to_road"]

    before_travel_distance = current_distance

    after_travel_distance = max(
        current_distance * 0.65,
        50,
    )

    travel_improvement = (
        (before_travel_distance - after_travel_distance)
        / before_travel_distance
    ) * 100

    metrics = [
        {
            "label": "Population Served",
            "before": base_population,
            "after": base_population + additional_population,
            "unit": "people",
            "improvement_pct": round(
                (additional_population / base_population) * 100,
                2,
            ),
        },
        {
            "label": "Average Road Distance",
            "before": before_travel_distance,
            "after": round(after_travel_distance, 2),
            "unit": "m",
            "improvement_pct": round(
                travel_improvement,
                2,
            ),
        },
        {
            "label": "Service Coverage",
            "before": 45,
            "after": min(
                45 + radius_km * 20,
                100,
            ),
            "unit": "%",
            "improvement_pct": round(
                min(radius_km * 20, 55),
                2,
            ),
        },
    ]

    return {
        "parcel_id": request.parcel_id,
        "facility": request.facility_type,
        "population_radius": request.radius,
        "metrics": metrics,
        "additional_population_served": additional_population,
    }