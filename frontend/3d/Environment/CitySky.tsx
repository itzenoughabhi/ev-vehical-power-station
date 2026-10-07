'use client';

import React from 'react';

export function CitySky() {
  return (
    <>
      {/* Realistic Indian coastal-plains daylight atmosphere */}
      <color attach="background" args={['#e2e8f0']} />
      <fog attach="fog" args={['#e2e8f0', 80, 240]} />

      {/* Balanced natural daylight illumination */}
      <ambientLight intensity={0.82} color="#ffffff" />

      {/* Warm sky and earth bounce light */}
      <hemisphereLight args={['#dbeafe', '#cbd5e1', 0.75]} />

      {/* Primary sunlight casting crisp soft shadows */}
      <directionalLight
        position={[50, 75, 45]}
        intensity={1.35}
        color="#fffbf0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={220}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.00015}
      />

      {/* Subtle fill light from northern sky */}
      <directionalLight
        position={[-40, 30, -40]}
        intensity={0.4}
        color="#94a3b8"
      />

      {/* Realistic earthy terrain ground base around Boisar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>
    </>
  );
}
