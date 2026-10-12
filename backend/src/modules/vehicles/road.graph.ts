import { Position3D } from '../../types';

export interface RoadGraphNode {
  id: string;
  name: string;
  x: number;
  z: number;
  neighbors: string[];
}

export const ROAD_NODES: Record<string, RoadGraphNode> = {
  P401_HIGHWAY: { id: 'P401_HIGHWAY', name: 'Palghar Highway Junction', x: 50, z: 215, neighbors: ['PALGHAR_NORTH', 'P401_ENTRANCE', 'PALGHAR_MANOR_LINK_1', 'SHIRGAON_LINK_3'] },
  PALGHAR_NORTH: { id: 'PALGHAR_NORTH', name: 'Palghar North Highway Corridor', x: 45, z: 185, neighbors: ['P401_HIGHWAY', 'UMROLI_JCT'] },
  UMROLI_JCT: { id: 'UMROLI_JCT', name: 'Umroli Regional Interchange', x: 40, z: 155, neighbors: ['PALGHAR_NORTH', 'BETEGAON_MID', 'SHIRGAON_PT2'] },
  BETEGAON_MID: { id: 'BETEGAON_MID', name: 'Betegaon Mid Highway Corridor', x: 36, z: 115, neighbors: ['UMROLI_JCT', 'D305_JUNCTION'] },
  D305_JUNCTION: { id: 'D305_JUNCTION', name: 'Highway D305 Access Junction', x: 32, z: 75, neighbors: ['BETEGAON_MID', 'SARAVALI_MID', 'D305_ENTRANCE'] },
  SARAVALI_MID: { id: 'SARAVALI_MID', name: 'Saravali Mid Highway Corridor', x: 23, z: 52, neighbors: ['D305_JUNCTION', 'SARAVALI_JCT'] },
  SARAVALI_JCT: { id: 'SARAVALI_JCT', name: 'Saravali / MIDC Connector', x: 14, z: 30, neighbors: ['SARAVALI_MID', 'MIDC_BORDER', 'CENTRAL_ROUNDABOUT', 'BETEGAON_HOME_024'] },
  CENTRAL_ROUNDABOUT: { id: 'CENTRAL_ROUNDABOUT', name: 'Central Highway 4-Way Interchange', x: 0, z: 0, neighbors: ['SARAVALI_JCT', 'BOISAR_TOWN', 'MIDC_BRANCH'] },
  BOISAR_TOWN: { id: 'BOISAR_TOWN', name: 'Boisar Town Center', x: 12, z: -18, neighbors: ['CENTRAL_ROUNDABOUT', 'BOISAR_EAST', 'MANOR_APPROACH_1', 'BETEGAON_GREEN'] },
  BOISAR_EAST: { id: 'BOISAR_EAST', name: 'Boisar East Bypass Highway', x: 4, z: -40, neighbors: ['BOISAR_TOWN', 'NORTH_OUTER', 'A102_ENTRANCE'] },
  NORTH_OUTER: { id: 'NORTH_OUTER', name: 'Outer Dahanu/Manor Corridor', x: 32, z: -60, neighbors: ['BOISAR_EAST', 'VANGAON_JCT', 'SUBSTATION_RECONNECT'] },

  VANGAON_JCT: { id: 'VANGAON_JCT', name: 'Vangaon Highway Junction', x: 34, z: -115, neighbors: ['NORTH_OUTER', 'DAHANU_MID'] },
  DAHANU_MID: { id: 'DAHANU_MID', name: 'Dahanu Agro Corridor Midpoint', x: 35, z: -175, neighbors: ['VANGAON_JCT', 'D701_HIGHWAY'] },
  D701_HIGHWAY: { id: 'D701_HIGHWAY', name: 'Dahanu Highway near D701', x: 35, z: -230, neighbors: ['DAHANU_MID', 'D701_ENTRANCE'] },

  SHIRGAON_PT2: { id: 'SHIRGAON_PT2', name: 'Shirgaon East Palms', x: 20, z: 165, neighbors: ['UMROLI_JCT', 'SHIRGAON_PT3'] },
  SHIRGAON_PT3: { id: 'SHIRGAON_PT3', name: 'Shirgaon Rural Enclave', x: 0, z: 175, neighbors: ['SHIRGAON_PT2', 'SHIRGAON_PT4'] },
  SHIRGAON_PT4: { id: 'SHIRGAON_PT4', name: 'Shirgaon Historic Fort Approach', x: -50, z: 195, neighbors: ['SHIRGAON_PT3', 'SHIRGAON_COAST_HWY'] },
  SHIRGAON_COAST_HWY: { id: 'SHIRGAON_COAST_HWY', name: 'Shirgaon Beach Road', x: -95, z: 215, neighbors: ['SHIRGAON_PT4', 'S801_ENTRANCE', 'SHIRGAON_LINK_1'] },
  SHIRGAON_LINK_1: { id: 'SHIRGAON_LINK_1', name: 'Shirgaon South Palms', x: -65, z: 215, neighbors: ['SHIRGAON_COAST_HWY', 'SHIRGAON_LINK_2'] },
  SHIRGAON_LINK_2: { id: 'SHIRGAON_LINK_2', name: 'Shirgaon-Palghar Rural Cross', x: -25, z: 215, neighbors: ['SHIRGAON_LINK_1', 'SHIRGAON_LINK_3'] },
  SHIRGAON_LINK_3: { id: 'SHIRGAON_LINK_3', name: 'Palghar West Approach', x: 15, z: 215, neighbors: ['SHIRGAON_LINK_2', 'P401_HIGHWAY'] },

  MANOR_APPROACH_1: { id: 'MANOR_APPROACH_1', name: 'Boisar East Flyover Ramp Up', x: 60, z: -20, neighbors: ['BOISAR_TOWN', 'MANOR_APPROACH_2'] },
  MANOR_APPROACH_2: { id: 'MANOR_APPROACH_2', name: 'Elevated Overpass Cross-Bridge', x: 115, z: -22, neighbors: ['MANOR_APPROACH_1', 'MANOR_SURYA_RIVER'] },
  MANOR_SURYA_RIVER: { id: 'MANOR_SURYA_RIVER', name: 'Surya River Expressway Bridge', x: 165, z: -24, neighbors: ['MANOR_APPROACH_2', 'M501_HIGHWAY'] },
  M501_HIGHWAY: { id: 'M501_HIGHWAY', name: 'Manor NH-48 Expressway near M501', x: 205, z: -25, neighbors: ['MANOR_SURYA_RIVER', 'PALGHAR_MANOR_LINK_2', 'M501_ENTRANCE'] },

  PALGHAR_MANOR_LINK_1: { id: 'PALGHAR_MANOR_LINK_1', name: 'Surya River Valley Corridor South', x: 105, z: 150, neighbors: ['P401_HIGHWAY', 'PALGHAR_MANOR_LINK_2'] },
  PALGHAR_MANOR_LINK_2: { id: 'PALGHAR_MANOR_LINK_2', name: 'Manor South Link', x: 160, z: 70, neighbors: ['PALGHAR_MANOR_LINK_1', 'M501_HIGHWAY'] },

  MIDC_BRANCH: { id: 'MIDC_BRANCH', name: 'Navapur Rd / MIDC Ring Split', x: -30, z: -5, neighbors: ['CENTRAL_ROUNDABOUT', 'NAVAPUR_CENTRAL', 'MIDC_CHEM'] },
  NAVAPUR_CENTRAL: { id: 'NAVAPUR_CENTRAL', name: 'Navapur Road Central', x: -60, z: -10, neighbors: ['MIDC_BRANCH', 'NAVAPUR_B104_HWY', 'FEEDER_AVE'] },
  NAVAPUR_B104_HWY: { id: 'NAVAPUR_B104_HWY', name: 'Navapur Highway near B104', x: -95, z: -10, neighbors: ['NAVAPUR_CENTRAL', 'NAVAPUR_OUTER', 'B104_ENTRANCE'] },
  NAVAPUR_OUTER: { id: 'NAVAPUR_OUTER', name: 'Navapur Outer Ring', x: -135, z: -35, neighbors: ['NAVAPUR_B104_HWY', 'CHINCHANI_COAST'] },
  CHINCHANI_COAST: { id: 'CHINCHANI_COAST', name: 'Chinchani Coast Road', x: -155, z: -50, neighbors: ['NAVAPUR_OUTER', 'T601_HIGHWAY'] },
  T601_HIGHWAY: { id: 'T601_HIGHWAY', name: 'Tarapur Coastal Highway near T601', x: -170, z: -65, neighbors: ['CHINCHANI_COAST', 'T601_ENTRANCE'] },

  MIDC_CHEM: { id: 'MIDC_CHEM', name: 'MIDC Chemical Zone', x: -50, z: 35, neighbors: ['MIDC_BRANCH', 'MIDC_C201_HWY'] },
  MIDC_C201_HWY: { id: 'MIDC_C201_HWY', name: 'MIDC Ring near C201', x: -70, z: 80, neighbors: ['MIDC_CHEM', 'MIDC_HEAVY', 'C201_ENTRANCE'] },
  MIDC_HEAVY: { id: 'MIDC_HEAVY', name: 'MIDC Heavy Engineering Sector', x: -55, z: 105, neighbors: ['MIDC_C201_HWY', 'MIDC_S03'] },
  MIDC_S03: { id: 'MIDC_S03', name: 'EV Service Center S03 Junction', x: -30, z: 125, neighbors: ['MIDC_HEAVY', 'MIDC_BORDER', 'S03_BAY_ENTRANCE'] },
  MIDC_BORDER: { id: 'MIDC_BORDER', name: 'MIDC / Saravali Industrial Border', x: -10, z: 80, neighbors: ['MIDC_S03', 'SARAVALI_JCT'] },

  A102_ENTRANCE: { id: 'A102_ENTRANCE', name: 'A102 Apron Driveway', x: 15, z: -40, neighbors: ['BOISAR_EAST', 'STATION_A102_BAY'] },
  STATION_A102_BAY: { id: 'STATION_A102_BAY', name: 'Station A102 Bay Position', x: 26, z: -40, neighbors: ['A102_ENTRANCE'] },

  B104_ENTRANCE: { id: 'B104_ENTRANCE', name: 'B104 Apron Driveway', x: -95, z: -17, neighbors: ['NAVAPUR_B104_HWY', 'STATION_B104_BAY'] },
  STATION_B104_BAY: { id: 'STATION_B104_BAY', name: 'Station B104 Bay Position', x: -95, z: -25, neighbors: ['B104_ENTRANCE'] },

  C201_ENTRANCE: { id: 'C201_ENTRANCE', name: 'C201 Apron Driveway', x: -77, z: 80, neighbors: ['MIDC_C201_HWY', 'STATION_C201_BAY'] },
  STATION_C201_BAY: { id: 'STATION_C201_BAY', name: 'Station C201 Bay Position', x: -85, z: 80, neighbors: ['C201_ENTRANCE'] },

  D305_ENTRANCE: { id: 'D305_ENTRANCE', name: 'D305 Apron Driveway', x: 45, z: 75, neighbors: ['D305_JUNCTION', 'STATION_D305_BAY'] },
  STATION_D305_BAY: { id: 'STATION_D305_BAY', name: 'Station D305 Forecourt Apron', x: 55, z: 75, neighbors: ['D305_ENTRANCE'] },

  P401_ENTRANCE: { id: 'P401_ENTRANCE', name: 'P401 Apron Driveway', x: 65, z: 215, neighbors: ['P401_HIGHWAY', 'STATION_P401_BAY'] },
  STATION_P401_BAY: { id: 'STATION_P401_BAY', name: 'Station P401 Bay Position', x: 75, z: 215, neighbors: ['P401_ENTRANCE'] },

  S801_ENTRANCE: { id: 'S801_ENTRANCE', name: 'S801 Apron Driveway', x: -102, z: 215, neighbors: ['SHIRGAON_COAST_HWY', 'STATION_S801_BAY'] },
  STATION_S801_BAY: { id: 'STATION_S801_BAY', name: 'Station S801 Bay Position', x: -110, z: 215, neighbors: ['S801_ENTRANCE'] },

  M501_ENTRANCE: { id: 'M501_ENTRANCE', name: 'M501 Apron Driveway', x: 212, z: -25, neighbors: ['M501_HIGHWAY', 'STATION_M501_BAY'] },
  STATION_M501_BAY: { id: 'STATION_M501_BAY', name: 'Station M501 Bay Position', x: 220, z: -25, neighbors: ['M501_ENTRANCE'] },

  T601_ENTRANCE: { id: 'T601_ENTRANCE', name: 'T601 Apron Driveway', x: -177, z: -65, neighbors: ['T601_HIGHWAY', 'STATION_T601_BAY'] },
  STATION_T601_BAY: { id: 'STATION_T601_BAY', name: 'Station T601 Bay Position', x: -185, z: -65, neighbors: ['T601_ENTRANCE'] },

  D701_ENTRANCE: { id: 'D701_ENTRANCE', name: 'D701 Apron Driveway', x: 43, z: -230, neighbors: ['D701_HIGHWAY', 'STATION_D701_BAY'] },
  STATION_D701_BAY: { id: 'STATION_D701_BAY', name: 'Station D701 Bay Position', x: 52, z: -230, neighbors: ['D701_ENTRANCE'] },

  S03_BAY_ENTRANCE: { id: 'S03_BAY_ENTRANCE', name: 'S03 Bay Entrance', x: -37, z: 125, neighbors: ['MIDC_S03', 'S03_WORKSHOP_BAYS'] },
  S03_WORKSHOP_BAYS: { id: 'S03_WORKSHOP_BAYS', name: 'S03 Workshop Service Bays', x: -45, z: 125, neighbors: ['S03_BAY_ENTRANCE'] },

  FEEDER_AVE: { id: 'FEEDER_AVE', name: 'Substation Feeder Ave', x: -55, z: -50, neighbors: ['NAVAPUR_CENTRAL', 'GRID_S01'] },
  GRID_S01: { id: 'GRID_S01', name: 'GRID-S01 Distribution Substation Access', x: -50, z: -90, neighbors: ['FEEDER_AVE', 'SUBSTATION_NORTH_LINK'] },
  SUBSTATION_NORTH_LINK: { id: 'SUBSTATION_NORTH_LINK', name: 'Substation North Link', x: -10, z: -80, neighbors: ['GRID_S01', 'SUBSTATION_RECONNECT'] },
  SUBSTATION_RECONNECT: { id: 'SUBSTATION_RECONNECT', name: 'Northern Grid Reconnect', x: 10, z: -70, neighbors: ['SUBSTATION_NORTH_LINK', 'NORTH_OUTER'] },

  BETEGAON_HOME_024: { id: 'BETEGAON_HOME_024', name: 'Betegaon Green Valley (HOME-024)', x: 45, z: 25, neighbors: ['SARAVALI_JCT', 'BETEGAON_SEC'] },
  BETEGAON_SEC: { id: 'BETEGAON_SEC', name: 'Betegaon Residential Sector', x: 80, z: 15, neighbors: ['BETEGAON_HOME_024', 'BETEGAON_HOME_088'] },
  BETEGAON_HOME_088: { id: 'BETEGAON_HOME_088', name: 'Betegaon Enclave (HOME-088)', x: 55, z: -5, neighbors: ['BETEGAON_SEC', 'BETEGAON_GREEN'] },
  BETEGAON_GREEN: { id: 'BETEGAON_GREEN', name: 'Betegaon Green Belt', x: 35, z: -12, neighbors: ['BETEGAON_HOME_088', 'BOISAR_TOWN'] },
};

