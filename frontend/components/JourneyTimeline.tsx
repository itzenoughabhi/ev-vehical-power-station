'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { Check } from 'lucide-react';

export function JourneyTimeline() {
  const selectedVehicle = useDigitalTwinStore((s) => {
    if (s.selectedObject?.type !== 'vehicle') return null;
    const v = s.vehicles.find((veh) => veh.id === s.selectedObject?.id);
    return v ? { 
      code: v.code, 
      model: v.model, 
      status: v.status, 
      batteryPct: Math.round(v.currentBatteryPct),
      rangeKm: v.estimatedRangeKm ?? Math.round((v.currentBatteryPct / 100) * 380)
    } : null;
  });

  const currentStatus = selectedVehicle?.status || 'EN_ROUTE';
  const batteryPct = selectedVehicle?.batteryPct ?? 100;
  const isStranded = batteryPct <= 0 || currentStatus === 'STRANDED';
  const isBeingTowed = currentStatus === 'BEING_TOWED';
  const isLowBattery = batteryPct <= 20;
  const isCriticalBattery = batteryPct <= 10;

  const steps = [
    { key: 'HOME', label: 'Home' },
    { key: 'EN_ROUTE', label: 'En Route' },
    { key: 'LOW_BATTERY', label: isStranded ? 'Stranded (0%)' : isLowBattery ? `Low Battery (${batteryPct}%)` : 'Low Battery' },
    { key: 'QUEUE', label: isBeingTowed ? 'Towing' : 'Queue' },
    { key: 'CHARGING', label: 'Charging' },
    { key: 'FAULT', label: 'Fault' },
    { key: 'UNDER_REPAIR', label: 'Under Repair' },
    { key: 'READY', label: 'Ready' },
  ];

  const getStepIndex = (st: string) => {
    if (st === 'FAULT' || st === 'SERVICE_REQUIRED') return 5;
    if (st === 'UNDER_REPAIR') return 6;
    if (st === 'READY') return 7;
    if (st === 'CHARGING' || st === 'CHARGER_ASSIGNED' || st === 'COMPLETED' || st === 'DEPARTING') return 4;
    if (st === 'QUEUE' || isBeingTowed) return 3;

    // Vehicle is stranded or low battery:
    if (isStranded || isLowBattery || st === 'LOW_BATTERY' || st === 'STRANDED') {
      return 2; // Step 3: Low Battery / Stranded warning active
    }
    if (st === 'HOME') return 0;
    return 1; // En Route
  };

  const currentIdx = getStepIndex(currentStatus);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none">
      <div className={`bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-3.5 transition-all ${
        isStranded || isCriticalBattery 
          ? 'border-red-400 ring-2 ring-red-200 shadow-red-500/10' 
          : isBeingTowed || isLowBattery 
          ? 'border-amber-400 ring-2 ring-amber-100 shadow-amber-500/10' 
          : 'border-slate-200/90'
      }`}>
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
          <span className={`w-2 h-2 rounded-full ${
            isStranded || isCriticalBattery ? 'bg-red-600 animate-ping' : isBeingTowed || isLowBattery ? 'bg-amber-500 animate-pulse' : 'bg-blue-600 animate-pulse'
          }`} />
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-900 font-bold uppercase tracking-tight">
              {selectedVehicle ? `${selectedVehicle.code} • ${selectedVehicle.model}` : 'Fleet Lifecycle'}
            </span>
            {isBeingTowed ? (
              <span className="text-[9px] font-mono font-bold text-amber-600 flex items-center gap-1">
                🛻 BEING TOWED TO CHARGER STATION
              </span>
            ) : isStranded ? (
              <span className="text-[9px] font-mono font-bold text-red-600 animate-pulse flex items-center gap-1">
                🛑 STRANDED (0% BATTERY) • TOW REQUIRED
              </span>
            ) : isLowBattery ? (
              <span className={`text-[9px] font-mono font-bold flex items-center gap-1 ${
                isCriticalBattery ? 'text-red-600 animate-pulse' : 'text-amber-600'
              }`}>
                ⚠️ LOW BATTERY WARNING: {batteryPct}% ({selectedVehicle?.rangeKm} km)
              </span>
            ) : null}
          </div>
        </div>

        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isWarningStep = step.key === 'LOW_BATTERY' && isLowBattery;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm ${
                    isDone
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : isCurrent && isWarningStep
                      ? isCriticalBattery
                        ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                        : 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  ) : isCurrent && isWarningStep ? (
                    '⚠️'
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-[11px] font-sans transition-colors ${
                    isCurrent && isWarningStep
                      ? isCriticalBattery
                        ? 'font-bold text-red-600'
                        : 'font-bold text-amber-600'
                      : isCurrent
                      ? 'font-bold text-blue-600'
                      : isDone
                      ? 'font-semibold text-slate-800'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`w-4 h-0.5 transition-colors ${
                    idx < currentIdx ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
