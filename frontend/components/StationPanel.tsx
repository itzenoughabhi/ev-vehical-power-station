'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { 
  X, 
  Zap, 
  BatteryCharging, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck,
  Activity
} from 'lucide-react';

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
  const isAllOperational = faultCount === 0 && station.status === 'ONLINE';

  return (
    <div className="fixed top-20 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 font-sans text-xs">
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
              faultCount > 0 ? 'bg-red-600 animate-pulse' : isBusy ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Station {station.code}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                  station.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {station.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {station.name} — {station.district}
              </p>
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`p-2.5 rounded-xl border my-2.5 flex items-center justify-between ${
          faultCount > 0 
            ? 'bg-red-50 border-red-300 text-red-800 animate-pulse' 
            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${
              faultCount > 0 ? 'bg-red-600' : 'bg-emerald-600'
            }`}>
              {faultCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[11px] font-bold font-mono tracking-tight">
                {faultCount > 0 
                  ? `⚠️ STATION DEGRADED: ${faultCount} BAY DOWN` 
                  : '✅ 100% OPERATIONAL & WORKING'}
              </div>
              <div className="text-[10px] opacity-80">
                {faultCount > 0 
                  ? 'Inverter thermal fault. Repair crew dispatched.' 
                  : 'All DC fast chargers and 11kV grid healthy.'}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold shadow-xs">
            {availableCount}/{station.chargers.length} READY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 font-mono block">BAY AVAILABILITY</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {availableCount} / {station.chargers.length} <span className="text-[10px] font-medium text-emerald-600">Available</span>
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 font-mono block">POWER LOAD</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {station.currentLoadKw} / {station.maxCapacityKw} <span className="text-[10px] font-normal text-slate-500">kW</span>
            </span>
          </div>
        </div>

        <div className="space-y-1.5 py-1 text-slate-500 text-[11px]">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>ESTIMATED WAIT TIME</span>
            </span>
            <span className="font-semibold text-slate-800 font-mono">{station.estimatedWaitMinutes} min</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>CHARGING QUEUE</span>
            </span>
            <span className="font-semibold text-amber-600 font-mono">{station.queue.length} vehicles waiting</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span>DAILY ENERGY DELIVERED</span>
            <span className="font-mono text-slate-800 font-semibold">{station.dailyEnergyKwh} kWh</span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span>GRID UTILIZATION</span>
            <span className={`font-mono font-semibold ${
              station.utilizationRate > 85 ? 'text-red-600' : station.utilizationRate > 65 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {station.utilizationRate}%
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
              DC Fast Pedestals & Status
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              Interactive Test Controls
            </span>
          </div>

          <div className="space-y-1.5">
            {station.chargers.map((ch) => (
              <div
                key={ch.id}
                onClick={() => selectCharger(station.id, ch.id)}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer text-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    ch.status === 'AVAILABLE' ? 'bg-emerald-500' : ch.status === 'CHARGING' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="font-mono font-bold text-slate-800">{ch.code}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({ch.powerKw} kW)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    ch.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ch.status === 'CHARGING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ch.status === 'CHARGING' ? `Charging ${ch.currentEvId || ''}` : ch.status}
                  </span>

                  {ch.status === 'FAULT' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        socketService.repairFault(ch.code);
                      }}
                      title="Repair charger and restore to AVAILABLE"
                      className="py-0.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold flex items-center gap-1 shadow transition-colors"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>REPAIR</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        socketService.triggerFault(station.code, ch.code);
                      }}
                      title="Simulate hardware fault on this bay"
                      className="py-0.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-mono text-[9px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                      <span>FAULT</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
