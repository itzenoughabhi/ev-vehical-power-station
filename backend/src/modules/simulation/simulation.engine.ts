import { stationService } from '../stations/station.service';
import { vehicleService, VehicleService, REGIONAL_CORRIDORS } from '../vehicles/vehicle.service';
import { energyService } from '../energy/energy.service';
import { eventService } from '../events/event.service';
import { aiService } from '../ai/ai.service';
import { trafficController } from './traffic.controller';
import { Vehicle, Station } from '../../types';

export function getBayOffset(idx: number, totalChargers: number = 4): number {
  if (totalChargers <= 4) {
    const offsets = [-3.6, -1.2, 1.2, 3.6];
    return offsets[idx] ?? (idx * 2.4 - (totalChargers - 1) * 1.2);
  }
  const offsets = [-5.2, -3.1, -1.0, 1.0, 3.1, 5.2];
  return offsets[idx] ?? (idx * 2.1 - (totalChargers - 1) * 1.05);
}

export class SimulationEngine {
  private static instance: SimulationEngine;
  private intervalTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = true;
  private speedMultiplier: number = 1.0;
  private tickCount: number = 0;
  private onTickCallbacks: ((data: any) => void)[] = [];
  private vehicleStationaryTicks: Map<string, number> = new Map();

  public static readonly TICK_INTERVAL_MS = 100;
  public static readonly DT = 0.1;

  private scenarioStep: number = 0;

  private constructor() { }

