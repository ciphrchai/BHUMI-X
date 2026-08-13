import pandas as pd
import joblib


# ============================================================
# BHUMI-X LOCAL EXPLANATION ENGINE
# ============================================================

DATA_PATH = "data/06_ml_master_dataset.csv"
MODEL_PATH = "models/bhumi_x_suitability_regression.joblib"


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
# LOAD DATA + MODEL
# ============================================================

print("\nLoading BHUMI-X dataset...")

df = pd.read_csv(DATA_PATH)

print("Loading trained model...")

pipeline = joblib.load(MODEL_PATH)

print("Ready.")


# ============================================================
# SELECT PARCEL
# ============================================================

print("\n========================================")
print("BHUMI-X LOCAL AI EXPLANATION")
print("========================================")

parcel_id = input("\nEnter parcel ID: ").strip()

parcel = df[df["parcel_id"] == parcel_id]

if parcel.empty:
    print("\nParcel not found.")
    raise SystemExit


# ============================================================
# PREDICTION
# ============================================================

X = parcel[FEATURES]

predicted_score = pipeline.predict(X)[0]

predicted_score = max(
    0,
    min(100, predicted_score)
)


# ============================================================
# GLOBAL MODEL IMPORTANCE
# ============================================================

preprocessor = pipeline.named_steps["preprocessor"]
model = pipeline.named_steps["model"]

feature_names = preprocessor.get_feature_names_out()

importances = model.feature_importances_

importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": importances
})

importance_df = importance_df.sort_values(
    "importance",
    ascending=False
)


# ============================================================
# DATASET MEDIANS
# Used to understand whether this parcel is relatively
# strong or weak for important numerical factors.
# ============================================================

numeric_features = [
    feature
    for feature in FEATURES
    if feature not in [
        "land_use",
        "flood_risk",
        "study_zone"
    ]
]

medians = df[numeric_features].median()


# ============================================================
# HUMAN-READABLE EXPLANATION RULES
# ============================================================

positive = []
warnings = []


def add_positive(text):
    if text not in positive:
        positive.append(text)


def add_warning(text):
    if text not in warnings:
        warnings.append(text)


# ------------------------------------------------------------
# POPULATION
# ------------------------------------------------------------

population_1km = parcel["population_1km"].iloc[0]

if population_1km >= df["population_1km"].quantile(0.75):
    add_positive(
        f"Strong population coverage within 1 km ({population_1km:.0f})"
    )
elif population_1km <= df["population_1km"].quantile(0.25):
    add_warning(
        f"Lower population coverage within 1 km ({population_1km:.0f})"
    )


# ------------------------------------------------------------
# HOSPITAL
# ------------------------------------------------------------

hospital = parcel["nearest_hospital_distance_m"].iloc[0]

if hospital <= 1000:
    add_positive(
        f"Good hospital accessibility ({hospital:.0f} m)"
    )
elif hospital >= 2000:
    add_warning(
        f"Hospital is relatively distant ({hospital:.0f} m)"
    )


# ------------------------------------------------------------
# SCHOOL
# ------------------------------------------------------------

school = parcel["nearest_school_distance_m"].iloc[0]

if school <= 500:
    add_positive(
        f"Good school accessibility ({school:.0f} m)"
    )
elif school >= 1500:
    add_warning(
        f"School accessibility could be improved ({school:.0f} m)"
    )


# ------------------------------------------------------------
# INFRASTRUCTURE
# ------------------------------------------------------------

infrastructure = parcel["infrastructure_score"].iloc[0]

if infrastructure >= 65:
    add_positive(
        f"Strong infrastructure score ({infrastructure:.1f}/100)"
    )
elif infrastructure <= 35:
    add_warning(
        f"Low infrastructure score ({infrastructure:.1f}/100)"
    )


# ------------------------------------------------------------
# ENVIRONMENTAL RISK
# ------------------------------------------------------------

environmental_risk = parcel["environmental_risk"].iloc[0]

if environmental_risk <= 20:
    add_positive(
        f"Low environmental risk ({environmental_risk:.1f})"
    )
