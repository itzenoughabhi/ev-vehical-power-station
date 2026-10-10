'use client';

import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { BOISAR_ROADS, BOISAR_CURVES, BOISAR_INTERSECTIONS, RoadDef } from './boisarRoads';

const CurvedRoadMesh = React.memo(function CurvedRoadMesh({ road }: { road: RoadDef }) {
  const curve = BOISAR_CURVES.get(road.id);

  const {
    roadGeo,
    curbLeftGeo,
    curbRightGeo,
    dashedCenterGeo,
    leftBoundaryGeo,
    rightBoundaryGeo,
  } = useMemo(() => {
    if (!curve) return {};

    const length = curve.getLength();
    const samples = Math.max(36, Math.min(128, Math.round(length * 0.9)));
    const points = curve.getPoints(samples);
    const w = road.width;
    const halfW = w / 2;
    const curbW = 0.55;

    const roadVerts: number[] = [];
    const roadIndices: number[] = [];

    const curbLeftVerts: number[] = [];
    const curbRightVerts: number[] = [];
    const curbIndices: number[] = [];

    const leftBoundVerts: number[] = [];
    const rightBoundVerts: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const pt = points[i];
      const tangent = curve.getTangentAt(Math.max(0, Math.min(1, u)));
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const roadY = Math.max(0.04, pt.y);

      const pLeft = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, halfW);
      const pRight = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, -halfW);

      roadVerts.push(pLeft.x, pLeft.y, pLeft.z);
      roadVerts.push(pRight.x, pRight.y, pRight.z);

      const curbY = roadY + 0.035;
      const pCurbLeftOuter = new THREE.Vector3(pt.x, curbY, pt.z).addScaledVector(normal, halfW + curbW);
      const pCurbRightOuter = new THREE.Vector3(pt.x, curbY, pt.z).addScaledVector(normal, -halfW - curbW);

      curbLeftVerts.push(pCurbLeftOuter.x, curbY, pCurbLeftOuter.z);
      curbLeftVerts.push(pLeft.x, curbY, pLeft.z);

      curbRightVerts.push(pRight.x, curbY, pRight.z);
      curbRightVerts.push(pCurbRightOuter.x, curbY, pCurbRightOuter.z);

      const olLeft = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, halfW - 0.28);
      const olRight = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, halfW - 0.42);
      leftBoundVerts.push(olLeft.x, olLeft.y, olLeft.z);
      leftBoundVerts.push(olRight.x, olRight.y, olRight.z);

      const orLeft = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, -halfW + 0.42);
      const orRight = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, -halfW + 0.28);
      rightBoundVerts.push(orLeft.x, orLeft.y, orLeft.z);
      rightBoundVerts.push(orRight.x, orRight.y, orRight.z);

      if (i < samples) {
        const base = i * 2;
        roadIndices.push(base, base + 1, base + 2);
        roadIndices.push(base + 1, base + 3, base + 2);

        curbIndices.push(base, base + 1, base + 2);
        curbIndices.push(base + 1, base + 3, base + 2);
      }
    }

    const totalLength = curve.getLength();
    const dashLength = 1.8;
    const gapLength = 1.3;
    const cycle = dashLength + gapLength;
    const numCycles = Math.floor(totalLength / cycle);

    const dashVerts: number[] = [];
    const dashIndices: number[] = [];
    let dashVertOffset = 0;

    for (let c = 0; c < numCycles; c++) {
      const startDist = c * cycle;
      const subSteps = 3;

      for (let s = 0; s <= subSteps; s++) {
        const dist = startDist + (s / subSteps) * dashLength;
        const u = Math.min(1, Math.max(0, dist / totalLength));
        const pt = curve.getPointAt(u);
        const tangent = curve.getTangentAt(u);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const roadY = Math.max(0.04, pt.y) + 0.016;
        const halfDashW = 0.12;

        const dLeft = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, halfDashW);
        const dRight = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, -halfDashW);

        dashVerts.push(dLeft.x, dLeft.y, dLeft.z);
        dashVerts.push(dRight.x, dRight.y, dRight.z);

        if (s < subSteps) {
          const b = dashVertOffset + s * 2;
          dashIndices.push(b, b + 1, b + 2);
          dashIndices.push(b + 1, b + 3, b + 2);
        }
      }
      dashVertOffset += (subSteps + 1) * 2;
    }

    const createGeo = (verts: number[], indices: number[]) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    };

    return {
      roadGeo: createGeo(roadVerts, roadIndices),
      curbLeftGeo: createGeo(curbLeftVerts, curbIndices),
      curbRightGeo: createGeo(curbRightVerts, curbIndices),
      dashedCenterGeo: createGeo(dashVerts, dashIndices),
      leftBoundaryGeo: createGeo(leftBoundVerts, roadIndices),
      rightBoundaryGeo: createGeo(rightBoundVerts, roadIndices),
    };
  }, [curve, road]);

  if (!roadGeo) return null;

  return (
    <group name={`road-${road.id}`}>
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial
          color="#293441"
          roughness={0.84}
          metalness={0.06}
        />
      </mesh>

      {curbLeftGeo && (
        <mesh geometry={curbLeftGeo} receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.75} />
        </mesh>
      )}
      {curbRightGeo && (
        <mesh geometry={curbRightGeo} receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.75} />
        </mesh>
      )}

      {dashedCenterGeo && (
        <mesh geometry={dashedCenterGeo}>
          <meshBasicMaterial
            color="#ffffff"
            opacity={0.95}
            transparent
          />
        </mesh>
      )}

      {leftBoundaryGeo && (
        <mesh geometry={leftBoundaryGeo}>
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
        </mesh>
      )}
      {rightBoundaryGeo && (
        <mesh geometry={rightBoundaryGeo}>
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
        </mesh>
      )}
    </group>
  );
});

