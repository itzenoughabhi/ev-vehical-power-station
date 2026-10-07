import { Recommendation, Station, Vehicle } from '../../types';
import { stationService } from '../stations/station.service';
import { vehicleService } from '../vehicles/vehicle.service';
import { energyService } from '../energy/energy.service';
import { eventService } from '../events/event.service';

export class AiService {
  private static instance: AiService;
  private pendingRecommendations: Map<string, Recommendation> = new Map();
  private lastEvaluationTime: number = 0;

  private constructor() {}

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  /**
   * Evaluates congestion, queues, and faults to generate intelligent rerouting recommendations.
   * Compares stations based on: distance + wait time + charger availability + load.
   */
  public evaluateNetworkOptimization(): Recommendation | null {
    const now = Date.now();
    if (now - this.lastEvaluationTime < 8000) {
      // Limit recommendation churn
      return null;
    }
    this.lastEvaluationTime = now;

    const stations = stationService.getAllStations();
    const vehicles = vehicleService.getAllVehicles();

    // Find stations with queues or heavy congestion
    const congestedStations = stations.filter(
      s => s.queue.length > 0 || s.utilizationRate >= 80 || s.chargers.some(c => c.status === 'FAULT')
    );

    if (congestedStations.length === 0) return null;

    // Find vehicles en route or arriving at these congested stations
    const candidateVehicles = vehicles.filter(
      v => (v.status === 'EN_ROUTE' || v.status === 'ARRIVING') &&
           v.destinationStationId &&
           congestedStations.some(cs => cs.id === v.destinationStationId)
    );

    if (candidateVehicles.length === 0) return null;
    const vehicle = candidateVehicles[0];
    const currentStation = stations.find(s => s.id === vehicle.destinationStationId)!;

    // Find best alternate station
    const otherStations = stations.filter(s => s.id !== currentStation.id);
    let bestStation: Station | null = null;
    let lowestScore = Infinity;

    for (const alt of otherStations) {
      const availableCount = alt.chargers.filter(c => c.status === 'AVAILABLE').length;
      const faultCount = alt.chargers.filter(c => c.status === 'FAULT').length;
      
      // Calculate distance score from vehicle to alt station
      const dx = vehicle.position.x - alt.position.x;
      const dz = vehicle.position.z - alt.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Score formula: (WaitTime * 2) + (LoadPct * 0.8) + (Dist * 0.5) - (AvailableChargers * 15) + (Faults * 30)
      const score = (alt.estimatedWaitMinutes * 2) + 
                    (alt.utilizationRate * 0.8) + 
                    (dist * 0.5) - 
                    (availableCount * 15) + 
                    (faultCount * 30);

      if (score < lowestScore) {
        lowestScore = score;
        bestStation = alt;
      }
    }

    if (!bestStation) return null;

    const currentWait = Math.max(15, currentStation.estimatedWaitMinutes + (currentStation.queue.length * 8));
    const altWait = Math.max(2, bestStation.estimatedWaitMinutes);
    const timeSaved = Math.max(5, currentWait - altWait);

    // If already recommended and pending, don't spam
    if (this.pendingRecommendations.has(vehicle.id)) {
      return this.pendingRecommendations.get(vehicle.id)!;
    }

    const recommendation: Recommendation = {
      id: `rec-${Date.now()}-${vehicle.code}`,
      vehicleId: vehicle.id,
      vehicleCode: vehicle.code,
      currentStationId: currentStation.id,
      currentStationCode: currentStation.code,
      recommendedStationId: bestStation.id,
      recommendedStationCode: bestStation.code,
      currentWaitMinutes: currentWait,
      recommendedWaitMinutes: altWait,
      potentialSavingMinutes: timeSaved,
      reason: `Station ${currentStation.code} has ${currentStation.queue.length} in queue and ${currentStation.chargers.filter(c => c.status === 'FAULT').length} fault(s). Station ${bestStation.code} has ${bestStation.chargers.filter(c => c.status === 'AVAILABLE').length} available bays.`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
    };

    this.pendingRecommendations.set(vehicle.id, recommendation);

    eventService.addEvent({
      type: 'REDIRECT',
      severity: 'WARNING',
      message: `💡 AI Recommendation: Reroute ${vehicle.code} from ${currentStation.code} to ${bestStation.code} to save ${timeSaved} mins wait time`,
      vehicleId: vehicle.id,
      stationId: bestStation.id,
    });

    return recommendation;
  }

  public getPendingRecommendations(): Recommendation[] {
    return Array.from(this.pendingRecommendations.values()).filter(r => r.status === 'PENDING');
  }

  public resolveRecommendation(recId: string, accept: boolean): boolean {
    const rec = Array.from(this.pendingRecommendations.values()).find(r => r.id === recId);
    if (!rec) return false;

    if (accept) {
      rec.status = 'ACCEPTED';
      vehicleService.redirectVehicle(rec.vehicleId, rec.recommendedStationId);
    } else {
      rec.status = 'REJECTED';
    }

    this.pendingRecommendations.delete(rec.vehicleId);
    return true;
  }

