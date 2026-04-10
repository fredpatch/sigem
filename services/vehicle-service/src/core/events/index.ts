// core/events/index.ts
import { setEventBus, getEventBus as _get, IEventBus } from "./event.bus";
import { NoOpEventBus } from "./providers/no-op-event.bus";
import { KafkaEventBus } from "./providers/kafka-event.bus";
import { env } from "src/config/env";

export async function initEvents(opts?: { eager?: boolean }) {
  const brokers = env.KAFKA_BROKERS.split(",").map((b) => b.trim()).filter(Boolean);
  const driver = env.EVENTS_DRIVER === "kafka" && brokers.length === 0
    ? "noop"
    : env.EVENTS_DRIVER;
  let bus: IEventBus;

  if (driver === "kafka") {
    console.log(
      "[events] driver=kafka brokers=%s",
      brokers.join(",")
    );
    bus = new KafkaEventBus();
  } else {
    if (env.EVENTS_DRIVER === "kafka" && brokers.length === 0) {
      console.warn("[events] KAFKA_BROKERS is empty, falling back to noop driver");
    }
    console.log("[events] driver=noop");
    bus = new NoOpEventBus();
  }

  setEventBus(bus);

  // Eager connect si demandé (recommandé pour /health)
  if (opts?.eager && bus.connect) {
    try {
      await bus.connect();
      console.log("✅ [Kafka] Producer connected and ready to send events.");
    } catch (e) {
      // pas bloquant au boot : on log et on laissera le premier emit() retenter
      console.error(
        "⚠️ [Kafka] Eager connect failed, will retry on first emit():",
        e
      );
    }
  }
}

export function getEventBus() {
  return _get();
}
