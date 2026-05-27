/**
 * Map using MapLibre GL JS + CARTO Voyager tiles (Google Maps-like look, free).
 * Modes: flat map / 3D buildings / navigation tilt.
 */
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocationStore } from "../../store/locationStore";
import { useStationsStore } from "../../store/stationsStore";
import { useVehicleStore } from "../../store/vehicleStore";
import { useUIStore } from "../../store/uiStore";
import { estimatedRange } from "../../services/fuelCalc";
import { setMapInstance } from "../../services/mapInstance";
import type { Station } from "../../types";

// CARTO Voyager — clean Google Maps–like look, free, no API key
const STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

type ViewMode = "map" | "3d" | "nav";

const BRAND_STROKE: Record<string, string> = {
  IndianOil:          "#F97316",
  HPCL:               "#1D4ED8",
  BPCL:               "#2563EB",
  Reliance:           "#374151",
  Shell:              "#D97706",
  Essar:              "#0369A1",
  "Bharat Petroleum": "#2563EB",
  "HP Petrol Pump":   "#1D4ED8",
  "Fuel Station":     "#16A34A",
};

const BRAND_SHORT: Record<string, string> = {
  IndianOil:          "IO",
  HPCL:               "HP",
  BPCL:               "BP",
  Reliance:           "RL",
  Shell:              "SH",
  Essar:              "ES",
  "Bharat Petroleum": "BP",
  "HP Petrol Pump":   "HP",
  "Fuel Station":     "FS",
};

function geoCircle(center: [number, number], radiusKm: number, steps = 72) {
  const lat = center[1];
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = (radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);
    const dy = (radiusKm / 110.574) * Math.sin(angle);
    coords.push([center[0] + dx, center[1] + dy]);
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [coords] },
  };
}

function stationsToGeoJSON(
  stations: Station[],
  selectedId: string | undefined,
  emergency: boolean
) {
  return {
    type: "FeatureCollection" as const,
    features: stations.map((s) => {
      const isEmSel = emergency && s.id === selectedId;
      const stroke = isEmSel ? "#EF4444" : (BRAND_STROKE[s.brand] ?? "#16A34A");
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [s.lon, s.lat] as [number, number] },
        properties: {
          id: s.id,
          short: BRAND_SHORT[s.brand] ?? "FS",
          stroke,
          selected: s.id === selectedId ? 1 : 0,
        },
      };
    }),
  };
}

