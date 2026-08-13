// =============================================================================
// BHUMI-X Type Definitions
// Government Land Intelligence & Decision Engine
// =============================================================================

// --- Enums & Literal Types ---

export type SuitabilityStatus =
  | 'HIGHLY_SUITABLE'
  | 'SUITABLE'
  | 'MODERATE'
  | 'UNSUITABLE';

export type ConfidenceLevel =
  | 'high'
  | 'medium'
  | 'low';

export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type OwnershipType =
  | 'government'
  | 'private'
  | 'disputed'
  | 'unknown';

export type LandUseType =
  | 'institutional'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'mixed_use'
  | 'open_space'
  | 'vacant'
  | 'forest'
  | 'wetland';

export type FloodRisk =
  | 'low'
  | 'moderate'
  | 'high';

export type StudyZone =
  | 'BMSIT_CORE'
  | 'INNER_URBAN'
  | 'OUTER_URBAN';

export type FacilityType =
  | 'school'
  | 'hospital'
  | 'fire_station'
  | 'police_station'
  | 'bus_terminal'
  | 'public_office'
  | 'waste_management'
  | 'other';

export type OptimizationObjective =
  | 'population_coverage'
  | 'travel_distance'
  | 'development_cost'
  | 'environmental_impact'
  | 'balanced';

export type AnalysisStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';


// =============================================================================
// GEOMETRY
// =============================================================================

export interface ParcelGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}


// =============================================================================
// PARCEL
// =============================================================================

export interface Parcel {

  // ----------------------------------------------------------
  // Identity
  // ----------------------------------------------------------

  parcel_id: string;

  // ----------------------------------------------------------
  // Basic land information
  // ----------------------------------------------------------

  area_sq_m: number;

  land_use: LandUseType;

  // ----------------------------------------------------------
  // Population
  // ----------------------------------------------------------

  population_500m: number;

  population_1km: number;

  population_density: number;

  // ----------------------------------------------------------
  // Accessibility
  // ----------------------------------------------------------

  road_distance_m: number;

  nearest_road_width_m: number;

  nearest_school_distance_m: number;

  nearest_hospital_distance_m: number;

  nearest_fire_station_distance_m: number;

  nearest_police_station_distance_m: number;

  // ----------------------------------------------------------
  // Infrastructure & environmental risk
  // ----------------------------------------------------------

  infrastructure_score: number;

  environmental_risk: number;

  waterbody_distance_m: number;

  flood_risk: FloodRisk;

  // ----------------------------------------------------------
  // Urban morphology
  // ----------------------------------------------------------

  building_density_pct: number;

  average_building_height_m: number;

  building_spacing_m: number;

  green_cover_pct: number;

  open_space_pct: number;

  // ----------------------------------------------------------
  // Wind
  // ----------------------------------------------------------

  baseline_wind_speed_ms: number;

  wind_speed_ms: number;

  pedestrian_wind_comfort_pct: number;

  // ----------------------------------------------------------
  // Thermal comfort
  // ----------------------------------------------------------

  utci_c: number;

  heat_stress_pct: number;

  cold_stress_pct: number;

  // ----------------------------------------------------------
  // Daylight / solar
  // ----------------------------------------------------------

  daylight_availability_pct: number;

  sky_view_factor_pct: number;

  direct_sun_hours: number;

  solar_radiation_kwh_m2: number;

  // ----------------------------------------------------------
  // BMSIT / study zone
  // ----------------------------------------------------------

  distance_to_bmsit_m: number;

  distance_to_bmsit_km: number;

  study_zone: StudyZone;

  // ----------------------------------------------------------
  // AI outputs
  // ----------------------------------------------------------

  suitability_score: number;

  suitability_status: SuitabilityStatus;

  risk_level: RiskLevel;

  confidence_level: ConfidenceLevel;

  // ----------------------------------------------------------
  // Geometry
  // ----------------------------------------------------------

  geometry?: ParcelGeometry;
}


// =============================================================================
// GEOJSON
// =============================================================================

export interface GeoJSONFeature {
  type: 'Feature';

  id: string;

  geometry: ParcelGeometry;

  properties: Record<string, unknown>;
}


export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';

  features: GeoJSONFeature[];
}


// =============================================================================
// ANALYSIS
// =============================================================================

