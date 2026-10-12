'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { ChevronLeft, ChevronRight, Compass, Building2, Factory, Waves, Landmark, Truck, Palmtree, GripVertical } from 'lucide-react';

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

  // Movable anywhere on screen state
  const dockRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // Do not initiate drag if clicking on interactive buttons (scroll, sector items, swipe toggle)
    if (target.closest('button') && !target.closest('.drag-handle')) {
      return;
    }

    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const currentX = position ? position.x : rect.left;
    const currentY = position ? position.y : rect.top;

    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: currentX,
      initialPosY: currentY,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !dockRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const dockWidth = dockRef.current.offsetWidth;
      const dockHeight = dockRef.current.offsetHeight;

      const rawX = dragStartRef.current.initialPosX + deltaX;
      const rawY = dragStartRef.current.initialPosY + deltaY;

      // Clamp within visible viewport boundaries
      const clampedX = Math.max(8, Math.min(window.innerWidth - dockWidth - 8, rawX));
      const clampedY = Math.max(8, Math.min(window.innerHeight - dockHeight - 8, rawY));

      setPosition({ x: clampedX, y: clampedY });
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={dockRef}
      onPointerDown={handlePointerDown}
      className={`fixed z-30 select-none pointer-events-auto max-w-[96vw] md:max-w-3xl touch-none ${
        isDragging ? 'cursor-grabbing ring-2 ring-blue-500/50 shadow-2xl scale-[1.01]' : ''
      }`}
      style={
        position
          ? {
              top: `${position.y}px`,
              left: `${position.x}px`,
              transform: 'none',
            }
          : {
              top: '4.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
            }
      }
    >
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1 ring-1 ring-white/10">
        {/* Drag handle to move anywhere */}
        <div
          className="drag-handle cursor-grab active:cursor-grabbing p-1.5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors shrink-0"
          title="Click and drag to move anywhere on the screen"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <button
          onClick={() => scroll('left')}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
          title="Scroll sectors left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

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

        <button
          onClick={() => scroll('right')}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
          title="Scroll sectors right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

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
