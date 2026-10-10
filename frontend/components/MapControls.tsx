'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { Plus, Minus, RotateCcw, Map, Zap, Globe, Hand } from 'lucide-react';

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
  const isPanMode = useDigitalTwinStore((s) => s.isPanMode);
  const togglePanMode = useDigitalTwinStore((s) => s.togglePanMode);

  return (
    <div className="fixed bottom-6 right-8 z-20 flex items-center gap-2 select-none pointer-events-auto font-sans">
      <button
        onClick={() => setMapMode(mapMode === 'REAL_MAP' ? '3D_TWIN' : 'REAL_MAP')}
        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all flex items-center gap-1.5 ${
          mapMode === 'REAL_MAP'
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20 ring-1 ring-emerald-400'
            : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border-slate-200/90 hover:bg-slate-50'
        }`}
        title={mapMode === 'REAL_MAP' ? 'Switch to 3D Digital Twin View' : 'Turn on Real OpenStreetMap GIS Foundation'}
      >
        <Globe className={`w-3.5 h-3.5 ${mapMode === 'REAL_MAP' ? 'text-white' : 'text-emerald-600'}`} />
        <span>{mapMode === 'REAL_MAP' ? '3D DIGITAL TWIN' : 'REAL OSM MAP'}</span>
      </button>

      <button
        onClick={() => toggleGridOverlay()}
        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all flex items-center gap-1.5 ${
          isGridOverlayActive
            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
            : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border-slate-200/90 hover:bg-slate-50'
        }`}
      >
        <Zap className="w-3.5 h-3.5 text-blue-600" />
        <span>ENERGY FLOW</span>
      </button>

      <button
        onClick={() => toggle2dMap()}
        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all flex items-center gap-1.5 ${
          is2dMapOpen
            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
            : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border-slate-200/90 hover:bg-slate-50'
        }`}
      >
        <Map className="w-3.5 h-3.5" />
        <span>TOPOLOGY</span>
      </button>

      <button
        onClick={() => togglePanMode()}
        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all flex items-center gap-1.5 ${
          isPanMode
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20 ring-1 ring-emerald-400'
            : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border-slate-200/90 hover:bg-slate-50'
        }`}
        title={isPanMode ? 'Pan Mode Active: Click & drag or swipe to move around map' : 'Click to enable 1-click Swipe/Pan Map mode'}
      >
        <Hand className={`w-3.5 h-3.5 ${isPanMode ? 'text-white' : 'text-emerald-600'}`} />
        <span>{isPanMode ? 'PANNING' : 'SWIPE MAP'}</span>
      </button>

      <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={recenterCamera}
          title="Reset Camera (Boisar Elevated View)"
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
