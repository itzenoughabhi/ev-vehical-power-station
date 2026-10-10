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
  AlertTriangle 
} from 'lucide-react';

export function VehiclePanel() {
  const selectedVehicleId = useDigitalTwinStore((s) => (s.selectedObject?.type === 'vehicle' ? s.selectedObject.id : null));
  const vehicle = useDigitalTwinStore((s) => (selectedVehicleId ? s.vehicles.find((v) => v.id === selectedVehicleId) : null));
  const stations = useDigitalTwinStore((s) => s.stations);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);
  const trackingVehicleId = useDigitalTwinStore((s) => s.trackingVehicleId);
  const toggleTrackVehicle = useDigitalTwinStore((s) => s.toggleTrackVehicle);
  const updateVehicle = useDigitalTwinStore((s) => s.updateVehicle);
  const [isMargdarshakOpen, setIsMargdarshakOpen] = useState(false);

  if (!vehicle) {
    return null;
  }

  const destinationStation = stations.find((s) => s.id === vehicle.destinationStationId);
  const isTracking = trackingVehicleId === vehicle.id;

  const formatStatus = (st: string) => {
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

  const batteryPct = Math.round(vehicle.currentBatteryPct);
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

  const handleStart = () => {
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
                isOverheating ? 'text-red-600' : vehicle.status === 'PAUSED' ? 'text-amber-600' : vehicle.status === 'CHARGING' ? 'text-emerald-600' : 'text-blue-600'
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

        <div className="my-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <BatteryCharging className="w-3.5 h-3.5 text-blue-600" />
              <span>BATTERY CAPACITY</span>
            </span>
            <span className="font-bold text-slate-900 font-mono">{batteryPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                batteryPct < 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${batteryPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
            <span>ESTIMATED RANGE: <strong className="text-slate-800">{vehicle.estimatedRangeKm ?? 238} km</strong></span>
            <span>HEALTH: <strong className={vehicle.vehicleHealth === 'CRITICAL' ? 'text-red-600' : 'text-emerald-600'}>{vehicle.vehicleHealth ?? 'GOOD'}</strong></span>
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
