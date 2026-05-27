export interface LatLon {
  lat: number;
  lon: number;
}

export interface Vehicle {
  id: string;
  name: string;
  mileage: number;
  tankCapacity: number;
  fuelPercent: number;
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
}
