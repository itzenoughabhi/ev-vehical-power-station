import * as THREE from 'three';

export interface RoadDef {
  id: string;
  name: string;
  type: 'arterial' | 'industrial' | 'residential' | 'highway';
  width: number;
  points: [number, number, number][];
}

export const BOISAR_ROADS: RoadDef[] = [
  {
    id: 'boisar-palghar-main',
    name: 'Boisar–Palghar Highway (SH-40)',
    type: 'arterial',
    width: 7.8,
    points: [
      [48, 0, 190],
      [42, 0, 170],
      [34, 0, 135],
      [28, 0, 95],
      [26, 0, 65],
      [22, 0, 48],
      [16, 0, 28],
      [5, 0, 10],
      [0, 0, -2],
      [6, 0, -18],
      [18, 0, -32],
      [28, 0, -55],
    ],
  },

  {
    id: 'shirgaon-coastal-road',
    name: 'Shirgaon Beach Coastal Highway',
    type: 'arterial',
    width: 7.2,
    points: [
      [34, 0, 135],
      [12, 0, 150],
      [-15, 0, 170],
      [-42, 0, 192],
      [-65, 0, 205],
    ],
  },

  {
    id: 'navapur-road',
    name: 'Tarapur Coastal Highway',
    type: 'arterial',
    width: 7.4,
    points: [
      [0, 0, -2],
      [-16, 0, -4],
      [-30, 0, -10],
      [-48, 0, -16],
      [-68, 0, -22],
      [-82, 0, -24],
      [-96, 0, -24],
    ],
  },

  {
    id: 'manor-nh48-expressway',
    name: 'Manor NH-48 Express Highway',
    type: 'highway',
    width: 8.4,
    points: [
      [6, 0.04, -18],
      [45, 0.04, -16],
      [105, 0.04, -14],
      [160, 0.04, -10],
      [210, 0.04, -8],
    ],
  },

  {
    id: 'dahanu-north-highway',
    name: 'Dahanu Northern Arterial Highway',
    type: 'highway',
    width: 7.6,
    points: [
      [28, 0, -55],
      [30, 0, -110],
      [31, 0, -165],
      [32, 0, -220],
    ],
  },

  {
    id: 'palghar-manor-connector',
    name: 'Palghar–Manor Link Road',
    type: 'arterial',
    width: 7.0,
    points: [
      [48, 0, 190],
      [90, 0, 135],
      [155, 0, 55],
      [210, 0, -8],
    ],
  },

  {
    id: 'tarapur-midc-ring',
    name: 'Tarapur MIDC Industrial Ring',
    type: 'industrial',
    width: 6.8,
    points: [
      [-16, 0, -4],
      [-22, 0, 10],
      [-36, 0, 18],
      [-28, 0, 34],
      [-14, 0, 26],
      [-2, 0, 16],
      [5, 0, 10],
    ],
  },

  {
    id: 'midc-substation-spur',
    name: 'Substation Feeder Corridor',
    type: 'industrial',
    width: 5.6,
    points: [
      [-30, 0, -10],
      [-40, 0, -32],
      [-48, 0, -50],
      [-28, 0, -50],
      [0, 0, -45],
      [18, 0, -32],
    ],
  },

  {
    id: 'betegaon-saravali-loop',
    name: 'Saravali–Betegaon Link Road',
    type: 'residential',
    width: 5.4,
    points: [
      [16, 0, 28],
      [26, 0, 18],
      [36, 0, 8],
      [38, 0, -6],
      [28, 0, -20],
      [18, 0, -32],
    ],
  },

  {
    id: 'boisar-central-spur',
    name: 'Station Access Loop',
    type: 'arterial',
    width: 6.2,
    points: [
      [0, 0, -2],
      [-8, 0, -14],
      [-14, 0, -18],
      [-16, 0, -4],
    ],
  },

  {
    id: 'betegaon-suburban-lane',
    name: 'Betegaon Heights Lane',
    type: 'residential',
    width: 4.8,
    points: [
      [16, 0, 28],
      [26, 0, 22],
      [34, 0, 20],
      [40, 0, 20],
      [36, 0, 8],
    ],
  },

  {
    id: 'shirgaon-palghar-link',
    name: 'Shirgaon–Palghar Link Road',
    type: 'arterial',
    width: 7.2,
    points: [
      [-65, 0, 205],
      [-30, 0, 203],
      [-5, 0, 200],
      [22, 0, 195],
      [48, 0, 190],
    ],
  },
];

export interface IntersectionDef {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  type: 'roundabout' | 'major_cross' | 't_junction' | 'interchange';
}

