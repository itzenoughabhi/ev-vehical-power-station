'use client';

import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { BOISAR_ROADS, BOISAR_CURVES, RoadDef } from './boisarRoads';

/**
 * Procedurally generates a smooth ribbon road surface with sidewalks and lane markings
 * that follows a CatmullRom 3D curve naturally.
 */
function CurvedRoadMesh({ road }: { road: RoadDef }) {
  const curve = BOISAR_CURVES.get(road.id);

  const { roadGeo, sidewalkLeftGeo, sidewalkRightGeo, centerLineGeo, leftBoundaryGeo, rightBoundaryGeo } = useMemo(() => {
    if (!curve) return {};

    const samples = 64;
    const points = curve.getPoints(samples);
    const w = road.width;
    const halfW = w / 2;
    const swW = 1.1; // sidewalk width

    // Road Base Geometry (2 triangles per segment)
    const roadVerts: number[] = [];
    const roadIndices: number[] = [];
    const swLeftVerts: number[] = [];
    const swRightVerts: number[] = [];
    const centerLineVerts: number[] = [];
    const leftBoundVerts: number[] = [];
    const rightBoundVerts: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const pt = points[i];
      const tangent = curve.getTangentAt(Math.max(0, Math.min(1, u)));
      // Normal vector in XZ plane: (-tangent.z, 0, tangent.x)
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Road outer edge points
      const pLeft = pt.clone().addScaledVector(normal, halfW);
      const pRight = pt.clone().addScaledVector(normal, -halfW);

      roadVerts.push(pLeft.x, 0.04, pLeft.z);
      roadVerts.push(pRight.x, 0.04, pRight.z);

      // Sidewalk outer points
      const pSwLeftOuter = pt.clone().addScaledVector(normal, halfW + swW);
      const pSwRightOuter = pt.clone().addScaledVector(normal, -halfW - swW);

      swLeftVerts.push(pSwLeftOuter.x, 0.07, pSwLeftOuter.z);
      swLeftVerts.push(pLeft.x, 0.07, pLeft.z);

      swRightVerts.push(pRight.x, 0.07, pRight.z);
      swRightVerts.push(pSwRightOuter.x, 0.07, pSwRightOuter.z);

      // Center lane dashed marking (width 0.22)
      const cLeft = pt.clone().addScaledVector(normal, 0.11);
      const cRight = pt.clone().addScaledVector(normal, -0.11);
      centerLineVerts.push(cLeft.x, 0.055, cLeft.z);
      centerLineVerts.push(cRight.x, 0.055, cRight.z);

      // Outer solid white lines
      const olLeft = pt.clone().addScaledVector(normal, halfW - 0.35);
      const olRight = pt.clone().addScaledVector(normal, halfW - 0.45);
      leftBoundVerts.push(olLeft.x, 0.052, olLeft.z);
      leftBoundVerts.push(olRight.x, 0.052, olRight.z);

      const orLeft = pt.clone().addScaledVector(normal, -halfW + 0.45);
      const orRight = pt.clone().addScaledVector(normal, -halfW + 0.35);
      rightBoundVerts.push(orLeft.x, 0.052, orLeft.z);
      rightBoundVerts.push(orRight.x, 0.052, orRight.z);

      if (i < samples) {
        const base = i * 2;
        // Two triangles for quad
        roadIndices.push(base, base + 1, base + 2);
        roadIndices.push(base + 1, base + 3, base + 2);
      }
    }

    const createBufferGeo = (verts: number[]) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.setIndex(roadIndices);
      geo.computeVertexNormals();
      return geo;
    };

    return {
      roadGeo: createBufferGeo(roadVerts),
      sidewalkLeftGeo: createBufferGeo(swLeftVerts),
      sidewalkRightGeo: createBufferGeo(swRightVerts),
      centerLineGeo: createBufferGeo(centerLineVerts),
      leftBoundaryGeo: createBufferGeo(leftBoundVerts),
      rightBoundaryGeo: createBufferGeo(rightBoundVerts),
    };
  }, [curve, road]);

  if (!roadGeo) return null;

  return (
    <group name={`road-${road.id}`}>
      {/* 1. Asphalt Road Bed — Realistic Dark Charcoal with subtle roughness */}
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial
          color="#333842"
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* 2. Concrete Sidewalks / Curbs along both edges */}
      {sidewalkLeftGeo && (
        <mesh geometry={sidewalkLeftGeo} receiveShadow>
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>
      )}
      {sidewalkRightGeo && (
        <mesh geometry={sidewalkRightGeo} receiveShadow>
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>
      )}

      {/* 3. Center Lane Divider — Crisp White / Yellow */}
      {centerLineGeo && (
        <mesh geometry={centerLineGeo}>
          <meshBasicMaterial
            color={road.type === 'arterial' ? '#ffffff' : '#f59e0b'}
            opacity={0.85}
            transparent
          />
        </mesh>
      )}

      {/* 4. Outer Lane Boundary Lines */}
      {leftBoundaryGeo && (
        <mesh geometry={leftBoundaryGeo}>
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      )}
      {rightBoundaryGeo && (
        <mesh geometry={rightBoundaryGeo}>
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      )}
    </group>
  );
}

