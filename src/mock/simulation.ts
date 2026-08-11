import type { ImpactSimulationResult } from '../types';

export const mockImpactResult: ImpactSimulationResult = {
  parcel_id: 'A102',
  facility: 'school',
  population_radius: 3,
  metrics: [
    { label: 'Population Served', before: 18400, after: 31700, unit: 'people', improvement_pct: 72.3 },
    { label: 'Service Accessibility', before: 61, after: 84, unit: '%', improvement_pct: 37.7 },
    { label: 'Average Travel Distance', before: 4.2, after: 2.1, unit: 'km', improvement_pct: 50.0 }
  ],
  additional_population_served: 13300
};
