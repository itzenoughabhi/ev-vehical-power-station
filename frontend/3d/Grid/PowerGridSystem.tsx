'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';

function PylonTowerModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/city/signal_tower.glb');
  return (
    <group position={position} scale={[0.25, 0.25, 0.25]}>
      <Clone object={scene} castShadow />
    </group>
  );
}

function PowerBoxModel({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/stations/power_box.glb');
  return (
    <group position={position} rotation={rotation} scale={[0.8, 0.8, 0.8]}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  );
}

/**
 * Animated subtle energy pulses flowing along utility feeder lines.
 */
function FeederEnergyPulse({ points, color, speed = 1.0 }: { points: [number, number, number][]; color: string; speed?: number }) {
  const pulseSphereRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const v3s = points.map(p => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(v3s);
  }, [points]);

  useFrame((state) => {
    if (!pulseSphereRef.current || !curve) return;
    const t = (state.clock.getElapsedTime() * 0.25 * speed) % 1;
    const pt = curve.getPointAt(t);
    pulseSphereRef.current.position.copy(pt);
  });

  return (
    <>
      {/* Static thin line */}
      <Line
        points={points}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.65}
      />
      {/* Moving energy pulse beacon */}
      <mesh ref={pulseSphereRef}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </>
  );
}

export function PowerGridSystem() {
  const powerGrid = useDigitalTwinStore((s) => s.powerGrid);
  const selectGrid = useDigitalTwinStore((s) => s.selectGrid);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isGridOverlayActive = useDigitalTwinStore((s) => s.isGridOverlayActive);

  const isSelected = selectedObject?.type === 'grid';
  const isOverloaded = powerGrid?.status === 'OVERLOAD_RISK' || (powerGrid?.loadPercentage ?? 0) > 85;

  const statusColor = isOverloaded ? '#ef4444' : (powerGrid?.loadPercentage ?? 68) > 75 ? '#f59e0b' : '#10b981';

  // Feeder transmission line corridors from Substation GRID-S01 [-48, 0, -65]
  const feederLines = useMemo(() => {
    return [
      // Feeder 1: Substation -> Boisar Central Hub A102 [-6, 0, -18]
      {
        id: 'fdr-a102',
        color: statusColor,
        points: [
          [-48, 6.2, -65] as [number, number, number],
          [-30, 6.2, -45] as [number, number, number],
          [-16, 5.8, -28] as [number, number, number],
          [-6, 4.2, -18] as [number, number, number],
        ],
      },
      // Feeder 2: Substation -> Navapur Road Hub B104 [-48, 0, -28]
      {
        id: 'fdr-b104',
        color: statusColor,
        points: [
          [-48, 6.2, -65] as [number, number, number],
          [-48, 6.2, -48] as [number, number, number],
          [-48, 5.0, -36] as [number, number, number],
          [-48, 4.2, -28] as [number, number, number],
        ],
      },
      // Feeder 3: Substation -> Tarapur MIDC Industrial Hub C201 [-48, 0, 22]
      {
        id: 'fdr-c201',
        color: statusColor,
        points: [
          [-48, 6.2, -65] as [number, number, number],
          [-48, 6.2, -20] as [number, number, number],
          [-48, 5.8, 4] as [number, number, number],
          [-48, 4.2, 22] as [number, number, number],
        ],
      },
      // Feeder 4: Substation -> S03 Service Center [-28, 0, 54]
      {
        id: 'fdr-s03',
        color: statusColor,
        points: [
          [-48, 6.2, -65] as [number, number, number],
          [-38, 6.0, -25] as [number, number, number],
          [-30, 5.8, 18] as [number, number, number],
          [-28, 4.2, 54] as [number, number, number],
        ],
      },
      // Feeder 5: Substation -> Betegaon & Saravali Domestic Grid
      {
        id: 'fdr-res',
        color: statusColor,
        points: [
          [-48, 6.2, -65] as [number, number, number],
          [-10, 6.2, -40] as [number, number, number],
          [20, 6.0, -10] as [number, number, number],
          [48, 4.8, 30] as [number, number, number],
        ],
      },
    ];
  }, [statusColor]);

  const subPos = powerGrid?.position || { x: -48, y: 0, z: -65 };

  return (
    <group name="PowerGridSystem">
      {/* 1. GRID-S01 Boisar Distribution Substation Compound */}
      <group
        position={[subPos.x, 0, subPos.z]}
        onClick={(e) => {
          e.stopPropagation();
          selectGrid();
        }}
      >
        {/* Concrete Substation Pad */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[16.0, 0.16, 14.0]} />
          <meshStandardMaterial color="#64748b" roughness={0.85} />
        </mesh>

        {/* High Voltage Transformer Units (Main Power Transformer bank) */}
        {[-3.5, 0, 3.5].map((tx, idx) => (
          <group key={`tx-${idx}`} position={[tx, 1.4, -2.5]}>
            {/* Transformer Oil Tank */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.2, 2.6, 2.8]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.3} />
            </mesh>
            {/* Cooling Fin Radiators */}
            {[-1.2, 1.2].map((fx, fidx) => (
              <mesh key={`fin-${fidx}`} position={[fx, 0, 0]}>
                <boxGeometry args={[0.2, 2.2, 2.6]} />
                <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
              </mesh>
            ))}
            {/* High Voltage Bushings / Ceramic Insulators */}
            {[-0.6, 0, 0.6].map((bx, bidx) => (
              <mesh key={`bushing-${bidx}`} position={[bx, 1.7, 0]}>
                <cylinderGeometry args={[0.12, 0.16, 0.9, 8]} />
                <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.7} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Transmission Pylons inside Substation Compound */}
        <Suspense fallback={null}>
          <PylonTowerModel position={[-5.5, 0, 4.0]} />
          <PylonTowerModel position={[5.5, 0, 4.0]} />
        </Suspense>

        {/* Power Boxes / Control Panels */}
        <Suspense fallback={null}>
          <PowerBoxModel position={[-4.5, 0.1, 1.5]} rotation={[0, 0, 0]} />
          <PowerBoxModel position={[-2.5, 0.1, 1.5]} rotation={[0, 0, 0]} />
          <PowerBoxModel position={[2.5, 0.1, 1.5]} rotation={[0, Math.PI, 0]} />
        </Suspense>

        {/* Substation Control Room / Switchgear Building */}
        <mesh position={[0, 1.8, 4.5]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 3.4, 3.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.55, 4.5]}>
          <boxGeometry args={[7.6, 0.2, 3.6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Substation Perimeter Security Fence */}
        <mesh position={[0, 0.8, -6.8]}>
          <boxGeometry args={[15.6, 1.6, 0.08]} />
          <meshStandardMaterial color="#94a3b8" wireframe={true} />
        </mesh>
        <mesh position={[0, 0.8, 6.8]}>
          <boxGeometry args={[15.6, 1.6, 0.08]} />
          <meshStandardMaterial color="#94a3b8" wireframe={true} />
        </mesh>
        <mesh position={[-7.8, 0.8, 0]}>
          <boxGeometry args={[0.08, 1.6, 13.6]} />
          <meshStandardMaterial color="#94a3b8" wireframe={true} />
        </mesh>
        <mesh position={[7.8, 0.8, 0]}>
          <boxGeometry args={[0.08, 1.6, 13.6]} />
          <meshStandardMaterial color="#94a3b8" wireframe={true} />
        </mesh>

        {/* Selection Ring */}
        {isSelected && (
          <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[9.5, 10.0, 36]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Floating 3D Substation Badge */}
        <Html position={[0, 7.5, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              selectGrid();
            }}
            className={`cursor-pointer px-2.5 py-1 rounded-full border backdrop-blur-md transition-all select-none text-[11px] font-semibold flex items-center gap-1.5 shadow-md ${
              isOverloaded
                ? 'bg-red-600 text-white border-red-500 animate-pulse ring-2 ring-red-400'
                : isSelected
                ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-300'
                : 'bg-slate-900/90 text-slate-100 border-slate-700 hover:border-sky-400'
            }`}
          >
            <span>⚡</span>
            <span>GRID-S01 Boisar Substation</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30">
              {powerGrid?.loadPercentage ?? 68}%
            </span>
          </div>
        </Html>
      </group>

      {/* 2. Feeder Corridors & Animated Energy Flow (Substation -> Feeders -> Stations & Homes) */}
      {(isGridOverlayActive || isSelected || isOverloaded) && (
        <group name="EnergyFeeders">
          {feederLines.map((fl) => (
            <FeederEnergyPulse
              key={fl.id}
              points={fl.points}
              color={fl.color}
              speed={isOverloaded ? 2.5 : 1.2}
            />
          ))}
        </group>
      )}
    </group>
  );
}
