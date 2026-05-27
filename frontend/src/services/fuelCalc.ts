import type { Vehicle, Station } from '../types';

export function estimatedRange(vehicle: Vehicle, weatherFactor = 1.0): number {
  const litresAvailable = (vehicle.fuelPercent / 100) * vehicle.tankCapacity;
  return (litresAvailable / weatherFactor) * vehicle.mileage;
}

export function fuelAfterArrival(vehicle: Vehicle, routeKm: number, weatherFactor = 1.0): number {
  const litresAvailable = (vehicle.fuelPercent / 100) * vehicle.tankCapacity;
  const litresUsed = (routeKm * weatherFactor) / vehicle.mileage;
  const litresLeft = litresAvailable - litresUsed;
  return Math.max(0, (litresLeft / vehicle.tankCapacity) * 100);
}

export function reachability(vehicle: Vehicle, routeKm: number, weatherFactor = 1.0): Station['reachability'] {
  const range = estimatedRange(vehicle, weatherFactor);
  const safeRange = range * 0.85;  // keep 15% safety buffer
  if (routeKm <= safeRange) return 'reachable';
  if (routeKm <= range)     return 'caution';
  return 'unreachable';
}

export function fuelRiskLevel(fuelPct: number): 'safe' | 'low' | 'critical' {
  if (fuelPct > 25) return 'safe';
  if (fuelPct > 10) return 'low';
  return 'critical';
}