export function findShortestPath(startId: string, endId: string): string[] {
  if (startId === endId) return [startId];
  if (!ROAD_NODES[startId] || !ROAD_NODES[endId]) return [startId, endId];

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const id of Object.keys(ROAD_NODES)) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }
  distances[startId] = 0;

  while (unvisited.size > 0) {
    let closestNode: string | null = null;
    let minDist = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        closestNode = node;
      }
    }

    if (!closestNode || distances[closestNode] === Infinity) break;
    if (closestNode === endId) break;

    unvisited.delete(closestNode);
    const currData = ROAD_NODES[closestNode];

    for (const neighborId of currData.neighbors) {
      if (!unvisited.has(neighborId)) continue;

      // STRICT STATION PASS-THROUGH PREVENTION:
      // Vehicles must NEVER use a station driveway/bay to cross between roads or as a through route.
      const isNeighborStationSpur = neighborId.includes('BAY') || neighborId.includes('ENTRANCE');
      if (isNeighborStationSpur) {
        const isTarget = neighborId === endId || (ROAD_NODES[endId]?.neighbors || []).includes(neighborId);
        const isDirectExit = closestNode === startId;
        if (!isTarget && !isDirectExit) {
          continue; // Block through-traffic through station!
        }
      }

      const neighbor = ROAD_NODES[neighborId];
      const dx = neighbor.x - currData.x;
      const dz = neighbor.z - currData.z;
      const edgeWeight = Math.sqrt(dx * dx + dz * dz);
      const alt = distances[closestNode] + edgeWeight;

      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = closestNode;
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = endId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return path.length > 1 && path[0] === startId ? path : [startId, endId];
}

