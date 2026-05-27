import { Navigation2, PauseCircle, GitFork, AlertTriangle } from "lucide-react";
import { useLocationStore } from "../store/locationStore";
import { useStationsStore } from "../store/stationsStore";
import { useVehicleStore } from "../store/vehicleStore";
import { useUIStore } from "../store/uiStore";

export function BottomTimeline() {
  const activeRoute    = useLocationStore((s) => s.activeRoute);
  const clearRoute     = useLocationStore((s) => s.clearRoute);
  const position       = useLocationStore((s) => s.currentLocation);
  const stations       = useStationsStore((s) => s.stations);
  const selectedStation = useStationsStore((s) => s.selectedStation);
  const setSelected    = useStationsStore((s) => s.setSelectedStation);
  const vehicle        = useVehicleStore((s) => s.vehicle);
  const emergencyMode  = useUIStore((s) => s.emergencyMode);
  const setEmergency   = useUIStore((s) => s.setEmergencyMode);

  const target = selectedStation ?? stations[0] ?? null;
  const foa    = target ? Math.max(0, Math.round(target.fuelAfterArrivalPct ?? 0)) : 0;
  const foaColor = foa > 15 ? "#16A34A" : foa > 5 ? "#F59E0B" : "#EF4444";

  const totalDist = activeRoute
    ? `${activeRoute.distanceKm.toFixed(0)} km`
    : target ? `${target.distanceKm} km` : "—";
  const eta = activeRoute
    ? `${activeRoute.durationMin} min`
    : target ? `${target.etaMin} min` : "—";

  const handleStartNavigation = () => {
    const best = stations.find((s) => s.reachability === "reachable") ?? stations[0];
    if (best) setSelected(best);
    setEmergency(false);
  };

  const handleEmergencyFuel = () => {
    const isOn = !emergencyMode;
    setEmergency(isOn);
    if (isOn) {
      // Pick nearest station regardless of reachability
      const nearest = stations[0];
      if (nearest) setSelected(nearest);
    }
  };

  const handleAlternativeRoute = () => {
    // Switch to the next nearest reachable station
    const currentId = selectedStation?.id;
    const candidates = stations.filter((s) => s.reachability === "reachable" && s.id !== currentId);
    const alt = candidates[0] ?? stations.find((s) => s.id !== currentId) ?? null;
    if (alt) setSelected(alt);
  };

  return (
    <div
      className="flex-shrink-0 bg-white border-t border-gray-200 flex flex-col justify-center"
      style={{
        height: 120,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
        background: emergencyMode ? "#FFF5F5" : "#fff",
        borderTopColor: emergencyMode ? "#FECACA" : undefined,
      }}
    >
      <div className="flex items-center px-6 gap-6 h-full">
        {/* ── Timeline ─────────────────────────── */}
        <div className="flex items-center flex-1 min-w-0 gap-0 overflow-hidden">
          <TimelineStop
            color={emergencyMode ? "#EF4444" : "#16A34A"}
            label="YOUR LOCATION"
            name={position ? "Current GPS" : "Enable GPS"}
            sub="Now"
          />

          {target && (
            <>
              <SegmentLine
                dist={activeRoute ? `${activeRoute.distanceKm.toFixed(1)} km` : `${target.distanceKm} km`}
                dur={activeRoute ? `${activeRoute.durationMin} min` : `${target.etaMin} min`}
                active
                emergency={emergencyMode}
              />
              <TimelineStop
                color={emergencyMode ? "#EF4444" : "#16A34A"}
                label={emergencyMode ? "EMERGENCY FUEL" : "FUEL STOP"}
                name={target.brand || target.name}
                sub={activeRoute ? `${activeRoute.distanceKm.toFixed(1)} km by road` : `${target.distanceKm} km away`}
                fuel
                emergency={emergencyMode}
              />
            </>
          )}
        </div>

        {/* ── Metrics ──────────────────────────── */}
        <div className="flex items-center gap-5 flex-shrink-0 border-l border-gray-100 pl-6">
          <Metric label="Fuel on Arrival" value={`${foa}%`} color={foaColor} />
          <Metric label="Total Distance"  value={totalDist} />
          <Metric label="ETA"             value={eta} color="#16A34A" />
          <Metric label="Traffic"         value="Moderate" color="#F59E0B" />
        </div>

        {/* ── Action Buttons ───────────────────── */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleStartNavigation}
              disabled={!stations.length || !position}
              className="flex items-center gap-2 text-white font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{
                background: "#16A34A",
                height: 40, fontSize: 13,
                paddingLeft: 16, paddingRight: 16,
                boxShadow: "0 2px 8px rgba(22,163,74,0.30)",
              }}
            >
              <Navigation2 size={14} />
              Start Navigation
            </button>
            {activeRoute && (
              <button
                onClick={clearRoute}
                className="flex items-center gap-1.5 font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                style={{ height: 40, fontSize: 13, paddingLeft: 12, paddingRight: 12 }}
              >
                <PauseCircle size={14} />
                Pause
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAlternativeRoute}
              disabled={!stations.length || stations.filter((s) => s.id !== selectedStation?.id).length === 0}
              className="flex items-center gap-1.5 font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
              style={{ height: 36, fontSize: 12, paddingLeft: 10, paddingRight: 10 }}
            >
              <GitFork size={13} />
              Alt. Station
            </button>
            <button
              onClick={handleEmergencyFuel}
              className={
                "flex items-center gap-1.5 font-semibold rounded-xl transition-all " +
                (emergencyMode
                  ? "text-white border-transparent"
                  : "text-red-500 border border-red-200 hover:bg-red-50")
              }
              style={{
                height: 36, fontSize: 12,
                paddingLeft: 10, paddingRight: 10,
                background: emergencyMode ? "#EF4444" : undefined,
              }}
            >
              <AlertTriangle size={13} />
              {emergencyMode ? "Cancel Emergency" : "Emergency Fuel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStop({ color, label, name, sub, fuel, emergency }: {
  color: string; label: string; name: string; sub: string; fuel?: boolean; emergency?: boolean;
}) {
  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 96 }}>
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 0 3px ${color}22` }}>
        {fuel && (
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
            <path d="M4 22V5a2 2 0 012-2h8a2 2 0 012 2v5l3-1.5V17h-3v5H4zM8 5v4h4V5H8z" />
          </svg>
        )}
      </div>
      <div className="mt-1.5 text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest leading-none"
          style={{ color: emergency ? "#EF4444" : "#9CA3AF" }}>
          {label}
        </p>
        <p className="text-[12px] font-semibold text-gray-900 mt-0.5 leading-tight truncate max-w-[88px]">{name}</p>
        <p className="text-[10px] text-gray-400 leading-none mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function SegmentLine({ dist, dur, active, emergency }: {
  dist: string; dur: string; active: boolean; emergency?: boolean;
}) {
  const lineColor = emergency ? "#EF4444" : active ? "#16A34A" : "#D1D5DB";
  return (
    <div className="flex-1 flex flex-col items-center min-w-0 mx-2" style={{ minWidth: 80 }}>
      <div className="flex items-center w-full gap-1.5">
        <div className="flex-1 h-0.5" style={{ background: lineColor }} />
        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0">{dist}</span>
        <div className="flex-1 h-0.5" style={{ background: "#D1D5DB" }} />
      </div>
      <span className="text-[10px] text-gray-400 mt-0.5">{dur}</span>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-shrink-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-[18px] font-bold leading-tight mt-0.5" style={{ color: color ?? "#111827" }}>{value}</p>
    </div>
  );
}
