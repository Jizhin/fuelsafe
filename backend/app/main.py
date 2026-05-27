from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import stations, weather
from .routers import route_valhalla as route
from .routers import vehicle as vehicle_router
from .routers import ws as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="FuelSafe API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stations.router,       prefix="/api")
app.include_router(weather.router,        prefix="/api")
app.include_router(route.router,          prefix="/api")
app.include_router(vehicle_router.router, prefix="/api")
app.include_router(ws_router.router)      # WebSocket: /ws/{client_id}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fuelsafe-api", "version": "2.0.0"}
