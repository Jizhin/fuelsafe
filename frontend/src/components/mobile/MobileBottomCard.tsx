import { useState } from "react";
import { Navigation2, AlertTriangle, ChevronUp, ChevronDown, MapPin, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useStationsStore } from "../../store/stationsStore";
import { useLocationStore } from "../../store/locationStore";
import { useUIStore } from "../../store/uiStore";
import { useVehicleStore } from "../../store/vehicleStore";
import type { Station } from "../../types";

const BRAND_BG: Record<string, string> = {
  IndianOil: "#F97316", HPCL: "#1D4ED8", BPCL: "#2563EB",
  Reliance: "#374151", Shell: "#D97706", Essar: "#0369A1",
  "Bharat Petroleum": "#2563EB", "HP Petrol Pump": "#1D4ED8", "Fuel Station": "#16A34A",
};
const BRAND_SHORT: Record<string, string> = {
  IndianOil: "IO", HPCL: "HP", BPCL: "BP", Reliance: "RL",
  Shell: "SH", Essar: "ES", "Bharat Petroleum": "BP", "HP Petrol Pump": "HP", "Fuel Station": "FS",
};

export function MobileBottomCard() {
  const [expanded, setExpanded] = useState(false);

  const stations        = useStationsStore((s) => s.stations);
  const selectedStation = useStationsStore((s) => s.selectedStation);
  const setSelected     = useStationsStore((s) => s.setSelectedStation);
  const activeRoute     = useLocationStore((s) => s.activeRoute);
  const position        = useLocationStore((s) => s.currentLocation);
  const emergencyMode   = useUIStore((s) => s.emergencyMode);
  const setEmergency    = useUIStore((s) => s.setEmergencyMode);
  const vehicle         = useVehicleStore((s) => s.vehicle);

  const target = selectedStation ?? stations[0] ?? null;
  const foa    = target ? Math.max(0, Math.round(target.fuelAfterArrivalPct ?? 0)) : 0;
  const foaColor = foa > 15 ? "#16A34A" : foa > 5 ? "#F59E0B" : "#EF4444";

  const handleNavigate = () => {
    const best = stations.find((s) => s.reachability === "reachable") ?? stations[0];
    if (best) setSelected(best);
    setEmergency(false);
  };

  const handleEmergency = () => {
    const isOn = !emergencyMode;
    setEmergency(isOn);
    if (isOn && stations[0]) setSelected(stations[0]);
  };

  const reachMeta = (reach: string) => ({
    reachable:   { color: "#16A34A", Icon: CheckCircle,  label: "Can reach"   },
    caution:     { color: "#D97706", Icon: AlertCircle,  label: "Borderline"  },
    unreachable: { color: "#DC2626", Icon: XCircle,      label: "Out of range" },
  }[reach] ?? { color: "#16A34A", Icon: CheckCircle, label: "Can reach" });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Drag handle */}
      <div
        style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 6, cursor: "pointer" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#D1D5DB" }} />
      </div>

      {/* Primary card */}
      {target ? (
        <div style={{ padding: "0 16px 16px" }}>
          {/* Station row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: BRAND_BG[target.brand] ?? "#16A34A",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 4px 12px ${(BRAND_BG[target.brand] ?? "#16A34A")}55`,
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {BRAND_SHORT[target.brand] ?? "FS"}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                {target.brand || target.name}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={10} /> {activeRoute ? `${activeRoute.distanceKm.toFixed(1)} km` : `${target.distanceKm} km`}
                </span>
                <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={10} /> {activeRoute ? `${activeRoute.durationMin} min` : `${target.etaMin} min`}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: foaColor, lineHeight: 1 }}>{foa}%</div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>on arrival</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleNavigate}
              disabled={!stations.length || !position}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                border: "none",
                background: emergencyMode ? "#EF4444" : "#16A34A",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                boxShadow: emergencyMode
                  ? "0 4px 16px rgba(239,68,68,0.35)"
                  : "0 4px 16px rgba(22,163,74,0.35)",
                opacity: (!stations.length || !position) ? 0.4 : 1,
              }}
            >
              <Navigation2 size={16} />
              {activeRoute ? "Re-navigate" : "Navigate"}
            </button>
            <button
              onClick={handleEmergency}
              style={{
                height: 50,
                width: 50,
                borderRadius: 14,
                border: `2px solid ${emergencyMode ? "#EF4444" : "#FCA5A5"}`,
                background: emergencyMode ? "#FEF2F2" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} color={emergencyMode ? "#EF4444" : "#F87171"} />
            </button>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              width: "100%",
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: "none",
              border: "none",
              color: "#9CA3AF",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {expanded ? "Hide stations" : `All stations (${stations.length})`}
          </button>
        </div>
      ) : (
        <div style={{ padding: "8px 16px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
          {position ? "Finding nearby fuel stations…" : "Enable location to find fuel stations"}
        </div>
      )}

      {/* Expanded station list */}
      {expanded && (
        <div style={{
          maxHeight: 280,
          overflowY: "auto",
          borderTop: "1px solid #F3F4F6",
          padding: "8px 16px 16px",
        }}>
          {stations.slice(0, 10).map((s: Station) => {
            const rm = reachMeta(s.reachability ?? "reachable");
            const isSel = selectedStation?.id === s.id;
            const foa2 = Math.max(0, Math.round(s.fuelAfterArrivalPct ?? 0));
            return (
              <button
                key={s.id}
                onClick={() => { setSelected(s); setExpanded(false); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 8px",
                  borderRadius: 12,
                  border: "none",
                  background: isSel ? "#F0FDF4" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  borderBottom: "1px solid #F9FAFB",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: BRAND_BG[s.brand] ?? "#16A34A",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>
                    {BRAND_SHORT[s.brand] ?? "FS"}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.brand || s.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                    {s.distanceKm} km · {s.etaMin} min
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: rm.color }}>{foa2}%</div>
                  <div style={{ fontSize: 10, color: rm.color, display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                    <rm.Icon size={9} />{rm.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
