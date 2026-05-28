import { useEffect } from "react";
import Header from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import MapView from "./components/Map/MapView";
import { RightToolRail } from "./components/RightToolRail";
import { BottomTimeline } from "./components/BottomTimeline";
import { VehicleSetup } from "./components/VehicleSetup";
import { MobileTopBar } from "./components/mobile/MobileTopBar";
import { MobileBottomCard } from "./components/mobile/MobileBottomCard";
import { useGeolocation } from "./hooks/useGeolocation";
import { useNearbyStations } from "./hooks/useNearbyStations";
import { useRoutingToStation } from "./hooks/useRouting";
import { useWebSocket } from "./hooks/useWebSocket";
import { useFuelConsumption } from "./hooks/useFuelConsumption";
import { useStationsStore } from "./store/stationsStore";
import { useVehicleStore } from "./store/vehicleStore";

function InnerApp() {
  const { position } = useGeolocation();
  const { data: stationsData, isLoading } = useNearbyStations(position);
  const setStations = useStationsStore((s) => s.setStations);
  const setLoading  = useStationsStore((s) => s.setLoading);
  const setupComplete = useVehicleStore((s) => s.setupComplete);

  useEffect(() => { setStations(stationsData ?? []); }, [stationsData]);
  useEffect(() => { setLoading(isLoading); }, [isLoading]);

  useRoutingToStation();
  useWebSocket();
  useFuelConsumption(position);

  return (
    <div
      className="h-screen w-screen overflow-hidden font-sans"
      style={{ background: "#F4F7F5" }}
    >
      {!setupComplete && <VehicleSetup />}

      {/* ── Desktop layout (md and up) ────────────────────────── */}
      <div className="hidden md:flex flex-col h-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="relative flex-1 overflow-hidden">
            <MapView />
            <RightToolRail />
          </div>
        </div>
        <BottomTimeline />
      </div>

      {/* ── Mobile layout (below md) ──────────────────────────── */}
      <div className="md:hidden relative w-full h-full">
        {/* Map: fills entire screen */}
        <div style={{ position: "absolute", inset: 0 }}>
          <MapView />
        </div>

        {/* Floating top bar */}
        <MobileTopBar />

        {/* Floating bottom card */}
        <MobileBottomCard />
      </div>
    </div>
  );
}

export default InnerApp;
