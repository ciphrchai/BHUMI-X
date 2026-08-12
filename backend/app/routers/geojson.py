from fastapi import APIRouter

router = APIRouter(
    prefix="/api/parcels",
    tags=["Parcels"],
)


@router.get("/geojson")
def get_parcels_geojson():
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "A102",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [77.5960, 13.1000],
                        [77.5980, 13.1000],
                        [77.5980, 13.1020],
                        [77.5960, 13.1020],
                        [77.5960, 13.1000]
                    ]]
                },
                "properties": {
                    "parcel_id": "A102",
                    "area": 4200,
                    "land_use": "vacant",
                    "ownership": "government",
                    "location": "Yelahanka",
                    "suitability_status": "highly_suitable",
                    "suitability_score": 91
                }
            },
            {
                "type": "Feature",
                "id": "C221",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [77.6000, 13.0980],
                        [77.6020, 13.0980],
                        [77.6020, 13.1000],
                        [77.6000, 13.1000],
                        [77.6000, 13.0980]
                    ]]
                },
                "properties": {
                    "parcel_id": "C221",
                    "area": 3800,
                    "land_use": "vacant",
                    "ownership": "government",
                    "location": "Yelahanka",
                    "suitability_status": "suitable",
                    "suitability_score": 88
                }
            }
        ]
    }