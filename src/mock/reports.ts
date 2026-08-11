import type { Report } from '../types';

export const mockReports: Report[] = [
  { report_id: 'REP-101', region: 'Yelahanka', facility: 'school', top_parcel: 'A102', top_score: 90, date: '2026-08-10', type: 'feasibility', author: 'Planning Dept' },
  { report_id: 'REP-102', region: 'Yelahanka', facility: 'school', top_parcel: 'A102', top_score: 90, date: '2026-08-05', type: 'impact', author: 'Health Dept' },
  { report_id: 'REP-103', region: 'Yelahanka', facility: 'school', top_parcel: 'A102', top_score: 90, date: '2026-07-28', type: 'survey', author: 'Fire Dept' },
  { report_id: 'REP-104', region: 'Yelahanka', facility: 'school', top_parcel: 'A102', top_score: 90, date: '2026-07-15', type: 'feasibility', author: 'Environment Dept' }
];
