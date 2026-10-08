'use client';

import React, { useEffect, useState } from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { 
  Zap, 
  BatteryCharging, 
  Gauge, 
  Compass, 
  AlertCircle, 
  X, 
  Navigation,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function ManualDriveHUD() {
  const isManualDrive = useDigitalTwinStore((s) => s.isManualDrive);
  const manualDriveVehicleId = useDigitalTwinStore((s) => s.manualDriveVehicleId);
  const manualDriveSpeed = useDigitalTwinStore((s) => s.manualDriveSpeed);
  const manualDriveGear = useDigitalTwinStore((s) => s.manualDriveGear);
  const setManualDrive = useDigitalTwinStore((s) => s.setManualDrive);
  const returnToRoad = useDigitalTwinStore((s) => s.returnToRoad);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const stations = useDigitalTwinStore((s) => s.stations);

  const [nearestStationInfo, setNearestStationInfo] = useState<{
    stationName: string;
    stationCode: string;
    distance: number;
    canCharge: boolean;
    isCharging: boolean;
  } | null>(null);

  const vehicle = vehicles.find((v) => v.id === manualDriveVehicleId);

  useEffect(() => {
    if (!isManualDrive || !vehicle) return;

    // Check proximity to all stations
    let minDist = Infinity;
    let closestStation = null;

    for (const st of stations) {
      const d = Math.hypot(vehicle.position.x - st.position.x, vehicle.position.z - st.position.z);
      if (d < minDist) {
        minDist = d;
        closestStation = st;
      }
    }

    if (closestStation && minDist < 18) {
      setNearestStationInfo({
        stationName: closestStation.name,
        stationCode: closestStation.code,
        distance: Math.round(minDist * 10) / 10,
        canCharge: minDist < 15.5,
        isCharging: vehicle.status === 'CHARGING',
      });
    } else {
      setNearestStationInfo(null);
    }
  }, [isManualDrive, vehicle?.position.x, vehicle?.position.z, vehicle?.status, stations]);

  if (!isManualDrive || !vehicle) return null;

  const batteryPct = Math.round(vehicle.currentBatteryPct);
  const speed = manualDriveSpeed || 0;
  const isCharging = vehicle.status === 'CHARGING';
  const targetPct = vehicle.targetBatteryPct || 85;
  const capacityKwh = vehicle.batteryCapacityKwh || 50;
  const kwhNeeded = Math.max(0, (targetPct - batteryPct) / 100 * capacityKwh);
  const chPower = vehicle.chargingRateKw || 120;
  const minsRemaining = Math.max(1, Math.ceil((kwhNeeded / chPower) * 60));

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none flex flex-col justify-between p-6">
      {/* Top Center: Drive Mode Banner & Exit Button */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className={`backdrop-blur-md shadow-2xl rounded-xl px-4 py-2.5 flex items-center gap-4 transition-all ${
          isCharging
            ? 'bg-[#0f291e]/95 border border-emerald-500/70 ring-1 ring-emerald-400/30'
            : 'bg-[#111827]/95 border border-blue-500/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md ${
              isCharging ? 'bg-emerald-600 shadow-emerald-500/30 animate-pulse' : 'bg-blue-600 shadow-blue-500/20'
            }`}>
              {isCharging ? <Zap className="w-4 h-4 text-white" /> : <Navigation className="w-4 h-4 animate-spin-slow" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs tracking-wide">
                  {isCharging ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <span>⚡</span> PLUGGED IN & CHARGING
                    </span>
                  ) : (
                    'MANUAL DRIVE ACTIVE'
                  )}
                </span>
                <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-500/30">
                  {vehicle.code}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {vehicle.model}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {isCharging ? (
                  <span className="text-emerald-300 font-semibold">
                    ~{minsRemaining} min remaining to {targetPct}% · {chPower} kW DC Fast · Press [W] or [E] to Unplug
                  </span>
                ) : (
                  'Keyboard Teleoperation Stream Active · Boisar Road Grid'
                )}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Battery State */}
          <div className="flex items-center gap-2">
            <BatteryCharging className={`w-4 h-4 ${isCharging ? 'text-emerald-400 animate-pulse' : batteryPct < 25 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <div>
              <span className="text-white font-mono font-bold text-xs">
                {batteryPct}% {isCharging && <span className="text-emerald-400 text-[10px] font-normal">({minsRemaining}m left)</span>}
              </span>
              <span className="text-slate-400 font-mono text-[10px] block">
                {Math.round((batteryPct / 100) * 380)} km Range
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Return to Road Button */}
          <button
            onClick={() => {
              returnToRoad(vehicle.id);
              socketService.emit('simulation:return-to-road', { vehicleId: vehicle.id });
            }}
            className="bg-blue-900/80 hover:bg-blue-800 border border-blue-600/80 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Instantly snap vehicle back onto the Boisar highway road network (Shortcut: R)"
          >
            <span>🛣️</span>
            <span>RETURN TO ROAD (R)</span>
          </button>

          {/* Exit Drive Button */}
          <button
            onClick={() => setManualDrive(false)}
            className="bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>EXIT DRIVE (ESC)</span>
          </button>
        </div>

        {/* Ambient Station Telemetry Pill */}
        <div className="bg-[#111827]/95 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl text-xs flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold text-slate-200">GRID STATUS:</span>
            <span>11 kV NOMINAL</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono text-[11px]">
            🌤️ Boisar 32°C · Clear
          </span>
        </div>
      </div>

      {/* Center: Station Proximity & Charger Interaction Prompt */}
      {nearestStationInfo && (
        <div className="self-center pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className={`backdrop-blur-md border px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 ${
            isCharging
              ? 'bg-emerald-950/90 border-emerald-500 shadow-emerald-500/20 text-emerald-200'
              : nearestStationInfo.canCharge
              ? 'bg-blue-950/90 border-blue-400 shadow-blue-500/20 text-blue-100 animate-pulse'
              : 'bg-[#111827]/90 border-slate-800 text-slate-300'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-md ${
              isCharging ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              <Zap className="w-5 h-5 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider">
                  Station {nearestStationInfo.stationCode} ({nearestStationInfo.stationName})
                </span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/40">
                  {nearestStationInfo.distance}m
                </span>
              </div>

              {isCharging ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Charging Active ({chPower} kW DC Fast) — {batteryPct}%
                  </span>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('vehicledrive:interact'))}
                    className="px-2 py-0.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 font-mono rounded text-[10px] font-bold border border-amber-400/40 cursor-pointer pointer-events-auto"
                  >
                    UNPLUG [E]
                  </button>
                </div>
              ) : nearestStationInfo.canCharge ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold text-blue-200">
                    Ready to Charge!
                  </span>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('vehicledrive:interact'))}
                    className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono rounded-lg font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer pointer-events-auto ring-1 ring-emerald-400 text-[11px]"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white text-white" />
                    <span>PRESS [E] OR CLICK TO DOCK & CHARGE</span>
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Approach charging bay to connect vehicle
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Area: Digital Speedometer & Cockpit HUD (Left) + Keyboard Controls Guide (Right) */}
      <div className="flex items-end justify-between pointer-events-auto">
        {/* Speedometer Cluster */}
        <div className="bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center gap-5 min-w-[280px]">
          {/* Circular / Digital Speed Display */}
          <div className="text-center">
            <div className="text-4xl font-extrabold text-white font-mono tracking-tighter leading-none drop-shadow">
              {speed}
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mt-1">
              KM / H
            </span>
          </div>

          <div className="h-12 w-px bg-slate-800" />

          {/* Gear and Status */}
          <div className="flex flex-col gap-1.5">
            {/* Gear Selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1 font-mono text-xs">
              {(['P', 'R', 'N', 'D'] as const).map((gear) => (
                <span
                  key={gear}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    manualDriveGear === gear && !isCharging
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-500'
                  }`}
                >
                  {gear}
                </span>
              ))}
              {isCharging && (
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-600 text-white animate-pulse">
                  ⚡ CHG
                </span>
              )}
            </div>

            {/* Power Flow Gauge */}
            <div className="text-[10px] font-mono flex items-center justify-between text-slate-400">
              <span>POWER FLOW</span>
              <span className={`font-semibold ${
                isCharging 
                  ? 'text-emerald-400' 
                  : speed > 30 
                  ? 'text-sky-400' 
                  : 'text-slate-300'
              }`}>
                {isCharging ? '+120 kW (CHARGE)' : speed > 0 ? `-${Math.round(speed * 0.75)} kW` : '0 kW'}
              </span>
            </div>
          </div>
        </div>

        {/* Keyboard Controls Cheatsheet */}
        <div className="bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl text-xs text-slate-300">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold mb-2 flex items-center gap-1.5">
            <span>🎮 KEYBOARD CONTROLS</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-medium">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-white">W / ↑</kbd>
              <span className="text-slate-300">Accelerate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-white">S / ↓</kbd>
              <span className="text-slate-300">Brake / Reverse</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-white">A / D</kbd>
              <span className="text-slate-300">Steer Left / Right</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-white">SPACE</kbd>
              <span className="text-slate-300">Handbrake</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-blue-900 border border-blue-700 rounded font-mono text-[10px] text-blue-200">E</kbd>
              <span className="text-slate-200 font-semibold">Plug In / Unplug</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-indigo-900 border border-indigo-700 rounded font-mono text-[10px] text-indigo-200">R</kbd>
              <span className="text-slate-200 font-semibold">Reset on Road</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-red-950 border border-red-800 rounded font-mono text-[10px] text-red-200">ESC</kbd>
              <span className="text-slate-300">Exit Drive Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
