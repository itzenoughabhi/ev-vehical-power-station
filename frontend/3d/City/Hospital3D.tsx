'use client';

import React, { Suspense, useRef } from 'react';
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

/**
 * Boisar Multi-Specialty District Hospital & 24x7 Trauma Care.
 * Features:
 * - Scaled authentic hospital architecture
 * - Illuminated glowing 3D Red Medical Cross (+) on rooftop
 * - Emergency Ambulance Bay & Casualty Driveway with yellow caution markings
 * - Outpatient Department (OPD) & 24x7 Medical Pharmacy Wing
 * - Emergency Ambulance parking spot
 */
export function Hospital3D({ position = [58, 0, -118], rotation = [0, Math.PI / 2, 0] }: HospitalProps) {
  const beaconRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (beaconRef.current) {
      // Subtle rhythmic pulse for emergency medical beacon
      beaconRef.current.intensity = 1.2 + Math.sin(state.clock.getElapsedTime() * 3) * 0.4;
    }
  });

  return (
    <group position={position} rotation={rotation} name="BoisarDistrictHospital">
      {/* 1. Hospital Ground Apron & Emergency Casualty Driveway */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[22.0, 0.08, 16.0]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* 2. Authentic Hospital 3D Model */}
      <Suspense fallback={null}>
        <HospitalGLBModel position={[0, 0, -1.0]} />
      </Suspense>

      {/* 3. Emergency Casualty & Ambulance Entrance Canopy */}
      <group position={[7.5, 0, 4.0]}>
        {/* Cantilever Entrance Canopy */}
        <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 0.25, 4.8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Support Steel Columns */}
        {[-2.8, 2.8].map((cx, ci) => (
          <mesh key={`h-col-${ci}`} position={[cx, 1.7, 1.8]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 3.4, 12]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Emergency Signboard on Canopy */}
        <mesh position={[0, 3.75, 2.42]}>
          <boxGeometry args={[5.8, 0.55, 0.08]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.75, 2.47]}>
          <planeGeometry args={[5.5, 0.45]} />
          <meshStandardMaterial color="#991b1b" emissive="#ef4444" emissiveIntensity={0.5} roughness={0.2} />
        </mesh>

        {/* Yellow Diagonal Caution Road Markings for Ambulance Bay */}
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

      {/* 4. Illuminated 3D Medical Red Cross (+) on Hospital Rooftop */}
      <group position={[0, 8.5, -1.0]}>
        {/* Vertical arm */}
        <mesh castShadow>
          <boxGeometry args={[0.7, 2.4, 0.35]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
        {/* Horizontal arm */}
        <mesh castShadow>
          <boxGeometry args={[2.4, 0.7, 0.35]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
        {/* Glowing Red Emergency Light */}
        <pointLight ref={beaconRef} color="#ef4444" distance={16} decay={2} intensity={1.5} />
      </group>

      {/* 5. 3D Floating Interactive Hospital Badge */}
      <Html position={[0, 10.5, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
        <div className="px-3 py-1.5 rounded-full border border-red-400 bg-slate-900/95 text-red-200 text-[11px] font-bold shadow-xl flex items-center gap-2 select-none backdrop-blur-md">
          <span className="text-red-500 text-sm">🏥</span>
          <span>Boisar Multi-Specialty Hospital</span>
          <span className="text-[10px] font-normal text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/50">24x7 Trauma Care</span>
        </div>
      </Html>
    </group>
  );
}
