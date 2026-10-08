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
  // 1. Boisar-Palghar Highway (SH-40) reaching South into Palghar Capital (Z: 200)
  P401_HIGHWAY: { id: 'P401_HIGHWAY', name: 'Palghar Highway Junction', x: 48, z: 200, neighbors: ['PALGHAR_NORTH', 'P401_ENTRANCE', 'PALGHAR_MANOR_LINK_1', 'SHIRGAON_LINK_3'] },
  PALGHAR_NORTH: { id: 'PALGHAR_NORTH', name: 'Palghar North Highway Corridor', x: 42, z: 170, neighbors: ['P401_HIGHWAY', 'UMROLI_JCT'] },
  UMROLI_JCT: { id: 'UMROLI_JCT', name: 'Umroli Regional Interchange', x: 34, z: 135, neighbors: ['PALGHAR_NORTH', 'BETEGAON_MID', 'SHIRGAON_PT2'] },
  BETEGAON_MID: { id: 'BETEGAON_MID', name: 'Betegaon Mid Highway Corridor', x: 28, z: 95, neighbors: ['UMROLI_JCT', 'D305_JUNCTION'] },
  D305_JUNCTION: { id: 'D305_JUNCTION', name: 'Highway D305 Access Junction', x: 26, z: 65, neighbors: ['BETEGAON_MID', 'BETEGAON_D305_HWY', 'D305_ENTRANCE'] },
  BETEGAON_D305_HWY: { id: 'BETEGAON_D305_HWY', name: 'Highway near D305 Hub', x: 22, z: 48, neighbors: ['D305_JUNCTION', 'SARAVALI_MID'] },
  SARAVALI_MID: { id: 'SARAVALI_MID', name: 'Saravali Highway Junction', x: 16, z: 28, neighbors: ['BETEGAON_D305_HWY', 'SARAVALI_JCT', 'BETEGAON_HOME_024', 'BETEGAON_LANE_START'] },
  SARAVALI_JCT: { id: 'SARAVALI_JCT', name: 'Saravali / MIDC Connector', x: 5, z: 10, neighbors: ['SARAVALI_MID', 'RBT_EAST', 'MIDC_BORDER', 'RBT_SOUTH', 'CENTRAL_ROUNDABOUT'] },
  RBT_EAST: { id: 'RBT_EAST', name: 'Boisar MIDC Circle (East Lane)', x: 4.5, z: 0, neighbors: ['SARAVALI_JCT', 'RBT_NORTH', 'RBT_SOUTH', 'CENTRAL_ROUNDABOUT'] },
  RBT_NORTH: { id: 'RBT_NORTH', name: 'Boisar MIDC Circle (North Lane)', x: -4, z: -8.5, neighbors: ['RBT_EAST', 'RBT_WEST', 'BOISAR_TOWN', 'BOISAR_SPUR_START', 'CENTRAL_ROUNDABOUT'] },
  RBT_SOUTH: { id: 'RBT_SOUTH', name: 'Boisar MIDC Circle (South Lane)', x: -4, z: 8.5, neighbors: ['RBT_EAST', 'RBT_WEST', 'SARAVALI_JCT', 'CENTRAL_ROUNDABOUT'] },
  RBT_WEST: { id: 'RBT_WEST', name: 'Boisar MIDC Circle (West Lane)', x: -12.5, z: 0, neighbors: ['RBT_NORTH', 'RBT_SOUTH', 'MIDC_BRANCH', 'CENTRAL_ROUNDABOUT'] },
  CENTRAL_ROUNDABOUT: { id: 'CENTRAL_ROUNDABOUT', name: 'Boisar MIDC Central Roundabout', x: 4.5, z: 0, neighbors: ['RBT_NORTH', 'RBT_SOUTH', 'RBT_EAST', 'RBT_WEST', 'SARAVALI_JCT', 'BOISAR_TOWN', 'MIDC_BRANCH'] },
  BOISAR_TOWN: { id: 'BOISAR_TOWN', name: 'Boisar Town Center', x: 6, z: -18, neighbors: ['RBT_NORTH', 'CENTRAL_ROUNDABOUT', 'BOISAR_EAST', 'MANOR_APPROACH_1'] },
  BOISAR_EAST: { id: 'BOISAR_EAST', name: 'Boisar East Railway Approach', x: 18, z: -32, neighbors: ['BOISAR_TOWN', 'NORTH_OUTER', 'BETEGAON_GREEN', 'SUBSTATION_RECONNECT'] },
  NORTH_OUTER: { id: 'NORTH_OUTER', name: 'Outer Dahanu/Manor Corridor', x: 28, z: -55, neighbors: ['BOISAR_EAST', 'VANGAON_JCT'] },

  // 2. Dahanu Northern Long-Distance Arterial Highway (Z: -220)
  VANGAON_JCT: { id: 'VANGAON_JCT', name: 'Vangaon Highway Junction', x: 30, z: -110, neighbors: ['NORTH_OUTER', 'DAHANU_MID'] },
  DAHANU_MID: { id: 'DAHANU_MID', name: 'Dahanu Agro Corridor Midpoint', x: 33, z: -165, neighbors: ['VANGAON_JCT', 'D701_HIGHWAY'] },
  D701_HIGHWAY: { id: 'D701_HIGHWAY', name: 'Dahanu Highway near D701', x: 36, z: -220, neighbors: ['DAHANU_MID', 'D701_ENTRANCE'] },

  // 3. Shirgaon Historic Coastal Fort & Beach Promenade Corridor
  SHIRGAON_PT2: { id: 'SHIRGAON_PT2', name: 'Shirgaon East Palms', x: 12, z: 150, neighbors: ['UMROLI_JCT', 'SHIRGAON_PT3'] },
  SHIRGAON_PT3: { id: 'SHIRGAON_PT3', name: 'Shirgaon Rural Enclave', x: -15, z: 170, neighbors: ['SHIRGAON_PT2', 'SHIRGAON_PT4'] },
  SHIRGAON_PT4: { id: 'SHIRGAON_PT4', name: 'Shirgaon Historic Fort Approach', x: -42, z: 192, neighbors: ['SHIRGAON_PT3', 'SHIRGAON_COAST_HWY'] },
  SHIRGAON_COAST_HWY: { id: 'SHIRGAON_COAST_HWY', name: 'Shirgaon Beach Road', x: -65, z: 210, neighbors: ['SHIRGAON_PT4', 'S801_ENTRANCE', 'SHIRGAON_LINK_1'] },
  SHIRGAON_LINK_1: { id: 'SHIRGAON_LINK_1', name: 'Shirgaon South Palms', x: -30, z: 208, neighbors: ['SHIRGAON_COAST_HWY', 'SHIRGAON_LINK_2'] },
  SHIRGAON_LINK_2: { id: 'SHIRGAON_LINK_2', name: 'Shirgaon-Palghar Rural Cross', x: -5, z: 205, neighbors: ['SHIRGAON_LINK_1', 'SHIRGAON_LINK_3'] },
  SHIRGAON_LINK_3: { id: 'SHIRGAON_LINK_3', name: 'Palghar West Approach', x: 22, z: 202, neighbors: ['SHIRGAON_LINK_2', 'P401_HIGHWAY'] },

  // 4. Manor NH-48 Express Golden Quadrilateral Highway (X: 210)
  MANOR_APPROACH_1: { id: 'MANOR_APPROACH_1', name: 'Boisar East Flyover Ramp Up', x: 45, z: -16, neighbors: ['BOISAR_TOWN', 'MANOR_APPROACH_2'] },
  MANOR_APPROACH_2: { id: 'MANOR_APPROACH_2', name: 'Elevated Overpass Cross-Bridge', x: 105, z: -16, neighbors: ['MANOR_APPROACH_1', 'MANOR_SURYA_RIVER'] },
  MANOR_SURYA_RIVER: { id: 'MANOR_SURYA_RIVER', name: 'Surya River Expressway Bridge', x: 160, z: -18, neighbors: ['MANOR_APPROACH_2', 'M501_HIGHWAY'] },
  M501_HIGHWAY: { id: 'M501_HIGHWAY', name: 'Manor NH-48 Expressway near M501', x: 210, z: -20, neighbors: ['MANOR_SURYA_RIVER', 'PALGHAR_MANOR_LINK_2', 'M501_ENTRANCE'] },

  // 5. Palghar–Manor Regional Connector (Completing regional loop)
  PALGHAR_MANOR_LINK_1: { id: 'PALGHAR_MANOR_LINK_1', name: 'Surya River Valley Corridor South', x: 90, z: 140, neighbors: ['P401_HIGHWAY', 'PALGHAR_MANOR_LINK_2'] },
  PALGHAR_MANOR_LINK_2: { id: 'PALGHAR_MANOR_LINK_2', name: 'Manor South Link', x: 155, z: 60, neighbors: ['PALGHAR_MANOR_LINK_1', 'M501_HIGHWAY'] },

  // 6. Navapur Road & Tarapur Coastal Energy Highway (Placed securely on land at Tarapur Coast)
  MIDC_BRANCH: { id: 'MIDC_BRANCH', name: 'Navapur Rd / MIDC Ring Split', x: -16, z: -4, neighbors: ['RBT_WEST', 'CENTRAL_ROUNDABOUT', 'NAVAPUR_CENTRAL', 'MIDC_CHEM', 'RAILWAY_YARD'] },
  NAVAPUR_CENTRAL: { id: 'NAVAPUR_CENTRAL', name: 'Navapur Road Central', x: -30, z: -10, neighbors: ['MIDC_BRANCH', 'NAVAPUR_B104_HWY', 'FEEDER_AVE'] },
  NAVAPUR_B104_HWY: { id: 'NAVAPUR_B104_HWY', name: 'Navapur Highway near B104', x: -48, z: -16, neighbors: ['NAVAPUR_CENTRAL', 'NAVAPUR_OUTER', 'B104_ENTRANCE'] },
  NAVAPUR_OUTER: { id: 'NAVAPUR_OUTER', name: 'Navapur Outer Ring', x: -68, z: -22, neighbors: ['NAVAPUR_B104_HWY', 'NAVAPUR_BEACH'] },
  NAVAPUR_BEACH: { id: 'NAVAPUR_BEACH', name: 'Navapur Coastal Road', x: -80, z: -28, neighbors: ['NAVAPUR_OUTER', 'CHINCHANI_COAST'] },
  CHINCHANI_COAST: { id: 'CHINCHANI_COAST', name: 'Chinchani Coast Road', x: -88, z: -30, neighbors: ['NAVAPUR_BEACH', 'T601_HIGHWAY'] },
  T601_HIGHWAY: { id: 'T601_HIGHWAY', name: 'Tarapur Coastal Highway near T601', x: -94, z: -32, neighbors: ['CHINCHANI_COAST', 'T601_ENTRANCE'] },

  // 7. Tarapur MIDC Industrial Main Ring
  MIDC_CHEM: { id: 'MIDC_CHEM', name: 'MIDC Chemical Zone', x: -22, z: 10, neighbors: ['MIDC_BRANCH', 'MIDC_C201_HWY'] },
  MIDC_C201_HWY: { id: 'MIDC_C201_HWY', name: 'MIDC Ring near C201', x: -36, z: 22, neighbors: ['MIDC_CHEM', 'MIDC_HEAVY', 'C201_ENTRANCE'] },
  MIDC_HEAVY: { id: 'MIDC_HEAVY', name: 'MIDC Heavy Engineering Sector', x: -28, z: 34, neighbors: ['MIDC_C201_HWY', 'MIDC_S03'] },
  MIDC_S03: { id: 'MIDC_S03', name: 'EV Service Center S03 Entrance', x: -14, z: 26, neighbors: ['MIDC_HEAVY', 'MIDC_BORDER', 'S03_BAY_ENTRANCE'] },
  MIDC_BORDER: { id: 'MIDC_BORDER', name: 'MIDC / Saravali Industrial Border', x: -2, z: 16, neighbors: ['MIDC_S03', 'SARAVALI_JCT'] },

  // 8. Boisar Central Spur
  BOISAR_SPUR_START: { id: 'BOISAR_SPUR_START', name: 'Boisar Spur Junction', x: -4, z: -8.5, neighbors: ['RBT_NORTH', 'CENTRAL_ROUNDABOUT', 'A102_HWY_APPROACH'] },
  A102_HWY_APPROACH: { id: 'A102_HWY_APPROACH', name: 'Spur Highway near A102', x: -8, z: -6, neighbors: ['BOISAR_SPUR_START', 'RAILWAY_YARD', 'A102_ENTRANCE'] },
  RAILWAY_YARD: { id: 'RAILWAY_YARD', name: 'Railway Yard Loop', x: -14, z: -12, neighbors: ['A102_HWY_APPROACH', 'MIDC_BRANCH'] },

  // 9. Dedicated Off-Road Charging Station Apron & Bay Nodes
  // A102 Boisar Central
  A102_ENTRANCE: { id: 'A102_ENTRANCE', name: 'A102 Apron Driveway', x: -8, z: -14, neighbors: ['A102_HWY_APPROACH', 'STATION_A102_BAY'] },
  STATION_A102_BAY: { id: 'STATION_A102_BAY', name: 'Station A102 Bay Position', x: -8, z: -18, neighbors: ['A102_ENTRANCE'] },

  // B104 Navapur Road
  B104_ENTRANCE: { id: 'B104_ENTRANCE', name: 'B104 Apron Driveway', x: -48, z: -22, neighbors: ['NAVAPUR_B104_HWY', 'STATION_B104_BAY'] },
  STATION_B104_BAY: { id: 'STATION_B104_BAY', name: 'Station B104 Bay Position', x: -48, z: -28, neighbors: ['B104_ENTRANCE'] },

  // C201 MIDC Hub
  C201_ENTRANCE: { id: 'C201_ENTRANCE', name: 'C201 Apron Driveway', x: -42, z: 22, neighbors: ['MIDC_C201_HWY', 'STATION_C201_BAY'] },
  STATION_C201_BAY: { id: 'STATION_C201_BAY', name: 'Station C201 Bay Position', x: -48, z: 22, neighbors: ['C201_ENTRANCE'] },

  // D305 Boisar-Palghar Corridor (Dedicated Forecourt Apron)
  D305_ENTRANCE: { id: 'D305_ENTRANCE', name: 'D305 Apron Driveway', x: 32, z: 65, neighbors: ['D305_JUNCTION', 'STATION_D305_BAY'] },
  STATION_D305_BAY: { id: 'STATION_D305_BAY', name: 'Station D305 Forecourt Apron', x: 38, z: 65, neighbors: ['D305_ENTRANCE'] },

  // P401 Palghar Central
  P401_ENTRANCE: { id: 'P401_ENTRANCE', name: 'P401 Apron Driveway', x: 46, z: 200, neighbors: ['P401_HIGHWAY', 'STATION_P401_BAY'] },
  STATION_P401_BAY: { id: 'STATION_P401_BAY', name: 'Station P401 Bay Position', x: 48, z: 200, neighbors: ['P401_ENTRANCE'] },

  // S801 Shirgaon Beach & Fort Hub
  S801_ENTRANCE: { id: 'S801_ENTRANCE', name: 'S801 Apron Driveway', x: -62, z: 210, neighbors: ['SHIRGAON_COAST_HWY', 'STATION_S801_BAY'] },
  STATION_S801_BAY: { id: 'STATION_S801_BAY', name: 'Station S801 Bay Position', x: -65, z: 210, neighbors: ['S801_ENTRANCE'] },

  // M501 Manor NH-48 Hub
  M501_ENTRANCE: { id: 'M501_ENTRANCE', name: 'M501 Apron Driveway', x: 208, z: -20, neighbors: ['M501_HIGHWAY', 'STATION_M501_BAY'] },
  STATION_M501_BAY: { id: 'STATION_M501_BAY', name: 'Station M501 Bay Position', x: 210, z: -20, neighbors: ['M501_ENTRANCE'] },

  // T601 Tarapur Coastal Hub
  T601_ENTRANCE: { id: 'T601_ENTRANCE', name: 'T601 Apron Driveway', x: -95, z: -32, neighbors: ['T601_HIGHWAY', 'STATION_T601_BAY'] },
  STATION_T601_BAY: { id: 'STATION_T601_BAY', name: 'Station T601 Bay Position', x: -96, z: -32, neighbors: ['T601_ENTRANCE'] },

  // D701 Dahanu Highway Hub
  D701_ENTRANCE: { id: 'D701_ENTRANCE', name: 'D701 Apron Driveway', x: 35, z: -220, neighbors: ['D701_HIGHWAY', 'STATION_D701_BAY'] },
  STATION_D701_BAY: { id: 'STATION_D701_BAY', name: 'Station D701 Bay Position', x: 36, z: -220, neighbors: ['D701_ENTRANCE'] },

  // S03 Service Center Bay (MIDC Industrial Zone [-28, 0, 54])
  S03_BAY_ENTRANCE: { id: 'S03_BAY_ENTRANCE', name: 'S03 Bay Entrance', x: -28, z: 54, neighbors: ['MIDC_S03'] },

  // 9. Substation Grid Spur (GRID-S01 Northern Utility Zone [-48, 0, -65])
  FEEDER_AVE: { id: 'FEEDER_AVE', name: 'Substation Feeder Ave', x: -40, z: -32, neighbors: ['NAVAPUR_CENTRAL', 'GRID_S01'] },
  GRID_S01: { id: 'GRID_S01', name: 'GRID-S01 Distribution Substation', x: -48, z: -65, neighbors: ['FEEDER_AVE', 'SUBSTATION_NORTH_LINK'] },
  SUBSTATION_NORTH_LINK: { id: 'SUBSTATION_NORTH_LINK', name: 'Substation North Link', x: -28, z: -60, neighbors: ['GRID_S01', 'SUBSTATION_RECONNECT'] },
  SUBSTATION_RECONNECT: { id: 'SUBSTATION_RECONNECT', name: 'Northern Grid Reconnect', x: 6, z: -45, neighbors: ['SUBSTATION_NORTH_LINK', 'BOISAR_EAST'] },

  // 10. Residential Collector (Saravali & Betegaon Outer Fringe)
  BETEGAON_HOME_024: { id: 'BETEGAON_HOME_024', name: 'Betegaon Green Valley (HOME-024)', x: 48, z: 30, neighbors: ['SARAVALI_MID', 'BETEGAON_SEC'] },
  BETEGAON_SEC: { id: 'BETEGAON_SEC', name: 'Betegaon Residential Sector', x: 58, z: 45, neighbors: ['BETEGAON_HOME_024', 'BETEGAON_HOME_088', 'BETEGAON_PALMS'] },
  BETEGAON_HOME_088: { id: 'BETEGAON_HOME_088', name: 'Betegaon Enclave (HOME-088)', x: 78, z: -36, neighbors: ['BETEGAON_SEC', 'BETEGAON_GREEN'] },
  BETEGAON_GREEN: { id: 'BETEGAON_GREEN', name: 'Betegaon Green Belt', x: 50, z: -30, neighbors: ['BETEGAON_HOME_088', 'BOISAR_EAST'] },

  // 11. Betegaon Residential Lane (Curving north of Station D305)
  BETEGAON_LANE_START: { id: 'BETEGAON_LANE_START', name: 'Betegaon Suburban Lane Start', x: 36, z: 55, neighbors: ['SARAVALI_MID', 'BETEGAON_HOME_052'] },
  BETEGAON_HOME_052: { id: 'BETEGAON_HOME_052', name: 'Betegaon Heights (HOME-052)', x: 46, z: 74, neighbors: ['BETEGAON_LANE_START', 'BETEGAON_PALMS'] },
  BETEGAON_PALMS: { id: 'BETEGAON_PALMS', name: 'Betegaon Palms', x: 42, z: 60, neighbors: ['BETEGAON_HOME_052', 'BETEGAON_SEC'] },
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
 * Applies authentic two-lane directional lateral offset so:
 * - "Going vehicle" moves strictly on its RIGHT lane (+1.5m offset).
 * - Oncoming "coming vehicle" moves on its RIGHT lane (-1.5m relative offset).
 * - Oncoming vehicles pass each other with 3.0m of lateral clearance on the left side without colliding.
 */
