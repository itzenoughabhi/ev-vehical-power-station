import { Position3D, Station, Vehicle } from '../types';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';

export interface MargdarshakNode {
  id: string;
  name: string;
  x: number;
  z: number;
  neighbors: string[];
}

export interface MargdarshakEdge {
  a: string;
  b: string;
  distanceKm: number;
  baseSpeedKmH: number;
  congestion: number; // 0.0 (empty) to 1.0 (gridlock)
  roadClass: 'arterial' | 'highway' | 'residential' | 'narrow';
}

export interface MargdarshakRouteOption {
  type: 'TRAFFIC_FREE' | 'SHORTEST_DISTANCE' | 'MOST_TRAFFIC';
  title: string;
  badge: string;
  badgeColor: string;
  distanceKm: number;
  estimatedTimeMin: number;
  avgCongestionPct: number;
  margdarshakScore: number;
  waypoints: Position3D[];
  nodePath: string[];
  description: string;
}

export interface MargdarshakStationEvaluation {
  station: Station;
  distanceKm: number;
  isNearestByDistance: boolean;
  isFastestByTime: boolean;
  timeSavedMin: number;
  fastestRoute: MargdarshakRouteOption;
  shortestRoute: MargdarshakRouteOption;
  congestedRoute: MargdarshakRouteOption;
  availableBays: number;
  totalBays: number;
  maxPowerKw: number;
}

