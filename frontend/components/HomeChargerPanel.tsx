'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { X, Home, BatteryCharging, Zap, Clock } from 'lucide-react';

export function HomeChargerPanel() {
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const homeChargers = useDigitalTwinStore((s) => s.homeChargers);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);

  if (!selectedObject || selectedObject.type !== 'homeCharger') {
    return null;
  }

  const hc = homeChargers.find(h => h.homeId === selectedObject.id) || selectedObject.data;
  if (!hc) return null;

  return (
    <div className="fixed top-20 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-[#111827]/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs">
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {hc.homeId}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {hc.locationName}
              </p>
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-2.5 p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span>VEHICLE BATTERY</span>
            </span>
            <span className="font-bold text-white font-mono">{hc.batteryPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${hc.batteryPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 py-1 text-slate-400 text-[11px]">
          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>CHARGER ID</span>
            <span className="font-mono text-slate-200 font-semibold">{hc.chargerId}</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>CONNECTED EV</span>
            <span className="font-mono text-emerald-400 font-bold">{hc.connectedEvId} ({hc.connectedEvModel || 'Tata Nexon EV'})</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>CHARGING POWER</span>
            <span className="font-mono text-white font-semibold">{hc.chargingPowerKw} kW (AC Level 2)</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>STATUS</span>
            <span className="font-semibold text-emerald-400">● {hc.status}</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>EST. COMPLETION TIME</span>
            <span className="font-mono text-slate-200">{hc.estimatedCompletionTime}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>POWER GRID FEEDER</span>
            <span className="text-slate-300 font-medium">Betegaon & Saravali Domestic Feeder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
