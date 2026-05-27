import { Search, Settings, Bell, Shield, Navigation2, CloudRain, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useVehicleStore } from "../store/vehicleStore";
import { useUIStore } from "../store/uiStore";
import { useLocationStore } from "../store/locationStore";
import { useStationsStore } from "../store/stationsStore";
import { estimatedRange } from "../services/fuelCalc";
import { fetchWeather } from "../services/openweather";

export default function Header() {
  const vehicle       = useVehicleStore((s) => s.vehicle);
  const alertCount    = useUIStore((s) => s.alertCount);
  const weather       = useUIStore((s) => s.weather);
  const setWeather    = useUIStore((s) => s.setWeather);
  const setSelected   = useStationsStore((s) => s.setSelectedStation);
  const stations      = useStationsStore((s) => s.stations);
  const position      = useLocationStore((s) => s.currentLocation);
  const [search, setSearch] = useState("");
  const rangeKm = Math.round(estimatedRange(vehicle));

  // Fetch real weather whenever position changes (~1 km precision)
  useEffect(() => {
    if (!position) return;
    fetchWeather(position).then((w) => { if (w) setWeather(w); });
  }, [position?.lat.toFixed(2), position?.lon.toFixed(2)]);

  const handleRefuelNow = () => {
    const nearest = stations.find((s) => s.reachability === "reachable") ?? stations[0];
    if (nearest) setSelected(nearest);
  };

  const tempText = weather ? `${weather.temp}°C` : position ? "—°C" : "—";
  const weatherIcon = weather?.description?.toLowerCase().includes("rain") ||
    weather?.description?.toLowerCase().includes("cloud") ? (
    <CloudRain size={13} className="text-blue-400" />
  ) : (
    <Sun size={13} className="text-amber-400" />
  );

  return (
    <div
      className="flex items-center gap-5 px-6 flex-shrink-0 bg-white border-b border-gray-200"
      style={{ height: 72, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0" style={{ width: 200 }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#16A34A" }}>
          <Shield size={16} color="white" />
        </div>
        <span className="text-[18px] font-bold text-gray-900 tracking-tight">FuelSafe</span>
      </div>

      {/* Search */}
      <div className="relative flex items-center flex-shrink-0" style={{ width: 380 }}>
        <Search size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search destination or place"
          className="w-full pl-10 pr-10 outline-none rounded-xl border bg-[#F7F8F7] text-gray-800 placeholder-gray-400"
          style={{ height: 44, fontSize: 14, fontWeight: 500, borderColor: "#E5E7EB", transition: "border-color 0.15s, box-shadow 0.15s" }}
          onFocus={(e) => { e.target.style.borderColor = "#16A34A"; e.target.style.boxShadow = "0 0 0 2px rgba(22,163,74,0.15)"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
        />
        <span className="absolute right-3.5 text-[11px] text-gray-400 font-mono border border-gray-200 rounded px-1 leading-4">/</span>
      </div>

      {/* Status items */}
      <div className="flex items-center gap-0 flex-1 min-w-0">
        <StatusBlock label="FUEL" value={`${vehicle.fuelPercent}%`} color="#16A34A" bar={vehicle.fuelPercent} />
        <Sep />
        <div className="flex-shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Est. Range</p>
          <p className="text-[15px] font-semibold leading-tight mt-0.5" style={{ color: "#111827" }}>~{rangeKm} km</p>
        </div>
        <Sep />
        <StatusBlock label="TRAFFIC" value="Moderate" color="#F59E0B" />
        <Sep />
        <div className="flex-shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Weather</p>
          <div className="flex items-center gap-1 mt-0.5">
            {weatherIcon}
            <p className="text-[15px] font-semibold leading-none" style={{ color: "#111827" }}>{tempText}</p>
          </div>
        </div>
        <Sep />
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Alerts</p>
            <p className="text-[15px] font-semibold leading-tight mt-0.5" style={{ color: alertCount > 0 ? "#EF4444" : "#111827" }}>
              {alertCount}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleRefuelNow}
          disabled={!stations.length}
          className="flex items-center gap-1.5 font-semibold text-white rounded-xl px-3.5 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ height: 36, fontSize: 13, background: "#16A34A", boxShadow: "0 2px 6px rgba(22,163,74,0.25)" }}
        >
          <Navigation2 size={13} />
          Refuel Now
        </button>
        <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Settings size={15} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

function Sep() {
  return <div className="w-px h-8 bg-gray-100 mx-5 flex-shrink-0" />;
}

function StatusBlock({ label, value, color, bar }: { label: string; value: string; color?: string; bar?: number }) {
  return (
    <div className="flex-shrink-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-[15px] font-semibold leading-tight mt-0.5" style={{ color: color ?? "#111827" }}>{value}</p>
      {bar !== undefined && (
        <div className="w-14 h-1 rounded-full bg-gray-100 mt-1">
          <div className="h-full rounded-full transition-all" style={{ width: `${bar}%`, background: "#16A34A" }} />
        </div>
      )}
    </div>
  );
}
