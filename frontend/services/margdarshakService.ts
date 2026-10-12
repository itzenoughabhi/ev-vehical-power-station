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
  routeName: string;
  highlightTag: string;
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
  P401_HIGHWAY: { id: 'P401_HIGHWAY', name: 'Palghar Highway Junction', x: 50, z: 215, neighbors: ['PALGHAR_NORTH', 'P401_ENTRANCE', 'PALGHAR_MANOR_LINK_1', 'SHIRGAON_LINK_3'] },
  PALGHAR_NORTH: { id: 'PALGHAR_NORTH', name: 'Palghar North Highway Corridor', x: 45, z: 185, neighbors: ['P401_HIGHWAY', 'UMROLI_JCT'] },
  UMROLI_JCT: { id: 'UMROLI_JCT', name: 'Umroli Regional Interchange', x: 40, z: 155, neighbors: ['PALGHAR_NORTH', 'BETEGAON_MID', 'SHIRGAON_PT2'] },
  BETEGAON_MID: { id: 'BETEGAON_MID', name: 'Betegaon Mid Highway Corridor', x: 36, z: 115, neighbors: ['UMROLI_JCT', 'D305_JUNCTION'] },
  D305_JUNCTION: { id: 'D305_JUNCTION', name: 'Highway D305 Access Junction', x: 32, z: 75, neighbors: ['BETEGAON_MID', 'SARAVALI_MID', 'D305_ENTRANCE'] },
  SARAVALI_MID: { id: 'SARAVALI_MID', name: 'Saravali Mid Highway Corridor', x: 23, z: 52, neighbors: ['D305_JUNCTION', 'SARAVALI_JCT'] },
  SARAVALI_JCT: { id: 'SARAVALI_JCT', name: 'Saravali / MIDC Connector', x: 14, z: 30, neighbors: ['SARAVALI_MID', 'MIDC_BORDER', 'CENTRAL_ROUNDABOUT', 'BETEGAON_HOME_024'] },
  CENTRAL_ROUNDABOUT: { id: 'CENTRAL_ROUNDABOUT', name: 'Central Highway 4-Way Interchange', x: 0, z: 0, neighbors: ['SARAVALI_JCT', 'BOISAR_TOWN', 'MIDC_BRANCH'] },
  BOISAR_TOWN: { id: 'BOISAR_TOWN', name: 'Boisar Town Center', x: 12, z: -18, neighbors: ['CENTRAL_ROUNDABOUT', 'BOISAR_EAST', 'MANOR_APPROACH_1', 'BETEGAON_GREEN'] },
  BOISAR_EAST: { id: 'BOISAR_EAST', name: 'Boisar East Bypass Corridor', x: 4, z: -40, neighbors: ['BOISAR_TOWN', 'NORTH_OUTER', 'A102_ENTRANCE'] },
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

  MANOR_APPROACH_1: { id: 'MANOR_APPROACH_1', name: 'Boisar East Flyover Ramp', x: 60, z: -20, neighbors: ['BOISAR_TOWN', 'MANOR_APPROACH_2'] },
  MANOR_APPROACH_2: { id: 'MANOR_APPROACH_2', name: 'Elevated Overpass Cross-Bridge', x: 115, z: -22, neighbors: ['MANOR_APPROACH_1', 'MANOR_SURYA_RIVER'] },
  MANOR_SURYA_RIVER: { id: 'MANOR_SURYA_RIVER', name: 'Surya River Expressway Bridge', x: 165, z: -24, neighbors: ['MANOR_APPROACH_2', 'M501_HIGHWAY'] },
  M501_HIGHWAY: { id: 'M501_HIGHWAY', name: 'Manor NH-48 Expressway near M501', x: 205, z: -25, neighbors: ['MANOR_SURYA_RIVER', 'PALGHAR_MANOR_LINK_2', 'M501_ENTRANCE'] },
  PALGHAR_MANOR_LINK_1: { id: 'PALGHAR_MANOR_LINK_1', name: 'Surya River Corridor South', x: 105, z: 150, neighbors: ['P401_HIGHWAY', 'PALGHAR_MANOR_LINK_2'] },
  PALGHAR_MANOR_LINK_2: { id: 'PALGHAR_MANOR_LINK_2', name: 'Manor South Link', x: 160, z: 70, neighbors: ['PALGHAR_MANOR_LINK_1', 'M501_HIGHWAY'] },

  MIDC_BRANCH: { id: 'MIDC_BRANCH', name: 'Navapur Rd / MIDC Split', x: -30, z: -5, neighbors: ['CENTRAL_ROUNDABOUT', 'NAVAPUR_CENTRAL', 'MIDC_CHEM'] },
  NAVAPUR_CENTRAL: { id: 'NAVAPUR_CENTRAL', name: 'Navapur Road Central', x: -60, z: -10, neighbors: ['MIDC_BRANCH', 'NAVAPUR_B104_HWY'] },
  NAVAPUR_B104_HWY: { id: 'NAVAPUR_B104_HWY', name: 'Navapur Highway near B104', x: -95, z: -10, neighbors: ['NAVAPUR_CENTRAL', 'NAVAPUR_OUTER', 'B104_ENTRANCE'] },
  NAVAPUR_OUTER: { id: 'NAVAPUR_OUTER', name: 'Navapur Outer Ring', x: -135, z: -35, neighbors: ['NAVAPUR_B104_HWY', 'CHINCHANI_COAST'] },
  CHINCHANI_COAST: { id: 'CHINCHANI_COAST', name: 'Chinchani Coast Road', x: -155, z: -50, neighbors: ['NAVAPUR_OUTER', 'T601_HIGHWAY'] },
  T601_HIGHWAY: { id: 'T601_HIGHWAY', name: 'Tarapur Coastal Highway near T601', x: -170, z: -65, neighbors: ['CHINCHANI_COAST', 'T601_ENTRANCE'] },

  MIDC_CHEM: { id: 'MIDC_CHEM', name: 'MIDC Chemical Zone', x: -50, z: 35, neighbors: ['MIDC_BRANCH', 'MIDC_C201_HWY'] },
  MIDC_C201_HWY: { id: 'MIDC_C201_HWY', name: 'MIDC Ring near C201', x: -70, z: 80, neighbors: ['MIDC_CHEM', 'MIDC_HEAVY', 'C201_ENTRANCE'] },
  MIDC_HEAVY: { id: 'MIDC_HEAVY', name: 'MIDC Heavy Engineering Sector', x: -55, z: 105, neighbors: ['MIDC_C201_HWY', 'MIDC_BORDER'] },
  MIDC_BORDER: { id: 'MIDC_BORDER', name: 'MIDC / Saravali Industrial Border', x: -10, z: 80, neighbors: ['MIDC_HEAVY', 'SARAVALI_JCT'] },

  A102_ENTRANCE: { id: 'A102_ENTRANCE', name: 'A102 Entrance', x: 15, z: -40, neighbors: ['BOISAR_EAST', 'STATION_A102_BAY'] },
  STATION_A102_BAY: { id: 'STATION_A102_BAY', name: 'Station A102 Bay', x: 26, z: -40, neighbors: ['A102_ENTRANCE'] },

  B104_ENTRANCE: { id: 'B104_ENTRANCE', name: 'B104 Entrance', x: -95, z: -17, neighbors: ['NAVAPUR_B104_HWY', 'STATION_B104_BAY'] },
  STATION_B104_BAY: { id: 'STATION_B104_BAY', name: 'Station B104 Bay', x: -95, z: -25, neighbors: ['B104_ENTRANCE'] },

  C201_ENTRANCE: { id: 'C201_ENTRANCE', name: 'C201 Entrance', x: -77, z: 80, neighbors: ['MIDC_C201_HWY', 'STATION_C201_BAY'] },
  STATION_C201_BAY: { id: 'STATION_C201_BAY', name: 'Station C201 Bay', x: -85, z: 80, neighbors: ['C201_ENTRANCE'] },

  D305_ENTRANCE: { id: 'D305_ENTRANCE', name: 'D305 Entrance', x: 45, z: 75, neighbors: ['D305_JUNCTION', 'STATION_D305_BAY'] },
  STATION_D305_BAY: { id: 'STATION_D305_BAY', name: 'Station D305 Bay', x: 55, z: 75, neighbors: ['D305_ENTRANCE'] },

  P401_ENTRANCE: { id: 'P401_ENTRANCE', name: 'P401 Entrance', x: 65, z: 215, neighbors: ['P401_HIGHWAY', 'STATION_P401_BAY'] },
  STATION_P401_BAY: { id: 'STATION_P401_BAY', name: 'Station P401 Bay', x: 75, z: 215, neighbors: ['P401_ENTRANCE'] },

  S801_ENTRANCE: { id: 'S801_ENTRANCE', name: 'S801 Entrance', x: -102, z: 215, neighbors: ['SHIRGAON_COAST_HWY', 'STATION_S801_BAY'] },
  STATION_S801_BAY: { id: 'STATION_S801_BAY', name: 'Station S801 Bay', x: -110, z: 215, neighbors: ['S801_ENTRANCE'] },

  M501_ENTRANCE: { id: 'M501_ENTRANCE', name: 'M501 Entrance', x: 212, z: -25, neighbors: ['M501_HIGHWAY', 'STATION_M501_BAY'] },
  STATION_M501_BAY: { id: 'STATION_M501_BAY', name: 'Station M501 Bay', x: 220, z: -25, neighbors: ['M501_ENTRANCE'] },

  T601_ENTRANCE: { id: 'T601_ENTRANCE', name: 'T601 Entrance', x: -177, z: -65, neighbors: ['T601_HIGHWAY', 'STATION_T601_BAY'] },
  STATION_T601_BAY: { id: 'STATION_T601_BAY', name: 'Station T601 Bay', x: -185, z: -65, neighbors: ['T601_ENTRANCE'] },

  D701_ENTRANCE: { id: 'D701_ENTRANCE', name: 'D701 Entrance', x: 43, z: -230, neighbors: ['D701_HIGHWAY', 'STATION_D701_BAY'] },
  STATION_D701_BAY: { id: 'STATION_D701_BAY', name: 'Station D701 Bay', x: 52, z: -230, neighbors: ['D701_ENTRANCE'] },

  BETEGAON_HOME_024: { id: 'BETEGAON_HOME_024', name: 'Betegaon Green Valley (HOME-024)', x: 45, z: 25, neighbors: ['SARAVALI_JCT', 'BETEGAON_SEC'] },
  BETEGAON_SEC: { id: 'BETEGAON_SEC', name: 'Betegaon Residential Sector', x: 80, z: 15, neighbors: ['BETEGAON_HOME_024', 'BETEGAON_HOME_088'] },
  BETEGAON_HOME_088: { id: 'BETEGAON_HOME_088', name: 'Betegaon Enclave (HOME-088)', x: 55, z: -5, neighbors: ['BETEGAON_SEC', 'BETEGAON_GREEN'] },
  BETEGAON_GREEN: { id: 'BETEGAON_GREEN', name: 'Betegaon Green Belt', x: 35, z: -12, neighbors: ['BETEGAON_HOME_088', 'BOISAR_TOWN'] },
  FEEDER_AVE: { id: 'FEEDER_AVE', name: 'Substation Feeder Ave', x: -55, z: -50, neighbors: ['NAVAPUR_CENTRAL', 'GRID_S01'] },
  GRID_S01: { id: 'GRID_S01', name: 'GRID-S01 Distribution Substation Access', x: -50, z: -90, neighbors: ['FEEDER_AVE', 'SUBSTATION_NORTH_LINK'] },
  SUBSTATION_NORTH_LINK: { id: 'SUBSTATION_NORTH_LINK', name: 'Substation North Link', x: -10, z: -80, neighbors: ['GRID_S01', 'SUBSTATION_RECONNECT'] },
  SUBSTATION_RECONNECT: { id: 'SUBSTATION_RECONNECT', name: 'Northern Grid Reconnect', x: 10, z: -70, neighbors: ['SUBSTATION_NORTH_LINK', 'NORTH_OUTER'] },
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

