import type { FacilityType, ImpactSimulationResult } from '../types';
import { mockImpactResult } from '../mock';
import { delay, IS_MOCK_MODE, apiRequest } from './config';

export async function simulateImpact(parcelId: string, facility: FacilityType, radius: number): Promise<ImpactSimulationResult> {
  if (IS_MOCK_MODE) {
    await delay(800);
    return {
      ...mockImpactResult,
      parcel_id: parcelId,
      facility: facility,
    };
  }
  return apiRequest<ImpactSimulationResult>('/api/simulation/impact', {
    method: 'POST',
    body: JSON.stringify({ parcel_id: parcelId, facility_type: facility, radius }),
  });
}