export const MARGDARSHAK_ROAD_NODES: Record<string, MargdarshakNode> = {
  P401_HIGHWAY: { id: 'P401_HIGHWAY', name: 'Palghar Highway Junction', x: 48, z: 190, neighbors: ['PALGHAR_NORTH', 'P401_ENTRANCE', 'PALGHAR_MANOR_LINK_1', 'SHIRGAON_LINK_3'] },
  PALGHAR_NORTH: { id: 'PALGHAR_NORTH', name: 'Palghar North Highway Corridor', x: 42, z: 170, neighbors: ['P401_HIGHWAY', 'UMROLI_JCT'] },
  UMROLI_JCT: { id: 'UMROLI_JCT', name: 'Umroli Regional Interchange', x: 34, z: 135, neighbors: ['PALGHAR_NORTH', 'BETEGAON_MID', 'SHIRGAON_PT2'] },
  BETEGAON_MID: { id: 'BETEGAON_MID', name: 'Betegaon Mid Highway Corridor', x: 28, z: 95, neighbors: ['UMROLI_JCT', 'D305_JUNCTION'] },
  D305_JUNCTION: { id: 'D305_JUNCTION', name: 'Highway D305 Access Junction', x: 26, z: 65, neighbors: ['BETEGAON_MID', 'BETEGAON_D305_HWY', 'D305_ENTRANCE'] },
  BETEGAON_D305_HWY: { id: 'BETEGAON_D305_HWY', name: 'Highway near D305 Hub', x: 22, z: 48, neighbors: ['D305_JUNCTION', 'SARAVALI_MID'] },
  SARAVALI_MID: { id: 'SARAVALI_MID', name: 'Saravali Highway Junction', x: 16, z: 28, neighbors: ['BETEGAON_D305_HWY', 'SARAVALI_JCT', 'BETEGAON_HOME_024'] },
  SARAVALI_JCT: { id: 'SARAVALI_JCT', name: 'Saravali / MIDC Connector', x: 5, z: 10, neighbors: ['SARAVALI_MID', 'MIDC_BORDER', 'CENTRAL_ROUNDABOUT'] },
  CENTRAL_ROUNDABOUT: { id: 'CENTRAL_ROUNDABOUT', name: 'Central Highway Junction', x: 0, z: -2, neighbors: ['SARAVALI_JCT', 'BOISAR_TOWN', 'MIDC_BRANCH', 'BOISAR_SPUR_START'] },
  BOISAR_TOWN: { id: 'BOISAR_TOWN', name: 'Boisar Town Center', x: 6, z: -18, neighbors: ['CENTRAL_ROUNDABOUT', 'BOISAR_EAST', 'MANOR_APPROACH_1'] },
  BOISAR_EAST: { id: 'BOISAR_EAST', name: 'Boisar East Railway Approach', x: 18, z: -32, neighbors: ['BOISAR_TOWN', 'NORTH_OUTER', 'BETEGAON_GREEN', 'SUBSTATION_RECONNECT'] },
  NORTH_OUTER: { id: 'NORTH_OUTER', name: 'Outer Dahanu Corridor', x: 28, z: -55, neighbors: ['BOISAR_EAST', 'VANGAON_JCT'] },
  VANGAON_JCT: { id: 'VANGAON_JCT', name: 'Vangaon Highway Junction', x: 30, z: -110, neighbors: ['NORTH_OUTER', 'DAHANU_MID'] },
  DAHANU_MID: { id: 'DAHANU_MID', name: 'Dahanu Agro Corridor Midpoint', x: 31, z: -165, neighbors: ['VANGAON_JCT', 'D701_HIGHWAY'] },
  D701_HIGHWAY: { id: 'D701_HIGHWAY', name: 'Dahanu Highway near D701', x: 32, z: -220, neighbors: ['DAHANU_MID', 'D701_ENTRANCE'] },

  SHIRGAON_PT2: { id: 'SHIRGAON_PT2', name: 'Shirgaon East Palms', x: 12, z: 150, neighbors: ['UMROLI_JCT', 'SHIRGAON_PT3'] },
  SHIRGAON_PT3: { id: 'SHIRGAON_PT3', name: 'Shirgaon Rural Enclave', x: -15, z: 170, neighbors: ['SHIRGAON_PT2', 'SHIRGAON_PT4'] },
  SHIRGAON_PT4: { id: 'SHIRGAON_PT4', name: 'Shirgaon Historic Fort Approach', x: -42, z: 192, neighbors: ['SHIRGAON_PT3', 'SHIRGAON_COAST_HWY'] },
  SHIRGAON_COAST_HWY: { id: 'SHIRGAON_COAST_HWY', name: 'Shirgaon Beach Road', x: -65, z: 205, neighbors: ['SHIRGAON_PT4', 'S801_ENTRANCE', 'SHIRGAON_LINK_1'] },
  SHIRGAON_LINK_1: { id: 'SHIRGAON_LINK_1', name: 'Shirgaon South Palms', x: -30, z: 203, neighbors: ['SHIRGAON_COAST_HWY', 'SHIRGAON_LINK_2'] },
  SHIRGAON_LINK_2: { id: 'SHIRGAON_LINK_2', name: 'Shirgaon-Palghar Rural Cross', x: -5, z: 200, neighbors: ['SHIRGAON_LINK_1', 'SHIRGAON_LINK_3'] },
  SHIRGAON_LINK_3: { id: 'SHIRGAON_LINK_3', name: 'Palghar West Approach', x: 22, z: 195, neighbors: ['SHIRGAON_LINK_2', 'P401_HIGHWAY'] },

  MANOR_APPROACH_1: { id: 'MANOR_APPROACH_1', name: 'Boisar East Flyover Ramp', x: 45, z: -16, neighbors: ['BOISAR_TOWN', 'MANOR_APPROACH_2'] },
  MANOR_APPROACH_2: { id: 'MANOR_APPROACH_2', name: 'Elevated Overpass Cross-Bridge', x: 105, z: -14, neighbors: ['MANOR_APPROACH_1', 'MANOR_SURYA_RIVER'] },
  MANOR_SURYA_RIVER: { id: 'MANOR_SURYA_RIVER', name: 'Surya River Expressway Bridge', x: 160, z: -10, neighbors: ['MANOR_APPROACH_2', 'M501_HIGHWAY'] },
  M501_HIGHWAY: { id: 'M501_HIGHWAY', name: 'Manor NH-48 Expressway near M501', x: 210, z: -8, neighbors: ['MANOR_SURYA_RIVER', 'PALGHAR_MANOR_LINK_2', 'M501_ENTRANCE'] },
  PALGHAR_MANOR_LINK_1: { id: 'PALGHAR_MANOR_LINK_1', name: 'Surya River Corridor South', x: 90, z: 135, neighbors: ['P401_HIGHWAY', 'PALGHAR_MANOR_LINK_2'] },
  PALGHAR_MANOR_LINK_2: { id: 'PALGHAR_MANOR_LINK_2', name: 'Manor South Link', x: 155, z: 55, neighbors: ['PALGHAR_MANOR_LINK_1', 'M501_HIGHWAY'] },

  MIDC_BRANCH: { id: 'MIDC_BRANCH', name: 'Navapur Rd / MIDC Split', x: -16, z: -4, neighbors: ['CENTRAL_ROUNDABOUT', 'NAVAPUR_CENTRAL', 'MIDC_CHEM'] },
  NAVAPUR_CENTRAL: { id: 'NAVAPUR_CENTRAL', name: 'Navapur Road Central', x: -30, z: -10, neighbors: ['MIDC_BRANCH', 'NAVAPUR_B104_HWY'] },
  NAVAPUR_B104_HWY: { id: 'NAVAPUR_B104_HWY', name: 'Navapur Highway near B104', x: -48, z: -16, neighbors: ['NAVAPUR_CENTRAL', 'NAVAPUR_OUTER', 'B104_ENTRANCE'] },
  NAVAPUR_OUTER: { id: 'NAVAPUR_OUTER', name: 'Navapur Outer Ring', x: -68, z: -22, neighbors: ['NAVAPUR_B104_HWY', 'NAVAPUR_BEACH'] },
  NAVAPUR_BEACH: { id: 'NAVAPUR_BEACH', name: 'Navapur Coastal Road', x: -80, z: -24, neighbors: ['NAVAPUR_OUTER', 'CHINCHANI_COAST'] },
  CHINCHANI_COAST: { id: 'CHINCHANI_COAST', name: 'Chinchani Coast Road', x: -88, z: -24, neighbors: ['NAVAPUR_BEACH', 'T601_HIGHWAY'] },
  T601_HIGHWAY: { id: 'T601_HIGHWAY', name: 'Tarapur Coastal Highway near T601', x: -96, z: -24, neighbors: ['CHINCHANI_COAST', 'T601_ENTRANCE'] },

  MIDC_CHEM: { id: 'MIDC_CHEM', name: 'MIDC Chemical Zone', x: -22, z: 10, neighbors: ['MIDC_BRANCH', 'MIDC_C201_HWY'] },
  MIDC_C201_HWY: { id: 'MIDC_C201_HWY', name: 'MIDC Ring near C201', x: -36, z: 18, neighbors: ['MIDC_CHEM', 'MIDC_HEAVY', 'C201_ENTRANCE'] },
  MIDC_HEAVY: { id: 'MIDC_HEAVY', name: 'MIDC Heavy Engineering Sector', x: -28, z: 34, neighbors: ['MIDC_C201_HWY', 'MIDC_BORDER'] },
  MIDC_BORDER: { id: 'MIDC_BORDER', name: 'MIDC / Saravali Industrial Border', x: -2, z: 16, neighbors: ['MIDC_HEAVY', 'SARAVALI_JCT'] },

  BOISAR_SPUR_START: { id: 'BOISAR_SPUR_START', name: 'Boisar Spur Junction', x: 0, z: -2, neighbors: ['CENTRAL_ROUNDABOUT', 'A102_HWY_APPROACH'] },
  A102_HWY_APPROACH: { id: 'A102_HWY_APPROACH', name: 'Spur Highway near A102', x: -8, z: -14, neighbors: ['BOISAR_SPUR_START', 'A102_ENTRANCE'] },
  A102_ENTRANCE: { id: 'A102_ENTRANCE', name: 'A102 Entrance', x: -12, z: -21, neighbors: ['A102_HWY_APPROACH', 'STATION_A102_BAY'] },
  STATION_A102_BAY: { id: 'STATION_A102_BAY', name: 'Station A102 Bay', x: -16, z: -28, neighbors: ['A102_ENTRANCE'] },

  B104_ENTRANCE: { id: 'B104_ENTRANCE', name: 'B104 Entrance', x: -48, z: -24, neighbors: ['NAVAPUR_B104_HWY', 'STATION_B104_BAY'] },
  STATION_B104_BAY: { id: 'STATION_B104_BAY', name: 'Station B104 Bay', x: -48, z: -32, neighbors: ['B104_ENTRANCE'] },

  C201_ENTRANCE: { id: 'C201_ENTRANCE', name: 'C201 Entrance', x: -43, z: 18, neighbors: ['MIDC_C201_HWY', 'STATION_C201_BAY'] },
  STATION_C201_BAY: { id: 'STATION_C201_BAY', name: 'Station C201 Bay', x: -50, z: 18, neighbors: ['C201_ENTRANCE'] },

  D305_ENTRANCE: { id: 'D305_ENTRANCE', name: 'D305 Entrance', x: 34, z: 65, neighbors: ['D305_JUNCTION', 'STATION_D305_BAY'] },
  STATION_D305_BAY: { id: 'STATION_D305_BAY', name: 'Station D305 Bay', x: 42, z: 65, neighbors: ['D305_ENTRANCE'] },

  P401_ENTRANCE: { id: 'P401_ENTRANCE', name: 'P401 Entrance', x: 56, z: 190, neighbors: ['P401_HIGHWAY', 'STATION_P401_BAY'] },
  STATION_P401_BAY: { id: 'STATION_P401_BAY', name: 'Station P401 Bay', x: 64, z: 190, neighbors: ['P401_ENTRANCE'] },

  S801_ENTRANCE: { id: 'S801_ENTRANCE', name: 'S801 Entrance', x: -65, z: 212, neighbors: ['SHIRGAON_COAST_HWY', 'STATION_S801_BAY'] },
  STATION_S801_BAY: { id: 'STATION_S801_BAY', name: 'Station S801 Bay', x: -65, z: 218, neighbors: ['S801_ENTRANCE'] },

  M501_ENTRANCE: { id: 'M501_ENTRANCE', name: 'M501 Entrance', x: 211, z: -17, neighbors: ['M501_HIGHWAY', 'STATION_M501_BAY'] },
  STATION_M501_BAY: { id: 'STATION_M501_BAY', name: 'Station M501 Bay', x: 212, z: -26, neighbors: ['M501_ENTRANCE'] },

  T601_ENTRANCE: { id: 'T601_ENTRANCE', name: 'T601 Entrance', x: -96, z: -31, neighbors: ['T601_HIGHWAY', 'STATION_T601_BAY'] },
  STATION_T601_BAY: { id: 'STATION_T601_BAY', name: 'Station T601 Bay', x: -96, z: -38, neighbors: ['T601_ENTRANCE'] },

  D701_ENTRANCE: { id: 'D701_ENTRANCE', name: 'D701 Entrance', x: 40, z: -220, neighbors: ['D701_HIGHWAY', 'STATION_D701_BAY'] },
  STATION_D701_BAY: { id: 'STATION_D701_BAY', name: 'Station D701 Bay', x: 48, z: -220, neighbors: ['D701_ENTRANCE'] },
};