function ensurePulse() {
  if (document.getElementById("fs-maplibre-pulse")) return;
  const s = document.createElement("style");
  s.id = "fs-maplibre-pulse";
  s.textContent = `
    @keyframes fs-pulse { 0%,100%{transform:scale(1);opacity:.55} 50%{transform:scale(1.7);opacity:0} }
    .fs-pulse { animation: fs-pulse 2.2s ease-out infinite; }
  `;
  document.head.appendChild(s);
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<maplibregl.Map | null>(null);
  const vehicleMk    = useRef<maplibregl.Marker | null>(null);
  const styleReady   = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode]   = useState<ViewMode>("map");

  const stationsRef    = useRef<Station[]>([]);
  const selectedRef    = useRef<Station | null>(null);
  const emergencyRef   = useRef(false);
  const setSelectedRef = useRef<((s: Station) => void) | null>(null);

  const position        = useLocationStore((s) => s.currentLocation);
  const activeRoute     = useLocationStore((s) => s.activeRoute);
  const heading         = useLocationStore((s) => s.heading);
  const stations        = useStationsStore((s) => s.stations);
  const selectedStation = useStationsStore((s) => s.selectedStation);
  const setSelected     = useStationsStore((s) => s.setSelectedStation);
  const vehicle         = useVehicleStore((s) => s.vehicle);
  const emergencyMode   = useUIStore((s) => s.emergencyMode);
  const rangeKm         = Math.round(estimatedRange(vehicle));

  useEffect(() => { stationsRef.current = stations; }, [stations]);
  useEffect(() => { selectedRef.current = selectedStation ?? null; }, [selectedStation]);
  useEffect(() => { emergencyRef.current = emergencyMode; }, [emergencyMode]);
  useEffect(() => { setSelectedRef.current = setSelected; }, [setSelected]);

  // ── Init map ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    ensurePulse();

    const m = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [77.5946, 12.9716],
      zoom: 11,
      pitch: 0,
      attributionControl: false,
    });

    mapRef.current = m;
    setMapInstance(m as any);
    m.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), "bottom-right");
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    m.on("load", () => {
      styleReady.current = true;

      // ── Safety radius ──────────────────────────────────────
      m.addSource("radius", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[]] } },
      });
      m.addLayer({ id: "radius-fill",   type: "fill", source: "radius", paint: { "fill-color": "#16A34A", "fill-opacity": 0.06 } });
      m.addLayer({ id: "radius-border", type: "line", source: "radius", paint: { "line-color": "#16A34A", "line-width": 1.5, "line-opacity": 0.25, "line-dasharray": [5, 5] } });

      // ── Route line ─────────────────────────────────────────
      m.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      m.addLayer({
        id: "route-line", type: "line", source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#16A34A", "line-width": 5, "line-opacity": 0.95 },
      });

      // ── 3D buildings (CARTO source: "carto", layer: "building") ──
      try {
        m.addLayer({
          id: "3d-buildings",
          source: "carto",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 14,
          paint: {
            "fill-extrusion-color": [
              "interpolate", ["linear"], ["zoom"],
              15, "#d4d0ca",
              18, "#bdb8b0",
            ],
            "fill-extrusion-height": [
              "interpolate", ["linear"], ["zoom"],
              14, 0,
              15.5, ["coalesce", ["get", "render_height"], ["get", "height"], 4],
            ],
            "fill-extrusion-base": [
              "interpolate", ["linear"], ["zoom"],
              14, 0,
              15.5, ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
            ],
            "fill-extrusion-opacity": 0,
          },
        });
      } catch { /* building layer unavailable in this tile source */ }

      // ── Clustered station source ───────────────────────────
      m.addSource("stations-data", {
        type: "geojson",
        data: stationsToGeoJSON(stationsRef.current, selectedRef.current?.id, emergencyRef.current),
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      m.addLayer({
        id: "station-clusters", type: "circle", source: "stations-data",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#16A34A", 5, "#0369A1", 15, "#1E293B"],
          "circle-radius": ["step", ["get", "point_count"], 18, 5, 22, 15, 26],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      m.addLayer({
        id: "station-cluster-count", type: "symbol", source: "stations-data",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["to-string", ["get", "point_count"]],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 13,
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#ffffff" },
      });

      m.addLayer({
        id: "station-outer", type: "circle", source: "stations-data",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#ffffff",
          "circle-radius": ["case", ["==", ["get", "selected"], 1], 18, 13],
          "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 3.5, 2.5],
          "circle-stroke-color": ["get", "stroke"],
        },
      });

      m.addLayer({
        id: "station-short", type: "symbol", source: "stations-data",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "short"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": ["case", ["==", ["get", "selected"], 1], 10, 8],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: { "text-color": ["get", "stroke"] },
      });

      // Cluster click → zoom in
      m.on("click", "station-clusters", async (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ["station-clusters"] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id as number;
        const src = m.getSource("stations-data") as maplibregl.GeoJSONSource;
        try {
          const zoom = await src.getClusterExpansionZoom(clusterId);
          const geom = features[0].geometry as unknown as { coordinates: [number, number] };
          m.easeTo({ center: geom.coordinates, zoom: zoom + 1 });
        } catch { /* ignore */ }
      });

      // Station click → select
      const onStationClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        const sid = e.features?.[0]?.properties?.id;
        const station = stationsRef.current.find((s) => s.id === sid);
        if (station && setSelectedRef.current) setSelectedRef.current(station);
      };
      m.on("click", "station-outer", onStationClick);
      m.on("click", "station-short", onStationClick);

      m.on("mouseenter", "station-clusters", () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "station-clusters", () => { m.getCanvas().style.cursor = ""; });
      m.on("mouseenter", "station-outer",    () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "station-outer",    () => { m.getCanvas().style.cursor = ""; });

      setMapLoaded(true);
    });

    return () => {
      styleReady.current = false;
      setMapLoaded(false);
      m.remove();
      mapRef.current = null;
    };
  }, []);

  // ── View mode: camera + building opacity ────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !mapLoaded) return;
    if (viewMode === "map") {
      m.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      try { m.setPaintProperty("3d-buildings", "fill-extrusion-opacity", 0); } catch {}
    } else if (viewMode === "3d") {
      m.easeTo({ pitch: 45, bearing: -15, duration: 700 });
      try { m.setPaintProperty("3d-buildings", "fill-extrusion-opacity", 0.75); } catch {}
    } else if (viewMode === "nav") {
      const bear = heading ?? m.getBearing();
      // 40° pitch shows the road ahead without buildings blocking the view
      m.easeTo({ pitch: 40, bearing: bear, duration: 800 });
    }
  }, [viewMode, mapLoaded]);

  // ── Navigation mode: follow vehicle continuously ────────────
  useEffect(() => {
    if (viewMode !== "nav" || !position) return;
    const m = mapRef.current;
    if (!m) return;
    m.easeTo({
      center: [position.lon, position.lat],
      bearing: heading ?? m.getBearing(),
      pitch: 40,
      duration: 350,
    });
  }, [viewMode, position?.lat, position?.lon, heading]);

  // ── Vehicle marker + radius ─────────────────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !position) return;

    if (!vehicleMk.current) {
      const el = document.createElement("div");
      el.style.cssText = "position:relative;width:44px;height:44px;cursor:default;";
      el.innerHTML = `
        <div class="fs-pulse" style="position:absolute;inset:0;border-radius:50%;background:rgba(22,163,74,0.18);"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:#16A34A;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 14px rgba(22,163,74,0.45);">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <rect x="8" y="2" width="8" height="20" rx="3" fill="white"/>
            <rect x="5" y="8" width="3" height="3.5" rx="1" fill="white"/>
            <rect x="16" y="8" width="3" height="3.5" rx="1" fill="white"/>
            <rect x="9.5" y="4" width="5" height="5" rx="1" fill="rgba(0,60,20,0.3)"/>
            <rect x="9.5" y="14.5" width="5" height="4" rx="1" fill="rgba(0,60,20,0.22)"/>
          </svg>
        </div>
      `;
      vehicleMk.current = new maplibregl.Marker({ element: el, anchor: "center", rotationAlignment: "map" })
        .setLngLat([position.lon, position.lat])
        .addTo(m);
      m.flyTo({ center: [position.lon, position.lat], zoom: 12, duration: 1200 });
    } else {
      vehicleMk.current.setLngLat([position.lon, position.lat]);
      if (heading) vehicleMk.current.setRotation(heading);
    }

    if (styleReady.current) {
      const src = m.getSource("radius") as maplibregl.GeoJSONSource | undefined;
      src?.setData(geoCircle([position.lon, position.lat], rangeKm));
    }
  }, [position?.lat, position?.lon, heading, rangeKm]);

  // ── Station data update ─────────────────────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !mapLoaded) return;
    const src = m.getSource("stations-data") as maplibregl.GeoJSONSource | undefined;
    src?.setData(stationsToGeoJSON(stations, selectedStation?.id, emergencyMode));
  }, [stations, selectedStation, emergencyMode, mapLoaded]);

  // ── Route line ──────────────────────────────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !styleReady.current) return;
    const src = m.getSource("route") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    const geo = activeRoute?.geometry;
    if (geo) {
      src.setData({ type: "Feature", properties: {}, geometry: geo });
      if (geo.coordinates.length > 1 && viewMode !== "nav") {
        const lngs = (geo.coordinates as number[][]).map((c) => c[0]);
        const lats  = (geo.coordinates as number[][]).map((c) => c[1]);
        m.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: { top: 60, bottom: 80, left: 60, right: 100 }, duration: 800, maxZoom: 14 }
        );
      }
    } else {
      src.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });
    }
  }, [activeRoute]);

  // ── Emergency mode: swap accent colour ─────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !styleReady.current) return;
    const accent = emergencyMode ? "#EF4444" : "#16A34A";
    try {
      m.setPaintProperty("radius-fill",   "fill-color", accent);
      m.setPaintProperty("radius-border", "line-color", accent);
      m.setPaintProperty("route-line",    "line-color", accent);
    } catch { /* layers may not exist yet */ }
  }, [emergencyMode]);

  // ── Style reload: re-sync data ──────────────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    const onStyleLoad = () => {
      styleReady.current = true;
      if (position) {
        const rSrc = m.getSource("radius") as maplibregl.GeoJSONSource | undefined;
        rSrc?.setData(geoCircle([position.lon, position.lat], rangeKm));
      }
      const sSrc = m.getSource("stations-data") as maplibregl.GeoJSONSource | undefined;
      sSrc?.setData(stationsToGeoJSON(stationsRef.current, selectedRef.current?.id, emergencyRef.current));
    };
    m.on("style.load", onStyleLoad);
    return () => { m.off("style.load", onStyleLoad); };
  }, [position, rangeKm]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* ── Map view mode controls ─────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: 6,
          background: "rgba(255,255,255,0.96)",
          borderRadius: 12,
          padding: "4px 6px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
          backdropFilter: "blur(6px)",
        }}
      >
        {(["map", "3d", "nav"] as ViewMode[]).map((mode) => {
          const active = viewMode === mode;
          const labels: Record<ViewMode, string> = { map: "Map", "3d": "3D", nav: "Navigate" };
          return (
            <button
              key={mode}
              onClick={() => setViewMode(active ? "map" : mode)}
              style={{
                height: 34,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background: active ? "#16A34A" : "transparent",
                color: active ? "#fff" : "#374151",
                transition: "all 0.15s",
                letterSpacing: "0.02em",
              }}
            >
              {labels[mode]}
            </button>
          );
        })}
      </div>

      {/* Navigate mode active indicator */}
      {viewMode === "nav" && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "#16A34A",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            padding: "4px 12px",
            borderRadius: 20,
            boxShadow: "0 2px 8px rgba(22,163,74,0.4)",
          }}
        >
          NAVIGATION VIEW — FOLLOWING VEHICLE
        </div>
      )}
    </div>
  );
}
