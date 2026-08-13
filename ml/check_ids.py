import pandas as pd

master = pd.read_csv("data/06_ml_master_dataset.csv")

print("\n===== MASTER DATASET =====")
print("Rows:", len(master))
print("Unique parcel IDs:", master["parcel_id"].nunique())
print("Duplicate parcel IDs:", master["parcel_id"].duplicated().sum())

print("\nMost repeated IDs:")
print(master["parcel_id"].value_counts().head(10))


try:
    parcels = pd.read_csv("data/01_parcels.csv")

    print("\n===== PARCEL DATASET =====")
    print("Rows:", len(parcels))
    print("Unique parcel IDs:", parcels["parcel_id"].nunique())
    print("Duplicate parcel IDs:", parcels["parcel_id"].duplicated().sum())

except FileNotFoundError:
    print("\n01_parcels.csv not found in data folder.")