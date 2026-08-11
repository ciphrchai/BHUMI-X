import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import * as parcelService from '../services';

export function ParcelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [parcel, setParcel] = useState<any>(null);

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const data = await parcelService.getParcelById(id || '');
        setParcel(data || { id, score: 91, rec: 'HIGHLY SUITABLE' });
      } catch (e) {
        setParcel({ id, score: 91, rec: 'HIGHLY SUITABLE' });
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading parcel data...</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500 mb-1 cursor-pointer" onClick={() => navigate('/results')}>Overview &gt; Results &gt; <span className="text-gray-900 font-medium">Parcel {id}</span></div>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">Parcel {id}</h1>
            <Badge variant="success">HIGHLY SUITABLE</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="success">High Confidence</Badge>
          <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-700">{parcel?.score || 91} <span className="text-sm text-gray-400 font-normal">/ 100</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Parcel Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div><p className="text-sm text-gray-500">Area</p><p className="font-medium">18,420 m²</p></div>
              <div><p className="text-sm text-gray-500">Ownership</p><p className="font-medium">Government</p></div>
              <div><p className="text-sm text-gray-500">Land Use</p><p className="font-medium">Institutional</p></div>
              <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">Yelahanka, Bengaluru</p></div>
              <div><p className="text-sm text-gray-500">Population Nearby</p><p className="font-medium">31,240</p></div>
              <div><p className="text-sm text-gray-500">Distance to Road</p><p className="font-medium">1.2 km</p></div>
              <div><p className="text-sm text-gray-500">Nearest School</p><p className="font-medium">3.8 km</p></div>
              <div><p className="text-sm text-gray-500">Environmental Risk</p><Badge variant="success">Low</Badge></div>
              <div><p className="text-sm text-gray-500">Data Freshness</p><p className="font-medium text-xs mt-1">Updated 2 weeks ago</p></div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Score Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Population Demand', score: 94 },
                { label: 'Accessibility', score: 89 },
                { label: 'Land Suitability', score: 92 },
                { label: 'Environmental Safety', score: 87 },
                { label: 'Facility Gap', score: 96 },
                { label: 'Infrastructure Proximity', score: 88 }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium">{item.score}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Reasoning & Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Why this parcel?</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-gray-700"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={18} /> High underserved population within 3 km radius</li>
              <li className="flex items-start text-sm text-gray-700"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={18} /> Adequate land area for school infrastructure</li>
              <li className="flex items-start text-sm text-gray-700"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={18} /> Good road accessibility</li>
              <li className="flex items-start text-sm text-gray-700"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={18} /> Compatible land-use classification</li>
              <li className="flex items-start text-sm text-gray-700"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={18} /> Low environmental conflict</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Potential Risks</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-gray-700"><AlertTriangle className="text-amber-500 mr-2 shrink-0" size={18} /> Minor drainage vulnerability in southwest corner</li>
              <li className="flex items-start text-sm text-gray-700"><AlertTriangle className="text-amber-500 mr-2 shrink-0" size={18} /> Road improvement may be required for bus access</li>
            </ul>
          </Card>

          <Card className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Data Confidence</h3>
              <Badge variant="success">High Confidence</Badge>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center"><Check className="text-gray-400 mr-2" size={14} /> Geometry valid</li>
              <li className="flex items-center"><Check className="text-gray-400 mr-2" size={14} /> Land-use data available</li>
              <li className="flex items-center"><Check className="text-gray-400 mr-2" size={14} /> Ownership information available</li>
              <li className="flex items-center"><Check className="text-gray-400 mr-2" size={14} /> Environmental layer available</li>
              <li className="flex items-center"><Check className="text-gray-400 mr-2" size={14} /> Population data available</li>
            </ul>
          </Card>

          <div className="space-y-3">
            <Button className="w-full" variant="primary" onClick={() => navigate(`/simulator?parcel=${id}`)}>Simulate Impact</Button>
            <Button className="w-full" variant="secondary" onClick={() => alert('Report generated.')}>Generate Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
