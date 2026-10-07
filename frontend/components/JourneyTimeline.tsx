'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { Check } from 'lucide-react';

export function JourneyTimeline() {
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);

  const selectedVehicle =
    selectedObject?.type === 'vehicle'
      ? vehicles.find((v) => v.id === selectedObject.id)
      : null;

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
      <div className="bg-[#111827]/95 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase pr-2 border-r border-slate-800">
          {selectedVehicle ? selectedVehicle.code : 'Fleet Lifecycle'}
        </span>

        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    isDone
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-mono transition-colors ${
                    isCurrent
                      ? 'font-bold text-white'
                      : isDone
                      ? 'font-semibold text-slate-300'
                      : 'text-slate-500 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`w-4 h-0.5 transition-colors ${
                    idx < currentIdx ? 'bg-blue-600' : 'bg-slate-800'
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