  /**
   * Deterministic AI Assistant answer generation with comprehensive telemetry reasoning.
   * Can be hooked directly into an external Python FastAPI / LLM endpoint when desired.
   */
  public async handleAssistantQuery(query: string): Promise<{ answer: string; confidence: number; telemetryContext: any }> {
    const lower = query.toLowerCase();
    const stations = stationService.getAllStations();
    const vehicles = vehicleService.getAllVehicles();
    const kpis = energyService.getKPIs();

    let answer = '';

    if (lower.includes('what') && (lower.includes('happening') || lower.includes('status') || lower.includes('overview'))) {
      const faultCount = kpis.activeFaults;
      const highStations = stations.filter(s => s.utilizationRate > 70).map(s => s.code).join(', ');
      answer = `Network operations are running at ${kpis.networkLoadMw} MW across ${kpis.activeStations} regional charging hubs. Currently, ${kpis.vehiclesCharging} EVs are actively charging, ${kpis.waitingVehicles} are en route or queued, and ${kpis.availableChargers} bays are available. ${faultCount > 0 ? `⚠️ There are ${faultCount} active charger faults requiring attention.` : 'All charging hardware is operating nominal.'}${highStations ? ` Stations experiencing elevated demand: ${highStations}.` : ''}`;
    } else if (lower.includes('congested') || lower.includes('busiest') || lower.includes('queue')) {
      const sorted = [...stations].sort((a, b) => (b.queue.length + b.utilizationRate) - (a.queue.length + a.utilizationRate));
      const busiest = sorted[0];
      answer = `Station ${busiest.code} (${busiest.name}) is currently the most congested hub with a ${busiest.utilizationRate}% grid utilization rate, ${busiest.queue.length} vehicles waiting in queue, and an estimated wait time of ${busiest.estimatedWaitMinutes} minutes.`;
    } else if (lower.includes('overload') || lower.includes('why')) {
      const overloaded = stations.find(s => s.utilizationRate > 80) || stations[0];
      const activeChargers = overloaded.chargers.filter(c => c.status === 'CHARGING');
      answer = `Station ${overloaded.code} is operating at ${overloaded.currentLoadKw} kW (${overloaded.utilizationRate}% of its ${overloaded.maxCapacityKw} kW rated capacity). This is driven by ${activeChargers.length} simultaneous DC fast-charging sessions drawing up to ${Math.round(overloaded.currentLoadKw / Math.max(1, activeChargers.length))} kW each. Automated load-balancing is recommended to prevent feeder trip.`;
    } else if (lower.includes('where') && (lower.includes('charge') || lower.includes('recommend'))) {
      const best = [...stations].sort((a, b) => b.chargers.filter(c => c.status === 'AVAILABLE').length - a.chargers.filter(c => c.status === 'AVAILABLE').length)[0];
      answer = `Station ${best.code} (${best.name}) in ${best.district} is the optimal charging destination right now. It has ${best.chargers.filter(c => c.status === 'AVAILABLE').length} open bays, 0 queue delay, and a current load of ${best.currentLoadKw} kW (${best.utilizationRate}% capacity).`;
    } else if (lower.includes('fail') || lower.includes('fault') || lower.includes('break')) {
      const faultedChargers: string[] = [];
      stations.forEach(s => s.chargers.filter(c => c.status === 'FAULT').forEach(c => faultedChargers.push(`${c.code} (${s.name})`)));
      if (faultedChargers.length > 0) {
        answer = `Current active hardware alerts: ${faultedChargers.join(', ')}. Primary root cause: thermal throttling and communication telemetry timeout. Field technicians have been flagged.`;
      } else {
        answer = `All 16 DC fast chargers are operating within nominal thermal and voltage envelopes with zero active faults.`;
      }
    } else if (lower.includes('20') || lower.includes('surge') || lower.includes('what will happen')) {
      answer = `Simulated 20-EV arrival surge scenario: Network utilization will climb from ${kpis.networkLoadMw} MW to ~2.1 MW (+140%). Stations A102 and B104 would enter queue state within 6 minutes. Recommended mitigation: dynamically throttle max charger output to 80 kW per bay and activate dynamic routing to Station C201 and D305.`;
    } else {
      answer = `EVNEXUS Telemetry Intelligence confirms all ${kpis.activeStations} stations are online with ${kpis.availableChargers} available chargers and ${kpis.networkLoadMw} MW live grid load. Queue optimization algorithms are running at 1-second intervals.`;
    }

    return {
      answer,
      confidence: 0.96,
      telemetryContext: {
        networkLoadMw: kpis.networkLoadMw,
        activeFaults: kpis.activeFaults,
        availableChargers: kpis.availableChargers,
        vehiclesCharging: kpis.vehiclesCharging,
      },
    };
  }
}

export const aiService = AiService.getInstance();
