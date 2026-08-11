import type { Parcel, GeoJSONFeatureCollection } from '../types';
import { mockParcels, parcelsGeoJSON } from '../mock';
import { apiRequest, delay, IS_MOCK_MODE } from './config';

export async function getParcels(region?: string): Promise<Parcel[]> {
  if (IS_MOCK_MODE) {
    await delay(300);
    let result = [...mockParcels];
    if (region) {
      result = result.filter(p => p.location.includes(region));
    }
    return result;
  }
  const queryString = region ? `?region=${encodeURIComponent(region)}` : '';
  return apiRequest<Parcel[]>(`/api/parcels${queryString}`);
}

export async function getParcelById(id: string): Promise<Parcel | undefined> {
  if (IS_MOCK_MODE) {
    await delay(200);
    return mockParcels.find(p => p.parcel_id === id);
  }
  return apiRequest<Parcel>(`/api/parcels/${id}`);
}

export async function getParcelGeoJSON(region?: string): Promise<GeoJSONFeatureCollection> {
  if (IS_MOCK_MODE) {
    await delay(200);
    return parcelsGeoJSON;
  }
  const queryString = region ? `?region=${encodeURIComponent(region)}` : '';
  return apiRequest<GeoJSONFeatureCollection>(`/api/parcels/geojson${queryString}`);
}
