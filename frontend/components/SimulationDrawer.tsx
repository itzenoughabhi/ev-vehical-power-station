'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { X, Play, Pause, AlertTriangle, Zap, Wrench, BatteryCharging, RotateCcw } from 'lucide-react';

export function SimulationDrawer() {
  const isSimDrawerOpen = useDigitalTwinStore((s) => s.isSimDrawerOpen);
  const toggleSimDrawer = useDigitalTwinStore((s) => s.toggleSimDrawer);
  const simulationSpeed = useDigitalTwinStore((s) => s.simulationSpeed);

  if (!isSimDrawerOpen) return null;

  return (
    <div className="fixed top-24 right-8 z-40 w-80 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-[#111827]/98 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Simulation Control Panel
          </span>
          <button
            onClick={() => toggleSimDrawer(false)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Clock Speed:</span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            {[0, 1.0, 2.0, 4.0].map((spd) => (
              <button
                key={spd}
                onClick={() => socketService.setSpeed(spd)}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                {spd === 0 ? 'Pause' : `${spd}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls List */}
        <div className="pt-2.5 space-y-1.5 text-xs">
          <button
            onClick={() => socketService.spawnVehicle()}
            className="w-full text-left py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Spawn EV</span>
            <span className="text-[10px] text-slate-400 font-mono">Inject Fleet</span>
          </button>

          <button
            onClick={() => socketService.triggerFault('A102')}
            className="w-full text-left py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-900/40 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Trigger Charger Fault</span>
            <span className="text-[10px] text-red-400 font-mono">A102-01 Trip</span>
          </button>

          <button
            onClick={() => socketService.triggerEVFault('EV-024')}
            className="w-full text-left py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-900/40 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Trigger EV Fault</span>
            <span className="text-[10px] text-red-400 font-mono">Motor 92°C</span>
          </button>

          <button
            onClick={() => socketService.triggerLowBattery('EV-024', 18)}
            className="w-full text-left py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-900/40 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Trigger Low Battery</span>
            <span className="text-[10px] text-amber-400 font-mono">EV-024 @ 18%</span>
          </button>

          <button
            onClick={() => socketService.triggerEnergySurge(true)}
            className="w-full text-left py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-900/40 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Trigger Energy Surge</span>
            <span className="text-[10px] text-amber-400 font-mono">91% Grid Load</span>
          </button>

          <button
            onClick={() => socketService.createQueue('A102')}
            className="w-full text-left py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Create Charging Queue</span>
            <span className="text-[10px] text-slate-400 font-mono">Station A102</span>
          </button>

          <button
            onClick={() => socketService.sendToService('veh-ev-024')}
            className="w-full text-left py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Send EV To Service</span>
            <span className="text-[10px] text-slate-400 font-mono">S03 Hub</span>
          </button>

          <button
            onClick={() => socketService.completeRepair('EV-024')}
            className="w-full text-left py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Finish Repair</span>
            <span className="text-[10px] text-slate-400 font-mono">Set Healthy</span>
          </button>

          <button
            onClick={() => socketService.completeCharging()}
            className="w-full text-left py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center justify-between"
          >
            <span>+ Finish Charging</span>
            <span className="text-[10px] text-slate-400 font-mono">Top-off Bay</span>
          </button>

          <button
            onClick={() => socketService.resetSimulation()}
            className="w-full text-left py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium transition-colors flex items-center justify-between border border-slate-800"
          >
            <span>Reset Digital Twin</span>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
