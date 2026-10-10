'use client';

import React, { Suspense, useState } from 'react';
import { Html, useGLTF, Clone } from '@react-three/drei';

function MarketATM({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/city/atm.glb');
  return (
    <group position={position} rotation={rotation}>
      <Clone object={scene} scale={[3.2, 3.2, 3.2]} castShadow receiveShadow />
    </group>
  );
}

interface MarketProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function Market3D({ position = [-36, 0, -82], rotation = [0, 0, 0] }: MarketProps) {
  const [isSelected, setIsSelected] = useState(false);
  const shops = [
    { name: 'Shree Ganesh Sweets & Farsan', color: '#ea580c', awning: '#f97316', x: -6.2 },
    { name: 'Boisar Fresh Fruits & Mandi', color: '#16a34a', awning: '#22c55e', x: -2.1 },
    { name: 'Laxmi General Store & Kirana', color: '#0284c7', awning: '#38bdf8', x: 2.1 },
    { name: 'Maharashtra Mobile & Electronics', color: '#7c3aed', awning: '#a855f7', x: 6.2 },
  ];

  return (
    <group
      position={position}
      rotation={rotation}
      name="BoisarStationBazaar"
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
      <mesh position={[0, 0.05, 1.5]} receiveShadow>
        <boxGeometry args={[18.5, 0.1, 7.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>

      <mesh position={[0, 2.4, -2.0]} castShadow receiveShadow>
        <boxGeometry args={[17.8, 4.8, 4.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      <mesh position={[0, 4.9, -2.0]} castShadow>
        <boxGeometry args={[18.4, 0.4, 4.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.4} />
      </mesh>

      {shops.map((shop, i) => (
        <group key={`shop-${i}`} position={[shop.x, 0, 0]}>
          <mesh position={[0, 1.5, 0.2]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 3.0, 0.3]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          <mesh position={[0, 2.7, 0.35]} castShadow>
            <boxGeometry args={[3.8, 0.5, 0.25]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>

          <group position={[0, 2.85, 1.1]} rotation={[0.35, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3.8, 0.06, 1.6]} />
              <meshStandardMaterial color={shop.awning} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.15, 0.8]} castShadow>
              <boxGeometry args={[3.8, 0.3, 0.04]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
          </group>

          <mesh position={[0, 0.65, 0.9]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.9, 0.9]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>

          {[-0.9, 0, 0.9].map((cx, cidx) => (
            <group key={`crate-${cidx}`} position={[cx, 1.25, 0.9]}>
              <mesh castShadow>
                <boxGeometry args={[0.7, 0.3, 0.6]} />
                <meshStandardMaterial color="#d97706" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.62, 0.18, 0.52]} />
                <meshStandardMaterial 
                  color={cidx === 0 ? '#eab308' : cidx === 1 ? '#ea580c' : '#22c55e'} 
                  roughness={0.6} 
                />
              </mesh>
            </group>
          ))}

          <mesh position={[0, 3.45, 0.35]}>
            <boxGeometry args={[3.8, 0.65, 0.08]} />
            <meshStandardMaterial color={shop.color} roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, 3.45, 0.40]}>
            <planeGeometry args={[3.5, 0.52]} />
            <meshStandardMaterial color={shop.color} emissive={shop.color} emissiveIntensity={0.35} roughness={0.3} />
          </mesh>
        </group>
      ))}

      <group position={[-7.5, 0, 3.8]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.12, 1.1]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        {[-0.85, 0.85].map((wx, wi) =>
          [-0.55, 0.55].map((wz, zi) => (
            <mesh key={`thela-w-${wi}-${zi}`} position={[wx, 0.45, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.08, 16]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
          ))
        )}
        <mesh position={[0, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#facc15" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow>
          <coneGeometry args={[1.2, 0.45, 12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      <Suspense fallback={null}>
        <MarketATM position={[8.4, 0.08, 1.8]} rotation={[0, -Math.PI / 2, 0]} />
      </Suspense>

      {isSelected && (
        <Html position={[0, 6.2, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 rounded-2xl border border-emerald-400 bg-slate-900/95 text-white shadow-2xl backdrop-blur-md min-w-[220px] select-none pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span className="text-emerald-400 text-sm">🛍️</span>
                <span>Boisar Station Road Bazaar</span>
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
            <div className="text-[10px] text-emerald-300 font-mono">
              Daily Commercial Market · 24x7 ATM
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
