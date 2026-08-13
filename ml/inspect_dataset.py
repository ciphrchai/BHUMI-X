import pandas as pd

DATA_PATH = "data/06_ml_master_dataset.csv"

print("Loading BHUMI-X dataset...")

df = pd.read_csv(DATA_PATH)

print("\n==============================")
print("BHUMI-X DATASET INSPECTION")
print("==============================")

print("\nDataset shape:")
print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")

print("\nColumns:")
for i, column in enumerate(df.columns, 1):
    print(f"{i}. {column}")

print("\nData types:")
print(df.dtypes)

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:")
print(df.duplicated().sum())

print("\nCategorical columns:")
for column in df.select_dtypes(include="object").columns:
    print(f"\n{column}")
    print(df[column].value_counts().head(20))

print("\nNumerical summary:")
print(df.describe().T)

if "suitability_score" in df.columns:
    print("\n==============================")
    print("SUITABILITY SCORE")
    print("==============================")
    print(df["suitability_score"].describe())

if "suitability_status" in df.columns:
    print("\n==============================")
    print("SUITABILITY CLASSES")
    print("==============================")

    print(df["suitability_status"].value_counts())

    print("\nPercentages:")
    print(
        df["suitability_status"]
        .value_counts(normalize=True)
        .mul(100)
        .round(2)
    )

if "risk_level" in df.columns:
    print("\n==============================")
    print("RISK LEVEL")
    print("==============================")
    print(df["risk_level"].value_counts())

if "confidence_level" in df.columns:
    print("\n==============================")
    print("CONFIDENCE LEVEL")
    print("==============================")
    print(df["confidence_level"].value_counts())

print("\n==============================")
print("NUMERICAL CORRELATION")
print("==============================")

numeric_df = df.select_dtypes(include="number")

if "suitability_score" in numeric_df.columns:
    correlations = (
        numeric_df
        .corr()["suitability_score"]
        .sort_values(ascending=False)
    )

    print(correlations)

print("\n==============================")
print("SAMPLE DATA")
print("==============================")

print(df.head(5).to_string())

print("\n==============================")
print("INSPECTION COMPLETE")
print("==============================")