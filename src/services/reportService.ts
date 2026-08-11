import type { Report } from '../types';
import { mockReports } from '../mock';
import { delay, IS_MOCK_MODE, apiRequest } from './config';

export async function getReports(): Promise<Report[]> {
  if (IS_MOCK_MODE) {
    await delay(200);
    return mockReports;
  }
  return apiRequest<Report[]>('/api/reports');
}

export async function generateReport(analysisId: string): Promise<Report> {
  if (IS_MOCK_MODE) {
    await delay(500);
    return {
      report_id: `REP-${Math.floor(Math.random() * 1000)}`,
      analysis_id: analysisId,
      region: 'Yelahanka',
      facility: 'school',
      date: new Date().toISOString().split('T')[0],
      status: 'generating',
      top_parcel: 'A102',
      top_score: 95
    };
  }
  return apiRequest<Report>('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ analysis_id: analysisId }),
  });
}
