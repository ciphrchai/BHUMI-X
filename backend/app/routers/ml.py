from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"],
)


# ============================================================
# PATHS
# ============================================================

# backend/app/routers/ml.py
# parents[0] = routers
# parents[1] = app
# parents[2] = backend
# parents[3] = bhumi-x

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATA_PATH = PROJECT_ROOT / "ml" / "data" / "06_ml_master_dataset.csv"

REGRESSION_MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "bhumi_x_suitability_regression.joblib"
)

CLASSIFIER_MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "bhumi_x_suitability_classifier.joblib"
)


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "area_sq_m",
    "land_use",
    "population_500m",
    "population_1km",
    "population_density",
    "road_distance_m",
    "nearest_road_width_m",
    "nearest_school_distance_m",
    "nearest_hospital_distance_m",
    "nearest_fire_station_distance_m",
    "nearest_police_station_distance_m",
    "infrastructure_score",
    "environmental_risk",
    "waterbody_distance_m",
    "flood_risk",
    "building_density_pct",
    "average_building_height_m",
    "building_spacing_m",
    "green_cover_pct",
    "open_space_pct",
    "baseline_wind_speed_ms",
    "wind_speed_ms",
    "pedestrian_wind_comfort_pct",
    "utci_c",
    "heat_stress_pct",
    "cold_stress_pct",
    "daylight_availability_pct",
    "sky_view_factor_pct",
    "direct_sun_hours",
    "solar_radiation_kwh_m2",
    "distance_to_bmsit_km",
    "study_zone",
]


# ============================================================
# LOAD DATA AND MODELS
# ============================================================

try:
    DATA = pd.read_csv(DATA_PATH)

    REGRESSION_MODEL = joblib.load(
        REGRESSION_MODEL_PATH
    )

    CLASSIFIER_MODEL = joblib.load(
        CLASSIFIER_MODEL_PATH
    )

    MODELS_LOADED = True

except Exception as error:

    print(
        f"BHUMI-X ML loading error: {error}"
    )

    DATA = None
    REGRESSION_MODEL = None
    CLASSIFIER_MODEL = None

    MODELS_LOADED = False


# ============================================================
# REQUEST MODEL
# ============================================================

class PredictionRequest(BaseModel):
    parcel_id: str


# ============================================================
# HELPER: CLASSIFICATION
# ============================================================

def classify_score(score: float) -> str:

    if score >= 80:
        return "HIGHLY_SUITABLE"

    if score >= 60:
        return "SUITABLE"

    if score >= 40:
        return "MODERATE"

    return "UNSUITABLE"


# ============================================================
# HELPER: CONFIDENCE
# ============================================================

def calculate_confidence(probability: float) -> str:

    if probability >= 0.80:
        return "HIGH"

    if probability >= 0.60:
        return "MEDIUM"

    return "LOW"


# ============================================================
# HELPER: EXPLANATION
# ============================================================

