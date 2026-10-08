'use client';

import React, { useMemo, Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { Trees } from './Trees';
import { Mandir3D } from './Mandir3D';
import { Market3D } from './Market3D';
import { Hospital3D } from './Hospital3D';
import { Mall3D } from './Mall3D';

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

  React.useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.geometry && !child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }
    });
  }, [scene]);

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

/**
 * Authentic Palghar District Architectural Anchors
 * Expanded across all regional corridors:
 * - Central Boisar Heritage & Town Centre
 * - Betegaon Residential Township & Saravali
 * - Tarapur MIDC Heavy Industrial Estate
 * - Palghar District Administrative Capital (South)
 * - Manor NH-48 Express Gateway (East)
 * - Dahanu North Gateway & Agro Belt (North)
 * - Tarapur Coastal Energy & Marine Zone (West)
 */
const BOISAR_LANDMARKS = [
  // 1. PALGHAR DISTRICT ADMINISTRATIVE CAPITAL (South Corridor Z: 185 to 220 near P401)
  { path: '/models/city/skyscraper.glb', pos: [24, 0, 195] as [number, number, number], rot: [0, -Math.PI / 4, 0] as [number, number, number], scale: 0.88 },
  { path: '/models/city/skyscraper.glb', pos: [85, 0, 215] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 0.72 },
  { path: '/models/city/apartment_building.glb', pos: [115, 0, 185] as [number, number, number], rot: [0, 0, 0] as [number, number, number], scale: 0.55 },

  // 2. SHIRGAON HISTORIC COASTAL FORT & BEACH PROMENADE (South-West Coast near S801)
  { path: '/models/city/large_building.glb', pos: [-60, 0, 230] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 3.2 },
  { path: '/models/city/townhouse.glb', pos: [-85, 0, 235] as [number, number, number], rot: [0, -0.3, 0] as [number, number, number], scale: 1.25 },
  { path: '/models/city/house.glb', pos: [-110, 0, 210] as [number, number, number], rot: [0, 0.2, 0] as [number, number, number], scale: 0.24 },

  // 3. MANOR NH-48 EXPRESS TRANSIT GATEWAY (East Expressway X: 180 to 220 near M501)
  { path: '/models/city/hotel.glb', pos: [218, 0, -50] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number], scale: 2.2 },
  { path: '/models/city/large_building.glb', pos: [185, 0, -55] as [number, number, number], rot: [0, 0.25, 0] as [number, number, number], scale: 4.2 },

  // 4. DAHANU NORTH ARTERIAL & AGRO GATEWAY (North Corridor Z: -200 to -235 near D701)
  { path: '/models/city/apartment_building.glb', pos: [60, 0, -205] as [number, number, number], rot: [0, Math.PI / 3, 0] as [number, number, number], scale: 0.55 },
  { path: '/models/city/townhouse.glb', pos: [75, 0, -235] as [number, number, number], rot: [0, 0.5, 0] as [number, number, number], scale: 1.30 },

  // 5. BOISAR TOWN CENTRE & COMMERCIAL PROMENADE (North-East commercial sector)
  { path: '/models/city/hotel.glb', pos: [52, 0, -62] as [number, number, number], rot: [0, -Math.PI / 3, 0] as [number, number, number], scale: 2.2 },

  // 6. BETEGAON RESIDENTIAL TOWNSHIP & GREEN ENCLAVE (Spaced 30-40m apart along East parklands)
  { path: '/models/city/townhouse.glb', pos: [72, 0, 38] as [number, number, number], rot: [0, -0.6, 0] as [number, number, number], scale: 1.30 },
  { path: '/models/city/house.glb', pos: [95, 0, 48] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 0.22 },
  { path: '/models/city/apartment.glb', pos: [74, 0, 76] as [number, number, number], rot: [0, 0.5, 0] as [number, number, number], scale: 0.55 },

  // 7. TARAPUR MIDC HEAVY CHEMICAL & INDUSTRIAL ESTATE (Set back 20-40m West in Industrial Zone)
  { path: '/models/city/science_centre.glb', pos: [-58, 0, 2] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 0.55 },
  { path: '/models/city/large_building.glb', pos: [-82, 0, 24] as [number, number, number], rot: [0, -Math.PI / 4, 0] as [number, number, number], scale: 4.8 },

  // 8. TARAPUR COASTAL ENERGY & TELECOM CORRIDOR (West Coast X: -105 to -115 near T601)
  { path: '/models/city/signal_tower.glb', pos: [-115, 0, -10] as [number, number, number], rot: [0, 0, 0] as [number, number, number], scale: 0.50 },
  { path: '/models/city/townhouse.glb', pos: [-105, 0, -55] as [number, number, number], rot: [0, 0.35, 0] as [number, number, number], scale: 1.20 },
];

