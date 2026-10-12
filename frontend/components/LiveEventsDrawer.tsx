'use client';

import React, { useState } from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  BatteryCharging, 
  Truck, 
  Car, 
  Clock,
  Compass,
  AlertOctagon
} from 'lucide-react';
import { Vehicle } from '../types';

type DrawerTab = 'all' | 'stranded' | 'lowBattery' | 'traffic';

export function LiveEventsDrawer() {
  const [activeTab, setActiveTab] = useState<DrawerTab>('all');
  const events = useDigitalTwinStore((s) => s.events);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const isEventsOpen = useDigitalTwinStore((s) => s.isEventsOpen);
  const toggleEvents = useDigitalTwinStore((s) => s.toggleEvents);
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const toggleTrackVehicle = useDigitalTwinStore((s) => s.toggleTrackVehicle);

  if (!isEventsOpen) return null;

  // 1. Vehicles with 0% battery or marked STRANDED
  const strandedVehicles = vehicles.filter(
    (v) => v.status === 'STRANDED' || v.currentBatteryPct <= 0
  );

  // 2. Vehicles with less than 20% charging (< 20% SOC)
  const lowBatteryVehicles = vehicles.filter(
    (v) => v.currentBatteryPct > 0 && v.currentBatteryPct <= 20
  );

  // 3. Vehicles creating traffic / congestion / bottlenecks
  const trafficCausingVehicles = vehicles.filter((v) => {
    if (v.status === 'STRANDED' || (v as any)._isPulledOver) return false;
    const isQueued = v.status === 'QUEUE' || v.trafficState === 'QUEUING';
    const isTransitCrawl = (v.status === 'EN_ROUTE' || v.status === 'DEPARTING') && v.speed < 18;
    const isHeavySlow = (v.model === 'Heavy Electric Hauler' || v.model === 'Electric City Bus') && v.speed < 24;
    const isCongestionState = v.trafficState === 'WAITING_INTERSECTION' || v.trafficState === 'STOPPED';
    return isQueued || isTransitCrawl || isHeavySlow || isCongestionState;
  });

  const getTrafficReason = (v: Vehicle) => {
    if (v.status === 'QUEUE' || v.trafficState === 'QUEUING') {
      return 'Station bay queue backlog (waiting outside bays)';
    }
    if (v.speed === 0) {
      return 'Stationary in active road lane (blocking trailing traffic)';
    }
    if (v.speed < 18) {
      return `Slow transit crawl (${Math.round(v.speed)} km/h) causing trailing vehicle slowdown`;
    }
    if (v.model === 'Heavy Electric Hauler' || v.model === 'Electric City Bus') {
      return `Heavy commercial hauler speed regulator (${Math.round(v.speed)} km/h)`;
    }
    return 'Active road corridor traffic bottleneck';
  };

  const handleTow = (e: React.MouseEvent, vehicleId: string) => {
    e.stopPropagation();
    socketService.towVehicle(vehicleId);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    selectVehicle(vehicleId);
    toggleTrackVehicle(vehicleId);
  };

  return (
    <div className="fixed top-24 left-60 z-30 w-96 select-none pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-200">
      <div className="bg-[#111827]/98 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-800 text-slate-200 font-sans text-xs max-h-[32rem] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                Live Network Incident Timeline
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Fleet Alert & Traffic Monitor
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleEvents(false)}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Glance Category Chips */}
        <div className="grid grid-cols-4 gap-1.5 my-2.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-semibold flex flex-col items-center justify-center transition-all border ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-[9px] uppercase tracking-tight">Events</span>
            <span className="text-xs font-bold">{events.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('stranded')}
            className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-semibold flex flex-col items-center justify-center transition-all border ${
              activeTab === 'stranded'
                ? 'bg-red-600 text-white border-red-500 shadow-sm ring-1 ring-red-400'
                : strandedVehicles.length > 0
                ? 'bg-red-950/40 text-red-400 border-red-900/60 animate-pulse hover:bg-red-900/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-[9px] uppercase tracking-tight">Stranded</span>
            <span className={`text-xs font-bold ${strandedVehicles.length > 0 && activeTab !== 'stranded' ? 'text-red-400' : ''}`}>
              {strandedVehicles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lowBattery')}
            className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-semibold flex flex-col items-center justify-center transition-all border ${
              activeTab === 'lowBattery'
                ? 'bg-amber-600 text-white border-amber-500 shadow-sm ring-1 ring-amber-400'
                : lowBatteryVehicles.length > 0
                ? 'bg-amber-950/40 text-amber-400 border-amber-900/60 hover:bg-amber-900/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-[9px] uppercase tracking-tight">&lt;20% SOC</span>
            <span className={`text-xs font-bold ${lowBatteryVehicles.length > 0 && activeTab !== 'lowBattery' ? 'text-amber-400' : ''}`}>
              {lowBatteryVehicles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('traffic')}
            className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-semibold flex flex-col items-center justify-center transition-all border ${
              activeTab === 'traffic'
                ? 'bg-orange-600 text-white border-orange-500 shadow-sm ring-1 ring-orange-400'
                : trafficCausingVehicles.length > 0
                ? 'bg-orange-950/40 text-orange-400 border-orange-900/60 hover:bg-orange-900/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-[9px] uppercase tracking-tight">Traffic</span>
            <span className={`text-xs font-bold ${trafficCausingVehicles.length > 0 && activeTab !== 'traffic' ? 'text-orange-400' : ''}`}>
              {trafficCausingVehicles.length}
            </span>
          </button>
        </div>

        {/* Tab View Content */}
        <div className="overflow-y-auto space-y-2 text-xs pr-1 flex-1">
          {/* 1. STRANDED VEHICLES TAB */}
          {activeTab === 'stranded' && (
            <div className="space-y-2">
              {strandedVehicles.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-mono text-[11px] bg-slate-900/50 rounded-xl border border-slate-800/80">
                  <div className="text-emerald-400 text-lg mb-1">✅</div>
                  <div>No vehicles currently stranded</div>
                  <div className="text-[10px] text-slate-600 mt-1">All active vehicles have sufficient battery charge</div>
                </div>
              ) : (
                strandedVehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVehicle(v.id)}
                    className="p-2.5 rounded-xl bg-red-950/30 border border-red-800/80 hover:border-red-600 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
                          🛑
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-[12px] group-hover:text-red-300 transition-colors">
                              {v.code}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {v.model}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-red-400 font-bold block">
                            0% BATTERY DEPLETED • STRANDED
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-red-900/80 text-white px-1.5 py-0.5 rounded border border-red-700">
                        0% SOC
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1.5 font-mono flex items-center gap-1">
                      <Compass className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-[280px]">
                        {v.currentLocationName || 'Roadside Shoulder (Pulled Over)'}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-red-900/50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {v.status === 'BEING_TOWED' ? '🛻 Tow Mission in Progress' : 'Stopped roadside'}
                      </span>
                      {v.status !== 'BEING_TOWED' && (
                        <button
                          onClick={(e) => handleTow(e, v.id)}
                          className="py-1 px-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Truck className="w-3 h-3" />
                          <span>DISPATCH TOW</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. LOW BATTERY (<20%) VEHICLES TAB */}
          {activeTab === 'lowBattery' && (
            <div className="space-y-2">
              {lowBatteryVehicles.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-mono text-[11px] bg-slate-900/50 rounded-xl border border-slate-800/80">
                  <div className="text-emerald-400 text-lg mb-1">⚡</div>
                  <div>No low battery vehicles (&lt;20%)</div>
                  <div className="text-[10px] text-slate-600 mt-1">All operating vehicles maintain healthy SOC reserves</div>
                </div>
              ) : (
                lowBatteryVehicles.map((v) => {
                  const pct = Math.round(v.currentBatteryPct);
                  const isCritical = pct <= 10;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVehicle(v.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer group shadow-sm ${
                        isCritical
                          ? 'bg-red-950/30 border-red-800/80 hover:border-red-500'
                          : 'bg-amber-950/30 border-amber-800/80 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
                          }`}>
                            ⚠️
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-[12px] group-hover:text-amber-300 transition-colors">
                                {v.code}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {v.model}
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold block ${
                              isCritical ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              {isCritical ? 'CRITICAL LOW BATTERY' : 'LOW BATTERY WARNING'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`font-mono text-xs font-bold block ${
                            isCritical ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {pct}% SOC
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {v.estimatedRangeKm ?? Math.round((pct / 100) * 380)} km range
                          </span>
                        </div>
                      </div>

                      {/* Battery mini progress bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCritical ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1.5 font-mono flex items-center justify-between">
                        <span className="truncate max-w-[220px]">
                          📍 {v.currentLocationName || 'In Transit'}
                        </span>
                        <span className="text-blue-400 hover:text-blue-300 font-semibold">
                          Inspect Vehicle →
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. VEHICLES CREATING TRAFFIC TAB */}
          {activeTab === 'traffic' && (
            <div className="space-y-2">
              {trafficCausingVehicles.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-mono text-[11px] bg-slate-900/50 rounded-xl border border-slate-800/80">
                  <div className="text-emerald-400 text-lg mb-1">🚗</div>
                  <div>No traffic bottlenecks detected</div>
                  <div className="text-[10px] text-slate-600 mt-1">All road corridors are cruising continuously with smooth traffic flow</div>
                </div>
              ) : (
                trafficCausingVehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVehicle(v.id)}
                    className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-800/80 hover:border-orange-500 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                          🚦
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-[12px] group-hover:text-orange-300 transition-colors">
                              {v.code}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {v.model}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-orange-400 font-semibold block">
                            {getTrafficReason(v)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-orange-400 block">
                          {Math.round(v.speed)} km/h
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          {v.status === 'QUEUE' ? 'In Queue' : 'Speed Restrictor'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1.5 font-mono flex items-center justify-between">
                      <span className="truncate max-w-[240px]">
                        📍 {v.currentLocationName || 'Boisar Corridor'}
                      </span>
                      <span className="text-blue-400 hover:text-blue-300 font-semibold">
                        View Hotspot →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. ALL TIMELINE INCIDENT EVENTS TAB */}
          {activeTab === 'all' && (
            <div className="space-y-1.5">
              {events.length === 0 ? (
                <div className="py-6 text-center text-slate-500 font-mono text-[11px]">
                  No active network alerts
                </div>
              ) : (
                events.slice(0, 25).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (evt.stationId) selectStation(evt.stationId);
                      else if (evt.vehicleId) handleSelectVehicle(evt.vehicleId);
                    }}
                    className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-slate-800"
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
          )}
        </div>
      </div>
    </div>
  );
}
