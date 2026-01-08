// core/events/event.bus.ts
export interface IEventBus {
  emit(event: string, payload: any): Promise<void>;
  isConnected?(): boolean;
  connect?(): Promise<void>;
  close?(): Promise<void>;
}

let eventBus: IEventBus | undefined;

export function setEventBus(bus: IEventBus) {
  eventBus = bus;
}

export function getEventBus(): IEventBus {
  if (!eventBus) throw new Error("EventBus not initialized");
  return eventBus;
}
