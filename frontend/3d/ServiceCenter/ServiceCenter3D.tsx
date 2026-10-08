'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';

export function ServiceCenter3D() {
  const serviceCenter = useDigitalTwinStore((s) => s.serviceCenter);
  const selectServiceCenter = useDigitalTwinStore((s) => s.selectServiceCenter);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);

  const isSelected = selectedObject?.type === 'service';
  const pos = serviceCenter?.position || { x: -28, y: 0, z: 54 };
  const bayOffsets = [-4.8, -1.6, 1.6, 4.8];

  return (
    <group
      position={[pos.x, 0, pos.z]}
      onClick={(e) => {
        e.stopPropagation();
        selectServiceCenter();
      }}
    >
      {/* 1. Heavy Industrial Concrete Apron Base — Crisp Pale White/Grey */}
      <mesh receiveShadow position={[0, 0.04, 0.5]}>
        <boxGeometry args={[18.4, 0.08, 14.0]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* 2. Main Service Building Structure — WareTrack Crisp White & Royal Blue Trim */}
      <group position={[0, 2.8, -3.2]}>
        {/* Main Service Hangar Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[17.6, 5.6, 5.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
        </mesh>

        {/* WareTrack Royal Blue Roof Fascia Trim */}
        <mesh position={[0, 2.9, 0]} castShadow>
          <boxGeometry args={[18.0, 0.35, 6.2]} />
          <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <boxGeometry args={[16.8, 0.05, 5.2]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
        </mesh>

        {/* Front Workshop Bay Doors (4 Repair Bays) */}
        {bayOffsets.map((bx, bidx) => {
          const bay = serviceCenter?.bays?.[bidx];
          const isOccupied = bay?.status === 'OCCUPIED';

          return (
            <group key={`bay-${bidx}`} position={[bx, -0.6, 2.92]}>
              {/* Roll-up Service Bay Door */}
              <mesh castShadow>
                <boxGeometry args={[2.7, 3.8, 0.08]} />
                <meshStandardMaterial
                  color={isOccupied ? '#94a3b8' : '#f8fafc'}
                  roughness={0.4}
                />
              </mesh>

              {/* Bay Number Sign */}
              <mesh position={[0, 2.2, 0.05]}>
                <boxGeometry args={[1.2, 0.35, 0.04]} />
                <meshStandardMaterial color="#2563eb" />
              </mesh>

              {/* Yellow Caution Threshold Strip */}
              <mesh position={[0, -1.85, 0.1]}>
                <boxGeometry args={[2.8, 0.12, 0.15]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.4} />
              </mesh>

              {/* Bay Status Indicator Lamp */}
              <mesh position={[0, 2.5, 0.08]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshBasicMaterial color={isOccupied ? '#ef4444' : '#22c55e'} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 3. Diagnostic & Battery Service Annex (Side Office) */}
      <group position={[10.5, 1.8, -2.0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2, 3.6, 6.0]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[3.4, 0.2, 6.2]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
        {/* Glass Windows */}
        <mesh position={[-1.61, 0, 0]}>
          <planeGeometry args={[0.02, 1.8]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.12} metalness={0.85} />
        </mesh>
      </group>

      {/* 4. Service Center Canopy over repair aprons — WareTrack Royal Blue */}
      <group position={[0, 4.6, 1.8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[17.6, 0.25, 4.6]} />
          <meshStandardMaterial color="#2563eb" roughness={0.3} />
        </mesh>
        {/* Crisp White/Silver Support Pillars */}
        {[-8.2, 8.2].map((cx, cidx) => (
          <mesh key={`col-${cidx}`} position={[cx, -2.3, 1.8]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 4.6, 12]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[10.5, 11.0, 36]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.85} />
        </mesh>
      )}

      {/* Floating 3D Badge */}
      <Html position={[0, 7.8, 0]} center distanceFactor={26} zIndexRange={[100, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            selectServiceCenter();
          }}
          className={`cursor-pointer px-2.5 py-1 rounded-full border backdrop-blur-md transition-all select-none text-[11px] font-semibold flex items-center gap-1.5 shadow-md ${
            isSelected
              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-300'
              : 'bg-slate-900/90 text-slate-100 border-slate-700 hover:border-blue-400'
          }`}
        >
          <span>🔧</span>
          <span>S03 EV Service Center</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30">
            {serviceCenter?.availableBays ?? 2} Bays Free
          </span>
        </div>
      </Html>
    </group>
  );
}
