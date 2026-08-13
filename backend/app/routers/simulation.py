from pathlib import Path

import math
import pandas as pd

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/simulation",
    tags=["Simulation"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class SimulationRequest(BaseModel):
    parcel_id: str
    facility_type: str
    radius: float


# ============================================================
# DATASET LOCATION
# ============================================================

# simulation.py
#     ↓
# routers/
#     ↓
# app/
#     ↓
# backend/
#     ↓
# bhumi-x/
#     ↓
# ml/
#     ↓
# 01_parcels.csv

BASE_DIR = Path(__file__).resolve().parents[3]

DATASET_PATH = BASE_DIR / "ml" / "01_parcels.csv"


# ============================================================
# LOAD DATASET
# ============================================================

def load_parcel_data() -> pd.DataFrame:
    """
    Load the BHUMI-X parcel dataset.

    The CSV is loaded for every simulation request so that
    changes to the dataset are immediately reflected during
    development.
    """

    if not DATASET_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Parcel dataset not found: {DATASET_PATH}",
        )

    try:
        df = pd.read_csv(DATASET_PATH)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to read parcel dataset: {exc}",
        )

    if "parcel_id" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail=(
                "parcel_id column not found in parcel dataset. "
                f"Available columns: {list(df.columns)}"
            ),
        )

    # Normalize parcel IDs
    df["parcel_id"] = (
        df["parcel_id"]
        .astype(str)
        .str.strip()
    )

    return df


# ============================================================
# HELPERS
# ============================================================

def safe_float(
    value,
    default: float = 0.0,
) -> float:
    """
    Safely convert a value to float.
    """

    try:
        if pd.isna(value):
            return default

        return float(value)

    except (TypeError, ValueError):
        return default


def clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    return max(
        minimum,
        min(value, maximum),
    )


# ============================================================
# SIMULATION
# ============================================================

