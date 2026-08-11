import type { AnalysisRequest, AnalysisResult, RecentAnalysis } from '../types';
import { mockAnalysisResult, recentAnalyses } from '../mock';
import { delay, IS_MOCK_MODE, apiRequest } from './config';

export async function submitAnalysis(request: AnalysisRequest): Promise<{ analysis_id: string }> {
  if (IS_MOCK_MODE) {
    await delay(500);
    return { analysis_id: 'ANL-001' };
  }
  return apiRequest<{ analysis_id: string }>('/api/analysis', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getAnalysisResult(id: string): Promise<AnalysisResult> {
  if (IS_MOCK_MODE) {
    await delay(300);
    return mockAnalysisResult;
  }
  return apiRequest<AnalysisResult>(`/api/analysis/${id}`);
}

export async function getRecentAnalyses(): Promise<RecentAnalysis[]> {
  if (IS_MOCK_MODE) {
    await delay(200);
    return recentAnalyses;
  }
  return apiRequest<RecentAnalysis[]>('/api/analysis/recent');
}
