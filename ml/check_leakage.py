import pandas as pd

DATA_PATH = "data/06_ml_master_dataset.csv"

df = pd.read_csv(DATA_PATH)

print("\n==============================")
print("BHUMI-X TARGET LEAKAGE CHECK")
print("==============================")

targets = [
    "suitability_score",
    "suitability_status",
    "risk_level",
    "confidence_level",
]

print("\nTarget/output candidates:")
for column in targets:
    if column in df.columns:
        print(f"✓ {column}")

print("\nCorrelation with suitability_score:")
print("--------------------------------")

numeric = df.select_dtypes(include="number")

if "suitability_score" in numeric.columns:

    corr = (
        numeric
        .corr()["suitability_score"]
        .drop("suitability_score")
        .sort_values(key=abs, ascending=False)
    )

    print(corr)

print("\nCategorical relationships:")
print("--------------------------------")

for column in ["risk_level", "confidence_level", "suitability_status"]:

    if column in df.columns:

        print(f"\n{column} vs suitability_status:")

        print(
            pd.crosstab(
                df[column],
                df["suitability_status"],
                normalize="index"
            ).round(3)
        )

print("\nPotential duplicate information:")

if "distance_to_bmsit_m" in df.columns and "distance_to_bmsit_km" in df.columns:

    difference = (
        df["distance_to_bmsit_m"] / 1000
        - df["distance_to_bmsit_km"]
    ).abs()

    print(
        "distance_to_bmsit_m vs distance_to_bmsit_km:",
        f"max difference = {difference.max():.6f}"
    )

print("\n==============================")
print("LEAKAGE CHECK COMPLETE")
print("==============================")