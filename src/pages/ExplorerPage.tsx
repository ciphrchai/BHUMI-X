import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import MapContainer from '../components/gis/MapContainer';
import * as parcelService from '../services/parcelService';
import type {
  Parcel,
  GeoJSONFeatureCollection,
  SuitabilityStatus,
  OwnershipType,
  LandUseType,
  RiskLevel,
} from '../types';

export function ExplorerPage() {
  const navigate = useNavigate();

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [geojsonData, setGeojsonData] =
    useState<GeoJSONFeatureCollection | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [landUse, setLandUse] = useState<'all' | LandUseType>('all');
  const [ownership, setOwnership] =
    useState<'all' | OwnershipType>('all');
  const [suitability, setSuitability] =
    useState<'all' | SuitabilityStatus>('all');
  const [risk, setRisk] =
    useState<'all' | RiskLevel>('all');
  const [minArea, setMinArea] = useState('');

  // Selected parcel
  const [selectedParcelId, setSelectedParcelId] =
    useState<string | null>(null);

  // --------------------------------------------------
  // LOAD PARCEL DATA
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [parcelData, mapData] = await Promise.all([
          parcelService.getParcels(),
          parcelService.getParcelGeoJSON(),
        ]);

        if (cancelled) return;

        setParcels(parcelData);
        setGeojsonData(mapData);

        if (parcelData.length > 0) {
          setSelectedParcelId(parcelData[0].parcel_id);
        }
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to load explorer data:', err);
        setError('Unable to load parcel data.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // FILTER PARCELS
  // --------------------------------------------------

  const filteredParcels = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return parcels.filter((parcel) => {
      const matchesSearch =
        !normalizedSearch ||
        parcel.parcel_id
          .toLowerCase()
          .includes(normalizedSearch) ||
        parcel.location
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesLandUse =
        landUse === 'all' ||
        parcel.land_use === landUse;

      const matchesOwnership =
        ownership === 'all' ||
        parcel.ownership === ownership;

      const matchesSuitability =
        suitability === 'all' ||
        parcel.suitability_status === suitability;

      const matchesRisk =
        risk === 'all' ||
        parcel.environmental_risk === risk;

      const matchesArea =
        !minArea ||
        parcel.area >= Number(minArea);

      return (
        matchesSearch &&
        matchesLandUse &&
        matchesOwnership &&
        matchesSuitability &&
        matchesRisk &&
        matchesArea
      );
    });
  }, [
    parcels,
    search,
    landUse,
    ownership,
    suitability,
    risk,
    minArea,
  ]);

  // --------------------------------------------------
  // FILTER MAP FEATURES
  // --------------------------------------------------

  const filteredGeojson = useMemo(() => {
    if (!geojsonData) return null;

    const visibleIds = new Set(
      filteredParcels.map((parcel) => parcel.parcel_id)
    );

    return {
      ...geojsonData,
      features: geojsonData.features.filter((feature) => {
        const parcelId =
          feature.properties?.parcel_id as string | undefined;

        return parcelId
          ? visibleIds.has(parcelId)
          : false;
      }),
    };
  }, [geojsonData, filteredParcels]);

  // --------------------------------------------------
  // SELECTED PARCEL
  // --------------------------------------------------

  const selectedParcel = useMemo(() => {
    if (!selectedParcelId) return null;

    return (
      parcels.find(
        (parcel) => parcel.parcel_id === selectedParcelId
      ) ?? null
    );
  }, [parcels, selectedParcelId]);

  // --------------------------------------------------
  // PARCEL CLICK
  // --------------------------------------------------

  const handleParcelClick = (parcelId: string) => {
    setSelectedParcelId(parcelId);
  };

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch('');
    setLandUse('all');
    setOwnership('all');
    setSuitability('all');
    setRisk('all');
    setMinArea('');
  };

  // --------------------------------------------------
  // LABEL HELPERS
  // --------------------------------------------------

  const formatLabel = (value?: string) => {
    if (!value) return '—';

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <PageHeader
          title="Land Explorer"
          description="Explore and inspect candidate land parcels."
        />

        <Card className="p-10 text-center">
          <p className="text-gray-600">
            Loading parcel data...
          </p>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <PageHeader
          title="Land Explorer"
          description="Explore and inspect candidate land parcels."
        />

        <Card className="p-8">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">

      <PageHeader
        title="Land Explorer"
        description="Explore land parcels, apply filters, and inspect spatial candidates."
      />

      {/* =================================================
          FILTER PANEL
      ================================================= */}

      <Card className="p-5">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Parcel Filters
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Narrow down parcels based on planning requirements.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Search */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Parcel
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Parcel ID or location..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Land Use */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Land Use
            </label>

            <select
              value={landUse}
              onChange={(event) =>
                setLandUse(
                  event.target.value as
                    | 'all'
                    | LandUseType
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Land Uses</option>
              <option value="institutional">
                Institutional
              </option>
              <option value="residential">
                Residential
              </option>
              <option value="commercial">
                Commercial
              </option>
              <option value="industrial">
                Industrial
              </option>
              <option value="agricultural">
                Agricultural
              </option>
              <option value="mixed">Mixed</option>
              <option value="vacant">Vacant</option>
              <option value="forest">Forest</option>
              <option value="wetland">Wetland</option>
            </select>
          </div>

          {/* Ownership */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ownership
            </label>

            <select
              value={ownership}
              onChange={(event) =>
                setOwnership(
                  event.target.value as
                    | 'all'
                    | OwnershipType
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">
                All Ownership Types
              </option>
              <option value="government">
                Government
              </option>
              <option value="private">
                Private
              </option>
              <option value="disputed">
                Disputed
              </option>
              <option value="unknown">
                Unknown
              </option>
            </select>
          </div>

          {/* Suitability */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suitability
            </label>

            <select
              value={suitability}
              onChange={(event) =>
                setSuitability(
                  event.target.value as
                    | 'all'
                    | SuitabilityStatus
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">
                All Suitability
              </option>
              <option value="highly_suitable">
                Highly Suitable
              </option>
              <option value="suitable">
                Suitable
              </option>
              <option value="moderate">
                Moderate
              </option>
              <option value="unsuitable">
                Unsuitable
              </option>
              <option value="restricted">
                Restricted
              </option>
            </select>
          </div>

          {/* Environmental Risk */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environmental Risk
            </label>

            <select
              value={risk}
              onChange={(event) =>
                setRisk(
                  event.target.value as
                    | 'all'
                    | RiskLevel
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Minimum Area */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Area (m²)
            </label>

            <input
              type="number"
              min="0"
              value={minArea}
              onChange={(event) =>
                setMinArea(event.target.value)
              }
              placeholder="e.g. 1000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Filter result count */}

        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">

          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-900">
              {filteredParcels.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-900">
              {parcels.length}
            </span>{' '}
            parcels
          </p>

          {(search ||
            landUse !== 'all' ||
            ownership !== 'all' ||
            suitability !== 'all' ||
            risk !== 'all' ||
            minArea) && (
            <span className="text-xs text-blue-600 font-medium">
              Filters active
            </span>
          )}

        </div>

      </Card>

      {/* =================================================
          MAP + PARCEL INFORMATION
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* MAP */}

        <Card className="overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                Parcel Map
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Click a parcel to inspect it.
              </p>
            </div>

            <Badge variant="default">
              {filteredParcels.length} visible
            </Badge>

          </div>

          <div className="h-[600px]">

            {filteredGeojson &&
            filteredGeojson.features.length > 0 ? (
              <MapContainer
                geojsonData={filteredGeojson}
                highlightedParcelId={selectedParcelId}
                onParcelClick={handleParcelClick}
                interactive={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">

                  <p className="font-medium text-gray-700">
                    No parcels match your filters.
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Try changing or resetting the filters.
                  </p>

                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>

                </div>
              </div>
            )}

          </div>

        </Card>

        {/* PARCEL INFORMATION */}

        <Card className="overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              Parcel Information
            </h2>
          </div>

          {selectedParcel ? (

            <div className="p-5 space-y-5">

              {/* ID */}

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Parcel ID
                </p>

                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {selectedParcel.parcel_id}
                </p>
              </div>

              {/* Suitability */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Suitability
                </span>

                <Badge
                  variant={
                    selectedParcel.suitability_status ===
                    'highly_suitable'
                      ? 'success'
                      : 'default'
                  }
                >
                  {formatLabel(
                    selectedParcel.suitability_status
                  )}
                </Badge>

              </div>

              {/* Score */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Suitability Score
                </span>

                <span className="font-bold text-gray-900">
                  {selectedParcel.suitability_score ?? '—'}
                </span>
              </div>

              {/* Area */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Area
                </span>

                <span className="font-semibold text-gray-900">
                  {selectedParcel.area.toLocaleString()} m²
                </span>
              </div>

              {/* Land Use */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Land Use
                </span>

                <span className="font-medium text-gray-900">
                  {formatLabel(
                    selectedParcel.land_use
                  )}
                </span>
              </div>

              {/* Ownership */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Ownership
                </span>

                <span className="font-medium text-gray-900">
                  {formatLabel(
                    selectedParcel.ownership
                  )}
                </span>
              </div>

              {/* Location */}

              <div>
                <p className="text-sm text-gray-600">
                  Location
                </p>

                <p className="font-medium text-gray-900 mt-1">
                  {selectedParcel.location}
                </p>
              </div>

              {/* Risk */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Environmental Risk
                </span>

                <span className="font-medium capitalize text-gray-900">
                  {selectedParcel.environmental_risk ??
                    '—'}
                </span>
              </div>

              {/* Population */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Population Nearby
                </span>

                <span className="font-medium text-gray-900">
                  {selectedParcel.population_nearby?.toLocaleString() ??
                    '—'}
                </span>
              </div>

              {/* Road */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Distance to Road
                </span>

                <span className="font-medium text-gray-900">
                  {selectedParcel.distance_to_road !==
                  undefined
                    ? `${selectedParcel.distance_to_road} km`
                    : '—'}
                </span>
              </div>

              {/* Divider */}

              <div className="border-t border-gray-200 pt-5">

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      `/parcel/${selectedParcel.parcel_id}`
                    )
                  }
                >
                  View Parcel Details
                </Button>

              </div>

            </div>

          ) : (

            <div className="p-8 text-center text-gray-500">
              Click a parcel on the map to inspect it.
            </div>

          )}

        </Card>

      </div>

    </div>
  );
}

export default ExplorerPage;