elif environmental_risk >= 40:
    add_warning(
        f"Elevated environmental risk ({environmental_risk:.1f})"
    )


# ------------------------------------------------------------
# HEAT STRESS
# ------------------------------------------------------------

heat = parcel["heat_stress_pct"].iloc[0]

if heat <= 5:
    add_positive(
        f"Low heat-stress exposure ({heat:.1f}%)"
    )
elif heat >= 20:
    add_warning(
        f"Elevated heat-stress exposure ({heat:.1f}%)"
    )


# ------------------------------------------------------------
# GREEN COVER
# ------------------------------------------------------------

green = parcel["green_cover_pct"].iloc[0]

if green >= 30:
    add_positive(
        f"Good green coverage ({green:.1f}%)"
    )
elif green <= 10:
    add_warning(
        f"Limited green coverage ({green:.1f}%)"
    )


# ------------------------------------------------------------
# OPEN SPACE
# ------------------------------------------------------------

open_space = parcel["open_space_pct"].iloc[0]

if open_space >= 60:
    add_positive(
        f"Good open-space availability ({open_space:.1f}%)"
    )
elif open_space <= 25:
    add_warning(
        f"Limited open-space availability ({open_space:.1f}%)"
    )


# ------------------------------------------------------------
# BUILDING DENSITY
# ------------------------------------------------------------

building_density = parcel["building_density_pct"].iloc[0]

if building_density <= 30:
    add_positive(
        f"Moderate building density ({building_density:.1f}%)"
    )
elif building_density >= 70:
    add_warning(
        f"High building density ({building_density:.1f}%)"
    )


# ------------------------------------------------------------
# DAYLIGHT
# ------------------------------------------------------------

daylight = parcel["daylight_availability_pct"].iloc[0]

if daylight >= 70:
    add_positive(
        f"Good daylight availability ({daylight:.1f}%)"
    )
elif daylight <= 40:
    add_warning(
        f"Lower daylight availability ({daylight:.1f}%)"
    )


# ------------------------------------------------------------
# WIND COMFORT
# ------------------------------------------------------------

wind_comfort = parcel["pedestrian_wind_comfort_pct"].iloc[0]

if wind_comfort >= 90:
    add_positive(
        f"Good pedestrian wind comfort ({wind_comfort:.1f}%)"
    )
elif wind_comfort <= 70:
    add_warning(
        f"Lower pedestrian wind comfort ({wind_comfort:.1f}%)"
    )


# ============================================================
# RESULT
# ============================================================

print("\n========================================")
print("BHUMI-X AI ASSESSMENT")
print("========================================")

print(f"\nParcel ID       : {parcel_id}")
print(f"Suitability     : {predicted_score:.2f}/100")


# ============================================================
# CLASSIFICATION
# ============================================================

if predicted_score >= 80:
    classification = "HIGHLY SUITABLE"
elif predicted_score >= 60:
    classification = "SUITABLE"
elif predicted_score >= 40:
    classification = "MODERATE"
else:
    classification = "UNSUITABLE"


print(f"Classification  : {classification}")


# ============================================================
# POSITIVE FACTORS
# ============================================================

print("\n========================================")
print("POSITIVE FACTORS")
print("========================================")

if positive:

    for item in positive[:6]:
        print(f"✓ {item}")

else:
    print("No major positive factors identified.")


# ============================================================
# WARNINGS
# ============================================================

print("\n========================================")
print("AREAS TO WATCH")
print("========================================")

if warnings:

    for item in warnings[:6]:
        print(f"⚠ {item}")

else:
    print("No major concerns identified.")


# ============================================================
# TOP GLOBAL MODEL FEATURES
# ============================================================

print("\n========================================")
print("MODEL'S KEY PREDICTIVE FEATURES")
print("========================================")

for _, row in importance_df.head(8).iterrows():

    print(
        f"{row['feature']:45s}"
        f" {row['importance']:.4f}"
    )


# ============================================================
# COMPLETE
# ============================================================

print("\n========================================")
print("LOCAL EXPLANATION COMPLETE")
print("========================================")