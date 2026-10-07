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
  // 1. Boisar–Palghar Road (Major Arterial Highway running South to North-East past Saravali & Betegaon)
  {
    id: 'boisar-palghar-main',
    name: 'Boisar–Palghar Road (SH-40)',
    type: 'arterial',
    width: 7.6,
    points: [
      [28, 0, 52],      // Toward Palghar
      [24, 0, 36],      // Near D305 Station / Betegaon entrance
      [16, 0, 22],      // Saravali junction
      [5, 0, 10],       // Transition towards town
      [-4, 0, 0],       // Boisar MIDC Circle / Central Roundabout
      [6, 0, -18],      // Boisar Town Centre
      [18, 0, -32],     // Boisar East / Station Approach
      [28, 0, -48],     // Toward Dahanu / Manor link
    ],
  },

  // 2. Navapur Road (Arterial sweeping West across Tarapur MIDC toward Navapur Coastal Beach)
  {
    id: 'navapur-road',
    name: 'Navapur Road',
    type: 'arterial',
    width: 7.2,
    points: [
      [-4, 0, 0],       // Central MIDC Circle
      [-16, 0, -4],     // MIDC Phase 1 entrance
      [-30, 0, -10],    // Tarapur MIDC Central
      [-46, 0, -15],    // Near B104 Hub
      [-58, 0, -22],    // Navapur Outer Ring
      [-72, 0, -28],    // Toward Navapur Beach & Coast
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

  // 4. Tarapur MIDC Northern Feeder & Substation Access (Connects to GRID-S01 Substation)
  {
    id: 'midc-substation-spur',
    name: 'Substation Feeder Corridor',
    type: 'industrial',
    width: 5.6,
    points: [
      [-30, 0, -10],    // Navapur Road mid-point
      [-28, 0, -24],    // Industrial Feeder Ave
      [-26, 0, -38],    // GRID-S01 Boisar Substation
      [-14, 0, -44],    // Northern Grid Sub-link
      [6, 0, -40],      // Reconnect North corridor
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
      [-4, 0, 0],       // Central Circle
      [-6, 0, -8],      // Station A102 Entrance
      [-12, 0, -14],    // Railway Yard Road
      [-20, 0, -10],    // Merge to Navapur Road
    ],
  },

  // 7. Betegaon Residential Branch (Curving cul-de-sac with Indian row houses & home chargers)
  {
    id: 'betegaon-suburban-lane',
    name: 'Betegaon Heights Lane',
    type: 'residential',
    width: 4.8,
    points: [
      [24, 0, 36],      // Highway junction
      [32, 0, 32],      // Near HOME-052
      [40, 0, 24],      // Betegaon Palms
      [36, 0, 8],       // Joins Betegaon loop
    ],
  },
];

// Pre-create Three.js CatmullRom curves for mathematical sampling
export const BOISAR_CURVES: Map<string, THREE.CatmullRomCurve3> = new Map();

BOISAR_ROADS.forEach((road) => {
  const vPoints = road.points.map((p) => new THREE.Vector3(p[0], 0.05, p[2]));
  const curve = new THREE.CatmullRomCurve3(vPoints, false, 'catmullrom', 0.5);
  BOISAR_CURVES.set(road.id, curve);
});

export const BOISAR_POIs = {
  stationA102: {
    id: 'st-a102',
    code: 'A102',
    name: 'Boisar Central Hub',
    district: 'Railway Station / Market Corridor',
    position: [-8, 0, -8] as [number, number, number],
    queuePositions: [
      [-4.5, 0, -13] as [number, number, number],
      [-2.0, 0, -13] as [number, number, number],
      [0.5, 0, -13] as [number, number, number],
    ],
  },
  stationB104: {
    id: 'st-b104',
    code: 'B104',
    name: 'Navapur Road Hub',
    district: 'West Industrial Corridor',
    position: [-48, 0, -14] as [number, number, number],
    queuePositions: [
      [-44, 0, -19] as [number, number, number],
      [-41.5, 0, -19] as [number, number, number],
      [-39, 0, -19] as [number, number, number],
    ],
  },
  stationC201: {
    id: 'st-c201',
    code: 'C201',
    name: 'MIDC Industrial Hub',
    district: 'Tarapur Heavy Chemical Zone',
    position: [-38, 0, 22] as [number, number, number],
    queuePositions: [
      [-34, 0, 27] as [number, number, number],
      [-31.5, 0, 27] as [number, number, number],
      [-29, 0, 27] as [number, number, number],
    ],
  },
  stationD305: {
    id: 'st-d305',
    code: 'D305',
    name: 'Boisar–Palghar Corridor',
    district: 'South Highway Interchange',
    position: [26, 0, 36] as [number, number, number],
    queuePositions: [
      [30, 0, 31] as [number, number, number],
      [32.5, 0, 31] as [number, number, number],
      [35, 0, 31] as [number, number, number],
    ],
  },
  serviceCenterS03: {
    id: 's03',
    code: 'S03',
    name: 'Tarapur EV Diagnostics & Service Hub',
    district: 'MIDC Boisar Link',
    position: [-14, 0, 24] as [number, number, number],
    bays: [
      [-17, 0, 22] as [number, number, number],
      [-14, 0, 22] as [number, number, number],
      [-11, 0, 22] as [number, number, number],
      [-8, 0, 22] as [number, number, number],
    ],
  },
  substationGridS01: {
    id: 'grid-s01',
    code: 'GRID-S01',
    name: 'Boisar Distribution Substation',
    district: 'Northern Transmission Zone',
    position: [-26, 0, -38] as [number, number, number],
  },
  homeChargers: [
    {
      homeId: 'HOME-024',
      chargerId: 'HC-024',
      name: 'Betegaon Green Valley #24',
      position: [26, 0, 14] as [number, number, number],
      connectedEv: 'EV-118',
    },
    {
      homeId: 'HOME-052',
      chargerId: 'HC-052',
      name: 'Saravali Palms Villa #52',
      position: [12, 0, 28] as [number, number, number],
      connectedEv: 'EV-074',
    },
    {
      homeId: 'HOME-088',
      chargerId: 'HC-088',
      name: 'Betegaon Enclave #88',
      position: [34, 0, -12] as [number, number, number],
      connectedEv: 'EV-162',
    },
  ],
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
