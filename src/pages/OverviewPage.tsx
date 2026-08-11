import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, BarChart3, CheckCircle, MapPin, Target, Layers, TreePine } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import * as analysisService from '../services';

export function OverviewPage() {
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await analysisService.getRecentAnalyses();
        setRecentAnalyses(data);
      } catch (error) {
        console.error('Failed to load recent analyses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Hero Section */}
      <div className="bg-white border-l-4 border-blue-800 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Land Intelligence</h1>
        <h2 className="text-xl text-gray-600 mb-4">From land data to better planning decisions.</h2>
        <p className="text-gray-700 max-w-3xl mb-6">
          Analyze land parcels, evaluate infrastructure suitability, understand spatial constraints, and generate evidence-based planning recommendations.
        </p>
        <div className="flex space-x-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/analysis')}>Start Analysis</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/explorer')}>Explore Land</Button>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-800"><Map size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Parcels</p><p className="text-2xl font-bold text-gray-900">18,421</p></div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-800"><BarChart3 size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Parcels Analyzed</p><p className="text-2xl font-bold text-gray-900">1,842</p></div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-800"><CheckCircle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Suitable Candidates</p><p className="text-2xl font-bold text-gray-900">19</p></div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-800"><MapPin size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Recommended Locations</p><p className="text-2xl font-bold text-gray-900">5</p></div>
        </Card>
      </div>

      {/* Capabilities Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Core Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <Target className="text-blue-800 mb-3" size={28} />
            <h4 className="font-semibold text-gray-900 mb-2">Infrastructure Planning</h4>
            <p className="text-sm text-gray-600">Identify suitable locations for public infrastructure</p>
          </Card>
          <Card className="p-5">
            <Layers className="text-blue-800 mb-3" size={28} />
            <h4 className="font-semibold text-gray-900 mb-2">Land Intelligence</h4>
            <p className="text-sm text-gray-600">Explore parcel-level land information</p>
          </Card>
          <Card className="p-5">
            <TreePine className="text-blue-800 mb-3" size={28} />
            <h4 className="font-semibold text-gray-900 mb-2">Environmental Screening</h4>
            <p className="text-sm text-gray-600">Identify potential environmental conflicts</p>
          </Card>
          <Card className="p-5">
            <BarChart3 className="text-blue-800 mb-3" size={28} />
            <h4 className="font-semibold text-gray-900 mb-2">Spatial Decision Support</h4>
            <p className="text-sm text-gray-600">Rank candidate parcels using multiple criteria</p>
          </Card>
        </div>
      </div>

      {/* Recent Analysis Table */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Analyses</h3>
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading analyses...</div>
          ) : recentAnalyses.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No recent analyses found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/results')}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{analysis.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analysis.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analysis.facility}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analysis.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><Badge variant={analysis.status === 'Completed' ? 'success' : 'default'}>{analysis.status}</Badge></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{analysis.topScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
