'use client';

import React, { useState, useEffect } from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { 
  Search, 
  Bell, 
  Sliders, 
  Zap, 
  Truck, 
  AlertTriangle, 
  Activity, 
  Wrench, 
  Play,
  Camera, 
  Compass, 
  Flame,
  Globe,
  Layers,
  Car 
} from 'lucide-react';
import { CameraMode, MapMode } from '../types';

export function TopBar() {
  const kpis = useDigitalTwinStore((s) => s.kpis);
  const events = useDigitalTwinStore((s) => s.events);
  const toggleEvents = useDigitalTwinStore((s) => s.toggleEvents);
  const isEventsOpen = useDigitalTwinStore((s) => s.isEventsOpen);
  const toggleSimDrawer = useDigitalTwinStore((s) => s.toggleSimDrawer);
  const toggleScenarioDrawer = useDigitalTwinStore((s) => s.toggleScenarioDrawer);
  const isScenarioDrawerOpen = useDigitalTwinStore((s) => s.isScenarioDrawerOpen);
  const stations = useDigitalTwinStore((s) => s.stations);
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const cameraMode = useDigitalTwinStore((s) => s.cameraMode);
  const setCameraMode = useDigitalTwinStore((s) => s.setCameraMode);
  const mapMode = useDigitalTwinStore((s) => s.mapMode);
  const setMapMode = useDigitalTwinStore((s) => s.setMapMode);
  const powerGrid = useDigitalTwinStore((s) => s.powerGrid);

  const [search, setSearch] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;

    const matchedStation = stations.find(
      (s) => s.code.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    );
    if (matchedStation) {
      selectStation(matchedStation.id);
      return;
    }

    const matchedVehicle = vehicles.find((v) => v.code.toLowerCase().includes(query));
    if (matchedVehicle) {
      selectVehicle(matchedVehicle.id);
    }
  };

  const isGridOverloaded = (powerGrid?.loadPercentage ?? 0) > 85;
  const unreadCount = events.filter((e) => e.severity === 'CRITICAL' || e.severity === 'WARNING').length;

  const cameraModes: { id: CameraMode; label: string }[] = [
    { id: 'CITY', label: 'CITY' },
    { id: 'STATION', label: 'STATION' },
    { id: 'VEHICLE', label: 'VEHICLE' },
    { id: 'GRID', label: 'GRID' },
    { id: 'SERVICE', label: 'SERVICE' },
  ];

  const mapModes: { id: MapMode; label: string; icon: any }[] = [
    { id: 'REAL_MAP', label: 'REAL MAP (OSM)', icon: Globe },
    { id: '3D_TWIN', label: '3D TWIN', icon: Layers },
    { id: 'VEHICLE_FOLLOW', label: 'VEHICLE FOLLOW', icon: Car },
    { id: 'CHARGING_NETWORK', label: 'CHARGERS', icon: Zap },
    { id: 'POWER_GRID', label: 'POWER GRID', icon: Activity },
    { id: 'SERVICE_NETWORK', label: 'SERVICE HUB', icon: Wrench },
  ];

  return (
    <div className="fixed top-0 left-56 right-0 z-20 px-6 pt-3 pb-2 select-none pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-72 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Boisar sites, EVs, chargers..."
              className="w-full bg-[#111827]/90 backdrop-blur-md border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 shadow-md font-sans"
            />
          </form>

          {/* Global Network KPIs Row */}
          <div className="flex items-center gap-2">
            <div className="bg-[#111827]/90 border border-slate-800 rounded-lg px-3 py-1 text-[11px] shadow-sm">
              <span className="text-slate-400 block text-[9px] font-mono">ACTIVE EVs</span>
              <span className="font-bold text-white font-mono">{vehicles.length}</span>
            </div>

            <div className="bg-[#111827]/90 border border-slate-800 rounded-lg px-3 py-1 text-[11px] shadow-sm">
              <span className="text-slate-400 block text-[9px] font-mono">CHARGING</span>
              <span className="font-bold text-emerald-400 font-mono">{kpis.vehiclesCharging}</span>
            </div>

            <div className="bg-[#111827]/90 border border-slate-800 rounded-lg px-3 py-1 text-[11px] shadow-sm">
              <span className="text-slate-400 block text-[9px] font-mono">WAITING</span>
              <span className="font-bold text-amber-400 font-mono">{kpis.waitingVehicles}</span>
            </div>

            <div className="bg-[#111827]/90 border border-slate-800 rounded-lg px-3 py-1 text-[11px] shadow-sm">
              <span className="text-slate-400 block text-[9px] font-mono">AVAILABLE BAYS</span>
              <span className="font-bold text-sky-400 font-mono">{kpis.availableChargers}</span>
            </div>

            <div className={`border rounded-lg px-3 py-1 text-[11px] shadow-sm ${
              isGridOverloaded
                ? 'bg-red-950/80 border-red-700 animate-pulse'
                : 'bg-[#111827]/90 border-slate-800'
            }`}>
              <span className="text-slate-400 block text-[9px] font-mono">GRID LOAD</span>
              <span className={`font-bold font-mono ${isGridOverloaded ? 'text-red-400' : 'text-slate-200'}`}>
                {kpis.networkLoadMw.toFixed(1)} MW ({powerGrid?.loadPercentage ?? 68}%)
              </span>
            </div>

            <div className="bg-[#111827]/90 border border-slate-800 rounded-lg px-3 py-1 text-[11px] shadow-sm">
              <span className="text-slate-400 block text-[9px] font-mono">IN SERVICE</span>
              <span className="font-bold text-amber-400 font-mono">{kpis.serviceVehicles}</span>
            </div>

            {kpis.activeFaults > 0 && (
              <div className="bg-red-950/80 border border-red-700 rounded-lg px-2.5 py-1 text-[11px] flex items-center gap-1.5 shadow-sm animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300 font-bold font-mono">{kpis.activeFaults} FAULTS</span>
              </div>
            )}
          </div>

          {/* Right Toolbar: Scenario Launcher, Sim Drawer, Events */}
          <div className="flex items-center gap-2">
            {/* Presentation Scenario Launcher */}
            <button
              onClick={() => toggleScenarioDrawer()}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                isScenarioDrawerOpen
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60'
              }`}
            >
              <Play className="w-3 h-3 text-blue-300 fill-current" />
              <span>DEMO SCENARIO</span>
            </button>

            {/* Sim Controls */}
            <button
              onClick={() => toggleSimDrawer()}
              title="Simulation Controls"
              className="bg-[#111827]/90 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Live Events */}
            <button
              onClick={() => toggleEvents()}
              title="Network Events Log"
              className={`bg-[#111827]/90 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition-colors relative ${
                isEventsOpen ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Modes Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Map Modes Switcher (Section 19) */}
            <div className="bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-lg px-2 py-1 flex items-center gap-1 text-[11px] font-mono shadow-sm">
              <span className="text-slate-500 font-bold mr-1 text-[10px]">MAP MODE:</span>
              {mapModes.map((mm) => {
                const Icon = mm.icon;
                const isActive = mapMode === mm.id;
                return (
                  <button
                    key={mm.id}
                    onClick={() => setMapMode(mm.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                      isActive
                        ? mm.id === 'REAL_MAP'
                          ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                          : 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{mm.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Camera Modes Bar (visible in 3D modes) */}
            {mapMode !== 'REAL_MAP' && (
              <div className="bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-lg px-2 py-1 flex items-center gap-1 text-[11px] font-mono shadow-sm">
                <Camera className="w-3 h-3 text-slate-400" />
                <span className="text-slate-500 font-medium mr-1 text-[10px]">CAM:</span>
                {cameraModes.map((cm) => (
                  <button
                    key={cm.id}
                    onClick={() => setCameraMode(cm.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                      cameraMode === cm.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cm.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Overload Warning Marquee */}
          {isGridOverloaded && (
            <div className="bg-red-950/90 border border-red-700/80 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-red-300 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>⚠ GRID OVERLOAD RISK (&gt;90%)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
