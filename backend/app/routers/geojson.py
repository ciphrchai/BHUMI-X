from fastapi import APIRouter, HTTPException
from pathlib import Path
import csv

router = APIRouter(
    prefix="/api/parcels",
    tags=["Parcels"],
)


# ============================================================
# BHUMI-X DATASET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]

PARCEL_FILE = BASE_DIR / "ml" / "01_parcels.csv"


# ============================================================
# WKT POLYGON → GEOJSON
# ============================================================

def wkt_to_geojson(wkt: str):

    if not wkt:
        return None

    wkt = wkt.strip()

    if not wkt.upper().startswith("POLYGON"):
        return None

    try:

        # Example:
        # POLYGON ((77.5 13.1, 77.6 13.1, ...))

        start = wkt.find("((")
        end = wkt.rfind("))")

        if start == -1 or end == -1:
            return None

        coordinate_text = wkt[start + 2:end]

        rings = []

        # Handle polygon rings
        ring_strings = coordinate_text.split("),(")

        for ring_string in ring_strings:

            ring = []

            points = ring_string.split(",")

            for point in points:

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
    region: str | None = None
):

    # --------------------------------------------------------
    # Check dataset
    # --------------------------------------------------------

    if not PARCEL_FILE.exists():

        raise HTTPException(
            status_code=500,
            detail=(
                f"Parcel dataset not found: "
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

            # ------------------------------------------------
            # Read every parcel
            # ------------------------------------------------

            for row in reader:

                parcel_id = (
                    row.get("parcel_id", "")
                    .strip()
                )

                if not parcel_id:
                    continue


                # ------------------------------------------------
                # Region filter
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
                # Convert WKT geometry
                # ------------------------------------------------

                geometry = wkt_to_geojson(
                    row.get("geometry_wkt", "")
                )

                # ------------------------------------------------
                # Safety fallback
                #
                # If WKT is missing, use latitude/longitude
                # to create a tiny parcel polygon.
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
                # Properties
                # ------------------------------------------------

                properties = dict(row)

                # Geometry doesn't need to be duplicated
                properties.pop(
                    "geometry_wkt",
                    None
                )


                # ------------------------------------------------
                # GeoJSON Feature
                # ------------------------------------------------

                feature = {

                    "type": "Feature",

                    "id": parcel_id,

                    "geometry": geometry,

                    "properties": properties,

                }

                features.append(feature)


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to generate GeoJSON: "
                f"{str(exc)}"
            ),
        )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "type": "FeatureCollection",

        "features": features,

    }