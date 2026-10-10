'use client';

import React, { Suspense, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

function HospitalGLBModel({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/city/hospital.glb');
  return (
    <group position={position} rotation={rotation}>
      <Clone object={scene} scale={[0.036, 0.036, 0.036]} castShadow receiveShadow />
    </group>
  );
}

interface HospitalProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function Hospital3D({ position = [58, 0, -118], rotation = [0, Math.PI / 2, 0] }: HospitalProps) {
  const beaconRef = useRef<THREE.PointLight>(null);
  const [isSelected, setIsSelected] = useState(false);

  useFrame((state) => {
    if (beaconRef.current) {
      beaconRef.current.intensity = 1.2 + Math.sin(state.clock.getElapsedTime() * 3) * 0.4;
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      name="BoisarDistrictHospital"
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
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[22.0, 0.08, 16.0]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      <Suspense fallback={null}>
        <HospitalGLBModel position={[0, 0, -1.0]} />
      </Suspense>

      <group position={[7.5, 0, 4.0]}>
        <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 0.25, 4.8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.2} />
        </mesh>

        {[-2.8, 2.8].map((cx, ci) => (
          <mesh key={`h-col-${ci}`} position={[cx, 1.7, 1.8]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 3.4, 12]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        <mesh position={[0, 3.75, 2.42]}>
          <boxGeometry args={[5.8, 0.55, 0.08]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.75, 2.47]}>
          <planeGeometry args={[5.5, 0.45]} />
          <meshStandardMaterial color="#991b1b" emissive="#ef4444" emissiveIntensity={0.5} roughness={0.2} />
        </mesh>

        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.2, 4.0]} />
          <meshBasicMaterial color="#ef4444" opacity={0.18} transparent />
        </mesh>
        {[-1.8, 0, 1.8].map((yx, yi) => (
          <mesh key={`h-bay-${yi}`} position={[yx, 0.055, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.22, 2.8]} />
            <meshBasicMaterial color="#f59e0b" opacity={0.8} transparent />
          </mesh>
        ))}
      </group>

      <group position={[0, 8.5, -1.0]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 2.4, 0.35]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[2.4, 0.7, 0.35]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
        <pointLight ref={beaconRef} color="#ef4444" distance={16} decay={2} intensity={1.5} />
      </group>

      {isSelected && (
        <Html position={[0, 10.5, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 rounded-2xl border border-red-500 bg-slate-900/95 text-white shadow-2xl backdrop-blur-md min-w-[240px] select-none pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span className="text-red-400">🏥</span>
                <span>Boisar Multi-Specialty Hospital</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelected(false);
                }}
                className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="bg-slate-800/80 p-1.5 rounded">
                <span className="text-slate-400 block text-[9px]">Emergency</span>
                <span className="text-emerald-400 font-bold">24x7 Active</span>
              </div>
              <div className="bg-slate-800/80 p-1.5 rounded">
                <span className="text-slate-400 block text-[9px]">Grid Power</span>
                <span className="text-sky-400 font-bold">Dual Backup</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
