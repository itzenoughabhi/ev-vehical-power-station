'use client';

import React, { Suspense, useState } from 'react';
import { Html, useGLTF, Clone } from '@react-three/drei';

function MallBench({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/city/bench.glb');
  return (
    <group position={position} rotation={rotation}>
      <Clone object={scene} scale={[0.5, 0.5, 0.5]} castShadow receiveShadow />
    </group>
  );
}

interface MallProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function Mall3D({ position = [-86, 0, -75], rotation = [0, 0.25, 0] }: MallProps) {
  const [isSelected, setIsSelected] = useState(false);
  const brandBanners = [
    { title: 'RELIANCE SMART', color: '#0284c7', y: 4.8, x: -5.2 },
    { title: 'INOX MULTIPLEX', color: '#dc2626', y: 4.8, x: 5.2 },
    { title: 'CROMA DIGITAL', color: '#059669', y: 2.8, x: -5.2 },
    { title: 'FOOD STREET & CAFÉ', color: '#ea580c', y: 2.8, x: 5.2 },
  ];

  return (
    <group
      position={position}
      rotation={rotation}
      name="BoisarGrandCentralMall"
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
        <boxGeometry args={[22.0, 0.1, 15.0]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      <mesh position={[0, 3.8, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[18.5, 7.6, 6.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
      </mesh>

      <mesh position={[0, 7.8, -2.5]} castShadow>
        <boxGeometry args={[19.2, 0.45, 7.4]} />
        <meshStandardMaterial color="#2563eb" roughness={0.25} metalness={0.3} />
      </mesh>

      <group position={[0, 3.6, 1.0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7.2, 7.0, 0.35]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.85} transparent opacity={0.88} />
        </mesh>

        {[-3.6, 0, 3.6].map((mx, mi) => (
          <mesh key={`mullion-${mi}`} position={[mx, 0, 0.2]}>
            <boxGeometry args={[0.18, 7.0, 0.1]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        ))}
        {[-2.0, 0, 2.0].map((my, mi) => (
          <mesh key={`transom-${mi}`} position={[0, my, 0.2]}>
            <boxGeometry args={[7.2, 0.18, 0.1]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        ))}

        <mesh position={[0, 4.0, 0.45]}>
          <boxGeometry args={[7.6, 1.1, 0.25]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 4.0, 0.58]}>
          <planeGeometry args={[7.2, 0.85]} />
          <meshStandardMaterial color="#1e1b4b" emissive="#3b82f6" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
      </group>

      {brandBanners.map((b, bi) => (
        <group key={`banner-${bi}`} position={[b.x, b.y, 0.95]}>
          <mesh castShadow>
            <boxGeometry args={[3.8, 1.3, 0.1]} />
            <meshStandardMaterial color={b.color} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[3.5, 1.1]} />
            <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.3} roughness={0.3} />
          </mesh>
        </group>
      ))}

      <group position={[0, 0, 4.5]}>
        {[-5.5, 5.5].map((px, pi) => (
          <group key={`planter-${pi}`} position={[px, 0.4, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.4, 0.7, 1.4]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[2.2, 0.15, 1.2]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow>
              <dodecahedronGeometry args={[0.55]} />
              <meshStandardMaterial color="#22c55e" roughness={0.6} />
            </mesh>
          </group>
        ))}

        <Suspense fallback={null}>
          <MallBench position={[-2.8, 0, 0]} rotation={[0, 0, 0]} />
          <MallBench position={[2.8, 0, 0]} rotation={[0, 0, 0]} />
        </Suspense>
      </group>

      <group position={[7.5, 0, 6.0]}>
        {[0, 1.8].map((ex, ei) => (
          <group key={`mall-ev-${ei}`} position={[ex, 0, 0]}>
            <mesh position={[0, 0.85, 0]} castShadow>
              <boxGeometry args={[0.42, 1.7, 0.35]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
            </mesh>
            <mesh position={[0, 1.1, 0.18]}>
              <boxGeometry args={[0.3, 0.4, 0.02]} />
              <meshStandardMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[0, 0.06, -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.6, 2.6]} />
              <meshBasicMaterial color="#0284c7" opacity={0.25} transparent />
            </mesh>
          </group>
        ))}
      </group>

      {isSelected && (
        <Html position={[0, 9.2, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 rounded-2xl border border-sky-400 bg-slate-900/95 text-white shadow-2xl backdrop-blur-md min-w-[220px] select-none pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span className="text-sky-400 text-sm">🏬</span>
                <span>Grand Central Mall, Boisar</span>
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
            <div className="text-[10px] text-sky-300 font-mono">
              Retail Shopping & Cinema Plaza · 2 EV Bays
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
