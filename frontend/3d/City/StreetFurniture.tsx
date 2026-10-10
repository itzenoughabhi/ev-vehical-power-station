'use client';

import React from 'react';

function CargoCrates({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.12, 1.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>

      <mesh position={[-0.32, 0.45, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.65, 0.62]} />
        <meshStandardMaterial color="#d97706" roughness={0.75} />
      </mesh>
      <mesh position={[0.32, 0.45, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.65, 0.62]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.75} />
      </mesh>
      <mesh position={[-0.32, 0.45, 0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.65, 0.62]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} />
      </mesh>
      <mesh position={[0.32, 0.45, 0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.65, 0.62]} />
        <meshStandardMaterial color="#d97706" roughness={0.75} />
      </mesh>

      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.65, 0.65]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.75} />
      </mesh>
    </group>
  );
}

function StylizedForklift({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation} scale={[0.85, 0.85, 0.85]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.6, 1.6]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.2} />
      </mesh>

      <mesh position={[0, 1.05, -0.1]}>
        <boxGeometry args={[0.95, 0.7, 0.95]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      <mesh position={[0, 0.8, 0.9]} castShadow>
        <boxGeometry args={[0.7, 1.4, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      <mesh position={[-0.22, 0.1, 1.3]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh position={[0.22, 0.1, 1.3]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {[-0.55, 0.55].map((wx, xi) => (
        <React.Fragment key={xi}>
          <mesh position={[wx, 0.22, 0.5]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[wx, 0.22, -0.5]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

export function StreetFurniture() {
  return (
    <group name="StreetFurniture">
      <CargoCrates position={[-16, 0, 16]} rotation={[0, 0.2, 0]} />
      <CargoCrates position={[-14, 0, 16.5]} rotation={[0, -0.4, 0]} />
      <CargoCrates position={[-15, 0, 14.5]} rotation={[0, 0.6, 0]} />

      <CargoCrates position={[17, 0, 26]} rotation={[0, 0.3, 0]} />
      <CargoCrates position={[15, 0, 26.5]} rotation={[0, -0.2, 0]} />

      <StylizedForklift position={[-12.5, 0, 15]} rotation={[0, Math.PI * 0.75, 0]} />
      <StylizedForklift position={[13, 0, 25]} rotation={[0, -Math.PI * 0.35, 0]} />
    </group>
  );
}
