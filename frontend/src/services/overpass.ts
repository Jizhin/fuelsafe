import type { Station, LatLon } from "../types";
import { reachability, fuelAfterArrival } from "./fuelCalc";
import type { Vehicle } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const BRAND_MAP: Record<string, string> = {
  indianoil: "IndianOil", ioc: "IndianOil",
  hp: "HPCL", hpcl: "HPCL", "hindustan petroleum": "HPCL",
  bpcl: "BPCL", "bharat petroleum": "BPCL",
  reliance: "Reliance", shell: "Shell", essar: "Essar",
};

function cleanBrand(tags: Record<string, string>): string {
  const raw = (tags.brand || tags.operator || tags.name || "").toLowerCase();
  for (const [key, brand] of Object.entries(BRAND_MAP)) {
    if (raw.includes(key)) return brand;
  }
  return "Fuel Station";
}

function fuelTypes(tags: Record<string, string>): string[] {
  const t: string[] = [];
  if (tags["fuel:diesel"] !== "no") t.push("Diesel");
  if (tags["fuel:octane_91"] || tags["fuel:octane_95"] || tags.fuel !== "diesel_only") t.push("Petrol");
  return t.length ? t : ["Petrol", "Diesel"];
}

function haversine(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export async function fetchNearbyStations(
  center: LatLon,
  radiusM: number,
  vehicle: Vehicle,
  weatherFactor = 1.0
): Promise<Station[]> {
  const query = `[out:json][timeout:20];
(
  node["amenity"="fuel"](around:${radiusM},${center.lat},${center.lon});
  way["amenity"="fuel"](around:${radiusM},${center.lat},${center.lon});
  relation["amenity"="fuel"](around:${radiusM},${center.lat},${center.lon});
);
out center;`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error("Overpass API error");
  const data = await res.json();

  return (data.elements as any[])
    .filter((el) => el.lat || el.center)
    .map((el) => {
      const lat = el.lat ?? el.center.lat;
      const lon = el.lon ?? el.center.lon;
      const tags = el.tags || {};
      const distKm = haversine(center, { lat, lon });
      const routeKm = distKm * 1.25;
      const etaMin = Math.max(1, Math.round((distKm / 40) * 60));
      return {
        id: `osm-${el.type}-${el.id}`,
        name: tags.name || cleanBrand(tags),
        brand: cleanBrand(tags),
        lat,
        lon,
        distanceKm: Math.round(distKm * 100) / 100,
        etaMin,
        fuelTypes: fuelTypes(tags),
        reachability: reachability(vehicle, routeKm, weatherFactor),
        fuelAfterArrivalPct: fuelAfterArrival(vehicle, routeKm, weatherFactor),
      } as Station;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20);
}
