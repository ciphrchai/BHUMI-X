from fastapi import APIRouter


router = APIRouter(
    prefix="/api",
    tags=["Data Health"],
)


@router.get("/data-health")
def get_data_health():
    return {
        "total_parcels": 2,
        "valid_geometries": 2,
        "invalid_geometries": 0,
        "land_use_completeness": 100,
        "ownership_completeness": 100,
        "data_freshness": "2026-08-12",
        "environmental_data_available": True,
        "metrics": [
            {
                "label": "Parcel Records",
                "value": 2,
                "total": 2,
                "unit": "parcels",
                "status": "good",
            },
            {
                "label": "Valid Geometries",
                "value": 2,
                "total": 2,
                "unit": "parcels",
                "status": "good",
            },
            {
                "label": "Land Use Completeness",
                "value": 100,
                "unit": "%",
                "status": "good",
            },
            {
                "label": "Ownership Completeness",
                "value": 100,
                "unit": "%",
                "status": "good",
            },
            {
                "label": "Environmental Data",
                "value": 100,
                "unit": "%",
                "status": "good",
            },
        ],
    }