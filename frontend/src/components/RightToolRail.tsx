import { Plus, Minus, Crosshair, Navigation, VolumeX } from "lucide-react";
import { getMap } from "../services/mapInstance";
import { useLocationStore } from "../store/locationStore";

export function RightToolRail() {
  const position = useLocationStore((s) => s.currentLocation);

  const tools = [
    {
      label: "Zoom In",
      icon: <Plus size={15} />,
      action: () => getMap()?.zoomIn({ duration: 250 }),
    },
    {
      label: "Zoom Out",
      icon: <Minus size={15} />,
      action: () => getMap()?.zoomOut({ duration: 250 }),
    },
    {
      label: "Recenter",
      icon: <Crosshair size={15} />,
      action: () => {
        const m = getMap();
        if (m && position) m.flyTo({ center: [position.lon, position.lat], zoom: 13, duration: 800 });
      },
    },
    {
      label: "Traffic",
      icon: <Navigation size={15} />,
      action: () => {},
    },
    {
      label: "Mute",
      icon: <VolumeX size={15} />,
      action: () => {},
    },
  ];

  return (
    <div
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col border border-gray-200 overflow-hidden"
      style={{
        width: 52,
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {tools.map(({ label, icon, action }, i) => (
        <button
          key={label}
          onClick={action}
          title={label}
          className={
            "flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors " +
            (i < tools.length - 1 ? "border-b border-gray-100" : "")
          }
          style={{ height: 52 }}
        >
          {icon}
          <span className="text-[9px] text-gray-400 font-medium leading-none">
            {label.split(" ")[0]}
          </span>
        </button>
      ))}
    </div>
  );
}
