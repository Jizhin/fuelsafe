import httpx
from fastapi import APIRouter, HTTPException
from ..schemas import RouteRequest, RouteResponse, RouteGeometry
from ..config import settings

router = APIRouter(prefix="/route", tags=["route"])

@router.post("/", response_model=RouteResponse)
async def get_route(req: RouteRequest):
    if not settings.mapbox_token:
        raise HTTPException(status_code=503, detail="Mapbox token not configured")

    url = (
        f"https://api.mapbox.com/directions/v5/mapbox/driving-traffic"
        f"/{req.from_lon},{req.from_lat};{req.to_lon},{req.to_lat}"
        f"?geometries=geojson&overview=full&access_token={settings.mapbox_token}"
    )
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url)
        if not resp.ok:
            raise HTTPException(status_code=502, detail="Mapbox Directions API error")
        data = resp.json()

    routes = data.get("routes", [])
    if not routes:
        raise HTTPException(status_code=404, detail="No route found")

    r = routes[0]
    return RouteResponse(
        geometry=RouteGeometry(**r["geometry"]),
        distance_km=round(r["distance"] / 1000, 2),
        duration_min=round(r["duration"] / 60, 1),
    )