export const BOISAR_INTERSECTIONS: IntersectionDef[] = [
  { id: 'jct-palghar', name: 'Palghar Central Interchange (SH-40 Corridor)', x: 48, y: 0.04, z: 190, radius: 4.4, type: 'major_cross' },
  { id: 'jct-umroli', name: 'Umroli Regional Interchange (SH-40 & Coastal Branch)', x: 34, y: 0.04, z: 135, radius: 4.2, type: 'interchange' },
  { id: 'jct-saravali', name: 'Saravali Regional 4-Way Junction', x: 16, y: 0.04, z: 28, radius: 4.2, type: 'major_cross' },
  { id: 'jct-midc-saravali', name: 'Saravali / MIDC Industrial Link', x: 5, y: 0.04, z: 10, radius: 4.2, type: 't_junction' },
  { id: 'jct-town', name: 'Boisar Town Center & Manor Flyover Portal', x: 6, y: 0.04, z: -18, radius: 4.4, type: 'interchange' },
  { id: 'jct-east', name: 'Boisar East Railway & Residential Junction', x: 18, y: 0.04, z: -32, radius: 4.2, type: 't_junction' },
  { id: 'jct-dahanu-fork', name: 'Dahanu Northern Arterial Gateway', x: 28, y: 0.04, z: -55, radius: 4.2, type: 't_junction' },
  { id: 'jct-manor-terminus', name: 'Manor NH-48 Express Terminal Interchange', x: 210, y: 0.04, z: -8, radius: 4.5, type: 'major_cross' },
  { id: 'jct-shirgaon-coast', name: 'Shirgaon Coastal Promenade Junction', x: -65, y: 0.04, z: 205, radius: 4.2, type: 't_junction' },
  { id: 'jct-midc-branch', name: 'Tarapur MIDC Chemical Sector Split', x: -16, y: 0.04, z: -4, radius: 4.2, type: 't_junction' },
  { id: 'jct-central-cross', name: 'Central Highway 2-Lane Junction', x: 0, y: 0.04, z: -2, radius: 4.4, type: 'major_cross' },
  { id: 'jct-betegaon-merge', name: 'Betegaon Residential Loop Merge', x: 36, y: 0.04, z: 8, radius: 4.0, type: 't_junction' },
];

export const BOISAR_CURVES: Map<string, THREE.CatmullRomCurve3> = new Map();

BOISAR_ROADS.forEach((road) => {
  const vPoints = road.points.map((p) => new THREE.Vector3(p[0], typeof p[1] === 'number' ? p[1] : 0.04, p[2]));
  const curve = new THREE.CatmullRomCurve3(vPoints, false, 'catmullrom', 0.5);
  BOISAR_CURVES.set(road.id, curve);
});

