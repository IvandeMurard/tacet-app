import { create } from "zustand";

// Properties matching paris-noise-iris.geojson feature properties
export interface IrisProperties {
  code_iris: string;
  name: string;
  c_ar: number;
  noise_level: number;
  day_level: number;
  night_level: number;
  description: string;
  source_type?: string;
  primary_sources?: string[];
}

interface MapState {
  selectedZone: IrisProperties | null;
  setSelectedZone: (zone: IrisProperties) => void;
  clearSelectedZone: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedZone: null,
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  clearSelectedZone: () => set({ selectedZone: null }),
}));
