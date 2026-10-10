'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { X, Bell, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

export function LiveEventsDrawer() {
  const events = useDigitalTwinStore((s) => s.events);
  const isEventsOpen = useDigitalTwinStore((s) => s.isEventsOpen);
  const toggleEvents = useDigitalTwinStore((s) => s.toggleEvents);
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);

  if (!isEventsOpen) return null;

  return (
    <div className="fixed top-24 left-60 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-200">
      <div className="bg-[#111827]/98 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs max-h-96 flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Network Incident Timeline
            </span>
          </div>
          <button
            onClick={() => toggleEvents(false)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 overflow-y-auto space-y-1.5 text-xs pr-1">
          {events.length === 0 ? (
            <div className="py-6 text-center text-slate-500 font-mono text-[11px]">
              No active network alerts
            </div>
          ) : (
            events.slice(0, 20).map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  if (evt.stationId) selectStation(evt.stationId);
                  else if (evt.vehicleId) selectVehicle(evt.vehicleId);
                }}
                className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-850 cursor-pointer transition-colors border border-transparent hover:border-slate-800"
              >
                <span className="text-slate-500 font-mono text-[10px] mt-0.5 flex-shrink-0">
                  {evt.timestamp.slice(0, 5)}
                </span>
                <span
                  className={`text-[11px] leading-tight flex-1 ${
                    evt.severity === 'CRITICAL'
                      ? 'text-red-400 font-medium'
                      : evt.severity === 'WARNING'
                      ? 'text-amber-400 font-medium'
                      : evt.severity === 'SUCCESS'
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {evt.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