export interface AnalysisWeights {
  population: number;
  accessibility: number;
  land_suitability: number;
  environment: number;
  facility_gap: number;
  infrastructure: number;
}


export interface AnalysisFilters {
  max_road_distance?: number;

  max_transport_distance?: number;

  min_population_served?: number;

  environmental_risk?: RiskLevel;

  ownership_type?: OwnershipType;

  land_use_compatibility?: LandUseType[];

  existing_facility_distance?: number;
}


export interface AnalysisRequest {
  region: string;

  facility: FacilityType;

  minimum_area: number;

  objective: OptimizationObjective;

  weights: AnalysisWeights;

  filters?: AnalysisFilters;
}


export interface ScoreBreakdown {
  population_score: number;

  accessibility_score: number;

  land_suitability_score: number;

  environment_score: number;

  facility_gap_score: number;

  infrastructure_score: number;
}


export interface Recommendation {
  parcel_id: string;

  overall_score: number;

  confidence: ConfidenceLevel;

  scores: ScoreBreakdown;

  risk_level: RiskLevel;

  recommendation: SuitabilityStatus;

  reasons: string[];

  warnings: string[];
}


export interface AnalysisResult {
  analysis_id: string;

  status: AnalysisStatus;

  region: string;

  facility: FacilityType;

  objective: OptimizationObjective;

  parcels_analyzed: number;

  suitable_parcels: number;

  recommendations: Recommendation[];

  created_at: string;

  completed_at?: string;
}


export interface AnalysisProgressStep {
  label: string;

  status:
    | 'completed'
    | 'active'
    | 'pending';
}


// =============================================================================
// REPORTS
// =============================================================================

export interface Report {
  report_id: string;

  analysis_id: string;

  region: string;

  facility: FacilityType;

  date: string;

  status:
    | 'completed'
    | 'draft'
    | 'generating';

  top_parcel: string;

  top_score: number;
}


// =============================================================================
// IMPACT SIMULATION
// =============================================================================

export interface ImpactMetric {
  label: string;

  before: number;

  after: number;

  unit: string;

  improvement_pct: number;
}


export interface ImpactSimulationResult {
  parcel_id: string;

  facility: FacilityType;

  population_radius: number;

  metrics: ImpactMetric[];

  additional_population_served: number;
}


// =============================================================================
// DATA HEALTH
// =============================================================================

export interface DataHealthMetric {
  label: string;

  value: number;

  total?: number;

  unit?: string;

  status:
    | 'good'
    | 'warning'
    | 'critical';
}


export interface DataHealthReport {
  total_parcels: number;

  valid_geometries: number;

  invalid_geometries: number;

  land_use_completeness: number;

  ownership_completeness: number;

  data_freshness: string;

  environmental_data_available: boolean;

  metrics: DataHealthMetric[];
}


// =============================================================================
// MAP
// =============================================================================

export interface MapLayer {
  id: string;

  name: string;

  category:
    | 'base'
    | 'land'
    | 'infrastructure'
    | 'population'
    | 'environment';

  visible: boolean;

  type:
    | 'fill'
    | 'line'
    | 'circle'
    | 'raster'
    | 'symbol';
}


export interface MapViewState {
  center: [number, number];

  zoom: number;

  pitch?: number;

  bearing?: number;
}


// =============================================================================
// API
// =============================================================================

export interface ApiError {
  error: {
    code: string;

    message: string;

    details?: Record<string, unknown>;
  };
}


export interface ApiResponse<T> {
  data: T;

  meta?: {
    total?: number;

    page?: number;

    per_page?: number;
  };
}


// =============================================================================
// OVERVIEW
// =============================================================================

export interface OverviewStats {
  total_parcels: number;

  parcels_analyzed: number;

  suitable_candidates: number;

  recommended_locations: number;
}


export interface RecentAnalysis {
  analysis_id: string;

  region: string;

  facility: FacilityType;

  date: string;

  status: AnalysisStatus;

  top_score: number;
}


// =============================================================================
// REGION
// =============================================================================

export interface Region {
  id: string;

  name: string;

  center: [number, number];

  bounds: [
    [number, number],
    [number, number]
  ];
}


// =============================================================================
// FACILITY INFO
// =============================================================================

export interface FacilityInfo {
  type: FacilityType;

  label: string;

  description: string;

  icon: string;

  default_min_area: number;
}