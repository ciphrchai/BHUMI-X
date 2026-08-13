import pandas as pd
import joblib
import numpy as np

DATA_PATH = "data/06_ml_master_dataset.csv"

REGRESSION_MODEL = "models/bhumi_x_suitability_regression.joblib"
CLASSIFIER_MODEL = "models/bhumi_x_suitability_classifier.joblib"


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


print("Loading BHUMI-X data...")

df = pd.read_csv(DATA_PATH)

print("Loading trained models...")

regression_model = joblib.load(REGRESSION_MODEL)
classification_model = joblib.load(CLASSIFIER_MODEL)


# ---------------------------------------------------------
# Choose a parcel
# ---------------------------------------------------------

parcel_id = input("\nEnter parcel ID: ").strip()

parcel = df[df["parcel_id"] == parcel_id]

if parcel.empty:
    print("\nParcel not found.")
    print("Example:", df["parcel_id"].iloc[0])
    raise SystemExit


X = parcel[FEATURES]


# ---------------------------------------------------------
# Suitability score
# ---------------------------------------------------------

score = regression_model.predict(X)[0]

score = float(np.clip(score, 0, 100))


# ---------------------------------------------------------
# Suitability classification
# ---------------------------------------------------------

prediction = classification_model.predict(X)[0]

probabilities = classification_model.predict_proba(X)[0]

classes = classification_model.classes_

probability_table = sorted(
    zip(classes, probabilities),
    key=lambda x: x[1],
    reverse=True,
)


# ---------------------------------------------------------
# Confidence
# ---------------------------------------------------------

confidence_probability = float(max(probabilities))

if confidence_probability >= 0.80:
    confidence = "HIGH"

elif confidence_probability >= 0.60:
    confidence = "MEDIUM"

else:
    confidence = "LOW"


# ---------------------------------------------------------
# Display
# ---------------------------------------------------------

print("\n========================================")
print("BHUMI-X PARCEL PREDICTION")
print("========================================")

print(f"\nParcel ID       : {parcel_id}")
print(f"Suitability     : {score:.2f}/100")
print(f"Classification  : {prediction}")
print(
    f"Confidence      : {confidence} "
    f"({confidence_probability * 100:.1f}%)"
)


print("\nClass probabilities:")
print("--------------------------------")

for class_name, probability in probability_table:

    print(
        f"{class_name:20s}"
        f"{probability * 100:6.2f}%"
    )


print("\nActual dataset values:")
print("--------------------------------")

if "suitability_score" in parcel:
    print(
        f"Actual score    : "
        f"{parcel['suitability_score'].iloc[0]:.2f}"
    )

if "suitability_status" in parcel:
    print(
        f"Actual status   : "
        f"{parcel['suitability_status'].iloc[0]}"
    )


print("\n========================================")
print("PREDICTION COMPLETE")
print("========================================")