'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { X, Zap, BatteryCharging, Clock, Users, AlertTriangle } from 'lucide-react';

export function StationPanel() {
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const stations = useDigitalTwinStore((s) => s.stations);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);
  const selectCharger = useDigitalTwinStore((s) => s.selectCharger);

  if (!selectedObject || (selectedObject.type !== 'station' && selectedObject.type !== 'charger')) {
    return null;
  }

  const stationId = selectedObject.type === 'station' ? selectedObject.id : selectedObject.stationId;
  const station = stations.find((s) => s.id === stationId);
  if (!station) return null;

  const availableCount = station.chargers.filter((c) => c.status === 'AVAILABLE').length;
  const faultCount = station.chargers.filter((c) => c.status === 'FAULT').length;
  const isBusy = availableCount === 0 && faultCount === 0;

  return (
    <div className="fixed top-20 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-[#111827]/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs">
        {/* Header */}
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ${
              faultCount > 0 ? 'bg-red-600 animate-pulse' : isBusy ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Station {station.code}
                </h2>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                  station.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                }`}>
                  {station.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {station.name} — {station.district}
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

        {/* Capacity & Power Metrics */}
        <div className="grid grid-cols-2 gap-2 my-2.5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 font-mono block">BAY AVAILABILITY</span>
            <span className="text-sm font-bold text-white font-mono">
              {availableCount} / {station.chargers.length} <span className="text-[10px] font-normal text-emerald-400">Available</span>
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 font-mono block">POWER LOAD</span>
            <span className="text-sm font-bold text-white font-mono">
              {station.currentLoadKw} / {station.maxCapacityKw} <span className="text-[10px] font-normal text-slate-400">kW</span>
            </span>
          </div>
        </div>

        {/* Telemetry Breakdown */}
        <div className="space-y-1.5 py-1 text-slate-400 text-[11px]">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>ESTIMATED WAIT TIME</span>
            </span>
            <span className="font-semibold text-white font-mono">{station.estimatedWaitMinutes} min</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>CHARGING QUEUE</span>
            </span>
            <span className="font-semibold text-amber-400 font-mono">{station.queue.length} vehicles waiting</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
            <span>DAILY ENERGY DELIVERED</span>
            <span className="font-mono text-white">{station.dailyEnergyKwh} kWh</span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span>GRID UTILIZATION</span>
            <span className={`font-mono font-semibold ${
              station.utilizationRate > 85 ? 'text-red-400' : station.utilizationRate > 65 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {station.utilizationRate}%
            </span>
          </div>
        </div>

        {/* Chargers Bay List */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2 font-mono">
            DC Fast Charging Pedestals
          </span>
          <div className="space-y-1.5">
            {station.chargers.map((ch) => (
              <div
                key={ch.id}
                onClick={() => selectCharger(station.id, ch.id)}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-800/80 hover:border-blue-500/80 bg-slate-900/60 hover:bg-slate-850 cursor-pointer text-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    ch.status === 'AVAILABLE' ? 'bg-emerald-500' : ch.status === 'CHARGING' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="font-mono font-medium text-slate-200">{ch.code}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({ch.powerKw} kW)</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                  ch.status === 'AVAILABLE'
                    ? 'bg-emerald-950 text-emerald-300'
                    : ch.status === 'CHARGING'
                    ? 'bg-amber-950 text-amber-300'
                    : 'bg-red-950 text-red-300'
                }`}>
                  {ch.status === 'CHARGING' ? `Charging ${ch.currentEvId || ''}` : ch.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
