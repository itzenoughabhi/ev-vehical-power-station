import { stationService } from '../stations/station.service';
import { vehicleService, VehicleService } from '../vehicles/vehicle.service';
import { energyService } from '../energy/energy.service';
import { eventService } from '../events/event.service';
import { aiService } from '../ai/ai.service';
import { Vehicle, Station } from '../../types';

export class SimulationEngine {
  private static instance: SimulationEngine;
  private intervalTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = true;
  private speedMultiplier: number = 1.0;
  private tickCount: number = 0;
  private onTickCallbacks: ((data: any) => void)[] = [];

  // End-to-end presentation scenario tracking (Section 25)
  private scenarioStep: number = 0;

  private constructor() {}

  public static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  public start() {
    if (this.intervalTimer) return;
    console.log('🚀 [Simulation Engine] Starting EVNEXUS Boisar Real-Time Digital Twin tick cycle...');
    this.intervalTimer = setInterval(() => {
      if (this.isRunning) {
        this.step();
      }
    }, 1000);
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = Math.max(0, Math.min(10, multiplier));
    this.isRunning = multiplier > 0;
    eventService.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'INFO',
      message: `Simulation speed set to ${this.speedMultiplier}x ${this.isRunning ? '' : '(PAUSED)'}`,
    });
  }

  public getSpeed(): number {
    return this.speedMultiplier;
  }

  public isEngineRunning(): boolean {
    return this.isRunning;
  }

  public onTick(cb: (data: any) => void) {
    this.onTickCallbacks.push(cb);
  }

  public step() {
    this.tickCount++;
    const stations = stationService.getAllStations();
    const vehicles = vehicleService.getAllVehicles();
    const sc = stationService.getServiceCenter();

    // 1. Process vehicles through the operational state machine
    for (const vehicle of vehicles) {
      this.processVehicleTick(vehicle, stations, sc);
    }

    // 2. Update energy & grid readings
    energyService.recordTick();

    // 3. Evaluate AI queue optimization recommendations
    const newRecommendation = aiService.evaluateNetworkOptimization();

    // 4. Update service bay progress
    for (const bay of sc.bays) {
      if (bay.status === 'OCCUPIED' && bay.progressPct !== undefined && bay.progressPct < 100) {
        bay.progressPct = Math.min(100, Math.round(bay.progressPct + 4 * this.speedMultiplier));
        if (bay.progressPct >= 100) {
          const v = vehicleService.getVehicleById(bay.vehicleId || '');
          if (v) {
            v.status = 'READY';
            v.vehicleHealth = 'GOOD';
            v.motorTemperatureC = 55;
            v.batteryTemperatureC = 29;
            v.faultReason = null;
            v.repairProgressPct = 100;
            v.repairStage = 'REPAIR_COMPLETE';
            eventService.addEvent({
              type: 'SERVICE',
              severity: 'SUCCESS',
              message: `✅ Repair completed on ${v.code} (${v.model}) in Bay #${bay.bayIndex + 1} — Ready to return to road`,
              vehicleId: v.id,
            });
          }
        }
      }
    }

    // 5. Notify tick listeners
    const payload = {
      tick: this.tickCount,
      kpis: energyService.getKPIs(),
      energy: energyService.getEnergyMetrics(),
      powerGrid: energyService.getPowerGrid(),
      serviceCenter: sc,
      homeChargers: stationService.getAllHomeChargers(),
      recommendation: newRecommendation,
      scenarioStep: this.scenarioStep,
    };

    this.onTickCallbacks.forEach(cb => cb(payload));
  }

  private processVehicleTick(vehicle: Vehicle, stations: Station[], serviceCenter: any) {
    const destinationStation = stations.find(s => s.id === vehicle.destinationStationId);

    switch (vehicle.status) {
      case 'EN_ROUTE': {
        const waypoints = vehicle.routeWaypoints;
        if (!waypoints || waypoints.length === 0) break;

        const targetWp = waypoints[vehicle.currentWaypointIndex];
        if (!targetWp) {
          if (vehicle.serviceCenterId) {
            this.handleServiceCenterArrival(vehicle);
          } else {
            vehicle.status = 'ARRIVING';
          }
          break;
        }

        const dx = targetWp.x - vehicle.position.x;
        const dz = targetWp.z - vehicle.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        const moveStep = (vehicle.speed * 0.04) * this.speedMultiplier;

        if (dist <= moveStep || dist < 0.6) {
          vehicle.position = { ...targetWp };
          vehicle.currentWaypointIndex++;
          if (vehicle.currentWaypointIndex >= waypoints.length) {
            if (vehicle.serviceCenterId) {
              this.handleServiceCenterArrival(vehicle);
            } else {
              vehicle.status = 'ARRIVING';
              vehicle.routeProgress = 1.0;
              if (destinationStation) {
                eventService.addEvent({
                  type: 'ARRIVAL',
                  severity: 'INFO',
                  message: `📍 ${vehicle.code} arrived at Station ${destinationStation.code} (${destinationStation.name})`,
                  vehicleId: vehicle.id,
                  stationId: destinationStation.id,
                });
              }
            }
          } else {
            vehicle.routeProgress = vehicle.currentWaypointIndex / waypoints.length;
          }
        } else {
          vehicle.position.x += (dx / dist) * moveStep;
          vehicle.position.z += (dz / dist) * moveStep;
          vehicle.heading = Math.atan2(dx, dz);
        }
        break;
      }

      case 'ARRIVING': {
        if (!destinationStation) break;

        const availableCharger = destinationStation.chargers.find(c => c.status === 'AVAILABLE');

        if (availableCharger) {
          availableCharger.status = 'CHARGING';
          availableCharger.currentPowerKw = availableCharger.powerKw === 350 ? 220 : 120;
          availableCharger.currentEvId = vehicle.code;

          vehicle.assignedChargerId = availableCharger.id;
          vehicle.currentStationId = destinationStation.id;
          vehicle.status = 'CHARGER_ASSIGNED';
          vehicle.chargingRateKw = availableCharger.currentPowerKw;
          const chIndex = destinationStation.chargers.findIndex(c => c.id === availableCharger.id);
          const bayOffset = chIndex !== -1 ? [-3.6, -1.2, 1.2, 3.6][chIndex] : 0;
          vehicle.position = {
            x: destinationStation.position.x + bayOffset,
            y: 0,
            z: destinationStation.position.z + 1.2,
          };
          vehicle.heading = 0;
          vehicle.speed = 0;
          vehicle.currentLocationName = `${destinationStation.name}, Bay #${chIndex + 1}`;

          stationService.recomputeStationMetrics(destinationStation);
        } else {
          // Enter physical queue
          if (!destinationStation.queue.includes(vehicle.id)) {
            destinationStation.queue.push(vehicle.id);
            vehicle.status = 'QUEUE';
            vehicle.currentStationId = destinationStation.id;
            vehicle.speed = 0;
            const qIdx = destinationStation.queue.indexOf(vehicle.id);
            vehicle.position = {
              x: destinationStation.position.x + 3.5 + qIdx * 1.8,
              y: 0,
              z: destinationStation.position.z - 4.5,
            };
            vehicle.currentLocationName = `${destinationStation.name}, Queue Position #${qIdx + 1}`;

            eventService.addEvent({
              type: 'STATUS_CHANGE',
              severity: 'WARNING',
              message: `⏳ ${vehicle.code} queued at Station ${destinationStation.code} (Position #${qIdx + 1})`,
              vehicleId: vehicle.id,
              stationId: destinationStation.id,
            });

            stationService.recomputeStationMetrics(destinationStation);
          }
        }
        break;
      }

      case 'QUEUE': {
        if (!destinationStation) break;
        // Check if a charger opened up for front of queue
        if (destinationStation.queue[0] === vehicle.id) {
          const availableCharger = destinationStation.chargers.find(c => c.status === 'AVAILABLE');
          if (availableCharger) {
            destinationStation.queue.shift();
            availableCharger.status = 'CHARGING';
            availableCharger.currentPowerKw = availableCharger.powerKw === 350 ? 220 : 120;
            availableCharger.currentEvId = vehicle.code;

            vehicle.assignedChargerId = availableCharger.id;
            vehicle.status = 'CHARGER_ASSIGNED';
            vehicle.chargingRateKw = availableCharger.currentPowerKw;
            const chIndex = destinationStation.chargers.findIndex(c => c.id === availableCharger.id);
            const bayOffset = chIndex !== -1 ? [-3.6, -1.2, 1.2, 3.6][chIndex] : 0;
            vehicle.position = {
              x: destinationStation.position.x + bayOffset,
              y: 0,
              z: destinationStation.position.z + 1.2,
            };
            vehicle.currentLocationName = `${destinationStation.name}, Bay #${chIndex + 1}`;

            stationService.recomputeStationMetrics(destinationStation);
          }
        }
        break;
      }

      case 'CHARGER_ASSIGNED': {
        vehicle.status = 'CHARGING';
        const st = stations.find(s => s.id === vehicle.currentStationId);
        const ch = st?.chargers.find(c => c.id === vehicle.assignedChargerId);
        eventService.addEvent({
          type: 'CHARGING_START',
          severity: 'INFO',
          message: `⚡ ${vehicle.code} started DC Fast Charging at Charger ${ch?.code || 'Bay'} (${ch?.currentPowerKw} kW)`,
          vehicleId: vehicle.id,
          stationId: st?.id,
          chargerId: ch?.id,
        });
        break;
      }

      case 'CHARGING': {
        const chargeInc = (1.2 * this.speedMultiplier);
        vehicle.currentBatteryPct = Math.min(100, Math.round((vehicle.currentBatteryPct + chargeInc) * 10) / 10);
        vehicle.estimatedRangeKm = Math.round((vehicle.currentBatteryPct / 100) * 380);
        vehicle.energyConsumedKwh += Math.round(0.4 * this.speedMultiplier * 10) / 10;

        if (vehicle.currentBatteryPct >= vehicle.targetBatteryPct) {
          vehicle.status = 'COMPLETED';

          if (destinationStation && vehicle.assignedChargerId) {
            const charger = destinationStation.chargers.find(c => c.id === vehicle.assignedChargerId);
            if (charger) {
              charger.status = 'AVAILABLE';
              charger.currentPowerKw = 0;
              charger.currentEvId = null;
            }
            destinationStation.dailyEnergyKwh += vehicle.energyConsumedKwh;
            stationService.recomputeStationMetrics(destinationStation);
          }

          eventService.addEvent({
            type: 'COMPLETED',
            severity: 'SUCCESS',
            message: `🎉 ${vehicle.code} (${vehicle.model}) completed charge at ${vehicle.currentBatteryPct}%`,
            vehicleId: vehicle.id,
            stationId: destinationStation?.id,
          });
        }
        break;
      }

      case 'COMPLETED': {
        if (destinationStation) {
          vehicle.routeWaypoints = VehicleService.getDepartureRoute(destinationStation.position);
          vehicle.currentWaypointIndex = 0;
          vehicle.status = 'DEPARTING';
          vehicle.assignedChargerId = null;
          vehicle.currentStationId = null;
          vehicle.speed = 36;
        }
        break;
      }

      case 'DEPARTING': {
        const waypoints = vehicle.routeWaypoints;
        const targetWp = waypoints[vehicle.currentWaypointIndex];

        if (!targetWp) {
          vehicle.status = 'LEFT_NETWORK';
          break;
        }

        const dx = targetWp.x - vehicle.position.x;
        const dz = targetWp.z - vehicle.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const moveStep = (vehicle.speed * 0.04) * this.speedMultiplier;

        if (dist <= moveStep) {
          vehicle.position = { ...targetWp };
          vehicle.currentWaypointIndex++;
          if (vehicle.currentWaypointIndex >= waypoints.length) {
            vehicle.status = 'LEFT_NETWORK';
          }
        } else {
          vehicle.position.x += (dx / dist) * moveStep;
          vehicle.position.z += (dz / dist) * moveStep;
          vehicle.heading = Math.atan2(dx, dz);
        }
        break;
      }

      case 'LEFT_NETWORK': {
        const randomStation = stations[Math.floor(Math.random() * stations.length)];
        const newRoute = VehicleService.getRouteForStation(randomStation.code);

        vehicle.destinationStationId = randomStation.id;
        vehicle.routeWaypoints = newRoute;
        vehicle.currentWaypointIndex = 0;
        vehicle.position = { ...newRoute[0] };
        vehicle.currentBatteryPct = Math.floor(25 + Math.random() * 35);
        vehicle.estimatedRangeKm = Math.round((vehicle.currentBatteryPct / 100) * 380);
        vehicle.energyConsumedKwh = 0;
        vehicle.status = 'EN_ROUTE';
        vehicle.routeProgress = 0;
        vehicle.etaMinutes = 4;
        break;
      }

      case 'UNDER_REPAIR': {
        // Vehicle is in repair bay
        vehicle.speed = 0;
        if (vehicle.motorTemperatureC > 55) {
          vehicle.motorTemperatureC = Math.max(55, Math.round(vehicle.motorTemperatureC - 1.5 * this.speedMultiplier));
        }
        if (vehicle.batteryTemperatureC > 30) {
          vehicle.batteryTemperatureC = Math.max(30, Math.round(vehicle.batteryTemperatureC - 0.8 * this.speedMultiplier));
        }
        break;
      }
    }
  }

  private handleServiceCenterArrival(vehicle: Vehicle) {
    const sc = stationService.getServiceCenter();
    const bayResult = stationService.occupyServiceBay(
      vehicle.id,
      vehicle.code,
      vehicle.faultReason || 'Motor Overheating & Inverter Fault'
    );

    if (bayResult !== null) {
      vehicle.status = 'UNDER_REPAIR';
      vehicle.repairProgressPct = 10;
      vehicle.repairStage = 'DIAGNOSIS';
      vehicle.speed = 0;
      const bayPos = sc.position;
      vehicle.position = {
        x: bayPos.x + (bayResult.bayIndex - 1.5) * 3.0,
        y: 0,
        z: bayPos.z - 2.0,
      };
      vehicle.heading = 0;
      vehicle.currentLocationName = `S03 Service Center, Bay #${bayResult.bayIndex + 1}`;
    }
  }

  // --- INTERACTIVE DEMO CONTROLS ---

  public triggerEVFault(vehicleCode: string = 'EV-024', faultReason: string = 'Motor Overheating (92°C)'): Vehicle | undefined {
    const v = vehicleService.getVehicleById(vehicleCode);
    if (!v) return undefined;

    v.status = 'SERVICE_REQUIRED';
    v.vehicleHealth = 'CRITICAL';
    v.motorTemperatureC = 92;
    v.batteryTemperatureC = 42;
    v.faultReason = faultReason;
    v.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'FAULT',
      severity: 'CRITICAL',
      message: `🚨 MOTOR OVERHEATING ALERT: ${v.code} (${v.model}) motor temp hit 92°C — SERVICE REQUIRED`,
      vehicleId: v.id,
    });

    return v;
  }

  public triggerLowBattery(vehicleCode: string = 'EV-024', pct: number = 18): Vehicle | undefined {
    const v = vehicleService.getVehicleById(vehicleCode);
    if (!v) return undefined;

    v.currentBatteryPct = pct;
    v.estimatedRangeKm = Math.round((pct / 100) * 380);
    v.status = 'LOW_BATTERY';
    v.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'WARNING',
      message: `⚠️ LOW BATTERY WARNING: ${v.code} remaining capacity ${pct}% (Range: ${v.estimatedRangeKm} km)`,
      vehicleId: v.id,
    });

    return v;
  }

  public triggerEnergySurge(active: boolean = true) {
    return energyService.triggerEnergySurge(active);
  }

  public triggerFault(stationCode?: string, chargerCode?: string) {
    const stations = stationService.getAllStations();
    const targetStation = stationCode 
      ? stations.find(s => s.code.toLowerCase() === stationCode.toLowerCase())
      : stations[0];
    if (!targetStation) return null;

    const targetCharger = chargerCode
      ? targetStation.chargers.find(c => c.code.toLowerCase() === chargerCode.toLowerCase())
      : targetStation.chargers.find(c => c.status !== 'FAULT') || targetStation.chargers[0];

    if (targetCharger) {
      stationService.setChargerStatus(
        targetStation.id,
        targetCharger.id,
        'FAULT',
        null,
        0,
        'Silicon Carbide Inverter Thermal Trip'
      );
    }
    return { station: targetStation, charger: targetCharger };
  }

  public repairFault(chargerCode?: string) {
    const stations = stationService.getAllStations();
    for (const st of stations) {
      for (const ch of st.chargers) {
        if (ch.status === 'FAULT' && (!chargerCode || ch.code.toLowerCase() === chargerCode.toLowerCase())) {
          stationService.setChargerStatus(st.id, ch.id, 'AVAILABLE', null, 0);
          return { station: st, charger: ch };
        }
      }
    }
    return null;
  }

  public completeActiveRepair(vehicleCode: string = 'EV-024'): Vehicle | undefined {
    const v = vehicleService.getVehicleById(vehicleCode);
    if (!v) return undefined;

    stationService.releaseServiceBay(v.id);
    v.status = 'READY';
    v.vehicleHealth = 'GOOD';
    v.motorTemperatureC = 55;
    v.batteryTemperatureC = 30;
    v.faultReason = null;
    v.repairProgressPct = 100;
    v.repairStage = 'REPAIR_COMPLETE';
    v.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'SERVICE',
      severity: 'SUCCESS',
      message: `✅ Repair completed on ${v.code} — Systems nominal, certified healthy`,
      vehicleId: v.id,
    });

    return v;
  }

  public returnToRoad(vehicleCode: string = 'EV-024'): Vehicle | undefined {
    const v = vehicleService.getVehicleById(vehicleCode);
    if (!v) return undefined;

    const stations = stationService.getAllStations();
    const targetStation = stations[1] || stations[0];
    const newRoute = VehicleService.getRouteForStation(targetStation.code);

    v.status = 'EN_ROUTE';
    v.serviceCenterId = null;
    v.destinationStationId = targetStation.id;
    v.routeWaypoints = newRoute;
    v.currentWaypointIndex = 1;
    v.position = { ...newRoute[1] };
    v.speed = 42;
    v.currentLocationName = `Boisar–Palghar Road`;
    v.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'INFO',
      message: `🚗 ${v.code} exited S03 Service Center and rejoined the Boisar road network`,
      vehicleId: v.id,
    });

    return v;
  }

  public resetSimulation() {
    this.scenarioStep = 0;
    energyService.triggerEnergySurge(false);
    const stations = stationService.getAllStations();
    for (const st of stations) {
      for (const ch of st.chargers) {
        ch.status = 'AVAILABLE';
        ch.currentPowerKw = 0;
        ch.currentEvId = null;
      }
      st.queue = [];
      stationService.recomputeStationMetrics(st);
    }
    eventService.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'INFO',
      message: '🔄 EVNEXUS Boisar Digital Twin state reset to nominal baseline',
    });
  }
}

export const simulationEngine = SimulationEngine.getInstance();
