'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
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
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const stations = useDigitalTwinStore((s) => s.stations);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);
  const trackingVehicleId = useDigitalTwinStore((s) => s.trackingVehicleId);
  const toggleTrackVehicle = useDigitalTwinStore((s) => s.toggleTrackVehicle);

  if (!selectedObject || selectedObject.type !== 'vehicle') {
    return null;
  }

  const vehicle = vehicles.find((v) => v.id === selectedObject.id);
  if (!vehicle) return null;

  const destinationStation = stations.find((s) => s.id === vehicle.destinationStationId);
  const isTracking = trackingVehicleId === vehicle.id;

  const formatStatus = (st: string) => {
    switch (st) {
      case 'EN_ROUTE': return '● EN ROUTE';
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

  // Actions
  const handleStart = () => {
    socketService.emit('vehicle:update', { id: vehicle.id, speed: 42, status: 'EN_ROUTE' });
  };

  const handlePause = () => {
    socketService.emit('vehicle:update', { id: vehicle.id, speed: 0 });
  };

  const handleReroute = () => {
    // Recommend best alternative station (e.g. B104 over congested A102)
    const target = stations.find(s => s.code === 'B104') || stations[1];
    if (target) {
      socketService.rerouteVehicle(vehicle.id, target.id);
    }
  };

  const handleSendToCharger = () => {
    const target = stations.find(s => s.code === 'B104') || stations[0];
    if (target) {
      socketService.rerouteVehicle(vehicle.id, target.id);
    }
  };

  const handleSendToService = () => {
    socketService.sendToService(vehicle.id);
  };

  const handleReturnHome = () => {
    socketService.emit('simulation:return-to-road', { vehicleCode: vehicle.code });
  };

  return (
    <div className="fixed top-20 right-8 z-30 w-88 select-none pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="bg-[#111827]/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs">
        {/* Header */}
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ${
              isOverheating ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {vehicle.code}
                </h2>
                <span className="text-[10px] text-slate-400 font-medium">
                  {vehicle.model}
                </span>
              </div>
              <p className={`text-[11px] font-bold ${
                isOverheating ? 'text-red-400' : vehicle.status === 'CHARGING' ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                {formatStatus(vehicle.status)}
              </p>
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Battery & Health Banner */}
        <div className="my-2.5 p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
              <span>BATTERY CAPACITY</span>
            </span>
            <span className="font-bold text-white font-mono">{batteryPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                batteryPct < 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${batteryPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
            <span>ESTIMATED RANGE: <strong className="text-slate-200">{vehicle.estimatedRangeKm ?? 238} km</strong></span>
            <span>HEALTH: <strong className={vehicle.vehicleHealth === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}>{vehicle.vehicleHealth ?? 'GOOD'}</strong></span>
          </div>
        </div>

        {/* Deep Real-Time Vehicle Telemetry Grid */}
        <div className="space-y-1.5 py-1 text-slate-400 text-[11px]">
          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>SPEED</span>
            <span className="font-mono text-white font-semibold">{Math.round(vehicle.speed)} km/h</span>
          </div>

          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>DESTINATION</span>
            <span className="font-medium text-blue-400">
              {destinationStation ? `${destinationStation.code} ${destinationStation.name}` : vehicle.serviceCenterId ? 'S03 EV Service Center' : 'Patrolling'}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>CURRENT LOCATION</span>
            <span className="text-slate-200 font-medium truncate max-w-[170px]" title={vehicle.currentLocationName}>
              {vehicle.currentLocationName || 'Boisar–Palghar Road'}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-b border-slate-800/40">
            <span>CHARGING POWER</span>
            <span className="font-mono text-white font-semibold">
              {vehicle.status === 'CHARGING' ? `${vehicle.chargingRateKw || 120} kW` : 'NOT CHARGING'}
            </span>
          </div>

          {/* Thermal Telemetry */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className={`p-1.5 rounded bg-slate-900/60 border ${
              isOverheating ? 'border-red-500/60 text-red-300' : 'border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Thermometer className="w-3 h-3 text-red-400" />
                <span>MOTOR TEMP</span>
              </div>
              <span className={`text-xs font-mono font-bold ${isOverheating ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                {vehicle.motorTemperatureC ?? 67}°C
              </span>
            </div>

            <div className={`p-1.5 rounded bg-slate-900/60 border ${
              isBatteryHot ? 'border-amber-500/60 text-amber-300' : 'border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Activity className="w-3 h-3 text-blue-400" />
                <span>BATTERY TEMP</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">
                {vehicle.batteryTemperatureC ?? 31}°C
              </span>
            </div>
          </div>

          {/* Mechanical Subsystems */}
          <div className="flex justify-between text-[10px] text-slate-400 pt-1">
            <span>BRAKE SYSTEM: <strong className="text-emerald-400 font-medium">{vehicle.brakeSystemHealth ?? 'NORMAL'}</strong></span>
            <span>TYRES: <strong className="text-emerald-400 font-medium">{vehicle.tyreHealth ?? 'NORMAL'}</strong></span>
          </div>
        </div>

        {/* Vehicle Controls Toolbar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1.5 font-mono">
            Direct Vehicle Controls
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleStart}
              className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>START</span>
            </button>

            <button
              onClick={handlePause}
              className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Pause className="w-3 h-3 text-amber-400" />
              <span>PAUSE</span>
            </button>

            <button
              onClick={handleReroute}
              className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <CornerUpRight className="w-3 h-3 text-blue-400" />
              <span>REROUTE</span>
            </button>

            <button
              onClick={handleSendToCharger}
              className="py-1 px-2 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors border border-blue-700/50"
            >
              <BatteryCharging className="w-3 h-3 text-blue-400" />
              <span>TO CHARGER</span>
            </button>

            <button
              onClick={handleSendToService}
              className="py-1 px-2 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors border border-amber-700/50"
            >
              <Wrench className="w-3 h-3 text-amber-400" />
              <span>TO SERVICE</span>
            </button>

            <button
              onClick={handleReturnHome}
              className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Home className="w-3 h-3 text-slate-400" />
              <span>TO ROAD</span>
            </button>
          </div>

          {/* Camera Follow Toggle */}
          <button
            onClick={() => toggleTrackVehicle(vehicle.id)}
            className={`w-full mt-2 py-1.5 rounded text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isTracking
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isTracking ? 'Tracking Active (Camera Locked)' : 'Follow Vehicle Camera'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