export function Buildings() {
  // Industrial sheds & logistics hubs in Tarapur MIDC Zone & Manor Corridor (Widely distributed across industrial sector)
  const midcIndustrialSheds = useMemo(() => [
    { pos: [-65, 0, 55], size: [10.5, 5.4, 12.0], rot: 0.2 },
    { pos: [-96, 0, 45], size: [11.0, 5.8, 13.0], rot: -0.3 },
    { pos: [-92, 0, 10], size: [9.5, 4.8, 10.5], rot: 0.15 },
    { pos: [-62, 0, -112], size: [9.0, 5.0, 11.0], rot: -0.4 },
    { pos: [162, 0, -45], size: [10.0, 5.2, 11.5], rot: 0.1 },
  ], []);

  // Maharashtra Clay-Tile Roof Residential Enclaves (Spaced far into Betegaon Outer Green Fringe)
  const residentialBlocks = useMemo(() => [
    { pos: [118, 0, 30], size: [5.5, 3.8, 5.8], color: '#f8fafc', roofColor: '#b45309' },
    { pos: [125, 0, 55], size: [5.6, 4.2, 5.8], color: '#f1f5f9', roofColor: '#c2410c' },
    { pos: [98, 0, 80], size: [5.8, 4.0, 6.2], color: '#e2e8f0', roofColor: '#9a3412' },
  ], []);

  return (
    <group name="BoisarUrbanEnvironment">
      {/* 1. Realistic GLB Architectural Landmarks Expanded Across Palghar District */}
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

      {/* 2. WareTrack Modern Logistics Warehouses (Clean White Walls, Royal Blue Portal & Trim) */}
      {midcIndustrialSheds.map((shed, i) => (
        <group key={`shed-${i}`} position={[shed.pos[0], shed.size[1] / 2, shed.pos[2]]} rotation={[0, shed.rot, 0]}>
          {/* Main Clean White Warehouse Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[shed.size[0], shed.size[1], shed.size[2]]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
          </mesh>

          {/* WareTrack Royal Blue Fascia Roof Band */}
          <mesh position={[0, shed.size[1] / 2 + 0.2, 0]} castShadow>
            <boxGeometry args={[shed.size[0] * 1.02, 0.45, shed.size[2] * 1.02]} />
            <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.2} />
          </mesh>

          {/* Flat Clean White Roof Top */}
          <mesh position={[0, shed.size[1] / 2 + 0.45, 0]}>
            <boxGeometry args={[shed.size[0] * 0.98, 0.1, shed.size[2] * 0.98]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>

          {/* Royal Blue Loading Bay Entrance Portal on Front Face */}
          <group position={[0, -shed.size[1] / 2 + 1.8, shed.size[2] / 2 + 0.08]}>
            {/* Blue Portal Surround */}
            <mesh castShadow>
              <boxGeometry args={[shed.size[0] * 0.65, 3.6, 0.25]} />
              <meshStandardMaterial color="#2563eb" roughness={0.3} />
            </mesh>

            {/* Roll-up Dock Doors (Dual bays) */}
            {[-shed.size[0] * 0.18, shed.size[0] * 0.18].map((dx, didx) => (
              <group key={`dock-${didx}`} position={[dx, -0.2, 0.14]}>
                <mesh>
                  <boxGeometry args={[shed.size[0] * 0.24, 2.8, 0.05]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.4} />
                </mesh>
                {/* Yellow Hazard Strip */}
                <mesh position={[0, -1.35, 0.03]}>
                  <boxGeometry args={[shed.size[0] * 0.25, 0.12, 0.02]} />
                  <meshStandardMaterial color="#f59e0b" roughness={0.4} />
                </mesh>
              </group>
            ))}
          </group>

          {/* Panoramic Tinted Blue Glass Windows on Upper Level */}
          <mesh position={[0, shed.size[1] * 0.22, shed.size[2] / 2 + 0.02]}>
            <planeGeometry args={[shed.size[0] * 0.7, 1.4]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.85} />
          </mesh>

          {/* Roof AC Units / Ventilation */}
          <mesh position={[shed.size[0] * 0.25, shed.size[1] / 2 + 0.8, -shed.size[2] * 0.2]} castShadow>
            <boxGeometry args={[1.8, 0.6, 1.4]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 3. Betegaon & Saravali Traditional Residential Row Houses */}
      {residentialBlocks.map((res, i) => (
        <group key={`res-${i}`} position={[res.pos[0], res.size[1] / 2, res.pos[2]]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[res.size[0], res.size[1], res.size[2]]} />
            <meshStandardMaterial color={res.color} roughness={0.4} />
          </mesh>
          {/* Terracotta Clay Tile Roof (Maharashtra residential style) */}
          <mesh position={[0, res.size[1] / 2 + 0.4, 0]} castShadow>
            <boxGeometry args={[res.size[0] * 1.05, 0.6, res.size[2] * 1.05]} />
            <meshStandardMaterial color={res.roofColor} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 4. Natural Green Belts & Roadside Trees Distributed Across Corridors */}
      <Trees />

      {/* 5. Authentic Indian Civic Landmarks Placed in Dedicated Open District Precincts */}
      {/* Shri Ram Mandir: Peaceful, secluded Eastern Heritage Sanctuary with expansive sacred gardens */}
      <Mandir3D position={[95, 0, 12]} rotation={[0, -Math.PI / 4, 0]} />

      {/* Boisar Station Bazaar: Northwest pedestrian market promenade */}
      <Market3D position={[-36, 0, -82]} rotation={[0, -0.35, 0]} />

      {/* Multi-Specialty Hospital: Dedicated northern healthcare & trauma campus on Dahanu Highway */}
      <Hospital3D position={[58, 0, -118]} rotation={[0, Math.PI / 2, 0]} />

      {/* Grand Central Mall: West commercial gateway shopping plaza */}
      <Mall3D position={[-86, 0, -75]} rotation={[0, 0.25, 0]} />
    </group>
  );
}
