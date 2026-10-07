'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { X, Wrench, CheckCircle, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

export function ServiceCenterPanel() {
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const serviceCenter = useDigitalTwinStore((s) => s.serviceCenter);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);

  if (!selectedObject || selectedObject.type !== 'service') {
    return null;
  }

  const sc = serviceCenter || {
    id: 's03',
    code: 'S03',
    name: 'Tarapur EV Diagnostics & Service Hub',
    locationName: 'MIDC Boisar Link, Plot 42',
    totalBays: 4,
    occupiedBays: 1,
    availableBays: 3,
    techniciansCount: 6,
    batteryDiagnostics: 'AVAILABLE',
    bays: [],
  };

  const handleFinishRepair = (vehicleCode: string) => {
    socketService.completeRepair(vehicleCode);
  };

  const handleReturnToRoad = (vehicleCode: string) => {
    socketService.returnToRoad(vehicleCode);
  };

  return (
    <div className="fixed top-20 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-[#111827]/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs">
        {/* Header */}
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {sc.code} {sc.name}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {sc.locationName}
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

        {/* Facility Capacity KPIs */}
        <div className="grid grid-cols-3 gap-2 my-2.5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">REPAIR BAYS</span>
            <span className="text-sm font-bold text-white font-mono">{sc.totalBays}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">AVAILABLE</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{sc.availableBays} Free</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">TECHNICIANS</span>
            <span className="text-sm font-bold text-blue-400 font-mono">{sc.techniciansCount} Staff</span>
          </div>
        </div>

        {/* Diagnostic Status */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Battery Diagnostics Station</span>
          </span>
          <span className="font-semibold text-emerald-400 font-mono">ONLINE / READY</span>
        </div>

        {/* 4 Active Repair Bays */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2 font-mono">
            Active Diagnostic & Repair Bays
          </span>

          <div className="space-y-2">
            {sc.bays.map((bay, idx) => {
              const isOccupied = bay.status === 'OCCUPIED';
              const isComplete = (bay.progressPct ?? 0) >= 100;

              return (
                <div
                  key={`bay-${idx}`}
                  className={`p-2 rounded-lg border text-[11px] ${
                    isOccupied
                      ? 'bg-slate-900 border-amber-800/60'
                      : 'bg-slate-900/40 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-200">
                      Bay #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isComplete
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : isOccupied
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isComplete ? 'REPAIR COMPLETE' : isOccupied ? 'UNDER REPAIR' : 'AVAILABLE'}
                    </span>
                  </div>

                  {isOccupied && (
                    <div className="space-y-1 mt-1 text-[10px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Vehicle: <strong className="text-white font-mono">{bay.vehicleCode}</strong></span>
                        <span>Est. time: <strong className="text-slate-300 font-mono">{bay.estimatedTimeMin ?? 8} min</strong></span>
                      </div>
                      <div className="text-slate-300 font-medium truncate">
                        Problem: {bay.problem}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${bay.progressPct ?? 50}%` }}
                        />
                      </div>

                      {/* Bay actions */}
                      <div className="flex gap-2 pt-1.5">
                        <button
                          onClick={() => handleFinishRepair(bay.vehicleCode || 'EV-024')}
                          className="flex-1 py-1 px-2 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>FINISH REPAIR</span>
                        </button>
                        <button
                          onClick={() => handleReturnToRoad(bay.vehicleCode || 'EV-024')}
                          className="flex-1 py-1 px-2 rounded bg-blue-800/80 hover:bg-blue-700 text-blue-100 font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>RETURN TO ROAD</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
