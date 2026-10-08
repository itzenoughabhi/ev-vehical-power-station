'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { Check } from 'lucide-react';

export function JourneyTimeline() {
  const selectedVehicle = useDigitalTwinStore((s) => {
    if (s.selectedObject?.type !== 'vehicle') return null;
    const v = s.vehicles.find((veh) => veh.id === s.selectedObject?.id);
    return v ? { code: v.code, model: v.model, status: v.status } : null;
  });

  const currentStatus = selectedVehicle?.status || 'EN_ROUTE';

  const steps = [
    { key: 'HOME', label: 'Home' },
    { key: 'EN_ROUTE', label: 'En Route' },
    { key: 'LOW_BATTERY', label: 'Low Battery' },
    { key: 'QUEUE', label: 'Queue' },
    { key: 'CHARGING', label: 'Charging' },
    { key: 'FAULT', label: 'Fault' },
    { key: 'UNDER_REPAIR', label: 'Under Repair' },
    { key: 'READY', label: 'Ready' },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'HOME': return 0;
      case 'EN_ROUTE': return 1;
      case 'ARRIVING': return 1;
      case 'LOW_BATTERY': return 2;
      case 'QUEUE': return 3;
      case 'CHARGER_ASSIGNED':
      case 'CHARGING': return 4;
      case 'COMPLETED':
      case 'DEPARTING': return 4;
      case 'FAULT':
      case 'SERVICE_REQUIRED': return 5;
      case 'UNDER_REPAIR': return 6;
      case 'READY': return 7;
      default: return 1;
    }
  };

  const currentIdx = getStepIndex(currentStatus);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none">
      <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-3.5">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[11px] font-mono text-slate-900 font-bold uppercase tracking-tight">
            {selectedVehicle ? `${selectedVehicle.code} • ${selectedVehicle.model}` : 'Fleet Lifecycle'}
          </span>
        </div>

        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm ${
                    isDone
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-sans transition-colors ${
                    isCurrent
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
