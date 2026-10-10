'use client';

import React, { useMemo } from 'react';

interface TreePlacement {
  pos: [number, number, number];
  rotY: number;
  scale: number;
}

const StylizedIsometricTree = React.memo(function StylizedIsometricTree({ position, rotationY, scale }: { position: [number, number, number]; rotationY: number; scale: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.06, 12]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 1.3, 6]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>

      <mesh position={[0, 1.6, 0]}>
        <dodecahedronGeometry args={[0.78]} />
        <meshStandardMaterial color="#22c55e" roughness={0.65} />
      </mesh>

      <mesh castShadow position={[0.04, 2.15, 0.03]}>
        <dodecahedronGeometry args={[0.52]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} />
      </mesh>
    </group>
  );
});

import { BOISAR_ROADS } from '../Roads/boisarRoads';

export function Trees() {
  const treePlacements = useMemo<TreePlacement[]>(() => {
    const rawCoords: Array<[number, number]> = [
      [90, 2], [92, 22], [105, 4], [104, 20],

      [60, 22], [66, 48], [85, 62], [88, 32], [102, 65],

      [36, -34], [42, -45], [46, -72],

      [52, -108], [65, -128], [68, -110], [48, -126],

      [24, -200], [28, -215], [42, -210], [45, -225],

      [36, 185], [40, 195], [68, 190], [72, 210],

      [190, -28], [195, -15], [215, -35], [220, -15],

      [-52, 22], [-68, 38], [-74, 20], [-80, 48],

      [-72, -32], [-88, -24], [-102, -38], [-110, -25],
    ];

    const protectedHubs = [
      { x: -8, z: -18 },
      { x: -48, z: -28 },
      { x: -48, z: 22 },
      { x: 38, z: 65 },
      { x: 48, z: 200 },
      { x: 210, z: -20 },
      { x: -96, z: -32 },
      { x: 36, z: -220 },
      { x: -65, z: 210 },
      { x: -28, z: 54 },
      { x: 0, z: -2 },
      { x: 95, z: 12 },
      { x: -36, z: -82 },
      { x: 58, z: -118 },
      { x: -86, z: -75 },
      { x: -48, z: -65 },
      { x: 48, z: 30 },
      { x: 46, z: 74 },
      { x: 78, z: -36 },
    ];

    const safeCoords = rawCoords.filter(([tx, tz]) => {
      if (protectedHubs.some(hub => Math.hypot(tx - hub.x, tz - hub.z) < 12.0)) {
        return false;
      }
      for (const road of BOISAR_ROADS) {
        const minReq = road.width / 2 + 3.2;
        for (let i = 0; i < road.points.length - 1; i++) {
          const p1 = road.points[i];
          const p2 = road.points[i + 1];
          const dx = p2[0] - p1[0];
          const dz = p2[2] - p1[2];
          const l2 = dx * dx + dz * dz;
          if (l2 < 0.001) continue;
          let t = ((tx - p1[0]) * dx + (tz - p1[2]) * dz) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = p1[0] + t * dx;
          const projZ = p1[2] + t * dz;
          if (Math.hypot(tx - projX, tz - projZ) < minReq) {
            return false;
          }
        }
      }
      return true;
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
