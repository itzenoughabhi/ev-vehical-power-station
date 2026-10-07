import { LiveEvent } from '../../types';

export class EventService {
  private static instance: EventService;
  private events: LiveEvent[] = [];
  private readonly MAX_EVENTS = 100;
  private listeners: ((event: LiveEvent) => void)[] = [];

  private constructor() {
    this.seedInitialEvents();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private seedInitialEvents() {
    const now = Date.now();
    this.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'SUCCESS',
      message: 'EVNEXUS Digital Twin Engine initialized. Telemetry sync active.',
      metadata: { system: 'core' }
    });
    this.addEvent({
      type: 'STATUS_CHANGE',
      severity: 'INFO',
      message: 'Grid monitoring established across 4 regional hubs (16 chargers).',
      metadata: { stationsCount: 4 }
    });
  }

  public addEvent(eventData: Omit<LiveEvent, 'id' | 'timestamp'>): LiveEvent {
    const event: LiveEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...eventData,
    };

    this.events.unshift(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events.pop();
    }

    this.listeners.forEach((listener) => listener(event));
    return event;
  }

  public getEvents(limit: number = 30): LiveEvent[] {
    return this.events.slice(0, limit);
  }

  public onNewEvent(listener: (event: LiveEvent) => void) {
    this.listeners.push(listener);
  }
}

export const eventService = EventService.getInstance();
