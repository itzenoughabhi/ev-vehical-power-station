'use client';

import React, { useMemo } from 'react';

interface TreePlacement {
  pos: [number, number, number];
  rotY: number;
  scale: number;
}

/** Crisp, beautiful low-poly stylized isometric tree matching Image 1 (WareTrack) */
function StylizedIsometricTree({ position, rotationY, scale }: { position: [number, number, number]; rotationY: number; scale: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* Grass patch base plate */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.06, 12]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>

      {/* Warm natural wooden trunk */}
      <mesh castShadow receiveShadow position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 1.3, 6]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>

      {/* Lower lush green foliage canopy */}
      <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
        <dodecahedronGeometry args={[0.78]} />
        <meshStandardMaterial color="#22c55e" roughness={0.65} />
      </mesh>

      {/* Upper bright green canopy crown */}
      <mesh castShadow receiveShadow position={[0.04, 2.15, 0.03]}>
        <dodecahedronGeometry args={[0.52]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Trees() {
  const treePlacements = useMemo<TreePlacement[]>(() => {
    const rawCoords: Array<[number, number]> = [
      // 1. Betegaon Residential Park & Green Belt
      [28, -16], [32, -18], [34, -22], [30, -24], [26, -26], [36, -14],
      // 2. Saravali Green Zone (East of Highway)
      [22, 14], [24, 10], [28, 8], [32, 4], [34, 12], [30, 16],
      // 3. Northern Agricultural & Highway Buffer
      [10, -38], [14, -42], [22, -44], [26, -42], [4, -36], [8, -44],
      // 4. Western Tarapur Coastal Green Buffer (Far West of B104)
      [-64, -12], [-66, -18], [-68, -24], [-62, -6], [-70, -16],
      // 5. South Betegaon Landscape Belt
      [36, 32], [38, 26], [40, 20], [34, 38], [38, 42],
    ];

    // Exclude any coordinate within 10 meters of any charging hub or service center
    const protectedHubs = [
      { x: -8, z: -8 },   // Station A102
      { x: -48, z: -14 }, // Station B104
      { x: -38, z: 22 },  // Station C201
      { x: 26, z: 36 },   // Station D305
      { x: -14, z: 24 },  // Service Center S03
      { x: -4, z: 0 },    // Central Roundabout
    ];

    const safeCoords = rawCoords.filter(([tx, tz]) => {
      return !protectedHubs.some(hub => Math.hypot(tx - hub.x, tz - hub.z) < 9.5);
    });

    return safeCoords.map(([x, z], i) => ({
      pos: [x, 0, z] as [number, number, number],
      rotY: (i * 1.25) % (Math.PI * 2),
      scale: 0.85 + (i % 3) * 0.1,
    }));
  }, []);

  return (
    <group name="StylizedTrees">
      {treePlacements.map((t, idx) => (
        <StylizedIsometricTree
          key={`tree-${idx}`}
          position={t.pos}
          rotationY={t.rotY}
          scale={t.scale}
        />
      ))}
    </group>
  );
}
