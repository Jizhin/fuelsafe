import { useQuery } from "@tanstack/react-query";
import { useVehicleStore } from "../store/vehicleStore";
import { fetchNearbyStations } from "../services/overpass";
import { estimatedRange } from "../services/fuelCalc";
import type { Station } from "../types";

interface LatLon { lat: number; lon: number; }

export function useNearbyStations(position: LatLon | null, weatherFactor = 1.0) {
  const vehicle = useVehicleStore((s) => s.vehicle);

  const rangeKm = estimatedRange(vehicle, weatherFactor);
  const searchRadius = Math.max(5000, Math.min(rangeKm * 1000 * 1.2, 25000));

  return useQuery<Station[]>({
    queryKey: ["stations", position?.lat.toFixed(3), position?.lon.toFixed(3), vehicle.fuelPercent],
    queryFn: () => fetchNearbyStations(position!, searchRadius, vehicle, weatherFactor),
    enabled: !!position,
    staleTime: 60_000,
    refetchInterval: 90_000,
  });
}
