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

export function localToLatLon(x: number, z: number): { lat: number; lon: number } {
  let dLat = 0;
  let dLon = 0;

  if (x < 0 && z <= 10) {
    // Western zone (Navapur, MIDC, Chinchani, Tarapur Coastal / TAPS)
    // Clamped so coastal nodes remain safely on dry land (Chinchani Beach Road >= 72.697°E, Arabian Sea is < 72.693°E)
    const t = Math.min(1, Math.abs(x) / 95);
    dLon = -0.067 * t;
    if (z > 0) {
      // MIDC Chemical & Heavy Engineering Sector (South-West)
      dLat = -z * 0.000373;
    } else {
      // Tarapur Coastal Energy & Chinchani Coast (North-West)
      dLat = (Math.abs(z) / 48) * 0.038 * t;
    }
  } else if (z > 10) {
    // Southern corridor to Palghar District Headquarters & Shirgaon Coast
    if (x < -20) {
      // Shirgaon Historic Coastal Fort & Beach Promenade (SW Coast firmly on dry land)
      const t = Math.min(1, Math.abs(x) / 65);
      dLat = -z * 0.00045;
      dLon = -0.056 * t;
    } else {
      // Boisar-Palghar Highway corridor (SH-40) reaching Palghar District Central
      dLat = -z * 0.00047;
      dLon = (x / 48) * 0.006;
    }
  } else if (x > 25 && z > -50) {
    // Eastern Express corridor to Manor NH-48 Express Highway (X: 210)
    const t = Math.min(1, x / 210);
    dLat = -0.050 * t;
    dLon = 0.150 * t;
  } else if (z < -10) {
    // Northern corridor towards Vangaon / Dahanu Agro Gateway (Z: -220)
    const t = Math.min(1, Math.abs(z) / 220);
    dLat = 0.180 * t;
    dLon = 0.008 * t;
  } else {
    // Boisar Central Urban Core
    dLat = -z * 0.00045;
    dLon = x * 0.00055;
  }

  return {
    lat: Number((BOISAR_GEO_CENTER.lat + dLat).toFixed(7)),
    lon: Number((BOISAR_GEO_CENTER.lon + dLon).toFixed(7)),
  };
}

export function latLonToLocal(lat: number, lon: number): { x: number; z: number } {
  const dLat = lat - BOISAR_GEO_CENTER.lat;
  const dLon = lon - BOISAR_GEO_CENTER.lon;
  // Inverse approximate projection
  let z = 0;
  let x = 0;
  if (dLat < -0.015) {
    z = -dLat / 0.00047;
    x = dLon < -0.02 ? (dLon / 0.056) * -65 : (dLon / 0.006) * 48;
  } else if (dLon > 0.03) {
    x = (dLon / 0.150) * 210;
    z = -16;
  } else if (dLon < -0.02) {
    x = (dLon / 0.067) * -95;
    z = -(dLat / 0.038) * 48;
  } else if (dLat > 0.015) {
    z = -dLat / 0.00082;
    x = 30;
  } else {
    z = -dLat / 0.00045;
    x = dLon / 0.00055;
  }
  return { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 };
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