export const BOISAR_POIs = {
  stationA102: {
    id: 'st-a102',
    code: 'A102',
    name: 'Boisar Central Hub',
    district: 'Railway Station / Market Corridor',
    position: [-16, 0, -28] as [number, number, number],
    queuePositions: [
      [-16, 0, -20] as [number, number, number],
      [-13.5, 0, -20] as [number, number, number],
      [-11.0, 0, -20] as [number, number, number],
    ],
  },
  stationB104: {
    id: 'st-b104',
    code: 'B104',
    name: 'Navapur Road Hub',
    district: 'West Industrial Corridor',
    position: [-48, 0, -32] as [number, number, number],
    queuePositions: [
      [-48, 0, -24] as [number, number, number],
      [-45.5, 0, -24] as [number, number, number],
      [-43.0, 0, -24] as [number, number, number],
    ],
  },
  stationC201: {
    id: 'st-c201',
    code: 'C201',
    name: 'MIDC Industrial Hub',
    district: 'Tarapur Heavy Chemical Zone',
    position: [-50, 0, 18] as [number, number, number],
    queuePositions: [
      [-43, 0, 25] as [number, number, number],
      [-40.5, 0, 25] as [number, number, number],
      [-38.0, 0, 25] as [number, number, number],
    ],
  },
  stationD305: {
    id: 'st-d305',
    code: 'D305',
    name: 'Boisar–Palghar Corridor',
    district: 'South Highway Interchange',
    position: [42, 0, 65] as [number, number, number],
    queuePositions: [
      [42, 0, 72] as [number, number, number],
      [44.5, 0, 72] as [number, number, number],
      [47.0, 0, 72] as [number, number, number],
    ],
  },
  stationP401: {
    id: 'st-p401',
    code: 'P401',
    name: 'Palghar District Central Hub',
    district: 'Palghar Collectorate & Railway Junction',
    position: [64, 0, 190] as [number, number, number],
    queuePositions: [
      [56, 0, 197] as [number, number, number],
      [58.8, 0, 197] as [number, number, number],
      [61.6, 0, 197] as [number, number, number],
    ],
  },
  stationS801: {
    id: 'st-s801',
    code: 'S801',
    name: 'Shirgaon Beach & Fort Hub',
    district: 'Shirgaon Historic Coast & Ocean Promenade',
    position: [-65, 0, 218] as [number, number, number],
    queuePositions: [
      [-65, 0, 212] as [number, number, number],
      [-62.2, 0, 212] as [number, number, number],
      [-59.4, 0, 212] as [number, number, number],
    ],
  },
  stationM501: {
    id: 'st-m501',
    code: 'M501',
    name: 'Manor NH-48 Express Hub',
    district: 'Mumbai-Ahmedabad Expressway Corridor',
    position: [212, 0, -26] as [number, number, number],
    queuePositions: [
      [211, 0, -17] as [number, number, number],
      [213.8, 0, -17] as [number, number, number],
      [216.6, 0, -17] as [number, number, number],
    ],
  },
  stationT601: {
    id: 'st-t601',
    code: 'T601',
    name: 'Tarapur Coastal Energy Hub',
    district: 'Tarapur Atomic Zone & Chinchani Coast',
    position: [-96, 0, -38] as [number, number, number],
    queuePositions: [
      [-96, 0, -31] as [number, number, number],
      [-93.2, 0, -31] as [number, number, number],
      [-90.4, 0, -31] as [number, number, number],
    ],
  },
  stationD701: {
    id: 'st-d701',
    code: 'D701',
    name: 'Dahanu Highway Hub',
    district: 'North Palghar Coastal Gateway',
    position: [48, 0, -220] as [number, number, number],
    queuePositions: [
      [40, 0, -213] as [number, number, number],
      [42.8, 0, -213] as [number, number, number],
      [45.6, 0, -213] as [number, number, number],
    ],
  },
  serviceCenterS03: {
    id: 's03',
    code: 'S03',
    name: 'Tarapur EV Diagnostics & Service Hub',
    district: 'MIDC Boisar Link',
    position: [-28, 0, 54] as [number, number, number],
    bays: [
      [-31, 0, 52] as [number, number, number],
      [-28, 0, 52] as [number, number, number],
      [-25, 0, 52] as [number, number, number],
      [-22, 0, 52] as [number, number, number],
    ],
  },
  substationGridS01: {
    id: 'grid-s01',
    code: 'GRID-S01',
    name: 'Boisar Distribution Substation',
    district: 'Northern Transmission Zone',
    position: [-48, 0, -65] as [number, number, number],
  },
  homeChargers: [
    {
      homeId: 'HOME-024',
      chargerId: 'HC-024',
      name: 'Betegaon Green Valley #24',
      position: [48, 0, 30] as [number, number, number],
      connectedEv: 'EV-118',
    },
    {
      homeId: 'HOME-052',
      chargerId: 'HC-052',
      name: 'Saravali Palms Villa #52',
      position: [46, 0, 74] as [number, number, number],
      connectedEv: 'EV-074',
    },
    {
      homeId: 'HOME-088',
      chargerId: 'HC-088',
      name: 'Betegaon Enclave #88',
      position: [78, 0, -36] as [number, number, number],
      connectedEv: 'EV-162',
    },
  ],
  civicLandmarks: {
    mandir: {
      id: 'poi-mandir',
      name: 'Shri Ram Mandir',
      type: 'temple',
      district: 'Boisar East / Heritage Temple Precinct',
      position: [95, 0, 12] as [number, number, number],
    },
    market: {
      id: 'poi-market',
      name: 'Boisar Station Road Bazaar',
      type: 'market',
      district: 'Station Road Market Promenade',
      position: [-36, 0, -82] as [number, number, number],
    },
    hospital: {
      id: 'poi-hospital',
      name: 'Boisar Multi-Specialty Hospital',
      type: 'hospital',
      district: 'North Highway Healthcare Campus',
      position: [58, 0, -118] as [number, number, number],
    },
    mall: {
      id: 'poi-mall',
      name: 'Grand Central Mall',
      type: 'mall',
      district: 'Tarapur Commercial Sector',
      position: [-86, 0, -75] as [number, number, number],
    },
  },
};

export function getCurvedRoute(roadId: string, startT: number = 0, endT: number = 1, samples: number = 32): [number, number, number][] {
  const curve = BOISAR_CURVES.get(roadId);
  if (!curve) return [];

  const points: [number, number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const t = startT + (i / samples) * (endT - startT);
    const pt = curve.getPointAt(Math.max(0, Math.min(1, t)));
    points.push([pt.x, 0.05, pt.z]);
  }
  return points;
}