export function findNearestNodeId(pos: Position3D, allowStationSpurs: boolean = false): string {
  let nearestId = 'CENTRAL_ROUNDABOUT';
  let minDist = Infinity;

  for (const [id, node] of Object.entries(ROAD_NODES)) {
    if (!allowStationSpurs && (id.includes('BAY') || id.includes('ENTRANCE'))) {
      continue;
    }
    const dx = node.x - pos.x;
    const dz = node.z - pos.z;
    const d = dx * dx + dz * dz;
    if (d < minDist) {
      minDist = d;
      nearestId = id;
    }
  }

  return nearestId;
}

export function findForwardNodeId(pos: Position3D, heading?: number): string {
  if (heading === undefined) return findNearestNodeId(pos, false);
  const fX = Math.sin(heading);
  const fZ = Math.cos(heading);

  let bestId: string | null = null;
  let bestScore = Infinity;

  for (const [id, node] of Object.entries(ROAD_NODES)) {
    if (id.includes('BAY') || id.includes('ENTRANCE')) continue;
    const dx = node.x - pos.x;
    const dz = node.z - pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 1.5 || dist > 80.0) continue;

    const forwardAlignment = (dx * fX + dz * fZ) / dist;
    if (forwardAlignment > 0.05) {
      const score = dist * (1.8 - forwardAlignment);
      if (score < bestScore) {
        bestScore = score;
        bestId = id;
      }
    }
  }

  return bestId || findNearestNodeId(pos, false);
}

