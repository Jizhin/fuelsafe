import { Shield, CloudRain, Sun } from "lucide-react";
import { useVehicleStore } from "../../store/vehicleStore";
import { useUIStore } from "../../store/uiStore";
import { estimatedRange, fuelRiskLevel } from "../../services/fuelCalc";

export function MobileTopBar() {
  const vehicle = useVehicleStore((s) => s.vehicle);
  const weather = useUIStore((s) => s.weather);
  const rangeKm = Math.round(estimatedRange(vehicle));
  const risk = fuelRiskLevel(vehicle.fuelPercent);
  const riskColor = risk === "safe" ? "#16A34A" : risk === "low" ? "#F59E0B" : "#EF4444";

  const tempText = weather ? `${weather.temp}°C` : "—";
  const isRain = weather?.description?.toLowerCase().includes("rain") ||
    weather?.description?.toLowerCase().includes("cloud");

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        zIndex: 20,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: "#16A34A",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={14} color="white" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
          FuelSafe
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Fuel */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: riskColor, lineHeight: 1 }}>
          {vehicle.fuelPercent}%
        </div>
        <div style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Fuel
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: "#E5E7EB", flexShrink: 0 }} />

      {/* Range */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
          {rangeKm}
        </div>
        <div style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          km left
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: "#E5E7EB", flexShrink: 0 }} />

      {/* Weather */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {isRain ? <CloudRain size={14} color="#60A5FA" /> : <Sun size={14} color="#F59E0B" />}
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{tempText}</span>
      </div>
    </div>
  );
}
