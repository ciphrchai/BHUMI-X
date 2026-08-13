from fastapi import APIRouter, HTTPException
from pathlib import Path
import csv
import hashlib


router = APIRouter(
    prefix="/api/parcels",
    tags=["Parcels"],
)


# ============================================================
# BHUMI-X MASTER DATASET
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

PARCEL_FILE = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "06_ml_master_dataset.csv"
)


# ============================================================
# BHUMI-X STUDY AREA CENTER
# ============================================================

# Yelahanka / BMSIT prototype study area
CENTER_LATITUDE = 13.1335
CENTER_LONGITUDE = 77.5650


# ============================================================
# CREATE DETERMINISTIC PARCEL POLYGON
# ============================================================

def create_parcel_polygon(parcel_id: str, index: int):

    """
    Creates a deterministic small polygon for prototype
    visualization when the master dataset does not contain
    explicit geometry coordinates.

    The same parcel_id always produces the same polygon.
    """

    try:

        # Create deterministic hash
        digest = hashlib.md5(
            parcel_id.encode("utf-8")
        ).hexdigest()

        number = int(
            digest[:12],
            16
        )

        # Spread parcels around the study area
        grid_x = index % 100
        grid_y = (index // 100) % 100

        # Small geographic spacing
        spacing = 0.0012

        longitude = (
            CENTER_LONGITUDE
            + (grid_x - 50) * spacing
        )

        latitude = (
            CENTER_LATITUDE
            + (grid_y - 50) * spacing
        )

        # Small parcel size
        size = 0.00035

        # Slight deterministic variation
        variation = (
            (number % 100) / 1000000
        )

        size += variation


        return {
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

        return None


# ============================================================
# GET PARCEL GEOJSON
# ============================================================

@router.get("/geojson")
def get_parcels_geojson(
    region: str | None = None,
):

    # --------------------------------------------------------
    # CHECK DATASET
    # --------------------------------------------------------

    if not PARCEL_FILE.exists():

        raise HTTPException(
            status_code=500,
            detail=(
                "BHUMI-X master dataset not found: "
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
            # READ PARCELS
            # ------------------------------------------------

            for index, row in enumerate(reader):

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

                    study_zone = (
                        row.get(
                            "study_zone",
                            ""
                        )
                    )

                    land_use = (
                        row.get(
                            "land_use",
                            ""
                        )
                    )

                    location_text = (
                        f"{study_zone} "
                        f"{land_use}"
                    ).lower()

                    if (
                        region.lower()
                        not in location_text
                    ):
                        continue


                # ------------------------------------------------
                # GEOMETRY
                # ------------------------------------------------

                geometry = (
                    create_parcel_polygon(
                        parcel_id,
                        index,
                    )
                )

                if geometry is None:
                    continue


                # ------------------------------------------------
                # PROPERTIES
                # ------------------------------------------------

                properties = dict(row)


                # ------------------------------------------------
                # GEOJSON FEATURE
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
                "Failed to generate parcel GeoJSON: "
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