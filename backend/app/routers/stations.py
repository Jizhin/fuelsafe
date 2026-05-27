from fastapi import APIRouter, HTTPException
from ..schemas import NearbyStationsRequest, StationOut
from ..services.overpass import fetch_stations
from typing import List

router = APIRouter(prefix="/stations", tags=["stations"])

@router.post("/nearby", response_model=List[StationOut])
async def nearby_stations(req: NearbyStationsRequest):
    try:
        stations = await fetch_stations(
            lat=req.lat,
            lon=req.lon,
            radius_m=req.radius_m,
            fuel_pct=req.fuel_percent,
            tank=req.tank_capacity,
            mileage=req.mileage,
            wf=req.weather_factor,
        )
        return stations
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Overpass API error: {str(e)}")
