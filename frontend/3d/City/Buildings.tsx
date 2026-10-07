'use client';

import React, { useMemo, Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { Trees } from './Trees';

function ScaledGLBModel({
  path,
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
}: {
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(path);
  return (
    <group position={position} rotation={rotation}>
      <Clone
        object={scene}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Realistic Boisar architectural anchors
const BOISAR_LANDMARKS = [
  // 1. Tarapur MIDC Heavy Chemical & Industrial Plant (West)
  { path: '/models/city/science_centre.glb', pos: [-34, 0, -2] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 0.8 },
  // 2. Tarapur MIDC Manufacturing Complex
  { path: '/models/city/large_building.glb', pos: [-44, 0, 8] as [number, number, number], rot: [0, -Math.PI / 4, 0] as [number, number, number], scale: 1.1 },
  // 3. Boisar Commercial Hub / Railway Market
  { path: '/models/city/hotel.glb', pos: [10, 0, -12] as [number, number, number], rot: [0, -Math.PI / 3, 0] as [number, number, number], scale: 1.0 },
  // 4. Boisar District Hospital
  { path: '/models/city/hospital.glb', pos: [2, 0, -26] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], scale: 1.1 },
  // 5. Saravali Logistics & Housing Colony
  { path: '/models/city/apartment.glb', pos: [12, 0, 36] as [number, number, number], rot: [0, 0.5, 0] as [number, number, number], scale: 0.38 },
  // 6. Betegaon Residential Township
  { path: '/models/city/townhouse.glb', pos: [32, 0, 4] as [number, number, number], rot: [0, -0.6, 0] as [number, number, number], scale: 0.9 },
  // 7. Betegaon Apartments
  { path: '/models/city/apartment_building.glb', pos: [38, 0, -22] as [number, number, number], rot: [0, Math.PI / 3, 0] as [number, number, number], scale: 0.4 },
];

export function Buildings() {
  // Industrial sheds & factories in Tarapur MIDC Zone
  const midcIndustrialSheds = useMemo(() => [
    { pos: [-24, 0, 18], size: [8.5, 5.2, 10.2], rot: 0.2 },
    { pos: [-48, 0, 30], size: [10.2, 5.8, 12.0], rot: -0.3 },
    { pos: [-54, 0, -4], size: [7.8, 4.6, 9.4], rot: 0.15 },
    { pos: [-38, 0, -28], size: [9.0, 5.0, 11.0], rot: -0.4 },
  ], []);

  // Residential row houses in Betegaon / Saravali
  const residentialBlocks = useMemo(() => [
    { pos: [22, 0, 6], size: [5.2, 3.8, 5.8], color: '#f8fafc', roofColor: '#b45309' },
    { pos: [30, 0, -2], size: [5.4, 4.2, 5.6], color: '#f1f5f9', roofColor: '#c2410c' },
    { pos: [20, 0, 42], size: [5.6, 4.0, 6.0], color: '#e2e8f0', roofColor: '#9a3412' },
    { pos: [38, 0, 38], size: [6.2, 4.4, 6.4], color: '#f8fafc', roofColor: '#b45309' },
  ], []);

  return (
    <group name="BoisarUrbanEnvironment">
      {/* 1. Realistic GLB Architectural Landmarks */}
      <Suspense fallback={null}>
        {BOISAR_LANDMARKS.map((b, idx) => (
          <ScaledGLBModel
            key={`landmark-${idx}`}
            path={b.path}
            position={b.pos}
            rotation={b.rot}
            scale={b.scale}
          />
        ))}
      </Suspense>

      {/* 2. Tarapur MIDC Industrial Sheds & Warehouses (Corrugated steel & factory roofs) */}
      {midcIndustrialSheds.map((shed, i) => (
        <group key={`shed-${i}`} position={[shed.pos[0], shed.size[1] / 2, shed.pos[2]]} rotation={[0, shed.rot, 0]}>
          {/* Warehouse Main Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[shed.size[0], shed.size[1], shed.size[2]]} />
            <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Corrugated Gabled Roof */}
          <mesh position={[0, shed.size[1] / 2 + 0.6, 0]} castShadow>
            <boxGeometry args={[shed.size[0] * 1.04, 0.4, shed.size[2] * 1.04]} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* Industrial Vent / Chimney */}
          <mesh position={[shed.size[0] * 0.3, shed.size[1] / 2 + 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 2.4, 8]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* 3. Saravali & Betegaon Indian Residential Row Houses */}
      {residentialBlocks.map((res, i) => (
        <group key={`res-${i}`} position={[res.pos[0], res.size[1] / 2, res.pos[2]]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[res.size[0], res.size[1], res.size[2]]} />
            <meshStandardMaterial color={res.color} roughness={0.4} />
          </mesh>
          {/* Terracotta Clay Tile Roof (Typical Maharashtra residential style) */}
          <mesh position={[0, res.size[1] / 2 + 0.4, 0]} castShadow>
            <boxGeometry args={[res.size[0] * 1.05, 0.6, res.size[2] * 1.05]} />
            <meshStandardMaterial color={res.roofColor} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 4. Natural Green Belts & Roadside Trees */}
      <Trees />
    </group>
  );
}
