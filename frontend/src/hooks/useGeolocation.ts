import { useEffect, useRef, useState } from "react";
import { useLocationStore } from "../store/locationStore";
import { useUIStore } from "../store/uiStore";

interface GeoState {
  position: { lat: number; lon: number } | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeoState {
  const setCurrentLocation = useLocationStore((s) => s.setCurrentLocation);
  const setError = useLocationStore((s) => s.setError);
  const showAlert = useUIStore((s) => s.showAlert);
  const watchId = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [position, setPos] = useState<GeoState["position"]>(null);
  const [error, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      const msg = "Geolocation not supported by this browser";
      setError(msg);
      setLocalError(msg);
      setLoading(false);
      return;
    }
    const options: PositionOptions = { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 };
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCurrentLocation(p);
        setPos(p);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLocalError(err.message);
        setLoading(false);
        if (err.code === 1) showAlert("Location permission denied. Enable location to use FuelSafe.");
      },
      options
    );
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return { position, error, loading };
}
