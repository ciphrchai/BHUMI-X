import type { Parcel, GeoJSONFeatureCollection } from '../types';

export const mockParcels: Parcel[] = [
  {
    location: "Yelahanka, Bengaluru",
  parcel_id: 'A102',
    area: 18420,
    land_use: 'institutional',
    ownership: 'government',
    suitability_status: 'highly_suitable',
    suitability_score: 91,
    population_nearby: 31240,
    distance_to_road: 1.2,
    environmental_risk: 'low',
    geometry: {
      type: 'Polygon',
      coordinates: [[[77.5940, 13.1020], [77.5955, 13.1020], [77.5955, 13.1035], [77.5940, 13.1035], [77.5940, 13.1020]]]
    }
  },
  {
    location: "Yelahanka, Bengaluru",
  parcel_id: 'C221',
    area: 12800,
    land_use: 'vacant',
    ownership: 'government',
    suitability_status: 'suitable',
    suitability_score: 88,
    population_nearby: 28100,
    distance_to_road: 0.8,
    environmental_risk: 'low',
    geometry: {
      type: 'Polygon',
      coordinates: [[[77.5980, 13.0990], [77.5995, 13.0990], [77.5995, 13.1005], [77.5980, 13.1005], [77.5980, 13.0990]]]
    }
  },
  {
    location: "Yelahanka, Bengaluru",
  parcel_id: 'D441',
    area: 22100,
    land_use: 'institutional',
    ownership: 'government',
    suitability_status: 'suitable',
    suitability_score: 84,
    population_nearby: 24500,
    distance_to_road: 1.5,
    environmental_risk: 'low',
    geometry: {
      type: 'Polygon',
      coordinates: [[[77.6020, 13.1050], [77.6040, 13.1050], [77.6040, 13.1070], [77.6020, 13.1070], [77.6020, 13.1050]]]
    }
  },
  {
    location: "Yelahanka, Bengaluru",
  parcel_id: 'B305',
    area: 15600,
    land_use: 'vacant',
    ownership: 'government',
    suitability_status: 'suitable',
    suitability_score: 82,
    population_nearby: 19800,
    distance_to_road: 0.6,
    environmental_risk: 'medium',
    geometry: {
      type: 'Polygon',
      coordinates: [[[77.5900, 13.1000], [77.5915, 13.1000], [77.5915, 13.1015], [77.5900, 13.1015], [77.5900, 13.1000]]]
    }
  },
  {
    location: "Yelahanka, Bengaluru",
  parcel_id: 'A207',
    area: 9800,
    land_use: 'mixed',
    ownership: 'government',
    suitability_status: 'moderate',
    suitability_score: 80,
    population_nearby: 22300,
    distance_to_road: 2.1,
    environmental_risk: 'low',
    geometry: {
      type: 'Polygon',
      coordinates: [[[77.5950, 13.1080], [77.5960, 13.1080], [77.5960, 13.1090], [77.5950, 13.1090], [77.5950, 13.1080]]]
    }
  },
  ...Array.from({ length: 25 }).map((_, i) => {
    const baselng = 77.58 + Math.random() * 0.04;
    const baselat = 13.09 + Math.random() * 0.03;
    return {
      location: "Yelahanka, Bengaluru",
  parcel_id: `M${100 + i}`,
      area: Math.floor(Math.random() * 48000) + 2000,
      land_use: ['residential', 'commercial', 'industrial', 'vacant', 'agricultural', 'mixed'][Math.floor(Math.random() * 6)] as any,
      ownership: ['government', 'private', 'unknown'][Math.floor(Math.random() * 3)] as any,
      suitability_status: ['unsuitable', 'restricted', 'moderate', 'unknown'][Math.floor(Math.random() * 4)] as any,
      suitability_score: Math.floor(Math.random() * 60) + 10,
      population_nearby: Math.floor(Math.random() * 30000) + 1000,
      distance_to_road: Number((Math.random() * 5).toFixed(1)),
      environmental_risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[baselng, baselat], [baselng + 0.001, baselat], [baselng + 0.001, baselat + 0.001], [baselng, baselat + 0.001], [baselng, baselat]]]
      }
    };
  })
];

export const parcelsGeoJSON: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: mockParcels.map(p => ({
    type: 'Feature' as const,
    id: p.parcel_id,
    geometry: p.geometry,
    properties: {
      location: "Yelahanka, Bengaluru",
  parcel_id: p.parcel_id,
      area: p.area,
      land_use: p.land_use,
      ownership: p.ownership,
      suitability_status: p.suitability_status,
      suitability_score: p.suitability_score,
      population_nearby: p.population_nearby,
      distance_to_road: p.distance_to_road,
      environmental_risk: p.environmental_risk,
    }
  }))
};