export const STATION_CODE_TO_NODE: Record<string, string> = {
  A102: 'STATION_A102_BAY',
  B104: 'STATION_B104_BAY',
  C201: 'STATION_C201_BAY',
  D305: 'STATION_D305_BAY',
  P401: 'STATION_P401_BAY',
  M501: 'STATION_M501_BAY',
  T601: 'STATION_T601_BAY',
  D701: 'STATION_D701_BAY',
  S801: 'STATION_S801_BAY',
};

function getBaseCongestion(uId: string, vId: string): number {
  const pair = [uId, vId].sort().join('-');
  if (pair.includes('CENTRAL_ROUNDABOUT') || pair.includes('BOISAR_TOWN')) return 0.72; // Downtown bottleneck
  if (pair.includes('SARAVALI_JCT') || pair.includes('SARAVALI_MID')) return 0.58; // Industrial merge
  if (pair.includes('MIDC_CHEM') || pair.includes('MIDC_HEAVY')) return 0.65; // MIDC truck traffic
  if (pair.includes('UMROLI_JCT')) return 0.45;
  if (pair.includes('NAVAPUR')) return 0.18; // Coastal bypass (low traffic)
  if (pair.includes('MANOR_SURYA_RIVER') || pair.includes('M501')) return 0.14; // NH-48 Expressway (fast)
  if (pair.includes('DAHANU') || pair.includes('D701')) return 0.20; // Northern arterial (open)
  return 0.32;
}

