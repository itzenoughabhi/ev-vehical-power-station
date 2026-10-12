'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  Navigation,
  Clock,
  MapPin,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Car,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Station, Vehicle } from '../types';
import { MargdarshakRouter, MargdarshakStationEvaluation, MargdarshakRouteOption } from '../services/margdarshakService';
import { socketService } from '../services/socket';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';

interface MargdarshakModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  stations: Station[];
}

export function MargdarshakModal({ isOpen, onClose, vehicle, stations }: MargdarshakModalProps) {
  const updateVehicle = useDigitalTwinStore((s) => s.updateVehicle);

  const evaluations: MargdarshakStationEvaluation[] = useMemo(() => {
    if (!isOpen || !vehicle || !stations.length) return [];
    return MargdarshakRouter.evaluateAllStations(vehicle, stations);
  }, [isOpen, vehicle, stations]);

  const [selectedStationId, setSelectedStationId] = useState<string>(() => {
    return evaluations[0]?.station.id || stations[0]?.id || '';
  });

  const [selectedRouteType, setSelectedRouteType] = useState<'TRAFFIC_FREE' | 'SHORTEST_DISTANCE' | 'MOST_TRAFFIC'>('TRAFFIC_FREE');

  // Keep selectedStation updated when evaluations recalculate
  const currentEvaluation = useMemo(() => {
    return evaluations.find((e) => e.station.id === selectedStationId) || evaluations[0];
  }, [evaluations, selectedStationId]);

  if (!isOpen || !vehicle) return null;

  const fastestEvaluation = evaluations.find((e) => e.isFastestByTime) || evaluations[0];
  const shortestEvaluation = evaluations.find((e) => e.isNearestByDistance) || evaluations[0];

  const activeRouteOption: MargdarshakRouteOption =
    selectedRouteType === 'TRAFFIC_FREE'
      ? currentEvaluation?.fastestRoute
      : selectedRouteType === 'SHORTEST_DISTANCE'
        ? currentEvaluation?.shortestRoute
        : currentEvaluation?.congestedRoute;

  const handleConfirmRouting = () => {
    if (!currentEvaluation) return;

    const targetStation = currentEvaluation.station;
    const waypoints = activeRouteOption?.waypoints || [];

    socketService.rerouteVehicle(vehicle.id, targetStation.id, waypoints);

    updateVehicle(vehicle.id, {
      destinationStationId: targetStation.id,
      serviceCenterId: null,
      assignedChargerId: null,
      currentStationId: null,
      status: 'EN_ROUTE',
      trafficState: 'CRUISING',
      speed: 42,
      routeWaypoints: waypoints,
      currentWaypointIndex: 0,
      routeProgress: 0.05,
      etaMinutes: Math.max(1, Math.round(activeRouteOption.estimatedTimeMin)),
      currentLocationName: `En route to ${targetStation.name} [${targetStation.code}] via Margdarshak ${activeRouteOption.title}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-blue-400 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Margdarshak Smart Fuel & EV Station Guidance</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RoyYash / Margdarshak Algorithm
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Vehicle: <strong className="text-white">{vehicle.code}</strong> ({vehicle.model})</span>
                <span>•</span>
                <span>Battery: <strong className="text-emerald-400">{Math.round(vehicle.currentBatteryPct)}%</strong> ({vehicle.estimatedRangeKm} km range)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algorithm Summary Comparison Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Margdarshak Recommended (Least Time) */}
            <div className="bg-emerald-50/80 border border-emerald-300/80 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                  Fastest Route (Least Time)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono text-[9px] font-bold">
                  RECOMMENDED
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs truncate">
                {fastestEvaluation?.station.name} [{fastestEvaluation?.station.code}]
              </div>
              <div className="flex items-baseline gap-2 mt-1 font-mono">
                <span className="text-base font-extrabold text-emerald-700">
                  {fastestEvaluation?.fastestRoute.estimatedTimeMin} min
                </span>
                <span className="text-[11px] text-slate-600">
                  {fastestEvaluation?.fastestRoute.distanceKm} km ({fastestEvaluation?.fastestRoute.avgCongestionPct}% traffic)
                </span>
              </div>
              <div className="text-[10px] text-emerald-800 font-medium mt-1">
                ⭐ Saves ~{fastestEvaluation?.timeSavedMin} mins vs congested corridor
              </div>
            </div>

            {/* Shortest Distance */}
            <div className="bg-blue-50/80 border border-blue-300/80 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1 font-mono">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  Shortest Distance Station
                </span>
                <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                  MIN DISTANCE
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs truncate">
                {shortestEvaluation?.station.name} [{shortestEvaluation?.station.code}]
              </div>
              <div className="flex items-baseline gap-2 mt-1 font-mono">
                <span className="text-base font-extrabold text-blue-700">
                  {shortestEvaluation?.shortestRoute.distanceKm} km
                </span>
                <span className="text-[11px] text-slate-600">
                  {shortestEvaluation?.shortestRoute.estimatedTimeMin} min ({shortestEvaluation?.shortestRoute.avgCongestionPct}% traffic)
                </span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium mt-1">
                Geographically closest to current vehicle coordinates
              </div>
            </div>

            {/* Congestion Notice & Formula */}
            <div className="bg-amber-50/80 border border-amber-300/80 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Margdarshak Traffic Formula
                </span>
              </div>
              <div className="text-[10px] text-slate-700 font-mono leading-tight">
                <strong>Time = (Dist / Speed) × (1 + 2.0 × Congestion)</strong>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Cost = Time + 0.18×Dist + 18×Congestion
              </div>
              <div className="text-[10px] text-amber-900 font-medium mt-1">
                Dynamically routes through traffic-free arterial bypasses
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Station Selection List (Left Column) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Select Fuel / EV Charging Station ({evaluations.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Sorted by least travel time
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {evaluations.map((evalItem) => {
                const isSelected = evalItem.station.id === selectedStationId;
                return (
                  <div
                    key={evalItem.station.id}
                    onClick={() => setSelectedStationId(evalItem.station.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-200 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {evalItem.station.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {evalItem.station.code}
                          </span>
                          {evalItem.isFastestByTime && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ⚡ Fastest
                            </span>
                          )}
                          {evalItem.isNearestByDistance && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              📏 Closest
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {evalItem.station.district}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-sm font-extrabold text-slate-900 block">
                          {evalItem.fastestRoute.estimatedTimeMin} min
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {evalItem.distanceKm} km away
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${evalItem.availableBays > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {evalItem.availableBays} / {evalItem.totalBays} Bays Available
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          ⚡ {evalItem.maxPowerKw} kW DC Fast
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                        <span>Traffic:</span>
                        <strong className={
                          evalItem.fastestRoute.avgCongestionPct > 50 ? 'text-amber-600' : 'text-emerald-600'
                        }>
                          {evalItem.fastestRoute.avgCongestionPct}%
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route Calculation & Comparison (Right Column) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Route Algorithm Comparison ({currentEvaluation?.station.code})
            </h3>

            {/* Route Options for Selected Station */}
            <div className="flex flex-col gap-2.5">
              {/* Option 1: Margdarshak Traffic-Free Route */}
              <div
                onClick={() => setSelectedRouteType('TRAFFIC_FREE')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedRouteType === 'TRAFFIC_FREE'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={selectedRouteType === 'TRAFFIC_FREE'}
                      onChange={() => setSelectedRouteType('TRAFFIC_FREE')}
                      className="text-emerald-600"
                    />
                    Margdarshak Traffic-Free
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                    <span>⚡</span>
                    <span>LEAST TIME • LESS TRAFFIC</span>
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-800 font-sans mt-0.5">
                  🛣️ {currentEvaluation?.fastestRoute.routeName}
                </div>
                <div className="flex items-baseline justify-between font-mono mt-1 text-xs">
                  <span className="text-emerald-700 font-bold text-sm">
                    {currentEvaluation?.fastestRoute.estimatedTimeMin} mins
                  </span>
                  <span className="text-slate-600">
                    <strong className="text-emerald-700">{currentEvaluation?.fastestRoute.distanceKm} km</strong> • <strong className="text-emerald-600">{currentEvaluation?.fastestRoute.avgCongestionPct}% Congestion (Least Traffic)</strong>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {currentEvaluation?.fastestRoute.description}
                </p>
              </div>

              {/* Option 2: Shortest Distance Route */}
              <div
                onClick={() => setSelectedRouteType('SHORTEST_DISTANCE')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedRouteType === 'SHORTEST_DISTANCE'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={selectedRouteType === 'SHORTEST_DISTANCE'}
                      onChange={() => setSelectedRouteType('SHORTEST_DISTANCE')}
                      className="text-blue-600"
                    />
                    Shortest Distance
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                    <span>📏</span>
                    <span>MIN DISTANCE</span>
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-blue-800 font-sans mt-0.5">
                  🛣️ {currentEvaluation?.shortestRoute.routeName}
                </div>
                <div className="flex items-baseline justify-between font-mono mt-1 text-xs">
                  <span className="text-blue-700 font-bold text-sm">
                    {currentEvaluation?.shortestRoute.estimatedTimeMin} mins
                  </span>
                  <span className="text-slate-600">
                    <strong className="text-blue-700">{currentEvaluation?.shortestRoute.distanceKm} km (Min Distance)</strong> • {currentEvaluation?.shortestRoute.avgCongestionPct}% Congestion
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {currentEvaluation?.shortestRoute.description}
                </p>
              </div>

              {/* Option 3: Heaviest Traffic Route */}
              <div
                onClick={() => setSelectedRouteType('MOST_TRAFFIC')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedRouteType === 'MOST_TRAFFIC'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={selectedRouteType === 'MOST_TRAFFIC'}
                      onChange={() => setSelectedRouteType('MOST_TRAFFIC')}
                      className="text-amber-600"
                    />
                    Most Congested Corridor
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-600 text-white flex items-center gap-1 shadow-xs">
                    <span>⚠️</span>
                    <span>BUSIEST ROUTE • HEAVY DELAY</span>
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-amber-900 font-sans mt-0.5">
                  🛣️ {currentEvaluation?.congestedRoute.routeName}
                </div>
                <div className="flex items-baseline justify-between font-mono mt-1 text-xs">
                  <span className="text-amber-700 font-bold text-sm">
                    {currentEvaluation?.congestedRoute.estimatedTimeMin} mins
                  </span>
                  <span className="text-slate-600">
                    {currentEvaluation?.congestedRoute.distanceKm} km • <strong className="text-amber-700">{currentEvaluation?.congestedRoute.avgCongestionPct}% Congestion (Busiest Corridor)</strong>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {currentEvaluation?.congestedRoute.description}
                </p>
              </div>
            </div>

            {/* Path Nodes Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">
                Route Corridors ({activeRouteOption?.nodePath.length} Nodes)
              </span>
              <div className="flex flex-wrap items-center gap-1 font-mono text-[10px] text-slate-700">
                {activeRouteOption?.nodePath.map((node, i) => (
                  <React.Fragment key={node}>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">
                      {node}
                    </span>
                    {i < activeRouteOption.nodePath.length - 1 && (
                      <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-700">
            <span>Destination: <strong>{currentEvaluation?.station.name} [{currentEvaluation?.station.code}]</strong></span>
            <span className="mx-2">•</span>
            <span>Selected: <strong className="text-blue-700">{activeRouteOption?.title}</strong></span>
            <span className="mx-2">•</span>
            <span className="font-mono">Est: <strong>{activeRouteOption?.estimatedTimeMin} mins</strong> ({activeRouteOption?.distanceKm} km)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRouting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Confirm & Route to Charger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
