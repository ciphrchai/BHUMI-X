import { create } from 'zustand';
import type { FacilityType, AnalysisWeights, AnalysisResult, AnalysisStatus, OptimizationObjective, AnalysisFilters } from '../types';

const DEFAULT_WEIGHTS: AnalysisWeights = {
  population: 0.25,
  accessibility: 0.20,
  land_suitability: 0.20,
  environment: 0.15,
  facility_gap: 0.10,
  infrastructure: 0.10,
};

interface AnalysisState {
  selectedRegion: string;
  selectedFacility: FacilityType | null;
  minimumArea: number;
  objective: OptimizationObjective;
  weights: AnalysisWeights;
  filters: AnalysisFilters;
  currentAnalysisId: string | null;
  analysisStatus: AnalysisStatus | null;
  analysisResult: AnalysisResult | null;
  setRegion: (region: string) => void;
  setFacility: (facility: FacilityType) => void;
  setMinimumArea: (area: number) => void;
  setObjective: (objective: OptimizationObjective) => void;
  setWeights: (weights: AnalysisWeights) => void;
  updateWeight: (key: keyof AnalysisWeights, value: number) => void;
  setFilters: (filters: AnalysisFilters) => void;
  setAnalysisId: (id: string) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  selectedRegion: '',
  selectedFacility: null,
  minimumArea: 1000,
  objective: 'population_coverage',
  weights: { ...DEFAULT_WEIGHTS },
  filters: {},
  currentAnalysisId: null,
  analysisStatus: null,
  analysisResult: null,

  setRegion: (region) => set({ selectedRegion: region }),
  setFacility: (facility) => set({ selectedFacility: facility }),
  setMinimumArea: (area) => set({ minimumArea: area }),
  setObjective: (objective) => set({ objective }),
  setWeights: (weights) => set({ weights }),
  
  updateWeight: (key, value) => set((state) => {
    let newValue = Math.max(0.05, Math.min(0.95, value));
    const currentWeights = state.weights;
    
    // Calculate sum of other weights
    let otherSum = 0;
    const otherKeys = (Object.keys(currentWeights) as Array<keyof AnalysisWeights>).filter(k => k !== key);
    for (const k of otherKeys) {
      otherSum += currentWeights[k];
    }
    
    const remaining = 1.0 - newValue;
    const newWeights = { ...currentWeights };
    newWeights[key] = newValue;
    
    if (otherSum === 0) {
      // If others are somehow 0, distribute equally
      const equalShare = remaining / otherKeys.length;
      for (const k of otherKeys) {
        newWeights[k] = parseFloat(equalShare.toFixed(2));
      }
    } else {
      // Distribute proportionally
      for (const k of otherKeys) {
        let val = (currentWeights[k] / otherSum) * remaining;
        if (val < 0.05) val = 0.05;
        newWeights[k] = val;
      }
    }
    
    // Final normalization to guarantee exact 1.0 due to rounding
    let finalSum = 0;
    for (const k of Object.keys(newWeights) as Array<keyof AnalysisWeights>) {
      finalSum += newWeights[k];
    }
    
    for (const k of otherKeys) {
      newWeights[k] = parseFloat((newWeights[k] / finalSum).toFixed(2));
    }
    
    // Fix any rounding error on the last key to strictly ensure total is 1.0
    const lastKey = otherKeys[otherKeys.length - 1];
    let sumWithoutLast = newWeights[key];
    for (let i = 0; i < otherKeys.length - 1; i++) {
        sumWithoutLast += newWeights[otherKeys[i]];
    }
    newWeights[lastKey] = parseFloat((1.0 - sumWithoutLast).toFixed(2));
    
    return { weights: newWeights };
  }),

  setFilters: (filters) => set({ filters }),
  setAnalysisId: (id) => set({ currentAnalysisId: id }),
  setAnalysisStatus: (status) => set({ analysisStatus: status }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  
  reset: () => set({
    selectedRegion: '',
    selectedFacility: null,
    minimumArea: 1000,
    objective: 'population_coverage',
    weights: { ...DEFAULT_WEIGHTS },
    filters: {},
    currentAnalysisId: null,
    analysisStatus: null,
    analysisResult: null,
  })
}));
