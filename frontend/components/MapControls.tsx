'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { Plus, Minus, RotateCcw, Map, Zap, Globe } from 'lucide-react';

export function MapControls() {
  const mapMode = useDigitalTwinStore((s) => s.mapMode);
  const setMapMode = useDigitalTwinStore((s) => s.setMapMode);
  const toggle2dMap = useDigitalTwinStore((s) => s.toggle2dMap);
  const is2dMapOpen = useDigitalTwinStore((s) => s.is2dMapOpen);
  const recenterCamera = useDigitalTwinStore((s) => s.recenterCamera);
  const zoomIn = useDigitalTwinStore((s) => s.zoomIn);
  const zoomOut = useDigitalTwinStore((s) => s.zoomOut);
  const toggleGridOverlay = useDigitalTwinStore((s) => s.toggleGridOverlay);
  const isGridOverlayActive = useDigitalTwinStore((s) => s.isGridOverlayActive);

  return (
    <div className="fixed bottom-6 right-8 z-20 flex items-center gap-2 select-none pointer-events-auto font-sans">
      {/* Real OSM Map Toggle */}
      {mapMode !== 'REAL_MAP' && (
        <button
          onClick={() => setMapMode('REAL_MAP')}
          className="px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all flex items-center gap-1.5 bg-[#111827]/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
          title="Switch to Real OpenStreetMap Geographic Foundation"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>REAL OSM MAP</span>
        </button>
      )}

      {/* Power Grid Lines Toggle */}
      <button
        onClick={() => toggleGridOverlay()}
        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all flex items-center gap-1.5 ${
          isGridOverlayActive
            ? 'bg-sky-600 text-white border-sky-400 shadow-sky-900/40'
            : 'bg-[#111827]/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
        }`}
      >
        <Zap className="w-3.5 h-3.5 text-sky-400" />
        <span>ENERGY FLOW</span>
      </button>

      {/* 2D Map Toggle */}
      <button
        onClick={() => toggle2dMap()}
        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all flex items-center gap-1.5 ${
          is2dMapOpen
            ? 'bg-blue-600 text-white border-blue-400 shadow-blue-900/40'
            : 'bg-[#111827]/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
        }`}
      >
        <Map className="w-3.5 h-3.5" />
        <span>TOPOLOGY</span>
      </button>

      {/* Camera Controls */}
      <div className="bg-[#111827]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md flex items-center gap-1">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={recenterCamera}
          title="Reset Camera (Boisar Elevated View)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
