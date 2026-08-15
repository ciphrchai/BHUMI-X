import { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Leaf, Sun, TriangleAlert, Wind } from 'lucide-react';

import PlanningScene from '../components/urban-planning/PlanningScene';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import * as parcelService from '../services/parcelService';
import { useMapStore } from '../stores';
import type { GeoJSONFeatureCollection, Parcel } from '../types';

const number = (value: number | undefined, digits = 0) => Number.isFinite(value) ? Number(value).toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: digits }) : 'Data unavailable';
const label = (value: string | undefined) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Data unavailable';

function recommendations(parcel: Parcel) {
  const positives = [
    parcel.suitability_score >= 80 && 'High land suitability',
    parcel.road_distance_m <= 250 && 'Strong accessibility',
    parcel.infrastructure_score >= 60 && 'Suitable infrastructure',
    parcel.daylight_availability_pct >= 65 && 'Adequate daylight potential',
    parcel.solar_radiation_kwh_m2 >= 4 && 'Favorable solar exposure',
  ].filter(Boolean) as string[];
  const warnings = [
    parcel.heat_stress_pct > 20 && 'Elevated heat stress — prioritize cooling landscape',
    parcel.green_cover_pct < 15 && 'Low green cover — increase landscaped area',
    parcel.open_space_pct < 25 && 'Limited open space — protect circulation and setback area',
    parcel.flood_risk.toLowerCase() === 'high' && 'Flood risk requires mitigation',
    parcel.environmental_risk >= 40 && 'Higher environmental risk requires review',
    parcel.daylight_availability_pct < 45 && 'Lower daylight potential — assess massing setbacks',
  ].filter(Boolean) as string[];
  return { positives, warnings };
}

function Metric({ label: title, value, accent = 'text-slate-900' }: { label: string; value: string; accent?: string }) {
  return <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-2 last:border-0"><span className="text-xs text-slate-500">{title}</span><span className={`text-sm font-semibold ${accent}`}>{value}</span></div>;
}

