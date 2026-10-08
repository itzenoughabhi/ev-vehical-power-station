import * as THREE from 'three';

export interface RoadDef {
  id: string;
  name: string;
  type: 'arterial' | 'industrial' | 'residential' | 'highway';
  width: number;
  points: [number, number, number][];
}

/**
 * Real-world geographic topology of Boisar, Maharashtra (Lat: 19.7902325, Lon: 72.7657359)
 * Modeled with natural curves, branches, varied widths, and real Indian industrial/urban layout.
 */
export const BOISAR_ROADS: RoadDef[] = [
  // 1. Boisar–Palghar Road (Major Arterial Highway running South through Palghar District HQ)
  {
    id: 'boisar-palghar-main',
    name: 'Boisar–Palghar Highway (SH-40)',
    type: 'arterial',
    width: 7.8,
    points: [
      [48, 0, 200],     // Palghar District Headquarters & Collectorate (P401)
      [42, 0, 170],     // Palghar North Outskirts
      [34, 0, 135],     // Umroli Regional Interchange (Shirgaon turnoff)
      [28, 0, 95],      // Toward Palghar North
      [26, 0, 65],      // Station D305 Access Highway Junction
      [22, 0, 48],      // Betegaon South
      [16, 0, 28],      // Saravali junction
      [5, 0, 10],       // Transition towards town
      [4.5, 0, 0],      // Boisar MIDC Circle East Lane
      [-4, 0, -8.5],    // Boisar MIDC Circle North Lane
      [6, 0, -18],      // Boisar Town Centre
      [18, 0, -32],     // Boisar East / Station Approach
      [28, 0, -55],     // Toward Dahanu / Manor link
    ],
  },

  // 2. Shirgaon Coastal Fort & Beach Road (Scenic coastal highway to Shirgaon)
  {
    id: 'shirgaon-coastal-road',
    name: 'Shirgaon Beach Coastal Highway',
    type: 'arterial',
    width: 7.2,
    points: [
      [34, 0, 135],     // Umroli Junction turnoff from SH-40
      [12, 0, 150],     // Shirgaon East Palms
      [-15, 0, 170],    // Shirgaon Rural Enclave
      [-42, 0, 192],    // Shirgaon Historic Fort Approach
      [-65, 0, 210],    // Shirgaon Beach & Fort Hub (S801)
    ],
  },

  // 3. Navapur Road & Tarapur Coastal Energy Highway (Sweeping West across Tarapur Coast)
  {
    id: 'navapur-road',
    name: 'Tarapur Coastal Highway',
    type: 'arterial',
    width: 7.4,
    points: [
      [-4, 0, -8.5],    // Boisar MIDC Circle North Lane
      [-12.5, 0, -2],   // Boisar MIDC Circle West Lane
      [-16, 0, -4],     // MIDC Phase 1 entrance
      [-30, 0, -10],    // Tarapur MIDC Central
      [-48, 0, -16],    // Navapur Highway near B104 Hub
      [-68, 0, -22],    // Navapur Outer Ring
      [-82, 0, -28],    // Chinchani Coast Road
      [-96, 0, -32],    // Tarapur Coastal Energy Hub (T601) on dry land
    ],
  },

  // 4. Manor NH-48 Express Corridor (Elevated multi-level highway flyover)
  {
    id: 'manor-nh48-expressway',
    name: 'Manor NH-48 Express Highway',
    type: 'highway',
    width: 8.4,
    points: [
      [6, 0.04, -18],      // Boisar Town Centre
      [45, 2.4, -16],      // Elevated Flyover Ramp Up
      [105, 2.8, -16],     // Elevated Overpass Cross-Bridge
      [160, 2.4, -18],     // Surya River Valley Bridge
      [210, 0.04, -20],    // Manor NH-48 Express Hub (M501)
    ],
  },

  // 5. Dahanu Northern Arterial Highway (North gateway toward Dahanu Coastal Region)
  {
    id: 'dahanu-north-highway',
    name: 'Dahanu Northern Arterial Highway',
    type: 'highway',
    width: 7.6,
    points: [
      [28, 0, -55],     // Boisar North Corridor
      [30, 0, -110],    // Vangaon Junction
      [33, 0, -165],    // Dahanu Agro Chikoo Belt Corridor
      [36, 0, -220],    // Dahanu Highway Hub (D701)
    ],
  },

  // 6. Palghar–Manor Regional Connector (Completing the Palghar District Regional Ring)
  {
    id: 'palghar-manor-connector',
    name: 'Palghar–Manor Link Road',
    type: 'arterial',
    width: 7.0,
    points: [
      [48, 0, 200],     // Palghar District Central Hub
      [90, 0, 140],     // Surya River Valley Corridor South
      [155, 0, 60],     // Manor South Link
      [210, 0, -20],    // Manor NH-48 Express Hub
    ],
  },

  // 3. Tarapur MIDC Industrial Main Ring (Wide heavy-duty industrial loop connecting manufacturing & chemical sheds)
  {
    id: 'tarapur-midc-ring',
    name: 'Tarapur MIDC Industrial Ring',
    type: 'industrial',
    width: 6.8,
    points: [
      [-16, 0, -4],     // Branch off Navapur Road
      [-22, 0, 10],     // MIDC Chemical Sector
      [-36, 0, 22],     // Near C201 Industrial Hub
      [-28, 0, 34],     // Heavy Engineering Sector
      [-14, 0, 26],     // Near S03 EV Service Center
      [-2, 0, 16],      // Saravali Industrial border
      [5, 0, 10],       // Reconnect to Boisar-Palghar Highway
    ],
  },

  // 4. Tarapur MIDC Northern Feeder & Substation Access (Connects to GRID-S01 Substation [-48, 0, -65])
  {
    id: 'midc-substation-spur',
    name: 'Substation Feeder Corridor',
    type: 'industrial',
    width: 5.6,
    points: [
      [-30, 0, -10],    // Navapur Road mid-point
      [-40, 0, -32],    // Industrial Feeder Ave
      [-48, 0, -65],    // GRID-S01 Boisar Substation
      [-28, 0, -60],    // Northern Grid Sub-link
      [6, 0, -45],      // Reconnect North corridor
    ],
  },

  // 5. Saravali & Betegaon Residential Collector (Gentle curved suburban road connecting housing & green belts)
  {
    id: 'betegaon-saravali-loop',
    name: 'Saravali–Betegaon Link Road',
    type: 'residential',
    width: 5.4,
    points: [
      [16, 0, 22],      // Saravali Highway junction
      [26, 0, 18],      // Near HOME-024 (Betegaon Green Valley)
      [36, 0, 8],       // Betegaon Residential Sector
      [38, 0, -6],      // Betegaon Enclave / HOME-088
      [28, 0, -20],     // Residential Green Belt
      [18, 0, -32],     // Reconnect to Boisar East Highway
    ],
  },

  // 6. Boisar Station Access Spur (Connects Boisar Central Hub A102)
  {
    id: 'boisar-central-spur',
    name: 'Station Access Loop',
    type: 'arterial',
    width: 6.2,
    points: [
      [-4, 0, -8.5],    // Boisar MIDC Circle North Lane
      [-8, 0, -6],      // Station A102 Highway Bypass
      [-14, 0, -12],    // Station Approach
      [-20, 0, -10],    // Merge to Navapur Road
    ],
  },

  // 7. Betegaon Residential Branch (Curving residential road north of Station D305)
  {
    id: 'betegaon-suburban-lane',
    name: 'Betegaon Heights Lane',
    type: 'residential',
    width: 4.8,
    points: [
      [18, 0, 22],      // Saravali / Highway junction
      [26, 0, 22],      // Suburban connector
      [34, 0, 20],      // Near HOME-052
      [40, 0, 20],      // Betegaon Palms
      [36, 0, 8],       // Joins Betegaon loop
    ],
  },

  // 8. Shirgaon–Palghar Regional Coastal Link (Direct arterial connecting Shirgaon S801 to Palghar P401)
  {
    id: 'shirgaon-palghar-link',
    name: 'Shirgaon–Palghar Link Road',
    type: 'arterial',
    width: 7.2,
    points: [
      [-65, 0, 210],    // Shirgaon Beach & Fort Hub (S801)
      [-30, 0, 208],    // Shirgaon South Palms
      [-5, 0, 205],     // Shirgaon-Palghar Rural Cross
      [22, 0, 202],     // Palghar West Approach
      [48, 0, 200],     // Palghar District Central Hub (P401)
    ],
  },

  // 9. Station D305 Dedicated Arterial Apron Road & Turnaround Forecourt
  {
    id: 'station-d305-driveway',
    name: 'Station D305 Arterial Apron Road',
    type: 'arterial',
    width: 6.8,
    points: [
      [26, 0, 65],      // Boisar-Palghar Highway T-Junction
      [32, 0, 65],      // Forecourt approach
      [38, 0, 65],      // Station D305 Forecourt (direct bay access)
    ],
  },

  // 10. Station B104 Dedicated Apron Access Road
  {
    id: 'station-b104-driveway',
    name: 'Station B104 Access Driveway',
    type: 'industrial',
    width: 6.2,
    points: [
      [-48, 0, -16],    // Navapur Highway junction
      [-48, 0, -22],    // Forecourt approach
      [-48, 0, -28],    // Apron bays
    ],
  },

  // 11. Station C201 Dedicated Apron Access Road
  {
    id: 'station-c201-driveway',
    name: 'Station C201 Access Driveway',
    type: 'industrial',
    width: 6.2,
    points: [
      [-36, 0, 22],     // MIDC Ring Road junction
      [-42, 0, 22],     // Industrial approach
      [-48, 0, 22],     // Apron bays
    ],
  },

  // 12. Station A102 Dedicated Apron Access Road
  {
    id: 'station-a102-driveway',
    name: 'Station A102 Access Driveway',
    type: 'arterial',
    width: 6.2,
    points: [
      [-8, 0, -6],      // Spur Highway bypass
      [-8, 0, -14],     // Forecourt approach
      [-8, 0, -18],     // Apron bays
    ],
  },

  // 13. S03 Diagnostics Service Hub Dedicated Apron Access Road
  {
    id: 'service-center-s03-driveway',
    name: 'S03 Diagnostics Service Hub Driveway',
    type: 'industrial',
    width: 6.4,
    points: [
      [-28, 0, 34],     // MIDC Ring Road junction
      [-28, 0, 45],     // Forecourt approach
      [-28, 0, 54],     // S03 Workshop Service Bays
    ],
  },
];

