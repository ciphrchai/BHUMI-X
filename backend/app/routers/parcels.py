from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException


router = APIRouter(
    prefix="/api/parcels",
    tags=["Parcels"],
)


# ============================================================
# DATASET PATH
# ============================================================

# backend/app/routers/parcels.py
# parents[0] = routers
# parents[1] = app
# parents[2] = backend
# parents[3] = bhumi-x

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATA_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "06_ml_master_dataset.csv"
)


# ============================================================
# LOAD DATASET
# ============================================================

try:

    df = pd.read_csv(DATA_PATH)

    print(
        f"BHUMI-X parcel dataset loaded: {len(df)} parcels"
    )

except Exception as error:

    print(
        f"ERROR loading BHUMI-X parcel dataset: {error}"
    )

    df = pd.DataFrame()


# ============================================================
# HELPER
# ============================================================

def parcel_to_dict(row):

    return {
        "parcel_id": str(row["parcel_id"]),

        "area_sq_m": float(row["area_sq_m"]),

        "land_use": str(row["land_use"]),

        "population_500m": int(
            row["population_500m"]
        ),

        "population_1km": int(
            row["population_1km"]
        ),

        "population_density": float(
            row["population_density"]
        ),

        "road_distance_m": float(
            row["road_distance_m"]
        ),

        "nearest_road_width_m": float(
            row["nearest_road_width_m"]
        ),

        "nearest_school_distance_m": float(
            row["nearest_school_distance_m"]
        ),

        "nearest_hospital_distance_m": float(
            row["nearest_hospital_distance_m"]
        ),

        "nearest_fire_station_distance_m": float(
            row["nearest_fire_station_distance_m"]
        ),

        "nearest_police_station_distance_m": float(
            row["nearest_police_station_distance_m"]
        ),

        "infrastructure_score": float(
            row["infrastructure_score"]
        ),

        "environmental_risk": float(
            row["environmental_risk"]
        ),

        "waterbody_distance_m": float(
            row["waterbody_distance_m"]
        ),

        "flood_risk": str(
            row["flood_risk"]
        ),

        "building_density_pct": float(
            row["building_density_pct"]
        ),

        "average_building_height_m": float(
            row["average_building_height_m"]
        ),

        "building_spacing_m": float(
            row["building_spacing_m"]
        ),

        "green_cover_pct": float(
            row["green_cover_pct"]
        ),

        "open_space_pct": float(
            row["open_space_pct"]
        ),

        "baseline_wind_speed_ms": float(
            row["baseline_wind_speed_ms"]
        ),

        "wind_speed_ms": float(
            row["wind_speed_ms"]
        ),

        "pedestrian_wind_comfort_pct": float(
            row["pedestrian_wind_comfort_pct"]
        ),

        "utci_c": float(
            row["utci_c"]
        ),

        "heat_stress_pct": float(
            row["heat_stress_pct"]
        ),

        "cold_stress_pct": float(
            row["cold_stress_pct"]
        ),

        "daylight_availability_pct": float(
            row["daylight_availability_pct"]
        ),

        "sky_view_factor_pct": float(
            row["sky_view_factor_pct"]
        ),

        "direct_sun_hours": float(
            row["direct_sun_hours"]
        ),

        "solar_radiation_kwh_m2": float(
            row["solar_radiation_kwh_m2"]
        ),

        "distance_to_bmsit_m": float(
            row["distance_to_bmsit_m"]
        ),

        "distance_to_bmsit_km": float(
            row["distance_to_bmsit_km"]
        ),

        "study_zone": str(
            row["study_zone"]
        ),

        "suitability_score": float(
            row["suitability_score"]
        ),

        "suitability_status": str(
            row["suitability_status"]
        ),

        "risk_level": str(
            row["risk_level"]
        ),

        "confidence_level": str(
            row["confidence_level"]
        ),
    }


# ============================================================
# GET ALL PARCELS
# ============================================================

@router.get("")
def get_parcels(
    region: str | None = None,
):

    if df.empty:

        raise HTTPException(
            status_code=500,
            detail="BHUMI-X parcel dataset could not be loaded.",
        )


    filtered = df


    # Optional region filter
    if region:

        region_lower = region.lower()

        filtered = filtered[
            filtered["study_zone"]
            .str.lower()
            .str.contains(region_lower)
        ]


    return [
        parcel_to_dict(row)
        for _, row in filtered.iterrows()
    ]


# ============================================================
# GET SINGLE PARCEL
# ============================================================

@router.get("/{parcel_id}")
def get_parcel(
    parcel_id: str,
):

    if df.empty:

        raise HTTPException(
            status_code=500,
            detail="BHUMI-X parcel dataset could not be loaded.",
        )


    parcel = df[
        df["parcel_id"] == parcel_id
    ]


    if parcel.empty:

        raise HTTPException(
            status_code=404,
            detail=f"Parcel '{parcel_id}' not found.",
        )


    return parcel_to_dict(
        parcel.iloc[0]
    )