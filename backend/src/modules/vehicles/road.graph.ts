import { Position3D } from '../../types';

export interface RoadGraphNode {
  id: string;
  name: string;
  x: number;
  z: number;
  neighbors: string[];
}

/**
 * Boisar Road Topology Graph.
 * All nodes align with real road geometry in Boisar, Maharashtra (Catmull-Rom asphalt curves).
 */
export const ROAD_NODES: Record<string, RoadGraphNode> = {
  // Boisar-Palghar Highway (SH-40)
  PALGHAR_SOUTH: { id: 'PALGHAR_SOUTH', name: 'Boisar-Palghar Highway South', x: 28, z: 52, neighbors: ['BETEGAON_D305'] },
  BETEGAON_D305: { id: 'BETEGAON_D305', name: 'Betegaon / Station D305 Entrance', x: 24, z: 36, neighbors: ['PALGHAR_SOUTH', 'SARAVALI_MID'] },
  SARAVALI_MID: { id: 'SARAVALI_MID', name: 'Saravali Highway Junction', x: 16, z: 22, neighbors: ['BETEGAON_D305', 'SARAVALI_JCT', 'BETEGAON_HOME_024'] },
  SARAVALI_JCT: { id: 'SARAVALI_JCT', name: 'Saravali / MIDC Connector', x: 5, z: 10, neighbors: ['SARAVALI_MID', 'CENTRAL_ROUNDABOUT', 'MIDC_BORDER'] },
  CENTRAL_ROUNDABOUT: { id: 'CENTRAL_ROUNDABOUT', name: 'Boisar MIDC Central Roundabout', x: -4, z: 0, neighbors: ['SARAVALI_JCT', 'BOISAR_TOWN', 'MIDC_BRANCH', 'STATION_A102'] },
  BOISAR_TOWN: { id: 'BOISAR_TOWN', name: 'Boisar Town Center', x: 6, z: -18, neighbors: ['CENTRAL_ROUNDABOUT', 'BOISAR_EAST'] },
  BOISAR_EAST: { id: 'BOISAR_EAST', name: 'Boisar East Railway Approach', x: 18, z: -32, neighbors: ['BOISAR_TOWN', 'NORTH_OUTER', 'BETEGAON_GREEN'] },
  NORTH_OUTER: { id: 'NORTH_OUTER', name: 'Outer Dahanu/Manor Corridor', x: 28, z: -48, neighbors: ['BOISAR_EAST'] },

  // Navapur Road (Westward toward Coast)
  MIDC_BRANCH: { id: 'MIDC_BRANCH', name: 'Navapur Rd / MIDC Ring Split', x: -16, z: -4, neighbors: ['CENTRAL_ROUNDABOUT', 'NAVAPUR_CENTRAL', 'MIDC_CHEM', 'RAILWAY_YARD'] },
  NAVAPUR_CENTRAL: { id: 'NAVAPUR_CENTRAL', name: 'Navapur Road Central', x: -30, z: -10, neighbors: ['MIDC_BRANCH', 'NAVAPUR_B104', 'FEEDER_AVE'] },
  NAVAPUR_B104: { id: 'NAVAPUR_B104', name: 'Station B104 Hub Entrance', x: -46, z: -15, neighbors: ['NAVAPUR_CENTRAL', 'NAVAPUR_OUTER'] },
  NAVAPUR_OUTER: { id: 'NAVAPUR_OUTER', name: 'Navapur Outer Ring', x: -58, z: -22, neighbors: ['NAVAPUR_B104', 'NAVAPUR_BEACH'] },
  NAVAPUR_BEACH: { id: 'NAVAPUR_BEACH', name: 'Navapur Coastal Road', x: -72, z: -28, neighbors: ['NAVAPUR_OUTER'] },

  // Tarapur MIDC Industrial Ring
  MIDC_CHEM: { id: 'MIDC_CHEM', name: 'MIDC Chemical Zone', x: -22, z: 10, neighbors: ['MIDC_BRANCH', 'MIDC_C201'] },
  MIDC_C201: { id: 'MIDC_C201', name: 'MIDC Station C201 Entrance', x: -36, z: 22, neighbors: ['MIDC_CHEM', 'MIDC_HEAVY'] },
  MIDC_HEAVY: { id: 'MIDC_HEAVY', name: 'MIDC Heavy Engineering Sector', x: -28, z: 34, neighbors: ['MIDC_C201', 'MIDC_S03'] },
  MIDC_S03: { id: 'MIDC_S03', name: 'EV Service Center S03 Entrance', x: -14, z: 26, neighbors: ['MIDC_HEAVY', 'MIDC_BORDER'] },
  MIDC_BORDER: { id: 'MIDC_BORDER', name: 'MIDC / Saravali Industrial Border', x: -2, z: 16, neighbors: ['MIDC_S03', 'SARAVALI_JCT'] },

  // Station A102 Spur & Railway Yard
  STATION_A102: { id: 'STATION_A102', name: 'Boisar Central Hub A102 Entrance', x: -6, z: -8, neighbors: ['CENTRAL_ROUNDABOUT', 'RAILWAY_YARD'] },
  RAILWAY_YARD: { id: 'RAILWAY_YARD', name: 'Railway Yard Loop', x: -12, z: -14, neighbors: ['STATION_A102', 'MIDC_BRANCH'] },

  // Substation Spur
  FEEDER_AVE: { id: 'FEEDER_AVE', name: 'Substation Feeder Ave', x: -28, z: -24, neighbors: ['NAVAPUR_CENTRAL', 'GRID_S01'] },
  GRID_S01: { id: 'GRID_S01', name: 'GRID-S01 Distribution Substation', x: -26, z: -38, neighbors: ['FEEDER_AVE'] },

  // Residential Collector (Saravali & Betegaon)
  BETEGAON_HOME_024: { id: 'BETEGAON_HOME_024', name: 'Betegaon Green Valley (HOME-024)', x: 26, z: 18, neighbors: ['SARAVALI_MID', 'BETEGAON_SEC'] },
  BETEGAON_SEC: { id: 'BETEGAON_SEC', name: 'Betegaon Residential Sector', x: 36, z: 8, neighbors: ['BETEGAON_HOME_024', 'BETEGAON_HOME_088'] },
  BETEGAON_HOME_088: { id: 'BETEGAON_HOME_088', name: 'Betegaon Enclave (HOME-088)', x: 38, z: -6, neighbors: ['BETEGAON_SEC', 'BETEGAON_GREEN'] },
  BETEGAON_GREEN: { id: 'BETEGAON_GREEN', name: 'Betegaon Green Belt', x: 28, z: -20, neighbors: ['BETEGAON_HOME_088', 'BOISAR_EAST'] },
};

