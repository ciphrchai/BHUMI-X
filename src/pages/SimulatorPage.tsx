import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import * as simulationService from '../services';

export function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const initialParcel = searchParams.get('parcel') || 'A102';
  
  const [parcelId, setParcelId] = useState(initialParcel);
  const [facility, setFacility] = useState('school');
  const [radius, setRadius] = useState(3);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const data = await simulationService.simulateImpact(parcelId, facility as any, radius);
      // Mocking results if service doesn't return exactly what we need
      setResults(data || {
        population: { before: 18400, after: 31700 },
        accessibility: { before: 61, after: 84 },
        distance: { before: 4.2, after: 2.1 }
      });
    } catch (e) {
      setResults({
        population: { before: 18400, after: 31700 },
        accessibility: { before: 61, after: 84 },
        distance: { before: 4.2, after: 2.1 }
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const chartData = results ? [
    { name: 'Pop. Served (k)', Before: results.population.before / 1000, After: results.population.after / 1000 },
    { name: 'Access (%)', Before: results.accessibility.before, After: results.accessibility.after },
    { name: 'Avg Dist (km)', Before: results.distance.before, After: results.distance.after },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <PageHeader 
        title="Impact Simulator" 
        description="Estimate how selecting a parcel could change service accessibility and population coverage." 
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selected Parcel</label>
            <Input value={parcelId} onChange={(e: any) => setParcelId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
            <Select 
              options={[{value:'school',label:'School'}, {value:'hospital',label:'Hospital'}]} 
              value={facility} 
              onChange={(val: any) => setFacility(val)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius</label>
            <Input type="number" suffix="km" value={radius} onChange={(e: any) => setRadius(Number(e.target.value))} />
          </div>
          <div>
            <Button variant="primary" className="w-full" onClick={handleSimulate} disabled={isSimulating}>
              {isSimulating ? 'Simulating...' : 'Simulate Impact'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">Prototype simulation — illustrative data</p>
      </Card>

      {results && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-green-50 border border-green-200 text-green-900 p-6 rounded-lg text-center shadow-sm">
            <h2 className="text-3xl font-bold">+{ (results.population.after - results.population.before).toLocaleString() }</h2>
            <p className="text-green-700">additional population served</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Population Served</h3>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl text-gray-500">{results.population.before.toLocaleString()}</span>
                <ArrowUp className="text-green-500" size={20} />
                <span className="text-2xl font-bold text-gray-900">{results.population.after.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Service Accessibility</h3>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl text-gray-500">{results.accessibility.before}%</span>
                <ArrowUp className="text-green-500" size={20} />
                <span className="text-2xl font-bold text-gray-900">{results.accessibility.after}%</span>
              </div>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Travel Distance</h3>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl text-gray-500">{results.distance.before} km</span>
                <ArrowDown className="text-green-500" size={20} />
                <span className="text-2xl font-bold text-gray-900">{results.distance.after} km</span>
              </div>
            </Card>
          </div>

          <Card className="p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Before" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="After" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
