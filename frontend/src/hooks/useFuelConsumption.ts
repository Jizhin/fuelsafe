import { useEffect, useRef } from "react";
import { useVehicleStore } from "../store/vehicleStore";

type LatLon = { lat: number; lon: number };

// Haversine great-circle distance in km
function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Tracks real GPS movement and decrements the stored fuel percentage.
 * Formula: fuelConsumed(L) = distanceKm / mileage(km/L)
 *          percentDrop = fuelConsumed / tankCapacity * 100
 *
 * Ignores jitter < 15 m between updates to avoid phantom consumption.
 */
export function useFuelConsumption(position: LatLon | null) {
  const vehicle        = useVehicleStore((s) => s.vehicle);
  const setFuelPercent = useVehicleStore((s) => s.setFuelPercent);

  // Keep a ref so the effect closure always reads the latest vehicle values
  const vehicleRef  = useRef(vehicle);
  const prevPosRef  = useRef<LatLon | null>(null);
  useEffect(() => { vehicleRef.current = vehicle; }, [vehicle]);

  useEffect(() => {
    if (!position) return;

    const prev = prevPosRef.current;
    prevPosRef.current = { lat: position.lat, lon: position.lon };

    if (!prev) return;

    const distKm = haversineKm(prev, position);
    if (distKm < 0.015) return; // ignore GPS jitter < 15 m

    const v = vehicleRef.current;
    const fuelConsumedL  = distKm / v.mileage;
    const percentDrop    = (fuelConsumedL / v.tankCapacity) * 100;
    const newPct         = Math.max(0, v.fuelPercent - percentDrop);

    // Round to 1 decimal place so the gauge doesn't flicker
    setFuelPercent(Math.round(newPct * 10) / 10);
  }, [position?.lat, position?.lon]);
}
