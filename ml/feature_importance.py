import pandas as pd
import joblib
import matplotlib.pyplot as plt

DATA_PATH = "data/06_ml_master_dataset.csv"
MODEL_PATH = "models/bhumi_x_suitability_regression.joblib"

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

print("Loading trained model...")
pipeline = joblib.load(MODEL_PATH)

# ------------------------------------------------------------
# Features used during training
# ------------------------------------------------------------

features = [
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

X = df[features]

# ------------------------------------------------------------
# Extract preprocessing + Random Forest
# ------------------------------------------------------------

preprocessor = pipeline.named_steps["preprocessor"]
model = pipeline.named_steps["model"]

# Transform the data exactly as the model sees it
X_transformed = preprocessor.transform(X)

# Get feature names after one-hot encoding
feature_names = preprocessor.get_feature_names_out()

# Random Forest feature importance
importances = model.feature_importances_

importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": importances
})

importance_df = importance_df.sort_values(
    by="importance",
    ascending=False
)

print("\n========================================")
print("TOP BHUMI-X MODEL FEATURES")
print("========================================")

print(
    importance_df.head(20).to_string(index=False)
)

# ------------------------------------------------------------
# Save results
# ------------------------------------------------------------

importance_df.to_csv(
    "models/feature_importance.csv",
    index=False
)

print("\nSaved:")
print("models/feature_importance.csv")

# ------------------------------------------------------------
# Plot top 15
# ------------------------------------------------------------

top = importance_df.head(15).sort_values(
    "importance"
)

plt.figure(figsize=(10, 7))

plt.barh(
    top["feature"],
    top["importance"]
)

plt.xlabel("Importance")
plt.ylabel("Feature")
plt.title("BHUMI-X Suitability Model — Top Feature Importance")

plt.tight_layout()

plt.savefig(
    "models/feature_importance.png",
    dpi=200
)

plt.show()

print("Saved:")
print("models/feature_importance.png")