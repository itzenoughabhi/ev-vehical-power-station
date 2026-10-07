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
    const coords: Array<[number, number]> = [
      // Central walkway green strip
      [-14, -4.5], [-10, -4.5], [-6, -4.5], [6, -4.5], [10, -4.5], [14, -4.5],
      [-14, 4.5], [-10, 4.5], [-6, 4.5], [6, 4.5], [10, 4.5], [14, 4.5],

      // Park landscaping
      [-12, -7], [-8, -7], [8, -7], [12, -7],
      [-12, 7], [-8, 7], [8, 7], [12, 7],

      // Station A102 green buffer
      [-22, 13], [-24, 13], [-26, 13],
      // Station B104 green buffer
      [20, 23], [22, 23], [24, 23],
    ];

    return coords.map(([x, z], i) => ({
      pos: [x, 0, z] as [number, number, number],
      rotY: (i * 1.25) % (Math.PI * 2),
      scale: 0.9 + (i % 4) * 0.08,
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