function catmullRomPoint(
  p0: Position3D,
  p1: Position3D,
  p2: Position3D,
  p3: Position3D,
  t: number
): Position3D {
  const t2 = t * t;
  const t3 = t2 * t;

  const f0 = -0.5 * t3 + t2 - 0.5 * t;
  const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
  const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
  const f3 = 0.5 * t3 - 0.5 * t2;

  return {
    x: Number((p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3).toFixed(2)),
    y: 0,
    z: Number((p0.z * f0 + p1.z * f1 + p2.z * f2 + p3.z * f3).toFixed(2)),
  };
}

export function generateCurvedRouteFromNodeIds(
  nodeIds: string[],
  startPos?: Position3D,
  endPos?: Position3D,
  laneOffset: number = 2.15
): Position3D[] {
  if (nodeIds.length === 0) return [];
  if (nodeIds.length === 1) {
    const node = ROAD_NODES[nodeIds[0]];
    return [{ x: node.x, y: 0, z: node.z }];
  }

  const controlPoints: Position3D[] = [];

  if (startPos) {
    controlPoints.push({ x: startPos.x, y: 0, z: startPos.z });
  }

  for (let idx = 0; idx < nodeIds.length; idx++) {
    const id = nodeIds[idx];
    const node = ROAD_NODES[id];
    if (!node) continue;

    if (id === 'CENTRAL_ROUNDABOUT') {
      const prevId = idx > 0 ? nodeIds[idx - 1] : null;
      const nextId = idx < nodeIds.length - 1 ? nodeIds[idx + 1] : null;
      const prevPt = prevId ? ROAD_NODES[prevId] : (startPos || null);
      const nextPt = nextId ? ROAD_NODES[nextId] : (endPos || null);

      if (prevPt && nextPt) {
        const rbtRadius = 8.4;
        const entryAngle = Math.atan2(prevPt.x, prevPt.z);
        const exitAngle = Math.atan2(nextPt.x, nextPt.z);
        let diff = exitAngle - entryAngle;
        while (diff <= 0) diff += Math.PI * 2;

        const arcSteps = Math.max(3, Math.min(6, Math.round((diff * rbtRadius) / 3.2)));
        for (let s = 1; s <= arcSteps; s++) {
          const u = s / (arcSteps + 1);
          const curA = entryAngle + diff * u;
          controlPoints.push({
            x: Number((Math.sin(curA) * rbtRadius).toFixed(2)),
            y: 0,
            z: Number((Math.cos(curA) * rbtRadius).toFixed(2)),
          });
        }
      } else {
        controlPoints.push({ x: 0, y: 0, z: 8.4 });
      }
    } else {
      controlPoints.push({ x: node.x, y: 0, z: node.z });
    }
  }

  if (endPos) {
    controlPoints.push({ x: endPos.x, y: 0, z: endPos.z });
  }

  const cleaned: Position3D[] = [];
  for (let i = 0; i < controlPoints.length; i++) {
    const p = controlPoints[i];
    if (i === 0 || Math.hypot(p.x - cleaned[cleaned.length - 1].x, p.z - cleaned[cleaned.length - 1].z) > 0.4) {
      cleaned.push(p);
    }
  }

  if (cleaned.length < 2) return cleaned;

  const denseRoute: Position3D[] = [cleaned[0]];

  for (let i = 0; i < cleaned.length - 1; i++) {
    const p0 = cleaned[Math.max(0, i - 1)];
    const p1 = cleaned[i];
    const p2 = cleaned[i + 1];
    const p3 = cleaned[Math.min(cleaned.length - 1, i + 2)];

    const segDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const samples = Math.max(3, Math.ceil(segDist / 1.2));

    for (let s = 1; s <= samples; s++) {
      const t = s / samples;
      const pt = catmullRomPoint(p0, p1, p2, p3, t);
      denseRoute.push(pt);
    }
  }

  if (!laneOffset || denseRoute.length < 2) return denseRoute;

  const isStartAtBay = Boolean(
    startPos ||
    nodeIds[0]?.includes('BAY') ||
    nodeIds[0]?.includes('ENTRANCE')
  );
  const isEndAtBay = Boolean(
    endPos ||
    nodeIds[nodeIds.length - 1]?.includes('BAY') ||
    nodeIds[nodeIds.length - 1]?.includes('ENTRANCE')
  );

  const lanedRoute: Position3D[] = [];
  const N = denseRoute.length;
  let lastNx = 0;
  let lastNz = 0;

  for (let i = 0; i < N; i++) {
    const curr = denseRoute[i];

    const span = Math.min(4, Math.max(1, Math.floor(N / 8)));
    const nextIdx = Math.min(N - 1, i + span);
    const prevIdx = Math.max(0, i - span);
    const tx = denseRoute[nextIdx].x - denseRoute[prevIdx].x;
    const tz = denseRoute[nextIdx].z - denseRoute[prevIdx].z;

    const len = Math.hypot(tx, tz);
    if (len > 0.001) {
      lastNx = -tz / len;
      lastNz = tx / len;
    }

    let blend = 1.0;
    if (isStartAtBay && i < 6) {
      blend = Math.min(blend, i / 5);
    }
    if (isEndAtBay && i > N - 7) {
      blend = Math.min(blend, (N - 1 - i) / 5);
    }

    const curOffset = laneOffset * blend;

    lanedRoute.push({
      x: Number((curr.x + lastNx * curOffset).toFixed(2)),
      y: curr.y || 0,
      z: Number((curr.z + lastNz * curOffset).toFixed(2)),
    });
  }

  return lanedRoute;
}

