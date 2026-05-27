import type { ReactNode } from "react";
import { useState } from "react";
import { Clock, MapPin, ChevronRight, Shield, AlertTriangle, Info, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useVehicleStore } from "../store/vehicleStore";
import { useStationsStore } from "../store/stationsStore";
import { useLocationStore } from "../store/locationStore";
import { estimatedRange, fuelRiskLevel } from "../services/fuelCalc";

const BRAND: Record<string, { bg: string; fg: string; short: string }> = {
  IndianOil:          { bg: "#F97316", fg: "#fff", short: "IO" },
  HPCL:               { bg: "#1D4ED8", fg: "#fff", short: "HP" },
  BPCL:               { bg: "#2563EB", fg: "#fff", short: "BP" },
  Reliance:           { bg: "#1E293B", fg: "#fff", short: "RL" },
  Shell:              { bg: "#FBBF24", fg: "#1E293B", short: "SH" },
  Essar:              { bg: "#0369A1", fg: "#fff", short: "ES" },
  "Bharat Petroleum": { bg: "#2563EB", fg: "#fff", short: "BP" },
  "HP Petrol Pump":   { bg: "#1D4ED8", fg: "#fff", short: "HP" },
  "Fuel Station":     { bg: "#64748B", fg: "#fff", short: "FS" },
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 leading-none">
      {children}
    </p>
  );
}

