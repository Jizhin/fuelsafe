export interface LatLon {
  lat: number;
  lon: number;
}

export type FuelType = "petrol" | "diesel" | "cng" | "electric";

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  fuelType: FuelType;
  mileage: number;       // km/L
  tankCapacity: number;  // litres
  fuelPercent: number;   // 0–100
}

export interface Station {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lon: number;
  distanceKm: number;
  etaMin: number;
  fuelTypes: string[];
  reachability: "reachable" | "caution" | "unreachable";
  fuelAfterArrivalPct: number;
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface Route {
  geometry: RouteGeometry;
  distanceKm: number;
  durationMin: number;
}

export interface WeatherInfo {
  description: string;
  temp: number;
  icon: string;
  fuelImpactFactor: number;
  weatherCode?: number;
}

export interface WsFuelUpdate {
  type: "fuel_update";
  stations: Station[];
  range_km: number;
  risk: "safe" | "low" | "critical";
  fuel_percent: number;
  effective_mileage: number;
}
