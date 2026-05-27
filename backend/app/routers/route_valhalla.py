"""
Route endpoint using OSRM (Open Source Routing Machine).
No API key required. Global coverage via router.project-osrm.org.
"""
import httpx
from fastapi import APIRouter, HTTPException
from ..schemas import RouteRequest, RouteResponse, RouteGeometry

router = APIRouter(prefix="/route", tags=["route"])

OSRM_URL = "https://router.project-osrm.org/route/v1/driving"


@router.post("/", response_model=RouteResponse)
async def get_route(req: RouteRequest):
    url = f"{OSRM_URL}/{req.from_lon},{req.from_lat};{req.to_lon},{req.to_lat}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "false",
        "annotations": "false",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Routing engine timed out")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Routing engine error: {e.response.status_code}")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Routing error: {str(e)}")

    data = resp.json()
    if data.get("code") != "Ok" or not data.get("routes"):
        raise HTTPException(status_code=404, detail="No route found")

    route = data["routes"][0]
    leg = route["legs"][0]
    geo = route["geometry"]  # already GeoJSON LineString

    return RouteResponse(
        geometry=RouteGeometry(type=geo["type"], coordinates=geo["coordinates"]),
        distance_km=round(leg["distance"] / 1000, 2),
        duration_min=round(leg["duration"] / 60, 1),
    )
