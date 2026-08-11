// =============================================================================
// BHUMI-X Type Definitions
// Government Land Intelligence & Decision Engine
// =============================================================================

// --- Enums & Literal Types ---

export type SuitabilityStatus = 'highly_suitable' | 'suitable' | 'moderate' | 'unsuitable' | 'restricted';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type OwnershipType = 'government' | 'private' | 'disputed' | 'unknown';
export type LandUseType =
  | 'institutional'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'mixed'
  | 'vacant'
  | 'forest'
  | 'wetland';

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

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

// --- Geometry ---

export interface ParcelGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

// --- Parcel ---

export interface Parcel {
  parcel_id: string;
  geometry: ParcelGeometry;
  area: number;
  land_use: LandUseType;
  ownership: OwnershipType;
  location: string;
  suitability_status?: SuitabilityStatus;
  suitability_score?: number;
  population_nearby?: number;
  distance_to_road?: number;
  nearest_facility_distance?: number;
  environmental_risk?: RiskLevel;
  data_freshness?: string;
}

// --- GeoJSON ---

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

// --- Analysis ---

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
  status: 'completed' | 'active' | 'pending';
}

// --- Reports ---

export interface Report {
  report_id: string;
  analysis_id: string;
  region: string;
  facility: FacilityType;
  date: string;
  status: 'completed' | 'draft' | 'generating';
  top_parcel: string;
  top_score: number;
}

// --- Impact Simulation ---

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

// --- Data Health ---

export interface DataHealthMetric {
  label: string;
  value: number;
  total?: number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
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

// --- Map ---

export interface MapLayer {
  id: string;
  name: string;
  category: 'base' | 'land' | 'infrastructure' | 'population' | 'environment';
  visible: boolean;
  type: 'fill' | 'line' | 'circle' | 'raster' | 'symbol';
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
}

// --- API ---

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

// --- Overview ---

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

// --- Region ---

export interface Region {
  id: string;
  name: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
}

// --- Facility Info ---

export interface FacilityInfo {
  type: FacilityType;
  label: string;
  description: string;
  icon: string;
  default_min_area: number;
}
