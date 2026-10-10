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
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 font-sans text-xs">
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {sc.code} {sc.name}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {sc.locationName}
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

        <div className="grid grid-cols-3 gap-2 my-2.5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">REPAIR BAYS</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{sc.totalBays}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">AVAILABLE</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">{sc.availableBays} Free</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">TECHNICIANS</span>
            <span className="text-sm font-bold text-blue-600 font-mono">{sc.techniciansCount} Staff</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Battery Diagnostics Station</span>
          </span>
          <span className="font-semibold text-emerald-600 font-mono">ONLINE / READY</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2 font-mono">
            Active Diagnostic & Repair Bays
          </span>

          <div className="space-y-2">
            {sc.bays.map((bay, idx) => {
              const isOccupied = bay.status === 'OCCUPIED';
              const isComplete = (bay.progressPct ?? 0) >= 100;

              return (
                <div
                  key={`bay-${idx}`}
                  className={`p-2 rounded-xl border text-[11px] ${
                    isOccupied
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900">
                      Bay #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isComplete
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isOccupied
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isComplete ? 'REPAIR COMPLETE' : isOccupied ? 'UNDER REPAIR' : 'AVAILABLE'}
                    </span>
                  </div>

                  {isOccupied && (
                    <div className="space-y-1 mt-1 text-[10px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Vehicle: <strong className="text-slate-900 font-mono">{bay.vehicleCode}</strong></span>
                        <span>Est. time: <strong className="text-slate-700 font-mono">{bay.estimatedTimeMin ?? 8} min</strong></span>
                      </div>
                      <div className="text-slate-700 font-medium truncate">
                        Problem: {bay.problem}
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${bay.progressPct ?? 50}%` }}
                        />
                      </div>

                      <div className="flex gap-2 pt-1.5">
                        <button
                          onClick={() => handleFinishRepair(bay.vehicleCode || 'EV-024')}
                          className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors shadow-xs"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>FINISH REPAIR</span>
                        </button>
                        <button
                          onClick={() => handleReturnToRoad(bay.vehicleCode || 'EV-024')}
                          className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px] flex items-center justify-center gap-1 transition-colors shadow-xs"
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