// Pre-create Three.js CatmullRom curves for mathematical sampling
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
    position: [-8, 0, -18] as [number, number, number],
    queuePositions: [
      [-4, 0, -23] as [number, number, number],
      [-1.5, 0, -23] as [number, number, number],
      [1.0, 0, -23] as [number, number, number],
    ],
  },
  stationB104: {
    id: 'st-b104',
    code: 'B104',
    name: 'Navapur Road Hub',
    district: 'West Industrial Corridor',
    position: [-48, 0, -28] as [number, number, number],
    queuePositions: [
      [-44, 0, -33] as [number, number, number],
      [-41.5, 0, -33] as [number, number, number],
      [-39, 0, -33] as [number, number, number],
    ],
  },
  stationC201: {
    id: 'st-c201',
    code: 'C201',
    name: 'MIDC Industrial Hub',
    district: 'Tarapur Heavy Chemical Zone',
    position: [-48, 0, 22] as [number, number, number],
    queuePositions: [
      [-44, 0, 27] as [number, number, number],
      [-41.5, 0, 27] as [number, number, number],
      [-39, 0, 27] as [number, number, number],
    ],
  },
  stationD305: {
    id: 'st-d305',
    code: 'D305',
    name: 'Boisar–Palghar Corridor',
    district: 'South Highway Interchange',
    position: [38, 0, 65] as [number, number, number],
    queuePositions: [
      [42, 0, 60] as [number, number, number],
      [44.5, 0, 60] as [number, number, number],
      [47, 0, 60] as [number, number, number],
    ],
  },
  stationP401: {
    id: 'st-p401',
    code: 'P401',
    name: 'Palghar District Central Hub',
    district: 'Palghar Collectorate & Railway Junction',
    position: [48, 0, 200] as [number, number, number],
    queuePositions: [
      [52, 0, 195] as [number, number, number],
      [54.8, 0, 195] as [number, number, number],
      [57.6, 0, 195] as [number, number, number],
    ],
  },
  stationS801: {
    id: 'st-s801',
    code: 'S801',
    name: 'Shirgaon Beach & Fort Hub',
    district: 'Shirgaon Historic Coast & Ocean Promenade',
    position: [-65, 0, 210] as [number, number, number],
    queuePositions: [
      [-61, 0, 205] as [number, number, number],
      [-58.2, 0, 205] as [number, number, number],
      [-55.4, 0, 205] as [number, number, number],
    ],
  },
  stationM501: {
    id: 'st-m501',
    code: 'M501',
    name: 'Manor NH-48 Express Hub',
    district: 'Mumbai-Ahmedabad Expressway Corridor',
    position: [210, 0, -20] as [number, number, number],
    queuePositions: [
      [214, 0, -25] as [number, number, number],
      [216.8, 0, -25] as [number, number, number],
      [219.6, 0, -25] as [number, number, number],
    ],
  },
  stationT601: {
    id: 'st-t601',
    code: 'T601',
    name: 'Tarapur Coastal Energy Hub',
    district: 'Tarapur Atomic Zone & Chinchani Coast',
    position: [-96, 0, -32] as [number, number, number],
    queuePositions: [
      [-92, 0, -37] as [number, number, number],
      [-89.2, 0, -37] as [number, number, number],
      [-86.4, 0, -37] as [number, number, number],
    ],
  },
  stationD701: {
    id: 'st-d701',
    code: 'D701',
    name: 'Dahanu Highway Hub',
    district: 'North Palghar Coastal Gateway',
    position: [36, 0, -220] as [number, number, number],
    queuePositions: [
      [40, 0, -215] as [number, number, number],
      [42.8, 0, -215] as [number, number, number],
      [45.6, 0, -215] as [number, number, number],
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

/**
 * Generates high-density curved waypoints between two POIs or road segments.
 */
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

/**
 * Finds the closest point and tangent vector on the Boisar road network.
 */
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
  laneOffset: number; // -1.4m (left lane) to +1.4m (right lane)
}

/**
 * Finds an intersecting or connecting road within proximity of a given point.
 */
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
        // Direction is forward (+1) if near start (u < 0.5), reverse (-1) if near end (u >= 0.5)
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

/**
 * Advance vehicle position and heading along authentic Boisar road network.
 * Keeps the EV strictly on the asphalt roadway with responsive steering,
 * lane positioning, and smooth transitions at intersections.
 */
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

  // Lane steering adjustments
  if (steerInput === 'left') {
    nextLaneOffset = Math.max(-1.6, nextLaneOffset - 2.8 * delta);
  } else if (steerInput === 'right') {
    nextLaneOffset = Math.min(1.6, nextLaneOffset + 2.8 * delta);
  } else {
    // Return toward right-hand driving lane (matches going vehicle on right, coming on left)
    nextLaneOffset = THREE.MathUtils.damp(nextLaneOffset, 1.45, 1.8, delta);
  }

  // Calculate curve parameter displacement based on speed (km/h -> m/s)
  const forwardMeters = (speedKmh / 3.6) * delta;
  let nextU = driveState.u + (forwardMeters / roadLength) * nextDirection;

  // Check endpoint transitions / road network links
  if (nextU > 1.0 || nextU < 0.0) {
    const endPt = curve.getPointAt(nextU > 1.0 ? 1.0 : 0.0);
    const connected = findConnectedRoad(nextRoadId, endPt);
    if (connected) {
      nextRoadId = connected.roadId;
      nextU = connected.u;
      nextDirection = connected.direction;
    } else {
      // Terminal dead end (e.g. Navapur Beach) -> smooth U-turn and return
      nextDirection = (nextDirection === 1 ? -1 : 1) as (1 | -1);
      nextU = Math.max(0.01, Math.min(0.99, nextU));
      nextLaneOffset = -nextLaneOffset;
    }
  }

  const activeCurve = BOISAR_CURVES.get(nextRoadId) || curve;
  const clampedU = Math.max(0, Math.min(1, nextU));
  const curvePoint = activeCurve.getPointAt(clampedU);
  const tangent = activeCurve.getTangentAt(clampedU);

  // Normal vector perpendicular to roadway tangent
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

  // Position vehicle precisely on the road with lane offset
  const posX = curvePoint.x + normal.x * nextLaneOffset;
  const posZ = curvePoint.z + normal.z * nextLaneOffset;

  // Orientation aligned with curve heading
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
