from fastapi import APIRouter
from ..schemas import WeatherResponse
from ..services.weather import get_weather

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/", response_model=WeatherResponse)
async def weather(lat: float, lon: float):
    return await get_weather(lat, lon)
