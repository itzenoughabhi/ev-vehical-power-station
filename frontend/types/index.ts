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
  | 'LEFT_NETWORK';

export type VehicleModel = 
  | 'Tata Nexon EV'
  | 'Mahindra XUV400'
  | 'MG ZS EV'
  | 'Tata Tiago EV'
  | 'Hyundai Ioniq 5'
  | 'Commercial EV Van'
  | 'CyberSedan'
  | 'Apex SUV';

export type CameraMode = 'CITY' | 'STATION' | 'VEHICLE' | 'GRID' | 'SERVICE';

export type MapMode = 
  | 'REAL_MAP' 
  | '3D_TWIN' 
  | 'VEHICLE_FOLLOW' 
  | 'CHARGING_NETWORK' 
  | 'POWER_GRID' 
  | 'SERVICE_NETWORK';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Charger {
  id: string;
  code: string;
  stationId: string;
  status: ChargerStatus;
  powerKw: number;
  currentPowerKw: number;
  currentEvId: string | null;
  failureCount: number;
  faultReason?: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  district: string;
  status: StationStatus;
  position: Position3D;
  maxCapacityKw: number;
  currentLoadKw: number;
  dailyEnergyKwh: number;
  utilizationRate: number;
  avgChargingTimeMin: number;
  estimatedWaitMinutes: number;
  todaySessionsCount: number;
  chargers: Charger[];
  queue: string[];
  activeIncidentsCount: number;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  code: string;
  model: VehicleModel;
  batteryCapacityKwh: number;
  currentBatteryPct: number;
  targetBatteryPct: number;
  estimatedRangeKm: number;
  status: VehicleStatus;
  speed: number;
  position: Position3D;
  heading: number;
  destinationStationId: string | null;
  assignedChargerId: string | null;
  currentStationId: string | null;
  currentLocationName: string;
  etaMinutes: number;
  routeProgress: number;
  routeWaypoints: Position3D[];
  currentWaypointIndex: number;
  chargingRateKw: number;
  energyConsumedKwh: number;
  tripDistanceKm: number;
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
  homeId: string;
  chargerId: string;
  locationName: string;
  position: Position3D;
  connectedEvId: string | null;
  connectedEvModel?: string;
  chargingPowerKw: number;
  batteryPct: number;
  status: 'CHARGING' | 'STANDBY' | 'AVAILABLE';
  estimatedCompletionTime: string;
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
  code: string;
  name: string;
  locationName: string;
  position: Position3D;
  totalBays: number;
  occupiedBays: number;
  availableBays: number;
  techniciansCount: number;
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
  substationId: string;
  substationName: string;
  position: Position3D;
  capacityMw: number;
  currentLoadMw: number;
  loadPercentage: number;
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
