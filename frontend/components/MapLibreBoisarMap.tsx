'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { localToLatLon, BOISAR_GEO_CENTER } from '../services/osmRoadGraphService';
import { Layers, Compass, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Zap, Truck, Wrench, Home } from 'lucide-react';

interface Props {
  onSwitchTo3D?: () => void;
}

export function MapLibreBoisarMap({ onSwitchTo3D }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const stations = useDigitalTwinStore((s) => s.stations);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const powerGrid = useDigitalTwinStore((s) => s.powerGrid);
  const serviceCenter = useDigitalTwinStore((s) => s.serviceCenter);
  const homeChargers = useDigitalTwinStore((s) => s.homeChargers);
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const selectGrid = useDigitalTwinStore((s) => s.selectGrid);
  const selectServiceCenter = useDigitalTwinStore((s) => s.selectServiceCenter);
  const selectHomeCharger = useDigitalTwinStore((s) => s.selectHomeCharger);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayerMode, setActiveLayerMode] = useState<'roads' | 'satellite' | 'dark'>('dark');

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Dark technical OpenStreetMap tile style
    const osmStyle = {
      version: 8 as const,
      sources: {
        'osm-tiles': {
          type: 'raster' as const,
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-base',
          type: 'raster' as const,
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-opacity': 0.85,
            'raster-brightness-max': 0.75,
            'raster-contrast': 0.15,
            'raster-saturation': -0.3,
          },
        },
      ],
    };

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: osmStyle,
      center: [BOISAR_GEO_CENTER.lon, BOISAR_GEO_CENTER.lat], // [72.7657359, 19.7902325]
      zoom: 14.2,
      pitch: 35,
      bearing: -15,
      maxPitch: 65,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Add real OSM GeoJSON roads vector layer
      map.addSource('boisar-osm-roads', {
        type: 'geojson',
        data: '/data/boisar_roads_geojson.json',
      });

      // Secondary & local roads layer
      map.addLayer({
        id: 'boisar-roads-local',
        type: 'line',
        source: 'boisar-osm-roads',
        filter: ['!', ['get', 'isMajor']],
        paint: {
          'line-color': '#94a3b8',
          'line-width': 2.0,
          'line-opacity': 0.7,
        },
      });

      // Major arterial highways (Boisar-Palghar Road, Navapur Road)
      map.addLayer({
        id: 'boisar-roads-major',
        type: 'line',
        source: 'boisar-osm-roads',
        filter: ['get', 'isMajor'],
        paint: {
          'line-color': '#0284c7',
          'line-width': 4.0,
          'line-opacity': 0.9,
        },
      });

      // Major road glow
      map.addLayer({
        id: 'boisar-roads-glow',
        type: 'line',
        source: 'boisar-osm-roads',
        filter: ['get', 'isMajor'],
        paint: {
          'line-color': '#38bdf8',
          'line-width': 8.0,
          'line-opacity': 0.25,
          'line-blur': 2.0,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Synchronize Live Markers on OpenStreetMap
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. Charging Station Markers
    stations.forEach((st) => {
      const geo = localToLatLon(st.position.x, st.position.z);
      const el = document.createElement('div');
      const availCount = st.chargers.filter((c) => c.status === 'AVAILABLE').length;
      const faultCount = st.chargers.filter((c) => c.status === 'FAULT').length;

      el.className = `cursor-pointer px-2 py-0.5 rounded-full border backdrop-blur-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-md transition-transform hover:scale-110 ${
        faultCount > 0
          ? 'bg-red-900/90 text-red-200 border-red-500 animate-pulse'
          : availCount === 0
          ? 'bg-amber-900/90 text-amber-200 border-amber-500'
          : 'bg-slate-900/90 text-sky-300 border-sky-500'
      }`;
      el.innerHTML = `<span>⚡</span><span>${st.code}</span><span class="text-[9px] opacity-80">(${availCount} free)</span>`;
      el.onclick = () => selectStation(st.id);

      const marker = new Marker({ element: el })
        .setLngLat([geo.lon, geo.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // 2. Substation GRID-S01 Marker
    if (powerGrid) {
      const geo = localToLatLon(powerGrid.position.x, powerGrid.position.z);
      const el = document.createElement('div');
      const isOverloaded = powerGrid.status === 'OVERLOAD_RISK';

      el.className = `cursor-pointer px-2 py-0.5 rounded-full border backdrop-blur-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-md transition-transform hover:scale-110 ${
        isOverloaded
          ? 'bg-red-900/90 text-white border-red-500 animate-pulse ring-2 ring-red-400'
          : 'bg-slate-900/90 text-sky-400 border-sky-400'
      }`;
      el.innerHTML = `<span>⚡</span><span>GRID-S01</span><span class="text-[9px]">(${powerGrid.loadPercentage}%)</span>`;
      el.onclick = () => selectGrid();

      const marker = new Marker({ element: el })
        .setLngLat([geo.lon, geo.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }

    // 3. Service Center S03 Marker
    if (serviceCenter) {
      const geo = localToLatLon(serviceCenter.position.x, serviceCenter.position.z);
      const el = document.createElement('div');
      el.className = 'cursor-pointer px-2 py-0.5 rounded-full border backdrop-blur-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-md bg-slate-900/90 text-amber-400 border-amber-500 transition-transform hover:scale-110';
      el.innerHTML = `<span>🔧</span><span>S03 HUB</span><span class="text-[9px]">(${serviceCenter.availableBays} bays)</span>`;
      el.onclick = () => selectServiceCenter();

      const marker = new Marker({ element: el })
        .setLngLat([geo.lon, geo.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }

    // 4. Home Chargers Markers
    homeChargers.forEach((hc) => {
      const geo = localToLatLon(hc.position.x, hc.position.z);
      const el = document.createElement('div');
      el.className = 'cursor-pointer px-1.5 py-0.2 rounded-full border text-[9px] font-mono font-medium flex items-center gap-0.5 bg-slate-900/80 text-emerald-400 border-emerald-600/60 shadow-sm';
      el.innerHTML = `<span>🏠</span><span>${hc.homeId}</span>`;
      el.onclick = () => selectHomeCharger(hc.homeId);

      const marker = new Marker({ element: el })
        .setLngLat([geo.lon, geo.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // 5. Live Moving EV Markers
    vehicles.forEach((veh) => {
      const geo = localToLatLon(veh.position.x, veh.position.z);
      const el = document.createElement('div');
      const hasFault = veh.status === 'FAULT' || veh.status === 'SERVICE_REQUIRED' || veh.vehicleHealth === 'CRITICAL';
      const isCharging = veh.status === 'CHARGING';

      el.className = `cursor-pointer px-2 py-0.5 rounded-full border backdrop-blur-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-md transition-transform hover:scale-110 ${
        hasFault
          ? 'bg-red-600 text-white border-red-400 animate-pulse'
          : isCharging
          ? 'bg-emerald-600 text-white border-emerald-400'
          : 'bg-blue-600 text-white border-blue-400'
      }`;
      el.innerHTML = `<span>${hasFault ? '🚨' : isCharging ? '⚡' : '🚗'}</span><span>${veh.code}</span><span class="text-[9px] opacity-90">${Math.round(veh.currentBatteryPct)}%</span>`;
      el.onclick = () => selectVehicle(veh.id);

      const marker = new Marker({ element: el })
        .setLngLat([geo.lon, geo.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [mapLoaded, stations, vehicles, powerGrid, serviceCenter, homeChargers, selectStation, selectVehicle, selectGrid, selectServiceCenter, selectHomeCharger]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [BOISAR_GEO_CENTER.lon, BOISAR_GEO_CENTER.lat],
      zoom: 14.2,
      pitch: 35,
      bearing: -15,
      essential: true,
    });
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full select-none bg-[#0b0f19]">
      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Real Geographic Data Watermark Header */}
      <div className="absolute top-24 left-60 z-10 pointer-events-none">
        <div className="bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-lg px-3.5 py-2 shadow-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs font-mono">
            <span className="text-white font-bold block">
              OPENSTREETMAP REAL GEOGRAPHY: Boisar, Maharashtra
            </span>
            <span className="text-[10px] text-slate-400">
              Center: 19.7902325° N, 72.7657359° E · 768 Authentic OSM Ways
            </span>
          </div>
        </div>
      </div>

      {/* Switch to 3D Digital Twin Action Banner */}
      {onSwitchTo3D && (
        <div className="absolute top-24 right-8 z-20 pointer-events-auto">
          <button
            onClick={onSwitchTo3D}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-blue-900/40 border border-blue-400 transition-all hover:scale-105"
          >
            <span>ENTER 3D DIGITAL TWIN</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* Floating Map Navigation Controls */}
      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-[#111827]/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-[#111827]/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleRecenter}
          className="p-2 rounded-lg bg-[#111827]/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Recenter to Boisar"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Distinction Banner: Real Geography vs Simulated Infrastructure */}
      <div className="absolute bottom-6 left-60 z-10 pointer-events-none">
        <div className="bg-[#111827]/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-4 shadow-lg">
          <span className="text-sky-400 font-semibold">● Real OSM Roads & Geography</span>
          <span className="text-amber-400 font-semibold">● Simulated EVNEXUS Fleet & Grid</span>
        </div>
      </div>
    </div>
  );
}
