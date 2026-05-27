import httpx
from ..schemas import WeatherResponse
from ..config import settings

async def get_weather(lat: float, lon: float) -> WeatherResponse:
    if not settings.openweather_key:
        return WeatherResponse(description="clear sky", temp=30.0, icon="01d", fuel_impact_factor=1.0)

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={settings.openweather_key}&units=metric"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        if not resp.ok:
            return WeatherResponse(description="unknown", temp=28.0, icon="01d", fuel_impact_factor=1.0)
        data = resp.json()

    weather = data.get("weather", [{}])[0]
    temp = data.get("main", {}).get("temp", 28.0)
    desc = weather.get("description", "clear sky")
    icon = weather.get("icon", "01d")
    cond = weather.get("main", "Clear").lower()

    factor = 1.0
    if "rain" in cond or "drizzle" in cond:
        factor = 1.08
    elif "snow" in cond:
        factor = 1.15
    elif "thunderstorm" in cond:
        factor = 1.12
    elif "fog" in cond or "mist" in cond:
        factor = 1.05
    if temp > 38:
        factor *= 1.05

    return WeatherResponse(description=desc, temp=temp, icon=icon, fuel_impact_factor=round(factor, 3))
