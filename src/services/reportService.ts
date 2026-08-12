import type { Report } from '../types';
import { mockReports } from '../mock';
import { delay, IS_MOCK_MODE, apiRequest } from './config';

const GENERATED_REPORTS_KEY = 'bhumi-x-generated-reports';

function getStoredReports(): Report[] {
  try {
    const stored = localStorage.getItem(GENERATED_REPORTS_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read stored reports:', error);
    return [];
  }
}

function saveStoredReports(reports: Report[]) {
  try {
    localStorage.setItem(
      GENERATED_REPORTS_KEY,
      JSON.stringify(reports)
    );
  } catch (error) {
    console.error('Failed to save reports:', error);
  }
}

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function getReports(): Promise<Report[]> {
  if (IS_MOCK_MODE) {
    await delay(200);

    const generatedReports = getStoredReports();

    /*
     * Newly generated reports are shown first.
     * Existing mock reports remain available underneath.
     */
    return [...generatedReports, ...mockReports];
  }

  return apiRequest<Report[]>('/api/reports');
}

export async function generateReport(
  analysisId: string
): Promise<Report> {
  if (IS_MOCK_MODE) {
    await delay(500);

    const newReport: Report = {
      report_id: `REP-${Date.now()}`,
      analysis_id: analysisId,
      region: 'Yelahanka',
      facility: 'school',
      date: getTodayDate(),
      status: 'completed',
      top_parcel: 'A102',
      top_score: 91,
    };

    const existingGeneratedReports = getStoredReports();

    saveStoredReports([
      newReport,
      ...existingGeneratedReports,
    ]);

    return newReport;
  }

  return apiRequest<Report>('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({
      analysis_id: analysisId,
    }),
  });
}