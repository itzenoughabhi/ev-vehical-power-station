import { create } from 'zustand';
import { 
  Station, 
  Vehicle, 
  NetworkKPIs, 
  EnergyMetrics, 
  LiveEvent, 
  Recommendation, 
  PowerGrid, 
  ServiceCenter, 
  HomeCharger,
  CameraMode,
  MapMode 
} from '../types';

export interface SelectedObject {
  type: 'station' | 'charger' | 'vehicle' | 'grid' | 'service' | 'homeCharger';
  id: string;
  stationId?: string;
  data?: any;
}

interface DigitalTwinState {
  // Operational state
  stations: Station[];
  vehicles: Vehicle[];
  powerGrid: PowerGrid | null;
  serviceCenter: ServiceCenter | null;
  homeChargers: HomeCharger[];
  kpis: NetworkKPIs;
  energy: EnergyMetrics;
  events: LiveEvent[];
  recommendations: Recommendation[];
  isConnected: boolean;
  simulationSpeed: number;
  scenarioStep: number;

  // Visual / 3D navigation state
  selectedObject: SelectedObject | null;
  cameraMode: CameraMode;
  mapMode: MapMode;
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  trackingVehicleId: string | null;
  isGridOverlayActive: boolean;

  // UI state
  activeNav: 'overview' | 'stations' | 'vehicles' | 'grid' | 'service' | 'analytics' | 'incidents';
  isSimDrawerOpen: boolean;
  isEventsOpen: boolean;
  is2dMapOpen: boolean;
  isScenarioDrawerOpen: boolean;

  // Actions
  setSnapshot: (snapshot: any) => void;
  updateTick: (data: any) => void;
  addEvent: (event: LiveEvent) => void;
  setConnectionStatus: (status: boolean) => void;

  // Selection & Camera Controls
  selectStation: (stationId: string) => void;
  selectVehicle: (vehicleId: string) => void;
  selectCharger: (stationId: string, chargerId: string) => void;
  selectGrid: () => void;
  selectServiceCenter: () => void;
  selectHomeCharger: (homeId: string) => void;
  clearSelection: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setMapMode: (mode: MapMode) => void;
  recenterCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleTrackVehicle: (vehicleId: string) => void;
  toggleGridOverlay: (active?: boolean) => void;
  setScenarioStep: (step: number) => void;

