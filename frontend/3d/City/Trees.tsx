'use client';

import React, { useMemo } from 'react';

interface TreePlacement {
  pos: [number, number, number];
  rotY: number;
  scale: number;
}

/** Crisp, beautiful low-poly stylized isometric tree matching WareTrack aesthetic */
function StylizedIsometricTree({ position, rotationY, scale }: { position: [number, number, number]; rotationY: number; scale: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* Grass patch base plate */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.06, 12]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>

      {/* Warm natural wooden trunk */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 1.3, 6]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>

      {/* Lower lush green foliage canopy */}
      <mesh position={[0, 1.6, 0]}>
        <dodecahedronGeometry args={[0.78]} />
        <meshStandardMaterial color="#22c55e" roughness={0.65} />
      </mesh>

      {/* Upper bright green canopy crown */}
      <mesh castShadow position={[0.04, 2.15, 0.03]}>
        <dodecahedronGeometry args={[0.52]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} />
      </mesh>
    </group>
  );
}

import { BOISAR_ROADS } from '../Roads/boisarRoads';

export function Trees() {
  const treePlacements = useMemo<TreePlacement[]>(() => {
    const rawCoords: Array<[number, number]> = [
      // 1. Shri Ram Mandir Heritage Sacred Gardens (Peaceful grove surrounding Eastern Sanctuary)
      [90, 2], [92, 22], [105, 4], [104, 20],

      // 2. Betegaon Residential Parkland & Green Buffer
      [60, 22], [66, 48], [85, 62], [88, 32], [102, 65],

      // 3. Boisar Town Centre East Green Buffer
      [36, -34], [42, -45], [46, -72],

      // 4. Northern Healthcare & Hospital Gardens
      [52, -108], [65, -128], [68, -110], [48, -126],

      // 5. Dahanu North Highway Agro & Green Belt
      [24, -200], [28, -215], [42, -210], [45, -225],

      // 6. Palghar District Administrative Capital Parklands (South Corridor)
      [36, 185], [40, 195], [68, 190], [72, 210],

      // 7. Manor NH-48 Express Highway Buffer (East Corridor)
      [190, -28], [195, -15], [215, -35], [220, -15],

      // 8. Tarapur MIDC & Service Center Industrial Green Belts
      [-52, 22], [-68, 38], [-74, 20], [-80, 48],

      // 9. Western Tarapur Coastal Buffer (Navapur & Chinchani Coast)
      [-72, -32], [-88, -24], [-102, -38], [-110, -25],
    ];

    // Exclude any coordinate within 12 meters of any active charging hub, service center, or civic landmark building
    const protectedHubs = [
      { x: -8, z: -18 },  // Station A102
      { x: -48, z: -28 }, // Station B104
      { x: -48, z: 22 },  // Station C201
      { x: 38, z: 65 },   // Station D305
      { x: 48, z: 200 },  // Station P401
      { x: 210, z: -20 }, // Station M501
      { x: -96, z: -32 }, // Station T601
      { x: 36, z: -220 }, // Station D701
      { x: -65, z: 210 }, // Station S801
      { x: -28, z: 54 },  // Service Center S03
      { x: -4, z: 0 },    // Central Roundabout
      { x: 95, z: 12 },   // Shri Ram Mandir
      { x: -36, z: -82 }, // Boisar Station Bazaar & Market
      { x: 58, z: -118 }, // Multi-Specialty Hospital
      { x: -86, z: -75 }, // Grand Central Mall
      { x: -48, z: -65 }, // Substation GRID-S01
      { x: 48, z: 30 },   // HOME-024
      { x: 46, z: 74 },   // HOME-052
      { x: 78, z: -36 },  // HOME-088
    ];

    const safeCoords = rawCoords.filter(([tx, tz]) => {
      // 1. Hub buffer check
      if (protectedHubs.some(hub => Math.hypot(tx - hub.x, tz - hub.z) < 12.0)) {
        return false;
      }
      // 2. Strict road clearance check: at least (road.width / 2 + 3.2m) away from road centerlines
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
