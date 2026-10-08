import { Station, StationStatus, Charger, ChargerStatus, ServiceCenter, HomeCharger, Position3D } from '../../types';
import { eventService } from '../events/event.service';

export class StationService {
  private static instance: StationService;
  private stations: Map<string, Station> = new Map();
  private serviceCenters: Map<string, ServiceCenter> = new Map();
  private homeChargers: Map<string, HomeCharger> = new Map();

  private constructor() {
    this.seedStations();
    this.seedServiceCenter();
    this.seedHomeChargers();
  }

  public static getInstance(): StationService {
    if (!StationService.instance) {
      StationService.instance = new StationService();
    }
    return StationService.instance;
  }

  private seedStations() {
    const rawStations = [
      {
        id: 'st-a102',
        code: 'A102',
        name: 'Boisar Central Hub',
        district: 'Railway Station / Market Corridor',
        position: { x: -8, y: 0, z: -18 },
        maxCapacityKw: 600,
        chargersCount: 4,
      },
      {
        id: 'st-b104',
        code: 'B104',
        name: 'Navapur Road Hub',
        district: 'West Industrial Corridor',
        position: { x: -48, y: 0, z: -28 },
        maxCapacityKw: 600,
        chargersCount: 4,
      },
      {
        id: 'st-c201',
        code: 'C201',
        name: 'MIDC Industrial Hub',
        district: 'Tarapur Heavy Chemical Zone',
        position: { x: -48, y: 0, z: 22 },
        maxCapacityKw: 600,
        chargersCount: 4,
      },
      {
        id: 'st-d305',
        code: 'D305',
        name: 'Boisar–Palghar Corridor',
        district: 'South Highway Interchange',
        position: { x: 38, y: 0, z: 65 },
        maxCapacityKw: 600,
        chargersCount: 4,
      },
      // --- PALGHAR DISTRICT LONG-DISTANCE REGIONAL HUBS ---
      {
        id: 'st-p401',
        code: 'P401',
        name: 'Palghar District Central Hub',
        district: 'Palghar Collectorate & Railway Junction',
        position: { x: 48, y: 0, z: 200 },
        maxCapacityKw: 900,
        chargersCount: 6,
      },
      {
        id: 'st-s801',
        code: 'S801',
        name: 'Shirgaon Beach & Fort Hub',
        district: 'Shirgaon Historic Coast & Ocean Promenade',
        position: { x: -65, y: 0, z: 210 },
        maxCapacityKw: 600,
        chargersCount: 4,
      },
      {
        id: 'st-m501',
        code: 'M501',
        name: 'Manor NH-48 Express Hub',
        district: 'Mumbai-Ahmedabad Expressway Corridor',
        position: { x: 210, y: 0, z: -20 },
        maxCapacityKw: 1200,
        chargersCount: 6,
      },
      {
        id: 'st-t601',
        code: 'T601',
        name: 'Tarapur Coastal Energy Hub',
        district: 'Tarapur Atomic Zone & Chinchani Coast',
        position: { x: -96, y: 0, z: -32 },
        maxCapacityKw: 600,
        chargersCount: 4,
      },
      {
        id: 'st-d701',
        code: 'D701',
        name: 'Dahanu Highway Hub',
        district: 'North Palghar Coastal Gateway',
        position: { x: 36, y: 0, z: -220 },
        maxCapacityKw: 600,
        chargersCount: 4,
      },
    ];

    for (const rs of rawStations) {
      const chargers: Charger[] = [];
      for (let i = 1; i <= rs.chargersCount; i++) {
        const cCode = `${rs.code}-0${i}`;
        chargers.push({
          id: `ch-${rs.code.toLowerCase()}-${i}`,
          code: cCode,
          stationId: rs.id,
          status: 'AVAILABLE',
          powerKw: i === 1 ? 350 : 150, // Ultra-fast + fast chargers
          currentPowerKw: 0,
          currentEvId: null,
          failureCount: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      const station: Station = {
        id: rs.id,
        code: rs.code,
        name: rs.name,
        district: rs.district,
        status: 'ONLINE',
        position: rs.position,
        maxCapacityKw: rs.maxCapacityKw,
        currentLoadKw: 0,
        dailyEnergyKwh: 1420 + Math.floor(Math.random() * 800),
        utilizationRate: 0,
        avgChargingTimeMin: 28,
        estimatedWaitMinutes: 0,
        todaySessionsCount: 42 + Math.floor(Math.random() * 20),
        chargers,
        queue: [],
        activeIncidentsCount: 0,
        updatedAt: new Date().toISOString(),
      };

      this.stations.set(station.id, station);
    }
  }

  private seedServiceCenter() {
    const s03: ServiceCenter = {
      id: 's03',
      code: 'S03',
      name: 'Tarapur EV Diagnostics & Service Hub',
      locationName: 'MIDC Boisar Link, Plot 42',
      position: { x: -28, y: 0, z: 54 },
      totalBays: 4,
      occupiedBays: 1,
      availableBays: 3,
      techniciansCount: 6,
      batteryDiagnostics: 'AVAILABLE',
      bays: [
        {
          bayIndex: 0,
          vehicleId: 'veh-demo-01',
          vehicleCode: 'EV-310',
          status: 'OCCUPIED',
          problem: 'Inverter busbar re-torque',
          progressPct: 65,
          estimatedTimeMin: 6,
        },
        {
          bayIndex: 1,
          vehicleId: null,
          vehicleCode: null,
          status: 'AVAILABLE',
        },
        {
          bayIndex: 2,
          vehicleId: null,
          vehicleCode: null,
          status: 'AVAILABLE',
        },
        {
          bayIndex: 3,
          vehicleId: null,
          vehicleCode: null,
          status: 'AVAILABLE',
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    this.serviceCenters.set(s03.id, s03);
  }

  private seedHomeChargers() {
    const chargers: HomeCharger[] = [
      {
        homeId: 'HOME-024',
        chargerId: 'HC-024',
        locationName: 'Betegaon Green Valley #24',
        position: { x: 48, y: 0, z: 30 },
        connectedEvId: 'EV-118',
        connectedEvModel: 'Tata Nexon EV',
        chargingPowerKw: 7.2,
        batteryPct: 42,
        status: 'CHARGING',
        estimatedCompletionTime: '02:15',
        updatedAt: new Date().toISOString(),
      },
      {
        homeId: 'HOME-052',
        chargerId: 'HC-052',
        locationName: 'Saravali Palms Villa #52',
        position: { x: 46, y: 0, z: 74 },
        connectedEvId: 'EV-074',
        connectedEvModel: 'MG ZS EV',
        chargingPowerKw: 7.2,
        batteryPct: 68,
        status: 'CHARGING',
        estimatedCompletionTime: '01:05',
        updatedAt: new Date().toISOString(),
      },
      {
        homeId: 'HOME-088',
        chargerId: 'HC-088',
        locationName: 'Betegaon Enclave #88',
        position: { x: 78, y: 0, z: -36 },
        connectedEvId: 'EV-162',
        connectedEvModel: 'Mahindra XUV400',
        chargingPowerKw: 7.2,
        batteryPct: 88,
        status: 'STANDBY',
        estimatedCompletionTime: '00:20',
        updatedAt: new Date().toISOString(),
      },
    ];

    chargers.forEach((hc) => this.homeChargers.set(hc.homeId, hc));
  }

  public getAllStations(): Station[] {
    return Array.from(this.stations.values());
  }

  public getStationById(id: string): Station | undefined {
    return this.stations.get(id) || Array.from(this.stations.values()).find(s => s.code.toLowerCase() === id.toLowerCase());
  }

  public getServiceCenter(): ServiceCenter {
    return this.serviceCenters.get('s03')!;
  }

  public getAllHomeChargers(): HomeCharger[] {
    return Array.from(this.homeChargers.values());
  }

  public updateStation(id: string, updates: Partial<Station>): Station | undefined {
    const station = this.getStationById(id);
    if (!station) return undefined;

    Object.assign(station, updates, { updatedAt: new Date().toISOString() });
    this.recomputeStationMetrics(station);
    return station;
  }

  public recomputeStationMetrics(station: Station) {
    let load = 0;
    let chargingCount = 0;
    let faultCount = 0;

    for (const c of station.chargers) {
      load += c.currentPowerKw;
      if (c.status === 'CHARGING') chargingCount++;
      if (c.status === 'FAULT') faultCount++;
    }

    station.currentLoadKw = Math.round(load * 10) / 10;
    station.utilizationRate = Math.min(100, Math.round((load / station.maxCapacityKw) * 100));

    const workingChargers = station.chargers.filter(c => c.status !== 'FAULT' && c.status !== 'OFFLINE').length;
    
    if (station.queue.length === 0) {
      station.estimatedWaitMinutes = 0;
    } else {
      station.estimatedWaitMinutes = Math.round((station.queue.length * 16) / Math.max(1, workingChargers));
    }

    if (faultCount >= 3) {
      station.status = 'DEGRADED';
    } else if (station.utilizationRate > 85) {
      station.status = 'OVERLOADED';
    } else {
      station.status = 'ONLINE';
    }

    station.activeIncidentsCount = faultCount + (station.status === 'OVERLOADED' ? 1 : 0);
  }

  public setChargerStatus(
    stationId: string, 
    chargerId: string, 
    status: ChargerStatus, 
    evId: string | null = null,
    powerKw: number = 0,
    reason?: string
  ): Charger | undefined {
    const station = this.getStationById(stationId);
    if (!station) return undefined;

    const charger = station.chargers.find(c => c.id === chargerId || c.code === chargerId);
    if (!charger) return undefined;

    const oldStatus = charger.status;
    charger.status = status;
    charger.currentEvId = evId;
    charger.currentPowerKw = status === 'CHARGING' ? powerKw : 0;
    charger.updatedAt = new Date().toISOString();

    if (status === 'FAULT') {
      charger.failureCount++;
      charger.faultReason = reason || 'Converter High Temperature Interlock';
      eventService.addEvent({
        type: 'FAULT',
        severity: 'CRITICAL',
        message: `⚠️ Station ${station.code} charger ${charger.code} FAULT: ${charger.faultReason}`,
        stationId: station.id,
        chargerId: charger.id,
      });
    } else if (oldStatus === 'FAULT' && status === 'AVAILABLE') {
      eventService.addEvent({
        type: 'STATUS_CHANGE',
        severity: 'SUCCESS',
        message: `✅ Charger ${charger.code} inspected, reset and returned to AVAILABLE`,
        stationId: station.id,
        chargerId: charger.id,
      });
    }

    this.recomputeStationMetrics(station);
    return charger;
  }

  public occupyServiceBay(vehicleId: string, vehicleCode: string, problem: string): { bayIndex: number } | null {
    const sc = this.getServiceCenter();
    const freeBay = sc.bays.find(b => b.status === 'AVAILABLE');
    if (!freeBay) return null;

    freeBay.status = 'OCCUPIED';
    freeBay.vehicleId = vehicleId;
    freeBay.vehicleCode = vehicleCode;
    freeBay.problem = problem;
    freeBay.progressPct = 5;
    freeBay.estimatedTimeMin = 12;

    sc.occupiedBays = sc.bays.filter(b => b.status === 'OCCUPIED').length;
    sc.availableBays = sc.totalBays - sc.occupiedBays;
    sc.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'SERVICE',
      severity: 'WARNING',
      message: `🔧 ${vehicleCode} entered S03 Service Center Bay #${freeBay.bayIndex + 1} (${problem})`,
      vehicleId,
    });

    return { bayIndex: freeBay.bayIndex };
  }

  public releaseServiceBay(vehicleId: string): boolean {
    const sc = this.getServiceCenter();
    const bay = sc.bays.find(b => b.vehicleId === vehicleId);
    if (!bay) return false;

    bay.status = 'AVAILABLE';
    bay.vehicleId = null;
    bay.vehicleCode = null;
    bay.problem = undefined;
    bay.progressPct = undefined;

    sc.occupiedBays = sc.bays.filter(b => b.status === 'OCCUPIED').length;
    sc.availableBays = sc.totalBays - sc.occupiedBays;
    sc.updatedAt = new Date().toISOString();

    return true;
  }
}

export const stationService = StationService.getInstance();
