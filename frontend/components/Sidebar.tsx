'use client';

import React from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import {
  LayoutDashboard,
  Zap,
  Car,
  Activity,
  Wrench,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

export function Sidebar() {
  const activeNav = useDigitalTwinStore((s) => s.activeNav);
  const setActiveNav = useDigitalTwinStore((s) => s.setActiveNav);
  const stations = useDigitalTwinStore((s) => s.stations);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const selectGrid = useDigitalTwinStore((s) => s.selectGrid);
  const selectServiceCenter = useDigitalTwinStore((s) => s.selectServiceCenter);
  const recenterCamera = useDigitalTwinStore((s) => s.recenterCamera);
  const toggleScenarioDrawer = useDigitalTwinStore((s) => s.toggleScenarioDrawer);
  const isScenarioDrawerOpen = useDigitalTwinStore((s) => s.isScenarioDrawerOpen);

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'stations' as const, label: 'Charging Hubs', icon: Zap },
    { id: 'vehicles' as const, label: 'EV Fleet', icon: Car },
    { id: 'grid' as const, label: 'Power Grid', icon: Activity },
    { id: 'service' as const, label: 'EV Service Hub', icon: Wrench },
    { id: 'incidents' as const, label: 'Incidents Feed', icon: AlertCircle },
  ];

  const handleNavClick = (id: typeof activeNav) => {
    setActiveNav(id);
    if (id === 'overview') {
      recenterCamera();
    } else if (id === 'stations' && stations.length > 0) {
      selectStation(stations[0].id);
    } else if (id === 'vehicles' && vehicles.length > 0) {
      selectVehicle(vehicles[0].id);
    } else if (id === 'grid') {
      selectGrid();
    } else if (id === 'service') {
      selectServiceCenter();
    }
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-56 z-30 bg-[#0f172a]/98 backdrop-blur-md border-r border-slate-800 shadow-xl flex flex-col justify-between py-5 px-3 select-none pointer-events-auto">
      <div>
        {/* Brand Header */}
        <div 
          className="px-2 mb-6 cursor-pointer" 
          onClick={() => handleNavClick('overview')}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-900/50">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white font-mono">
                EVNEXUS
              </h1>
              <p className="text-[9px] font-semibold tracking-wider text-slate-400 font-mono uppercase">
                Boisar Digital Twin
              </p>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono">
            Lat 19.7902° · Lon 72.7657°
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white bg-blue-600 shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Demo Scenario Launcher in Sidebar */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => toggleScenarioDrawer()}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              isScenarioDrawerOpen
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-900/40'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Demo Scenario</span>
          </button>
        </div>
      </div>

      {/* Network Status Badge */}
      <div className="px-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-mono text-[10px]">Boisar Grid 5MW</span>
        </span>
        <span className="font-mono text-[10px] text-slate-500">v3.0</span>
      </div>
    </aside>
  );
}
