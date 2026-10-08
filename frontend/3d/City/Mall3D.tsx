'use client';

import React, { Suspense } from 'react';
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

/**
 * Boisar Grand Central Mall & Entertainment Plaza.
 * Features:
 * - 3-Story Modern Glass Atrium & Commercial Retail Arcade
 * - Brand Billboards & Facade Signage (Cinema, Hypermarket, Food Court)
 * - Front Landscaped Plaza with Concrete Planters & Benches
 * - Customer Parking Apron with 2 Dedicated EV Charging Pedestals
 * - Illuminated 3D Floating Mall Badge
 */
export function Mall3D({ position = [-86, 0, -75], rotation = [0, 0.25, 0] }: MallProps) {
  const brandBanners = [
    { title: 'RELIANCE SMART', color: '#0284c7', y: 4.8, x: -5.2 },
    { title: 'INOX MULTIPLEX', color: '#dc2626', y: 4.8, x: 5.2 },
    { title: 'CROMA DIGITAL', color: '#059669', y: 2.8, x: -5.2 },
    { title: 'FOOD STREET & CAFÉ', color: '#ea580c', y: 2.8, x: 5.2 },
  ];

  return (
    <group position={position} rotation={rotation} name="BoisarGrandCentralMall">
      {/* 1. Mall Plaza Base & Customer Parking Apron */}
      <mesh position={[0, 0.05, 1.5]} receiveShadow>
        <boxGeometry args={[22.0, 0.1, 15.0]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* 2. Main Mall 3-Story Building Body — Clean White & Royal Blue Fascia */}
      <mesh position={[0, 3.8, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[18.5, 7.6, 6.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Royal Blue Roof Fascia Parapet */}
      <mesh position={[0, 7.8, -2.5]} castShadow>
        <boxGeometry args={[19.2, 0.45, 7.4]} />
        <meshStandardMaterial color="#2563eb" roughness={0.25} metalness={0.3} />
      </mesh>

      {/* 3. Central Panoramic Glass Atrium Entrance */}
      <group position={[0, 3.6, 1.0]}>
        {/* Curved Glass Curtain Wall */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7.2, 7.0, 0.35]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.85} transparent opacity={0.88} />
        </mesh>

        {/* Steel Mullions & Atrium Frame */}
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

        {/* Mall Grand Entrance Marquee Sign */}
        <mesh position={[0, 4.0, 0.45]}>
          <boxGeometry args={[7.6, 1.1, 0.25]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 4.0, 0.58]}>
          <planeGeometry args={[7.2, 0.85]} />
          <meshStandardMaterial color="#1e1b4b" emissive="#3b82f6" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
      </group>

      {/* 4. Retail Brand Billboard Displays on Mall Facade */}
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

      {/* 5. Landscaped Front Plaza with Benches & Planters */}
      <group position={[0, 0, 4.5]}>
        {/* Decorative Green Planter Boxes */}
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
            {/* Lush Shrub / Palm */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <dodecahedronGeometry args={[0.55]} />
              <meshStandardMaterial color="#22c55e" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Plaza Visitor Benches */}
        <Suspense fallback={null}>
          <MallBench position={[-2.8, 0, 0]} rotation={[0, 0, 0]} />
          <MallBench position={[2.8, 0, 0]} rotation={[0, 0, 0]} />
        </Suspense>
      </group>

      {/* 6. Customer EV Charging Pedestals on Plaza Edge */}
      <group position={[7.5, 0, 6.0]}>
        {[0, 1.8].map((ex, ei) => (
          <group key={`mall-ev-${ei}`} position={[ex, 0, 0]}>
            {/* Charger Pillar */}
            <mesh position={[0, 0.85, 0]} castShadow>
              <boxGeometry args={[0.42, 1.7, 0.35]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Screen */}
            <mesh position={[0, 1.1, 0.18]}>
              <boxGeometry args={[0.3, 0.4, 0.02]} />
              <meshStandardMaterial color="#06b6d4" />
            </mesh>
            {/* Parking stall line */}
            <mesh position={[0, 0.06, -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.6, 2.6]} />
              <meshBasicMaterial color="#0284c7" opacity={0.25} transparent />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. 3D Floating Interactive Mall Badge */}
      <Html position={[0, 9.2, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
        <div className="px-3 py-1.5 rounded-full border border-sky-400 bg-slate-900/95 text-sky-200 text-[11px] font-bold shadow-xl flex items-center gap-2 select-none backdrop-blur-md">
          <span className="text-sky-400 text-sm">🏬</span>
          <span>Grand Central Mall, Boisar</span>
          <span className="text-[10px] font-normal text-sky-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/50">Retail & Cinema Plaza</span>
        </div>
      </Html>
    </group>
  );
}
