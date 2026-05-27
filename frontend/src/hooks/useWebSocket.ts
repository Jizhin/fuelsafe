/**
 * Realtime WebSocket hook.
 * Sends location + vehicle state → receives enriched fuel intelligence.
 * Reconnects automatically on disconnect.
 */
import { useEffect, useRef, useCallback } from "react";
import { useLocationStore } from "../store/locationStore";
import { useStationsStore } from "../store/stationsStore";
import { useVehicleStore } from "../store/vehicleStore";

const WS_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8001")
  .replace(/^https/, "wss")
  .replace(/^http/, "ws");

const CLIENT_ID = `fs-${Math.random().toString(36).slice(2)}`;
const RECONNECT_MS = 3000;
const PING_MS = 25000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const position  = useLocationStore((s) => s.currentLocation);
  const vehicle   = useVehicleStore((s) => s.vehicle);
  const stations  = useStationsStore((s) => s.stations);
  const setStations = useStationsStore((s) => s.setStations);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    try {
      const ws = new WebSocket(`${WS_BASE}/ws/${CLIENT_ID}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        pingTimer.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_MS);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.type === "fuel_update" && msg.stations?.length) {
            setStations(msg.stations);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (pingTimer.current) clearInterval(pingTimer.current);
        if (!mountedRef.current) return;
        reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
      };

      ws.onerror = () => ws.close();
    } catch {
      reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
    }
  }, [setStations]);

  // Establish connection
  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingTimer.current) clearInterval(pingTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Send location update whenever position or fuel changes
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !position || !stations.length) return;

    ws.send(
      JSON.stringify({
        type: "location_update",
        lat: position.lat,
        lon: position.lon,
        fuel_percent: vehicle.fuelPercent,
        tank_capacity: vehicle.tankCapacity,
        mileage: vehicle.mileage,
        traffic_factor: 1.0,  // extended: will come from HERE API
        weather_factor: 1.0,  // extended: will come from weather store
        stations: stations.map((s) => ({
          id: s.id,
          name: s.name,
          brand: s.brand,
          lat: s.lat,
          lon: s.lon,
          distanceKm: s.distanceKm,
          etaMin: s.etaMin,
          fuelTypes: s.fuelTypes,
        })),
      })
    );
  }, [position?.lat, position?.lon, vehicle.fuelPercent, stations.length]);
}