export function findNearestRoadPoint(x: number, z: number): {
  road: RoadDef;
  point: THREE.Vector3;
  tangent: THREE.Vector3;
  distance: number;
  u: number;
} | null {
  let best: { road: RoadDef; point: THREE.Vector3; tangent: THREE.Vector3; distance: number; u: number } | null = null;
  let minDist = Infinity;

  for (const road of BOISAR_ROADS) {
    const curve = BOISAR_CURVES.get(road.id);
    if (!curve) continue;

    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const pt = curve.getPointAt(u);
      const d = Math.hypot(pt.x - x, pt.z - z);
      if (d < minDist) {
        minDist = d;
        const tangent = curve.getTangentAt(u);
        best = {
          road,
          point: pt,
          tangent,
          distance: d,
          u,
        };
      }
    }
  }

  return best;
}

export interface RoadDriveState {
  roadId: string;
  u: number;
  direction: 1 | -1;
  laneOffset: number;
}

export function findConnectedRoad(
  currentRoadId: string,
  pt: THREE.Vector3,
  maxDist: number = 3.6
): { roadId: string; u: number; direction: 1 | -1 } | null {
  let best: { roadId: string; u: number; direction: 1 | -1 } | null = null;
  let minDist = maxDist;

  for (const road of BOISAR_ROADS) {
    if (road.id === currentRoadId) continue;
    const curve = BOISAR_CURVES.get(road.id);
    if (!curve) continue;

    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const p = curve.getPointAt(u);
      const d = Math.hypot(p.x - pt.x, p.z - pt.z);
      if (d < minDist) {
        minDist = d;
        best = {
          roadId: road.id,
          u,
          direction: u < 0.5 ? 1 : -1,
        };
      }
    }
  }

  return best;
}

export function advanceRoadDrive(
  driveState: RoadDriveState,
  speedKmh: number,
  delta: number,
  steerInput: 'left' | 'right' | null
): {
  state: RoadDriveState;
  position: { x: number; y: number; z: number };
  heading: number;
  roadName: string;
} {
  const road = BOISAR_ROADS.find((r) => r.id === driveState.roadId) || BOISAR_ROADS[0];
  const curve = BOISAR_CURVES.get(road.id) || BOISAR_CURVES.get('boisar-palghar-main')!;
  const roadLength = curve.getLength();

  let nextRoadId = driveState.roadId;
  let nextDirection = driveState.direction;
  let nextLaneOffset = driveState.laneOffset;

  if (steerInput === 'left') {
    nextLaneOffset = Math.max(-1.6, nextLaneOffset - 2.8 * delta);
  } else if (steerInput === 'right') {
    nextLaneOffset = Math.min(1.6, nextLaneOffset + 2.8 * delta);
  } else {
    nextLaneOffset = THREE.MathUtils.damp(nextLaneOffset, 1.45, 1.8, delta);
  }

  const forwardMeters = (speedKmh / 3.6) * delta;
  let nextU = driveState.u + (forwardMeters / roadLength) * nextDirection;

  if (nextU > 1.0 || nextU < 0.0) {
    const endPt = curve.getPointAt(nextU > 1.0 ? 1.0 : 0.0);
    const connected = findConnectedRoad(nextRoadId, endPt);
    if (connected) {
      nextRoadId = connected.roadId;
      nextU = connected.u;
      nextDirection = connected.direction;
    } else {
      nextDirection = (nextDirection === 1 ? -1 : 1) as (1 | -1);
      nextU = Math.max(0.01, Math.min(0.99, nextU));
      nextLaneOffset = -nextLaneOffset;
    }
  }

  const activeCurve = BOISAR_CURVES.get(nextRoadId) || curve;
  const clampedU = Math.max(0, Math.min(1, nextU));
  const curvePoint = activeCurve.getPointAt(clampedU);
  const tangent = activeCurve.getTangentAt(clampedU);

  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

  const posX = curvePoint.x + normal.x * nextLaneOffset;
  const posZ = curvePoint.z + normal.z * nextLaneOffset;

  let heading = Math.atan2(tangent.x * nextDirection, tangent.z * nextDirection);
  if (steerInput === 'left') heading += 0.08 * nextDirection;
  if (steerInput === 'right') heading -= 0.08 * nextDirection;

  const currentRoadDef = BOISAR_ROADS.find((r) => r.id === nextRoadId) || road;

  return {
    state: {
      roadId: nextRoadId,
      u: clampedU,
      direction: nextDirection,
      laneOffset: nextLaneOffset,
    },
    position: { x: posX, y: Math.max(0.04, curvePoint.y), z: posZ },
    heading,
    roadName: currentRoadDef.name,
  };
}
