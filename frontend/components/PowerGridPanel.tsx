'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { X, Zap, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export function PowerGridPanel() {
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const powerGrid = useDigitalTwinStore((s) => s.powerGrid);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);

  if (!selectedObject || selectedObject.type !== 'grid') {
    return null;
  }

  const grid = powerGrid || {
    substationId: 'GRID-S01',
    substationName: 'Boisar Distribution Substation',
    capacityMw: 5.0,
    currentLoadMw: 3.4,
    loadPercentage: 68,
    status: 'NORMAL',
    isSurgeActive: false,
    feeders: [
      { id: 'FDR-MIDC-01', name: 'Tarapur MIDC Feeder A', loadMw: 1.8, capacityMw: 2.5, status: 'NORMAL' },
      { id: 'FDR-EV-02', name: 'Public EV Fast Charging Grid', loadMw: 0.9, capacityMw: 1.5, status: 'NORMAL' },
      { id: 'FDR-RES-03', name: 'Betegaon & Saravali Domestic Feeder', loadMw: 0.7, capacityMw: 1.0, status: 'NORMAL' },
    ],
  };

  const isOverloaded = grid.status === 'OVERLOAD_RISK' || grid.loadPercentage > 85;

  const handleToggleSurge = () => {
    socketService.triggerEnergySurge(!grid.isSurgeActive);
  };

  return (
    <div className="fixed top-20 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-[#111827]/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs">
        {/* Header */}
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ${
              isOverloaded ? 'bg-red-600 animate-pulse' : 'bg-sky-600'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {grid.substationId} {grid.substationName}
              </h2>
              <p className={`text-[11px] font-bold ${isOverloaded ? 'text-red-400' : 'text-emerald-400'}`}>
                {isOverloaded ? '⚠ GRID OVERLOAD RISK' : '● NOMINAL DISTRIBUTION'}
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

        {/* Load Gauge */}
        <div className="my-2.5 p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">SUBSTATION CAPACITY LOAD</span>
            <span className={`font-mono font-bold ${isOverloaded ? 'text-red-400 text-sm' : 'text-white'}`}>
              {grid.currentLoadMw} MW / {grid.capacityMw} MW ({grid.loadPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverloaded ? 'bg-red-500' : grid.loadPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, grid.loadPercentage)}%` }}
            />
          </div>
        </div>

        {/* Overload Alert Banner */}
        {isOverloaded && (
          <div className="mb-2.5 p-2 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">GRID OVERLOAD RISK DETECTED</strong>
              <span>Substation at 91% capacity. EVNEXUS recommends shifting charging load from Station A102 to Station B104.</span>
            </div>
          </div>
        )}

        {/* Feeder Distribution Lines */}
        <div className="mt-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2 font-mono">
            High-Voltage Distribution Feeders
          </span>
          <div className="space-y-1.5">
            {grid.feeders?.map((fdr: any) => (
              <div key={fdr.id} className="p-2 rounded bg-slate-900/60 border border-slate-800/60 text-[11px]">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-slate-200">{fdr.name}</span>
                  <span className={`font-mono font-semibold ${
                    fdr.status === 'CRITICAL' ? 'text-red-400' : fdr.status === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {fdr.loadMw} / {fdr.capacityMw} MW
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-mono">{fdr.id}</span>
                  <span className="uppercase">{fdr.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Surge Control Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <button
            onClick={handleToggleSurge}
            className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
              grid.isSurgeActive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50 ring-2 ring-red-400'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{grid.isSurgeActive ? 'RESET ENERGY SURGE' : 'TRIGGER ENERGY SURGE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
