import { TrafficSignal, Position3D, Vehicle } from '../../types';

const INITIAL_SIGNALS: TrafficSignal[] = [
  {
    id: 'SIG_BOISAR_TOWN',
    name: 'Boisar Town Center Junction',
    intersection: 'Boisar Town Center',
    position: { x: 18.0, y: 0, z: -18.0 },
    stopLine: { x: 12.0, y: 0, z: -18.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_UMROLI_JCT',
    name: 'Umroli Regional Interchange (SH-40 Corridor)',
    intersection: 'Umroli Interchange',
    position: { x: 46.5, y: 0, z: 155.0 },
    stopLine: { x: 40.0, y: 0, z: 153.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_SHIRGAON_BRANCH',
    name: 'Umroli Interchange (Shirgaon Coastal Branch)',
    intersection: 'Umroli Interchange',
    position: { x: 32.0, y: 0, z: 162.0 },
    stopLine: { x: 36.0, y: 0, z: 157.0 },
    heading: -0.7,
    state: 'GREEN',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_PALGHAR_JCT',
    name: 'Palghar Highway Junction',
    intersection: 'Palghar Collectorate Junction',
    position: { x: 57.0, y: 0, z: 215.0 },
    stopLine: { x: 50.0, y: 0, z: 215.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_TARAPUR_MIDC',
    name: 'Tarapur MIDC Chemical Sector Junction',
    intersection: 'Tarapur MIDC Split',
    position: { x: -36.5, y: 0, z: -5.0 },
    stopLine: { x: -30.0, y: 0, z: -5.0 },
    heading: -Math.PI / 2,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_SARAVALI_JCT',
    name: 'Saravali Regional 4-Way Interchange',
    intersection: 'Saravali Regional Junction',
    position: { x: 20.0, y: 0, z: 30.0 },
    stopLine: { x: 14.0, y: 0, z: 30.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_NORTH_OUTER',
    name: 'North Boisar Outer 3-Way Interchange',
    intersection: 'North Outer Interchange',
    position: { x: 38.0, y: 0, z: -60.0 },
    stopLine: { x: 32.0, y: 0, z: -60.0 },
    heading: 0,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
  {
    id: 'SIG_SHIRGAON_COAST',
    name: 'Shirgaon Beach Coastal 3-Way Junction',
    intersection: 'Shirgaon Beach Promenade',
    position: { x: -95.0, y: 0, z: 208.0 },
    stopLine: { x: -95.0, y: 0, z: 215.0 },
    heading: Math.PI / 2,
    state: 'GREEN',
    timeRemainingSec: 12,
  },
  {
    id: 'SIG_MANOR_EXPRESS',
    name: 'Manor NH-48 Express Terminal',
    intersection: 'Manor Express Junction',
    position: { x: 205.0, y: 0, z: -32.0 },
    stopLine: { x: 205.0, y: 0, z: -25.0 },
    heading: Math.PI / 2,
    state: 'GREEN',
    timeRemainingSec: 10,
  },
];

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
    for (const sig of INITIAL_SIGNALS) {
      this.signals.set(sig.id, { ...sig });
    }
  }

  public getAllSignals(): TrafficSignal[] {
    return Array.from(this.signals.values());
  }

  public getSignalById(id: string): TrafficSignal | undefined {
    return this.signals.get(id);
  }

  public update(dt: number) {
    // Dynamic green-phase cycling
    for (const sig of this.signals.values()) {
      sig.timeRemainingSec = Math.max(0, sig.timeRemainingSec - dt);
      if (sig.timeRemainingSec <= 0) {
        sig.timeRemainingSec = 14;
        sig.state = sig.state === 'GREEN' ? 'GREEN' : 'GREEN'; // Keep green wave flowing smoothly
      }
    }
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
