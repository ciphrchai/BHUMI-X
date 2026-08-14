import type {
  Parcel,
  GeoJSONFeatureCollection,
} from '../types';

// ============================================================
// DETERMINISTIC RANDOM
// ============================================================
// We use the parcel index as a seed so geometry does NOT change
// every time the page reloads.
// ============================================================

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ============================================================
// CREATE REALISTIC IRREGULAR PARCEL
// ============================================================

function createIrregularParcel(
  lng: number,
  lat: number,
  seed: number
) {
  const vertexCount = 6;

  const points: [number, number][] = [];

  /*
   * Base dimensions.
   *
   * These are deliberately not equal so parcels don't look
   * like perfect squares.
   */
  const width =
    0.00065 +
    seededRandom(seed + 1) * 0.00075;

  const height =
    0.00045 +
    seededRandom(seed + 2) * 0.00090;

  /*
   * Slight rotation.
   */
  const rotation =
    (seededRandom(seed + 3) - 0.5) *
    0.45;

  for (let i = 0; i < vertexCount; i++) {

    const angle =
      (Math.PI * 2 * i) /
        vertexCount +
      rotation;

    /*
     * Different radius for every vertex.
     *
     * This creates natural-looking irregular boundaries.
     */
    const radiusX =
      0.78 +
      seededRandom(seed + 10 + i) *
        0.40;

    const radiusY =
      0.78 +
      seededRandom(seed + 20 + i) *
        0.40;

    const x =
      lng +
      Math.cos(angle) *
        width *
        radiusX;

    const y =
      lat +
      Math.sin(angle) *
        height *
        radiusY;

    points.push([x, y]);
  }

  /*
   * Close polygon.
   */
  points.push(points[0]);

  return {
    type: 'Polygon' as const,
    coordinates: [points],
  };
}

// ============================================================
// MOCK PARCEL DATA
// ============================================================

export const mockParcels: Parcel[] = [

  // ==========================================================
  // IMPORTANT DEMO PARCELS
  // ==========================================================

  {
    location: 'Yelahanka, Bengaluru',

    parcel_id: 'A102',

    area: 18420,

    land_use: 'institutional',

    ownership: 'government',

    suitability_status: 'highly_suitable',

    suitability_score: 91,

    population_nearby: 31240,

    distance_to_road: 1.2,

    environmental_risk: 'low',

    geometry: createIrregularParcel(
      77.5947,
      13.1027,
      102
    ),
  },

  {
    location: 'Yelahanka, Bengaluru',

    parcel_id: 'C221',

    area: 12800,

    land_use: 'vacant',

    ownership: 'government',

    suitability_status: 'suitable',

    suitability_score: 88,

    population_nearby: 28100,

    distance_to_road: 0.8,

    environmental_risk: 'low',

    geometry: createIrregularParcel(
      77.5987,
      13.0997,
      221
    ),
  },

  {
    location: 'Yelahanka, Bengaluru',

    parcel_id: 'D441',

    area: 22100,

    land_use: 'institutional',

    ownership: 'government',

    suitability_status: 'suitable',

    suitability_score: 84,

    population_nearby: 24500,

    distance_to_road: 1.5,

    environmental_risk: 'low',

    geometry: createIrregularParcel(
      77.6030,
      13.1060,
      441
    ),
  },

  {
    location: 'Yelahanka, Bengaluru',

    parcel_id: 'B305',

    area: 15600,

    land_use: 'vacant',

    ownership: 'government',

    suitability_status: 'suitable',

    suitability_score: 82,

    population_nearby: 19800,

    distance_to_road: 0.6,

    environmental_risk: 'medium',

    geometry: createIrregularParcel(
      77.5907,
      13.1007,
      305
    ),
  },

  {
    location: 'Yelahanka, Bengaluru',

    parcel_id: 'A207',

    area: 9800,

    land_use: 'mixed',

    ownership: 'government',

    suitability_status: 'moderate',

    suitability_score: 80,

    population_nearby: 22300,

    distance_to_road: 2.1,

    environmental_risk: 'low',

    geometry: createIrregularParcel(
      77.5955,
      13.1085,
      207
    ),
  },

  // ==========================================================
  // GENERATED PARCELS
  // ==========================================================

  ...Array.from({ length: 25 }).map(
    (_, i) => {

      const baselng =
        77.58 +
        seededRandom(i + 100) *
          0.04;

      const baselat =
        13.09 +
        seededRandom(i + 200) *
          0.03;

      const landUses = [
        'residential',
        'commercial',
        'industrial',
        'vacant',
        'agricultural',
        'mixed',
      ];

      const ownershipTypes = [
        'government',
        'private',
        'unknown',
      ];

      const suitabilityTypes = [
        'unsuitable',
        'restricted',
        'moderate',
        'unknown',
      ];

      const environmentalRisks = [
        'low',
        'medium',
        'high',
      ];

      return {
        location:
          'Yelahanka, Bengaluru',

        parcel_id:
          `M${100 + i}`,

        area:
          Math.floor(
            seededRandom(i + 300) *
              48000
          ) + 2000,

        land_use:
          landUses[
            Math.floor(
              seededRandom(i + 400) *
                landUses.length
            )
          ] as any,

        ownership:
          ownershipTypes[
            Math.floor(
              seededRandom(i + 500) *
                ownershipTypes.length
            )
          ] as any,

        suitability_status:
          suitabilityTypes[
            Math.floor(
              seededRandom(i + 600) *
                suitabilityTypes.length
            )
          ] as any,

        suitability_score:
          Math.floor(
            seededRandom(i + 700) *
              60
          ) + 10,

        population_nearby:
          Math.floor(
            seededRandom(i + 800) *
              30000
          ) + 1000,

        distance_to_road:
          Number(
            (
              seededRandom(i + 900) *
              5
            ).toFixed(1)
          ),

        environmental_risk:
          environmentalRisks[
            Math.floor(
              seededRandom(i + 1000) *
                environmentalRisks.length
            )
          ] as any,

        geometry:
          createIrregularParcel(
            baselng,
            baselat,
            i + 1000
          ),
      };
    }
  ),
];

// ============================================================
// GEOJSON
// ============================================================

export const parcelsGeoJSON:
  GeoJSONFeatureCollection = {

  type: 'FeatureCollection',

  features: mockParcels.map(
    (parcel) => ({

      type: 'Feature' as const,

      id: parcel.parcel_id,

      geometry: parcel.geometry,

      properties: {

        location:
          parcel.location,

        parcel_id:
          parcel.parcel_id,

        area:
          parcel.area,

        land_use:
          parcel.land_use,

        ownership:
          parcel.ownership,

        suitability_status:
          parcel.suitability_status,

        suitability_score:
          parcel.suitability_score,

        population_nearby:
          parcel.population_nearby,

        distance_to_road:
          parcel.distance_to_road,

        environmental_risk:
          parcel.environmental_risk,
      },
    })
  ),
};