  // UI toggles
  setActiveNav: (nav: 'overview' | 'stations' | 'vehicles' | 'grid' | 'service' | 'analytics' | 'incidents') => void;
  toggleSimDrawer: (open?: boolean) => void;
  toggleEvents: (open?: boolean) => void;
  toggle2dMap: (open?: boolean) => void;
  toggleScenarioDrawer: (open?: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  resolveRecommendationLocally: (id: string, accept: boolean) => void;
}

const DEFAULT_KPIS: NetworkKPIs = {
  activeStations: 4,
  availableChargers: 12,
  vehiclesCharging: 4,
  waitingVehicles: 2,
  activeFaults: 0,
  networkLoadMw: 3.4,
  totalDailyEnergyMwh: 24.5,
  serviceVehicles: 1,
  homeChargingVehicles: 2,
};

const DEFAULT_ENERGY: EnergyMetrics = {
  networkLoadKw: 3400,
  peakDemandKw: 4200,
  averageDemandKw: 3200,
  totalEnergyDeliveredKwh: 24500,
  chargingEfficiencyPct: 95.2,
  history: [],
};

// Boisar 45-55 degree elevated cinematic camera default
const CITY_CAMERA_POS: [number, number, number] = [38, 42, 48];
const CITY_CAMERA_TARGET: [number, number, number] = [-4, 1, 4];

export const useDigitalTwinStore = create<DigitalTwinState>((set, get) => ({
  stations: [],
  vehicles: [],
  powerGrid: null,
  serviceCenter: null,
  homeChargers: [],
  kpis: DEFAULT_KPIS,
  energy: DEFAULT_ENERGY,
  events: [],
  recommendations: [],
  isConnected: false,
  simulationSpeed: 1.0,
  scenarioStep: 0,

  selectedObject: null,
  cameraMode: 'CITY',
  mapMode: 'REAL_MAP',
  cameraTarget: CITY_CAMERA_TARGET,
  cameraPosition: CITY_CAMERA_POS,
  trackingVehicleId: null,
  isGridOverlayActive: false,

  activeNav: 'overview',
  isSimDrawerOpen: false,
  isEventsOpen: false,
  is2dMapOpen: false,
  isScenarioDrawerOpen: false,

  setSnapshot: (snapshot) => {
    set({
      stations: snapshot.stations || [],
      vehicles: snapshot.vehicles || [],
      powerGrid: snapshot.powerGrid || null,
      serviceCenter: snapshot.serviceCenter || null,
      homeChargers: snapshot.homeChargers || [],
      kpis: snapshot.kpis || DEFAULT_KPIS,
      energy: snapshot.energy || DEFAULT_ENERGY,
      events: snapshot.events || [],
      recommendations: snapshot.recommendations || [],
      simulationSpeed: snapshot.simulation?.speed ?? 1.0,
      isConnected: true,
    });
  },

  updateTick: (data) => {
    set((state) => {
      const updatedRecs = data.recommendation 
        ? [data.recommendation, ...state.recommendations.filter(r => r.id !== data.recommendation.id)]
        : state.recommendations;

      let nextTarget = state.cameraTarget;
      let nextPos = state.cameraPosition;

      if (state.trackingVehicleId && data.vehicles) {
        const tracked = (data.vehicles as Vehicle[]).find((v) => v.id === state.trackingVehicleId);
        if (tracked) {
          nextTarget = [tracked.position.x, 1, tracked.position.z];
          nextPos = [tracked.position.x, 14, tracked.position.z + 18];
        }
      }

      return {
        stations: data.stations || state.stations,
        vehicles: data.vehicles || state.vehicles,
        powerGrid: data.powerGrid || state.powerGrid,
        serviceCenter: data.serviceCenter || state.serviceCenter,
        homeChargers: data.homeChargers || state.homeChargers,
        kpis: data.kpis || state.kpis,
        energy: data.energy || state.energy,
        recommendations: updatedRecs,
        cameraTarget: nextTarget,
        cameraPosition: nextPos,
      };
    });
  },

  addEvent: (event) => {
    set((state) => ({
      events: [event, ...state.events.slice(0, 39)],
    }));
  },

  setConnectionStatus: (status) => set({ isConnected: status }),

  selectStation: (stationId) => {
    const { stations } = get();
    const st = stations.find((s) => s.id === stationId || s.code.toLowerCase() === stationId.toLowerCase());
    if (!st) return;

    set({
      selectedObject: { type: 'station', id: st.id, data: st },
      cameraMode: 'STATION',
      cameraTarget: [st.position.x, 1.5, st.position.z],
      cameraPosition: [st.position.x, 18, st.position.z + 24],
      trackingVehicleId: null,
    });
  },

  selectVehicle: (vehicleId) => {
    const { vehicles } = get();
    const veh = vehicles.find((v) => v.id === vehicleId || v.code.toLowerCase() === vehicleId.toLowerCase());
    if (!veh) return;

    set({
      selectedObject: { type: 'vehicle', id: veh.id, data: veh },
      cameraMode: 'VEHICLE',
      trackingVehicleId: veh.id,
      cameraTarget: [veh.position.x, 1, veh.position.z],
      cameraPosition: [veh.position.x, 14, veh.position.z + 18],
    });
  },

  selectCharger: (stationId, chargerId) => {
    const { stations } = get();
    const st = stations.find((s) => s.id === stationId);
    if (!st) return;
    const ch = st.chargers.find((c) => c.id === chargerId || c.code === chargerId);
    if (!ch) return;

    set({
      selectedObject: { type: 'charger', id: ch.id, stationId: st.id, data: { ...ch, station: st } },
      cameraMode: 'STATION',
      cameraTarget: [st.position.x, 1.5, st.position.z],
      cameraPosition: [st.position.x, 14, st.position.z + 18],
      trackingVehicleId: null,
    });
  },

  selectGrid: () => {
    const { powerGrid } = get();
    const pos = powerGrid?.position || { x: -26, y: 0, z: -38 };
    set({
      selectedObject: { type: 'grid', id: 'grid-s01', data: powerGrid },
      cameraMode: 'GRID',
      isGridOverlayActive: true,
      trackingVehicleId: null,
      cameraTarget: [pos.x, 2, pos.z],
      cameraPosition: [pos.x + 12, 28, pos.z + 32],
    });
  },

  selectServiceCenter: () => {
    const { serviceCenter } = get();
    const pos = serviceCenter?.position || { x: -14, y: 0, z: 24 };
    set({
      selectedObject: { type: 'service', id: 's03', data: serviceCenter },
      cameraMode: 'SERVICE',
      trackingVehicleId: null,
      cameraTarget: [pos.x, 1.8, pos.z],
      cameraPosition: [pos.x + 10, 20, pos.z + 24],
    });
  },

  selectHomeCharger: (homeId) => {
    const { homeChargers } = get();
    const hc = homeChargers.find(h => h.homeId === homeId);
    if (!hc) return;

    set({
      selectedObject: { type: 'homeCharger', id: hc.homeId, data: hc },
      trackingVehicleId: null,
      cameraTarget: [hc.position.x, 1.5, hc.position.z],
      cameraPosition: [hc.position.x + 8, 14, hc.position.z + 14],
    });
  },

  clearSelection: () => set({ selectedObject: null, trackingVehicleId: null }),

  setCameraMode: (mode) => {
    const { stations, vehicles, powerGrid, serviceCenter } = get();
    set({ cameraMode: mode });

    switch (mode) {
      case 'CITY':
        set({
          selectedObject: null,
          trackingVehicleId: null,
          cameraTarget: CITY_CAMERA_TARGET,
          cameraPosition: CITY_CAMERA_POS,
        });
        break;
      case 'STATION':
        if (stations.length > 0) {
          get().selectStation(stations[0].id);
        }
        break;
      case 'VEHICLE':
        if (vehicles.length > 0) {
          get().selectVehicle(vehicles[0].id);
        }
        break;
      case 'GRID':
        get().selectGrid();
        break;
      case 'SERVICE':
        get().selectServiceCenter();
        break;
    }
  },

  setMapMode: (mode) => {
    set({ mapMode: mode });

    switch (mode) {
      case 'REAL_MAP':
        // Stay on OpenStreetMap
        break;
      case '3D_TWIN':
        set({ cameraMode: 'CITY' });
        break;
      case 'VEHICLE_FOLLOW': {
        const { vehicles, selectedObject, selectVehicle } = get();
        const vehId = (selectedObject?.type === 'vehicle' && selectedObject.id) || vehicles[0]?.id;
        if (vehId) {
          selectVehicle(vehId);
        }
        break;
      }
      case 'CHARGING_NETWORK': {
        const { stations, selectStation } = get();
        if (stations.length > 0) {
          selectStation(stations[0].id);
        }
        break;
      }
      case 'POWER_GRID': {
        const { selectGrid, toggleGridOverlay } = get();
        selectGrid();
        toggleGridOverlay(true);
        break;
      }
      case 'SERVICE_NETWORK': {
        const { selectServiceCenter } = get();
        selectServiceCenter();
        break;
      }
    }
  },

  recenterCamera: () => {
    set({
      selectedObject: null,
      trackingVehicleId: null,
      cameraMode: 'CITY',
      cameraTarget: CITY_CAMERA_TARGET,
      cameraPosition: CITY_CAMERA_POS,
    });
  },

  zoomIn: () => {
    set((s) => {
      const [px, py, pz] = s.cameraPosition;
      const [tx, ty, tz] = s.cameraTarget;
      return {
        cameraPosition: [
          tx + (px - tx) * 0.8,
          Math.max(6, ty + (py - ty) * 0.8),
          tz + (pz - tz) * 0.8,
        ],
      };
    });
  },

  zoomOut: () => {
    set((s) => {
      const [px, py, pz] = s.cameraPosition;
      const [tx, ty, tz] = s.cameraTarget;
      return {
        cameraPosition: [
          tx + (px - tx) * 1.25,
          Math.min(100, ty + (py - ty) * 1.25),
          tz + (pz - tz) * 1.25,
        ],
      };
    });
  },

  toggleTrackVehicle: (vehicleId) => {
    set((s) => ({
      trackingVehicleId: s.trackingVehicleId === vehicleId ? null : vehicleId,
      cameraMode: s.trackingVehicleId === vehicleId ? 'CITY' : 'VEHICLE',
    }));
  },

  toggleGridOverlay: (active) => set((s) => ({ isGridOverlayActive: active ?? !s.isGridOverlayActive })),
  setScenarioStep: (step) => set({ scenarioStep: step }),

  setActiveNav: (nav) => set({ activeNav: nav }),
  toggleSimDrawer: (open) => set((s) => ({ isSimDrawerOpen: open ?? !s.isSimDrawerOpen })),
  toggleEvents: (open) => set((s) => ({ isEventsOpen: open ?? !s.isEventsOpen })),
  toggle2dMap: (open) => set((s) => ({ is2dMapOpen: open ?? !s.is2dMapOpen })),
  toggleScenarioDrawer: (open) => set((s) => ({ isScenarioDrawerOpen: open ?? !s.isScenarioDrawerOpen })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  resolveRecommendationLocally: (id, accept) => {
    set((state) => ({
      recommendations: state.recommendations.filter((r) => r.id !== id),
    }));
  },
}));
