import type { Route, LatLon } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

export async function getRoute(from: LatLon, to: LatLon): Promise<Route | null> {
  try {
    const res = await fetch(`${API_BASE}/api/route/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_lat: from.lat,
        from_lon: from.lon,
        to_lat: to.lat,
        to_lon: to.lon,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      geometry: data.geometry,
      distanceKm: data.distance_km,
      durationMin: data.duration_min,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(pos: LatLon): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lon}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return "Current Location";
    const d = await res.json();
    return (
      d.address?.suburb ||
      d.address?.neighbourhood ||
      d.address?.city_district ||
      d.address?.city ||
      d.address?.town ||
      d.address?.village ||
      "Current Location"
    );
  } catch {
    return "Current Location";
  }
}
