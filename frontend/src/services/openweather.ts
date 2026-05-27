import type { WeatherInfo, LatLon } from '../types';

const KEY = import.meta.env.VITE_OPENWEATHER_KEY as string;

export async function fetchWeather(pos: LatLon): Promise<WeatherInfo | null> {
  if (!KEY) return null;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${pos.lat}&lon=${pos.lon}&appid=${KEY}&units=metric`;
    const res = await fetch(url);
    const d = await res.json();
    const condition = d.weather?.[0]?.main ?? '';
    // Rain/snow increase fuel consumption
    const impact = ['Rain','Drizzle','Snow','Thunderstorm'].includes(condition) ? 1.12 : 1.0;
    return {
      description: d.weather?.[0]?.description ?? '',
      temp: Math.round(d.main?.temp ?? 25),
      icon: d.weather?.[0]?.icon ?? '01d',
      fuelImpactFactor: impact,
    };
  } catch { return null; }
}