/**
 * Boisar MIDC Circle / Central Traffic Roundabout at [-4, 0, 0]
 * Natural intersection with circular island, fountain/monument, and asphalt roadway.
 */
function BoisarCentralRoundabout() {
  return (
    <group position={[-4, 0, 0]}>
      {/* Outer Asphalt Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]} receiveShadow>
        <ringGeometry args={[5.2, 11.8, 48]} />
        <meshStandardMaterial color="#333842" roughness={0.88} />
      </mesh>

      {/* Outer Sidewalk Curb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[11.8, 12.8, 48]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>

      {/* White circulating lane marking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <ringGeometry args={[8.4, 8.6, 48]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>

      {/* Inner Raised Island Concrete Curb */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[5.2, 5.4, 0.5, 36]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.85} />
      </mesh>

      {/* Landscaped Green Grass Island */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[5.0, 5.0, 0.08, 36]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
      </mesh>

      {/* Boisar MIDC Monument / Central Pillar */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.2, 3.4, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 4.2, 0]} castShadow>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Concrete utility poles & street lights along the road curves.
 */
function RoadsideUtilityPoles() {
  const poles = useMemo(() => {
    const list: [number, number, number][] = [];
    BOISAR_ROADS.forEach((road) => {
      const curve = BOISAR_CURVES.get(road.id);
      if (!curve) return;

      const totalLen = curve.getLength();
      const count = Math.max(3, Math.floor(totalLen / 16));

      for (let i = 0; i <= count; i++) {
        const u = i / count;
        const pt = curve.getPointAt(u);
        const tangent = curve.getTangentAt(u);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        const polePos = pt.clone().addScaledVector(normal, road.width / 2 + 1.6);
        list.push([polePos.x, 0, polePos.z]);
      }
    });
    return list;
  }, []);

  return (
    <group name="UtilityPoles">
      {poles.map(([px, py, pz], idx) => (
        <group key={`pole-${idx}`} position={[px, 0, pz]}>
          {/* Concrete Pole Column */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 6.4, 8]} />
            <meshStandardMaterial color="#64748b" roughness={0.85} />
          </mesh>

          {/* Cross-arm for overhead distribution cables */}
          <mesh position={[0, 5.8, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.12]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>

          {/* Ceramic Insulators */}
          {[-0.65, 0, 0.65].map((ox, cidx) => (
            <mesh key={`ins-${cidx}`} position={[ox, 5.95, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.22, 6]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.7} />
            </mesh>
          ))}

          {/* Streetlight Luminaire Arm */}
          <mesh position={[0, 5.5, 0.4]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 5.9, 0.9]}>
            <boxGeometry args={[0.2, 0.08, 0.35]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Subtle light fixture */}
          <mesh position={[0, 5.84, 0.9]}>
            <planeGeometry args={[0.16, 0.28]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Renders all 768 authentic OpenStreetMap road ways harvested around Boisar (Overpass API)
 * directly in 3D space, capturing real curves, industrial MIDC connections, Betegaon & Saravali lanes.
 */
function RealOsmRoadsMesh() {
  const [segments, setSegments] = useState<{ x: number; z: number }[][]>([]);

  useEffect(() => {
    fetch('/data/boisar_road_graph.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.segments) {
          const segs = data.segments.map((s: any) => s.geometry3D);
          setSegments(segs);
        }
      })
      .catch((err) => console.warn('Could not load OSM road graph in 3D:', err));
  }, []);

  const lineGeo = useMemo(() => {
    if (!segments.length) return null;
    const positions: number[] = [];
    segments.forEach((pts) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        positions.push(p1.x, 0.03, p1.z);
        positions.push(p2.x, 0.03, p2.z);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [segments]);

  if (!lineGeo) return null;

  return (
    <lineSegments geometry={lineGeo}>
      <lineBasicMaterial color="#64748b" opacity={0.6} transparent linewidth={1} />
    </lineSegments>
  );
}

export function RoadNetwork() {
  return (
    <group name="BoisarRoadNetwork">
      {/* 1. All 768 authentic OpenStreetMap road ways across Boisar */}
      <RealOsmRoadsMesh />

      {/* 2. Natural curved road geometry for all primary Boisar avenues */}
      {BOISAR_ROADS.map((road) => (
        <CurvedRoadMesh key={road.id} road={road} />
      ))}

      {/* 3. Central Boisar Roundabout */}
      <BoisarCentralRoundabout />

      {/* 4. Concrete Utility Poles & Streetlights */}
      <RoadsideUtilityPoles />
    </group>
  );
}
