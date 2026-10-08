import { EnergyMetrics, NetworkKPIs, PowerGrid, PowerGridFeeder } from '../../types';
import { stationService } from '../stations/station.service';
import { vehicleService } from '../vehicles/vehicle.service';
import { eventService } from '../events/event.service';

export class EnergyService {
  private static instance: EnergyService;
  private history: Array<{ time: string; loadKw: number; solarGenerationKw: number }> = [];
  private peakDemandKw: number = 3800;
  private overloadAlertCooldown: Map<string, number> = new Map();
  private powerGrid!: PowerGrid;

  private constructor() {
    this.seedHistory();
    this.initPowerGrid();
  }

  public static getInstance(): EnergyService {
    if (!EnergyService.instance) {
      EnergyService.instance = new EnergyService();
    }
    return EnergyService.instance;
  }

  private initPowerGrid() {
    this.powerGrid = {
      substationId: 'GRID-S01',
      substationName: 'Boisar Distribution Substation',
      position: { x: -48, y: 0, z: -65 },
      capacityMw: 5.0,
      currentLoadMw: 3.4,
      loadPercentage: 68,
      status: 'NORMAL',
      isSurgeActive: false,
      feeders: [
        {
          id: 'FDR-MIDC-01',
          name: 'Tarapur MIDC Feeder A',
          targetType: 'INDUSTRIAL_MIDC',
          loadMw: 1.8,
          capacityMw: 2.5,
          status: 'NORMAL',
        },
        {
          id: 'FDR-EV-02',
          name: 'Public EV Fast Charging Grid',
          targetType: 'PUBLIC_STATIONS',
          loadMw: 0.9,
          capacityMw: 1.5,
          status: 'NORMAL',
        },
        {
          id: 'FDR-RES-03',
          name: 'Betegaon & Saravali Domestic Feeder',
          targetType: 'RESIDENTIAL_BETEGAON',
          loadMw: 0.7,
          capacityMw: 1.0,
          status: 'NORMAL',
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  private seedHistory() {
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const timeStr = new Date(now - i * 60000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const baseLoad = 3200 + Math.sin(i / 3) * 400 + Math.random() * 100;
      this.history.push({
        time: timeStr,
        loadKw: Math.round(baseLoad),
        solarGenerationKw: Math.round(480 + Math.cos(i / 4) * 80),
      });
    }
  }

  public getPowerGrid(): PowerGrid {
    return this.powerGrid;
  }

  public triggerEnergySurge(active: boolean = true): PowerGrid {
    this.powerGrid.isSurgeActive = active;
    if (active) {
      this.powerGrid.currentLoadMw = 4.55;
      this.powerGrid.loadPercentage = 91;
      this.powerGrid.status = 'OVERLOAD_RISK';
      this.powerGrid.feeders[0].loadMw = 2.3;
      this.powerGrid.feeders[0].status = 'HIGH';
      this.powerGrid.feeders[1].loadMw = 1.45;
      this.powerGrid.feeders[1].status = 'CRITICAL';
      this.powerGrid.feeders[2].loadMw = 0.8;
      this.powerGrid.feeders[2].status = 'HIGH';

      eventService.addEvent({
        type: 'OVERLOAD',
        severity: 'CRITICAL',
        message: '⚠️ GRID OVERLOAD RISK: Boisar Distribution Substation surged to 91% capacity (4.55 MW / 5.0 MW)',
      });
    } else {
      this.powerGrid.currentLoadMw = 3.4;
      this.powerGrid.loadPercentage = 68;
      this.powerGrid.status = 'NORMAL';
      this.powerGrid.feeders[0].loadMw = 1.8;
      this.powerGrid.feeders[0].status = 'NORMAL';
      this.powerGrid.feeders[1].loadMw = 0.9;
      this.powerGrid.feeders[1].status = 'NORMAL';
      this.powerGrid.feeders[2].loadMw = 0.7;
      this.powerGrid.feeders[2].status = 'NORMAL';

      eventService.addEvent({
        type: 'STATUS_CHANGE',
        severity: 'INFO',
        message: '✅ Grid load stabilized at nominal operating threshold (3.4 MW / 68%)',
      });
    }

    this.powerGrid.updatedAt = new Date().toISOString();
    return this.powerGrid;
  }

  public recordTick() {
    const stations = stationService.getAllStations();
    let currentStationsLoadKw = 0;

    for (const station of stations) {
      currentStationsLoadKw += station.currentLoadKw;

      const loadPct = (station.currentLoadKw / station.maxCapacityKw) * 100;
      const now = Date.now();
      const lastAlert = this.overloadAlertCooldown.get(station.id) || 0;

      if (loadPct >= 85 && (now - lastAlert > 45000)) {
        this.overloadAlertCooldown.set(station.id, now);
        eventService.addEvent({
          type: 'OVERLOAD',
          severity: loadPct > 95 ? 'CRITICAL' : 'WARNING',
          message: `⚠️ HIGH STATION DEMAND: ${station.name} (${station.code}) load reached ${Math.round(loadPct)}%`,
          stationId: station.id,
        });
      }
    }

    // Grid baseline calculation
    const baseGridMw = this.powerGrid.isSurgeActive ? 4.2 : 3.1;
    const dynamicTotalMw = Math.round((baseGridMw + currentStationsLoadKw / 1000) * 100) / 100;
    this.powerGrid.currentLoadMw = dynamicTotalMw;
    this.powerGrid.loadPercentage = Math.round((dynamicTotalMw / this.powerGrid.capacityMw) * 100);

    if (this.powerGrid.loadPercentage > 85) {
      this.powerGrid.status = 'OVERLOAD_RISK';
    } else {
      this.powerGrid.status = 'NORMAL';
    }

    const totalKw = dynamicTotalMw * 1000;
    if (totalKw > this.peakDemandKw) {
      this.peakDemandKw = Math.round(totalKw);
    }

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.history.push({
      time: timeStr,
      loadKw: Math.round(totalKw),
      solarGenerationKw: Math.round(450 + Math.sin(Date.now() / 50000) * 90),
    });

    if (this.history.length > 30) {
      this.history.shift();
    }
  }

  public getEnergyMetrics(): EnergyMetrics {
    const totalKw = this.powerGrid.currentLoadMw * 1000;
    const stations = stationService.getAllStations();
    let totalEnergyDeliveredKwh = 0;

    for (const st of stations) {
      totalEnergyDeliveredKwh += st.dailyEnergyKwh;
    }

    const avg = this.history.length > 0 
      ? Math.round(this.history.reduce((acc, h) => acc + h.loadKw, 0) / this.history.length) 
      : Math.round(totalKw);

    return {
      networkLoadKw: Math.round(totalKw),
      peakDemandKw: this.peakDemandKw,
      averageDemandKw: avg,
      totalEnergyDeliveredKwh: Math.round(totalEnergyDeliveredKwh),
      chargingEfficiencyPct: 94.6,
      history: this.history,
    };
  }

  public getKPIs(): NetworkKPIs {
    const stations = stationService.getAllStations();
    const vehicles = vehicleService.getAllVehicles();
    const homeChargers = stationService.getAllHomeChargers();

    let activeStations = 0;
    let availableChargers = 0;
    let activeFaults = 0;
    let totalEnergyKwh = 0;

    for (const st of stations) {
      if (st.status !== 'OFFLINE') activeStations++;
      totalEnergyKwh += st.dailyEnergyKwh;

      for (const ch of st.chargers) {
        if (ch.status === 'AVAILABLE') availableChargers++;
        if (ch.status === 'FAULT') activeFaults++;
      }
    }

    // Vehicle status breakdown
    const vehiclesCharging = vehicles.filter(v => v.status === 'CHARGING').length;
    const waitingVehicles = vehicles.filter(v => v.status === 'QUEUE' || v.status === 'ARRIVING').length;
    const serviceVehicles = vehicles.filter(v => v.status === 'UNDER_REPAIR' || v.status === 'SERVICE_REQUIRED' || v.status === 'FAULT').length;
    const homeChargingVehicles = homeChargers.filter(hc => hc.status === 'CHARGING').length;

    return {
      activeStations,
      availableChargers,
      vehiclesCharging,
      waitingVehicles,
      activeFaults,
      networkLoadMw: this.powerGrid.currentLoadMw,
      totalDailyEnergyMwh: Math.round((totalEnergyKwh / 1000) * 100) / 100,
      serviceVehicles,
      homeChargingVehicles,
    };
  }
}

export const energyService = EnergyService.getInstance();
