import { create } from "zustand";
import type { Station } from "../types";

interface StationsState {
  stations: Station[];
  selectedStation: Station | null;
  loading: boolean;
  setStations: (s: Station[]) => void;
  setSelectedStation: (s: Station | null) => void;
  setLoading: (v: boolean) => void;
}

export const useStationsStore = create<StationsState>()((set) => ({
  stations: [],
  selectedStation: null,
  loading: false,
  setStations: (stations) => set({ stations }),
  setSelectedStation: (selectedStation) => set({ selectedStation }),
  setLoading: (loading) => set({ loading }),
}));
