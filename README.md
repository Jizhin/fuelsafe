# FuelSafe

A real-time fuel management and navigation assistant for drivers. Tracks your vehicle's fuel level, finds reachable petrol stations nearby using live OpenStreetMap data, calculates safe driving range, and routes you to the nearest pump — all without any paid map API.

![FuelSafe UI](https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20Docker-16A34A?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## Features

- **Live GPS tracking** — uses the browser's Geolocation API; works on desktop and mobile
- **Real petrol station data** — fetched from OpenStreetMap via the Overpass API (no static data, no mocks)
- **Safe range calculation** — based on your vehicle's actual mileage and current fuel level
- **Reachability indicators** — every station is marked Can reach / Borderline / Out of range
- **OSRM road routing** — accurate turn-by-turn road distance (not straight-line) to the selected station
- **Fuel consumption simulation** — GPS position deltas decrement the fuel gauge in real time while driving
- **Emergency fuel mode** — one tap highlights the nearest station in red and plots an urgent route
- **Clustered map markers** — stations group into cluster bubbles when zoomed out; expand on click
- **Map view modes** — flat Map, 3D buildings, and Navigation (tilted follow-vehicle view)
- **Live weather** — current temperature and conditions from OpenWeather API at your GPS position
- **WebSocket live updates** — backend pushes fuel intelligence updates over a persistent connection
- **No login required** — opens directly into the live map experience

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Map | MapLibre GL JS v4, CARTO Voyager tiles (free, no API key) |
| State | Zustand (with persist middleware) |
| Styling | Tailwind CSS |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Routing | OSRM public API (`router.project-osrm.org`) |
| Station data | Overpass API (OpenStreetMap) |
| Weather | OpenWeather API (free tier) |
| Reverse proxy | nginx |
| Container | Docker Compose |

---

## Architecture

```
Browser
  │
  ├── GET /  →  nginx (port 3001)  →  serves React SPA
  ├── GET /api/*  →  nginx  →  FastAPI backend (port 8001)
  └── WS  /ws/*  →  nginx  →  FastAPI WebSocket

FastAPI
  ├── /api/route/       → OSRM (external)
  ├── /api/stations/    → Overpass API (external)
  ├── /api/weather/     → OpenWeather API (external)
  └── /ws/{client_id}   → WebSocket (Redis pub/sub)

Frontend services (browser-side)
  ├── overpass.ts       → fetches real petrol stations near GPS location
  ├── routing.ts        → calls backend /api/route/ (OSRM)
  ├── openweather.ts    → calls OpenWeather directly with VITE_OPENWEATHER_KEY
  └── fuelCalc.ts       → range, risk level, reachability math
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- A free [OpenWeather API key](https://openweathermap.org/api) (for weather widget)

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Jizhin/fuelsafe.git
cd fuelsafe
```

### 2. Set environment variables

```bash
# Copy the example env files
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and add your OpenWeather API key:

```env
VITE_OPENWEATHER_KEY=your_openweather_api_key_here
VITE_API_BASE=http://localhost:3001
```

### 3. Start all services

```bash
docker compose up --build
```

First build takes ~2 minutes (downloads node, python, nginx images and installs dependencies).

### 4. Open the app

Visit **http://localhost:3001**

Allow location access when the browser prompts — the app needs your GPS position to find nearby fuel stations.

---

## Environment Variables

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE` | Yes | Base URL for API calls. Use `http://localhost:3001` (nginx proxy, same origin) |
| `VITE_OPENWEATHER_KEY` | Optional | [OpenWeather API key](https://openweathermap.org/api) for live temperature |

### `backend/.env` / `.env`

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | set in docker-compose | PostgreSQL connection string |
| `REDIS_URL` | set in docker-compose | Redis connection string |
| `SECRET_KEY` | change in production | JWT / session secret |

---

## Project Structure

```
fuelsafe/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point, CORS, routers
│   │   ├── config.py             # Settings (CORS origins, secrets)
│   │   ├── routers/
│   │   │   ├── route_valhalla.py # OSRM routing endpoint
│   │   │   ├── stations.py       # Nearby stations endpoint
│   │   │   ├── weather.py        # Weather proxy endpoint
│   │   │   └── ws.py             # WebSocket handler
│   │   └── services/
│   │       ├── fuel_engine.py    # Fuel risk calculations
│   │       └── overpass.py       # Overpass API client
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Root component, hooks wiring
│   │   ├── components/
│   │   │   ├── Map/MapView.tsx   # MapLibre GL map, layers, clustering
│   │   │   ├── Header.tsx        # Top bar (fuel %, range, weather, alerts)
│   │   │   ├── Sidebar.tsx       # Station list, reachability, safety insights
│   │   │   ├── BottomTimeline.tsx# Route timeline, action buttons
│   │   │   └── VehicleSetup.tsx  # First-run vehicle profile form
│   │   ├── hooks/
│   │   │   ├── useGeolocation.ts     # Browser GPS, error handling
│   │   │   ├── useNearbyStations.ts  # Overpass query with react-query
│   │   │   ├── useRouting.ts         # Auto-routes when station selected
│   │   │   ├── useFuelConsumption.ts # GPS delta → fuel decrement
│   │   │   └── useWebSocket.ts       # WS connection + 25s keepalive ping
│   │   ├── services/
│   │   │   ├── overpass.ts       # Overpass API, reachability calc
│   │   │   ├── routing.ts        # OSRM via backend proxy
│   │   │   ├── fuelCalc.ts       # Range, risk level math
│   │   │   └── openweather.ts    # Weather fetch
│   │   └── store/
│   │       ├── vehicleStore.ts   # Vehicle profile (persisted)
│   │       ├── stationsStore.ts  # Station list + selected station
│   │       ├── locationStore.ts  # GPS position, active route
│   │       └── uiStore.ts        # Emergency mode, alerts, weather
│   ├── nginx.conf                # Reverse proxy + WS upgrade headers
│   └── Dockerfile
│
├── docker-compose.yml
└── .gitignore
```

---

## How Fuel Consumption Works

Every time the browser receives a GPS position update:

1. Distance from the previous fix is calculated using the **Haversine formula**
2. Updates smaller than **15 m** are ignored (GPS jitter filter)
3. `fuel_consumed (L) = distance_km ÷ vehicle.mileage`
4. `percent_drop = fuel_consumed ÷ vehicle.tank_capacity × 100`
5. The fuel gauge is updated in the UI instantly

This runs entirely in the browser. On a **mobile device while driving**, the gauge ticks down in real time. On a desktop the GPS position is fixed so the gauge stays constant.

---

## Running Without Docker (Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # starts Vite dev server on port 5173
```

Set `VITE_API_BASE=http://localhost:8001` in `frontend/.env` when running without nginx.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/route/` | Get OSRM road route between two coordinates |
| `GET` | `/api/stations/` | Nearby petrol stations (proxied Overpass) |
| `GET` | `/api/weather/` | Current weather at coordinates |
| `WS` | `/ws/{client_id}` | WebSocket for real-time fuel intelligence |

---

## License

MIT — free to use, modify, and distribute.
