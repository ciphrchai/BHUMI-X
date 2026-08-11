import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MapContainer from '../components/gis/MapContainer';
import { useAnalysisStore } from '../stores';
import * as analysisService from '../services/analysisService';
import * as parcelService from '../services/parcelService';
import type {
  AnalysisResult,
  GeoJSONFeatureCollection,
  Recommendation,
} from '../types';

export function ResultsPage() {
  const navigate = useNavigate();

  const {
    selectedFacility: facility,
    selectedRegion: region,
  } = useAnalysisStore() as any;

  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [geojsonData, setGeojsonData] =
    useState<GeoJSONFeatureCollection | null>(null);
  const [selectedParcelId, setSelectedParcelId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const analysisId = 'ANL-001';

        const [analysisResult, parcels] = await Promise.all([
          analysisService.getAnalysisResult(analysisId),
          parcelService.getParcelGeoJSON(region || undefined),
        ]);

        if (cancelled) return;

        setResult(analysisResult);
        setGeojsonData(parcels);

        if (analysisResult.recommendations.length > 0) {
          setSelectedParcelId(
            analysisResult.recommendations[0].parcel_id
          );
        }
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to load analysis results:', err);
        setError('Unable to load analysis results.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [region]);

  const recommendations: Recommendation[] =
    result?.recommendations ?? [];

  const handleParcelClick = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    navigate(`/parcel/${parcelId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <PageHeader title="Analysis Results" />

        <Card className="p-8 text-center">
          <p className="text-gray-600">
            Loading analysis results...
          </p>
        </Card>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <PageHeader title="Analysis Results" />

        <Card className="p-8">
          <p className="text-red-600">
            {error || 'No analysis results available.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <PageHeader title="Analysis Results" />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase">
            Region
          </p>
          <p className="font-semibold capitalize">
            {result.region || region || '—'}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase">
            Facility
          </p>
          <p className="font-semibold capitalize">
            {result.facility || facility || '—'}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase">
            Parcels Analyzed
          </p>
          <p className="font-semibold">
            {(result.parcels_analyzed ?? 0).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase">
            Suitable
          </p>
          <p className="font-semibold text-blue-600">
            {(result.suitable_parcels ?? 0).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase">
            Recommended
          </p>
          <p className="font-semibold text-green-600">
            {recommendations.length}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">

        {/* Tabs */}
        <div className="border-b px-4 flex space-x-6">

          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'map'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('map')}
          >
            Map View
          </button>

          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'table'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('table')}
          >
            Table View
          </button>

        </div>

        <div className="p-4">

          {/* ================= MAP VIEW ================= */}

          {activeTab === 'map' ? (

            <div className="flex flex-col md:flex-row gap-4 h-[600px]">

              {/* Map */}
              <div className="flex-1 min-h-[400px] border border-gray-200 rounded-md overflow-hidden">

                {geojsonData ? (
                  <MapContainer
                    geojsonData={geojsonData}
                    highlightedParcelId={selectedParcelId}
                    onParcelClick={handleParcelClick}
                    interactive={true}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">
                      Parcel map data unavailable
                    </span>
                  </div>
                )}

              </div>

              {/* Recommendations */}
              <div className="w-full md:w-80 overflow-y-auto space-y-3">

                <h3 className="font-semibold text-gray-900 mb-2 sticky top-0 bg-white py-1">
                  Top Recommendations
                </h3>

                {recommendations.map((r, index) => (

                  <Card
                    key={r.parcel_id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedParcelId === r.parcel_id
                        ? 'border-blue-500 ring-1 ring-blue-200'
                        : 'hover:border-blue-300'
                    }`}
                    onClick={() => {
                      setSelectedParcelId(r.parcel_id);
                    }}
                  >

                    <div className="flex justify-between items-start mb-2">

                      <div className="flex items-center space-x-2">

                        <span className="text-xs font-bold text-gray-400">
                          #{index + 1}
                        </span>

                        <button
                          type="button"
                          className="font-semibold text-blue-700 hover:underline"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/parcel/${r.parcel_id}`);
                          }}
                        >
                          {r.parcel_id}
                        </button>

                      </div>

                      <Badge
                        variant={
                          r.recommendation === 'highly_suitable'
                            ? 'success'
                            : 'default'
                        }
                      >
                        {r.recommendation.replace('_', ' ')}
                      </Badge>

                    </div>

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-gray-600">
                        Suitability Score
                      </span>

                      <span className="font-bold text-gray-900">
                        {r.overall_score}
                      </span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">

                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            Math.max(r.overall_score, 0),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Confidence: {r.confidence}
                    </div>

                    {r.reasons.length > 0 && (
                      <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                        {r.reasons[0]}
                      </p>
                    )}

                  </Card>

                ))}

              </div>

            </div>

          ) : (

            /* ================= TABLE VIEW ================= */

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcel ID
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suitability Score
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Population
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accessibility
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommendation
                    </th>

                  </tr>

                </thead>

                <tbody className="bg-white divide-y divide-gray-200">

                  {recommendations.map((r, index) => (

                    <tr
                      key={r.parcel_id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedParcelId === r.parcel_id
                          ? 'bg-blue-50'
                          : ''
                      }`}

                      // ✅ FIX:
                      // Clicking anywhere on the table row now
                      // opens the parcel details page.
                      onClick={() => {
                        setSelectedParcelId(r.parcel_id);
                        navigate(`/parcel/${r.parcel_id}`);
                      }}
                    >

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{index + 1}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {r.parcel_id}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {r.overall_score}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.scores.population_score}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.scores.accessibility_score}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {r.risk_level}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">

                        <Badge
                          variant={
                            r.recommendation === 'highly_suitable'
                              ? 'success'
                              : 'default'
                          }
                        >
                          {r.recommendation.replace('_', ' ')}
                        </Badge>

                      </td>

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