function getBaseSpeed(uId: string, vId: string): number {
  const pair = [uId, vId].sort().join('-');
  if (pair.includes('MANOR_SURYA_RIVER') || pair.includes('M501_HIGHWAY')) return 58; // Expressway
  if (pair.includes('P401_HIGHWAY') || pair.includes('D701_HIGHWAY')) return 50; // Highway
  if (pair.includes('NAVAPUR_OUTER') || pair.includes('SHIRGAON_COAST')) return 44; // Coastal bypass
  if (pair.includes('CENTRAL_ROUNDABOUT') || pair.includes('BOISAR_TOWN')) return 28; // City congestion
  return 38;
}

export function findNearestGraphNodeId(pos: Position3D): string {
  let nearestId = 'CENTRAL_ROUNDABOUT';
  let minDist = Infinity;
  for (const [id, node] of Object.entries(MARGDARSHAK_ROAD_NODES)) {
    const d = Math.hypot(node.x - pos.x, node.z - pos.z);
    if (d < minDist) {
      minDist = d;
      nearestId = id;
    }
  }
  return nearestId;
}

export class MargdarshakRouter {
  public static getLiveEdgeCongestion(uId: string, vId: string, vehicles: Vehicle[] = []): number {
    let base = getBaseCongestion(uId, vId);
    const u = MARGDARSHAK_ROAD_NODES[uId];
    const v = MARGDARSHAK_ROAD_NODES[vId];
    if (!u || !v) return base;

    // Check how many live simulation vehicles are on/near this edge segment
    let vehicleCount = 0;
    const midX = (u.x + v.x) / 2;
    const midZ = (u.z + v.z) / 2;
    const edgeLen = Math.hypot(v.x - u.x, v.z - u.z);

    for (const veh of vehicles) {
      const d = Math.hypot(veh.position.x - midX, veh.position.z - midZ);
      if (d < Math.max(12, edgeLen * 0.6)) {
        vehicleCount++;
      }
    }

    const liveCongestion = Math.min(0.98, Math.max(0.05, base + vehicleCount * 0.08));
    return Number(liveCongestion.toFixed(2));
  }

