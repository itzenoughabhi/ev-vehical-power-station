'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';
import { TrafficSignal } from '../../types';

const DEFAULT_SIGNALS: TrafficSignal[] = [
  {
    id: 'SIG_BOISAR_TOWN',
    name: 'Boisar Town Center Junction',
    intersection: 'Boisar Town Center',
    position: { x: 18.0, y: 0, z: -18.0 },
    stopLine: { x: 12.0, y: 0, z: -18.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_UMROLI_JCT',
    name: 'Umroli Regional Interchange (SH-40 Corridor)',
    intersection: 'Umroli Interchange',
    position: { x: 46.5, y: 0, z: 155.0 },
    stopLine: { x: 40.0, y: 0, z: 153.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_SHIRGAON_BRANCH',
    name: 'Umroli Interchange (Shirgaon Coastal Branch)',
    intersection: 'Umroli Interchange',
    position: { x: 32.0, y: 0, z: 162.0 },
    stopLine: { x: 36.0, y: 0, z: 157.0 },
    heading: -0.7,
    state: 'GREEN',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_PALGHAR_JCT',
    name: 'Palghar Highway Junction',
    intersection: 'Palghar Collectorate Junction',
    position: { x: 57.0, y: 0, z: 215.0 },
    stopLine: { x: 50.0, y: 0, z: 215.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_TARAPUR_MIDC',
    name: 'Tarapur MIDC Chemical Sector Junction',
    intersection: 'Tarapur MIDC Split',
    position: { x: -36.5, y: 0, z: -5.0 },
    stopLine: { x: -30.0, y: 0, z: -5.0 },
    heading: -Math.PI / 2,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_SARAVALI_JCT',
    name: 'Saravali Regional 4-Way Interchange',
    intersection: 'Saravali Regional Junction',
    position: { x: 20.0, y: 0, z: 30.0 },
    stopLine: { x: 14.0, y: 0, z: 30.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_NORTH_OUTER',
    name: 'North Boisar Outer 3-Way Interchange',
    intersection: 'North Outer Interchange',
    position: { x: 38.0, y: 0, z: -60.0 },
    stopLine: { x: 32.0, y: 0, z: -60.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_SHIRGAON_COAST',
    name: 'Shirgaon Beach Coastal 3-Way Junction',
    intersection: 'Shirgaon Beach Promenade',
    position: { x: -95.0, y: 0, z: 208.0 },
    stopLine: { x: -95.0, y: 0, z: 215.0 },
    heading: Math.PI / 2,
    state: 'GREEN',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_MANOR_EXPRESS',
    name: 'Manor NH-48 Express Terminal',
    intersection: 'Manor Express Junction',
    position: { x: 205.0, y: 0, z: -32.0 },
    stopLine: { x: 205.0, y: 0, z: -25.0 },
    heading: Math.PI / 2,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
];

interface SignalPostProps {
  signal: TrafficSignal;
}

const SignalPost = React.memo(function SignalPost({ signal }: SignalPostProps) {
  const isRed = signal.state === 'RED';
  const isYellow = signal.state === 'YELLOW';
  const isGreen = signal.state === 'GREEN';

  const armVecX = signal.stopLine.x - signal.position.x;
  const armVecZ = signal.stopLine.z - signal.position.z;
  const armDist = Math.max(3.5, Math.hypot(armVecX, armVecZ));
  const armAngle = Math.atan2(armVecX, armVecZ);

  const stopBarAngle = signal.heading ?? armAngle;

  return (
    <group position={[signal.position.x, 0, signal.position.z]}>
      {/* Curb-Mounted Heavy Concrete Foundation */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.16, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Sidewalk Vertical Mast (Outside the road curb) */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <cylinderGeometry args={[0.10, 0.14, 4.7, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* High Overhead Cantilever Arm (4.3m clearance above road) */}
      <group position={[0, 4.3, 0]} rotation={[0, armAngle, 0]}>
        <mesh position={[0, 0, armDist * 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, armDist * 0.9, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
        </mesh>

        <mesh position={[0, -0.4, armDist * 0.3]} rotation={[0.45, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* High Overhead Traffic Signal Head */}
        <group position={[0, -0.6, armDist * 0.65]} rotation={[0, -armAngle + signal.heading, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.36, 1.05, 0.28]} />
            <meshStandardMaterial color="#09090b" roughness={0.5} />
          </mesh>

          <mesh position={[0, 0, 0.145]}>
            <boxGeometry args={[0.40, 1.10, 0.02]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.2} />
          </mesh>

          <mesh position={[0, 0.34, 0.20]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.12, 16, 1, true, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#09090b" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.34, 0.155]}>
            <circleGeometry args={[0.11, 24]} />
            <meshStandardMaterial
              color={isRed ? '#ff2222' : '#27272a'}
              emissive={isRed ? '#ff1111' : '#000000'}
              emissiveIntensity={isRed ? 3.8 : 0}
              roughness={isRed ? 0.2 : 0.8}
            />
          </mesh>

          <mesh position={[0, 0, 0.20]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.12, 16, 1, true, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#09090b" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.155]}>
            <circleGeometry args={[0.11, 24]} />
            <meshStandardMaterial
              color={isYellow ? '#facc15' : '#27272a'}
              emissive={isYellow ? '#eab308' : '#000000'}
              emissiveIntensity={isYellow ? 3.8 : 0}
              roughness={isYellow ? 0.2 : 0.8}
            />
          </mesh>

          <mesh position={[0, -0.34, 0.20]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.12, 16, 1, true, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#09090b" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.34, 0.155]}>
            <circleGeometry args={[0.11, 24]} />
            <meshStandardMaterial
              color={isGreen ? '#22c55e' : '#27272a'}
              emissive={isGreen ? '#10b981' : '#000000'}
              emissiveIntensity={isGreen ? 3.8 : 0}
              roughness={isGreen ? 0.2 : 0.8}
            />
          </mesh>
        </group>
      </group>

      {/* Road Markings Flush with Asphalt */}
      <group
        position={[signal.stopLine.x - signal.position.x, 0.052, signal.stopLine.z - signal.position.z]}
        rotation={[-Math.PI / 2, 0, stopBarAngle + Math.PI / 2]}
      >
        <mesh receiveShadow>
          <planeGeometry args={[4.8, 0.45]} />
          <meshBasicMaterial color="#ffffff" opacity={0.92} transparent />
        </mesh>
      </group>
    </group>
  );
});

export function TrafficSignals3D() {
  const storeSignals = useDigitalTwinStore((s) => s.trafficSignals);
  const signals = storeSignals && storeSignals.length > 0 ? storeSignals : DEFAULT_SIGNALS;

  return (
    <group name="TrafficSignals3D">
      {signals.map((sig) => (
        <SignalPost key={sig.id} signal={sig} />
      ))}
    </group>
  );
}