/**
 * Finds shortest path between two nodes using Dijkstra's algorithm.
 */
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

/**
 * Finds the nearest road node to an arbitrary 3D position.
 */
export function findNearestNodeId(pos: Position3D): string {
  let nearestId = 'CENTRAL_ROUNDABOUT';
  let minDist = Infinity;

  for (const [id, node] of Object.entries(ROAD_NODES)) {
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

/**
 * Standard Catmull-Rom 3D spline interpolation.
 * Generates smooth dense points passing through all control nodes.
 */
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

/**
 * Generates a high-density, smoothly curved waypoint route from a sequence of road node IDs.
 * Step size ~ 1.2 meters.
 */
export function generateCurvedRouteFromNodeIds(nodeIds: string[], startPos?: Position3D, endPos?: Position3D): Position3D[] {
  if (nodeIds.length === 0) return [];
  if (nodeIds.length === 1) {
    const node = ROAD_NODES[nodeIds[0]];
    return [{ x: node.x, y: 0, z: node.z }];
  }

  const controlPoints: Position3D[] = [];

  if (startPos) {
    controlPoints.push({ x: startPos.x, y: 0, z: startPos.z });
  }

  for (const id of nodeIds) {
    const node = ROAD_NODES[id];
    if (node) {
      controlPoints.push({ x: node.x, y: 0, z: node.z });
    }
  }

  if (endPos) {
    controlPoints.push({ x: endPos.x, y: 0, z: endPos.z });
  }

  // Remove consecutive duplicates
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
    // Number of sub-samples along this curve (every ~1.2 meters)
    const samples = Math.max(3, Math.ceil(segDist / 1.2));

    for (let s = 1; s <= samples; s++) {
      const t = s / samples;
      const pt = catmullRomPoint(p0, p1, p2, p3, t);
      denseRoute.push(pt);
    }
  }

  return denseRoute;
}

/**
 * Returns station node ID based on code.
 */
export function getStationNodeId(stationCode: string): string {
  switch (stationCode) {
    case 'A102':
      return 'STATION_A102';
    case 'B104':
      return 'NAVAPUR_B104';
    case 'C201':
      return 'MIDC_C201';
    case 'D305':
    default:
      return 'BETEGAON_D305';
  }
}