  public static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  public start() {
    if (this.intervalTimer) return;
    console.log('🚀 [Simulation Engine] Starting EVNEXUS Boisar Real-Time Digital Twin tick cycle (10Hz high-resolution)...');
    this.intervalTimer = setInterval(() => {
      if (this.isRunning) {
        this.step();
      }
    }, SimulationEngine.TICK_INTERVAL_MS);
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

    trafficController.update(SimulationEngine.DT * this.speedMultiplier);

    for (const vehicle of vehicles) {
      this.processVehicleTick(vehicle, stations, sc);
    }

    if (this.tickCount % 10 === 0) {
      energyService.recordTick();
    }

    let newRecommendation = null;
    if (this.tickCount % 10 === 0) {
      newRecommendation = aiService.evaluateNetworkOptimization();
    }

    for (const bay of sc.bays) {
      if (bay.status === 'OCCUPIED' && bay.progressPct !== undefined && bay.progressPct < 100) {
        bay.progressPct = Math.min(100, Math.round(bay.progressPct + 4 * this.speedMultiplier * SimulationEngine.DT));
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

    const payload = {
      tick: this.tickCount,
      trafficSignals: trafficController.getAllSignals(),
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
      case 'PAUSED': {
        vehicle.speed = 0;
        vehicle.trafficState = 'STOPPED';
        break;
      }

      case 'MANUAL_DRIVE': {
        if (vehicle.speed > 0) {
          const drain = (vehicle.speed * 0.0018) * this.speedMultiplier * SimulationEngine.DT;
          vehicle.currentBatteryPct = Math.max(1, vehicle.currentBatteryPct - drain);
          const maxRange = vehicle.batteryCapacityKwh ? vehicle.batteryCapacityKwh * 7.0 : 380;
          vehicle.estimatedRangeKm = Math.max(5, Math.round((vehicle.currentBatteryPct / 100) * maxRange));
        }
        break;
      }

      case 'EN_ROUTE': {
        if (vehicle.speed === 0 && vehicle.trafficState === 'STOPPED') {
          vehicle.speed = 0;
          break;
        }

        const waypoints = vehicle.routeWaypoints;
        if (!waypoints || waypoints.length === 0) break;

        while (vehicle.currentWaypointIndex < waypoints.length - 1) {
          const wp = waypoints[vehicle.currentWaypointIndex];
          const wdx = wp.x - vehicle.position.x;
          const wdz = wp.z - vehicle.position.z;
          const wdist = Math.hypot(wdx, wdz);
          const fX = Math.sin(vehicle.heading || 0);
          const fZ = Math.cos(vehicle.heading || 0);
          const dot = wdx * fX + wdz * fZ;

          if (wdist < 2.4 || (dot < 0.2 && wdist < 5.0)) {
            vehicle.currentWaypointIndex++;
          } else {
            break;
          }
        }

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
        const dist = Math.hypot(dx, dz);

        let effectiveSpeed = vehicle.speed > 0 ? vehicle.speed : 40;

        const allVehicles = vehicleService.getAllVehicles();
        const fX = Math.sin(vehicle.heading || 0);
        const fZ = Math.cos(vehicle.heading || 0);

        for (const other of allVehicles) {
          if (other.id === vehicle.id) continue;
          const toOtherX = other.position.x - vehicle.position.x;
          const toOtherZ = other.position.z - vehicle.position.z;
          const distToOther = Math.hypot(toOtherX, toOtherZ);

          if (distToOther < 14.0) {
            const otherFx = Math.sin(other.heading || 0);
            const otherFz = Math.cos(other.heading || 0);
            const headingAlignment = fX * otherFx + fZ * otherFz;

            if (headingAlignment < 0.2) continue;

            const longDist = fX * toOtherX + fZ * toOtherZ;
            const latDist = Math.abs(fX * toOtherZ - fZ * toOtherX);

            if (latDist < 1.8 && longDist > 0.1) {
              if (longDist < 6.0) {
                const followSpeed = other.speed > 0 ? other.speed * 0.85 : 18;
                effectiveSpeed = Math.max(16, Math.min(effectiveSpeed, followSpeed));
              } else if (longDist < 12.0) {
                const targetFollow = other.speed > 0 ? other.speed : 28;
                effectiveSpeed = Math.max(20, Math.min(effectiveSpeed, targetFollow));
              }
            } else if (distToOther < 3.2 && (other.status === 'EN_ROUTE' || other.status === 'DEPARTING')) {
              effectiveSpeed = Math.max(18, effectiveSpeed * 0.9);
            }
          }
        }

        if (effectiveSpeed === 0) {
          const stationaryTicks = (this.vehicleStationaryTicks.get(vehicle.id) || 0) + 1;
          this.vehicleStationaryTicks.set(vehicle.id, stationaryTicks);
          if (stationaryTicks > 40) {
            effectiveSpeed = 16;
          }
        } else {
          this.vehicleStationaryTicks.set(vehicle.id, 0);
        }

        const moveStep = (effectiveSpeed / 3.6) * 0.42 * this.speedMultiplier * SimulationEngine.DT;

        if (vehicle.currentWaypointIndex >= waypoints.length - 1 && (dist <= moveStep || dist < 2.0)) {
          vehicle.position = { ...targetWp };
          if (vehicle.serviceCenterId) {
            this.handleServiceCenterArrival(vehicle);
          } else if (vehicle.destinationStationId && vehicle.currentBatteryPct < 85) {
            this.handleStationEntranceArrival(vehicle, stations);
          } else if (vehicle.currentBatteryPct < 22) {
            const nearestStation = stations.reduce((acc, st) => {
              const d = Math.hypot(st.position.x - vehicle.position.x, st.position.z - vehicle.position.z);
              const dAcc = Math.hypot(acc.position.x - vehicle.position.x, acc.position.z - vehicle.position.z);
              return d < dAcc ? st : acc;
            }, stations[0]);
            const stationRoute = VehicleService.getRouteForStation(nearestStation.code, vehicle.position);
            vehicle.destinationStationId = nearestStation.id;
            vehicle.routeWaypoints = stationRoute;
            vehicle.currentWaypointIndex = 0;
            vehicle.routeProgress = 0.05;
            vehicle.currentLocationName = `Approaching ${nearestStation.name} [${nearestStation.code}] for recharge`;
          } else {
            const corridorId = (vehicle as any)._corridorId;
            if (corridorId && REGIONAL_CORRIDORS[corridorId]) {
              const corridor = REGIONAL_CORRIDORS[corridorId];
              const newRoute = VehicleService.getCorridorRoute(corridorId);
              vehicle.routeWaypoints = newRoute.length > 2 ? newRoute : VehicleService.getRandomRoute(vehicle.position, vehicle.heading);
              vehicle.currentWaypointIndex = 0;
              vehicle.routeProgress = 0.0;
              vehicle.currentLocationName = `Patrolling ${corridor.name}`;
            } else {
              vehicle.destinationStationId = null;
              const newRoute = VehicleService.getRandomRoute(vehicle.position, vehicle.heading);
              if (newRoute && newRoute.length > 2) {
                vehicle.routeWaypoints = newRoute;
                vehicle.currentWaypointIndex = 0;
                vehicle.routeProgress = 0.05;
                vehicle.speed = Math.floor(36 + Math.random() * 10);
                vehicle.currentLocationName = `Patrolling City Route`;
              } else {
                vehicle.currentWaypointIndex = 0;
                vehicle.routeProgress = 0.0;
              }
            }
          }
        } else {
          const targetHeading = Math.atan2(dx, dz);
          let headingDiff = targetHeading - (vehicle.heading || 0);
          headingDiff = ((headingDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

          const isHeavy = vehicle.model === 'Heavy Electric Hauler' || vehicle.model === 'Electric City Bus';
          const maxTurnRate = isHeavy ? 2.8 : 4.0;
          const maxTurn = maxTurnRate * SimulationEngine.DT * this.speedMultiplier;
          const clampedTurn = Math.max(-maxTurn, Math.min(maxTurn, headingDiff));
          vehicle.heading = (vehicle.heading || 0) + clampedTurn;
          vehicle.heading = ((vehicle.heading + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

          if (Math.abs(headingDiff) > 0.4) {
            const turnFactor = Math.min(1.0, (Math.abs(headingDiff) - 0.4) / 1.2);
            effectiveSpeed = Math.max(18, effectiveSpeed * (1 - turnFactor * 0.35));
          }

          const actualMoveStep = (effectiveSpeed / 3.6) * 0.42 * this.speedMultiplier * SimulationEngine.DT;
          const forwardStep = Math.min(dist, actualMoveStep);
          vehicle.position.x += Math.sin(vehicle.heading) * forwardStep;
          vehicle.position.z += Math.cos(vehicle.heading) * forwardStep;
          vehicle.routeProgress = waypoints.length > 1 ? vehicle.currentWaypointIndex / waypoints.length : 0;
        }

        if (effectiveSpeed > 0) {
          const drain = (effectiveSpeed * 0.0022) * this.speedMultiplier * SimulationEngine.DT;
          vehicle.currentBatteryPct = Math.max(5, vehicle.currentBatteryPct - drain);
          const maxRange = vehicle.batteryCapacityKwh ? vehicle.batteryCapacityKwh * 5.0 : 380;
          vehicle.estimatedRangeKm = Math.max(8, Math.round((vehicle.currentBatteryPct / 100) * maxRange));
          vehicle.tripDistanceKm += (moveStep * 0.001);
        }
        vehicle.speed = effectiveSpeed;
        break;
      }

      case 'ENTERING_STATION': {
        if (!destinationStation) {
          vehicle.status = 'EN_ROUTE';
          break;
        }

        const totalCh = destinationStation.chargers.length;
        let selectedChargerIndex = -1;

        if (vehicle.assignedChargerId) {
          selectedChargerIndex = destinationStation.chargers.findIndex(c => c.id === vehicle.assignedChargerId);
        } else {
          const allVehicles = vehicleService.getAllVehicles();
          const availableCharger = destinationStation.chargers.find((c, idx) => {
            if (c.status !== 'AVAILABLE') return false;
            const bayOffset = getBayOffset(idx, totalCh);
            const bayPos = {
              x: destinationStation.position.x + bayOffset,
              z: destinationStation.position.z + 3.0,
            };
            const isPhysicallyBlocked = allVehicles.some(v =>
              v.id !== vehicle.id &&
              Math.hypot(v.position.x - bayPos.x, v.position.z - bayPos.z) < 2.5
            );
            if (!isPhysicallyBlocked) {
              selectedChargerIndex = idx;
              return true;
            }
            return false;
          });

          if (availableCharger && selectedChargerIndex !== -1) {
            vehicle.assignedChargerId = availableCharger.id;
            vehicle.currentStationId = destinationStation.id;
          }
        }

        if (selectedChargerIndex === -1) {
          if (!destinationStation.queue.includes(vehicle.id)) {
            destinationStation.queue.push(vehicle.id);
            vehicle.status = 'QUEUE';
            vehicle.trafficState = 'QUEUING';
            vehicle.currentStationId = destinationStation.id;
            vehicle.speed = 0;
            const qIdx = destinationStation.queue.indexOf(vehicle.id);
            vehicle.position = {
              x: destinationStation.position.x + 5.5 + qIdx * 2.8,
              y: 0,
              z: destinationStation.position.z + 9.5,
            };
            vehicle.currentLocationName = `${destinationStation.name}, Queue Position #${qIdx + 1}`;
            eventService.addEvent({
              type: 'STATUS_CHANGE',
              severity: 'WARNING',
              message: `⏳ ${vehicle.code} queued outside bays at Station ${destinationStation.code} (Position #${qIdx + 1})`,
              vehicleId: vehicle.id,
              stationId: destinationStation.id,
            });
            stationService.recomputeStationMetrics(destinationStation);
          }
          break;
        }

        const bayOffset = getBayOffset(selectedChargerIndex, totalCh);
        const apronStagingPos = {
          x: destinationStation.position.x + bayOffset,
          y: 0,
          z: destinationStation.position.z + 6.8,
        };

        const dx = apronStagingPos.x - vehicle.position.x;
        const dz = apronStagingPos.z - vehicle.position.z;
        const dist = Math.hypot(dx, dz);
        const apronSpeed = 14;
        const moveStep = (apronSpeed / 3.6) * 0.42 * this.speedMultiplier * SimulationEngine.DT;

        if (dist <= moveStep || dist < 0.5) {
          vehicle.position = { ...apronStagingPos };
          vehicle.heading = 0;
          vehicle.speed = 6;
          vehicle.status = 'REVERSE_PARKING';
          vehicle.trafficState = 'REVERSE_PARKING';
          vehicle.currentLocationName = `${destinationStation.name}, Reversing into Bay #${selectedChargerIndex + 1}`;
          eventService.addEvent({
            type: 'STATUS_CHANGE',
            severity: 'INFO',
            message: `🅿️ ${vehicle.code} taking turn and commencing reverse-parking into Bay #${selectedChargerIndex + 1}`,
            vehicleId: vehicle.id,
            stationId: destinationStation.id,
          });
        } else {
          vehicle.position.x += (dx / dist) * moveStep;
          vehicle.position.z += (dz / dist) * moveStep;
          vehicle.heading = Math.atan2(dx, dz);
          vehicle.speed = apronSpeed;
          vehicle.trafficState = 'ENTERING_STATION';
        }
        break;
      }

      case 'REVERSE_PARKING': {
        if (!destinationStation || !vehicle.assignedChargerId) {
          vehicle.status = 'EN_ROUTE';
          break;
        }

        const totalCh = destinationStation.chargers.length;
        const selectedChargerIndex = destinationStation.chargers.findIndex(c => c.id === vehicle.assignedChargerId);
        const bayOffset = getBayOffset(selectedChargerIndex >= 0 ? selectedChargerIndex : 0, totalCh);
        const targetBayZ = destinationStation.position.z + 3.0;
        const targetBayX = destinationStation.position.x + bayOffset;

        const revSpeed = 6;
        const revStep = (revSpeed / 3.6) * 0.42 * this.speedMultiplier * SimulationEngine.DT;

        vehicle.position.z = Math.max(targetBayZ, vehicle.position.z - revStep);
        vehicle.position.x += (targetBayX - vehicle.position.x) * (1 - Math.exp(-8 * SimulationEngine.DT));
        vehicle.heading = 0;
        vehicle.speed = revSpeed;

        if (vehicle.position.z <= targetBayZ + 0.1) {
          vehicle.position.x = targetBayX;
          vehicle.position.z = targetBayZ;
          vehicle.speed = 0;
          vehicle.status = 'CHARGING';
          vehicle.trafficState = 'CHARGING';

          const ch = destinationStation.chargers.find(c => c.id === vehicle.assignedChargerId);
          if (ch) {
            ch.status = 'CHARGING';
            ch.currentPowerKw = ch.powerKw === 350 ? 220 : 120;
            ch.currentEvId = vehicle.code;
            vehicle.chargingRateKw = ch.currentPowerKw;
          }

          vehicle.currentLocationName = `${destinationStation.name}, Bay #${selectedChargerIndex + 1}`;
          eventService.addEvent({
            type: 'CHARGING_START',
            severity: 'INFO',
            message: `⚡ ${vehicle.code} (${vehicle.model}) parked in Bay #${selectedChargerIndex + 1} — DC Fast Charging cable connected (${vehicle.chargingRateKw} kW)`,
            vehicleId: vehicle.id,
            stationId: destinationStation.id,
            chargerId: ch?.id,
          });

          stationService.recomputeStationMetrics(destinationStation);
        }
        break;
      }

      case 'QUEUE': {
        if (!destinationStation) break;
        if (destinationStation.queue[0] === vehicle.id) {
          const allVehicles = vehicleService.getAllVehicles();
          const totalCh = destinationStation.chargers.length;
          let selectedChargerIndex = -1;
          const availableCharger = destinationStation.chargers.find((c, idx) => {
            if (c.status !== 'AVAILABLE') return false;
            const bayOffset = getBayOffset(idx, totalCh);
            const bayPos = {
              x: destinationStation.position.x + bayOffset,
              z: destinationStation.position.z + 3.0,
            };
            const isPhysicallyBlocked = allVehicles.some(v =>
              v.id !== vehicle.id &&
              Math.hypot(v.position.x - bayPos.x, v.position.z - bayPos.z) < 2.5
            );
            if (!isPhysicallyBlocked) {
              selectedChargerIndex = idx;
              return true;
            }
            return false;
          });

          if (availableCharger && selectedChargerIndex !== -1) {
            destinationStation.queue.shift();
            vehicle.assignedChargerId = availableCharger.id;
            vehicle.currentStationId = destinationStation.id;
            vehicle.status = 'ENTERING_STATION';
            vehicle.trafficState = 'ENTERING_STATION';
            vehicle.speed = 12;
            eventService.addEvent({
              type: 'STATUS_CHANGE',
              severity: 'INFO',
              message: `🚗 ${vehicle.code} called from queue into Bay #${selectedChargerIndex + 1}`,
              vehicleId: vehicle.id,
              stationId: destinationStation.id,
            });
            stationService.recomputeStationMetrics(destinationStation);
          }
        }
        break;
      }

      case 'CHARGING': {
        const chargeInc = (1.5 * this.speedMultiplier) * SimulationEngine.DT;
        vehicle.currentBatteryPct = Math.min(100, vehicle.currentBatteryPct + chargeInc);
        const maxRange = vehicle.batteryCapacityKwh ? vehicle.batteryCapacityKwh * 5.0 : 380;
        vehicle.estimatedRangeKm = Math.min(maxRange, Math.round((vehicle.currentBatteryPct / 100) * maxRange));
        vehicle.energyConsumedKwh += 0.4 * this.speedMultiplier * SimulationEngine.DT;
        vehicle.speed = 0;
        vehicle.trafficState = 'CHARGING';

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
            message: `🎉 ${vehicle.code} (${vehicle.model}) completed charge at ${vehicle.currentBatteryPct}% — disconnecting cable`,
            vehicleId: vehicle.id,
            stationId: destinationStation?.id,
          });
        }
        break;
      }

      case 'COMPLETED': {
        const st = destinationStation || stations.find(s => s.id === vehicle.currentStationId);
        if (st) {
          vehicle.status = 'LEAVING_STATION';
          vehicle.trafficState = 'LEAVING_STATION';
          vehicle.speed = 12;
          vehicle.heading = 0;
          vehicle.assignedChargerId = null;
        }
        break;
      }

      case 'LEAVING_STATION': {
        const st = destinationStation || stations.find(s => s.id === vehicle.currentStationId);
        if (!st) {
          vehicle.status = 'EN_ROUTE';
          break;
        }

        const targetApronZ = st.position.z + 6.8;
        const forwardStep = (12 / 3.6) * 0.42 * this.speedMultiplier * SimulationEngine.DT;
        vehicle.position.z = Math.min(targetApronZ, vehicle.position.z + forwardStep);
        vehicle.heading = 0;
        vehicle.speed = 12;

        if (vehicle.position.z >= targetApronZ - 0.1) {
          vehicle.routeWaypoints = VehicleService.getDepartureRoute(st.position, vehicle.position);
          vehicle.currentWaypointIndex = 0;
          vehicle.status = 'DEPARTING';
          vehicle.trafficState = 'CRUISING';
          vehicle.currentStationId = null;
          vehicle.destinationStationId = null;
          vehicle.speed = 36;
          eventService.addEvent({
            type: 'STATUS_CHANGE',
            severity: 'INFO',
            message: `🚗 ${vehicle.code} exited station and merged onto public highway`,
            vehicleId: vehicle.id,
          });
        }
        break;
      }

      case 'DEPARTING': {
        const waypoints = vehicle.routeWaypoints;
        if (!waypoints || waypoints.length === 0) {
          vehicle.status = 'LEFT_NETWORK';
          break;
        }

        while (vehicle.currentWaypointIndex < waypoints.length - 1) {
          const wp = waypoints[vehicle.currentWaypointIndex];
          const wdx = wp.x - vehicle.position.x;
          const wdz = wp.z - vehicle.position.z;
          const wdist = Math.hypot(wdx, wdz);
          const fX = Math.sin(vehicle.heading || 0);
          const fZ = Math.cos(vehicle.heading || 0);
          const dot = wdx * fX + wdz * fZ;

          if (wdist < 2.4 || (dot < 0.2 && wdist < 5.0)) {
            vehicle.currentWaypointIndex++;
          } else {
            break;
          }
        }

        const targetWp = waypoints[vehicle.currentWaypointIndex];
        if (!targetWp) {
          vehicle.status = 'LEFT_NETWORK';
          break;
        }

        const dx = targetWp.x - vehicle.position.x;
        const dz = targetWp.z - vehicle.position.z;
        const dist = Math.hypot(dx, dz);

        let effectiveSpeed = vehicle.speed > 0 ? vehicle.speed : 36;

        const allVehicles = vehicleService.getAllVehicles();
        const fX = Math.sin(vehicle.heading || 0);
        const fZ = Math.cos(vehicle.heading || 0);

        for (const other of allVehicles) {
          if (other.id === vehicle.id) continue;
          const toOtherX = other.position.x - vehicle.position.x;
          const toOtherZ = other.position.z - vehicle.position.z;
          const distToOther = Math.hypot(toOtherX, toOtherZ);

          if (distToOther < 14.0) {
            const otherFx = Math.sin(other.heading || 0);
            const otherFz = Math.cos(other.heading || 0);
            const headingAlignment = fX * otherFx + fZ * otherFz;

            if (headingAlignment < 0.2) continue;

            const longDist = fX * toOtherX + fZ * toOtherZ;
            const latDist = Math.abs(fX * toOtherZ - fZ * toOtherX);

            if (latDist < 1.8 && longDist > 0.2) {
              if (longDist < 4.2) {
                effectiveSpeed = Math.max(20, other.speed > 0 ? other.speed * 0.9 : 20);
              } else if (longDist < 10.0) {
                const leadSpeed = other.speed > 0 ? other.speed : 24;
                effectiveSpeed = Math.min(effectiveSpeed, Math.max(22, leadSpeed * 0.9));
              }
            } else if (distToOther < 3.2 && (other.status === 'EN_ROUTE' || other.status === 'DEPARTING')) {
              effectiveSpeed = Math.max(18, effectiveSpeed * 0.9);
            }
          }
        }

        const moveStep = (effectiveSpeed / 3.6) * 0.42 * this.speedMultiplier * SimulationEngine.DT;

        if (vehicle.currentWaypointIndex >= waypoints.length - 1 && (dist <= moveStep || dist < 2.0)) {
          vehicle.position = { ...targetWp };
          vehicle.status = 'LEFT_NETWORK';
        } else {
          const targetHeading = Math.atan2(dx, dz);
          let headingDiff = targetHeading - (vehicle.heading || 0);
          headingDiff = ((headingDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

          const isHeavy = vehicle.model === 'Heavy Electric Hauler' || vehicle.model === 'Electric City Bus';
          const maxTurnRate = isHeavy ? 2.8 : 4.0;
          const maxTurn = maxTurnRate * SimulationEngine.DT * this.speedMultiplier;
          const clampedTurn = Math.max(-maxTurn, Math.min(maxTurn, headingDiff));
          vehicle.heading = (vehicle.heading || 0) + clampedTurn;
          vehicle.heading = ((vehicle.heading + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

          if (Math.abs(headingDiff) > 0.4) {
            const turnFactor = Math.min(1.0, (Math.abs(headingDiff) - 0.4) / 1.2);
            effectiveSpeed = Math.max(18, effectiveSpeed * (1 - turnFactor * 0.35));
          }

          const actualMoveStep = (effectiveSpeed / 3.6) * 0.42 * this.speedMultiplier * SimulationEngine.DT;
          const forwardStep = Math.min(dist, actualMoveStep);
          vehicle.position.x += Math.sin(vehicle.heading) * forwardStep;
          vehicle.position.z += Math.cos(vehicle.heading) * forwardStep;
        }

        if (effectiveSpeed > 0) {
          const drain = (effectiveSpeed * 0.0022) * this.speedMultiplier * SimulationEngine.DT;
          vehicle.currentBatteryPct = Math.max(5, vehicle.currentBatteryPct - drain);
          const maxRange = vehicle.batteryCapacityKwh ? vehicle.batteryCapacityKwh * 5.0 : 380;
          vehicle.estimatedRangeKm = Math.max(8, Math.round((vehicle.currentBatteryPct / 100) * maxRange));
          vehicle.tripDistanceKm += (moveStep * 0.001);
        }
        vehicle.speed = effectiveSpeed;
        break;
      }

      case 'LEFT_NETWORK': {
        const newRoute = VehicleService.getRandomRoute(vehicle.position, vehicle.heading);
        vehicle.destinationStationId = null;
        vehicle.routeWaypoints = newRoute;
        vehicle.currentWaypointIndex = 0;
        if (newRoute.length > 0) {
          vehicle.position = { ...newRoute[0] };
        }
        if (newRoute.length > 1) {
          const nextWp = newRoute[1];
          vehicle.heading = Math.atan2(nextWp.x - vehicle.position.x, nextWp.z - vehicle.position.z);
        }
        vehicle.currentBatteryPct = Math.floor(75 + Math.random() * 20);
        vehicle.estimatedRangeKm = Math.round((vehicle.currentBatteryPct / 100) * 380);
        vehicle.energyConsumedKwh = 0;
        vehicle.status = 'EN_ROUTE';
        vehicle.speed = Math.floor(36 + Math.random() * 10);
        vehicle.routeProgress = 0.05;
        vehicle.currentLocationName = `Patrolling City Route`;
        vehicle.etaMinutes = 4;
        break;
      }

      case 'UNDER_REPAIR': {
        vehicle.speed = 0;
        if (vehicle.motorTemperatureC > 55) {
          vehicle.motorTemperatureC = Math.max(55, Math.round(vehicle.motorTemperatureC - (1.5 * this.speedMultiplier * SimulationEngine.DT)));
        }
        if (vehicle.batteryTemperatureC > 30) {
          vehicle.batteryTemperatureC = Math.max(30, Math.round(vehicle.batteryTemperatureC - 0.8 * this.speedMultiplier));
        }
        break;
      }
    }
  }

  private handleStationEntranceArrival(vehicle: Vehicle, stations: Station[]) {
    const station = stations.find(s => s.id === vehicle.destinationStationId);
    if (!station) {
      vehicle.status = 'EN_ROUTE';
      return;
    }

    vehicle.status = 'ENTERING_STATION';
    vehicle.trafficState = 'ENTERING_STATION';
    vehicle.currentStationId = station.id;
    vehicle.speed = 14;
    vehicle.currentLocationName = `Entering ${station.name} (${station.code}) apron`;

    eventService.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'INFO',
      message: `🅿️ ${vehicle.code} arrived at ${station.name} entrance and transitioned into internal apron`,
      vehicleId: vehicle.id,
      stationId: station.id,
    });
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

  public triggerEVFault(vehicleCode: string = 'EV-024', faultReason: string = 'Motor Overheating (92°C)'): Vehicle | undefined {
    const v = vehicleService.getVehicleById(vehicleCode);
    if (!v) return undefined;

    v.status = 'SERVICE_REQUIRED';
    v.trafficState = 'SERVICE_ROUTE';
    v.vehicleHealth = 'CRITICAL';
    v.motorTemperatureC = 92;
    v.batteryTemperatureC = 42;
    v.faultReason = faultReason;
    v.speed = 0;
    v.updatedAt = new Date().toISOString();

    const sc = stationService.getServiceCenter();
    const scRoute = VehicleService.getRouteForServiceCenter(v.position);
    v.serviceCenterId = sc.id;
    v.destinationStationId = null;
    v.routeWaypoints = scRoute;
    v.currentWaypointIndex = 0;
    v.status = 'EN_ROUTE';
    v.speed = 28;
    v.currentLocationName = 'In transit to S03 Diagnostics Service Hub';

    eventService.addEvent({
      type: 'FAULT',
      severity: 'CRITICAL',
      message: `🚨 MOTOR OVERHEATING ALERT: ${v.code} (${v.model}) motor temp hit 92°C — Safe stop executed, routed to S03 Service Center via road network`,
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
      : targetStation.chargers.find(c => c.status === 'CHARGING') || targetStation.chargers.find(c => c.status !== 'FAULT') || targetStation.chargers[0];

    if (targetCharger) {
      stationService.setChargerStatus(
        targetStation.id,
        targetCharger.id,
        'FAULT',
        null,
        0,
        'Silicon Carbide Inverter Thermal Trip'
      );

      const vehicles = vehicleService.getAllVehicles();
      const affectedEv = vehicles.find(v => v.assignedChargerId === targetCharger.id && (v.status === 'CHARGING' || v.status === 'REVERSE_PARKING'));
      if (affectedEv) {
        affectedEv.chargingRateKw = 0;
        eventService.addEvent({
          type: 'FAULT',
          severity: 'CRITICAL',
          message: `🚨 CHARGER FAULT: Charger ${targetCharger.code} communication failed during active session with ${affectedEv.code} — Rerouting EV`,
          vehicleId: affectedEv.id,
          stationId: targetStation.id,
          chargerId: targetCharger.id,
        });

        const altStation = stations.find(s => s.id !== targetStation.id && s.status === 'ONLINE' && s.chargers.some(c => c.status === 'AVAILABLE')) || stations[1] || stations[0];
        const newRoute = VehicleService.getRouteFromCurrentPositionTo(affectedEv.position, altStation.position);

        affectedEv.destinationStationId = altStation.id;
        affectedEv.assignedChargerId = null;
        affectedEv.routeWaypoints = newRoute;
        affectedEv.currentWaypointIndex = 0;
        affectedEv.status = 'LEAVING_STATION';
        affectedEv.trafficState = 'REROUTING';
        affectedEv.speed = 12;
        affectedEv.currentLocationName = `Rerouting to ${altStation.name} [${altStation.code}]`;

        eventService.addEvent({
          type: 'REDIRECT',
          severity: 'WARNING',
          message: `🔄 ${affectedEv.code} disconnected from faulted Charger ${targetCharger.code} and rerouted to ${altStation.name} via road network`,
          vehicleId: affectedEv.id,
          stationId: altStation.id,
        });
      }
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

  public returnToRoad(vehicleIdentifier: string = 'EV-024'): Vehicle | undefined {
    let v = vehicleService.getVehicleById(vehicleIdentifier);
    if (!v) {
      v = vehicleService.getAllVehicles().find(
        (veh) =>
          veh.code.toLowerCase() === vehicleIdentifier.toLowerCase() ||
          veh.id.toLowerCase() === vehicleIdentifier.toLowerCase()
      );
    }
    if (!v) return undefined;

    stationService.releaseChargerByVehicle(v.id);
    stationService.releaseServiceBay(v.id);

    v.assignedChargerId = null;
    v.currentStationId = null;
    v.serviceCenterId = null;
    v.faultReason = null;

    const stations = stationService.getAllStations();
    const targetStation = stations[1] || stations[0];
    const newRoute = VehicleService.getRouteFromCurrentPositionTo(v.position, targetStation.position);

    v.status = 'EN_ROUTE';
    v.trafficState = 'CRUISING';
    v.destinationStationId = targetStation.id;
    v.routeWaypoints = newRoute;
    v.currentWaypointIndex = 0;
    if (newRoute.length > 1) {
      v.heading = Math.atan2(newRoute[1].x - v.position.x, newRoute[1].z - v.position.z);
    }
    v.speed = 42;
    v.currentLocationName = `Boisar–Palghar Regional Corridor`;
    v.updatedAt = new Date().toISOString();

    eventService.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'INFO',
      message: `🚗 ${v.code} returned to the regional road network on Boisar–Palghar Highway`,
      vehicleId: v.id,
    });

    return v;
  }

  public resetSimulation() {
    this.scenarioStep = 0;
    energyService.triggerEnergySurge(false);
    vehicleService.reseedVehicles();
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
      message: '🔄 EVNEXUS Boisar Digital Twin state reset to nominal baseline with vehicles on road network',
    });
  }
}

export const simulationEngine = SimulationEngine.getInstance();
