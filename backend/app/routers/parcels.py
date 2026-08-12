from fastapi import APIRouter

router = APIRouter(
    prefix="/api/parcels",
    tags=["Parcels"],
)


# Temporary BHUMI-X parcel data
# We will replace this with database/GIS data later.
mock_parcels = [
    {
        "parcel_id": "A102",
        "area": 4200,
        "land_use": "vacant",
        "ownership": "government",
        "location": "Yelahanka",
        "suitability_status": "highly_suitable",
        "suitability_score": 91,
        "population_nearby": 12500,
        "distance_to_road": 180,
        "nearest_facility_distance": 2.8,
        "environmental_risk": "low",
    },
    {
        "parcel_id": "C221",
        "area": 3800,
        "land_use": "vacant",
        "ownership": "government",
        "location": "Yelahanka",
        "suitability_status": "suitable",
        "suitability_score": 88,
        "population_nearby": 10800,
        "distance_to_road": 240,
        "nearest_facility_distance": 3.2,
        "environmental_risk": "low",
    },
]


@router.get("")
def get_parcels(region: str | None = None):
    if region:
        return [
            parcel
            for parcel in mock_parcels
            if region.lower() in parcel["location"].lower()
        ]

    return mock_parcels


@router.get("/{parcel_id}")
def get_parcel(parcel_id: str):
    for parcel in mock_parcels:
        if parcel["parcel_id"] == parcel_id:
            return parcel

    return {
        "error": "Parcel not found"
    }