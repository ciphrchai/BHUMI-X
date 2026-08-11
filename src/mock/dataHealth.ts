import type { DataHealthReport } from '../types';

export const mockDataHealth: DataHealthReport = {
  total_parcels: 18421,
  valid_geometries: 17982,
  invalid_geometries: 439,
  land_use_completeness: 87,
  ownership_completeness: 91,
  data_freshness: '2023-10-15'
};