  public static runDijkstra(
    startNodeId: string,
    goalNodeId: string,
    mode: 'TRAFFIC_FREE' | 'SHORTEST_DISTANCE' | 'MOST_TRAFFIC',
    vehicles: Vehicle[] = []
  ): { path: string[]; distanceKm: number; timeMin: number; avgCongestion: number; score: number } {
    if (startNodeId === goalNodeId) {
      return { path: [startNodeId], distanceKm: 0.1, timeMin: 0.2, avgCongestion: 0.1, score: 1.0 };
    }

    const distMap: Record<string, number> = {};
    const prevMap: Record<string, string | null> = {};
    const unvisited = new Set<string>(Object.keys(MARGDARSHAK_ROAD_NODES));

    const allNodeKeys = Object.keys(MARGDARSHAK_ROAD_NODES);
    for (let i = 0; i < allNodeKeys.length; i++) {
      const id = allNodeKeys[i];
      distMap[id] = Infinity;
      prevMap[id] = null;
    }
    distMap[startNodeId] = 0;

    while (unvisited.size > 0) {
      let current: string | null = null;
      let minCost = Infinity;
      unvisited.forEach((node) => {
        if (distMap[node] < minCost) {
          minCost = distMap[node];
          current = node;
        }
      });

      if (!current || distMap[current] === Infinity) break;
      if (current === goalNodeId) break;

      unvisited.delete(current);
      const currNode = MARGDARSHAK_ROAD_NODES[current];

      for (const neighborId of currNode.neighbors) {
        if (!unvisited.has(neighborId)) continue;
        const neighbor = MARGDARSHAK_ROAD_NODES[neighborId];
        if (!neighbor) continue;

        const rawDist = Math.hypot(neighbor.x - currNode.x, neighbor.z - currNode.z);
        const distKm = Math.max(0.05, rawDist * 0.024); // Map scale: 1 unit ≈ 24m
        const baseSpeed = getBaseSpeed(current, neighborId);
        const congestion = this.getLiveEdgeCongestion(current, neighborId, vehicles);

        // --- MARGDARSHAK FORMULAS FROM GITHUB REPO (RoyYash/margdarshak) ---
        // 1. Nonlinear Traffic Delay: Travel Time = (distance / speed) * 60 * (1 + 2.0 * congestion)
        const travelTimeMin = (distKm / baseSpeed) * 60 * (1 + 2.0 * congestion);
        
        // 2. Margdarshak Multi-Objective Cost: Time + 0.18*Distance + 18*Congestion
        const margdarshakCost = travelTimeMin + 0.18 * distKm + 18 * congestion;

        let edgeWeight = margdarshakCost;
        if (mode === 'SHORTEST_DISTANCE') {
          edgeWeight = distKm; // Pure physical distance Dijkstra
        } else if (mode === 'MOST_TRAFFIC') {
          // Penalize low-congestion roads to demonstrate the heavy-traffic route
          edgeWeight = travelTimeMin * (congestion + 0.2);
        }

        const alt = distMap[current] + edgeWeight;
        if (alt < distMap[neighborId]) {
          distMap[neighborId] = alt;
          prevMap[neighborId] = current;
        }
      }
    }

    const path: string[] = [];
    let curr: string | null = goalNodeId;
    while (curr) {
      path.unshift(curr);
      curr = prevMap[curr];
    }

    if (path.length <= 1 || path[0] !== startNodeId) {
      path.length = 0;
      path.push(startNodeId, goalNodeId);
    }

    // Compute final detailed Margdarshak metrics along the path
    let totalDistKm = 0;
    let totalTimeMin = 0;
    let totalCongestion = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const u = MARGDARSHAK_ROAD_NODES[path[i]];
      const v = MARGDARSHAK_ROAD_NODES[path[i + 1]];
      if (!u || !v) continue;
      const legDist = Math.max(0.05, Math.hypot(v.x - u.x, v.z - u.z) * 0.024);
      const legSpeed = getBaseSpeed(path[i], path[i + 1]);
      const legCongestion = this.getLiveEdgeCongestion(path[i], path[i + 1], vehicles);

      totalDistKm += legDist;
      totalCongestion += legCongestion;
      totalTimeMin += (legDist / legSpeed) * 60 * (1 + 2.0 * legCongestion);
    }

