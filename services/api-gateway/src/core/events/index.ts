import {
  IEventBus,
  KafkaEventBus,
  NoOpEventBus,
  setEventBus,
  getEventBus as _get,
} from "@sigem/shared";
// import { setEventBus, getEventBus as _get, IEventBus } from "./event.bus";
// import { NoOpEventBus } from "./providers/no-op-event.bus";
// import { KafkaEventBus } from "./providers/kafka-event.bus";

export async function initEvents(opts?: { eager?: boolean }) {
  const driver = (process.env.EVENTS_DRIVER || "noop").toLowerCase();
  let bus: IEventBus;

  if (driver === "kafka") {
    console.log(
      "[events] driver=kafka brokers=%s",
      process.env.KAFKA_BROKERS || "localhost:9092",
    );
    bus = new KafkaEventBus();
  } else {
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
        e,
      );
    }
  }
}

export function getEventBus() {
  return _get();
}
