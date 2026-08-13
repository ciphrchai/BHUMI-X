import type {
  FacilityType,
  ImpactSimulationResult,
} from '../types';

import { apiRequest } from './config';

export async function simulateImpact(
  parcelId: string,
  facility: FacilityType,
  radius: number
): Promise<ImpactSimulationResult> {
  return apiRequest<ImpactSimulationResult>(
    '/api/simulation/impact',
    {
      method: 'POST',
      body: JSON.stringify({
        parcel_id: parcelId,
        facility_type: facility,
        radius,
      }),
    }
  );
}