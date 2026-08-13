import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    classification_report,
)

DATA_PATH = "data/06_ml_master_dataset.csv"

# ============================================================
# 1. LOAD DATA
# ============================================================

print("Loading BHUMI-X dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")


# ============================================================
# 2. FEATURE SELECTION
# ============================================================

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

categorical_features = [
    "land_use",
    "flood_risk",
    "study_zone",
]

numeric_features = [
    feature
    for feature in features
    if feature not in categorical_features
]


# ============================================================
# 3. PREPROCESSING
# ============================================================

numeric_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False,
            ),
        ),
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", numeric_pipeline, numeric_features),
        ("categorical", categorical_pipeline, categorical_features),
    ]
)


# ============================================================
# 4. REGRESSION MODEL
# ============================================================

print("\n========================================")
print("TRAINING SUITABILITY REGRESSION MODEL")
print("========================================")

X = df[features]
y_score = df["suitability_score"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_score,
    test_size=0.20,
    random_state=42,
)


regression_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "model",
            RandomForestRegressor(
                n_estimators=300,
                max_depth=None,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1,
            ),
        ),
    ]
)

print("Training regression model...")

regression_model.fit(X_train, y_train)

predictions = regression_model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
rmse = mean_squared_error(
    y_test,
    predictions,
) ** 0.5
r2 = r2_score(y_test, predictions)

print("\nRegression Results:")
print(f"MAE  : {mae:.3f}")
print(f"RMSE : {rmse:.3f}")
print(f"R²   : {r2:.3f}")


# ============================================================
# 5. CLASSIFICATION MODEL
# ============================================================

print("\n========================================")
print("TRAINING SUITABILITY CLASSIFIER")
print("========================================")

y_status = df["suitability_status"]

X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
    X,
    y_status,
    test_size=0.20,
    random_state=42,
    stratify=y_status,
)


classification_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "model",
            RandomForestClassifier(
                n_estimators=300,
                max_depth=None,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1,
                class_weight="balanced",
            ),
        ),
    ]
)

print("Training classification model...")

classification_model.fit(
    X_train_c,
    y_train_c,
)

class_predictions = classification_model.predict(X_test_c)

accuracy = accuracy_score(
    y_test_c,
    class_predictions,
)

print("\nClassification Accuracy:")
print(f"{accuracy:.3f}")

print("\nClassification Report:")
print(
    classification_report(
        y_test_c,
        class_predictions,
    )
)


# ============================================================
# 6. SAVE MODELS
# ============================================================

print("\n========================================")
print("SAVING MODELS")
print("========================================")

import os

os.makedirs("models", exist_ok=True)

joblib.dump(
    regression_model,
    "models/bhumi_x_suitability_regression.joblib",
)

joblib.dump(
    classification_model,
    "models/bhumi_x_suitability_classifier.joblib",
)

print(
    "\nModels saved successfully:"
)

print(
    "models/bhumi_x_suitability_regression.joblib"
)

print(
    "models/bhumi_x_suitability_classifier.joblib"
)

print("\n========================================")
print("BHUMI-X ML TRAINING COMPLETE")
print("========================================")