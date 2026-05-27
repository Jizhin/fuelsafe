import { create } from "zustand";
import type { WeatherInfo } from "../types";

type NavTab = "map" | "alerts" | "trips" | "vehicle" | "profile";
type PanelId = "route" | "vehicle" | "alerts" | null;

interface UIState {
  activeTab: NavTab;
  activePanel: PanelId;
  alertCount: number;
  alertMsg: string | null;
  showVehicleEditor: boolean;
  emergencyMode: boolean;
  weather: WeatherInfo | null;
  setActiveTab: (t: NavTab) => void;
  setActivePanel: (p: PanelId) => void;
  incrementAlerts: () => void;
  showAlert: (msg: string) => void;
  clearAlert: () => void;
  setShowVehicleEditor: (v: boolean) => void;
  setEmergencyMode: (v: boolean) => void;
  setWeather: (w: WeatherInfo) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeTab: "map",
  activePanel: null,
  alertCount: 0,
  alertMsg: null,
  showVehicleEditor: false,
  emergencyMode: false,
  weather: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  setActivePanel: (activePanel) => set({ activePanel }),
  incrementAlerts: () => set((s) => ({ alertCount: s.alertCount + 1 })),
  showAlert: (alertMsg) => {
    set({ alertMsg });
    setTimeout(() => set({ alertMsg: null }), 5000);
  },
  clearAlert: () => set({ alertMsg: null }),
  setShowVehicleEditor: (showVehicleEditor) => set({ showVehicleEditor }),
  setEmergencyMode: (emergencyMode) => set({ emergencyMode }),
  setWeather: (weather) => set({ weather }),
}));
