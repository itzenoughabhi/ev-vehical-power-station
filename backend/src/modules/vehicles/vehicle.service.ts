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

  // Predefined curved road routes connecting Boisar geographic nodes via real road graph
  public static getRouteForStation(stationCode: string): Position3D[] {
    const endNodeId = getStationNodeId(stationCode);
    const startNodeId = stationCode === 'D305' || stationCode === 'A102' ? 'PALGHAR_SOUTH' : 'NORTH_OUTER';
    const path = findShortestPath(startNodeId, endNodeId);
    return generateCurvedRouteFromNodeIds(path);
  }

  public static getRouteForServiceCenter(fromPos?: Position3D): Position3D[] {
    const endNodeId = 'MIDC_S03';
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

  public static getDepartureRoute(stationPosition: Position3D): Position3D[] {
    const startNodeId = findNearestNodeId(stationPosition);
    // Direct vehicles towards outer highway exits
    const endNodeId = stationPosition.z > 20 ? 'PALGHAR_SOUTH' : 'NORTH_OUTER';
    const path = findShortestPath(startNodeId, endNodeId);
    return generateCurvedRouteFromNodeIds(path, stationPosition);
  }

  private seedVehicles() {
    const stations = stationService.getAllStations();

    const initialVehicles = [
      // Primary demo vehicle specified in user prompt:
      {
        code: 'EV-024',
        model: 'Tata Nexon EV' as VehicleModel,
        battery: 64,
        target: 85,
        range: 238,
        speed: 42,
        location: 'Boisar–Palghar Road, km 3.7',
        stIndex: 0, // Destination A102
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
        stIndex: 1, // B104
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 70,
        batteryTemp: 33,
      },
      {
        code: 'EV-042',
        model: 'MG ZS EV' as VehicleModel,
        battery: 58,
        target: 85,
        range: 215,
        speed: 0,
        location: 'Boisar Central Hub, Bay 1',
        stIndex: 0,
        status: 'CHARGING' as VehicleStatus,
        motorTemp: 45,
        batteryTemp: 32,
      },
      {
        code: 'EV-057',
        model: 'Tata Tiago EV' as VehicleModel,
        battery: 15,
        target: 90,
        range: 48,
        speed: 0,
        location: 'Boisar Central Hub, Waiting Bay #1',
        stIndex: 0,
        status: 'QUEUE' as VehicleStatus,
        motorTemp: 52,
        batteryTemp: 34,
      },
      {
        code: 'EV-088',
        model: 'Hyundai Ioniq 5' as VehicleModel,
        battery: 48,
        target: 80,
        range: 210,
        speed: 0,
        location: 'MIDC Industrial Hub, Bay 2',
        stIndex: 2,
        status: 'CHARGING' as VehicleStatus,
        motorTemp: 48,
        batteryTemp: 31,
      },
      {
        code: 'EV-142',
        model: 'Commercial EV Van' as VehicleModel,
        battery: 32,
        target: 90,
        range: 96,
        speed: 35,
        location: 'Tarapur MIDC Ring Road',
        stIndex: 2,
        status: 'EN_ROUTE' as VehicleStatus,
        motorTemp: 64,
        batteryTemp: 30,
      },
    ];

    for (const vData of initialVehicles) {
      const station = stations[vData.stIndex] || stations[0];
      const route = VehicleService.getRouteForStation(station.code);
      const isCharging = vData.status === 'CHARGING';
      const isQueue = vData.status === 'QUEUE';

      let assignedChargerId: string | null = null;
      let startPos: Position3D = route[0];

      if (isCharging) {
        const freeCharger = station.chargers.find(c => c.status === 'AVAILABLE');
        if (freeCharger) {
          freeCharger.status = 'CHARGING';
          freeCharger.currentPowerKw = freeCharger.powerKw === 350 ? 210 : 120;
          freeCharger.currentEvId = vData.code;
          assignedChargerId = freeCharger.id;
          const chIndex = station.chargers.findIndex(c => c.id === freeCharger.id);
          const bayOffset = chIndex !== -1 ? [-3.6, -1.2, 1.2, 3.6][chIndex] : 0;
          startPos = {
            x: station.position.x + bayOffset,
            y: 0,
            z: station.position.z + 1.2,
          };
        } else {
          startPos = { ...station.position };
        }
      } else if (isQueue) {
        station.queue.push(`veh-${vData.code.toLowerCase()}`);
        startPos = {
          x: station.position.x + 3.5,
          y: 0,
          z: station.position.z - 4.5,
        };
      } else {
        // En route along curve
        startPos = route[1] || route[0];
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
        heading: 0,
        destinationStationId: station.id,
        assignedChargerId: assignedChargerId,
        currentStationId: isCharging || isQueue ? station.id : null,
        currentLocationName: vData.location,
        etaMinutes: isCharging ? 0 : 4,
        routeProgress: isCharging ? 1.0 : 0.35,
        routeWaypoints: route,
        currentWaypointIndex: isCharging ? route.length - 1 : 1,
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
      heading: 0,
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
