import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vehicle } from "../types";

interface VehicleState {
  vehicle: Vehicle;
  setupComplete: boolean;
  setVehicle: (v: Partial<Vehicle>) => void;
  setFuelPercent: (pct: number) => void;
  completeSetup: (v: Vehicle) => void;
  resetSetup: () => void;
}

const DEFAULT: Vehicle = {
  id: "my-car",
  name: "My Vehicle",
  brand: "",
  model: "",
  fuelType: "petrol",
  mileage: 16.5,
  tankCapacity: 45,
  fuelPercent: 50,
};

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      vehicle: DEFAULT,
      setupComplete: false,
      setVehicle: (v) =>
        set((s) => ({ vehicle: { ...s.vehicle, ...v } })),
      setFuelPercent: (pct) =>
        set((s) => ({
          vehicle: {
            ...s.vehicle,
            fuelPercent: Math.max(0, Math.min(100, pct)),
          },
        })),
      completeSetup: (v) =>
        set({ vehicle: v, setupComplete: true }),
      resetSetup: () =>
        set({ vehicle: DEFAULT, setupComplete: false }),
    }),
    { name: "fuelsafe-vehicle-v2" }
  )
);