    const avgCongestion = path.length > 1 ? totalCongestion / (path.length - 1) : 0.25;
    const finalScore = totalTimeMin + 0.18 * totalDistKm + 18 * avgCongestion;

    return {
      path,
      distanceKm: Number(totalDistKm.toFixed(2)),
      timeMin: Number(totalTimeMin.toFixed(1)),
      avgCongestion: Number((avgCongestion * 100).toFixed(0)),
      score: Number(finalScore.toFixed(1)),
    };
  }

  public static generateSplineWaypoints(nodeIds: string[], startPos?: Position3D): Position3D[] {
    const controlPoints: Position3D[] = [];
    if (startPos) {
      controlPoints.push({ x: startPos.x, y: 0, z: startPos.z });
    }
    for (const id of nodeIds) {
      const node = MARGDARSHAK_ROAD_NODES[id];
      if (node) {
        controlPoints.push({ x: node.x, y: 0, z: node.z });
      }
    }

    if (controlPoints.length === 0) return [];
    if (controlPoints.length === 1) return controlPoints;

    const denseRoute: Position3D[] = [controlPoints[0]];
    for (let i = 0; i < controlPoints.length - 1; i++) {
      const p1 = controlPoints[i];
      const p2 = controlPoints[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
      const steps = Math.max(2, Math.ceil(dist / 1.5));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        denseRoute.push({
          x: Number((p1.x + (p2.x - p1.x) * t).toFixed(2)),
          y: 0,
          z: Number((p1.z + (p2.z - p1.z) * t).toFixed(2)),
        });
      }
    }
    return denseRoute;
  }

  public static evaluateAllStations(vehicle: Vehicle, stations: Station[]): MargdarshakStationEvaluation[] {
    const startNodeId = findNearestGraphNodeId(vehicle.position);
    const liveVehicles = useDigitalTwinStore.getState().vehicles;

    const evaluations: MargdarshakStationEvaluation[] = stations.map((st) => {
      const targetNodeId = STATION_CODE_TO_NODE[st.code] || findNearestGraphNodeId(st.position);

      const trafficFree = this.runDijkstra(startNodeId, targetNodeId, 'TRAFFIC_FREE', liveVehicles);
      const shortest = this.runDijkstra(startNodeId, targetNodeId, 'SHORTEST_DISTANCE', liveVehicles);
      const congested = this.runDijkstra(startNodeId, targetNodeId, 'MOST_TRAFFIC', liveVehicles);

      const trafficFreeWaypoints = this.generateSplineWaypoints(trafficFree.path, vehicle.position);
      const shortestWaypoints = this.generateSplineWaypoints(shortest.path, vehicle.position);
      const congestedWaypoints = this.generateSplineWaypoints(congested.path, vehicle.position);

      const availableBays = st.chargers.filter((c) => c.status === 'AVAILABLE').length;
      const totalBays = st.chargers.length;
      const maxPower = Math.max(...st.chargers.map((c) => c.powerKw), 150);

      const timeSaved = Math.max(0, Number((congested.timeMin - trafficFree.timeMin).toFixed(1)));

      const fastestRouteOption: MargdarshakRouteOption = {
        type: 'TRAFFIC_FREE',
        title: 'Margdarshak Traffic-Free (Fastest)',
        badge: '⚡ RECOMMENDED (LEAST TIME)',
        badgeColor: 'emerald',
        distanceKm: trafficFree.distanceKm,
        estimatedTimeMin: trafficFree.timeMin,
        avgCongestionPct: trafficFree.avgCongestion,
        margdarshakScore: trafficFree.score,
        waypoints: trafficFreeWaypoints,
        nodePath: trafficFree.path,
        description: `Bypasses congested city bottlenecks. Saves ${timeSaved > 0 ? timeSaved + ' mins' : 'time'} using Margdarshak multi-objective routing.`,
      };

      const shortestRouteOption: MargdarshakRouteOption = {
        type: 'SHORTEST_DISTANCE',
        title: 'Shortest Distance Route',
        badge: '📏 SHORTEST DISTANCE',
        badgeColor: 'blue',
        distanceKm: shortest.distanceKm,
        estimatedTimeMin: shortest.timeMin,
        avgCongestionPct: shortest.avgCongestion,
        margdarshakScore: shortest.score,
        waypoints: shortestWaypoints,
        nodePath: shortest.path,
        description: `Direct geographic line. Passes through core road links (${shortest.avgCongestion}% traffic).`,
      };

      const congestedRouteOption: MargdarshakRouteOption = {
        type: 'MOST_TRAFFIC',
        title: 'Most Congested Route (Rush Hour Delay)',
        badge: '⚠️ HEAVIEST TRAFFIC',
        badgeColor: 'amber',
        distanceKm: congested.distanceKm,
        estimatedTimeMin: congested.timeMin,
        avgCongestionPct: congested.avgCongestion,
        margdarshakScore: congested.score,
        waypoints: congestedWaypoints,
        nodePath: congested.path,
        description: `Heavy traffic route with significant delay (+${timeSaved} mins) across arterial intersections.`,
      };

      return {
        station: st,
        distanceKm: shortest.distanceKm,
        isNearestByDistance: false,
        isFastestByTime: false,
        timeSavedMin: timeSaved,
        fastestRoute: fastestRouteOption,
        shortestRoute: shortestRouteOption,
        congestedRoute: congestedRouteOption,
        availableBays,
        totalBays,
        maxPowerKw: maxPower,
      };
    });

    if (evaluations.length === 0) return [];

    // Identify absolute nearest by distance and absolute fastest by time
    let minDistance = Infinity;
    let minTime = Infinity;
    let nearestIndex = 0;
    let fastestIndex = 0;

    evaluations.forEach((e, idx) => {
      if (e.distanceKm < minDistance) {
        minDistance = e.distanceKm;
        nearestIndex = idx;
      }
      if (e.fastestRoute.estimatedTimeMin < minTime) {
        minTime = e.fastestRoute.estimatedTimeMin;
        fastestIndex = idx;
      }
    });

    evaluations[nearestIndex].isNearestByDistance = true;
    evaluations[fastestIndex].isFastestByTime = true;

    // Sort with fastest & nearest first
    return evaluations.sort((a, b) => a.fastestRoute.estimatedTimeMin - b.fastestRoute.estimatedTimeMin);
  }
}
