import type {
  Parcel,
  GeoJSONFeatureCollection,
} from '../types';

import {
  mockParcels,
  parcelsGeoJSON,
} from '../mock';

import {
  apiRequest,
  delay,
  IS_MOCK_MODE,
} from './config';


// ============================================================
// GET ALL PARCELS
// ============================================================

export async function getParcels(
  region?: string
): Promise<Parcel[]> {

  if (IS_MOCK_MODE) {
    await delay(300);

    let result = [...mockParcels];

    if (region) {
      const normalizedRegion =
        region.toLowerCase();

      result = result.filter(
        (parcel) =>
          parcel.study_zone
            .toLowerCase()
            .includes(normalizedRegion) ||
          parcel.land_use
            .toLowerCase()
            .includes(normalizedRegion)
      );
    }

    return result;
  }

  const queryString = region
    ? `?region=${encodeURIComponent(region)}`
    : '';

  return apiRequest<Parcel[]>(
    `/api/parcels${queryString}`
  );
}


// ============================================================
// GET PARCEL BY ID
// ============================================================

export async function getParcelById(
  id: string
): Promise<Parcel | undefined> {

  if (IS_MOCK_MODE) {
    await delay(200);

    return mockParcels.find(
      (parcel) =>
        parcel.parcel_id === id
    );
  }

  return apiRequest<Parcel>(
    `/api/parcels/${encodeURIComponent(id)}`
  );
}


// ============================================================
// GET PARCEL GEOJSON
// ============================================================

export async function getParcelGeoJSON(
  region?: string
): Promise<GeoJSONFeatureCollection> {

  if (IS_MOCK_MODE) {
    await delay(200);

    return parcelsGeoJSON;
  }

  const queryString = region
    ? `?region=${encodeURIComponent(region)}`
    : '';

  return apiRequest<GeoJSONFeatureCollection>(
    `/api/parcels/geojson${queryString}`
  );
}