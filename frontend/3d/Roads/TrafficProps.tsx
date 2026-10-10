'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PropTransform {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const CANDIDATE_TRAFFIC_PROP_PATHS = [
  '/models/city/traffic_props.glb',
  '/models/city/construction_props.glb',
  '/models/city/traffic.glb',
  '/models/city/props.glb',
  '/models/city/cones.glb',
];

function CustomGLBProp({ path, position, rotation = [0, 0, 0], scale = 0.5 }: PropTransform & { path: string }) {
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

function ProceduralTrafficCone({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.38, 0.04, 0.38]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0, 0.42, 0]}>
        <coneGeometry args={[0.16, 0.8, 16]} />
        <meshStandardMaterial color="#ea580c" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.22, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

function ProceduralBarricade({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime() * 3;
      lightRef.current.intensity = (Math.sin(t) > 0.4) ? 0.8 : 0.05;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {[-0.6, 0.6].map((lx, idx) => (
        <group key={idx} position={[lx, 0.45, 0]}>
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.06, 0.9, 0.45]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      <mesh castShadow receiveShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[1.4, 0.22, 0.05]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[1.4, 0.18, 0.05]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.3} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.92, 0]} color="#f59e0b" distance={4} decay={2} intensity={0.5} />
    </group>
  );
}

export function TrafficProps() {
  const [activeGLBPath, setActiveGLBPath] = useState<string | null>(null);

  useEffect(() => {
    const checkModel = async () => {
      for (const p of CANDIDATE_TRAFFIC_PROP_PATHS) {
        try {
          const res = await fetch(p, { method: 'HEAD' });
          if (res.ok && res.status === 200) {
            setActiveGLBPath(p);
            break;
          }
        } catch (_) {}
      }
    };
    checkModel();
  }, []);

  const coneLocations: Array<{ pos: [number, number, number]; rot?: [number, number, number] }> = [
    { pos: [-20, 0.06, 17.2] },
    { pos: [-21.2, 0.06, 17.2] },
    { pos: [-22.4, 0.06, 17.2] },

    { pos: [18, 0.06, 27.2] },
    { pos: [19.2, 0.06, 27.2] },
    { pos: [20.4, 0.06, 27.2] },

    { pos: [12, 0.06, -37.8] },
    { pos: [14, 0.06, -37.8] },
    { pos: [16, 0.06, -37.8] },
    { pos: [18, 0.06, -37.8] },

    { pos: [-20, 0.06, -26.8] },
    { pos: [-21.5, 0.06, -26.8] },

    { pos: [-4.2, 0.06, 4.2], rot: [0, 0.4, 0] },
    { pos: [4.2, 0.06, -4.2], rot: [0, -0.4, 0] },
  ];

  const barricadeLocations: Array<{ pos: [number, number, number]; rot?: [number, number, number] }> = [
    { pos: [15, 0.06, -35.2], rot: [0, 0, 0] },
    
    { pos: [20, 0.06, -23.5], rot: [0, Math.PI / 2, 0] },

    { pos: [-35.5, 0.06, 12], rot: [0, 0, 0] },
  ];

  if (activeGLBPath) {
    return (
      <group name="CustomTrafficProps">
        <Suspense fallback={null}>
          {coneLocations.map((c, i) => (
            <CustomGLBProp
              key={`glb-c-${i}`}
              path={activeGLBPath}
              position={c.pos}
              rotation={c.rot || [0, 0, 0]}
              scale={0.4}
            />
          ))}
          {barricadeLocations.map((b, i) => (
            <CustomGLBProp
              key={`glb-b-${i}`}
              path={activeGLBPath}
              position={b.pos}
              rotation={b.rot || [0, 0, 0]}
              scale={0.5}
            />
          ))}
        </Suspense>
      </group>
    );
  }

  return (
    <group name="ProceduralTrafficProps">
      {coneLocations.map((c, i) => (
        <ProceduralTrafficCone key={`cone-${i}`} position={c.pos} rotation={c.rot} />
      ))}
      {barricadeLocations.map((b, i) => (
        <ProceduralBarricade key={`barr-${i}`} position={b.pos} rotation={b.rot} />
      ))}
    </group>
  );
}
