/**
 * First-run vehicle profile setup modal.
 * Lets the user pick their vehicle from a curated Indian vehicle database
 * and enter current fuel level. Saved to localStorage via Zustand persist.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown, Fuel, Check } from "lucide-react";
import { useVehicleStore } from "../store/vehicleStore";
import type { Vehicle, FuelType } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8001";

interface VehicleSpec {
  brand: string;
  model: string;
  fuel_type: FuelType;
  tank_capacity: number;
  mileage: number;
}

export function VehicleSetup() {
  const completeSetup = useVehicleStore((s) => s.completeSetup);

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<VehicleSpec[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [spec, setSpec] = useState<VehicleSpec | null>(null);
  const [fuelPct, setFuelPct] = useState(50);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/vehicles/makes`)
      .then((r) => r.json())
      .then(setMakes)
      .catch(() => setMakes(FALLBACK_MAKES));
  }, []);

  useEffect(() => {
    if (!brand) return;
    setModels([]);
    setModel("");
    setSpec(null);
    fetch(`${API_BASE}/api/vehicles/models?brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then(setModels)
      .catch(() => setModels([]));
  }, [brand]);

  const selectModel = (m: VehicleSpec) => {
    setModel(m.model);
    setSpec(m);
    setStep(2);
  };

  const save = () => {
    if (!spec) return;
    setSaving(true);
    const v: Vehicle = {
      id: `${brand}-${model}`.toLowerCase().replace(/\s+/g, "-"),
      name: `${brand} ${model}`,
      brand,
      model,
      fuelType: spec.fuel_type,
      mileage: spec.mileage,
      tankCapacity: spec.tank_capacity,
      fuelPercent: fuelPct,
    };
    setTimeout(() => {
      completeSetup(v);
      setSaving(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ width: 480, maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#16A34A" }}>
              <Shield size={20} color="white" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 leading-tight">Setup Your Vehicle</h2>
              <p className="text-[13px] text-gray-400">FuelSafe needs your vehicle profile to work.</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                  style={{
                    background: step >= s ? "#16A34A" : "#E5E7EB",
                    color: step >= s ? "#fff" : "#9CA3AF",
                  }}
                >
                  {step > s ? <Check size={12} /> : s}
                </div>
                {s < 3 && (
                  <div className="flex-1 h-0.5 w-12 rounded-full" style={{ background: step > s ? "#16A34A" : "#E5E7EB" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
                <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Brand</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {makes.map((m) => (
                    <button
                      key={m}
                      onClick={() => { setBrand(m); }}
                      className={"text-left px-4 py-3 rounded-xl border text-[14px] font-medium transition-all " +
                        (brand === m ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-gray-300 text-gray-800 hover:bg-gray-50")}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {brand && models.length > 0 && (
                  <>
                    <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Model</p>
                    <div className="space-y-1.5">
                      {models.map((v) => (
                        <button
                          key={v.model}
                          onClick={() => selectModel(v)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                        >
                          <div className="text-left">
                            <p className="text-[14px] font-semibold text-gray-900">{v.model}</p>
                            <p className="text-[12px] text-gray-400">
                              {v.mileage} km/L · {v.tank_capacity}L · {v.fuel_type}
                            </p>
                          </div>
                          <ChevronDown size={16} className="text-gray-400 -rotate-90 group-hover:text-green-500" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 2 && spec && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
                <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Enter Current Fuel Level</p>

                {/* Selected vehicle summary */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-green-200 bg-green-50 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#16A34A" }}>
                    <Fuel size={18} color="white" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900">{brand} {model}</p>
                    <p className="text-[12px] text-gray-500">{spec.mileage} km/L · {spec.tank_capacity}L tank · {spec.fuel_type}</p>
                  </div>
                </div>

                {/* Fuel slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-[14px] text-gray-700 font-medium">Fuel Level</span>
                    <span className="text-[32px] font-bold leading-none" style={{ color: fuelPct > 25 ? "#16A34A" : fuelPct > 10 ? "#F59E0B" : "#EF4444" }}>
                      {fuelPct}%
                    </span>
                  </div>
                  <input
                    type="range" min={1} max={100} value={fuelPct}
                    onChange={(e) => setFuelPct(+e.target.value)}
                    className="w-full cursor-pointer accent-green-600"
                    style={{ height: 6 }}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[11px] text-gray-400">Empty</span>
                    <span className="text-[11px] text-gray-400">
                      ≈ {Math.round((fuelPct / 100) * spec.tank_capacity * spec.mileage)} km range
                    </span>
                    <span className="text-[11px] text-gray-400">Full</span>
                  </div>
                </div>

                {/* Quick pick buttons */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setFuelPct(pct)}
                      className={"py-2 rounded-xl text-[13px] font-semibold border transition-all " +
                        (fuelPct === pct ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#DCFCE7" }}>
                    <Check size={32} style={{ color: "#16A34A" }} />
                  </div>
                  <h3 className="text-[20px] font-bold text-gray-900 mb-2">All Set!</h3>
                  <p className="text-[14px] text-gray-500">
                    {brand} {model} · {fuelPct}% fuel · {Math.round((fuelPct / 100) * (spec?.tank_capacity ?? 40) * (spec?.mileage ?? 15))} km range
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2">
          {step === 1 && brand && model && (
            <button
              onClick={() => setStep(2)}
              className="w-full text-white font-semibold rounded-2xl transition-all hover:opacity-90"
              style={{ height: 48, background: "#16A34A", fontSize: 15 }}
            >
              Continue →
            </button>
          )}

          {step === 2 && (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 font-semibold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                style={{ height: 48, fontSize: 15 }}
              >
                ← Back
              </button>
              <button
                onClick={() => { setStep(3); setTimeout(save, 400); }}
                className="flex-1 text-white font-semibold rounded-2xl transition-all hover:opacity-90"
                style={{ height: 48, background: "#16A34A", fontSize: 15 }}
              >
                Start FuelSafe →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const FALLBACK_MAKES = [
  "Maruti Suzuki", "Hyundai", "Tata", "Honda",
  "Toyota", "Kia", "Mahindra", "Volkswagen",
  "Skoda", "MG", "Renault", "Nissan",
];
