import { Vehicle, VehicleStatus, VehicleModel, Position3D } from '../../types';
import { stationService } from '../stations/station.service';
import { eventService } from '../events/event.service';
import {
  findShortestPath,
  findNearestNodeId,
  generateCurvedRouteFromNodeIds,
  getStationNodeId,
  ROAD_NODES,
} from './road.graph';

export class VehicleService {
  private static instance: VehicleService;
  private vehicles: Map<string, Vehicle> = new Map();

  private constructor() {
    this.seedVehicles();
  }

  public static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      VehicleService.instance = new VehicleService();
    }
    return VehicleService.instance;
  }

  public reseedVehicles() {
    this.vehicles.clear();
    this.seedVehicles();
  }

  // Predefined curved road routes connecting Boisar geographic nodes via real road graph
  public static getRouteForStation(stationCode: string, fromPos?: Position3D): Position3D[] {
    const endNodeId = getStationNodeId(stationCode);
    let startNodeId = 'CENTRAL_ROUNDABOUT';
    if (fromPos) {
      startNodeId = findNearestNodeId(fromPos);
    } else {
      switch (stationCode) {
        case 'A102': startNodeId = 'SARAVALI_JCT'; break;
        case 'B104': startNodeId = 'CENTRAL_ROUNDABOUT'; break;
        case 'C201': startNodeId = 'MIDC_BRANCH'; break;
        case 'D305': startNodeId = 'BOISAR_TOWN'; break;
        case 'P401': startNodeId = 'SARAVALI_MID'; break;
        case 'M501': startNodeId = 'BOISAR_EAST'; break;
        case 'T601': startNodeId = 'NAVAPUR_CENTRAL'; break;
        case 'D701': startNodeId = 'NORTH_OUTER'; break;
        case 'S801': startNodeId = 'UMROLI_JCT'; break;
        default: startNodeId = 'CENTRAL_ROUNDABOUT'; break;
      }
    }
    const path = findShortestPath(startNodeId, endNodeId);
    return generateCurvedRouteFromNodeIds(path, fromPos);
  }

  public static getRouteForServiceCenter(fromPos?: Position3D): Position3D[] {
    const endNodeId = 'S03_BAY_ENTRANCE';
    const startNodeId = fromPos ? findNearestNodeId(fromPos) : 'CENTRAL_ROUNDABOUT';
    const path = findShortestPath(startNodeId, endNodeId);
    return generateCurvedRouteFromNodeIds(path, fromPos);
  }

  public static getRouteFromCurrentPositionTo(fromPos: Position3D, toPos: Position3D): Position3D[] {
    const startNodeId = findNearestNodeId(fromPos);
    const endNodeId = findNearestNodeId(toPos);
    const path = findShortestPath(startNodeId, endNodeId);
    return generateCurvedRouteFromNodeIds(path, fromPos, toPos);
  }

  public static getDepartureRoute(stationPosition: Position3D, vehiclePosition?: Position3D): Position3D[] {
    const startNodeId = findNearestNodeId(stationPosition);
    const endNodeId = stationPosition.z > 20 ? 'PALGHAR_SOUTH' : 'NORTH_OUTER';
    const path = findShortestPath(startNodeId, endNodeId);
    return generateCurvedRouteFromNodeIds(path, vehiclePosition || stationPosition);
  }

  private seedVehicles() {
    const stations = stationService.getAllStations();

    const initialVehicles = [
      {
        code: 'EV-024',
        model: 'Tata Nexon EV' as VehicleModel,
        battery: 64,
        target: 85,
        range: 238,
        speed: 42,
        location: 'Boisar–Palghar Highway (SH-40)',
        stIndex: 3, // D305 Boisar–Palghar Corridor
        startNodeId: 'SARAVALI_MID',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 67,
        batteryTemp: 31,
      },
      {
        code: 'EV-031',
        model: 'Mahindra XUV400' as VehicleModel,
        battery: 22,
        target: 80,
        range: 82,
        speed: 38,
        location: 'Navapur Road, Tarapur MIDC',
        stIndex: 1, // B104 Navapur Road Hub
        startNodeId: 'NAVAPUR_B104_HWY',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 70,
        batteryTemp: 33,
      },
      {
        code: 'EV-042',
        model: 'MG ZS EV' as VehicleModel,
        battery: 68,
        target: 85,
        range: 255,
        speed: 40,
        location: 'Tarapur Chemical Industrial Ring',
        stIndex: 2, // C201 MIDC Hub
        startNodeId: 'MIDC_CHEM',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 54,
        batteryTemp: 32,
      },
      {
        code: 'EV-057',
        model: 'Tata Tiago EV' as VehicleModel,
        battery: 58,
        target: 90,
        range: 185,
        speed: 36,
        location: 'Boisar Railway Approach',
        stIndex: 0, // A102 Boisar Central
        startNodeId: 'A102_HWY_APPROACH',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 50,
        batteryTemp: 31,
      },
      {
        code: 'EV-088',
        model: 'Hyundai Ioniq 5' as VehicleModel,
        battery: 48,
        target: 80,
        range: 210,
        speed: 0,
        location: 'Palghar District Central Hub, Bay 2',
        stIndex: 4, // P401 Palghar District Central Hub
        startNodeId: 'P401_HIGHWAY',
        status: 'CHARGING' as VehicleStatus,
        motorTemp: 48,
        batteryTemp: 31,
      },
      {
        code: 'EV-142',
        model: 'Commercial EV Van' as VehicleModel,
        battery: 56,
        target: 90,
        range: 212,
        speed: 45,
        location: 'Manor NH-48 Express Highway',
        stIndex: 5, // M501 Manor NH-48 Express Hub
        startNodeId: 'MANOR_APPROACH_2',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 64,
        batteryTemp: 30,
      },
      {
        code: 'EV-168',
        model: 'BYD Atto 3' as VehicleModel,
        battery: 74,
        target: 85,
        range: 290,
        speed: 42,
        location: 'Tarapur Coastal Highway near Chinchani',
        stIndex: 6, // T601 Tarapur Coastal Energy Hub
        startNodeId: 'CHINCHANI_COAST',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 52,
        batteryTemp: 31,
      },
      {
        code: 'EV-195',
        model: 'Kia EV6' as VehicleModel,
        battery: 82,
        target: 95,
        range: 340,
        speed: 46,
        location: 'Dahanu Northern Arterial Highway',
        stIndex: 7, // D701 Dahanu Highway Hub
        startNodeId: 'VANGAON_JCT',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 56,
        batteryTemp: 32,
      },
      {
        code: 'EV-TRK-01',
        model: 'Heavy Electric Hauler' as VehicleModel,
        battery: 78,
        target: 90,
        range: 420,
        speed: 36,
        location: 'Surya River Palghar–Manor Corridor',
        stIndex: 5, // M501 Manor NH-48 Express Hub
        startNodeId: 'PALGHAR_MANOR_LINK_1',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 68,
        batteryTemp: 34,
      },
      {
        code: 'EV-PKP-02',
        model: 'Electric Pickup Truck' as VehicleModel,
        battery: 65,
        target: 85,
        range: 310,
        speed: 42,
        location: 'Tarapur Heavy Engineering Sector',
        stIndex: 2, // C201 MIDC Hub
        startNodeId: 'MIDC_HEAVY',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 58,
        batteryTemp: 31,
      },
      {
        code: 'EV-SHR-01',
        model: 'Porsche Taycan' as VehicleModel,
        battery: 62,
        target: 85,
        range: 310,
        speed: 48,
        location: 'Shirgaon Beach Coastal Promenade',
        stIndex: 4, // S801 Shirgaon Beach & Fort Hub
        startNodeId: 'SHIRGAON_COAST_HWY',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 52,
        batteryTemp: 30,
      },
      {
        code: 'EV-PATROL-03',
        model: 'Highway Patrol EV' as VehicleModel,
        battery: 88,
        target: 95,
        range: 350,
        speed: 48,
        location: 'Boisar–Palghar South Highway Patrol',
        stIndex: 4, // P401 Palghar Central Corridor
        startNodeId: 'PALGHAR_NORTH',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 62,
        batteryTemp: 30,
      },
      {
        code: 'EV-MDY-04',
        model: 'Tesla Model Y' as VehicleModel,
        battery: 72,
        target: 90,
        range: 380,
        speed: 44,
        location: 'Navapur Beach Coastal Road',
        stIndex: 6, // T601 Tarapur Coastal Hub
        startNodeId: 'NAVAPUR_BEACH',
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 54,
        batteryTemp: 31,
      },
    ];

    for (const vData of initialVehicles) {
      const station = stations[vData.stIndex] || stations[0];
      const targetNodeId = getStationNodeId(station.code);
      const fromNodeId = vData.startNodeId || 'CENTRAL_ROUNDABOUT';
      const path = findShortestPath(fromNodeId, targetNodeId);
      const route = generateCurvedRouteFromNodeIds(path);
      const isCharging = vData.status === 'CHARGING';
      const isQueue = vData.status === 'QUEUE';

      let assignedChargerId: string | null = null;
      const initialNode = ROAD_NODES[fromNodeId];
      let startPos: Position3D = initialNode ? { x: initialNode.x, y: 0, z: initialNode.z } : (route[0] || { ...station.position });

      if (isCharging) {
        const freeCharger = station.chargers.find(c => c.status === 'AVAILABLE');
        if (freeCharger) {
          freeCharger.status = 'CHARGING';
          freeCharger.currentPowerKw = freeCharger.powerKw === 350 ? 210 : 120;
          freeCharger.currentEvId = vData.code;
          assignedChargerId = freeCharger.id;
          const chIndex = station.chargers.findIndex(c => c.id === freeCharger.id);
          const totalCh = station.chargers.length;
          const bayOffset = totalCh <= 4 ? [-3.6, -1.2, 1.2, 3.6][chIndex >= 0 ? chIndex : 0] : [-5.2, -3.1, -1.0, 1.0, 3.1, 5.2][chIndex >= 0 ? chIndex : 0];
          startPos = {
            x: station.position.x + bayOffset,
            y: 0,
            z: station.position.z + 3.0,
          };
        } else {
          startPos = { ...station.position };
        }
      } else if (isQueue) {
        station.queue.push(`veh-${vData.code.toLowerCase()}`);
        startPos = {
          x: station.position.x + 3.8 + station.queue.length * 2.8,
          y: 0,
          z: station.position.z - 4.5,
        };
      } else {
        // En route along curve starting on right-hand driving lane
        startPos = route[0] || (initialNode ? { x: initialNode.x, y: 0, z: initialNode.z } : { ...station.position });
      }

      const vehicle: Vehicle = {
        id: `veh-${vData.code.toLowerCase()}`,
        code: vData.code,
        model: vData.model,
        batteryCapacityKwh: vData.model === 'Commercial EV Van' ? 80 : 50,
        currentBatteryPct: vData.battery,
        targetBatteryPct: vData.target,
        estimatedRangeKm: vData.range,
        status: vData.status,
        speed: isCharging || isQueue ? 0 : vData.speed,
        position: startPos,
        heading: isCharging ? 0 : route.length > 1 ? Math.atan2(route[1].x - route[0].x, route[1].z - route[0].z) : 0,
        destinationStationId: station.id,
        assignedChargerId: assignedChargerId,
        currentStationId: isCharging || isQueue ? station.id : null,
        currentLocationName: vData.location,
        etaMinutes: isCharging ? 0 : 4,
        routeProgress: isCharging ? 1.0 : 0.35,
        routeWaypoints: isCharging || isQueue ? [] : route,
        currentWaypointIndex: 0,
        chargingRateKw: isCharging ? 120 : 0,
        energyConsumedKwh: 12.4,
        tripDistanceKm: 18.5,
        motorTemperatureC: vData.motorTemp,
        batteryTemperatureC: vData.batteryTemp,
        brakeSystemHealth: 'NORMAL',
        tyreHealth: 'NORMAL',
        vehicleHealth: 'GOOD',
        faultReason: null,
        serviceCenterId: null,
        repairProgressPct: 0,
        updatedAt: new Date().toISOString(),
      };

      this.vehicles.set(vehicle.id, vehicle);
    }
  }

  public getAllVehicles(): Vehicle[] {
    return Array.from(this.vehicles.values());
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.get(id) || Array.from(this.vehicles.values()).find(v => v.code.toLowerCase() === id.toLowerCase());
  }

  public spawnVehicle(customData?: Partial<Vehicle>): Vehicle {
    const code = `EV-0${Math.floor(60 + Math.random() * 39)}`;
    const models: VehicleModel[] = [
      'Tata Nexon EV', 'Mahindra XUV400', 'MG ZS EV', 'Tata Tiago EV', 'Hyundai Ioniq 5', 'Commercial EV Van'
    ];
    const stations = stationService.getAllStations();
    const station = stations[Math.floor(Math.random() * stations.length)];
    const route = VehicleService.getRouteForStation(station.code);

    const vehicle: Vehicle = {
      id: `veh-${code.toLowerCase()}-${Date.now()}`,
      code,
      model: models[Math.floor(Math.random() * models.length)],
      batteryCapacityKwh: 50,
      currentBatteryPct: Math.floor(18 + Math.random() * 25),
      targetBatteryPct: 85,
      estimatedRangeKm: Math.floor(60 + Math.random() * 80),
      status: 'EN_ROUTE',
      speed: 38 + Math.floor(Math.random() * 15),
      position: { ...route[0] },
      heading: route.length > 1 ? Math.atan2(route[1].x - route[0].x, route[1].z - route[0].z) : 0,
      destinationStationId: station.id,
      assignedChargerId: null,
      currentStationId: null,
      currentLocationName: `Boisar Access Corridor`,
      etaMinutes: 5,
      routeProgress: 0.0,
      routeWaypoints: route,
      currentWaypointIndex: 0,
      chargingRateKw: 0,
      energyConsumedKwh: 0,
      tripDistanceKm: 4.2,
      motorTemperatureC: 62 + Math.floor(Math.random() * 8),
      batteryTemperatureC: 30 + Math.floor(Math.random() * 4),
      brakeSystemHealth: 'NORMAL',
      tyreHealth: 'NORMAL',
      vehicleHealth: 'GOOD',
      faultReason: null,
      serviceCenterId: null,
      repairProgressPct: 0,
      updatedAt: new Date().toISOString(),
      ...customData,
    };

    this.vehicles.set(vehicle.id, vehicle);

    eventService.addEvent({
      type: 'ARRIVAL',
      severity: 'INFO',
      message: `🚗 ${vehicle.code} (${vehicle.model}) en route to ${station.name} [${station.code}] — Battery: ${vehicle.currentBatteryPct}%`,
      vehicleId: vehicle.id,
      stationId: station.id,
    });

    return vehicle;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | undefined {
    const vehicle = this.getVehicleById(id);
    if (!vehicle) return undefined;

    Object.assign(vehicle, updates, { updatedAt: new Date().toISOString() });
    return vehicle;
  }

  public redirectVehicle(vehicleId: string, targetStationId: string): boolean {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return false;

    const newStation = stationService.getStationById(targetStationId);
    if (!newStation) return false;

    const newRoute = VehicleService.getRouteFromCurrentPositionTo(vehicle.position, newStation.position);
    vehicle.destinationStationId = newStation.id;
    vehicle.routeWaypoints = newRoute;
    vehicle.currentWaypointIndex = 0;
    vehicle.routeProgress = 0.1;
    vehicle.status = 'EN_ROUTE';
    vehicle.etaMinutes = 4;
    vehicle.currentLocationName = `En route to ${newStation.name} [${newStation.code}]`;
    vehicle.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'REDIRECT',
      severity: 'SUCCESS',
      message: `🔄 ${vehicle.code} successfully rerouted to Station ${newStation.code} (${newStation.name})`,
      vehicleId: vehicle.id,
      stationId: newStation.id,
    });

    return true;
  }

  public sendToService(vehicleId: string): boolean {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return false;

    const sc = stationService.getServiceCenter();
    const serviceRoute = VehicleService.getRouteFromCurrentPositionTo(vehicle.position, sc.position);

    vehicle.status = 'EN_ROUTE';
    vehicle.serviceCenterId = sc.id;
    vehicle.destinationStationId = null;
    vehicle.routeWaypoints = serviceRoute;
    vehicle.currentWaypointIndex = 0;
    vehicle.routeProgress = 0.1;
    vehicle.etaMinutes = 3;
    vehicle.currentLocationName = `Routing to ${sc.name}`;
    vehicle.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'SERVICE',
      severity: 'WARNING',
      message: `🚨 ${vehicle.code} dispatched to ${sc.name} [S03] for emergency diagnostics`,
      vehicleId: vehicle.id,
    });

    return true;
  }
}

export const vehicleService = VehicleService.getInstance();
