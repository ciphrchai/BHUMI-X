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
import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';

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

  const initialParcel = searchParams.get('parcel') || '';

  const [parcelId, setParcelId] = useState(initialParcel);
  const [facility, setFacility] = useState('school');
  const [radius, setRadius] = useState(3);

  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] =
    useState<SimulationResults | null>(null);

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // RUN REAL SIMULATION
  // ============================================================

  const handleSimulate = async () => {
    if (!parcelId.trim()) {
      setError('Please enter a parcel ID.');
      setResults(null);
      return;
    }

    if (!radius || radius <= 0) {
      setError('Service radius must be greater than 0.');
      setResults(null);
      return;
    }

    setIsSimulating(true);
    setError(null);
    setResults(null);

    try {
      const data =
        await simulationService.simulateImpact(
          parcelId.trim(),
          facility as any,
          radius
        );

      // --------------------------------------------------------
      // Validate backend response
      // --------------------------------------------------------

      if (
        !data ||
        !Array.isArray(data.metrics)
      ) {
        throw new Error(
          'Backend returned an invalid simulation response.'
        );
      }

      setResults({
        additional_population_served:
          Number(
            data.additional_population_served ?? 0
          ),

        metrics: data.metrics.map(
          (metric: any) => ({
            label: String(metric.label ?? ''),
            before: Number(metric.before ?? 0),
            after: Number(metric.after ?? 0),
            unit: String(metric.unit ?? ''),
            improvement_pct: Number(
              metric.improvement_pct ?? 0
            ),
          })
        ),
      });
    } catch (err) {
      console.error(
        'BHUMI-X simulation failed:',
        err
      );

      setResults(null);

      setError(
        err instanceof Error
          ? err.message
          : 'Simulation failed. Make sure the BHUMI-X backend is running and the simulation API is available.'
      );
    } finally {
      setIsSimulating(false);
    }
  };

  // ============================================================
  // FIND METRICS
  // ============================================================

  const populationMetric =
    results?.metrics.find((metric) =>
      metric.label
        .toLowerCase()
        .includes('population')
    );

  const accessibilityMetric =
    results?.metrics.find((metric) =>
      metric.label
        .toLowerCase()
        .includes('access')
    );

  const distanceMetric =
    results?.metrics.find(
      (metric) =>
        metric.label
          .toLowerCase()
          .includes('distance') ||
        metric.unit.toLowerCase() === 'km'
    );

  // ============================================================
  // CHART DATA
  // ============================================================

  const chartData = results
    ? results.metrics.map((metric) => ({
        name: metric.label,
        Before: metric.before,
        After: metric.after,
      }))
    : [];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">

      <PageHeader
        title="Impact Simulator"
        description="Estimate how selecting a parcel could change service accessibility and population coverage."
      />

      {/* ======================================================
          SIMULATION CONTROLS
      ====================================================== */}

      <Card className="p-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">

          {/* --------------------------------------------------
              PARCEL
          -------------------------------------------------- */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selected Parcel
            </label>

            <Input
              value={parcelId}
              onChange={(e: any) =>
                setParcelId(e.target.value)
              }
              placeholder="e.g. SYN-P-00959"
            />
          </div>

          {/* --------------------------------------------------
              FACILITY
          -------------------------------------------------- */}

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
              onChange={(val: any) =>
                setFacility(val)
              }
            />
          </div>

          {/* --------------------------------------------------
              RADIUS
          -------------------------------------------------- */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Radius
            </label>

            <Input
              type="number"
              suffix="km"
              value={radius}
              min={0.1}
              step={0.1}
              onChange={(e: any) =>
                setRadius(
                  Number(e.target.value)
                )
              }
            />
          </div>

          {/* --------------------------------------------------
              SIMULATE BUTTON
          -------------------------------------------------- */}

          <div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSimulate}
              disabled={isSimulating}
            >
              {isSimulating
                ? 'Simulating...'
                : 'Simulate Impact'}
            </Button>
          </div>

        </div>

        <p className="text-xs text-gray-400 mt-4 italic">
          Simulation results are generated by the BHUMI-X backend.
        </p>

      </Card>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Card className="p-5 border-red-200 bg-red-50">

          <div className="flex items-start gap-3">

            <AlertTriangle
              className="text-red-500 shrink-0"
              size={22}
            />

            <div>

              <h3 className="font-semibold text-red-800">
                Simulation unavailable
              </h3>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>

              <p className="text-xs text-red-600 mt-2">
                Check that the FastAPI backend is running
                and that POST /api/simulation/impact is
                available.
              </p>

            </div>

          </div>

        </Card>
      )}

      {/* ======================================================
          RESULTS
      ====================================================== */}

      {results && (

        <div className="space-y-6 animate-fadeIn">

          {/* ==================================================
              ADDITIONAL POPULATION
          ================================================== */}

          <div className="bg-green-50 border border-green-200 text-green-900 p-6 rounded-lg text-center shadow-sm">

            <h2 className="text-3xl font-bold">
              +
              {results.additional_population_served.toLocaleString()}
            </h2>

            <p className="text-green-700">
              additional population served
            </p>

          </div>

          {/* ==================================================
              METRIC CARDS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ------------------------------------------------
                POPULATION
            ------------------------------------------------ */}

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

                <p className="text-gray-400">
                  No population data
                </p>

              )}

            </Card>

            {/* ------------------------------------------------
                ACCESSIBILITY
            ------------------------------------------------ */}

            <Card className="p-6 text-center">

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Service Accessibility
              </h3>

              {accessibilityMetric ? (

                <div className="flex items-center justify-center space-x-3">

                  <span className="text-xl text-gray-500">
                    {accessibilityMetric.before}
                    {accessibilityMetric.unit === '%'
                      ? '%'
                      : ''}
                  </span>

                  <ArrowUp
                    className="text-green-500"
                    size={20}
                  />

                  <span className="text-2xl font-bold text-gray-900">
                    {accessibilityMetric.after}
                    {accessibilityMetric.unit === '%'
                      ? '%'
                      : ''}
                  </span>

                </div>

              ) : (

                <p className="text-gray-400">
                  No accessibility data
                </p>

              )}

            </Card>

            {/* ------------------------------------------------
                DISTANCE
            ------------------------------------------------ */}

            <Card className="p-6 text-center">

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Average Travel Distance
              </h3>

              {distanceMetric ? (

                <div className="flex items-center justify-center space-x-3">

                  <span className="text-xl text-gray-500">
                    {distanceMetric.before}
                    {distanceMetric.unit
                      ? ` ${distanceMetric.unit}`
                      : ''}
                  </span>

                  <ArrowDown
                    className="text-green-500"
                    size={20}
                  />

                  <span className="text-2xl font-bold text-gray-900">
                    {distanceMetric.after}
                    {distanceMetric.unit
                      ? ` ${distanceMetric.unit}`
                      : ''}
                  </span>

                </div>

              ) : (

                <p className="text-gray-400">
                  No distance data
                </p>

              )}

            </Card>

          </div>

          {/* ==================================================
              METRIC DETAILS
          ================================================== */}

          <Card className="p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-5">
              Simulation Metrics
            </h3>

            <div className="space-y-4">

              {results.metrics.map(
                (metric, index) => (

                  <div
                    key={`${metric.label}-${index}`}
                    className="border-b border-gray-100 pb-4 last:border-b-0"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="font-medium text-gray-900">
                          {metric.label}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Before → After
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-semibold text-gray-900">

                          {metric.before}

                          {' → '}

                          {metric.after}

                          {metric.unit
                            ? ` ${metric.unit}`
                            : ''}

                        </p>

                        <p className="text-xs text-green-600 mt-1">
                          {metric.improvement_pct >= 0
                            ? '+'
                            : ''}
                          {metric.improvement_pct.toFixed(
                            1
                          )}
                          % change
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </Card>

          {/* ==================================================
              COMPARISON CHART
          ================================================== */}

          <Card className="p-6 h-96">

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Before vs After
            </h3>

            <ResponsiveContainer
              width="100%"
              height="90%"
            >

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
                  tick={{
                    fill: '#6B7280',
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: '#F3F4F6',
                  }}
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
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                  maxBarSize={50}
                />

                <Bar
                  dataKey="After"
                  fill="#10B981"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
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

export default SimulatorPage;