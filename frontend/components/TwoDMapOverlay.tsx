'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { X } from 'lucide-react';

export function TwoDMapOverlay() {
  const stations = useDigitalTwinStore((s) => s.stations);
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const selectGrid = useDigitalTwinStore((s) => s.selectGrid);
  const selectServiceCenter = useDigitalTwinStore((s) => s.selectServiceCenter);
  const is2dMapOpen = useDigitalTwinStore((s) => s.is2dMapOpen);
  const toggle2dMap = useDigitalTwinStore((s) => s.toggle2dMap);
  const powerGrid = useDigitalTwinStore((s) => s.powerGrid);
  const serviceCenter = useDigitalTwinStore((s) => s.serviceCenter);

  if (!is2dMapOpen) return null;

  return (
    <div className="fixed bottom-16 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#111827]/98 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Boisar 2D Network Topology
          </span>
          <button
            onClick={() => toggle2dMap(false)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nodes Grid */}
        <div className="py-3 grid grid-cols-2 gap-2 text-xs">
          {stations.map((st) => {
            const avail = st.chargers.filter((c) => c.status === 'AVAILABLE').length;
            const hasFault = st.chargers.some((c) => c.status === 'FAULT');

            return (
              <div
                key={st.id}
                onClick={() => {
                  selectStation(st.id);
                  toggle2dMap(false);
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-slate-200">{st.code}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasFault ? 'bg-red-500 animate-pulse' : avail > 0 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {avail}/{st.chargers.length} Free · {st.currentLoadKw} kW
                </div>
                <div className="text-[9px] text-slate-500 truncate mt-0.5">
                  {st.name}
                </div>
              </div>
            );
          })}

          {/* Substation Node */}
          <div
            onClick={() => {
              selectGrid();
              toggle2dMap(false);
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-sky-400">GRID-S01</span>
              <span className={`w-2 h-2 rounded-full ${
                (powerGrid?.loadPercentage ?? 0) > 85 ? 'bg-red-500 animate-pulse' : 'bg-sky-500'
              }`} />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {powerGrid?.currentLoadMw ?? 3.4} MW ({powerGrid?.loadPercentage ?? 68}%)
            </div>
            <div className="text-[9px] text-slate-500 truncate mt-0.5">
              Boisar Substation
            </div>
          </div>

          {/* Service Center Node */}
          <div
            onClick={() => {
              selectServiceCenter();
              toggle2dMap(false);
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-amber-400">S03 HUB</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {serviceCenter?.availableBays ?? 2}/{serviceCenter?.totalBays ?? 4} Bays Free
            </div>
            <div className="text-[9px] text-slate-500 truncate mt-0.5">
              EV Service & Diagnostics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
