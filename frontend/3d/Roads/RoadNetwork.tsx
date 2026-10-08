'use client';

import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { BOISAR_ROADS, BOISAR_CURVES, RoadDef } from './boisarRoads';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';

/**
 * Floating HUD Station Tag matching the demo image:
 * - Sleek dark glass card
 * - Neon green [EV] badge
 * - Station Code & Bay ratio: e.g. "A102 - 6/6", "B104 - 4/6"
 * - Glowing emerald battery / capacity progress bar
 */
const DemoRoadStationBadge = React.memo(function DemoRoadStationBadge({
  stationCode,
  stationName,
  position,
}: {
  stationCode: string;
  stationName: string;
  position: [number, number, number];
}) {
  const stations = useDigitalTwinStore((s) => s.stations);
  const selectStation = useDigitalTwinStore((s) => s.selectStation);

  const station = stations.find(
    (s) => s.code.toLowerCase() === stationCode.toLowerCase() || s.id.toLowerCase() === stationCode.toLowerCase()
  );

  const total = station?.chargers?.length || (stationCode.startsWith('P') || stationCode.startsWith('M') ? 6 : 4);
  const available = station
    ? station.chargers.filter((c) => c.status === 'AVAILABLE').length
    : Math.max(1, total - 1);

  const pct = Math.round((available / total) * 100);

  return (
    <group position={[position[0], position[1] + 3.2, position[2]]}>
      {/* Subtle glowing anchor pin line connecting down to the roadside verge */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
        <meshBasicMaterial color="#10b981" opacity={0.4} transparent />
      </mesh>
      <mesh position={[0, -3.1, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color="#10b981" opacity={0.8} transparent />
      </mesh>

      <Html center distanceFactor={68} zIndexRange={[10, 60]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (station) selectStation(station.id);
          }}
          className="cursor-pointer group select-none pointer-events-auto transform hover:scale-105 transition-all duration-200"
          title={`${stationName} (${stationCode}) - Click to inspect station`}
        >
          <div className="bg-[#0f172a] border border-slate-700/80 group-hover:border-emerald-500/80 rounded-xl px-3 py-1.5 shadow-2xl min-w-[130px]">
            {/* Top Row: [EV] Badge + Code & Bays */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/40 tracking-wider">
                EV
              </span>
              <span className="text-white font-mono font-bold text-xs tracking-tight">
                {stationCode} - {available}/{total}
              </span>
            </div>

            {/* Glowing Emerald Capacity / Availability Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_#10b981] transition-all duration-500"
                style={{ width: `${Math.max(15, pct)}%` }}
              />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
});

/**
 * Procedural Road Surface & Multi-Level Flyover Bridge
 * Styled exactly like the user's demo image:
 * - Crisp White Dashed Center Lane Dividers
 * - Elevated Highway Overpasses with bridge support pillars & guardrails
 * - Sleek Matte Dark Charcoal Asphalt with crisp slate curbs
 * - Stylized roadside circular green tree markers
 */
function CurvedRoadMesh({ road }: { road: RoadDef }) {
  const curve = BOISAR_CURVES.get(road.id);

  const {
    roadGeo,
    curbLeftGeo,
    curbRightGeo,
    dashedCenterGeo,
    leftBoundaryGeo,
    rightBoundaryGeo,
    guardrailLeftGeo,
    guardrailRightGeo,
    pillarPositions,
  } = useMemo(() => {
    if (!curve) return {};

    const samples = 72;
    const points = curve.getPoints(samples);
    const w = road.width;
    const halfW = w / 2;
    const curbW = 0.55; // curb width

    // Road Base Geometry
    const roadVerts: number[] = [];
    const roadIndices: number[] = [];

    // Outer Curbs
    const curbLeftVerts: number[] = [];
    const curbRightVerts: number[] = [];
    const curbIndices: number[] = [];

    // Outer Boundary Solid Lines
    const leftBoundVerts: number[] = [];
    const rightBoundVerts: number[] = [];

    // Guardrails for elevated flyover sections (y > 0.6)
    const grLeftVerts: number[] = [];
    const grRightVerts: number[] = [];
    const grIndices: number[] = [];

    // Bridge support pillars
    const pillars: [number, number, number, number][] = []; // [x, yBase, z, height]

    let hasElevatedSection = false;

    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const pt = points[i];
      const tangent = curve.getTangentAt(Math.max(0, Math.min(1, u)));
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const roadY = Math.max(0.04, pt.y);

      // Road outer edge points
      const pLeft = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, halfW);
      const pRight = new THREE.Vector3(pt.x, roadY, pt.z).addScaledVector(normal, -halfW);

      roadVerts.push(pLeft.x, pLeft.y, pLeft.z);
      roadVerts.push(pRight.x, pRight.y, pRight.z);

      // Outer Curb points (slightly raised by 0.035m)
      const curbY = roadY + 0.035;
      const pCurbLeftOuter = new THREE.Vector3(pt.x, curbY, pt.z).addScaledVector(normal, halfW + curbW);
      const pCurbRightOuter = new THREE.Vector3(pt.x, curbY, pt.z).addScaledVector(normal, -halfW - curbW);

      curbLeftVerts.push(pCurbLeftOuter.x, curbY, pCurbLeftOuter.z);
      curbLeftVerts.push(pLeft.x, curbY, pLeft.z);

      curbRightVerts.push(pRight.x, curbY, pRight.z);
      curbRightVerts.push(pCurbRightOuter.x, curbY, pCurbRightOuter.z);

      // Outer Solid White Boundary Lines
      const olLeft = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, halfW - 0.28);
      const olRight = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, halfW - 0.42);
      leftBoundVerts.push(olLeft.x, olLeft.y, olLeft.z);
      leftBoundVerts.push(olRight.x, olRight.y, olRight.z);

      const orLeft = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, -halfW + 0.42);
      const orRight = new THREE.Vector3(pt.x, roadY + 0.012, pt.z).addScaledVector(normal, -halfW + 0.28);
      rightBoundVerts.push(orLeft.x, orLeft.y, orLeft.z);
      rightBoundVerts.push(orRight.x, orRight.y, orRight.z);

      // Multi-Level Flyover Bridge Structure & Guardrails when road is elevated (y > 0.6)
      if (roadY > 0.6) {
        hasElevatedSection = true;
        const grHeight = 0.65;
        const pGrLeftBase = new THREE.Vector3(pCurbLeftOuter.x, curbY, pCurbLeftOuter.z);
        const pGrLeftTop = new THREE.Vector3(pCurbLeftOuter.x, curbY + grHeight, pCurbLeftOuter.z);

        const pGrRightBase = new THREE.Vector3(pCurbRightOuter.x, curbY, pCurbRightOuter.z);
        const pGrRightTop = new THREE.Vector3(pCurbRightOuter.x, curbY + grHeight, pCurbRightOuter.z);

        grLeftVerts.push(pGrLeftBase.x, pGrLeftBase.y, pGrLeftBase.z);
        grLeftVerts.push(pGrLeftTop.x, pGrLeftTop.y, pGrLeftTop.z);

        grRightVerts.push(pGrRightBase.x, pGrRightBase.y, pGrRightBase.z);
        grRightVerts.push(pGrRightTop.x, pGrRightTop.y, pGrRightTop.z);

        // Place cylindrical bridge piers every ~12 samples
        if (i % 12 === 0 && roadY > 1.2) {
          pillars.push([pt.x, 0, pt.z, roadY]);
        }
      }

      if (i < samples) {
        const base = i * 2;
        roadIndices.push(base, base + 1, base + 2);
        roadIndices.push(base + 1, base + 3, base + 2);

        curbIndices.push(base, base + 1, base + 2);
        curbIndices.push(base + 1, base + 3, base + 2);
      }
    }

    // Build Procedural Dashed Center Lane Marking Geometry
    // Spaced into cycles: dash (1.8m) + gap (1.3m) matching the demo image!
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
      guardrailLeftGeo: grLeftVerts.length > 0 ? createGeo(grLeftVerts, curbIndices.slice(0, (grLeftVerts.length / 2 - 1) * 6)) : null,
      guardrailRightGeo: grRightVerts.length > 0 ? createGeo(grRightVerts, curbIndices.slice(0, (grRightVerts.length / 2 - 1) * 6)) : null,
      pillarPositions: pillars,
    };
  }, [curve, road]);

  if (!roadGeo) return null;

  return (
    <group name={`road-${road.id}`}>
      {/* 1. Asphalt Road Bed — Matte Charcoal Slate matching demo image */}
      <mesh geometry={roadGeo} receiveShadow castShadow>
        <meshStandardMaterial
          color="#293441"
          roughness={0.84}
          metalness={0.06}
        />
      </mesh>

      {/* 2. Outer Curbs / Borders — Crisp Dark Slate Edge */}
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

      {/* 3. Authentic Procedural Dashed Center Line — Pure White dashes matching demo image */}
      {dashedCenterGeo && (
        <mesh geometry={dashedCenterGeo}>
          <meshBasicMaterial
            color="#ffffff"
            opacity={0.95}
            transparent
          />
        </mesh>
      )}

      {/* 4. Outer Solid White Roadway Boundaries */}
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

      {/* 5. Elevated Flyover Bridge Concrete Guardrails / Parapets */}
      {guardrailLeftGeo && (
        <mesh geometry={guardrailLeftGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.2} />
        </mesh>
      )}
      {guardrailRightGeo && (
        <mesh geometry={guardrailRightGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.2} />
        </mesh>
      )}

      {/* 6. Concrete Bridge Support Piers for Elevated Flyovers */}
      {pillarPositions && pillarPositions.map(([px, py, pz, ph], pidx) => (
        <group key={`pier-${pidx}`} position={[px, ph / 2, pz]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.55, 0.65, ph, 16]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
          {/* Bridge Pier Capital Collar */}
          <mesh position={[0, ph / 2 - 0.2, 0]} castShadow>
            <boxGeometry args={[1.6, 0.4, 1.6]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Boisar MIDC Circle / Central Traffic Roundabout at [-4, 0, 0]
 * Modern landscaped roundabout with vibrant green lawn and sleek kinetic monument.
 */
function BoisarCentralRoundabout() {
  return (
    <group position={[-4, 0, 0]}>
      {/* Outer Asphalt Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]} receiveShadow>
        <ringGeometry args={[5.2, 11.8, 48]} />
        <meshStandardMaterial color="#293441" roughness={0.82} />
      </mesh>

      {/* Outer Sidewalk Curb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[11.8, 12.8, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* White circulating dashed lane marking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <ringGeometry args={[8.4, 8.6, 48]} />
        <meshBasicMaterial color="#ffffff" opacity={0.88} transparent />
      </mesh>

      {/* Inner Raised Island Concrete Curb */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[5.2, 5.4, 0.5, 36]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.75} />
      </mesh>

      {/* Landscaped Vibrant Green Grass Island */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[5.0, 5.0, 0.08, 36]} />
        <meshStandardMaterial color="#4ade80" roughness={0.7} />
      </mesh>

      {/* Boisar Central Modern Kinetic Monument (Cobalt & Gold) */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.9, 2.6, 16]} />
        <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow>
        <torusGeometry args={[1.2, 0.16, 16, 32]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Stylized Circular Roadside Trees & Dark Architectural Blocks
 * Matching the exact visual style in the demo image
 */
function RoadsideStylizedElements() {
  // Roadside circular stylized trees with generous clearance (>4.5m) from road asphalt
  const treeNodes = useMemo<[number, number][]>(() => [
    // Navapur & Tarapur Road verges
    [-32, 2], [-44, -4], [-56, -6], [-70, -8], [-84, -12],
    // Manor Highway verges (South shoulder)
    [38, -26], [58, -26], [74, -26], [90, -26], [110, -26],
    // Boisar-Palghar Highway verges (West shoulder)
    [0, 6], [8, 34], [14, 56], [18, 78], [20, 105],
    // Tarapur MIDC roadside
    [-12, 16], [-26, 42], [-40, 42],
  ], []);

  return (
    <group name="RoadsideStylizedElements">
      {/* 1. Circular stylized green trees with shadow discs */}
      {treeNodes.map(([tx, tz], i) => (
        <group key={`rtree-${i}`} position={[tx, 0.05, tz]}>
          {/* Subtle dark drop shadow disc on ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[1.2, 16]} />
            <meshBasicMaterial color="#0f172a" opacity={0.35} transparent />
          </mesh>
          {/* Stylized circular green tree crown */}
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

/**
 * Renders authentic OpenStreetMap road ways harvested around Boisar
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
      <lineBasicMaterial color="#94a3b8" opacity={0.4} transparent linewidth={1} />
    </lineSegments>
  );
}

export function RoadNetwork() {
  // Station badge anchor locations distributed across full Palghar district
  const stationBadgeConfigs = [
    { code: 'A102', name: 'Boisar Central Hub', pos: [-8, 0, -18] as [number, number, number] },
    { code: 'B104', name: 'Navapur Road Hub', pos: [-48, 0, -28] as [number, number, number] },
    { code: 'C201', name: 'MIDC Industrial Hub', pos: [-48, 0, 22] as [number, number, number] },
    { code: 'D305', name: 'Boisar–Palghar Corridor', pos: [38, 0, 65] as [number, number, number] },
    { code: 'P401', name: 'Palghar District Central', pos: [48, 0, 200] as [number, number, number] },
    { code: 'S801', name: 'Shirgaon Beach & Fort', pos: [-65, 0, 210] as [number, number, number] },
    { code: 'M501', name: 'Manor NH-48 Express', pos: [210, 0, -20] as [number, number, number] },
    { code: 'D701', name: 'Dahanu Highway Hub', pos: [36, 0, -220] as [number, number, number] },
    { code: 'T601', name: 'Tarapur Coastal Hub', pos: [-96, 0, -32] as [number, number, number] },
  ];

  return (
    <group name="BoisarRoadNetwork">
      {/* 1. OpenStreetMap road network underlying grid */}
      <RealOsmRoadsMesh />

      {/* 2. Natural curved road network with dashed centerlines & multi-level flyover bridges */}
      {BOISAR_ROADS.map((road) => (
        <CurvedRoadMesh key={road.id} road={road} />
      ))}

      {/* 3. Central Boisar Roundabout with kinetic monument */}
      <BoisarCentralRoundabout />

      {/* 4. Stylized circular trees & dark angled building pads matching demo image */}
      <RoadsideStylizedElements />

      {/* 5. Floating HUD Station Tags (e.g. EV A102 - 6/6, EV B104 - 4/6) matching demo image */}
      {stationBadgeConfigs.map((badge) => (
        <DemoRoadStationBadge
          key={`badge-${badge.code}`}
          stationCode={badge.code}
          stationName={badge.name}
          position={badge.pos}
        />
      ))}
    </group>
  );
}
