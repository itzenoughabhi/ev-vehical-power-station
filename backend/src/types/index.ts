export type StationStatus = 'ONLINE' | 'DEGRADED' | 'OVERLOADED' | 'OFFLINE';

export type ChargerStatus = 
  | 'AVAILABLE' 
  | 'CHARGING' 
  | 'OCCUPIED' 
  | 'FAULT' 
  | 'MAINTENANCE' 
  | 'OFFLINE';

export type VehicleStatus = 
  | 'EN_ROUTE' 
  | 'ARRIVING' 
  | 'QUEUE' 
  | 'CHARGER_ASSIGNED' 
  | 'CHARGING' 
  | 'COMPLETED' 
  | 'DEPARTING' 
  | 'LOW_BATTERY' 
  | 'FAULT' 
  | 'SERVICE_REQUIRED' 
  | 'UNDER_REPAIR' 
  | 'READY' 
  | 'MANUAL_DRIVE'
  | 'LEFT_NETWORK';

export type VehicleModel = 
  | 'Tata Nexon EV'
  | 'Mahindra XUV400'
  | 'MG ZS EV'
  | 'Tata Tiago EV'
  | 'Hyundai Ioniq 5'
  | 'Commercial EV Van'
  | 'Heavy Electric Hauler'
  | 'Electric Pickup Truck'
  | 'Tesla Model Y'
  | 'Porsche Taycan'
  | 'Mercedes EQS'
  | 'Lucid Air EV'
  | 'Highway Patrol EV'
  | 'Electric City Bus'
  | 'CyberSedan'
  | 'Apex SUV'
  | 'BYD Atto 3'
  | 'Kia EV6';

export type IncidentSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type IncidentStatus = 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Charger {
  id: string;
  code: string; // e.g. "A102-01"
  stationId: string;
  status: ChargerStatus;
  powerKw: number; // Max capability (150kW or 350kW)
  currentPowerKw: number;
  currentEvId: string | null;
  failureCount: number;
  faultReason?: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  code: string; // "A102", "B104", "C201", "D305"
  name: string;
  district: string;
  status: StationStatus;
  position: Position3D;
  maxCapacityKw: number;
  currentLoadKw: number;
  dailyEnergyKwh: number;
  utilizationRate: number; // 0 - 100%
  avgChargingTimeMin: number;
  estimatedWaitMinutes: number;
  todaySessionsCount: number;
  chargers: Charger[];
  queue: string[]; // Vehicle IDs in queue
  activeIncidentsCount: number;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  code: string; // "EV-024"
  model: VehicleModel;
  batteryCapacityKwh: number;
  currentBatteryPct: number;
  targetBatteryPct: number;
  estimatedRangeKm: number;
  status: VehicleStatus;
  speed: number;
  position: Position3D;
  heading: number; // in radians
  destinationStationId: string | null;
  assignedChargerId: string | null;
  currentStationId: string | null;
  currentLocationName: string;
  etaMinutes: number;
  routeProgress: number; // 0.0 to 1.0
  routeWaypoints: Position3D[];
  currentWaypointIndex: number;
  chargingRateKw: number;
  energyConsumedKwh: number;
  tripDistanceKm: number;
  // Deep Telemetry
  motorTemperatureC: number;
  batteryTemperatureC: number;
  brakeSystemHealth: 'NORMAL' | 'WARNING';
  tyreHealth: 'NORMAL' | 'WARNING';
  vehicleHealth: 'GOOD' | 'WARNING' | 'CRITICAL';
  faultReason: string | null;
  serviceCenterId: string | null;
  repairProgressPct: number;
  repairStage?: 'DIAGNOSIS' | 'REPAIR_IN_PROGRESS' | 'REPAIR_COMPLETE';
  updatedAt: string;
}

export interface HomeCharger {
  homeId: string; // "HOME-024"
  chargerId: string; // "HC-024"
  locationName: string; // "Betegaon Green Valley"
  position: Position3D;
  connectedEvId: string | null; // "EV-118"
  connectedEvModel?: string;
  chargingPowerKw: number; // 7.2 kW
  batteryPct: number; // 42%
  status: 'CHARGING' | 'STANDBY' | 'AVAILABLE';
  estimatedCompletionTime: string; // "02:15"
  updatedAt: string;
}

export interface ServiceCenterBay {
  bayIndex: number;
  vehicleId: string | null;
  vehicleCode: string | null;
  status: 'AVAILABLE' | 'OCCUPIED';
  problem?: string;
  progressPct?: number;
  estimatedTimeMin?: number;
}

export interface ServiceCenter {
  id: string;
  code: string; // "S03"
  name: string; // "Tarapur EV Diagnostics & Service Hub"
  locationName: string; // "Tarapur MIDC / Boisar Link"
  position: Position3D;
  totalBays: number; // 4
  occupiedBays: number;
  availableBays: number;
  techniciansCount: number; // 6
  batteryDiagnostics: 'AVAILABLE' | 'ACTIVE';
  bays: ServiceCenterBay[];
  updatedAt: string;
}

export interface PowerGridFeeder {
  id: string;
  name: string;
  targetType: 'PUBLIC_STATIONS' | 'INDUSTRIAL_MIDC' | 'RESIDENTIAL_BETEGAON' | 'RESIDENTIAL_SARAVALI';
  loadMw: number;
  capacityMw: number;
  status: 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export interface PowerGrid {
  substationId: string; // "GRID-S01"
  substationName: string; // "Boisar Distribution Substation"
  position: Position3D;
  capacityMw: number; // 5.0 MW
  currentLoadMw: number; // 3.4 MW -> 4.55 MW
  loadPercentage: number; // 68% -> 91%
  status: 'NORMAL' | 'OVERLOAD_RISK';
  feeders: PowerGridFeeder[];
  isSurgeActive: boolean;
  updatedAt: string;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  type: 'STATUS_CHANGE' | 'FAULT' | 'ARRIVAL' | 'CHARGING_START' | 'COMPLETED' | 'REDIRECT' | 'OVERLOAD' | 'SERVICE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  message: string;
  stationId?: string;
  chargerId?: string;
  vehicleId?: string;
  metadata?: Record<string, any>;
}

export interface Recommendation {
  id: string;
  vehicleId: string;
  vehicleCode: string;
  currentStationId: string;
  currentStationCode: string;
  recommendedStationId: string;
  recommendedStationCode: string;
  currentWaitMinutes: number;
  recommendedWaitMinutes: number;
  potentialSavingMinutes: number;
  reason: string;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface EnergyMetrics {
  networkLoadKw: number;
  peakDemandKw: number;
  averageDemandKw: number;
  totalEnergyDeliveredKwh: number;
  chargingEfficiencyPct: number;
  history: Array<{
    time: string;
    loadKw: number;
    solarGenerationKw: number;
  }>;
}

export interface NetworkKPIs {
  activeStations: number;
  availableChargers: number;
  vehiclesCharging: number;
  waitingVehicles: number;
  activeFaults: number;
  networkLoadMw: number;
  totalDailyEnergyMwh: number;
  serviceVehicles: number;
  homeChargingVehicles: number;
}
