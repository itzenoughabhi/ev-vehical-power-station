export interface RoadNode {
  id: string;
  lat: number;
  lon: number;
  local3D: { x: number; z: number };
  connectedNodeIds: string[];
}

export interface RoadSegment {
  id: string;
  osmId: number;
  name: string;
  highwayType: string;
  geometryGeo: [number, number][]; // [lon, lat]
  geometry3D: { x: number; z: number }[];
  lengthPoints: number;
}

export interface RoadGraphData {
  center: { lat: number; lon: number };
  metersPerDegLat: number;
  metersPerDegLon: number;
  scale3D: number;
  totalNodes: number;
  totalSegments: number;
  nodes: RoadNode[];
  segments: RoadSegment[];
}

export const BOISAR_GEO_CENTER = {
  lat: 19.7902325,
  lon: 72.7657359,
};

const METERS_PER_DEG_LAT = 110680;
const METERS_PER_DEG_LON = 104746;
const SCALE_3D = 1 / 25;

export function latLonToLocal(lat: number, lon: number): { x: number; z: number } {
  const dLat = lat - BOISAR_GEO_CENTER.lat;
  const dLon = lon - BOISAR_GEO_CENTER.lon;
  const x = dLon * METERS_PER_DEG_LON * SCALE_3D;
  const z = -dLat * METERS_PER_DEG_LAT * SCALE_3D;
  return { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 };
}

export function localToLatLon(x: number, z: number): { lat: number; lon: number } {
  const dLon = x / (METERS_PER_DEG_LON * SCALE_3D);
  const dLat = -z / (METERS_PER_DEG_LAT * SCALE_3D);
  return {
    lat: Number((BOISAR_GEO_CENTER.lat + dLat).toFixed(7)),
    lon: Number((BOISAR_GEO_CENTER.lon + dLon).toFixed(7)),
  };
}

class OsmRoadGraphService {
  private graphData: RoadGraphData | null = null;
  private nodesById: Map<string, RoadNode> = new Map();
  private isLoaded: boolean = false;

  public async load(): Promise<RoadGraphData> {
    if (this.graphData) return this.graphData;

    try {
      const res = await fetch('/data/boisar_road_graph.json');
      const data: RoadGraphData = await res.json();
      this.graphData = data;
      this.nodesById.clear();
      data.nodes.forEach(n => this.nodesById.set(n.id, n));
      this.isLoaded = true;
      return data;
    } catch (err) {
      console.warn('Could not load /data/boisar_road_graph.json over network:', err);
      return {
        center: BOISAR_GEO_CENTER,
        metersPerDegLat: METERS_PER_DEG_LAT,
        metersPerDegLon: METERS_PER_DEG_LON,
        scale3D: SCALE_3D,
        totalNodes: 0,
        totalSegments: 0,
        nodes: [],
        segments: [],
      };
    }
  }

  public getSegments(): RoadSegment[] {
    return this.graphData?.segments || [];
  }

  public getNodes(): RoadNode[] {
    return this.graphData?.nodes || [];
  }
}

export const osmRoadGraphService = new OsmRoadGraphService();