export function findNearestGraphNodeId(pos: Position3D, allowStationSpurs: boolean = false): string {
  let nearestId = 'CENTRAL_ROUNDABOUT';
  let minDist = Infinity;
  for (const [id, node] of Object.entries(MARGDARSHAK_ROAD_NODES)) {
    if (!allowStationSpurs && (id.includes('BAY') || id.includes('ENTRANCE'))) {
      continue;
    }
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

  public static getRouteNameForPath(path: string[], mode: 'TRAFFIC_FREE' | 'SHORTEST_DISTANCE' | 'MOST_TRAFFIC'): string {
    const pStr = path.join(' ');
    if (path.length <= 1) {
      if (mode === 'TRAFFIC_FREE') return 'Dedicated EV Express Bay Spur';
      if (mode === 'SHORTEST_DISTANCE') return 'Direct Forecourt Driveway';
      return 'Commercial Corridor & Inflow Bottleneck';
    }

    if (mode === 'TRAFFIC_FREE') {
      if (pStr.includes('NAVAPUR')) return 'Via Navapur Coastal Arterial Bypass';
      if (pStr.includes('MANOR_SURYA_RIVER') || pStr.includes('M501')) return 'Via Surya River Express Highway';
      if (pStr.includes('SHIRGAON')) return 'Via Shirgaon Coastal Promenade';
      if (pStr.includes('NORTH_OUTER') || pStr.includes('VANGAON')) return 'Via Dahanu Outer Arterial Bypass';
      if (pStr.includes('PALGHAR')) return 'Via SH-40 Palghar Freeflow Corridor';
      return 'Via Smart Traffic-Adaptive Arterial Bypass';
    }

    if (mode === 'SHORTEST_DISTANCE') {
      if (pStr.includes('CENTRAL_ROUNDABOUT')) return 'Via Central Roundabout Direct Line';
      if (pStr.includes('MIDC_BRANCH')) return 'Via MIDC Direct Connecting Spur';
      if (pStr.includes('SARAVALI')) return 'Via Saravali Core Crossroad';
      if (pStr.includes('BOISAR_TOWN')) return 'Via Boisar Central Geographic Axis';
      return 'Via Direct Geographic Road Vector';
    }

    // mode === 'MOST_TRAFFIC'
    if (pStr.includes('BOISAR_TOWN')) return 'Via Boisar Town Market & Station Chokepoint';
    if (pStr.includes('MIDC_CHEM') || pStr.includes('MIDC_HEAVY')) return 'Via Tarapur MIDC Industrial Heavy Corridor';
    if (pStr.includes('CENTRAL_ROUNDABOUT')) return 'Via Central Roundabout High-Congestion Junction';
    if (pStr.includes('SARAVALI_JCT')) return 'Via Saravali Industrial Inflow Chokepoint';
    return 'Via Peak-Hour Arterial Chokepoint Corridor';
  }

  public static runDijkstra(
    startNodeId: string,
    goalNodeId: string,
    mode: 'TRAFFIC_FREE' | 'SHORTEST_DISTANCE' | 'MOST_TRAFFIC',
    vehicles: Vehicle[] = []
  ): { path: string[]; distanceKm: number; timeMin: number; avgCongestion: number; score: number; routeName: string } {
    if (startNodeId === goalNodeId) {
      if (mode === 'TRAFFIC_FREE') {
        return {
          path: [startNodeId],
          distanceKm: 0.35,
          timeMin: 0.6,
          avgCongestion: 12,
          score: 1.1,
          routeName: 'Dedicated EV Express Bay Spur',
        };
      }
      if (mode === 'SHORTEST_DISTANCE') {
        return {
          path: [startNodeId],
          distanceKm: 0.15,
          timeMin: 0.8,
          avgCongestion: 32,
          score: 1.4,
          routeName: 'Direct Forecourt Driveway',
        };
      }
      return {
        path: [startNodeId],
        distanceKm: 0.72,
        timeMin: 3.2,
        avgCongestion: 78,
        score: 4.8,
        routeName: 'Commercial Corridor & Inflow Bottleneck',
      };
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

        // Prevent vehicles from using fuel station roads as through-routes
        const isNeighborStationSpur = neighborId.includes('BAY') || neighborId.includes('ENTRANCE');
        if (isNeighborStationSpur) {
          const isTarget = neighborId === goalNodeId || (MARGDARSHAK_ROAD_NODES[goalNodeId]?.neighbors || []).includes(neighborId);
          const isDirectExit = current === startNodeId;
          if (!isTarget && !isDirectExit) {
            continue;
          }
        }

        const rawDist = Math.hypot(neighbor.x - currNode.x, neighbor.z - currNode.z);
        const distKm = Math.max(0.05, rawDist * 0.024); // Map scale: 1 unit ≈ 24m
        const baseSpeed = getBaseSpeed(current, neighborId);
        const congestion = this.getLiveEdgeCongestion(current, neighborId, vehicles);

        // --- MARGDARSHAK FORMULAS FROM GITHUB REPO (RoyYash/margdarshak) ---
        // 1. Nonlinear Traffic Delay: Travel Time = (distance / speed) * 60 * (1 + 2.0 * congestion)
        const travelTimeMin = (distKm / baseSpeed) * 60 * (1 + 2.0 * congestion);
        
        let edgeWeight = travelTimeMin + 0.18 * distKm + 18 * congestion;
        if (mode === 'SHORTEST_DISTANCE') {
          edgeWeight = distKm; // Pure physical distance Dijkstra
        } else if (mode === 'MOST_TRAFFIC') {
          // Invert congestion: busy chokepoints have lower weight in Dijkstra so it actively routes through heavy traffic corridors
          edgeWeight = distKm * Math.max(0.08, 1.15 - congestion * 0.95);
        } else {
          // TRAFFIC_FREE: penalize traffic heavily to find free-flowing bypasses
          edgeWeight = travelTimeMin * (1 + 3.0 * congestion) + 0.15 * distKm + 24 * congestion;
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
      let legCongestion = this.getLiveEdgeCongestion(path[i], path[i + 1], vehicles);

      if (mode === 'MOST_TRAFFIC') {
        // Reflect peak congestion in arterial choke-points
        legCongestion = Math.min(0.95, Math.max(0.68, legCongestion * 1.35));
        totalDistKm += legDist;
        totalCongestion += legCongestion;
        totalTimeMin += (legDist / Math.min(24, legSpeed)) * 60 * (1 + 2.6 * legCongestion) + 0.4;
      } else if (mode === 'SHORTEST_DISTANCE') {
        totalDistKm += legDist;
        totalCongestion += legCongestion;
        totalTimeMin += (legDist / legSpeed) * 60 * (1 + 1.4 * legCongestion);
      } else {
        // TRAFFIC_FREE bypass speed
        legCongestion = Math.max(0.08, legCongestion * 0.7);
        totalDistKm += legDist;
        totalCongestion += legCongestion;
        totalTimeMin += (legDist / Math.max(38, legSpeed)) * 60 * (1 + 0.6 * legCongestion);
      }
    }

    const avgCongestion = path.length > 1 ? totalCongestion / (path.length - 1) : (mode === 'MOST_TRAFFIC' ? 0.76 : mode === 'SHORTEST_DISTANCE' ? 0.38 : 0.14);
    const finalScore = totalTimeMin + 0.18 * totalDistKm + 18 * avgCongestion;
    const routeName = this.getRouteNameForPath(path, mode);

    return {
      path,
      distanceKm: Number(Math.max(0.15, totalDistKm).toFixed(2)),
      timeMin: Number(Math.max(0.4, totalTimeMin).toFixed(1)),
      avgCongestion: Number(Math.min(96, Math.max(8, avgCongestion * 100)).toFixed(0)),
      score: Number(finalScore.toFixed(1)),
      routeName,
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

      const timeSaved = Math.max(0.5, Number((congested.timeMin - trafficFree.timeMin).toFixed(1)));

      const fastestRouteOption: MargdarshakRouteOption = {
        type: 'TRAFFIC_FREE',
        title: 'Margdarshak Traffic-Free (Fastest)',
        routeName: trafficFree.routeName,
        highlightTag: 'LESS TRAFFIC • LEAST TIME',
        badge: '⚡ LEAST TIME',
        badgeColor: 'emerald',
        distanceKm: trafficFree.distanceKm,
        estimatedTimeMin: trafficFree.timeMin,
        avgCongestionPct: trafficFree.avgCongestion,
        margdarshakScore: trafficFree.score,
        waypoints: trafficFreeWaypoints,
        nodePath: trafficFree.path,
        description: `Bypasses congested bottlenecks via ${trafficFree.routeName}. Saves ${timeSaved} mins using Margdarshak multi-objective routing.`,
      };

      const shortestRouteOption: MargdarshakRouteOption = {
        type: 'SHORTEST_DISTANCE',
        title: 'Shortest Distance Route',
        routeName: shortest.routeName,
        highlightTag: 'MIN DISTANCE',
        badge: '📏 MIN DISTANCE',
        badgeColor: 'blue',
        distanceKm: shortest.distanceKm,
        estimatedTimeMin: shortest.timeMin,
        avgCongestionPct: shortest.avgCongestion,
        margdarshakScore: shortest.score,
        waypoints: shortestWaypoints,
        nodePath: shortest.path,
        description: `Direct geographic line via ${shortest.routeName}. Minimum physical distance (${shortest.distanceKm} km, ${shortest.avgCongestion}% traffic).`,
      };

      const congestedRouteOption: MargdarshakRouteOption = {
        type: 'MOST_TRAFFIC',
        title: 'Most Congested Corridor',
        routeName: congested.routeName,
        highlightTag: 'BUSIEST ROUTE • HEAVY DELAY',
        badge: '⚠️ BUSIEST ROUTE',
        badgeColor: 'amber',
        distanceKm: congested.distanceKm,
        estimatedTimeMin: congested.timeMin,
        avgCongestionPct: congested.avgCongestion,
        margdarshakScore: congested.score,
        waypoints: congestedWaypoints,
        nodePath: congested.path,
        description: `Heavy traffic bottleneck via ${congested.routeName}. Heavy delay (+${timeSaved} mins delay, ${congested.avgCongestion}% congestion).`,
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
