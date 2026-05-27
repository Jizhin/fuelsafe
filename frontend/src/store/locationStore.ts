import { create } from "zustand";
import type { Route } from "../types";

interface LatLon { lat: number; lon: number; }

interface LocationState {
  currentLocation: LatLon | null;
  destination: LatLon | null;
  heading: number;
  accuracy: number;
  activeRoute: Route | null;
  error: string | null;
  setCurrentLocation: (pos: LatLon) => void;
  setDestination: (pos: LatLon | null) => void;
  setHeading: (h: number) => void;
  setActiveRoute: (r: Route | null) => void;
  clearRoute: () => void;
  setError: (err: string) => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  currentLocation: null,
  destination: null,
  heading: 0,
  accuracy: 0,
  activeRoute: null,
  error: null,
  setCurrentLocation: (currentLocation) => set({ currentLocation, error: null }),
  setDestination: (destination) => set({ destination }),
  setHeading: (heading) => set({ heading }),
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  clearRoute: () => set({ activeRoute: null, destination: null }),
  setError: (error) => set({ error }),
}));