const PedestrianZebraCrossings3D = React.memo(function PedestrianZebraCrossings3D() {
  const crossings = useMemo(() => [
    { id: 'cw-town', pos: [6, 0.046, -14], rotY: 0.15, width: 7.2, bars: 8 },
    { id: 'cw-saravali', pos: [16, 0.046, 22], rotY: 0.58, width: 7.2, bars: 8 },
    { id: 'cw-umroli', pos: [34, 0.046, 127], rotY: 0.22, width: 7.0, bars: 7 },
    { id: 'cw-navapur', pos: [-26, 0.046, -9], rotY: 1.28, width: 7.0, bars: 7 },
    { id: 'cw-midc', pos: [-20, 0.046, 6], rotY: 0.85, width: 6.6, bars: 7 },
    { id: 'cw-shirgaon', pos: [-40, 0.046, 190], rotY: -0.65, width: 6.8, bars: 7 },
  ], []);

  return (
    <group name="PedestrianZebraCrossings">
      {crossings.map((cw) => {
        const barSpacing = cw.width / (cw.bars + 1);
        const halfW = cw.width / 2;

        return (
          <group key={cw.id} position={cw.pos as [number, number, number]} rotation={[0, cw.rotY, 0]}>
            <mesh position={[0, 0, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[cw.width, 0.4]} />
              <meshBasicMaterial color="#ffffff" opacity={0.92} transparent />
            </mesh>

            {Array.from({ length: cw.bars }).map((_, bi) => {
              const xPos = -halfW + (bi + 1) * barSpacing;
              return (
                <mesh key={`bar-${bi}`} position={[xPos, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.42, 2.4]} />
                  <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
});

const RoadsideMunicipalStreetlights3D = React.memo(function RoadsideMunicipalStreetlights3D() {
  const lights = useMemo(() => [
    { pos: [10, 0, 18], rotY: -0.7 },
    { pos: [20, 0, 36], rotY: -0.6 },
    { pos: [26, 0, 58], rotY: -0.4 },
    { pos: [30, 0, 82], rotY: -0.3 },
    { pos: [35, 0, 115], rotY: -0.3 },
    { pos: [40, 0, 150], rotY: -0.2 },
    { pos: [46, 0, 180], rotY: -0.1 },
    { pos: [-12, 0, -6], rotY: 1.5 },
    { pos: [-24, 0, -12], rotY: 1.4 },
    { pos: [-42, 0, -18], rotY: 1.4 },
    { pos: [-60, 0, -22], rotY: 1.4 },
    { pos: [-76, 0, -26], rotY: 1.5 },
    { pos: [8, 0, -22], rotY: 0.1 },
    { pos: [20, 0, -36], rotY: 0.3 },
    { pos: [30, 0, -50], rotY: 0.4 },
  ], []);

  return (
    <group name="MunicipalStreetlights">
      {lights.map((l, idx) => (
        <group key={`slight-${idx}`} position={l.pos as [number, number, number]} rotation={[0, l.rotY, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.2, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh position={[0, 2.3, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 4.4, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
          </mesh>
          <group position={[0, 4.4, 0]}>
            <mesh position={[0.7, 0.2, 0]} rotation={[0, 0, -0.45]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 1.6, 8]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[1.4, 0.5, 0]}>
              <boxGeometry args={[0.65, 0.14, 0.24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[1.4, 0.42, 0]}>
              <planeGeometry args={[0.55, 0.18]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
});

const RoadsidePedestrianRailings3D = React.memo(function RoadsidePedestrianRailings3D() {
  const barrierSections = useMemo(() => [
    { start: [-14, 0, -8], end: [-26, 0, -14], posts: 6 },
    { start: [2, 0, -16], end: [10, 0, -24], posts: 5 },
  ], []);

  return (
    <group name="PedestrianSafetyRailings">
      {barrierSections.map((sec, sidx) => {
        const dx = sec.end[0] - sec.start[0];
        const dz = sec.end[2] - sec.start[2];
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dx, dz);
        const midX = (sec.start[0] + sec.end[0]) / 2;
        const midZ = (sec.start[2] + sec.end[2]) / 2;

        return (
          <group key={`rail-${sidx}`} position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, len, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.48, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, len, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.7} />
            </mesh>
            {Array.from({ length: sec.posts }).map((_, pi) => {
              const pz = -len / 2 + (pi / (sec.posts - 1)) * len;
              return (
                <mesh key={`post-${pi}`} position={[0, 0.45, pz]} castShadow>
                  <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
                  <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.6} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
});

function RoadsideStylizedElements() {
  const treeNodes = useMemo<[number, number][]>(() => [
    [-32, 2], [-44, -4], [-56, -6], [-70, -8], [-84, -12],
    [38, -26], [58, -26], [74, -26], [90, -26], [110, -26],
    [8, 34], [14, 56], [18, 78], [20, 105],
    [-12, 16], [-26, 42], [-40, 42],
  ], []);

  return (
    <group name="RoadsideStylizedElements">
      {treeNodes.map(([tx, tz], i) => (
        <group key={`rtree-${i}`} position={[tx, 0.05, tz]}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.75, 8]} />
            <meshStandardMaterial color="#713f12" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.95, 14, 14]} />
            <meshStandardMaterial color="#166534" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color="#22c55e" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function RoadNetwork() {
  return (
    <group name="BoisarRoadNetwork">
      {BOISAR_ROADS.map((road) => (
        <CurvedRoadMesh key={road.id} road={road} />
      ))}

      <RoadsideMunicipalStreetlights3D />

      <RoadsidePedestrianRailings3D />

      <RoadsideStylizedElements />
    </group>
  );
}

