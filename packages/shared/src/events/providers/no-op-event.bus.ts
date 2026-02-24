// shared/src/events/providers/no-op-event.bus.ts
import { IEventBus } from "../event.bus";

export class NoOpEventBus implements IEventBus {
  isConnected(): boolean {
    return false;
  }

  async connect(): Promise<void> {
    /* noop */
  }

  async close(): Promise<void> {
    /* noop */
  }

  async emit(event: string, payload: any): Promise<void> {
    const flat =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    console.log(`[EVENT][noop] ${event} ${flat}`);
  }
}
