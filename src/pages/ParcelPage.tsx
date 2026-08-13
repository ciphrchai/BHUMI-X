import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Brain,
  Wind,
  Sun,
  Thermometer,
  TreePine,
  Building2,
  MapPin,
  Users,
  Route,
  ShieldCheck,
} from 'lucide-react';

import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import * as parcelService from '../services';

type ParcelData = {
  parcel_id: string;

  latitude?: number;
  longitude?: number;

  area_sq_m: number;
  land_use: string;
  ownership?: string;

  population_500m?: number;
  population_1km?: number;
  population_density?: number;

  road_distance_m?: number;
  nearest_road_width_m?: number;

  nearest_school_distance_m?: number;
  nearest_hospital_distance_m?: number;
  nearest_fire_station_distance_m?: number;
  nearest_police_station_distance_m?: number;

  infrastructure_score?: number;
  environmental_risk?: number;

  waterbody_distance_m?: number;
  flood_risk?: string;

  building_density_pct?: number;
  average_building_height_m?: number;
  building_spacing_m?: number;

  green_cover_pct?: number;
  open_space_pct?: number;

  baseline_wind_speed_ms?: number;
  wind_speed_ms?: number;
  pedestrian_wind_comfort_pct?: number;

  utci_c?: number;
  heat_stress_pct?: number;
  cold_stress_pct?: number;

  daylight_availability_pct?: number;
  sky_view_factor_pct?: number;
  direct_sun_hours?: number;
  solar_radiation_kwh_m2?: number;

  distance_to_bmsit_m?: number;
  distance_to_bmsit_km?: number;

  study_zone?: string;

  suitability_score?: number;
  suitability_status?: string;
  risk_level?: string;
  confidence_level?: string;
};

