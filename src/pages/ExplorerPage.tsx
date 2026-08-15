import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import MapContainer from '../components/gis/MapContainer';
import { useMapStore } from '../stores';

import * as parcelService from '../services/parcelService';

import type {
  Parcel,
  GeoJSONFeatureCollection,
  SuitabilityStatus,
  LandUseType,
  FloodRisk,
} from '../types';

export function ExplorerPage() {
  const navigate = useNavigate();
  const selectParcel = useMapStore((state) => state.selectParcel);

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [geojsonData, setGeojsonData] =
    useState<GeoJSONFeatureCollection | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [search, setSearch] = useState('');

  const [landUse, setLandUse] =
    useState<'all' | LandUseType>('all');

  const [suitability, setSuitability] =
    useState<'all' | SuitabilityStatus>('all');

  const [floodRisk, setFloodRisk] =
    useState<'all' | FloodRisk>('all');

  const [minArea, setMinArea] = useState('');

  // --------------------------------------------------
  // SELECTED PARCEL
  // --------------------------------------------------

  const [selectedParcelId, setSelectedParcelId] =
    useState<string | null>(null);

  // --------------------------------------------------
  // LOAD DATA
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

        console.error(
          'Failed to load BHUMI-X explorer data:',
          err
        );

        setError(
          'Unable to load parcel data. Check that the BHUMI-X backend is running.'
        );
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
  // HELPERS
  // --------------------------------------------------

  const formatLabel = (value?: string) => {
    if (!value) return '—';

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatNumber = (
    value: number | undefined,
    decimals = 0
  ) => {
    if (value === undefined || value === null) {
      return '—';
    }

    return value.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // --------------------------------------------------
  // FILTER PARCELS
  // --------------------------------------------------

  const filteredParcels = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return parcels.filter((parcel) => {
      const matchesSearch =
        !normalizedSearch ||
        parcel.parcel_id
          .toLowerCase()
          .includes(normalizedSearch) ||
        parcel.study_zone
          .toLowerCase()
          .includes(normalizedSearch) ||
        parcel.land_use
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesLandUse =
        landUse === 'all' ||
        parcel.land_use === landUse;

      const matchesSuitability =
        suitability === 'all' ||
        parcel.suitability_status === suitability;

      const matchesFloodRisk =
        floodRisk === 'all' ||
        parcel.flood_risk === floodRisk;

      const matchesArea =
        !minArea ||
        parcel.area_sq_m >= Number(minArea);

      return (
        matchesSearch &&
        matchesLandUse &&
        matchesSuitability &&
        matchesFloodRisk &&
        matchesArea
      );
    });
  }, [
    parcels,
    search,
    landUse,
    suitability,
    floodRisk,
    minArea,
  ]);

  // --------------------------------------------------
  // FILTER MAP FEATURES
  // --------------------------------------------------

  const filteredGeojson = useMemo(() => {
    if (!geojsonData) return null;

    const visibleIds = new Set(
      filteredParcels.map(
        (parcel) => parcel.parcel_id
      )
    );

    return {
      ...geojsonData,

      features: geojsonData.features.filter(
        (feature) => {
          const parcelId =
            feature.properties?.parcel_id as
              | string
              | undefined;

          return parcelId
            ? visibleIds.has(parcelId)
            : false;
        }
      ),
    };
  }, [geojsonData, filteredParcels]);

  // --------------------------------------------------
  // SELECTED PARCEL
  // --------------------------------------------------

  const selectedParcel = useMemo(() => {
    if (!selectedParcelId) return null;

    return (
      parcels.find(
        (parcel) =>
          parcel.parcel_id === selectedParcelId
      ) ?? null
    );
  }, [parcels, selectedParcelId]);

  // --------------------------------------------------
  // MAP CLICK
  // --------------------------------------------------

  const handleParcelClick = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    selectParcel(parcelId);
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch('');
    setLandUse('all');
    setSuitability('all');
    setFloodRisk('all');
    setMinArea('');
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <PageHeader
          title="Land Explorer"
          description="Explore and inspect BHUMI-X land parcels."
        />

        <Card className="p-10 text-center">
          <p className="text-gray-600">
            Loading BHUMI-X parcel data...
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
          description="Explore and inspect BHUMI-X land parcels."
        />

        <Card className="p-8">
          <p className="text-red-600 font-medium">
            {error}
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Make sure FastAPI is running on
            http://127.0.0.1:8000
          </p>
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
        description="Explore BHUMI-X parcels, environmental conditions, suitability and planning indicators."
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
              Filter the BHUMI-X dataset.
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
              placeholder="SYN-P-07385..."
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="all">
                All Land Uses
              </option>

              <option value="residential">
                Residential
              </option>

              <option value="commercial">
                Commercial
              </option>

              <option value="mixed_use">
                Mixed Use
              </option>

              <option value="institutional">
                Institutional
              </option>

              <option value="industrial">
                Industrial
              </option>

              <option value="open_space">
                Open Space
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="all">
                All Suitability
              </option>

              <option value="HIGHLY_SUITABLE">
                Highly Suitable
              </option>

              <option value="SUITABLE">
                Suitable
              </option>

              <option value="MODERATE">
                Moderate
              </option>

              <option value="UNSUITABLE">
                Unsuitable
              </option>
            </select>
          </div>

          {/* Flood Risk */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flood Risk
            </label>

            <select
              value={floodRisk}
              onChange={(event) =>
                setFloodRisk(
                  event.target.value as
                    | 'all'
                    | FloodRisk
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="all">
                All Flood Risk
              </option>

              <option value="low">
                Low
              </option>

              <option value="moderate">
                Moderate
              </option>

              <option value="high">
                High
              </option>
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

        </div>

        {/* Count */}

        <div className="mt-5 pt-4 border-t border-gray-200">

          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-900">
              {filteredParcels.length.toLocaleString()}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-900">
              {parcels.length.toLocaleString()}
            </span>{' '}
            parcels
          </p>

        </div>

      </Card>

      {/* =================================================
          MAP + INFORMATION
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* MAP */}

        <Card className="overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                BHUMI-X Parcel Map
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Select a parcel to inspect its intelligence profile.
              </p>
            </div>

            <Badge variant="default">
              {filteredParcels.length.toLocaleString()} visible
            </Badge>

          </div>

          <div className="h-[600px]">

            {filteredGeojson &&
            filteredGeojson.features.length > 0 ? (

              <MapContainer
                geojsonData={filteredGeojson}
                highlightedParcelId={
                  selectedParcelId
                }
                onParcelClick={
                  handleParcelClick
                }
                interactive={true}
              />

            ) : (

              <div className="h-full flex items-center justify-center bg-gray-50">

                <div className="text-center">

                  <p className="font-medium text-gray-700">
                    No parcels match your filters.
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Try changing the filters.
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

        {/* =================================================
            PARCEL INFORMATION
        ================================================= */}

        <Card className="overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200">

            <h2 className="font-semibold text-gray-900">
              Parcel Intelligence
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
                    'HIGHLY_SUITABLE'
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
                  {formatNumber(
                    selectedParcel.suitability_score,
                    2
                  )}
                  /100
                </span>

              </div>

              {/* Area */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Area
                </span>

                <span className="font-semibold text-gray-900">
                  {formatNumber(
                    selectedParcel.area_sq_m,
                    1
                  )}{' '}
                  m²
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

              {/* Study Zone */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Study Zone
                </span>

                <span className="font-medium text-gray-900">
                  {formatLabel(
                    selectedParcel.study_zone
                  )}
                </span>

              </div>

              {/* Population */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Population / 1 km
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.population_1km
                  )}
                </span>

              </div>

              {/* Population density */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Population Density
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.population_density,
                    1
                  )}
                </span>

              </div>

              {/* Road */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Road Distance
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.road_distance_m,
                    1
                  )}{' '}
                  m
                </span>

              </div>

              {/* School */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Nearest School
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.nearest_school_distance_m,
                    1
                  )}{' '}
                  m
                </span>

              </div>

              {/* Hospital */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Nearest Hospital
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.nearest_hospital_distance_m,
                    1
                  )}{' '}
                  m
                </span>

              </div>

              {/* Infrastructure */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Infrastructure
                </span>

                <span className="font-bold text-gray-900">
                  {formatNumber(
                    selectedParcel.infrastructure_score,
                    1
                  )}
                  /100
                </span>

              </div>

              {/* Environmental Risk */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Environmental Risk
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.environmental_risk,
                    1
                  )}
                </span>

              </div>

              {/* Flood Risk */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Flood Risk
                </span>

                <span className="font-medium capitalize text-gray-900">
                  {selectedParcel.flood_risk}
                </span>

              </div>

              {/* Heat */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Heat Stress
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.heat_stress_pct,
                    1
                  )}
                  %
                </span>

              </div>

              {/* Green Cover */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Green Cover
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.green_cover_pct,
                    1
                  )}
                  %
                </span>

              </div>

              {/* BMSIT Distance */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Distance to BMSIT
                </span>

                <span className="font-medium text-gray-900">
                  {formatNumber(
                    selectedParcel.distance_to_bmsit_km,
                    3
                  )}{' '}
                  km
                </span>

              </div>

              {/* Confidence */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Confidence
                </span>

                <Badge
                  variant={
                    selectedParcel.confidence_level ===
                    'high'
                      ? 'success'
                      : 'default'
                  }
                >
                  {formatLabel(
                    selectedParcel.confidence_level
                  )}
                </Badge>

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
              Select a parcel on the map to inspect it.
            </div>

          )}

        </Card>

      </div>

    </div>
  );
}

export default ExplorerPage;
