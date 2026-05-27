from pydantic import BaseModel
from typing import Literal, Optional, List

class StationOut(BaseModel):
    id: str
    name: str
    brand: str
    lat: float
    lon: float
    distance_km: float
    eta_min: int
    fuel_types: List[str]
    reachability: Literal["reachable", "caution", "unreachable"]
    fuel_after_arrival_pct: float

class NearbyStationsRequest(BaseModel):
    lat: float
    lon: float
    radius_m: int = 10000
    fuel_percent: float
    tank_capacity: float
    mileage: float
    weather_factor: float = 1.0

class WeatherResponse(BaseModel):
    description: str
    temp: float
    icon: str
    fuel_impact_factor: float

class RouteRequest(BaseModel):
    from_lat: float
    from_lon: float
    to_lat: float
    to_lon: float

class RouteGeometry(BaseModel):
    type: str
    coordinates: List[List[float]]

class RouteResponse(BaseModel):
    geometry: RouteGeometry
    distance_km: float
    duration_min: float
