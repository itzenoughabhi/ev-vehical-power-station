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
      <Line
        points={points}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.65}
      />
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
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isGridOverlayActive = useDigitalTwinStore((s) => s.isGridOverlayActive);

  const isSelected = selectedObject?.type === 'grid';
  const isOverloaded = powerGrid?.status === 'OVERLOAD_RISK' || (powerGrid?.loadPercentage ?? 0) > 85;

  const statusColor = isOverloaded ? '#ef4444' : (powerGrid?.loadPercentage ?? 68) > 75 ? '#f59e0b' : '#10b981';

  const feederLines = useMemo(() => {
    return [
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
      <group
        position={[subPos.x, 0, subPos.z]}
        onClick={(e) => {
          e.stopPropagation();
          selectGrid();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[16.0, 0.16, 14.0]} />
          <meshStandardMaterial color="#64748b" roughness={0.85} />
        </mesh>

        {[-3.5, 0, 3.5].map((tx, idx) => (
          <group key={`tx-${idx}`} position={[tx, 1.4, -2.5]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.2, 2.6, 2.8]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.3} />
            </mesh>
            {[-1.2, 1.2].map((fx, fidx) => (
              <mesh key={`fin-${fidx}`} position={[fx, 0, 0]}>
                <boxGeometry args={[0.2, 2.2, 2.6]} />
                <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
              </mesh>
            ))}
            {[-0.6, 0, 0.6].map((bx, bidx) => (
              <mesh key={`bushing-${bidx}`} position={[bx, 1.7, 0]}>
                <cylinderGeometry args={[0.12, 0.16, 0.9, 8]} />
                <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.7} />
              </mesh>
            ))}
          </group>
        ))}

        <Suspense fallback={null}>
          <PylonTowerModel position={[-5.5, 0, 4.0]} />
          <PylonTowerModel position={[5.5, 0, 4.0]} />
        </Suspense>

        <Suspense fallback={null}>
          <PowerBoxModel position={[-4.5, 0.1, 1.5]} rotation={[0, 0, 0]} />
          <PowerBoxModel position={[-2.5, 0.1, 1.5]} rotation={[0, 0, 0]} />
          <PowerBoxModel position={[2.5, 0.1, 1.5]} rotation={[0, Math.PI, 0]} />
        </Suspense>

        <mesh position={[0, 1.8, 4.5]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 3.4, 3.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.55, 4.5]}>
          <boxGeometry args={[7.6, 0.2, 3.6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

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

        {isSelected && (
          <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[9.5, 10.0, 36]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
        )}

        {isSelected && (
          <Html position={[0, 7.5, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="select-none pointer-events-auto bg-slate-900/95 text-white border border-sky-500 rounded-2xl p-3 shadow-2xl backdrop-blur-md min-w-[220px]"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>⚡</span>
                  <span>{powerGrid?.substationName || 'GRID-S01 Distribution Substation'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="bg-slate-800/80 p-1.5 rounded">
                  <span className="text-slate-400 block text-[9px]">Capacity</span>
                  <span className="text-sky-400 font-bold">{powerGrid?.capacityMw ?? 5.0} MW</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded">
                  <span className="text-slate-400 block text-[9px]">Current Load</span>
                  <span className="text-emerald-400 font-bold">{powerGrid?.loadPercentage ?? 68}%</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>

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
