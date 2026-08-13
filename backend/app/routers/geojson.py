from fastapi import APIRouter, HTTPException
from pathlib import Path
import csv


router = APIRouter(
    prefix="/api/parcels",
    tags=["Parcels"],
)


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

PARCEL_FILE = (
    PROJECT_ROOT
    / "ml"
    / "01_parcels.csv"
)


# ============================================================
# WKT → GEOJSON
# ============================================================

def wkt_to_geojson(wkt: str):

    if not wkt:
        return None

    wkt = wkt.strip()

    if not wkt.upper().startswith("POLYGON"):
        return None

    try:

        start = wkt.find("((")
        end = wkt.rfind("))")

        if start == -1 or end == -1:
            return None

        coordinate_text = wkt[start + 2:end]

        rings = []

        ring_strings = coordinate_text.split("),(")

        for ring_string in ring_strings:

            ring = []

            for point in ring_string.split(","):

                values = point.strip().split()

                if len(values) < 2:
                    continue

                longitude = float(values[0])
                latitude = float(values[1])

                ring.append([
                    longitude,
                    latitude,
                ])

            if ring:
                rings.append(ring)

        if not rings:
            return None

        return {
            "type": "Polygon",
            "coordinates": rings,
        }

    except Exception:
        return None


# ============================================================
# GET PARCEL GEOJSON
# ============================================================

@router.get("/geojson")
def get_parcels_geojson(
    region: str | None = None,
):

    # --------------------------------------------------------
    # Check dataset
    # --------------------------------------------------------

    if not PARCEL_FILE.exists():

        raise HTTPException(
            status_code=500,
            detail=(
                "Parcel GeoJSON dataset not found: "
                f"{PARCEL_FILE}"
            ),
        )


    features = []


    try:

        with open(
            PARCEL_FILE,
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                parcel_id = (
                    row.get("parcel_id", "")
                    .strip()
                )

                if not parcel_id:
                    continue


                # ------------------------------------------------
                # REGION FILTER
                # ------------------------------------------------

                if region:

                    location_values = [
                        row.get("study_zone", ""),
                        row.get("location", ""),
                    ]

                    location_text = " ".join(
                        location_values
                    ).lower()

                    if region.lower() not in location_text:
                        continue


                # ------------------------------------------------
                # WKT GEOMETRY
                # ------------------------------------------------

                geometry = wkt_to_geojson(
                    row.get("geometry_wkt", "")
                )


                # ------------------------------------------------
                # FALLBACK GEOMETRY
                # ------------------------------------------------

                if geometry is None:

                    try:

                        latitude = float(
                            row["latitude"]
                        )

                        longitude = float(
                            row["longitude"]
                        )

                        size = 0.00015

                        geometry = {
                            "type": "Polygon",
                            "coordinates": [[
                                [
                                    longitude - size,
                                    latitude - size,
                                ],
                                [
                                    longitude + size,
                                    latitude - size,
                                ],
                                [
                                    longitude + size,
                                    latitude + size,
                                ],
                                [
                                    longitude - size,
                                    latitude + size,
                                ],
                                [
                                    longitude - size,
                                    latitude - size,
                                ],
                            ]],
                        }

                    except Exception:
                        continue


                # ------------------------------------------------
                # PROPERTIES
                # ------------------------------------------------

                properties = dict(row)

                properties.pop(
                    "geometry_wkt",
                    None,
                )


                # ------------------------------------------------
                # FEATURE
                # ------------------------------------------------

                features.append({
                    "type": "Feature",
                    "id": parcel_id,
                    "geometry": geometry,
                    "properties": properties,
                })


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate GeoJSON: "
                f"{str(exc)}"
            ),
        )


    # ========================================================
    # GEOJSON RESPONSE
    # ========================================================

    return {
        "type": "FeatureCollection",
        "features": features,
    }