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
      [32, 0, -60],
      [16, 0, -54],
      [4, 0, -40],
      [8, 0, -26],
      [12, 0, -18],
      [0, 0, 0],
      [14, 0, 30],
      [32, 0, 75],
      [36, 0, 115],
      [40, 0, 155],
      [50, 0, 215],
    ],
  },

  {
    id: 'shirgaon-coastal-road',
    name: 'Shirgaon Beach Coastal Highway',
    type: 'arterial',
    width: 7.4,
    points: [
      [40, 0, 155],
      [0, 0, 175],
      [-50, 0, 195],
      [-95, 0, 215],
    ],
  },

  {
    id: 'shirgaon-palghar-link',
    name: 'Shirgaon–Palghar Link Road',
    type: 'arterial',
    width: 7.2,
    points: [
      [-95, 0, 215],
      [-45, 0, 215],
      [0, 0, 215],
      [50, 0, 215],
    ],
  },

  {
    id: 'navapur-road',
    name: 'Tarapur Coastal Highway',
    type: 'arterial',
    width: 7.4,
    points: [
      [0, 0, 0],
      [-30, 0, -5],
      [-60, 0, -10],
      [-95, 0, -10],
      [-135, 0, -35],
      [-170, 0, -65],
    ],
  },

  {
    id: 'manor-nh48-expressway',
    name: 'Manor NH-48 Express Highway',
    type: 'highway',
    width: 8.4,
    points: [
      [12, 0.04, -18],
      [60, 0.04, -20],
      [115, 0.04, -22],
      [165, 0.04, -24],
      [205, 0.04, -25],
    ],
  },

  {
    id: 'dahanu-north-highway',
    name: 'Dahanu Northern Arterial Highway',
    type: 'highway',
    width: 7.6,
    points: [
      [32, 0, -60],
      [34, 0, -115],
      [35, 0, -175],
      [35, 0, -230],
    ],
  },

  {
    id: 'palghar-manor-connector',
    name: 'Palghar–Manor Link Road',
    type: 'arterial',
    width: 7.2,
    points: [
      [50, 0, 215],
      [105, 0, 150],
      [160, 0, 70],
      [205, 0, -25],
    ],
  },

  {
    id: 'tarapur-midc-ring',
    name: 'Tarapur MIDC Industrial Ring',
    type: 'industrial',
    width: 6.8,
    points: [
      [-30, 0, -5],
      [-50, 0, 35],
      [-70, 0, 80],
      [-55, 0, 105],
      [-30, 0, 125],
      [-10, 0, 80],
      [14, 0, 30],
    ],
  },

  {
    id: 'midc-substation-spur',
    name: 'Substation Feeder Corridor',
    type: 'industrial',
    width: 6.2,
    points: [
      [-60, 0, -10],
      [-55, 0, -50],
      [-50, 0, -90],
      [-10, 0, -80],
      [32, 0, -60],
    ],
  },

  {
    id: 'betegaon-saravali-loop',
    name: 'Saravali–Betegaon Link Road',
    type: 'residential',
    width: 6.0,
    points: [
      [14, 0, 30],
      [45, 0, 25],
      [80, 0, 15],
      [55, 0, -5],
      [12, 0, -18],
    ],
  },

  {
    id: 'station-a102-slip-road',
    name: 'Station A102 Dedicated Access Driveway',
    type: 'arterial',
    width: 5.4,
    points: [
      [4, 0, -40],
      [10, 0, -40],
      [16, 0, -40],
    ],
  },
  {
    id: 'station-b104-slip-road',
    name: 'Station B104 Dedicated Access Driveway',
    type: 'arterial',
    width: 5.4,
    points: [
      [-95, 0, -10],
      [-95, 0, -14],
      [-95, 0, -18],
    ],
  },
  {
    id: 'station-c201-slip-road',
    name: 'Station C201 Dedicated Access Driveway',
    type: 'industrial',
    width: 5.4,
    points: [
      [-70, 0, 80],
      [-74, 0, 80],
      [-78, 0, 80],
    ],
  },
  {
    id: 'station-d305-slip-road',
    name: 'Station D305 Dedicated Access Driveway',
    type: 'arterial',
    width: 5.4,
    points: [
      [32, 0, 75],
      [38, 0, 75],
      [45, 0, 75],
    ],
  },
  {
    id: 'station-p401-slip-road',
    name: 'Station P401 Dedicated Access Driveway',
    type: 'arterial',
    width: 5.4,
    points: [
      [50, 0, 215],
      [57, 0, 215],
      [65, 0, 215],
    ],
  },
  {
    id: 'station-s801-slip-road',
    name: 'Station S801 Dedicated Access Driveway',
    type: 'arterial',
    width: 5.4,
    points: [
      [-95, 0, 215],
      [-99, 0, 215],
      [-103, 0, 215],
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
  { id: 'jct-palghar', name: 'Palghar Central Interchange (SH-40 Corridor)', x: 50, y: 0.04, z: 215, radius: 4.4, type: 'major_cross' },
  { id: 'jct-umroli', name: 'Umroli Regional Interchange (SH-40 & Coastal Branch)', x: 40, y: 0.04, z: 155, radius: 4.2, type: 'interchange' },
  { id: 'jct-saravali', name: 'Saravali Regional 4-Way Junction', x: 14, y: 0.04, z: 30, radius: 4.2, type: 'major_cross' },
  { id: 'jct-town', name: 'Boisar Town Center & Manor Flyover Portal', x: 12, y: 0.04, z: -18, radius: 4.4, type: 'interchange' },
  { id: 'jct-central-roundabout', name: 'Central Highway 4-Way Roundabout', x: 0, y: 0.04, z: 0, radius: 12.0, type: 'roundabout' },
  { id: 'jct-north-outer', name: 'North Boisar Outer Interchange', x: 32, y: 0.04, z: -60, radius: 4.2, type: 'interchange' },
  { id: 'jct-dahanu-terminus', name: 'Dahanu Northern Arterial Gateway', x: 35, y: 0.04, z: -230, radius: 4.2, type: 't_junction' },
  { id: 'jct-manor-terminus', name: 'Manor NH-48 Express Terminal Interchange', x: 205, y: 0.04, z: -25, radius: 4.5, type: 'major_cross' },
  { id: 'jct-shirgaon-coast', name: 'Shirgaon Coastal Promenade Junction', x: -95, y: 0.04, z: 215, radius: 4.2, type: 't_junction' },
  { id: 'jct-midc-split', name: 'Tarapur MIDC Chemical Sector Split', x: -30, y: 0.04, z: -5, radius: 4.2, type: 't_junction' },
  { id: 'jct-t601-coast', name: 'Tarapur Coastal Gateway (T601)', x: -170, y: 0.04, z: -65, radius: 4.2, type: 't_junction' },
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
    position: [26, 0, -40] as [number, number, number],
    queuePositions: [
      [26, 0, -32] as [number, number, number],
      [28.5, 0, -32] as [number, number, number],
      [31.0, 0, -32] as [number, number, number],
    ],
  },
  stationB104: {
    id: 'st-b104',
    code: 'B104',
    name: 'Navapur Road Hub',
    district: 'West Industrial Corridor',
    position: [-95, 0, -25] as [number, number, number],
    queuePositions: [
      [-95, 0, -32] as [number, number, number],
      [-92.5, 0, -32] as [number, number, number],
      [-90.0, 0, -32] as [number, number, number],
    ],
  },
  stationC201: {
    id: 'st-c201',
    code: 'C201',
    name: 'MIDC Industrial Hub',
    district: 'Tarapur Heavy Chemical Zone',
    position: [-85, 0, 80] as [number, number, number],
    queuePositions: [
      [-85, 0, 87] as [number, number, number],
      [-82.5, 0, 87] as [number, number, number],
      [-80.0, 0, 87] as [number, number, number],
    ],
  },
  stationD305: {
    id: 'st-d305',
    code: 'D305',
    name: 'Boisar–Palghar Corridor',
    district: 'South Highway Interchange',
    position: [55, 0, 75] as [number, number, number],
    queuePositions: [
      [55, 0, 82] as [number, number, number],
      [57.5, 0, 82] as [number, number, number],
      [60.0, 0, 82] as [number, number, number],
    ],
  },
  stationP401: {
    id: 'st-p401',
    code: 'P401',
    name: 'Palghar District Central Hub',
    district: 'Palghar Collectorate & Railway Junction',
    position: [75, 0, 215] as [number, number, number],
    queuePositions: [
      [75, 0, 222] as [number, number, number],
      [77.8, 0, 222] as [number, number, number],
      [80.6, 0, 222] as [number, number, number],
    ],
  },
  stationS801: {
    id: 'st-s801',
    code: 'S801',
    name: 'Shirgaon Beach & Fort Hub',
    district: 'Shirgaon Historic Coast & Ocean Promenade',
    position: [-110, 0, 215] as [number, number, number],
    queuePositions: [
      [-110, 0, 222] as [number, number, number],
      [-107.2, 0, 222] as [number, number, number],
      [-104.4, 0, 222] as [number, number, number],
    ],
  },
  stationM501: {
    id: 'st-m501',
    code: 'M501',
    name: 'Manor NH-48 Express Hub',
    district: 'Mumbai-Ahmedabad Expressway Corridor',
    position: [220, 0, -25] as [number, number, number],
    queuePositions: [
      [220, 0, -18] as [number, number, number],
      [222.8, 0, -18] as [number, number, number],
      [225.6, 0, -18] as [number, number, number],
    ],
  },
  stationT601: {
    id: 'st-t601',
    code: 'T601',
    name: 'Tarapur Coastal Energy Hub',
    district: 'Tarapur Atomic Zone & Chinchani Coast',
    position: [-185, 0, -65] as [number, number, number],
    queuePositions: [
      [-185, 0, -58] as [number, number, number],
      [-182.2, 0, -58] as [number, number, number],
      [-179.4, 0, -58] as [number, number, number],
    ],
  },
  stationD701: {
    id: 'st-d701',
    code: 'D701',
    name: 'Dahanu Highway Hub',
    district: 'North Palghar Coastal Gateway',
    position: [52, 0, -230] as [number, number, number],
    queuePositions: [
      [52, 0, -223] as [number, number, number],
      [54.8, 0, -223] as [number, number, number],
      [57.6, 0, -223] as [number, number, number],
    ],
  },
  serviceCenterS03: {
    id: 's03',
    code: 'S03',
    name: 'Tarapur EV Diagnostics & Service Hub',
    district: 'MIDC Boisar Link',
    position: [-45, 0, 125] as [number, number, number],
    bays: [
      [-48, 0, 125] as [number, number, number],
      [-45, 0, 125] as [number, number, number],
      [-42, 0, 125] as [number, number, number],
      [-39, 0, 125] as [number, number, number],
    ],
  },
  substationGridS01: {
    id: 'grid-s01',
    code: 'GRID-S01',
    name: 'Boisar Distribution Substation',
    district: 'Northern Transmission Zone',
    position: [-50, 0, -90] as [number, number, number],
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
