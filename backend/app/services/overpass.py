import math
import httpx
from typing import List
from ..schemas import StationOut

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

BRAND_MAP = {
    "indianoil": "IndianOil", "ioc": "IndianOil",
    "hp": "HPCL", "hpcl": "HPCL", "hindustan petroleum": "HPCL",
    "bpcl": "BPCL", "bharat petroleum": "BPCL",
    "reliance": "Reliance",
    "shell": "Shell",
    "essar": "Essar",
}

def _clean_brand(tags: dict) -> str:
    raw = (tags.get("brand") or tags.get("operator") or tags.get("name") or "").lower()
    for key, brand in BRAND_MAP.items():
        if key in raw:
            return brand
    return "Fuel Station"

def _fuel_types(tags: dict) -> List[str]:
    types = []
    if tags.get("fuel:diesel", "yes") != "no":
        types.append("Diesel")
    if tags.get("fuel:octane_91") or tags.get("fuel:octane_95") or tags.get("fuel", "") != "diesel_only":
        types.append("Petrol")
    return types if types else ["Petrol", "Diesel"]

def _haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def _reachability(route_km: float, fuel_pct: float, tank: float, mileage: float, wf: float) -> str:
    available_l = (fuel_pct / 100) * tank
    est_range = (available_l / wf) * mileage
    if route_km <= est_range * 0.85:
        return "reachable"
    if route_km <= est_range:
        return "caution"
    return "unreachable"

def _fuel_after(route_km: float, fuel_pct: float, tank: float, mileage: float, wf: float) -> float:
    available_l = (fuel_pct / 100) * tank
    used_l = (route_km / mileage) * wf
    remaining_l = max(0.0, available_l - used_l)
    return round((remaining_l / tank) * 100, 1)

async def fetch_stations(
    lat: float, lon: float, radius_m: int,
    fuel_pct: float, tank: float, mileage: float, wf: float
) -> List[StationOut]:
    query = f"""[out:json][timeout:20];
(
  node["amenity"="fuel"](around:{radius_m},{lat},{lon});
  way["amenity"="fuel"](around:{radius_m},{lat},{lon});
  relation["amenity"="fuel"](around:{radius_m},{lat},{lon});
);
out center;"""

    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(
            OVERPASS_URL,
            data={"data": query},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        elements = resp.json().get("elements", [])

    results: List[StationOut] = []
    for el in elements:
        s_lat = el.get("lat") or el.get("center", {}).get("lat")
        s_lon = el.get("lon") or el.get("center", {}).get("lon")
        if s_lat is None or s_lon is None:
            continue
        tags = el.get("tags", {})
        dist_km = _haversine(lat, lon, s_lat, s_lon)
        route_km = dist_km * 1.25
        eta_min = max(1, round((dist_km / 40) * 60))

        results.append(StationOut(
            id=f"osm-{el['type']}-{el['id']}",
            name=tags.get("name") or _clean_brand(tags),
            brand=_clean_brand(tags),
            lat=s_lat,
            lon=s_lon,
            distance_km=round(dist_km, 2),
            eta_min=eta_min,
            fuel_types=_fuel_types(tags),
            reachability=_reachability(route_km, fuel_pct, tank, mileage, wf),
            fuel_after_arrival_pct=_fuel_after(route_km, fuel_pct, tank, mileage, wf),
        ))

    results.sort(key=lambda s: s.distance_km)
    return results[:20]
