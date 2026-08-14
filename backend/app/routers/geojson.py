from fastapi import APIRouter, HTTPException
from pathlib import Path
import csv
import hashlib
import math


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
# CREATE CADASTRAL-STYLE PARCEL POLYGON
# ============================================================

def create_parcel_polygon(
    parcel_id: str,
    index: int,
):
    """
    Creates deterministic synthetic cadastral-style
    parcel geometry for the BHUMI-X prototype.

    The master dataset does not contain actual polygon
    coordinates, so geometry is generated deterministically
    from the parcel ID.

    Features:
    - Irregular 5–6 sided parcels
    - Different parcel dimensions
    - Slight rotation
    - Slight positional variation
    - Compact spacing
    - Deterministic geometry
    """

    try:

        # ----------------------------------------------------
        # DETERMINISTIC HASH
        # ----------------------------------------------------

        digest = hashlib.md5(
            parcel_id.encode("utf-8")
        ).hexdigest()

        seed = int(
            digest[:12],
            16
        )


        # ----------------------------------------------------
        # GRID POSITION
        # ----------------------------------------------------

        grid_x = index % 100

        grid_y = (
            index // 100
        ) % 100


        # ----------------------------------------------------
        # PARCEL SPACING
        # ----------------------------------------------------

        # Smaller spacing makes parcels feel like
        # a connected cadastral fabric rather than
        # isolated floating shapes.

        spacing_x = 0.00105
        spacing_y = 0.00095


        longitude = (
            CENTER_LONGITUDE
            + (grid_x - 50)
            * spacing_x
        )

        latitude = (
            CENTER_LATITUDE
            + (grid_y - 50)
            * spacing_y
        )


        # ----------------------------------------------------
        # DETERMINISTIC RANDOM FUNCTION
        # ----------------------------------------------------

        def rnd(offset: int) -> float:

            value = math.sin(
                seed * 12.9898
                + offset * 78.233
            ) * 43758.5453

            return (
                value
                - math.floor(value)
            )


        # ----------------------------------------------------
        # PARCEL DIMENSIONS
        # ----------------------------------------------------

        width = (
            0.00070
            + rnd(1) * 0.00030
        )

        height = (
            0.00055
            + rnd(2) * 0.00028
        )


        # ----------------------------------------------------
        # SLIGHT POSITION VARIATION
        # ----------------------------------------------------

        longitude += (
            rnd(3) - 0.5
        ) * 0.00012

        latitude += (
            rnd(4) - 0.5
        ) * 0.00010


        # ----------------------------------------------------
        # SLIGHT ROTATION
        # ----------------------------------------------------

        angle = (
            rnd(5) - 0.5
        ) * 0.30

        cos_a = math.cos(angle)
        sin_a = math.sin(angle)


        # ----------------------------------------------------
        # LOCAL → GEOGRAPHIC COORDINATE
        # ----------------------------------------------------

        def point(
            x: float,
            y: float,
        ):

            rotated_x = (
                x * cos_a
                - y * sin_a
            )

            rotated_y = (
                x * sin_a
                + y * cos_a
            )

            return [
                longitude + rotated_x,
                latitude + rotated_y,
            ]


        # ----------------------------------------------------
        # SELECT PARCEL SHAPE
        # ----------------------------------------------------

        shape_type = seed % 4


        # ====================================================
        # SHAPE 1
        # ====================================================

        if shape_type == 0:

            points = [

                point(
                    -width * 0.48,
                    -height * 0.42,
                ),

                point(
                    width * 0.10,
                    -height * 0.52,
                ),

                point(
                    width * 0.52,
                    -height * 0.25,
                ),

                point(
                    width * 0.44,
                    height * 0.40,
                ),

                point(
                    -width * 0.12,
                    height * 0.52,
                ),

                point(
                    -width * 0.52,
                    height * 0.20,
                ),
            ]


        # ====================================================
        # SHAPE 2
        # ====================================================

        elif shape_type == 1:

            points = [

                point(
                    -width * 0.52,
                    -height * 0.30,
                ),

                point(
                    -width * 0.18,
                    -height * 0.52,
                ),

                point(
                    width * 0.48,
                    -height * 0.40,
                ),

                point(
                    width * 0.52,
                    height * 0.12,
                ),

                point(
                    width * 0.18,
                    height * 0.50,
                ),

                point(
                    -width * 0.45,
                    height * 0.38,
                ),
            ]


        # ====================================================
        # SHAPE 3
        # ====================================================

        elif shape_type == 2:

            points = [

                point(
                    -width * 0.50,
                    -height * 0.45,
                ),

                point(
                    width * 0.35,
                    -height * 0.48,
                ),

                point(
                    width * 0.53,
                    -height * 0.05,
                ),

                point(
                    width * 0.28,
                    height * 0.48,
                ),

                point(
                    -width * 0.35,
                    height * 0.50,
                ),

                point(
                    -width * 0.52,
                    height * 0.05,
                ),
            ]


        # ====================================================
        # SHAPE 4
        # ====================================================

        else:

            points = [

                point(
                    -width * 0.48,
                    -height * 0.40,
                ),

                point(
                    width * 0.05,
                    -height * 0.53,
                ),

                point(
                    width * 0.50,
                    -height * 0.15,
                ),

                point(
                    width * 0.42,
                    height * 0.45,
                ),

                point(
                    -width * 0.20,
                    height * 0.50,
                ),

                point(
                    -width * 0.52,
                    height * 0.10,
                ),
            ]


        # ----------------------------------------------------
        # CLOSE POLYGON
        # ----------------------------------------------------

        points.append(
            points[0]
        )


        # ----------------------------------------------------
        # RETURN GEOJSON GEOMETRY
        # ----------------------------------------------------

        return {

            "type": "Polygon",

            "coordinates": [
                points
            ],

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

        # ----------------------------------------------------
        # OPEN MASTER DATASET
        # ----------------------------------------------------

        with open(
            PARCEL_FILE,
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as file:

            reader = csv.DictReader(
                file
            )


            # ------------------------------------------------
            # PROCESS PARCELS
            # ------------------------------------------------

            for index, row in enumerate(
                reader
            ):

                # --------------------------------------------
                # PARCEL ID
                # --------------------------------------------

                parcel_id = (
                    row.get(
                        "parcel_id",
                        "",
                    )
                    .strip()
                )


                if not parcel_id:
                    continue


                # --------------------------------------------
                # REGION FILTER
                # --------------------------------------------

                if region:

                    study_zone = (
                        row.get(
                            "study_zone",
                            "",
                        )
                    )

                    land_use = (
                        row.get(
                            "land_use",
                            "",
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


                # --------------------------------------------
                # GENERATE GEOMETRY
                # --------------------------------------------

                geometry = (
                    create_parcel_polygon(
                        parcel_id,
                        index,
                    )
                )


                if geometry is None:
                    continue


                # --------------------------------------------
                # PROPERTIES
                # --------------------------------------------

                properties = dict(
                    row
                )


                # --------------------------------------------
                # GEOJSON FEATURE
                # --------------------------------------------

                feature = {

                    "type": "Feature",

                    "id": parcel_id,

                    "geometry": geometry,

                    "properties": properties,

                }


                features.append(
                    feature
                )


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