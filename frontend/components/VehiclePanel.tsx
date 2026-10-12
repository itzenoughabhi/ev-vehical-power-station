'use client';

import React, { useState } from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { MargdarshakModal } from './MargdarshakModal';
import { 
  X, 
  Navigation, 
  Truck, 
  BatteryCharging, 
  Thermometer, 
  Activity, 
  Wrench, 
  CornerUpRight, 
  Play, 
  Pause, 
  Home, 
  AlertTriangle,
  Minus,
  Plus,
  Sliders
} from 'lucide-react';

export function VehiclePanel() {
  const selectedVehicleId = useDigitalTwinStore((s) => (s.selectedObject?.type === 'vehicle' ? s.selectedObject.id : null));
  const vehicle = useDigitalTwinStore((s) => 
    selectedVehicleId && Array.isArray(s.vehicles) 
      ? s.vehicles.find((v) => v.id === selectedVehicleId || v.code.toLowerCase() === selectedVehicleId.toLowerCase()) || null 
      : null
  );
  const stations = useDigitalTwinStore((s) => s.stations);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);
  const trackingVehicleId = useDigitalTwinStore((s) => s.trackingVehicleId);
  const toggleTrackVehicle = useDigitalTwinStore((s) => s.toggleTrackVehicle);
  const updateVehicle = useDigitalTwinStore((s) => s.updateVehicle);
  const setVehicleBatteryStore = useDigitalTwinStore((s) => s.setVehicleBattery);
  const [isMargdarshakOpen, setIsMargdarshakOpen] = useState(false);

  const handleBatteryChange = (newPct: number) => {
    if (!vehicle) return;
    const clamped = Math.max(0, Math.min(100, Math.round(newPct)));
    setVehicleBatteryStore(vehicle.id, clamped);
    socketService.setVehicleBattery(vehicle.id, clamped);
  };

  if (!vehicle) {
    return null;
  }

  const destinationStation = stations.find((s) => s.id === vehicle.destinationStationId);
  const isTracking = trackingVehicleId === vehicle.id;

  const batteryPct = Math.round(vehicle.currentBatteryPct);
  const isZeroBattery = batteryPct <= 0;
  const isStranded = isZeroBattery || vehicle.status === 'STRANDED';
  const isBeingTowed = vehicle.status === 'BEING_TOWED' || vehicle.trafficState === 'BEING_TOWED';
  const isLowBattery = batteryPct <= 20;
  const isCriticalBattery = batteryPct <= 10;
  const isOverheating = (vehicle.motorTemperatureC ?? 67) > 85;
  const isBatteryHot = (vehicle.batteryTemperatureC ?? 31) > 40;

  const isCharging = vehicle.status === 'CHARGING';
  const targetPct = vehicle.targetBatteryPct || 85;
  const capacityKwh = vehicle.batteryCapacityKwh || (vehicle.model === 'Commercial EV Van' ? 80 : 50);
  const remainingPctToTarget = Math.max(0, targetPct - batteryPct);
  const remainingPctToFull = Math.max(0, 100 - batteryPct);
  const activePowerKw = isCharging ? (vehicle.chargingRateKw || 120) : 150;
  const kwhToTarget = (remainingPctToTarget / 100) * capacityKwh;
  const kwhToFull = (remainingPctToFull / 100) * capacityKwh;
  const minutesToTarget = activePowerKw > 0 ? Math.max(1, Math.ceil((kwhToTarget / activePowerKw) * 60)) : 0;
  const minutesToFull = activePowerKw > 0 ? Math.max(1, Math.ceil((kwhToFull / activePowerKw) * 60)) : 0;

  const formatStatus = (st: string) => {
    if (isBeingTowed || st === 'BEING_TOWED') return '🛻 BEING TOWED TO STATION';
    if (isStranded || st === 'STRANDED') return '🛑 STRANDED (0% BATTERY)';
    if (isCriticalBattery && (st === 'EN_ROUTE' || st === 'LOW_BATTERY')) return `🚨 CRITICAL BATTERY (${batteryPct}%)`;
    if (isLowBattery && (st === 'EN_ROUTE' || st === 'LOW_BATTERY')) return '⚠️ LOW BATTERY • EN ROUTE';
    switch (st) {
      case 'EN_ROUTE': return '● EN ROUTE';
      case 'PAUSED': return '⏸ PAUSED';
      case 'ARRIVING': return '● ARRIVING';
      case 'QUEUE': return '● QUEUE';
      case 'CHARGER_ASSIGNED': return '● CHARGER ASSIGNED';
      case 'CHARGING': return '● CHARGING';
      case 'COMPLETED': return '● COMPLETED';
      case 'DEPARTING': return '● DEPARTING';
      case 'LOW_BATTERY': return '⚠️ LOW BATTERY';
      case 'FAULT':
      case 'SERVICE_REQUIRED': return '🚨 SERVICE REQUIRED';
      case 'UNDER_REPAIR': return '🔧 UNDER REPAIR';
      case 'READY': return '✅ READY';
      default: return st;
    }
  };

  const handleTowVehicle = () => {
    socketService.towVehicle(vehicle.id);
    updateVehicle(vehicle.id, {
      status: 'BEING_TOWED',
      trafficState: 'BEING_TOWED',
      speed: 0,
      currentLocationName: 'Rescue tow car dispatched to hook up & tow vehicle',
    });
  };

  const handleStart = () => {
    if (isStranded) return;
    socketService.emit('vehicle:update', { id: vehicle.id, speed: 42, status: 'EN_ROUTE' });
    updateVehicle(vehicle.id, {
      speed: 42,
      status: 'EN_ROUTE',
      trafficState: 'CRUISING',
    });
  };

  const handlePause = () => {
    socketService.emit('vehicle:update', { id: vehicle.id, speed: 0, status: 'PAUSED' });
    updateVehicle(vehicle.id, {
      speed: 0,
      status: 'PAUSED',
      trafficState: 'STOPPED',
    });
  };

  const handleReroute = () => {
    const currentDest = vehicle.destinationStationId || vehicle.currentStationId;
    const candidates = stations.filter(s => s.id !== currentDest);
    const target = candidates.sort((a, b) => {
      const da = Math.hypot(vehicle.position.x - a.position.x, vehicle.position.z - a.position.z);
      const db = Math.hypot(vehicle.position.x - b.position.x, vehicle.position.z - b.position.z);
      return da - db;
    })[0] || stations[0];

    if (target) {
      socketService.rerouteVehicle(vehicle.id, target.id);
      updateVehicle(vehicle.id, {
        destinationStationId: target.id,
        currentStationId: null,
        assignedChargerId: null,
        serviceCenterId: null,
        status: 'EN_ROUTE',
        trafficState: 'CRUISING',
        speed: 42,
        currentLocationName: `Rerouting to ${target.name} [${target.code}]`,
      });
    }
  };

  const handleSendToCharger = () => {
    const isManualDrive = useDigitalTwinStore.getState().isManualDrive;
    if (isManualDrive) {
      window.dispatchEvent(new CustomEvent('vehicledrive:interact'));
      return;
    }
    setIsMargdarshakOpen(true);
  };

  const handleSendToService = () => {
    socketService.sendToService(vehicle.id);
    const sc = useDigitalTwinStore.getState().serviceCenter;
    updateVehicle(vehicle.id, {
      serviceCenterId: sc?.id || 'sc-tarapur-01',
      destinationStationId: null,
      assignedChargerId: null,
      currentStationId: null,
      status: 'EN_ROUTE',
      trafficState: 'SERVICE_ROUTE',
      speed: 38,
      currentLocationName: `Dispatching to Diagnostic Hub [S03]`,
    });
  };

  const handleReturnHome = () => {
    socketService.emit('simulation:return-to-road', { vehicleCode: vehicle.code, vehicleId: vehicle.id });
    updateVehicle(vehicle.id, {
      status: 'EN_ROUTE',
      trafficState: 'CRUISING',
      speed: 42,
      serviceCenterId: null,
      assignedChargerId: null,
      currentStationId: null,
      currentLocationName: `Returning to Regional Road Network`,
    });
  };

  return (
    <div className="fixed top-20 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 font-sans text-xs">
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
              isOverheating ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {vehicle.code}
                </h2>
                <span className="text-[10px] text-slate-500 font-medium">
                  {vehicle.model}
                </span>
              </div>
              <p className={`text-[11px] font-bold ${
                isOverheating 
                  ? 'text-red-600' 
                  : isCriticalBattery 
                  ? 'text-red-600 animate-pulse' 
                  : isLowBattery 
                  ? 'text-amber-600 font-bold' 
                  : vehicle.status === 'PAUSED' 
                  ? 'text-amber-600' 
                  : vehicle.status === 'CHARGING' 
                  ? 'text-emerald-600' 
                  : 'text-blue-600'
              }`}>
                {formatStatus(vehicle.status)}
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

        {/* Stranded or Being Towed Emergency Banner */}
        {(isStranded || isBeingTowed) ? (
          <div className={`my-2 p-3 rounded-xl border flex flex-col gap-2 shadow-sm transition-all ${
            isBeingTowed 
              ? 'bg-amber-500/10 border-amber-400 text-amber-900 ring-2 ring-amber-300' 
              : 'bg-red-50 border-red-400 text-red-900 ring-2 ring-red-400/80'
          }`}>
            <div className="flex items-start gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isBeingTowed ? 'bg-amber-500 text-white animate-pulse' : 'bg-red-600 text-white'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[11px] uppercase tracking-wide flex items-center justify-between">
                  <span>{isBeingTowed ? '🛻 TOW TRUCK DISPATCHED' : '🚨 0% BATTERY — STRANDED'}</span>
                  <span className="font-mono bg-red-600 text-white px-1.5 py-0.2 rounded text-[10px] font-bold">
                    0% SOC
                  </span>
                </div>
                <div className="text-[10px] mt-0.5 leading-tight text-slate-700">
                  {isBeingTowed 
                    ? 'A fleet rescue vehicle is en route to tow this vehicle to the nearest charging station.' 
                    : 'Battery completely drained (0%). Vehicle is stopped roadside. Request a tow to the nearest station.'}
                </div>
              </div>
            </div>

            {!isBeingTowed && (
              <button
                onClick={handleTowVehicle}
                className="w-full mt-1 py-2 px-3 bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer animate-pulse"
              >
                <Truck className="w-4 h-4" />
                <span>TOW CAR TO NEAREST STATION</span>
              </button>
            )}
          </div>
        ) : isLowBattery && (
          <div className={`my-2 p-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm transition-all ${
            isCriticalBattery 
              ? 'bg-red-50 border-red-300 text-red-800 ring-1 ring-red-300' 
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${isCriticalBattery ? 'text-red-600 animate-bounce' : 'text-amber-600'}`} />
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                <span>{isCriticalBattery ? '🚨 CRITICAL LOW BATTERY' : '⚠️ LOW BATTERY WARNING'}</span>
                <span className="font-mono bg-white/80 px-1 py-0.2 rounded border text-[10px]">
                  {batteryPct}%
                </span>
              </div>
              <div className="text-[10px] mt-0.5 leading-tight">
                {isCriticalBattery 
                  ? `Only ${vehicle.estimatedRangeKm ?? 13} km reserve remaining! Immediate charging required.` 
                  : `Low SOC reserve (${vehicle.estimatedRangeKm ?? 35} km). Diverting to charging station advised.`}
              </div>
            </div>
          </div>
        )}

        {/* VEHICLE BATTERY MANAGEMENT CONTROLS */}
        <div className="my-2 p-3 bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200 rounded-xl shadow-inner">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 font-bold text-slate-800 tracking-tight">
              <BatteryCharging className={`w-4 h-4 ${
                isCriticalBattery || isStranded 
                  ? 'text-red-600 animate-pulse' 
                  : isLowBattery 
                  ? 'text-amber-600' 
                  : 'text-emerald-600'
              }`} />
              <span>BATTERY MANAGEMENT</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] shadow-sm transition-all ${
                isStranded 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : isCriticalBattery 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : isLowBattery 
                  ? 'bg-amber-500 text-white' 
                  : batteryPct >= 80 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {batteryPct}% SOC
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-medium">
              <span>0% (STRANDED)</span>
              <span className="text-slate-700 font-bold">{((batteryPct / 100) * capacityKwh).toFixed(1)} / {capacityKwh} kWh</span>
              <span>100% (FULL)</span>
            </div>

            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={batteryPct}
                onChange={(e) => handleBatteryChange(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                style={{
                  background: `linear-gradient(to right, ${
                    batteryPct <= 10 ? '#dc2626' : batteryPct <= 20 ? '#f59e0b' : '#10b981'
                  } 0%, ${
                    batteryPct <= 10 ? '#ef4444' : batteryPct <= 20 ? '#fbbf24' : '#34d399'
                  } ${batteryPct}%, #e2e8f0 ${batteryPct}%, #e2e8f0 100%)`
                }}
              />
            </div>
          </div>

          {/* Quick Presets & Steppers */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <button
                type="button"
                onClick={() => handleBatteryChange(batteryPct - 5)}
                disabled={batteryPct <= 0}
                className="px-2 py-1 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-lg font-mono text-[10px] font-bold shadow-xs flex items-center gap-0.5 cursor-pointer"
                title="Decrease 5%"
              >
                <Minus className="w-3 h-3" /> 5%
              </button>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1 flex-1 justify-center">
                <button
                  type="button"
                  onClick={() => handleBatteryChange(0)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                    batteryPct === 0 
                      ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-300' 
                      : 'bg-white hover:bg-red-50 text-red-700 border-red-200'
                  }`}
                  title="Simulate 0% Battery (Stranded Vehicle with Tow Option)"
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => handleBatteryChange(15)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                    batteryPct === 15 
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300' 
                      : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                  title="Simulate 15% Battery (Low Battery Warning & Auto-Diversion)"
                >
                  15%
                </button>
                <button
                  type="button"
                  onClick={() => handleBatteryChange(50)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                    batteryPct === 50 
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-300' 
                      : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                  title="Set 50% Battery (Normal Cruising)"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleBatteryChange(80)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                    batteryPct === 80 
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300' 
                      : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                  title="Set 80% Battery (Optimal SOC)"
                >
                  80%
                </button>
                <button
                  type="button"
                  onClick={() => handleBatteryChange(100)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                    batteryPct === 100 
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-300' 
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                  title="Set 100% Full Capacity"
                >
                  100%
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleBatteryChange(batteryPct + 5)}
                disabled={batteryPct >= 100}
                className="px-2 py-1 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-lg font-mono text-[10px] font-bold shadow-xs flex items-center gap-0.5 cursor-pointer"
                title="Increase 5%"
              >
                +5% <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
              <span>RANGE: <strong className={isCriticalBattery || isStranded ? 'text-red-600 font-bold' : isLowBattery ? 'text-amber-700 font-bold' : 'text-slate-800'}>{vehicle.estimatedRangeKm ?? Math.round((batteryPct / 100) * 380)} km</strong></span>
              <span>STATE: <strong className={
                vehicle.vehicleHealth === 'CRITICAL' || isStranded || isCriticalBattery 
                  ? 'text-red-600 font-bold' 
                  : isLowBattery 
                  ? 'text-amber-600 font-bold' 
                  : 'text-emerald-600 font-bold'
              }>
                {isStranded 
                  ? 'STRANDED (0%)' 
                  : isCriticalBattery 
                  ? 'CRITICAL SOC' 
                  : isLowBattery 
                  ? 'LOW SOC WARNING' 
                  : 'HEALTHY'}
              </strong></span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 py-1 text-slate-600 text-[11px]">
          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span>SPEED</span>
            <span className="font-mono text-slate-900 font-semibold">{Math.round(vehicle.speed)} km/h</span>
          </div>

          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span>DESTINATION</span>
            <span className="font-medium text-blue-600">
              {destinationStation ? `${destinationStation.code} ${destinationStation.name}` : vehicle.serviceCenterId ? 'S03 EV Service Center' : 'Patrolling'}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span>CURRENT LOCATION</span>
            <span className="text-slate-800 font-medium truncate max-w-[170px]" title={vehicle.currentLocationName}>
              {vehicle.currentLocationName || 'Boisar–Palghar Road'}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span>CHARGING POWER</span>
            <span className="font-mono text-slate-900 font-semibold flex items-center gap-1">
              {isCharging ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="animate-pulse">⚡</span>
                  <span>{vehicle.chargingRateKw || 120} kW DC FAST</span>
                </span>
              ) : (
                'NOT CHARGING'
              )}
            </span>
          </div>

          {isCharging ? (
            <div className="p-2.5 my-1.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/40 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-emerald-700">
                  <span className="animate-pulse">⚡</span>
                  <span>PLUGGED IN & CHARGING</span>
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
                  {vehicle.chargingRateKw || 120} kW
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="bg-white/90 p-1.5 rounded-lg border border-emerald-200/80">
                  <span className="text-[9px] text-slate-500 block font-semibold uppercase">ESTIMATED TIME TO 80%</span>
                  <span className="text-xs font-bold font-mono text-emerald-700 block">
                    {batteryPct >= targetPct ? 'Target Reached' : `~${minutesToTarget} min remaining`}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">Target: {targetPct}% SOC</span>
                </div>

                <div className="bg-white/90 p-1.5 rounded-lg border border-emerald-200/80">
                  <span className="text-[9px] text-slate-500 block font-semibold uppercase">TIME TO FULL (100%)</span>
                  <span className="text-xs font-bold font-mono text-teal-700 block">
                    {batteryPct >= 100 ? 'Fully Charged' : `~${minutesToFull} min remaining`}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">+{kwhToFull.toFixed(1)} kWh needed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-between py-0.5 border-b border-slate-100 items-center">
              <span>ESTIMATED TIME TO CHARGE</span>
              <span className="font-mono text-blue-600 font-semibold text-[11px]">
                {batteryPct >= 80 ? `~${minutesToFull}m (to 100%)` : `~${minutesToTarget}m (to 80% @ 150kW)`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className={`p-1.5 rounded-lg bg-slate-50 border ${
              isOverheating ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Thermometer className="w-3 h-3 text-red-500" />
                <span>MOTOR TEMP</span>
              </div>
              <span className={`text-xs font-mono font-bold ${isOverheating ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                {vehicle.motorTemperatureC ?? 67}°C
              </span>
            </div>

            <div className={`p-1.5 rounded-lg bg-slate-50 border ${
              isBatteryHot ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Activity className="w-3 h-3 text-blue-600" />
                <span>BATTERY TEMP</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                {vehicle.batteryTemperatureC ?? 31}°C
              </span>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-mono">
            <span>BRAKE: <strong className="text-emerald-600 font-bold">{vehicle.brakeSystemHealth ?? 'NORMAL'}</strong></span>
            <span>TYRES: <strong className="text-emerald-600 font-bold">{vehicle.tyreHealth ?? 'NORMAL'}</strong></span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1.5 font-mono">
            Autonomous Fleet Controls
          </span>

          {isStranded && !isBeingTowed && (
            <button
              onClick={handleTowVehicle}
              className="w-full mb-2 py-2 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 animate-pulse cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>TOW CAR TO NEAREST STATION</span>
            </button>
          )}

          {isBeingTowed && (
            <div className="w-full mb-2 py-1.5 px-3 bg-amber-500/15 border border-amber-400 text-amber-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>BEING TOWED TO NEAREST STATION</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleStart}
              title="Resume vehicle motion and cruise"
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                vehicle.status === 'EN_ROUTE' && vehicle.speed > 0
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Play className={`w-3 h-3 ${vehicle.status === 'EN_ROUTE' && vehicle.speed > 0 ? 'text-white fill-white' : 'text-emerald-600'}`} />
              <span>START</span>
            </button>

            <button
              onClick={handlePause}
              title="Halt vehicle in place immediately"
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                vehicle.status === 'PAUSED' || vehicle.speed === 0
                  ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-300 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Pause className={`w-3 h-3 ${vehicle.status === 'PAUSED' || vehicle.speed === 0 ? 'text-white fill-white' : 'text-amber-600'}`} />
              <span>PAUSE</span>
            </button>

            <button
              onClick={handleReroute}
              title="Recalculate route to alternative station"
              className="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all border border-blue-200 active:scale-95"
            >
              <CornerUpRight className="w-3 h-3 text-blue-600" />
              <span>REROUTE</span>
            </button>

            <button
              onClick={handleSendToCharger}
              title="Navigate to nearest charging hub"
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all border active:scale-95 ${
                vehicle.status === 'CHARGING' || vehicle.status === 'ENTERING_STATION' || vehicle.status === 'REVERSE_PARKING'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              <BatteryCharging className={`w-3 h-3 ${vehicle.status === 'CHARGING' ? 'text-white' : 'text-blue-600'}`} />
              <span>TO CHARGER</span>
            </button>

            <button
              onClick={handleSendToService}
              title="Dispatch to workshop diagnostics bay"
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all border active:scale-95 ${
                vehicle.serviceCenterId || vehicle.status === 'UNDER_REPAIR' || vehicle.status === 'SERVICE_REQUIRED'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              <Wrench className={`w-3 h-3 ${vehicle.serviceCenterId ? 'text-white' : 'text-amber-600'}`} />
              <span>TO SERVICE</span>
            </button>

            <button
              onClick={handleReturnHome}
              title="Disengage and merge onto regional highway corridor"
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                vehicle.status === 'EN_ROUTE' && !vehicle.destinationStationId && !vehicle.serviceCenterId
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Home className="w-3 h-3 text-slate-500" />
              <span>TO ROAD</span>
            </button>
          </div>

          <button
            onClick={() => toggleTrackVehicle(vehicle.id)}
            className={`w-full mt-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isTracking
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isTracking ? 'Tracking Active (Camera Locked)' : 'Follow Vehicle Camera'}</span>
          </button>
        </div>
      </div>

      <MargdarshakModal
        isOpen={isMargdarshakOpen}
        onClose={() => setIsMargdarshakOpen(false)}
        vehicle={vehicle}
        stations={stations}
      />
    </div>
  );
}
