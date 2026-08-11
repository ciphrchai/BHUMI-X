import type { AnalysisResult, RecentAnalysis, AnalysisProgressStep } from '../types';

export const mockAnalysisResult: AnalysisResult = {
  analysis_id: 'ANL-001',
  facility: 'school',
  region: 'yelahanka',
  status: 'completed',
  total_parcels_analyzed: 1842,
  suitable_parcels: 19,
  recommendations: [
    {
      parcel_id: 'A102',
      overall_score: 91,
      confidence: 'high',
      recommendation: 'highly_suitable',
      risk_level: 'low',
      scores: { population_score: 94, accessibility_score: 89, land_suitability_score: 92, environment_score: 87, facility_gap_score: 96, infrastructure_score: 88 },
      reasons: ['High underserved population within 3 km radius', 'Adequate land area (18,420 m²) for school infrastructure', 'Good road accessibility (1.2 km to major road)', 'Compatible land-use classification (Institutional)', 'Low environmental conflict'],
      warnings: ['Minor drainage vulnerability in southwest corner', 'Road improvement may be required for bus access']
    },
    {
      parcel_id: 'C221',
      overall_score: 88,
      confidence: 'high',
      recommendation: 'suitable',
      risk_level: 'low',
      scores: { population_score: 90, accessibility_score: 86, land_suitability_score: 88, environment_score: 85, facility_gap_score: 92, infrastructure_score: 87 },
      reasons: ['Significant population demand in service area', 'Vacant land reduces development complexity', 'Government ownership simplifies acquisition', 'Adequate area for facility requirements'],
      warnings: ['Requires utility infrastructure extension']
    },
    {
      parcel_id: 'D441',
      overall_score: 84,
      confidence: 'medium',
      recommendation: 'suitable',
      risk_level: 'low',
      scores: { population_score: 86, accessibility_score: 82, land_suitability_score: 85, environment_score: 83, facility_gap_score: 88, infrastructure_score: 80 },
      reasons: ['Moderate population demand', 'Compatible land-use zoning', 'Government-owned parcel'],
      warnings: ['Distance to public transport may affect accessibility', 'Partial soil assessment pending']
    },
    {
      parcel_id: 'B305',
      overall_score: 82,
      confidence: 'medium',
      recommendation: 'suitable',
      risk_level: 'medium',
      scores: { population_score: 84, accessibility_score: 88, land_suitability_score: 80, environment_score: 78, facility_gap_score: 82, infrastructure_score: 80 },
      reasons: ['Good road connectivity', 'Vacant land available', 'Reasonable population coverage'],
      warnings: ['Medium environmental risk requires further assessment', 'Seasonal waterlogging reported in vicinity']
    },
    {
      parcel_id: 'A207',
      overall_score: 80,
      confidence: 'medium',
      recommendation: 'moderate',
      risk_level: 'low',
      scores: { population_score: 82, accessibility_score: 76, land_suitability_score: 82, environment_score: 80, facility_gap_score: 78, infrastructure_score: 82 },
      reasons: ['Mixed-use area with development potential', 'Government ownership confirmed', 'Moderate population served'],
      warnings: ['Mixed land-use may require re-zoning approval', 'Higher distance to major road']
    }
  ]
};

export const recentAnalyses: RecentAnalysis[] = [
  { analysis_id: 'ANL-001', region: 'Yelahanka', facility: 'school', date: 'Today', status: 'completed', top_score: 91 },
  { analysis_id: 'ANL-002', region: 'Yelahanka', facility: 'hospital', date: 'Yesterday', status: 'completed', top_score: 87 },
  { analysis_id: 'ANL-003', region: 'Whitefield', facility: 'fire_station', date: '2 days ago', status: 'completed', top_score: 78 },
  { analysis_id: 'ANL-004', region: 'Yelahanka', facility: 'police_station', date: '3 days ago', status: 'processing', top_score: 0 }
];

export const analysisProgressSteps: AnalysisProgressStep[] = [
  { label: 'Loading land parcels', status: 'completed' },
  { label: 'Applying land constraints', status: 'completed' },
  { label: 'Evaluating accessibility', status: 'completed' },
  { label: 'Evaluating population demand', status: 'active' },
  { label: 'Screening environmental factors', status: 'pending' },
  { label: 'Ranking candidate parcels', status: 'pending' }
];
