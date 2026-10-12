'use client';

import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { BOISAR_ROADS, BOISAR_CURVES, BOISAR_INTERSECTIONS, BOISAR_POIs, RoadDef } from './boisarRoads';

const CurvedRoadMesh = React.memo(function CurvedRoadMesh({ road }: { road: RoadDef }) {
  const curve = BOISAR_CURVES.get(road.id);

  const {
    roadGeo,
    curbLeftGeo,
    curbRightGeo,
    dashedCenterGeo,
    leftBoundaryGeo,
    rightBoundaryGeo,
    medianDividerGeo,
    medianCapGeo,
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
      const u = Math.min(1.0, Math.max(0.0, i / samples));
      const pt = curve.getPointAt(u);
      const tangent = curve.getTangentAt(u);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);

      const roadY = Math.max(0.046, (pt.y || 0) + 0.006);

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
        // Counter-Clockwise winding facing upward (+Y)
        roadIndices.push(base, base + 2, base + 1);
        roadIndices.push(base + 1, base + 2, base + 3);

        curbIndices.push(base, base + 2, base + 1);
        curbIndices.push(base + 1, base + 2, base + 3);
      }
    }

    const isSlipRoad = road.id.includes('slip') || road.id.includes('station-');
    const totalLength = curve.getLength();
    const dashLength = 1.8;
    const gapLength = 1.3;
    const cycle = dashLength + gapLength;
    const numCycles = isSlipRoad ? 0 : Math.floor(totalLength / cycle);

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
        if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);

        const roadY = Math.max(0.046, (pt.y || 0) + 0.006) + 0.016;
        const halfDashW = 0.10;

        const dLeft = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, halfDashW);
        const dRight = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, -halfDashW);

        dashVerts.push(dLeft.x, dLeft.y, dLeft.z);
        dashVerts.push(dRight.x, dRight.y, dRight.z);

        if (s < subSteps) {
          const b = dashVertOffset + s * 2;
          dashIndices.push(b, b + 2, b + 1);
          dashIndices.push(b + 1, b + 2, b + 3);
        }
      }
      dashVertOffset += (subSteps + 1) * 2;
    }

    // Physical Road Divider (Jersey Median Barrier separating coming and going traffic)
    const dividerVerts: number[] = [];
    const dividerIndices: number[] = [];
    const dividerCapVerts: number[] = [];
    const dividerCapIndices: number[] = [];

    const junctionGap = 4.8; // 4.8m gap at each intersection for free turns
    const uStart = Math.min(0.12, junctionGap / totalLength);
    const uEnd = Math.max(0.88, 1.0 - junctionGap / totalLength);

    if (road.width >= 7.0 && totalLength > 18 && uEnd > uStart) {
      const divSamples = Math.max(28, Math.round((totalLength - junctionGap * 2) * 1.1));
      const halfBaseW = 0.26; // 52cm base width
      const halfTopW = 0.16;  // 32cm top width
      const barrierH = 0.38;  // 38cm barrier height

      let dOffset = 0;
      let cOffset = 0;

      for (let d = 0; d <= divSamples; d++) {
        const u = uStart + (d / divSamples) * (uEnd - uStart);
        const pt = curve.getPointAt(u);
        const tangent = curve.getTangentAt(u);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);

        const roadY = Math.max(0.046, (pt.y || 0) + 0.006);

        // Smooth taper at barrier extremities
        let taper = 1.0;
        if (d < 3) taper = (d + 0.2) / 3.2;
        if (d > divSamples - 3) taper = (divSamples - d + 0.2) / 3.2;

        const curH = barrierH * taper;
        const curBaseW = halfBaseW * (0.5 + 0.5 * taper);
        const curTopW = halfTopW * taper;

        const bLeft = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, curBaseW);
        const bRight = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, -curBaseW);
        const tRight = new THREE.Vector3(pt.x, roadY + curH, pt.z).addScaledVector(normal, -curTopW);
        const tLeft = new THREE.Vector3(pt.x, roadY + curH, pt.z).addScaledVector(normal, curTopW);

        dividerVerts.push(bLeft.x, bLeft.y, bLeft.z);
        dividerVerts.push(bRight.x, bRight.y, bRight.z);
        dividerVerts.push(tRight.x, tRight.y, tRight.z);
        dividerVerts.push(tLeft.x, tLeft.y, tLeft.z);

        if (d < divSamples) {
          const b = dOffset;
          // Left face
          dividerIndices.push(b, b + 4, b + 7);
          dividerIndices.push(b, b + 7, b + 3);

          // Right face
          dividerIndices.push(b + 1, b + 2, b + 6);
          dividerIndices.push(b + 1, b + 6, b + 5);

          // Top face
          dividerIndices.push(b + 3, b + 7, b + 6);
          dividerIndices.push(b + 3, b + 6, b + 2);
        }
        dOffset += 4;

        // Top Reflective Safety Stripe
        const capL = new THREE.Vector3(pt.x, roadY + curH + 0.012, pt.z).addScaledVector(normal, curTopW * 0.75);
        const capR = new THREE.Vector3(pt.x, roadY + curH + 0.012, pt.z).addScaledVector(normal, -curTopW * 0.75);
        dividerCapVerts.push(capL.x, capL.y, capL.z);
        dividerCapVerts.push(capR.x, capR.y, capR.z);

        if (d < divSamples) {
          const cb = cOffset;
          dividerCapIndices.push(cb, cb + 2, cb + 3);
          dividerCapIndices.push(cb, cb + 3, cb + 1);
        }
        cOffset += 2;
      }
    }

    const createGeo = (verts: number[], indices: number[]) => {
      if (verts.length === 0 || indices.length === 0) return null;
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
      medianDividerGeo: createGeo(dividerVerts, dividerIndices),
      medianCapGeo: createGeo(dividerCapVerts, dividerCapIndices),
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
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {curbLeftGeo && (
        <mesh geometry={curbLeftGeo} receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
      )}
      {curbRightGeo && (
        <mesh geometry={curbRightGeo} receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Physical Median Divider separating Coming & Going Traffic */}
      {medianDividerGeo && (
        <mesh geometry={medianDividerGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color="#475569"
            roughness={0.65}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Reflective Hazard Warning Cap on Divider */}
      {medianCapGeo && (
        <mesh geometry={medianCapGeo}>
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#d97706"
            emissiveIntensity={0.25}
            roughness={0.3}
          />
        </mesh>
      )}

      {dashedCenterGeo && !medianDividerGeo && (
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
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
      {rightBoundaryGeo && (
        <mesh geometry={rightBoundaryGeo}>
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
});

const PedestrianZebraCrossings3D = React.memo(function PedestrianZebraCrossings3D() {
  const crossings = useMemo(() => [
    { id: 'cw-town', pos: [12, 0.046, -26], rotY: 0.0, width: 7.2, bars: 8 },
    { id: 'cw-saravali', pos: [14, 0.046, 22], rotY: 0.45, width: 7.2, bars: 8 },
    { id: 'cw-umroli', pos: [40, 0.046, 147], rotY: 0.18, width: 7.0, bars: 7 },
    { id: 'cw-navapur', pos: [-45, 0.046, -8], rotY: 1.5, width: 7.0, bars: 7 },
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

const CentralRoundabout3D = React.memo(function CentralRoundabout3D() {
  return (
    <group name="CentralRoundabout" position={[0, 0, 0]}>
      {/* 1. Circulating Dual Asphalt Carriageway (Radius 5.6m to 12.2m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.042, 0]} receiveShadow>
        <ringGeometry args={[5.6, 12.2, 48]} />
        <meshStandardMaterial color="#293441" roughness={0.84} metalness={0.06} />
      </mesh>

      {/* Circulating Center Dashed White Dividing Line (Radius 8.9m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.046, 0]}>
        <ringGeometry args={[8.85, 9.02, 48]} />
        <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
      </mesh>

      {/* Circulating Inner White Edge Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.046, 0]}>
        <ringGeometry args={[5.75, 5.88, 48]} />
        <meshBasicMaterial color="#ffffff" opacity={0.75} transparent />
      </mesh>

      {/* Circulating Outer White Edge Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.046, 0]}>
        <ringGeometry args={[11.95, 12.10, 48]} />
        <meshBasicMaterial color="#ffffff" opacity={0.75} transparent />
      </mesh>

      {/* 2. Central Raised Island Concrete Curb */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[5.6, 5.8, 0.32, 36]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Raised Landscaped Interior Lawn */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[5.4, 5.4, 0.12, 36]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>

      {/* 3. Central Modern EV City Landmark Totem */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.28, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.04, 24]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.65, 3.8, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <pointLight position={[0, 4.5, 0]} color="#10b981" intensity={1.8} distance={18} decay={2} />

      {/* 4 Landscaped Shrubs on the Island */}
      {[-3.4, 3.4].map((ox, i) =>
        [-3.4, 3.4].map((oz, j) => (
          <group key={`rb-shrub-${i}-${j}`} position={[ox * 0.7, 0.55, oz * 0.7]}>
            <mesh castShadow>
              <sphereGeometry args={[0.65, 10, 10]} />
              <meshStandardMaterial color="#166534" roughness={0.7} />
            </mesh>
          </group>
        ))
      )}

      {/* 4 Chevron Directional Signs facing approaching traffic */}
      {[
        { pos: [0, 0.65, 4.8], rotY: 0 },
        { pos: [4.8, 0.65, 0], rotY: Math.PI / 2 },
        { pos: [0, 0.65, -4.8], rotY: Math.PI },
        { pos: [-4.8, 0.65, 0], rotY: -Math.PI / 2 },
      ].map((cs, idx) => (
        <group key={`csign-${idx}`} position={cs.pos as [number, number, number]} rotation={[0, cs.rotY, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.55, 0.08]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[1.3, 0.45]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 0, 0.048]}>
            <planeGeometry args={[1.1, 0.35]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}
    </group>
  );
});

const RoadsideMunicipalStreetlights3D = React.memo(function RoadsideMunicipalStreetlights3D() {
  const lights = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; rotY: number }> = [];

    BOISAR_ROADS.forEach((road) => {
      // 1. NEVER place municipal streetlights on dedicated station access slip roads!
      if (road.id.includes('slip') || road.id.includes('station-')) return;

      const curve = BOISAR_CURVES.get(road.id);
      if (!curve) return;

      const len = curve.getLength();
      if (len < 28) return;

      const stepDist = 48; // 48m spacing along highways
      const count = Math.max(1, Math.floor(len / stepDist));

      for (let i = 1; i <= count; i++) {
        const dist = (i - 0.5) * (len / count);
        const u = Math.min(0.85, Math.max(0.15, dist / len)); // Keep well away from intersection portals
        const pt = curve.getPointAt(u);
        const tangent = curve.getTangentAt(u);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const offsetDist = (road.width / 2) + 2.2; // 2.2m safely back on outer sidewalk
        const pos = new THREE.Vector3(pt.x, Math.max(0.04, pt.y), pt.z).addScaledVector(normal, side * offsetDist);
        const angle = Math.atan2(tangent.x, tangent.z) + (side > 0 ? -Math.PI / 2 : Math.PI / 2);

        // CLEARANCE CHECKS:
        // A. Station Clearance: Minimum 25m clearance from all EV charging stations
        let isBlocked = false;
        for (const st of Object.values(BOISAR_POIs) as any[]) {
          if (st.position && Math.hypot(pos.x - st.position[0], pos.z - st.position[2]) < 25) {
            isBlocked = true;
            break;
          }
        }
        if (isBlocked) continue;

        // B. Intersection Clearance: Minimum 14m clearance from all intersection centers
        for (const jct of BOISAR_INTERSECTIONS) {
          if (Math.hypot(pos.x - jct.x, pos.z - jct.z) < (jct.radius + 6.0)) {
            isBlocked = true;
            break;
          }
        }
        if (isBlocked) continue;

        // C. Road Centerline Clearance: Must be at least (road.width / 2 + 1.2m) away from ALL road paths
        for (const [rId, otherCurve] of Array.from(BOISAR_CURVES.entries())) {
          const rDef = BOISAR_ROADS.find((r) => r.id === rId);
          if (!rDef) continue;
          const numSamples = Math.max(8, Math.round(otherCurve.getLength() / 5));
          const testPts = otherCurve.getPoints(numSamples);
          for (const tp of testPts) {
            if (Math.hypot(pos.x - tp.x, pos.z - tp.z) < (rDef.width / 2 + 1.2)) {
              isBlocked = true;
              break;
            }
          }
          if (isBlocked) break;
        }
        if (isBlocked) continue;

        list.push({
          pos: [Number(pos.x.toFixed(2)), Number(pos.y.toFixed(2)), Number(pos.z.toFixed(2))],
          rotY: angle,
        });
      }
    });

    return list;
  }, []);

  return (
    <group name="MunicipalStreetlights">
      {lights.map((l, idx) => (
        <group key={`slight-${idx}`} position={l.pos as [number, number, number]} rotation={[0, l.rotY, 0]}>
          {/* Base Foundation (on sidewalk) */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.2, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.4} />
          </mesh>
          {/* Vertical Steel Mast */}
          <mesh position={[0, 2.3, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 4.4, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Overhead Cantilever Arm reaching high above the curb */}
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
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
});

const RoadsidePedestrianRailings3D = React.memo(function RoadsidePedestrianRailings3D() {
  const barrierSections = useMemo(() => [
    { start: [22, 0, 34], end: [30, 0, 50], posts: 6 },
    { start: [48, 0, 165], end: [56, 0, 185], posts: 6 },
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
    [-75, 45], [-85, 45], [-95, 30],
    [65, -85], [75, -85], [85, -85],
    [65, 45], [85, 45], [105, 45],
    [-115, -15], [-125, -20], [-135, -25],
    [120, -40], [135, -45], [150, -45],
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

      <CentralRoundabout3D />

      <RoadsideMunicipalStreetlights3D />

      <RoadsidePedestrianRailings3D />

      <RoadsideStylizedElements />
    </group>
  );
}