function formatLabel(value?: string) {
  if (!value) return '—';

  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSuitabilityVariant(status?: string) {
  const value = status?.toUpperCase();

  if (value === 'HIGHLY_SUITABLE' || value === 'SUITABLE') {
    return 'success' as const;
  }

  if (value === 'MODERATE') {
    return 'warning' as const;
  }

  return 'danger' as const;
}

function getRiskVariant(risk?: string) {
  if (risk?.toLowerCase() === 'low') {
    return 'success' as const;
  }

  if (risk?.toLowerCase() === 'medium') {
    return 'warning' as const;
  }

  return 'danger' as const;
}

export function ParcelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [parcel, setParcel] = useState<ParcelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParcel = async () => {
      if (!id) {
        setError('Parcel ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await parcelService.getParcelById(id);

        if (!data) {
          throw new Error('Parcel not found.');
        }

        setParcel(data as unknown as ParcelData);
      } catch (err) {
        console.error('Failed to load parcel:', err);
        setError(`Unable to load parcel ${id}.`);
      } finally {
        setLoading(false);
      }
    };

    loadParcel();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <Card className="p-10 text-center">
          <Brain className="mx-auto text-blue-600 mb-4" size={40} />

          <h2 className="text-xl font-semibold text-gray-900">
            Loading BHUMI-X parcel intelligence...
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Fetching GIS, infrastructure, population and environmental data.
          </p>
        </Card>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <Card className="p-10 text-center">
          <AlertTriangle
            className="mx-auto text-red-500 mb-4"
            size={40}
          />

          <h2 className="text-xl font-semibold text-gray-900">
            Parcel unavailable
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error || 'The requested parcel could not be found.'}
          </p>

          <div className="mt-5">
            <Button
              variant="secondary"
              onClick={() => navigate('/explorer')}
            >
              Back to Explorer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const score = parcel.suitability_score ?? 0;
  const status = parcel.suitability_status ?? 'UNKNOWN';
  const risk = parcel.risk_level ?? 'unknown';
  const confidence = parcel.confidence_level ?? 'unknown';

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div
        className="text-sm text-gray-500 cursor-pointer hover:text-blue-600"
        onClick={() => navigate('/explorer')}
      >
        Explorer &gt; Parcel {parcel.parcel_id}
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>
          <div className="flex items-center gap-3">

            <h1 className="text-3xl font-bold text-gray-900">
              Parcel {parcel.parcel_id}
            </h1>

            <Badge variant={getSuitabilityVariant(status)}>
              {formatLabel(status)}
            </Badge>

          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <MapPin size={16} />
            <span>
              {parcel.study_zone || 'BMSIT Study Area'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">

          <Badge variant={confidence === 'high' ? 'success' : 'warning'}>
            {formatLabel(confidence)} Confidence
          </Badge>

          <div className="bg-white px-5 py-3 rounded-xl border shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-700">
              {score.toFixed(2)}
            </div>

            <div className="text-xs text-gray-400">
              Suitability / 100
            </div>
          </div>

        </div>

      </div>

      {/* =====================================================
          AI ASSESSMENT
      ===================================================== */}

      <Card className="p-6 border-blue-100">

        <div className="flex items-center gap-3 mb-5">

          <div className="p-3 bg-blue-50 rounded-xl">
            <Brain
              className="text-blue-600"
              size={26}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              BHUMI-X Suitability Assessment
            </h2>

            <p className="text-sm text-gray-500">
              Land intelligence generated from the BHUMI-X parcel dataset
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="bg-blue-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Suitability Score
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-1">
              {score.toFixed(2)}
            </p>

            <p className="text-xs text-gray-500">
              out of 100
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Classification
            </p>

            <p className="font-bold text-gray-900 mt-2">
              {formatLabel(status)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Confidence
            </p>

            <p className="font-bold text-gray-900 mt-2">
              {formatLabel(confidence)}
            </p>

            <p className="text-xs text-gray-500">
              Dataset confidence
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Risk Level
            </p>

            <p className="font-bold text-gray-900 mt-2 capitalize">
              {risk}
            </p>
          </div>

        </div>

      </Card>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* PARCEL DETAILS */}

          <Card className="p-6">

            <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b pb-3">
              Parcel Intelligence
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

              <div>
                <p className="text-sm text-gray-500">
                  Area
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.area_sq_m?.toLocaleString()} m²
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Land Use
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {formatLabel(parcel.land_use)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Ownership
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {formatLabel(parcel.ownership)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Study Zone
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.study_zone || '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Population / 500m
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.population_500m?.toLocaleString() || '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Population / 1 km
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.population_1km?.toLocaleString() || '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Population Density
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.population_density?.toLocaleString() || '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Infrastructure
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.infrastructure_score !== undefined
                    ? `${parcel.infrastructure_score}/100`
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Road Distance
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.road_distance_m !== undefined
                    ? `${parcel.road_distance_m} m`
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Nearest School
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.nearest_school_distance_m !== undefined
                    ? `${parcel.nearest_school_distance_m} m`
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Nearest Hospital
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.nearest_hospital_distance_m !== undefined
                    ? `${parcel.nearest_hospital_distance_m} m`
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  BMSIT Distance
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {parcel.distance_to_bmsit_km !== undefined
                    ? `${parcel.distance_to_bmsit_km.toFixed(2)} km`
                    : '—'}
                </p>
              </div>

            </div>

          </Card>

          {/* FACILITY ACCESS */}

          <Card className="p-6">

            <div className="flex items-center gap-2 mb-5">
              <Route className="text-blue-600" size={21} />

              <h2 className="text-lg font-semibold">
                Facility Accessibility
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {[
                {
                  label: 'School',
                  value: parcel.nearest_school_distance_m,
                  icon: Building2,
                },
                {
                  label: 'Hospital',
                  value: parcel.nearest_hospital_distance_m,
                  icon: ShieldCheck,
                },
                {
                  label: 'Fire Station',
                  value: parcel.nearest_fire_station_distance_m,
                  icon: ShieldCheck,
                },
                {
                  label: 'Police Station',
                  value: parcel.nearest_police_station_distance_m,
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <Icon size={18} className="text-blue-600" />

                    <p className="text-sm text-gray-500 mt-3">
                      {item.label}
                    </p>

                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {item.value !== undefined
                        ? `${item.value} m`
                        : '—'}
                    </p>
                  </div>
                );
              })}

            </div>

          </Card>

          {/* ENVIRONMENT */}

          <Card className="p-6">

            <div className="flex items-center gap-2 mb-5">

              <Wind
                className="text-blue-600"
                size={21}
              />

              <h2 className="text-lg font-semibold">
                Environmental Intelligence
              </h2>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              <div className="bg-gray-50 rounded-xl p-4">
                <Wind size={18} />

                <p className="text-sm text-gray-500 mt-2">
                  Wind Speed
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.wind_speed_ms?.toFixed(2) || '—'}
                  <span className="text-sm font-normal">
                    {' '}m/s
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <Thermometer size={18} />

                <p className="text-sm text-gray-500 mt-2">
                  UTCI
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.utci_c?.toFixed(2) || '—'}
                  <span className="text-sm font-normal">
                    °C
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <Thermometer size={18} />

                <p className="text-sm text-gray-500 mt-2">
                  Heat Stress
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.heat_stress_pct?.toFixed(1) || '—'}
                  <span className="text-sm font-normal">
                    %
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <Sun size={18} />

                <p className="text-sm text-gray-500 mt-2">
                  Daylight
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.daylight_availability_pct?.toFixed(1) || '—'}
                  <span className="text-sm font-normal">
                    %
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <TreePine size={18} />

                <p className="text-sm text-gray-500 mt-2">
                  Green Cover
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.green_cover_pct?.toFixed(1) || '—'}
                  <span className="text-sm font-normal">
                    %
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <Sun size={18} />

                <p className="text-sm text-gray-500 mt-2">
                  Solar Radiation
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.solar_radiation_kwh_m2?.toFixed(2) || '—'}
                  <span className="text-sm font-normal">
                    {' '}kWh/m²
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Open Space
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.open_space_pct?.toFixed(1) || '—'}%
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Building Density
                </p>

                <p className="text-xl font-bold mt-1">
                  {parcel.building_density_pct?.toFixed(1) || '—'}%
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Flood Risk
                </p>

                <p className="text-xl font-bold mt-1 capitalize">
                  {parcel.flood_risk || '—'}
                </p>
              </div>

            </div>

          </Card>

        </div>

        {/* ===================================================
            RIGHT
        =================================================== */}

        <div className="space-y-6">

          {/* WHY THIS PARCEL */}

          <Card className="p-6">

            <div className="flex items-center gap-2 mb-4">

              <CheckCircle2
                className="text-green-500"
                size={21}
              />

              <h2 className="text-lg font-semibold">
                Why this parcel?
              </h2>

            </div>

            <ul className="space-y-3 text-sm text-gray-700">

              {(parcel.population_1km ?? 0) >= 10000 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="text-green-500 shrink-0"
                    size={17}
                  />
                  Strong population coverage within 1 km.
                </li>
              )}

              {(parcel.nearest_school_distance_m ?? 9999) <= 500 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="text-green-500 shrink-0"
                    size={17}
                  />
                  Good school accessibility.
                </li>
              )}

              {(parcel.infrastructure_score ?? 0) >= 70 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="text-green-500 shrink-0"
                    size={17}
                  />
                  Strong infrastructure score.
                </li>
              )}

              {(parcel.environmental_risk ?? 100) <= 20 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="text-green-500 shrink-0"
                    size={17}
                  />
                  Low environmental risk.
                </li>
              )}

              {(parcel.heat_stress_pct ?? 100) === 0 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="text-green-500 shrink-0"
                    size={17}
                  />
                  No recorded heat-stress exposure.
                </li>
              )}

            </ul>

          </Card>

          {/* RISK */}

          <Card className="p-6">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-lg font-semibold">
                Risk Assessment
              </h2>

              <Badge variant={getRiskVariant(risk)}>
                {risk.toUpperCase()}
              </Badge>

            </div>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Environmental Risk
                </span>

                <span className="font-semibold">
                  {parcel.environmental_risk ?? '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Flood Risk
                </span>

                <span className="font-semibold capitalize">
                  {parcel.flood_risk || '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Waterbody Distance
                </span>

                <span className="font-semibold">
                  {parcel.waterbody_distance_m !== undefined
                    ? `${parcel.waterbody_distance_m} m`
                    : '—'}
                </span>
              </div>

            </div>

          </Card>

          {/* LOCATION */}

          <Card className="p-6">

            <div className="flex items-center gap-2 mb-4">

              <MapPin
                className="text-blue-600"
                size={20}
              />

              <h2 className="text-lg font-semibold">
                Location Intelligence
              </h2>

            </div>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Latitude
                </span>

                <span className="font-medium">
                  {parcel.latitude?.toFixed(6) || '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Longitude
                </span>

                <span className="font-medium">
                  {parcel.longitude?.toFixed(6) || '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  BMSIT Distance
                </span>

                <span className="font-medium">
                  {parcel.distance_to_bmsit_km !== undefined
                    ? `${parcel.distance_to_bmsit_km.toFixed(2)} km`
                    : '—'}
                </span>
              </div>

            </div>

          </Card>

          {/* ACTIONS */}

          <div className="space-y-3">

            <Button
              className="w-full"
              variant="primary"
              onClick={() =>
                navigate(`/simulator?parcel=${parcel.parcel_id}`)
              }
            >
              Simulate Impact
            </Button>

            <Button
              className="w-full"
              variant="secondary"
              onClick={() =>
                alert(
                  `BHUMI-X report prepared for ${parcel.parcel_id}`
                )
              }
            >
              Generate Report
            </Button>

            <Button
              className="w-full"
              variant="secondary"
              onClick={() => navigate('/explorer')}
            >
              Back to Explorer
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ParcelPage;