export function UrbanPlanningPage() {
  const selectedParcelId = useMapStore((state) => state.selectedParcelId);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [geojson, setGeojson] = useState<GeoJSONFeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([parcelService.getParcels(), parcelService.getParcelGeoJSON()])
      .then(([parcels, mapData]) => {
        const floodRank = (risk: string) => ({ low: 0, moderate: 1, high: 2 }[risk.toLowerCase()] ?? 3);
        const ranked = [...parcels].filter((item) => Number.isFinite(item.suitability_score)).sort((a, b) =>
          b.suitability_score - a.suitability_score || a.environmental_risk - b.environmental_risk ||
          floodRank(a.flood_risk) - floodRank(b.flood_risk) || b.infrastructure_score - a.infrastructure_score || a.road_distance_m - b.road_distance_m
        );
        const explorerSelection = parcels.find((item) => item.parcel_id === selectedParcelId);
        if (!cancelled) { setParcel(explorerSelection ?? ranked[0] ?? null); setGeojson(mapData); }
      })
      .catch(() => { if (!cancelled) setError('Planning intelligence could not be loaded. Check the BHUMI-X backend connection.'); });
    return () => { cancelled = true; };
  }, [selectedParcelId]);

  const insight = useMemo(() => parcel ? recommendations(parcel) : null, [parcel]);
  if (error) return <div className="page-container"><PageHeader title="Urban Planning 3D" description="Future City Intelligence" /><Card className="text-red-700">{error}</Card></div>;
  if (!parcel || !geojson) return <div className="page-container"><PageHeader title="Urban Planning 3D" description="Future City Intelligence" /><Card className="py-14 text-center"><Building2 className="mx-auto mb-3 h-8 w-8 text-blue-600" /><p className="font-semibold">Analyzing candidate parcel...</p><p className="mt-1 text-sm text-slate-500">Loading GIS intelligence and generating a planning scenario.</p></Card></div>;

  const height = Math.max(4, Number.isFinite(parcel.average_building_height_m) ? parcel.average_building_height_m : 12);
  const footprint = Math.min(parcel.area_sq_m * 0.72, Math.max(parcel.area_sq_m * 0.12, parcel.area_sq_m * parcel.building_density_pct / 100));
  const floors = Math.max(1, Math.round(height / 3.2));
  return <div className="page-container space-y-5">
    <PageHeader title="Urban Planning 3D" description="Transform land intelligence into a future development scenario." />
    <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold tracking-widest text-blue-700">BEST CANDIDATE PARCEL</p><h2 className="mt-1 text-xl font-bold text-slate-900">{parcel.parcel_id}</h2><p className="mt-1 text-sm text-slate-600">Highest-ranked suitable parcel from the BHUMI-X master dataset.</p></div><div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4"><Metric label="Suitability" value={`${number(parcel.suitability_score, 1)} / 100`} accent="text-green-700" /><Metric label="Status" value={label(parcel.suitability_status)} /><Metric label="Confidence" value={label(parcel.confidence_level)} /><Metric label="Study zone" value={label(parcel.study_zone)} /></div></div>
    </Card>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <PlanningScene parcel={parcel} geojson={geojson} />
      <aside className="space-y-4"><Card><h2 className="font-bold text-slate-900">Urban Planning Intelligence</h2><p className="mt-1 text-xs text-slate-500">Prototype decision-support indicators</p><h3 className="mt-4 text-xs font-bold tracking-wider text-slate-500">SELECTED PARCEL</h3><Metric label="Land use" value={label(parcel.land_use)} /><Metric label="Area" value={`${number(parcel.area_sq_m)} m²`} /><Metric label="Road distance" value={`${number(parcel.road_distance_m)} m`} /></Card>
      <Card><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-600" /><h3 className="text-sm font-bold">PROPOSED DEVELOPMENT</h3></div><Metric label="Building height" value={`${number(height, 1)} m`} /><Metric label="Estimated floors" value={`${floors} (indicative)`} /><Metric label="Building footprint" value={`${number(footprint)} m²`} /><Metric label="Open space" value={`${number(parcel.open_space_pct, 1)}%`} /><Metric label="Green cover" value={`${number(parcel.green_cover_pct, 1)}%`} /></Card>
      <Card><div className="flex items-center gap-2"><Wind className="h-4 w-4 text-blue-600" /><h3 className="text-sm font-bold">ENVIRONMENTAL INTELLIGENCE</h3></div><Metric label="Wind speed" value={`${number(parcel.wind_speed_ms, 1)} m/s`} /><Metric label="Pedestrian comfort" value={`${number(parcel.pedestrian_wind_comfort_pct)}%`} /><Metric label="Solar radiation" value={`${number(parcel.solar_radiation_kwh_m2, 1)} kWh/m²`} /><Metric label="Direct sun" value={`${number(parcel.direct_sun_hours, 1)} hours`} /><Metric label="UTCI" value={`${number(parcel.utci_c, 1)} °C`} /><Metric label="Heat stress" value={`${number(parcel.heat_stress_pct, 1)}%`} /><Metric label="Daylight availability" value={`${number(parcel.daylight_availability_pct)}%`} /><Metric label="Sky view factor" value={`${number(parcel.sky_view_factor_pct)}%`} /></Card>
      <Card><h3 className="text-sm font-bold">RISK</h3><Metric label="Flood risk" value={label(parcel.flood_risk)} /><Metric label="Environmental risk" value={number(parcel.environmental_risk, 1)} /><Metric label="Waterbody distance" value={`${number(parcel.waterbody_distance_m)} m`} /></Card></aside>
    </div>
    <Card><div className="flex items-center gap-2"><Leaf className="h-5 w-5 text-green-600" /><h2 className="font-bold">Planning Intelligence</h2></div><div className="mt-3 grid gap-4 md:grid-cols-2"><div>{insight?.positives.length ? insight.positives.map((item) => <p key={item} className="mb-2 flex gap-2 text-sm text-slate-700"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />{item}</p>) : <p className="text-sm text-slate-500">No strong positive indicators are available.</p>}</div><div>{insight?.warnings.length ? insight.warnings.map((item) => <p key={item} className="mb-2 flex gap-2 text-sm text-slate-700"><TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />{item}</p>) : <p className="flex gap-2 text-sm text-slate-600"><Sun className="h-4 w-4 text-amber-500" />No threshold-based planning warnings detected.</p>}</div></div></Card>
    <p className="pb-6 text-xs text-slate-500">This is a data-driven planning scenario for demonstration and decision support. It is not an approved development, architectural plan, CFD study, or structural validation.</p>
  </div>;
}