function FuelArc({ pct }: { pct: number }) {
  const risk = fuelRiskLevel(pct);
  const color = risk === "critical" ? "#EF4444" : risk === "low" ? "#F59E0B" : "#16A34A";
  const r = 36;
  const cx = 44;
  const cy = 44;
  const total = Math.PI * r;
  const filled = (pct / 100) * total;
  return (
    <div className="relative flex-shrink-0" style={{ width: 88, height: 52 }}>
      <svg width="88" height="52" viewBox="0 0 88 52" overflow="visible">
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${total}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: 2 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

export function Sidebar() {
  const vehicle = useVehicleStore((s) => s.vehicle);
  const stations = useStationsStore((s) => s.stations);
  const selectedStation = useStationsStore((s) => s.selectedStation);
  const setSelected = useStationsStore((s) => s.setSelectedStation);
  const loading = useStationsStore((s) => s.loading);
  const activeRoute = useLocationStore((s) => s.activeRoute);
  const position = useLocationStore((s) => s.currentLocation);
  const locErr = useLocationStore((s) => s.error);

  const [showAll, setShowAll] = useState(false);
  const rangeKm = Math.round(estimatedRange(vehicle));
  const risk = fuelRiskLevel(vehicle.fuelPercent);
  const target = selectedStation ?? stations[0] ?? null;
  const shown = stations.slice(0, showAll ? undefined : 4);
  const riskColor = risk === "safe" ? "#16A34A" : risk === "low" ? "#F59E0B" : "#EF4444";
  const riskLabel = risk === "safe" ? "Low" : risk === "low" ? "Moderate" : "Critical";

  return (
    <div
      className="flex flex-col h-full overflow-y-auto border-r border-gray-200 flex-shrink-0"
      style={{ width: 340, background: "#fff" }}
    >
      {/* ── VEHICLE ─────────────────────────────── */}
      <div className="px-6 pt-5 pb-5 border-b border-gray-100">
        <SectionLabel>Vehicle</SectionLabel>
        <div className="flex items-center gap-4">
          <FuelArc pct={vehicle.fuelPercent} />
          <div className="flex-1 space-y-2">
            <Row label="Safe Range" value={`${rangeKm} km`} color="#16A34A" />
            <Row label="Avg. Efficiency" value={`${vehicle.mileage} km/L`} />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-500">Risk Status</span>
              <div className="flex items-center gap-1">
                <Shield size={11} style={{ color: riskColor }} />
                <span className="text-[13px] font-semibold" style={{ color: riskColor }}>
                  {riskLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3.5 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${vehicle.fuelPercent}%`, background: riskColor }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400 font-medium">E</span>
          <span className="text-[10px] text-gray-400 font-medium">Fuel Level</span>
          <span className="text-[10px] text-gray-400 font-medium">F</span>
        </div>
      </div>

      {/* ── CURRENT ROUTE ───────────────────────── */}
      <div className="px-6 py-5 border-b border-gray-100">
        <SectionLabel>Current Route</SectionLabel>
        {activeRoute ? (
          <div className="space-y-2.5">
            <Row label="Destination" value="En Route" />
            <Row label="ETA" value={`${activeRoute.durationMin} min`} color="#16A34A" />
            <Row label="Distance" value={`${activeRoute.distanceKm.toFixed(1)} km`} />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-500">Traffic</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold" style={{ color: "#F59E0B" }}>
                  Moderate
                </span>
                <div className="flex gap-0.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-sm bg-red-400" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-amber-400" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-500">Weather Impact</span>
              <span className="text-[13px] font-semibold" style={{ color: "#16A34A" }}>
                Low
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-gray-400 leading-relaxed">
            No active route. Select a fuel stop to begin navigation.
          </p>
        )}
      </div>

      {/* ── REACHABLE FUEL STOPS ────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Reachable Fuel Stops</SectionLabel>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-[12px] font-semibold -mt-3 hover:opacity-70 transition-opacity"
            style={{ color: "#16A34A" }}
          >
            {showAll ? "Show less" : `View all (${stations.length})`}
          </button>
        </div>

        {locErr && (
          <p className="text-[12px] text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3 border border-red-100">
            {locErr}
          </p>
        )}

        {loading && !stations.length && (
          <div className="flex items-center gap-2 py-8 justify-center text-[13px] text-gray-400">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" />
              <path d="M12 2a10 10 0 0110 10" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Finding stations…
          </div>
        )}

        {!position && !loading && (
          <p className="text-[13px] text-gray-400 text-center py-6">
            Enable location to find nearby stations
          </p>
        )}

        {/* Alert banner if any station is unreachable */}
        {shown.some((s) => s.reachability === "unreachable") && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-3">
            <XCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-700 font-medium leading-snug">
              Some stations are out of range. Refuel as soon as possible.
            </p>
          </div>
        )}
        {shown.length > 0 && shown.every((s) => s.reachability === "reachable") && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-3">
            <CheckCircle size={13} className="text-green-600 flex-shrink-0" />
            <p className="text-[12px] text-green-700 font-medium">
              All nearby stations are within reach.
            </p>
          </div>
        )}

        <div>
          {shown.map((s, i) => {
            const b = BRAND[s.brand] ?? BRAND["Fuel Station"];
            const isRec = target?.id === s.id && i === 0;
            const foa = Math.max(0, Math.round(s.fuelAfterArrivalPct ?? 0));
            const reach = s.reachability ?? "reachable";
            const reachMeta = {
              reachable:   { color: "#16A34A", bg: "#F0FDF4", Icon: CheckCircle,   label: "Can reach"   },
              caution:     { color: "#D97706", bg: "#FFFBEB", Icon: AlertCircle,   label: "Borderline"  },
              unreachable: { color: "#DC2626", bg: "#FEF2F2", Icon: XCircle,       label: "Out of range" },
            }[reach] ?? { color: "#16A34A", bg: "#F0FDF4", Icon: CheckCircle, label: "Can reach" };
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={
                  "w-full flex items-center gap-3 py-3.5 text-left transition-colors rounded-lg -mx-1 px-1 border-b border-gray-50 last:border-b-0 " +
                  (isRec ? "bg-green-50" : "hover:bg-gray-50")
                }
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background: b.bg, color: b.fg }}
                >
                  {b.short}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[13px] font-semibold text-gray-900 truncate">
                      {s.brand || s.name}
                    </span>
                    {isRec && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                        style={{ background: "#16A34A" }}
                      >
                        REC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <MapPin size={9} /> {s.distanceKm} km
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} /> {s.etaMin} min
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[15px] font-bold leading-tight" style={{ color: reachMeta.color }}>
                    {foa}%
                  </p>
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                    style={{ background: reachMeta.bg, color: reachMeta.color }}
                  >
                    <reachMeta.Icon size={9} />
                    {reachMeta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {stations.length > 4 && (
          <button
            className="w-full mt-3 flex items-center justify-center gap-1 text-[13px] font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ color: "#16A34A" }}
          >
            View all fuel stops <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* ── SAFETY INSIGHTS ─────────────────────── */}
      <div className="px-6 py-5">
        <SectionLabel>Safety Insights</SectionLabel>
        <div className="space-y-2">
          {target && (
            <InsightRow
              bg="#FFFBEB"
              icon={<AlertTriangle size={13} style={{ color: "#D97706" }} className="mt-0.5 flex-shrink-0" />}
              title="Fuel Recommendation"
              titleColor="#92400E"
              body={
                target.reachability !== "unreachable"
                  ? `Refuel at ${target.brand} — ${target.distanceKm} km ahead for safe journey.`
                  : "Fuel critically low — find a pump immediately."
              }
              bodyColor="#B45309"
            />
          )}
          <InsightRow
            bg="#EFF6FF"
            icon={<Info size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />}
            title="Traffic Ahead"
            titleColor="#1E40AF"
            body="Moderate traffic expected along route."
            bodyColor="#1D4ED8"
          />
          <InsightRow
            bg="#F0FDF4"
            icon={
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ background: "#16A34A" }}
              />
            }
            title="Weather Alert"
            titleColor="#14532D"
            body="Clear conditions ahead — safe to drive."
            bodyColor="#15803D"
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className="text-[13px] font-semibold" style={{ color: color ?? "#111827" }}>
        {value}
      </span>
    </div>
  );
}

function InsightRow({
  bg,
  icon,
  title,
  titleColor,
  body,
  bodyColor,
}: {
  bg: string;
  icon: ReactNode;
  title: string;
  titleColor: string;
  body: string;
  bodyColor: string;
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: bg }}>
      {icon}
      <div>
        <p className="text-[12px] font-semibold leading-none" style={{ color: titleColor }}>
          {title}
        </p>
        <p className="text-[11px] mt-1 leading-snug" style={{ color: bodyColor }}>
          {body}
        </p>
      </div>
    </div>
  );
}
