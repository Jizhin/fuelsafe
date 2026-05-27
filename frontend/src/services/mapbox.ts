import type { Route, LatLon } from '../types';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export async function getRoute(from: LatLon, to: LatLon): Promise<Route | null> {
  if (!TOKEN) { console.warn('No Mapbox token'); return null; }
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${from.lon},${from.lat};${to.lon},${to.lat}?geometries=geojson&overview=full&access_token=${TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes?.length) return null;
    const r = data.routes[0];
    return {
      geometry: r.geometry,
      distanceKm: +(r.distance / 1000).toFixed(2),
      durationMin: Math.round(r.duration / 60),
    };
  } catch { return null; }
}

export async function reverseGeocode(pos: LatLon): Promise<string> {
  if (!TOKEN) return `${pos.lat.toFixed(4)}, ${pos.lon.toFixed(4)}`;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${pos.lon},${pos.lat}.json?types=place,locality,neighborhood&access_token=${TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.features?.[0]?.place_name?.split(',')[0] ?? 'Current Location';
  } catch { return 'Current Location'; }
}
