import pandas as pd
import joblib


# ============================================================
# BHUMI-X EXPLAINABLE PREDICTION
# ============================================================

DATA_PATH = "data/06_ml_master_dataset.csv"
MODEL_PATH = "models/bhumi_x_suitability_regression.joblib"


# ============================================================
# FEATURES USED BY THE MODEL
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
# LOAD DATA
# ============================================================

print("\nLoading BHUMI-X dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset loaded: {len(df)} parcels")


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

print("Loading trained regression model...")

pipeline = joblib.load(MODEL_PATH)

print("Model loaded successfully.")


# ============================================================
# ASK FOR PARCEL ID
# ============================================================

print("\n========================================")
print("BHUMI-X PARCEL EXPLAINABILITY")
print("========================================")

print("\nExample parcel ID:")
print(df["parcel_id"].iloc[0])

parcel_id = input("\nEnter parcel ID: ").strip()


# ============================================================
# FIND PARCEL
# ============================================================

parcel = df[df["parcel_id"] == parcel_id]


if parcel.empty:

    print("\n❌ Parcel not found.")

    print("\nSome available parcel IDs:")

    for pid in df["parcel_id"].head(10):
        print(" ", pid)

    raise SystemExit


# ============================================================
# PREPARE INPUT
# ============================================================

X = parcel[FEATURES]


# ============================================================
# GET MODEL COMPONENTS
# ============================================================

preprocessor = pipeline.named_steps["preprocessor"]

model = pipeline.named_steps["model"]


# ============================================================
# TRANSFORM DATA
# ============================================================

X_transformed = preprocessor.transform(X)

feature_names = preprocessor.get_feature_names_out()

values = X_transformed[0]

importances = model.feature_importances_


# ============================================================
# CREATE EXPLANATION TABLE
# ============================================================

explanations = []

for name, value, importance in zip(
    feature_names,
    values,
    importances
):

    explanations.append(
        {
            "feature": name,
            "value": float(value),
            "importance": float(importance),
        }
    )


explanation_df = pd.DataFrame(explanations)


# Sort by model importance

explanation_df = explanation_df.sort_values(
    by="importance",
    ascending=False
)


# ============================================================
# PREDICT SCORE
# ============================================================

predicted_score = pipeline.predict(X)[0]

predicted_score = max(
    0,
    min(100, predicted_score)
)


# ============================================================
# DISPLAY RESULT
# ============================================================

print("\n========================================")
print("BHUMI-X PREDICTION")
print("========================================")

print(f"\nParcel ID          : {parcel_id}")

print(f"Predicted Score    : {predicted_score:.2f}/100")


# ============================================================
# ACTUAL DATASET VALUE
# ============================================================

if "suitability_score" in parcel.columns:

    actual_score = parcel["suitability_score"].iloc[0]

    error = abs(
        predicted_score - actual_score
    )

    print(f"Dataset Score     : {actual_score:.2f}/100")

    print(f"Prediction Error   : {error:.2f} points")


# ============================================================
# TOP FEATURES
# ============================================================

print("\n========================================")
print("TOP MODEL FEATURES")
print("========================================")

for _, row in explanation_df.head(10).iterrows():

    print(
        f"{row['feature']:50s}"
        f" importance = {row['importance']:.4f}"
    )


# ============================================================
# RAW PARCEL INFORMATION
# ============================================================

print("\n========================================")
print("KEY PARCEL INFORMATION")
print("========================================")

important_columns = [
    "land_use",
    "area_sq_m",
    "population_500m",
    "population_1km",
    "population_density",
    "nearest_school_distance_m",
    "nearest_hospital_distance_m",
    "nearest_fire_station_distance_m",
    "infrastructure_score",
    "environmental_risk",
    "building_density_pct",
    "green_cover_pct",
    "open_space_pct",
    "wind_speed_ms",
    "utci_c",
    "heat_stress_pct",
    "daylight_availability_pct",
    "sky_view_factor_pct",
    "solar_radiation_kwh_m2",
    "distance_to_bmsit_km",
]

for column in important_columns:

    if column in parcel.columns:

        value = parcel[column].iloc[0]

        print(
            f"{column:40s}: {value}"
        )


# ============================================================
# COMPLETE
# ============================================================

print("\n========================================")
print("EXPLAINABILITY ANALYSIS COMPLETE")
print("========================================")