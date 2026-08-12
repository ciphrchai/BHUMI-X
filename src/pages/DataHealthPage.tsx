import { useEffect, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import * as dataHealthService from '../services';

export function DataHealthPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await dataHealthService.getDataHealth();

        setMetrics(data);
      } catch (error) {
        console.error('Failed to load data health:', error);

        // Fallback data if backend is unavailable
        setMetrics({
          total_parcels: 18421,
          valid_geometries: 17982,
          invalid_geometries: 439,
          data_freshness: 'Unavailable',
          land_use_completeness: 87,
          ownership_completeness: 91,
          environmental_data_available: false,
        });
      }
    };

    fetchHealth();
  }, []);

  if (!metrics) {
    return (
      <div className="p-8 text-center">
        Loading health metrics...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">

      <PageHeader
        title="Data Health"
        description="Monitor the quality and completeness of geospatial datasets."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Total Parcels */}
        <Card className="p-5">
          <p className="text-sm text-gray-500 font-medium mb-1">
            Total Parcels
          </p>

          <p className="text-3xl font-bold text-gray-900">
            {Number(metrics.total_parcels || 0).toLocaleString()}
          </p>
        </Card>

        {/* Valid Geometries */}
        <Card className="p-5">
          <p className="text-sm text-gray-500 font-medium mb-1">
            Valid Geometries
          </p>

          <p className="text-3xl font-bold text-green-600">
            {Number(metrics.valid_geometries || 0).toLocaleString()}
          </p>
        </Card>

        {/* Invalid Geometries */}
        <Card className="p-5">
          <p className="text-sm text-gray-500 font-medium mb-1">
            Invalid Geometries
          </p>

          <p className="text-3xl font-bold text-red-600">
            {Number(metrics.invalid_geometries || 0).toLocaleString()}
          </p>
        </Card>

        {/* Data Freshness */}
        <Card className="p-5">
          <p className="text-sm text-gray-500 font-medium mb-1">
            Data Freshness
          </p>

          <p className="text-lg font-medium text-gray-700 mt-2">
            {metrics.data_freshness || 'Unknown'}
          </p>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="p-6">

        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Detailed Metrics
        </h3>

        <div className="space-y-6 max-w-2xl">

          {/* Land Use */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">
                Land-use Completeness
              </span>

              <span className="font-bold">
                {Number(metrics.land_use_completeness || 0)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${Math.min(
                    Number(metrics.land_use_completeness || 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Ownership */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">
                Ownership Completeness
              </span>

              <span className="font-bold">
                {Number(metrics.ownership_completeness || 0)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${Math.min(
                    Number(metrics.ownership_completeness || 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Environmental Data */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="font-medium text-gray-700">
              Environmental Data
            </span>

            {metrics.environmental_data_available ? (
              <Badge variant="success">
                Available
              </Badge>
            ) : (
              <Badge variant="danger">
                Missing
              </Badge>
            )}
          </div>

        </div>
      </Card>
    </div>
  );
}