export function getStationNodeId(stationCode: string): string {
  switch (stationCode) {
    case 'A102':
      return 'STATION_A102_BAY';
    case 'B104':
      return 'STATION_B104_BAY';
    case 'C201':
      return 'STATION_C201_BAY';
    case 'D305':
      return 'STATION_D305_BAY';
    case 'P401':
      return 'STATION_P401_BAY';
    case 'M501':
      return 'STATION_M501_BAY';
    case 'T601':
      return 'STATION_T601_BAY';
    case 'D701':
      return 'STATION_D701_BAY';
    case 'S801':
      return 'STATION_S801_BAY';
    default:
      return 'STATION_D305_BAY';
  }
}

export function getStationHighwayNodeId(stationCode: string): string {
  const bayId = getStationNodeId(stationCode);
  const entranceId = ROAD_NODES[bayId]?.neighbors[0];
  if (!entranceId) return 'CENTRAL_ROUNDABOUT';
  const highwayId = ROAD_NODES[entranceId]?.neighbors.find((n) => !n.includes('BAY'));
  return highwayId || 'CENTRAL_ROUNDABOUT';
}

export const MAJOR_ROAD_DESTINATIONS: string[] = [
  'P401_HIGHWAY',
  'PALGHAR_NORTH',
  'UMROLI_JCT',
  'BETEGAON_MID',
  'SARAVALI_JCT',
  'CENTRAL_ROUNDABOUT',
  'BOISAR_TOWN',
  'BOISAR_EAST',
  'VANGAON_JCT',
  'DAHANU_MID',
  'D701_HIGHWAY',
  'SHIRGAON_PT4',
  'SHIRGAON_COAST_HWY',
  'MANOR_SURYA_RIVER',
  'M501_HIGHWAY',
  'PALGHAR_MANOR_LINK_2',
  'MIDC_BRANCH',
  'NAVAPUR_CENTRAL',
  'NAVAPUR_BEACH',
  'T601_HIGHWAY',
  'MIDC_CHEM',
  'MIDC_HEAVY',
  'BETEGAON_SEC',
];

export function getRandomDestinationNode(excludeNode?: string): string {
  const candidates = MAJOR_ROAD_DESTINATIONS.filter((id) => id !== excludeNode && ROAD_NODES[id]);
  return candidates[Math.floor(Math.random() * candidates.length)] || 'BOISAR_TOWN';
}

export function generateRandomRoute(
  fromPos: Position3D,
  currentHeading?: number,
  excludeDestination?: string
): Position3D[] {
  const startNodeId = findForwardNodeId(fromPos, currentHeading);

  const farCandidates = MAJOR_ROAD_DESTINATIONS.filter((id) => {
    if (id === excludeDestination || id === startNodeId) return false;
    const node = ROAD_NODES[id];
    if (!node) return false;
    const distSq = (node.x - fromPos.x) ** 2 + (node.z - fromPos.z) ** 2;
    return distSq > 40 * 40;
  });

  const destNodeId = farCandidates.length > 0
    ? farCandidates[Math.floor(Math.random() * farCandidates.length)]
    : getRandomDestinationNode(startNodeId);

  const path = findShortestPath(startNodeId, destNodeId);
  return generateCurvedRouteFromNodeIds(path, fromPos);
}
