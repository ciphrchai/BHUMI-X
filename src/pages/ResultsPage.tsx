import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAnalysisStore } from '../stores';
import * as analysisService from '../services';

export function ResultsPage() {
  const navigate = useNavigate();
  const { selectedFacility: facility, selectedRegion: region } = useAnalysisStore() as any;
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we'd fetch actual results here
    const fetchResults = async () => {
      const data = await analysisService.getRecentAnalyses(); // Mock replacement
      // Generating some mock recommendations
      setResults([
        { rank: 1, id: 'P-8821', score: 94, popScore: 92, accScore: 89, envRisk: 'Low', area: 12500, rec: 'Highly Suitable' },
        { rank: 2, id: 'P-1142', score: 88, popScore: 85, accScore: 91, envRisk: 'Low', area: 8400, rec: 'Suitable' },
        { rank: 3, id: 'P-3392', score: 85, popScore: 88, accScore: 82, envRisk: 'Medium', area: 15200, rec: 'Suitable' },
        { rank: 4, id: 'P-9912', score: 79, popScore: 75, accScore: 80, envRisk: 'Low', area: 6200, rec: 'Marginal' },
        { rank: 5, id: 'P-4421', score: 72, popScore: 70, accScore: 75, envRisk: 'High', area: 18000, rec: 'Marginal' },
      ]);
    };
    fetchResults();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <PageHeader title="Analysis Results" />

      {/* Top summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Region</p><p className="font-semibold capitalize">{region || 'Yelahanka'}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Facility</p><p className="font-semibold capitalize">{facility || 'School'}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Parcels Analyzed</p><p className="font-semibold">1,842</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Suitable</p><p className="font-semibold text-blue-600">19</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Recommended</p><p className="font-semibold text-green-600">5</p></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b px-4 flex space-x-6">
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('map')}
          >
            Map View
          </button>
          <button 
            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'table' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('table')}
          >
            Table View
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'map' ? (
            <div className="flex flex-col md:flex-row gap-4 h-[600px]">
              <div className="flex-1 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center relative">
                <span className="text-gray-400 font-medium">[ MapLibre Integration Placeholder ]</span>
              </div>
              <div className="w-full md:w-80 overflow-y-auto space-y-3">
                <h3 className="font-semibold text-gray-900 mb-2 sticky top-0 bg-white py-1">Top Recommendations</h3>
                {results.map(r => (
                  <Card key={r.id} className="p-4 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate(`/parcel/${r.id}`)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400">#{r.rank}</span>
                        <span className="font-semibold text-blue-700">{r.id}</span>
                      </div>
                      <Badge variant={r.rec === 'Highly Suitable' ? 'success' : 'default'}>{r.rec}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Score</span>
                      <span className="font-bold text-gray-900">{r.score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${r.score}%` }}></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Parcel ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Suitability Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pop. Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acc. Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Env Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/parcel/${r.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{r.rank}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{r.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.popScore}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.accScore}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.envRisk}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.area.toLocaleString()} m²</td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge variant={r.rec === 'Highly Suitable' ? 'success' : 'default'}>{r.rec}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
