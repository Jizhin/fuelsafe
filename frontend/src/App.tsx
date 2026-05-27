import { useEffect } from "react";
import Header from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import MapView from "./components/Map/MapView";
import { RightToolRail } from "./components/RightToolRail";
import { BottomTimeline } from "./components/BottomTimeline";
import { VehicleSetup } from "./components/VehicleSetup";
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
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans" style={{ background: "#F4F7F5" }}>
      {!setupComplete && <VehicleSetup />}
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
  );
}

export default InnerApp;
