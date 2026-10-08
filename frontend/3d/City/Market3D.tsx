'use client';

import React, { Suspense } from 'react';
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

/**
 * Boisar Station Road Bazaar & Daily Market (Traditional Indian Commercial Market Street).
 * Features:
 * - Commercial arcade with multi-shop units & roll-up shutters
 * - Colorful fabric awnings (saffron/white, azure/white, emerald/white)
 * - Vendor crates & fruit/vegetable produce stalls
 * - Authentic street shopfront signage
 * - Bank ATM Kiosk (State Bank of India / HDFC)
 * - Pedestrian paved walkway & street lighting
 */
export function Market3D({ position = [-36, 0, -82], rotation = [0, 0, 0] }: MarketProps) {
  const shops = [
    { name: 'Shree Ganesh Sweets & Farsan', color: '#ea580c', awning: '#f97316', x: -6.2 },
    { name: 'Boisar Fresh Fruits & Mandi', color: '#16a34a', awning: '#22c55e', x: -2.1 },
    { name: 'Laxmi General Store & Kirana', color: '#0284c7', awning: '#38bdf8', x: 2.1 },
    { name: 'Maharashtra Mobile & Electronics', color: '#7c3aed', awning: '#a855f7', x: 6.2 },
  ];

  return (
    <group position={position} rotation={rotation} name="BoisarStationBazaar">
      {/* 1. Market Paved Promenade Sidewalk */}
      <mesh position={[0, 0.05, 1.5]} receiveShadow>
        <boxGeometry args={[18.5, 0.1, 7.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>

      {/* Main Commercial Arcade Building Structure */}
      <mesh position={[0, 2.4, -2.0]} castShadow receiveShadow>
        <boxGeometry args={[17.8, 4.8, 4.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* Modern Blue Fascia Roof Band */}
      <mesh position={[0, 4.9, -2.0]} castShadow>
        <boxGeometry args={[18.4, 0.4, 4.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* 2. Individual Retail Shopfronts */}
      {shops.map((shop, i) => (
        <group key={`shop-${i}`} position={[shop.x, 0, 0]}>
          {/* Shop Entrance Recess */}
          <mesh position={[0, 1.5, 0.2]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 3.0, 0.3]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          {/* Roll-up Steel Shutter Frame */}
          <mesh position={[0, 2.7, 0.35]} castShadow>
            <boxGeometry args={[3.8, 0.5, 0.25]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>

          {/* Colorful Striped Market Canopy / Awning */}
          <group position={[0, 2.85, 1.1]} rotation={[0.35, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3.8, 0.06, 1.6]} />
              <meshStandardMaterial color={shop.awning} roughness={0.5} />
            </mesh>
            {/* Awning Valance Flap */}
            <mesh position={[0, -0.15, 0.8]} castShadow>
              <boxGeometry args={[3.8, 0.3, 0.04]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
          </group>

          {/* Display Counter with Wooden Shelves */}
          <mesh position={[0, 0.65, 0.9]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.9, 0.9]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>

          {/* Fresh Produce Wooden Crates on Display Counter */}
          {[-0.9, 0, 0.9].map((cx, cidx) => (
            <group key={`crate-${cidx}`} position={[cx, 1.25, 0.9]}>
              <mesh castShadow>
                <boxGeometry args={[0.7, 0.3, 0.6]} />
                <meshStandardMaterial color="#d97706" roughness={0.8} />
              </mesh>
              {/* Colorful Produce Content (Mangoes, Oranges, Greens) */}
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.62, 0.18, 0.52]} />
                <meshStandardMaterial 
                  color={cidx === 0 ? '#eab308' : cidx === 1 ? '#ea580c' : '#22c55e'} 
                  roughness={0.6} 
                />
              </mesh>
            </group>
          ))}

          {/* Shop Hindi / English Signboard */}
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

      {/* 3. Outdoor Street Vendor Fruit Thela (Wooden Handcart) */}
      <group position={[-7.5, 0, 3.8]} rotation={[0, 0.3, 0]}>
        {/* Wooden Cart Bed */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.12, 1.1]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        {/* Four Big Wooden Wheels */}
        {[-0.85, 0.85].map((wx, wi) =>
          [-0.55, 0.55].map((wz, zi) => (
            <mesh key={`thela-w-${wi}-${zi}`} position={[wx, 0.45, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.08, 16]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
          ))
        )}
        {/* Mangoes & Bananas Mountain */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#facc15" roughness={0.7} />
        </mesh>
        {/* Vendor Umbrella */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <coneGeometry args={[1.2, 0.45, 12]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* 4. Bank ATM Kiosk (State Bank of India / HDFC) */}
      <Suspense fallback={null}>
        <MarketATM position={[8.4, 0.08, 1.8]} rotation={[0, -Math.PI / 2, 0]} />
      </Suspense>

      {/* 5. 3D Floating Interactive Market Badge */}
      <Html position={[0, 6.2, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
        <div className="px-3 py-1.5 rounded-full border border-emerald-400 bg-slate-900/95 text-emerald-200 text-[11px] font-bold shadow-xl flex items-center gap-2 select-none backdrop-blur-md">
          <span className="text-emerald-400 text-sm">🛍️</span>
          <span>Boisar Station Road Bazaar</span>
          <span className="text-[10px] font-normal text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600/50">Daily Market</span>
        </div>
      </Html>
    </group>
  );
}