export function generateCurvedRouteFromNodeIds(
  nodeIds: string[],
  startPos?: Position3D,
  endPos?: Position3D,
  laneOffset: number = 1.15
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

  // If no lane offset requested (or 0), return centerline points
  if (!laneOffset || denseRoute.length < 2) return denseRoute;

  // Dedicated two-lane directional offset calculation:
  // Forward tangent: T = (tx, tz)
  // Perpendicular vector pointing to the RIGHT of forward movement: N_right = (-tz, 0, tx)
  // When oncoming traffic drives in the opposite direction -T, its right vector is (tz, 0, -tx) = N_left
  // Thus each direction stays in its lane separated by 2 * laneOffset = 3.0 meters.
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

  for (let i = 0; i < N; i++) {
    const curr = denseRoute[i];

    // Compute smoothed forward tangent using adjacent points
    let tx = 0;
    let tz = 0;
    const nextIdx = Math.min(N - 1, i + 1);
    const prevIdx = Math.max(0, i - 1);
    tx = denseRoute[nextIdx].x - denseRoute[prevIdx].x;
    tz = denseRoute[nextIdx].z - denseRoute[prevIdx].z;

    const len = Math.hypot(tx, tz);
    let nx = 0;
    let nz = 0;
    if (len > 0.001) {
      const normTx = tx / len;
      const normTz = tz / len;
      // Perpendicular to the RIGHT side of the vehicle
      nx = -normTz;
      nz = normTx;
    }

    // Smooth ramp-in and ramp-out near bays/entrances
    let blend = 1.0;
    if (isStartAtBay && i < 6) {
      blend = Math.min(blend, i / 5);
    }
    if (isEndAtBay && i > N - 7) {
      blend = Math.min(blend, (N - 1 - i) / 5);
    }

    const curOffset = laneOffset * blend;

    lanedRoute.push({
      x: Number((curr.x + nx * curOffset).toFixed(2)),
      y: curr.y || 0,
      z: Number((curr.z + nz * curOffset).toFixed(2)),
    });
  }

  return lanedRoute;
}

/**
 * Returns station node ID based on code.
 */
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
