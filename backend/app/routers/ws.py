"""
WebSocket endpoint for realtime fuel intelligence updates.
Client sends location + vehicle state → server returns enriched predictions.
"""
import json
import logging
from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.fuel_engine import calculate, FuelInput, risk_level

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self):
        self._connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, ws: WebSocket):
        await ws.accept()
        self._connections[client_id] = ws

    def disconnect(self, client_id: str):
        self._connections.pop(client_id, None)

    async def send(self, client_id: str, payload: dict):
        ws = self._connections.get(client_id)
        if ws:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                self.disconnect(client_id)


manager = ConnectionManager()


@router.websocket("/ws/{client_id}")
async def ws_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")

            if msg_type == "location_update":
                response = await _handle_location_update(msg)
                await websocket.send_text(json.dumps(response))

            elif msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as exc:
        logger.error("WS %s crashed: %s", client_id, exc, exc_info=True)
        manager.disconnect(client_id)


async def _handle_location_update(msg: dict) -> dict:
    fuel_pct = float(msg.get("fuel_percent", 50))
    tank = float(msg.get("tank_capacity", 40))
    mileage = float(msg.get("mileage", 15))
    traffic_factor = float(msg.get("traffic_factor", 1.0))
    weather_factor = float(msg.get("weather_factor", 1.0))
    stations = msg.get("stations", [])

    enriched = []
    for s in stations:
        dist_km = float(s.get("distanceKm", 5))
        result = calculate(FuelInput(
            fuel_percent=fuel_pct,
            tank_capacity_l=tank,
            mileage_kmpl=mileage,
            distance_km=dist_km * 1.25,  # road ≈ 1.25× straight-line
            traffic_factor=traffic_factor,
            weather_factor=weather_factor,
        ))
        enriched.append({
            **s,
            "reachability": result.reachability,
            "fuelAfterArrivalPct": result.fuel_after_pct,
        })

    # Sort by distance ascending
    enriched.sort(key=lambda x: x.get("distanceKm", 999))

    # Overall range calculation
    from ..services.fuel_engine import calculate as calc_range, FuelInput as FI
    range_result = calc_range(FI(
        fuel_percent=fuel_pct,
        tank_capacity_l=tank,
        mileage_kmpl=mileage,
        distance_km=0,
        traffic_factor=traffic_factor,
        weather_factor=weather_factor,
    ))

    return {
        "type": "fuel_update",
        "stations": enriched,
        "range_km": range_result.range_km,
        "risk": risk_level(fuel_pct),
        "fuel_percent": fuel_pct,
        "effective_mileage": range_result.effective_mileage,
    }
