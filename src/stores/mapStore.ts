import { create } from 'zustand';
import type { MapLayer } from '../types';



interface MapViewState {
  center: [number, number];
  zoom: number;
}

interface MapState {
  viewState: MapViewState;
  selectedParcelId: string | null;
  layers: MapLayer[];
  setViewState: (viewState: Partial<MapViewState>) => void;
  selectParcel: (id: string | null) => void;
  toggleLayer: (id: string) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
}

const defaultLayers: MapLayer[] = [
  { id: 'parcels', name: 'Land Parcels', visible: true, opacity: 1 },
  { id: 'satellite', name: 'Satellite Imagery', visible: false, opacity: 1 },
  { id: 'roads', name: 'Road Network', visible: true, opacity: 0.8 },
  { id: 'buildings', name: 'Building Footprints', visible: false, opacity: 0.8 },
  { id: 'water', name: 'Water Bodies', visible: true, opacity: 0.8 },
  { id: 'elevation', name: 'Elevation', visible: false, opacity: 0.5 },
  { id: 'zoning', name: 'Zoning Map', visible: false, opacity: 0.6 },
  { id: 'population', name: 'Population Density', visible: false, opacity: 0.7 },
  { id: 'facilities_health', name: 'Healthcare Facilities', visible: false, opacity: 1 },
  { id: 'facilities_edu', name: 'Educational Facilities', visible: false, opacity: 1 },
  { id: 'facilities_transit', name: 'Transit Stations', visible: false, opacity: 1 },
  { id: 'environmental_risk', name: 'Environmental Risk', visible: false, opacity: 0.6 },
  { id: 'heatmap', name: 'Suitability Heatmap', visible: true, opacity: 0.7 },
];

export const useMapStore = create<MapState>((set) => ({
  viewState: { center: [77.5963, 13.1007], zoom: 13 },
  selectedParcelId: null,
  layers: defaultLayers,
  
  setViewState: (newViewState) => set((state) => ({ 
    viewState: { ...state.viewState, ...newViewState } 
  })),
  
  selectParcel: (id) => set({ selectedParcelId: id }),
  
  toggleLayer: (id) => set((state) => ({
    layers: state.layers.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    )
  })),
  
  setLayerVisibility: (id, visible) => set((state) => ({
    layers: state.layers.map(layer => 
      layer.id === id ? { ...layer, visible } : layer
    )
  }))
}));
