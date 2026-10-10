import { TrafficSignal, Position3D, Vehicle } from '../../types';

export class TrafficController {
  private static instance: TrafficController;
  private signals: Map<string, TrafficSignal> = new Map();

  private constructor() {
    this.initSignals();
  }

  public static getInstance(): TrafficController {
    if (!TrafficController.instance) {
      TrafficController.instance = new TrafficController();
    }
    return TrafficController.instance;
  }

  private initSignals() {
    this.signals.clear();
  }

  public getAllSignals(): TrafficSignal[] {
    return [];
  }

  public getSignalById(id: string): TrafficSignal | undefined {
    return undefined;
  }

  public update(dt: number) {
  }

  public evaluateVehicleApproach(vehicle: Vehicle): {
    mustStop: boolean;
    speedFactor: number;
    signal?: TrafficSignal;
  } {
    return { mustStop: false, speedFactor: 1.0 };
  }
}

export const trafficController = TrafficController.getInstance();
