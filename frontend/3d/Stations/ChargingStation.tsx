'use client';

import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Station, Charger } from '../../types';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';

interface Props {
  station: Station;
}

interface ChargerUnitProps {
  charger: Charger;
  position: [number, number, number];
  stationId: string;
}

function ModularChargerUnit({ charger, position, stationId }: ChargerUnitProps) {
  const selectCharger = useDigitalTwinStore((s) => s.selectCharger);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isSelected = selectedObject?.type === 'charger' && selectedObject.id === charger.id;

  const pulseRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (charger.status === 'CHARGING' && pulseRef.current) {
      const t = Math.sin(state.clock.getElapsedTime() * 4);
      pulseRef.current.opacity = 0.65 + t * 0.35;
    }
  });

  const getStatusColor = (status: string) => {
    if (isSelected) return '#3b82f6';
    switch (status) {
      case 'AVAILABLE': return '#22c55e';
      case 'CHARGING':
      case 'OCCUPIED': return '#f59e0b';
      case 'FAULT': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const statusColor = getStatusColor(charger.status);

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        selectCharger(stationId, charger.id);
      }}
    >
      {/* Charger Pedestal Column */}
      <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.4]} />
        <meshStandardMaterial
          color={isSelected ? '#dbeafe' : '#1e293b'}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>

      {/* Front Interface Screen */}
      <mesh position={[0, 1.15, 0.21]}>
        <boxGeometry args={[0.38, 0.65, 0.02]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Status LED Accent Bar */}
      <mesh position={[0, 1.55, 0.22]}>
        <planeGeometry args={[0.34, 0.06]} />
        <meshBasicMaterial
          ref={pulseRef}
          color={statusColor}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Charging Cable holster */}
      <mesh position={[0.26, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function ChargingStation({ station }: Props) {
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);

  const isSelected = selectedObject?.type === 'station' && selectedObject.id === station.id;

  const availableCount = station.chargers.filter((c) => c.status === 'AVAILABLE').length;
  const faultCount = station.chargers.filter((c) => c.status === 'FAULT').length;
  const isBusy = availableCount === 0 && faultCount === 0;

  const bayOffsets = [-3.6, -1.2, 1.2, 3.6];

  return (
    <group
      position={[station.position.x, 0, station.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        selectStation(station.id);
      }}
    >
      {/* 1. Concrete Apron Base */}
      <mesh receiveShadow position={[0, 0.04, 0.5]}>
        <boxGeometry args={[14.8, 0.08, 10.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>

      {/* 2. Station Kiosk / Convenience Building */}
      <group position={[0, 2.2, -3.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14.0, 4.4, 3.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Roof Fascia */}
        <mesh position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[14.4, 0.3, 4.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>

        {/* Glass Front Windows */}
        <mesh position={[0, -0.4, 1.81]}>
          <planeGeometry args={[11.8, 2.2]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* 3. Solar Cantilever Canopy over Charging Bays */}
      <group position={[0, 4.2, 1.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14.0, 0.25, 4.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>

        {/* Photovoltaic Solar Glass Top */}
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[13.4, 0.04, 4.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.9} />
        </mesh>

        {/* Steel Structural Support Columns */}
        {[-6.2, 6.2].map((cx, cidx) => (
          <mesh key={`col-${cidx}`} position={[cx, -2.1, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 4.2, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* 4. Charging Pedestals */}
      {bayOffsets.map((bx, bidx) => {
        const ch = station.chargers[bidx];
        if (!ch) return null;
        return (
          <group key={ch.id} position={[bx, 0, 1.8]}>
            {/* Painted Parking Bay Markings */}
            <mesh position={[0, 0.05, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.0, 3.2]} />
              <meshBasicMaterial color="#0f172a" opacity={0.15} transparent />
            </mesh>
            {/* White Parking Stall Boundary Lines */}
            {[-1.0, 1.0].map((lx, lidx) => (
              <mesh key={`pl-${lidx}`} position={[lx, 0.055, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.08, 3.2]} />
                <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
              </mesh>
            ))}

            <ModularChargerUnit
              charger={ch}
              position={[0, 0, -1.2]}
              stationId={station.id}
            />
          </group>
        );
      })}

      {/* 5. Physical Waiting Queue Slots on Side Apron */}
      <group position={[5.2, 0, -3.2]}>
        {[0, 1, 2].map((qi) => (
          <mesh key={`qslot-${qi}`} position={[qi * 1.8, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.5, 2.8]} />
            <meshBasicMaterial color="#f59e0b" opacity={0.12} transparent />
          </mesh>
        ))}
      </group>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.8, 9.3, 36]} />
          <meshBasicMaterial color="#2563eb" transparent opacity={0.85} />
        </mesh>
      )}

      {/* 3D Floating Station Pin Badge */}
      <Html position={[0, 6.8, 0]} center distanceFactor={26} zIndexRange={[100, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            selectStation(station.id);
          }}
          className={`cursor-pointer px-2.5 py-1 rounded-full border backdrop-blur-md transition-all select-none text-[11px] font-semibold flex items-center gap-1.5 shadow-md ${
            faultCount > 0
              ? 'bg-red-600 text-white border-red-500 animate-pulse'
              : isBusy
              ? 'bg-amber-600 text-white border-amber-500'
              : isSelected
              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-300'
              : 'bg-slate-900/90 text-slate-100 border-slate-700 hover:border-blue-400'
          }`}
        >
          <span>⚡</span>
          <span>{station.code}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30">
            {availableCount}/{station.chargers.length} Free
          </span>
          {station.queue.length > 0 && (
            <span className="text-[10px] text-amber-300 font-mono">
              (Q: {station.queue.length})
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}
