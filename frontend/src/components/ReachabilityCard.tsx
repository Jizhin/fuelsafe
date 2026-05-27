import { motion } from "framer-motion";
import { useVehicleStore } from "../store/vehicleStore";
import { useStationsStore } from "../store/stationsStore";
import { fuelRiskLevel } from "../services/fuelCalc";
import { useUIStore } from "../store/uiStore";

export function ReachabilityCard() {
  const vehicle  = useVehicleStore((s) => s.vehicle);
  const stations = useStationsStore((s) => s.stations);
  const nearest  = stations[0] ?? null;
  const setSelectedStation = useStationsStore((s) => s.setSelectedStation);
  const riskLevel = fuelRiskLevel(vehicle.fuelPercent);

  if (!nearest) return null;

  const canReach = nearest.reachability !== "unreachable";
  const isLow    = nearest.reachability === "caution";
  const barPct   = Math.min(100, Math.max(0, nearest.fuelAfterArrivalPct));
  const answerColor = canReach ? "#16A34A" : "#EF4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-5 right-5 bg-white rounded-[20px] z-20"
      style={{ width: 300, boxShadow: "0 10px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: canReach ? "#DCFCE7" : "#FEE2E2" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 22V8l3-5h12l3 5v14H3zm7-5a2 2 0 104 0 2 2 0 00-4 0zm-5 0a2 2 0 104 0 2 2 0 00-4 0z"
                fill={answerColor}/>
            </svg>
          </div>
          <p className="text-[14px] text-gray-500 font-medium leading-snug">
            Can you reach the<br/>nearest pump?
          </p>
        </div>

        {/* Big answer */}
        <p className="font-bold leading-tight mb-1" style={{ fontSize: 22, color: answerColor }}>
          {canReach ? "YES, You can reach" : "NO, Out of range"}
        </p>

        {/* Station info */}
        <p className="text-[14px] text-gray-400 mb-4">
          {nearest.brand}, {nearest.distanceKm} KM away
        </p>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full overflow-hidden mb-2"
          style={{ background: canReach ? "#DCFCE7" : "#FEE2E2" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: answerColor }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-400">Fuel left after arrival</span>
          <span className="text-[13px] font-bold" style={{ color: answerColor }}>{barPct.toFixed(0)}%</span>
        </div>
      </div>

      {riskLevel === "critical" && (
        <div className="border-t border-red-100 px-5 py-3 rounded-b-[20px]" style={{ background: "#FEF2F2" }}>
          <motion.p animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-[12px] font-bold text-red-600 text-center">
            ⚠ CRITICAL — Find a pump immediately
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}
