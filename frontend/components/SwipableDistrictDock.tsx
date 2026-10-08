'use client';

import React, { useRef } from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { ChevronLeft, ChevronRight, Compass, Building2, Factory, Waves, Landmark, Truck, Palmtree } from 'lucide-react';

interface SectorItem {
  id: 'overview' | 'boisar' | 'tarapur' | 'dahanu' | 'palghar' | 'manor' | 'shirgaon';
  title: string;
  tag: string;
  icon: any;
  color: string;
}

const SECTORS: SectorItem[] = [
  {
    id: 'overview',
    title: 'Full District',
    tag: 'Regional Grid',
    icon: Compass,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'boisar',
    title: 'Boisar Central',
    tag: 'Town & Market',
    icon: Building2,
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'palghar',
    title: 'Palghar Capital',
    tag: 'District Admin HQ',
    icon: Landmark,
    color: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'shirgaon',
    title: 'Shirgaon Coast',
    tag: 'Beach & Fort',
    icon: Palmtree,
    color: 'from-teal-600 to-emerald-600',
  },
  {
    id: 'dahanu',
    title: 'Dahanu Gateway',
    tag: 'North Agro Belt',
    icon: Waves,
    color: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'manor',
    title: 'Manor NH-48',
    tag: 'Express Flyover',
    icon: Truck,
    color: 'from-rose-600 to-red-600',
  },
  {
    id: 'tarapur',
    title: 'Tarapur MIDC',
    tag: 'Industrial & Marine',
    icon: Factory,
    color: 'from-amber-600 to-orange-600',
  },
];

export function SwipableDistrictDock() {
  const activeSector = useDigitalTwinStore((s) => s.activeSector);
  const panToSector = useDigitalTwinStore((s) => s.panToSector);
  const isPanMode = useDigitalTwinStore((s) => s.isPanMode);
  const togglePanMode = useDigitalTwinStore((s) => s.togglePanMode);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-20 select-none pointer-events-auto max-w-[92vw] md:max-w-3xl">
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1 ring-1 ring-white/10">
        {/* Quick Pan Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
          title="Scroll sectors left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Swipable Sector Bar with Touch Drag */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 px-1 no-scrollbar snap-x touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SECTORS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => panToSector(sec.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all snap-start ${
                  isActive
                    ? `bg-gradient-to-r ${sec.color} text-white shadow-lg ring-1 ring-white/30 scale-[1.02]`
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="flex flex-col items-start text-left leading-tight">
                  <span className="font-bold text-[11px]">{sec.title}</span>
                  <span className={`text-[9px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                    {sec.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Pan Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
          title="Scroll sectors right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Hand Pan / Swipe Mode Toggle Quick Trigger */}
        <button
          onClick={() => togglePanMode()}
          className={`ml-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border whitespace-nowrap ${
            isPanMode
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
              : 'bg-slate-800/90 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
          }`}
          title={isPanMode ? 'Pan/Swipe mode enabled (Drag to pan map)' : 'Switch to 1-click Swipe Pan mode'}
        >
          <span className="text-[12px]">{isPanMode ? '✋' : '👆'}</span>
          <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider">
            {isPanMode ? 'SWIPE ON' : 'SWIPE MAP'}
          </span>
        </button>
      </div>
    </div>
  );
}
