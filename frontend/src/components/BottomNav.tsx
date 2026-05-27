import { Map, Bell, Route, Car, User } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "../store/uiStore";

const TABS = [
  { id: "map",     label: "Map",        Icon: Map   },
  { id: "alerts",  label: "Alerts",     Icon: Bell  },
  { id: "trips",   label: "Trips",      Icon: Route },
  { id: "vehicle", label: "My Vehicle", Icon: Car   },
  { id: "profile", label: "Profile",    Icon: User  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function BottomNav() {
  const activeTab  = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const alertCount = useUIStore((s) => s.alertCount);

  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-100"
         style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.04)" }}>
      <div className="flex items-stretch" style={{ height: 64 }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          const hasAlert = id === "alerts" && alertCount > 0;
          return (
            <button key={id} onClick={() => setActiveTab(id as TabId)}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors group">
              {active && (
                <motion.div layoutId="nav-bar"
                  className="absolute top-0 inset-x-0 mx-auto rounded-b-full"
                  style={{ height: 3, width: 32, background: "#16A34A" }}/>
              )}
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8}
                  className={active ? "text-primary" : "text-gray-400 group-hover:text-gray-600 transition-colors"}/>
                {hasAlert && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </div>
              <span className={"text-[11px] font-medium transition-colors " + (active ? "text-primary" : "text-gray-400 group-hover:text-gray-600")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