@router.post("/impact")
def simulate_impact(
    request: SimulationRequest,
):
    """
    BHUMI-X prototype impact simulation.

    Uses the real parcel dataset instead of hardcoded
    parcel information.

    The simulation estimates:

    - population served
    - service accessibility
    - average travel distance
    - additional population served

    Facility-specific proximity fields are used:

    school:
        nearest_school_distance_m

    hospital:
        nearest_hospital_distance_m
    """

    # --------------------------------------------------------
    # VALIDATE REQUEST
    # --------------------------------------------------------

    parcel_id = request.parcel_id.strip()

    facility_type = (
        request.facility_type
        .strip()
        .lower()
    )

    radius_km = safe_float(
        request.radius
    )

    if not parcel_id:
        raise HTTPException(
            status_code=400,
            detail="parcel_id is required.",
        )

    if facility_type not in {
        "school",
        "hospital",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "facility_type must be either "
                "'school' or 'hospital'."
            ),
        )

    if radius_km <= 0:
        raise HTTPException(
            status_code=400,
            detail="radius must be greater than 0.",
        )

    # Prevent unreasonable prototype values
    radius_km = clamp(
        radius_km,
        0.1,
        25.0,
    )

    # --------------------------------------------------------
    # LOAD REAL DATA
    # --------------------------------------------------------

    df = load_parcel_data()

    matching = df[
        df["parcel_id"].str.upper()
        == parcel_id.upper()
    ]

    if matching.empty:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Parcel '{parcel_id}' not found "
                "in 01_parcels.csv."
            ),
        )

    parcel = matching.iloc[0]

    # Use the actual ID from the dataset
    actual_parcel_id = str(
        parcel["parcel_id"]
    )

    # --------------------------------------------------------
    # BASIC PARCEL DATA
    # --------------------------------------------------------

    population_500m = safe_float(
        parcel.get(
            "population_500m",
            0,
        )
    )

    population_1km = safe_float(
        parcel.get(
            "population_1km",
            0,
        )
    )

    population_density = safe_float(
        parcel.get(
            "population_density",
            0,
        )
    )

    infrastructure_score = safe_float(
        parcel.get(
            "infrastructure_score",
            0,
        )
    )

    road_distance_m = safe_float(
        parcel.get(
            "road_distance_m",
            0,
        )
    )

    # --------------------------------------------------------
    # FACILITY-SPECIFIC DISTANCE
    # --------------------------------------------------------

    if facility_type == "school":

        nearest_distance_m = safe_float(
            parcel.get(
                "nearest_school_distance_m",
                0,
            )
        )

    else:

        nearest_distance_m = safe_float(
            parcel.get(
                "nearest_hospital_distance_m",
                0,
            )
        )

    nearest_distance_km = (
        nearest_distance_m / 1000.0
    )

    # --------------------------------------------------------
    # ESTIMATE EXISTING SERVICE COVERAGE
    # --------------------------------------------------------
    #
    # The dataset gives population around the parcel
    # and distance to the nearest facility.
    #
    # We estimate how much of the 1 km population is
    # currently served based on that distance.
    #
    # This is a transparent prototype model, not a
    # production GIS network analysis.
    # --------------------------------------------------------

    if nearest_distance_km <= 0:
        existing_access_factor = 1.0

    else:
        existing_access_factor = clamp(
            1.0
            - (
                nearest_distance_km
                / max(radius_km, 0.1)
            ),
            0.0,
            1.0,
        )

    existing_population_served = (
        population_1km
        * existing_access_factor
    )

    # --------------------------------------------------------
    # NEW FACILITY COVERAGE
    # --------------------------------------------------------
    #
    # Estimate coverage based on:
    #
    #   - service radius
    #   - population density
    #   - infrastructure
    #
    # Population within a circular service area:
    #
    #       population = density × πr²
    #
    # Then cap it to the known 1 km population.
    # --------------------------------------------------------

    service_area_km2 = (
        math.pi
        * radius_km
        * radius_km
    )

    radius_population = (
        population_density
        * service_area_km2
    )

    # If density is unavailable, use the actual
    # population_1km value instead.
    if radius_population <= 0:
        radius_population = population_1km

    # Infrastructure slightly affects practical
    # service coverage.
    infrastructure_factor = clamp(
        infrastructure_score / 100.0,
        0.25,
        1.0,
    )

    estimated_new_population = (
        radius_population
        * infrastructure_factor
    )

    # We do not claim service beyond the known
    # population around the parcel.
    estimated_new_population = min(
        estimated_new_population,
        population_1km,
    )

    # Make sure the new facility cannot magically
    # serve less than the existing situation.
    new_population_served = max(
        estimated_new_population,
        existing_population_served,
    )

    additional_population = max(
        new_population_served
        - existing_population_served,
        0,
    )

    # --------------------------------------------------------
    # SERVICE ACCESSIBILITY
    # --------------------------------------------------------

    existing_accessibility = clamp(
        (
            existing_access_factor
            * 100
        ),
        0,
        100,
    )

    radius_factor = clamp(
        radius_km / 2.0,
        0,
        1,
    )

    infrastructure_bonus = (
        infrastructure_factor
        * 15
    )

    new_accessibility = clamp(
        (
            existing_accessibility
            + (
                radius_factor
                * 45
            )
            + infrastructure_bonus
        ),
        0,
        100,
    )

    accessibility_improvement = (
        new_accessibility
        - existing_accessibility
    )

    # --------------------------------------------------------
    # TRAVEL DISTANCE
    # --------------------------------------------------------
    #
    # Existing travel distance is based on the nearest
    # facility from the real dataset.
    #
    # New facility is assumed to be placed at the
    # selected parcel, reducing average travel distance.
    #
    # This is a prototype estimate rather than a road
    # network calculation.
    # --------------------------------------------------------

    before_travel_distance = (
        nearest_distance_km
    )

    if before_travel_distance <= 0:
        before_travel_distance = (
            road_distance_m / 1000.0
        )

    # New facility is located at the selected parcel.
    # Use a small residual access distance rather than
    # claiming exactly zero travel.
    after_travel_distance = min(
        before_travel_distance,
        max(
            road_distance_m / 1000.0,
            0.05,
        ),
    )

    if before_travel_distance > 0:

        travel_improvement = (
            (
                before_travel_distance
                - after_travel_distance
            )
            / before_travel_distance
        ) * 100

    else:
        travel_improvement = 0.0

    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    population_improvement = (
        (
            additional_population
            / max(
                existing_population_served,
                1,
            )
        )
        * 100
    )

    metrics = [

        {
            "label": "Population Served",
            "before": round(
                existing_population_served
            ),
            "after": round(
                new_population_served
            ),
            "unit": "people",
            "improvement_pct": round(
                population_improvement,
                2,
            ),
        },

        {
            "label": "Service Accessibility",
            "before": round(
                existing_accessibility,
                2,
            ),
            "after": round(
                new_accessibility,
                2,
            ),
            "unit": "%",
            "improvement_pct": round(
                accessibility_improvement,
                2,
            ),
        },

        {
            "label": "Average Travel Distance",
            "before": round(
                before_travel_distance,
                2,
            ),
            "after": round(
                after_travel_distance,
                2,
            ),
            "unit": "km",
            "improvement_pct": round(
                travel_improvement,
                2,
            ),
        },
    ]

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "parcel_id": actual_parcel_id,

        "facility": facility_type,

        "population_radius": radius_km,

        "metrics": metrics,

        "additional_population_served": round(
            additional_population
        ),

        # Extra information useful for the frontend
        # and future report generation.
        "parcel_context": {
            "population_500m": round(
                population_500m
            ),
            "population_1km": round(
                population_1km
            ),
            "population_density": round(
                population_density,
                2,
            ),
            "infrastructure_score": round(
                infrastructure_score,
                2,
            ),
            "road_distance_m": round(
                road_distance_m,
                2,
            ),
            "nearest_facility_distance_m": round(
                nearest_distance_m,
                2,
            ),
        },

        "simulation": {
            "model": (
                "BHUMI-X Prototype "
                "Spatial Impact Estimator"
            ),
            "data_source": (
                "01_parcels.csv"
            ),
            "note": (
                "Prototype estimate based on "
                "parcel population, density, "
                "infrastructure and facility "
                "proximity. Production deployment "
                "should use GIS network analysis."
            ),
        },
    }