def generate_explanation(
    parcel: pd.DataFrame,
) -> dict[str, list[str]]:

    positive: list[str] = []
    warnings: list[str] = []

    row = parcel.iloc[0]

    # Population
    if row["population_1km"] >= DATA["population_1km"].quantile(0.75):
        positive.append(
            f"Strong population coverage within 1 km "
            f"({row['population_1km']:.0f})"
        )

    elif row["population_1km"] <= DATA["population_1km"].quantile(0.25):
        warnings.append(
            f"Lower population coverage within 1 km "
            f"({row['population_1km']:.0f})"
        )

    # School
    if row["nearest_school_distance_m"] <= 500:
        positive.append(
            f"Good school accessibility "
            f"({row['nearest_school_distance_m']:.0f} m)"
        )

    elif row["nearest_school_distance_m"] >= 1500:
        warnings.append(
            f"School accessibility could be improved "
            f"({row['nearest_school_distance_m']:.0f} m)"
        )

    # Hospital
    if row["nearest_hospital_distance_m"] <= 1000:
        positive.append(
            f"Good hospital accessibility "
            f"({row['nearest_hospital_distance_m']:.0f} m)"
        )

    elif row["nearest_hospital_distance_m"] >= 2000:
        warnings.append(
            f"Hospital is relatively distant "
            f"({row['nearest_hospital_distance_m']:.0f} m)"
        )

    # Infrastructure
    if row["infrastructure_score"] >= 65:
        positive.append(
            f"Strong infrastructure score "
            f"({row['infrastructure_score']:.1f}/100)"
        )

    elif row["infrastructure_score"] <= 35:
        warnings.append(
            f"Low infrastructure score "
            f"({row['infrastructure_score']:.1f}/100)"
        )

    # Environmental risk
    if row["environmental_risk"] <= 20:
        positive.append(
            f"Low environmental risk "
            f"({row['environmental_risk']:.1f})"
        )

    elif row["environmental_risk"] >= 40:
        warnings.append(
            f"Elevated environmental risk "
            f"({row['environmental_risk']:.1f})"
        )

    # Heat stress
    if row["heat_stress_pct"] <= 5:
        positive.append(
            f"Low heat-stress exposure "
            f"({row['heat_stress_pct']:.1f}%)"
        )

    elif row["heat_stress_pct"] >= 20:
        warnings.append(
            f"Elevated heat-stress exposure "
            f"({row['heat_stress_pct']:.1f}%)"
        )

    # Green cover
    if row["green_cover_pct"] >= 30:
        positive.append(
            f"Good green coverage "
            f"({row['green_cover_pct']:.1f}%)"
        )

    elif row["green_cover_pct"] <= 10:
        warnings.append(
            f"Limited green coverage "
            f"({row['green_cover_pct']:.1f}%)"
        )

    # Open space
    if row["open_space_pct"] >= 60:
        positive.append(
            f"Good open-space availability "
            f"({row['open_space_pct']:.1f}%)"
        )

    elif row["open_space_pct"] <= 25:
        warnings.append(
            f"Limited open-space availability "
            f"({row['open_space_pct']:.1f}%)"
        )

    # Building density
    if row["building_density_pct"] >= 70:
        warnings.append(
            f"High building density "
            f"({row['building_density_pct']:.1f}%)"
        )

    elif row["building_density_pct"] <= 30:
        positive.append(
            f"Moderate building density "
            f"({row['building_density_pct']:.1f}%)"
        )

    # Daylight
    if row["daylight_availability_pct"] >= 70:
        positive.append(
            f"Good daylight availability "
            f"({row['daylight_availability_pct']:.1f}%)"
        )

    elif row["daylight_availability_pct"] <= 40:
        warnings.append(
            f"Lower daylight availability "
            f"({row['daylight_availability_pct']:.1f}%)"
        )

    # Wind comfort
    if row["pedestrian_wind_comfort_pct"] >= 90:
        positive.append(
            f"Good pedestrian wind comfort "
            f"({row['pedestrian_wind_comfort_pct']:.1f}%)"
        )

    elif row["pedestrian_wind_comfort_pct"] <= 70:
        warnings.append(
            f"Lower pedestrian wind comfort "
            f"({row['pedestrian_wind_comfort_pct']:.1f}%)"
        )

    return {
        "positive": positive[:6],
        "warnings": warnings[:6],
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@router.post("/predict")
def predict_parcel(
    request: PredictionRequest,
) -> dict[str, Any]:

    if not MODELS_LOADED:

        raise HTTPException(
            status_code=500,
            detail="BHUMI-X ML models could not be loaded.",
        )

    parcel_id = request.parcel_id.strip()

    parcel = DATA[
        DATA["parcel_id"] == parcel_id
    ]

    if parcel.empty:

        raise HTTPException(
            status_code=404,
            detail=f"Parcel '{parcel_id}' not found.",
        )

    X = parcel[FEATURES]

    # --------------------------------------------------------
    # Suitability score
    # --------------------------------------------------------

    score = float(
        REGRESSION_MODEL.predict(X)[0]
    )

    score = float(
        np.clip(score, 0, 100)
    )

    # --------------------------------------------------------
    # Classification
    # --------------------------------------------------------

    predicted_class = CLASSIFIER_MODEL.predict(X)[0]

    probabilities = (
        CLASSIFIER_MODEL.predict_proba(X)[0]
    )

    classes = CLASSIFIER_MODEL.classes_

    max_probability = float(
        max(probabilities)
    )

    confidence = calculate_confidence(
        max_probability
    )

    probability_map = {
        str(class_name): round(
            float(probability) * 100,
            2,
        )
        for class_name, probability
        in zip(classes, probabilities)
    }

    # --------------------------------------------------------
    # Explanation
    # --------------------------------------------------------

    explanation = generate_explanation(
        parcel
    )

    # --------------------------------------------------------
    # Risk
    # --------------------------------------------------------

    environmental_risk = float(
        parcel["environmental_risk"].iloc[0]
    )

    if environmental_risk >= 50:
        risk_level = "critical"

    elif environmental_risk >= 35:
        risk_level = "high"

    elif environmental_risk >= 20:
        risk_level = "medium"

    else:
        risk_level = "low"

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "parcel_id": parcel_id,

        "prediction": {
            "suitability_score": round(
                score,
                2,
            ),

            "classification": str(
                predicted_class
            ),

            "confidence": {
                "level": confidence,
                "probability": round(
                    max_probability * 100,
                    2,
                ),
            },

            "class_probabilities": probability_map,

            "risk_level": risk_level,
        },

        "explanation": explanation,

        "location": {
            "distance_to_bmsit_km": round(
                float(
                    parcel[
                        "distance_to_bmsit_km"
                    ].iloc[0]
                ),
                3,
            ),

            "study_zone": str(
                parcel["study_zone"].iloc[0]
            ),
        },

        "environment": {
            "wind_speed_ms": round(
                float(
                    parcel[
                        "wind_speed_ms"
                    ].iloc[0]
                ),
                2,
            ),

            "utci_c": round(
                float(
                    parcel["utci_c"].iloc[0]
                ),
                2,
            ),

            "heat_stress_pct": round(
                float(
                    parcel[
                        "heat_stress_pct"
                    ].iloc[0]
                ),
                2,
            ),

            "daylight_availability_pct": round(
                float(
                    parcel[
                        "daylight_availability_pct"
                    ].iloc[0]
                ),
                2,
            ),

            "sky_view_factor_pct": round(
                float(
                    parcel[
                        "sky_view_factor_pct"
                    ].iloc[0]
                ),
                2,
            ),

            "solar_radiation_kwh_m2": round(
                float(
                    parcel[
                        "solar_radiation_kwh_m2"
                    ].iloc[0]
                ),
                2,
            ),
        },
    }