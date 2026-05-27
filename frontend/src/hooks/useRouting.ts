import { useEffect } from "react";
import { useLocationStore } from "../store/locationStore";
import { useStationsStore } from "../store/stationsStore";
import { getRoute } from "../services/routing";

export function useRoutingToStation() {
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const setActiveRoute   = useLocationStore((s) => s.setActiveRoute);
  const selectedStation  = useStationsStore((s) => s.selectedStation);

  useEffect(() => {
    if (!currentLocation || !selectedStation) {
      setActiveRoute(null);
      return;
    }
    let cancelled = false;
    getRoute(currentLocation, { lat: selectedStation.lat, lon: selectedStation.lon }).then(
      (route) => { if (!cancelled && route) setActiveRoute(route); }
    );
    return () => { cancelled = true; };
  }, [
    selectedStation?.id,
    // Re-route when position changes by ~200m (3 decimal places ≈ 111m)
    currentLocation?.lat.toFixed(3),
    currentLocation?.lon.toFixed(3),
  ]);
}
