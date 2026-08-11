import type { DataHealthReport } from '../types';
import { mockDataHealth } from '../mock';
import { delay, IS_MOCK_MODE, apiRequest } from './config';

export async function getDataHealth(): Promise<DataHealthReport> {
  if (IS_MOCK_MODE) {
    await delay(300);
    return mockDataHealth;
  }
  return apiRequest<DataHealthReport>('/api/data-health');
}
