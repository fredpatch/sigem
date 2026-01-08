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
    // Dev-only: clear view and serialized
    const flat =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    // eg: [EVENT][noop] asset.created {...}
    // for test purpose only
    console.log(`[EVENT][noop] ${event} ${flat}`);
  }
}
