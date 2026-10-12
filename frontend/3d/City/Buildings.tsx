'use client';

import React, { useMemo, Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { Trees } from './Trees';
import { Mandir3D } from './Mandir3D';
import { Market3D } from './Market3D';
import { Hospital3D } from './Hospital3D';
import { Mall3D } from './Mall3D';

const ScaledGLBModel = React.memo(function ScaledGLBModel({
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
});

const BOISAR_LANDMARKS = [
  { path: '/models/city/skyscraper.glb', pos: [24, 0, 195] as [number, number, number], rot: [0, -Math.PI / 4, 0] as [number, number, number], scale: 0.88 },
  { path: '/models/city/skyscraper.glb', pos: [98, 0, 215] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 0.72 },
  { path: '/models/city/apartment_building.glb', pos: [120, 0, 185] as [number, number, number], rot: [0, 0, 0] as [number, number, number], scale: 0.55 },

  { path: '/models/city/large_building.glb', pos: [-60, 0, 230] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 3.2 },
  { path: '/models/city/townhouse.glb', pos: [-85, 0, 235] as [number, number, number], rot: [0, -0.3, 0] as [number, number, number], scale: 1.25 },
  { path: '/models/city/house.glb', pos: [-128, 0, 215] as [number, number, number], rot: [0, 0.2, 0] as [number, number, number], scale: 0.24 },

  { path: '/models/city/hotel.glb', pos: [218, 0, -50] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number], scale: 2.2 },
  { path: '/models/city/large_building.glb', pos: [185, 0, -55] as [number, number, number], rot: [0, 0.25, 0] as [number, number, number], scale: 4.2 },

  { path: '/models/city/apartment_building.glb', pos: [60, 0, -205] as [number, number, number], rot: [0, Math.PI / 3, 0] as [number, number, number], scale: 0.55 },
  { path: '/models/city/townhouse.glb', pos: [78, 0, -235] as [number, number, number], rot: [0, 0.5, 0] as [number, number, number], scale: 1.30 },

  { path: '/models/city/hotel.glb', pos: [52, 0, -62] as [number, number, number], rot: [0, -Math.PI / 3, 0] as [number, number, number], scale: 2.2 },

  { path: '/models/city/townhouse.glb', pos: [72, 0, 38] as [number, number, number], rot: [0, -0.6, 0] as [number, number, number], scale: 1.30 },
  { path: '/models/city/house.glb', pos: [95, 0, 48] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 0.22 },
  { path: '/models/city/apartment.glb', pos: [82, 0, 85] as [number, number, number], rot: [0, 0.5, 0] as [number, number, number], scale: 0.55 },

  { path: '/models/city/science_centre.glb', pos: [-58, 0, 2] as [number, number, number], rot: [0, 0.4, 0] as [number, number, number], scale: 0.55 },
  { path: '/models/city/large_building.glb', pos: [-82, 0, 24] as [number, number, number], rot: [0, -Math.PI / 4, 0] as [number, number, number], scale: 4.8 },

  { path: '/models/city/signal_tower.glb', pos: [-115, 0, -10] as [number, number, number], rot: [0, 0, 0] as [number, number, number], scale: 0.50 },
  { path: '/models/city/townhouse.glb', pos: [-105, 0, -55] as [number, number, number], rot: [0, 0.35, 0] as [number, number, number], scale: 1.20 },
];

export function Buildings() {
  const midcIndustrialSheds = useMemo(() => [
    { pos: [-65, 0, 55], size: [10.5, 5.4, 12.0], rot: 0.2 },
    { pos: [-96, 0, 45], size: [11.0, 5.8, 13.0], rot: -0.3 },
    { pos: [-92, 0, 10], size: [9.5, 4.8, 10.5], rot: 0.15 },
    { pos: [-62, 0, -112], size: [9.0, 5.0, 11.0], rot: -0.4 },
    { pos: [162, 0, -45], size: [10.0, 5.2, 11.5], rot: 0.1 },
  ], []);

  const residentialBlocks = useMemo(() => [
    { pos: [118, 0, 30], size: [5.5, 3.8, 5.8], color: '#f8fafc', roofColor: '#b45309' },
    { pos: [125, 0, 55], size: [5.6, 4.2, 5.8], color: '#f1f5f9', roofColor: '#c2410c' },
    { pos: [98, 0, 80], size: [5.8, 4.0, 6.2], color: '#e2e8f0', roofColor: '#9a3412' },
  ], []);

  return (
    <group name="BoisarUrbanEnvironment">
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

      {midcIndustrialSheds.map((shed, i) => (
        <group key={`shed-${i}`} position={[shed.pos[0], shed.size[1] / 2, shed.pos[2]]} rotation={[0, shed.rot, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[shed.size[0], shed.size[1], shed.size[2]]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
          </mesh>

          <mesh position={[0, shed.size[1] / 2 + 0.2, 0]} castShadow>
            <boxGeometry args={[shed.size[0] * 1.02, 0.45, shed.size[2] * 1.02]} />
            <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.2} />
          </mesh>

          <mesh position={[0, shed.size[1] / 2 + 0.45, 0]}>
            <boxGeometry args={[shed.size[0] * 0.98, 0.1, shed.size[2] * 0.98]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>

          <group position={[0, -shed.size[1] / 2 + 1.8, shed.size[2] / 2 + 0.08]}>
            <mesh castShadow>
              <boxGeometry args={[shed.size[0] * 0.65, 3.6, 0.25]} />
              <meshStandardMaterial color="#2563eb" roughness={0.3} />
            </mesh>

            {[-shed.size[0] * 0.18, shed.size[0] * 0.18].map((dx, didx) => (
              <group key={`dock-${didx}`} position={[dx, -0.2, 0.14]}>
                <mesh>
                  <boxGeometry args={[shed.size[0] * 0.24, 2.8, 0.05]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.4} />
                </mesh>
                <mesh position={[0, -1.35, 0.03]}>
                  <boxGeometry args={[shed.size[0] * 0.25, 0.12, 0.02]} />
                  <meshStandardMaterial color="#f59e0b" roughness={0.4} />
                </mesh>
              </group>
            ))}
          </group>

          <mesh position={[0, shed.size[1] * 0.22, shed.size[2] / 2 + 0.02]}>
            <planeGeometry args={[shed.size[0] * 0.7, 1.4]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.85} />
          </mesh>

          <mesh position={[shed.size[0] * 0.25, shed.size[1] / 2 + 0.8, -shed.size[2] * 0.2]} castShadow>
            <boxGeometry args={[1.8, 0.6, 1.4]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {residentialBlocks.map((res, i) => (
        <group key={`res-${i}`} position={[res.pos[0], res.size[1] / 2, res.pos[2]]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[res.size[0], res.size[1], res.size[2]]} />
            <meshStandardMaterial color={res.color} roughness={0.4} />
          </mesh>
          <mesh position={[0, res.size[1] / 2 + 0.4, 0]} castShadow>
            <boxGeometry args={[res.size[0] * 1.05, 0.6, res.size[2] * 1.05]} />
            <meshStandardMaterial color={res.roofColor} roughness={0.6} />
          </mesh>
        </group>
      ))}

      <Trees />

      <Mandir3D position={[95, 0, 12]} rotation={[0, -Math.PI / 4, 0]} />

      <Market3D position={[-36, 0, -82]} rotation={[0, -0.35, 0]} />

      <Hospital3D position={[58, 0, -118]} rotation={[0, Math.PI / 2, 0]} />

      <Mall3D position={[-86, 0, -75]} rotation={[0, 0.25, 0]} />
    </group>
  );
}
