"""
Real fuel intelligence engine.
Accounts for traffic congestion, weather conditions, and driving efficiency.
"""
from dataclasses import dataclass
from typing import Literal

Reachability = Literal["reachable", "caution", "unreachable"]
RiskLevel = Literal["safe", "low", "critical"]


@dataclass
class FuelInput:
    fuel_percent: float        # 0–100
    tank_capacity_l: float     # litres
    mileage_kmpl: float        # km per litre (ideal)
    distance_km: float         # route distance
    traffic_factor: float = 1.0   # 1.0=free-flow, 1.35=heavy
    weather_factor: float = 1.0   # 1.0=clear, 1.15=heavy-rain
    elevation_factor: float = 1.0 # 1.0=flat, 1.10=hilly


@dataclass
class FuelResult:
    can_reach: bool
    fuel_after_pct: float
    range_km: float
    reachability: Reachability
    required_fuel_l: float
    available_fuel_l: float
    effective_mileage: float


def calculate(inp: FuelInput) -> FuelResult:
    available_l = (inp.fuel_percent / 100.0) * inp.tank_capacity_l

    # Effective mileage degrades with traffic, weather, elevation
    penalty = inp.traffic_factor * inp.weather_factor * inp.elevation_factor
    effective_mileage = max(inp.mileage_kmpl / penalty, 4.0)  # floor at 4 km/L

    range_km = round(available_l * effective_mileage, 1)
    required_l = inp.distance_km / effective_mileage
    remaining_l = available_l - required_l
    remaining_pct = (remaining_l / inp.tank_capacity_l) * 100.0

    can_reach = remaining_pct > 0

    if remaining_pct < 0:
        reach: Reachability = "unreachable"
    elif remaining_pct < 10:
        reach = "caution"
    else:
        reach = "reachable"

    return FuelResult(
        can_reach=can_reach,
        fuel_after_pct=round(max(0.0, remaining_pct), 1),
        range_km=range_km,
        reachability=reach,
        required_fuel_l=round(required_l, 2),
        available_fuel_l=round(available_l, 2),
        effective_mileage=round(effective_mileage, 1),
    )


def risk_level(fuel_pct: float) -> RiskLevel:
    if fuel_pct > 25:
        return "safe"
    if fuel_pct > 10:
        return "low"
    return "critical"


def weather_factor_from_code(weather_code: int) -> float:
    """Map OpenWeather condition code to fuel consumption factor."""
    if weather_code in range(200, 300):   # Thunderstorm
        return 1.15
    if weather_code in range(300, 400):   # Drizzle
        return 1.05
    if weather_code in range(500, 510):   # Rain
        return 1.10
    if weather_code in (511,):            # Freezing rain
        return 1.20
    if weather_code in range(520, 532):   # Shower rain
        return 1.08
    if weather_code in range(600, 700):   # Snow
        return 1.20
    if weather_code in range(700, 800):   # Atmosphere (fog, haze)
        return 1.06
    return 1.0  # Clear / Clouds
