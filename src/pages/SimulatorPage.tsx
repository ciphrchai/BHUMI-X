import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import * as simulationService from '../services';

interface SimulationMetric {
  label: string;
  before: number;
  after: number;
  unit: string;
  improvement_pct: number;
}

interface SimulationResults {
  additional_population_served: number;
  metrics: SimulationMetric[];
}

export function SimulatorPage() {
  const [searchParams] = useSearchParams();

  const initialParcel = searchParams.get('parcel') || 'A102';

  const [parcelId, setParcelId] = useState(initialParcel);
  const [facility, setFacility] = useState('school');
  const [radius, setRadius] = useState(3);

  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<SimulationResults | null>(null);

  const getFallbackResults = (): SimulationResults => ({
    additional_population_served: 13300,

    metrics: [
      {
        label: 'Population Served',
        before: 18400,
        after: 31700,
        unit: 'people',
        improvement_pct: 72.3,
      },
      {
        label: 'Service Accessibility',
        before: 61,
        after: 84,
        unit: '%',
        improvement_pct: 37.7,
      },
      {
        label: 'Average Travel Distance',
        before: 4.2,
        after: 2.1,
        unit: 'km',
        improvement_pct: 50,
      },
    ],
  });

  const handleSimulate = async () => {
    setIsSimulating(true);

    try {
      const data = await simulationService.simulateImpact(
        parcelId,
        facility as any,
        radius
      );

      /*
       * The backend/mock service returns:
       *
       * {
       *   parcel_id,
       *   facility,
       *   population_radius,
       *   metrics: [...],
       *   additional_population_served
       * }
       *
       * Use it directly when available.
       */
      if (data && Array.isArray(data.metrics)) {
        setResults({
          additional_population_served:
            data.additional_population_served ?? 0,
          metrics: data.metrics,
        });
      } else {
        setResults(getFallbackResults());
      }
    } catch (error) {
      console.error('Simulation failed:', error);

      // Keep the prototype usable even if the API is unavailable.
      setResults(getFallbackResults());
    } finally {
      setIsSimulating(false);
    }
  };

  const populationMetric =
    results?.metrics.find((metric) =>
      metric.label.toLowerCase().includes('population')
    );

  const accessibilityMetric =
    results?.metrics.find((metric) =>
      metric.label.toLowerCase().includes('access')
    );

  const distanceMetric =
    results?.metrics.find(
      (metric) =>
        metric.label.toLowerCase().includes('distance') ||
        metric.unit.toLowerCase() === 'km'
    );

  const chartData = results
    ? results.metrics.map((metric) => ({
        name: metric.label,
        Before: metric.before,
        After: metric.after,
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <PageHeader
        title="Impact Simulator"
        description="Estimate how selecting a parcel could change service accessibility and population coverage."
      />

      {/* Simulation Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Parcel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selected Parcel
            </label>

            <Input
              value={parcelId}
              onChange={(e: any) => setParcelId(e.target.value)}
            />
          </div>

          {/* Facility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type
            </label>

            <Select
              options={[
                {
                  value: 'school',
                  label: 'School',
                },
                {
                  value: 'hospital',
                  label: 'Hospital',
                },
              ]}
              value={facility}
              onChange={(val: any) => setFacility(val)}
            />
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Radius
            </label>

            <Input
              type="number"
              suffix="km"
              value={radius}
              onChange={(e: any) =>
                setRadius(Number(e.target.value))
              }
            />
          </div>

          {/* Simulate */}
          <div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSimulate}
              disabled={isSimulating}
            >
              {isSimulating ? 'Simulating...' : 'Simulate Impact'}
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4 italic">
          Prototype simulation — illustrative data
        </p>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6 animate-fadeIn">
          {/* Additional Population */}
          <div className="bg-green-50 border border-green-200 text-green-900 p-6 rounded-lg text-center shadow-sm">
            <h2 className="text-3xl font-bold">
              +
              {results.additional_population_served.toLocaleString()}
            </h2>

            <p className="text-green-700">
              additional population served
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Population */}
            <Card className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Population Served
              </h3>

              {populationMetric ? (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl text-gray-500">
                    {populationMetric.before.toLocaleString()}
                  </span>

                  <ArrowUp
                    className="text-green-500"
                    size={20}
                  />

                  <span className="text-2xl font-bold text-gray-900">
                    {populationMetric.after.toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="text-gray-400">No data available</p>
              )}
            </Card>

            {/* Accessibility */}
            <Card className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Service Accessibility
              </h3>

              {accessibilityMetric ? (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl text-gray-500">
                    {accessibilityMetric.before}%
                  </span>

                  <ArrowUp
                    className="text-green-500"
                    size={20}
                  />

                  <span className="text-2xl font-bold text-gray-900">
                    {accessibilityMetric.after}%
                  </span>
                </div>
              ) : (
                <p className="text-gray-400">No data available</p>
              )}
            </Card>

            {/* Distance */}
            <Card className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Average Travel Distance
              </h3>

              {distanceMetric ? (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl text-gray-500">
                    {distanceMetric.before} km
                  </span>

                  <ArrowDown
                    className="text-green-500"
                    size={20}
                  />

                  <span className="text-2xl font-bold text-gray-900">
                    {distanceMetric.after} km
                  </span>
                </div>
              ) : (
                <p className="text-gray-400">No data available</p>
              )}
            </Card>
          </div>

          {/* Comparison Chart */}
          <Card className="p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280' }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280' }}
                />

                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />

                <Bar
                  dataKey="Before"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />

                <Bar
                  dataKey="After"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}