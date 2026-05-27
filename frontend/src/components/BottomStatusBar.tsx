import { motion, AnimatePresence } from "framer-motion";
import { Navigation2, Clock, MapPin } from "lucide-react";
import { useStationsStore } from "../store/stationsStore";
import { useLocationStore } from "../store/locationStore";
import { useQuery } from "@tanstack/react-query";
import { reverseGeocode } from "../services/mapbox";

export function BottomStatusBar() {
  const stations    = useStationsStore((s) => s.stations);
  const selected    = useStationsStore((s) => s.selectedStation);
  const activeRoute = useLocationStore((s) => s.activeRoute);
  const position    = useLocationStore((s) => s.currentLocation);
  const target      = selected ?? stations[0];

  const { data: placeName } = useQuery({
    queryKey: ["revgeo", position?.lat.toFixed(3), position?.lon.toFixed(3)],
    queryFn:  () => reverseGeocode(position!),
    enabled:  !!position,
    staleTime: 120_000,
  });

  if (!target) return null;

  const reachColor =
    target.reachability === "reachable" ? "#16A34A" :
    target.reachability === "caution"   ? "#F59E0B" : "#EF4444";

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20"
      style={{ width: "calc(100% - 40px)", maxWidth: 700 }}
    >
      <div className="bg-white rounded-[20px] border border-gray-100 px-6 py-4"
           style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-5">

          {/* Location */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "#16A34A", boxShadow: "0 0 0 4px rgba(22,163,74,0.15)" }}/>
            <div className="min-w-0">
              <p className="text-[12px] text-gray-400 font-medium">Current Location</p>
              <p className="text-[15px] font-semibold text-gray-900 truncate">
                {placeName ?? (position ? "Locating…" : "Enable location")}
              </p>
            </div>
          </div>

          <div className="w-px h-12 bg-gray-100 flex-shrink-0"/>

          {/* Distance */}
          <div className="text-center flex-shrink-0">
            <p className="text-[12px] text-gray-400 font-medium">Distance to Next Pump</p>
            <p className="text-[20px] font-bold text-gray-900">{target.distanceKm} <span className="text-[14px] font-semibold text-gray-400">KM</span></p>
          </div>

          <div className="w-px h-12 bg-gray-100 flex-shrink-0"/>

          {/* ETA */}
          <div className="text-center flex-shrink-0">
            <p className="text-[12px] text-gray-400 font-medium">ETA</p>
            <div className="flex items-center justify-center gap-1.5">
              <Clock size={14} className="text-gray-400"/>
              <p className="text-[20px] font-bold text-gray-900">{target.etaMin} <span className="text-[14px] font-semibold text-gray-400">mins</span></p>
            </div>
          </div>

          {/* Navigate CTA */}
          <button
            onClick={() => useStationsStore.getState().setSelectedStation(target)}
            className="ml-2 flex items-center gap-2.5 text-white font-bold text-[15px] px-7 rounded-2xl transition-all hover:bg-green-700 active:scale-95"
            style={{
              background: "#16A34A",
              height: 56,
              boxShadow: "0 4px 20px rgba(22,163,74,0.40)",
              flexShrink: 0,
            }}
          >
            <Navigation2 size={18}/>
            Navigate
          </button>
        </div>

        <AnimatePresence>
          {activeRoute && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-400">
              <span>Route active · {activeRoute.distanceKm.toFixed(1)} km · {activeRoute.durationMin} min</span>
              <button onClick={() => useLocationStore.getState().clearRoute()}
                className="text-red-500 hover:text-red-700 font-semibold transition-colors">
                End route
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
