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
    position: { x: 9.5, y: 0, z: -15.5 },
    stopLine: { x: 6.0, y: 0, z: -15.0 },
    heading: 0.4,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_UMROLI_JCT',
    name: 'Umroli Regional Interchange (SH-40 Corridor)',
    intersection: 'Umroli Interchange',
    position: { x: 37.5, y: 0, z: 133.0 },
    stopLine: { x: 34.0, y: 0, z: 131.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_SHIRGAON_BRANCH',
    name: 'Umroli Interchange (Shirgaon Coastal Branch)',
    intersection: 'Umroli Interchange',
    position: { x: 28.0, y: 0, z: 140.0 },
    stopLine: { x: 26.0, y: 0, z: 138.0 },
    heading: -0.7,
    state: 'RED',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_PALGHAR_JCT',
    name: 'Palghar Highway Junction',
    intersection: 'Palghar Collectorate Junction',
    position: { x: 50.5, y: 0, z: 196.0 },
    stopLine: { x: 46.0, y: 0, z: 194.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_TARAPUR_MIDC',
    name: 'Tarapur MIDC Chemical Sector Junction',
    intersection: 'Tarapur MIDC Split',
    position: { x: -17.0, y: 0, z: 5.0 },
    stopLine: { x: -15.0, y: 0, z: 4.0 },
    heading: -Math.PI / 2,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_MANOR_EXPRESS',
    name: 'Manor NH-48 Express Terminal',
    intersection: 'Manor Express Junction',
    position: { x: 206.0, y: 0, z: -8.0 },
    stopLine: { x: 203.0, y: 0, z: -8.0 },
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
  const armAngle = Math.atan2(armVecX, armVecZ);

  const stopBarAngle = signal.heading ?? armAngle;

  return (
    <group position={[signal.position.x, 0, signal.position.z]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.16, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
      </mesh>

      <mesh position={[0, 2.25, 0]} castShadow>
        <cylinderGeometry args={[0.10, 0.14, 4.5, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>

      <group position={[0, 4.2, 0]} rotation={[0, armAngle, 0]}>
        <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 2.6, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
        </mesh>

        <mesh position={[0, -0.4, 0.8]} rotation={[0.45, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
        </mesh>

        <group position={[0, -0.6, 2.4]} rotation={[0, -armAngle + signal.heading, 0]}>
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
  return null;
}
