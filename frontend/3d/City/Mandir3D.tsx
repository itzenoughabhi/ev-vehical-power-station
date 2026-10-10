'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface MandirProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function Mandir3D({ position = [95, 0, 12], rotation = [0, 0, 0] }: MandirProps) {
  const flagRef = useRef<THREE.Mesh>(null);
  const bellRef = useRef<THREE.Group>(null);
  const [isSelected, setIsSelected] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 3.5) * 0.18 + 0.1;
      flagRef.current.rotation.z = Math.sin(t * 2.5) * 0.08;
    }
    if (bellRef.current) {
      bellRef.current.rotation.z = Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      name="BoisarShriRamMandir"
      onClick={(e) => {
        e.stopPropagation();
        setIsSelected(!isSelected);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[16.0, 0.1, 16.0]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[16.4, 0.08, 16.4]} />
        <meshStandardMaterial color="#c2410c" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.5, 0.5, 12.0]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.5, 0.3, 11.0]} />
        <meshStandardMaterial color="#fdba74" roughness={0.6} />
      </mesh>

      {[0, 1, 2, 3].map((step) => (
        <mesh key={`step-${step}`} position={[0, 0.12 + step * 0.15, 6.0 + step * 0.4]} receiveShadow castShadow>
          <boxGeometry args={[4.2, 0.15, 0.55]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} />
        </mesh>
      ))}

      <mesh position={[0, 2.5, -2.0]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 3.4, 6.8]} />
        <meshStandardMaterial color="#ffedd5" roughness={0.5} />
      </mesh>

      <mesh position={[0, 4.3, -2.0]} castShadow>
        <boxGeometry args={[7.2, 0.25, 7.2]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.2, -2.0]}>
        <boxGeometry args={[7.0, 0.18, 7.0]} />
        <meshStandardMaterial color="#d97706" roughness={0.5} />
      </mesh>

      {[
        { y: 4.8, size: 6.2, h: 0.8 },
        { y: 5.6, size: 5.2, h: 0.8 },
        { y: 6.4, size: 4.2, h: 0.8 },
        { y: 7.2, size: 3.2, h: 0.8 },
        { y: 7.9, size: 2.3, h: 0.6 },
        { y: 8.5, size: 1.5, h: 0.6 },
      ].map((tier, idx) => (
        <mesh key={`shikhara-${idx}`} position={[0, tier.y, -2.0]} castShadow receiveShadow>
          <boxGeometry args={[tier.size, tier.h, tier.size]} />
          <meshStandardMaterial color="#fdba74" roughness={0.55} />
        </mesh>
      ))}

      <mesh position={[0, 9.0, -2.0]} castShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.35, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.4} />
      </mesh>

      <mesh position={[0, 9.45, -2.0]} castShadow>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 9.9, -2.0]} castShadow>
        <coneGeometry args={[0.22, 0.65, 12]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
      </mesh>

      <group position={[0, 10.2, -2.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} />
        </mesh>
        <mesh ref={flagRef} position={[0.42, 0.45, 0]}>
          <coneGeometry args={[0.38, 0.85, 3]} />
          <meshStandardMaterial color="#ea580c" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {[-2.8, 0, 2.8].map((px, pidx) => (
        <React.Fragment key={`pillar-row-${pidx}`}>
          <group position={[px, 1.8, 2.2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.28, 2.8, 12]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.5} />
            </mesh>
            <mesh position={[0, -1.3, 0]}>
              <boxGeometry args={[0.7, 0.25, 0.7]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[0.75, 0.22, 0.75]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.4} />
            </mesh>
          </group>
          <group position={[px, 1.8, 4.4]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.28, 2.8, 12]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.5} />
            </mesh>
            <mesh position={[0, -1.3, 0]}>
              <boxGeometry args={[0.7, 0.25, 0.7]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[0.75, 0.22, 0.75]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.4} />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      <mesh position={[0, 3.6, 3.3]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4.6, 1.4, 4]} />
        <meshStandardMaterial color="#ea580c" roughness={0.5} />
      </mesh>

      <group ref={bellRef} position={[0, 2.8, 3.3]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#b45309" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.32, 0]} castShadow>
          <coneGeometry args={[0.18, 0.28, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      <group position={[5.2, 0, 5.0]}>
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.6, 3.2, 8]} />
          <meshStandardMaterial color="#78716c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.3, 0]} castShadow>
          <coneGeometry args={[0.45, 0.6, 8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
        </mesh>
        {[0.8, 1.5, 2.2, 2.8].map((ly, lidx) => (
          <mesh key={`lamp-ring-${lidx}`} position={[0, ly, 0]}>
            <torusGeometry args={[0.55, 0.08, 8, 16]} />
            <meshStandardMaterial color="#d97706" roughness={0.5} />
          </mesh>
        ))}
      </group>

      <group position={[-5.0, 0, 4.5]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color="#fde047" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.6, 0.35, 4]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        <mesh position={[0, 1.55, 0]} castShadow>
          <dodecahedronGeometry args={[0.35]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
      </group>

      {isSelected && (
        <Html position={[0, 11.2, -2.0]} center distanceFactor={28} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 rounded-2xl border border-amber-400 bg-amber-950/95 text-amber-100 shadow-2xl backdrop-blur-md min-w-[220px] select-none pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-800/60">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span className="text-amber-400 text-sm">🕉️</span>
                <span>Shri Ram Mandir, Boisar</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelected(false);
                }}
                className="w-4 h-4 rounded-full bg-amber-900 text-amber-300 hover:text-white flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
            </div>
            <div className="text-[10px] text-amber-200/90 font-sans">
              Heritage Sacred Precinct · Established 1984
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
