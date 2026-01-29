// core/providers/kafka.event.bus.ts
import { IEventBus } from "../event.bus";
import { Kafka, logLevel, Producer } from "kafkajs";
import { KAFKA_TOPICS, TOPICS } from "@sigem/shared";

export class KafkaEventBus implements IEventBus {
  private producer!: Producer;

  constructor() {
    const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
    const clientId = process.env.KAFKA_CLIENT_ID!;
    const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.NOTHING });

    this.producer = kafka.producer();
    console.log(
      `🟢 [KafkaEventBus] Initialized (clientId=${clientId}, brokers=${brokers.join(",")})`,
    );
  }

  public isConnected(): boolean {
    return (this.producer as any)?.isConnected?.() ?? false;
  }

  public async connect(): Promise<void> {
    const ok = this.isConnected();
    if (!ok) await (this.producer as any).connect();
  }

  public async close(): Promise<void> {
    if (this.isConnected()) await this.producer.disconnect();
  }

  private async ensureConnected() {
    const isConnected = (this.producer as any)?.isConnected?.() ?? false;
    if (!isConnected) await this.producer.connect();
  }

  async emit(event: string, payload: any): Promise<void> {
    // await this.connect();
    await this.ensureConnected();

    console.log("[kafka][debug-topics]", {
      event,
      hasKey: Object.prototype.hasOwnProperty.call(TOPICS, event),
      direct: TOPICS[event],
      topicsKeysSample: Object.keys(TOPICS)
        .filter((k) => k.startsWith("supply."))
        .sort(),
    });

    const topic = TOPICS[event] ?? TOPICS[KAFKA_TOPICS.LOG_ACTION];
    const msg = {
      value: JSON.stringify({ type: event, payload, ts: Date.now() }),
    };

    for (let i = 0; i < 3; i++) {
      try {
        const res = await this.producer.send({ topic, messages: [msg] });

        console.log("[kafka][sent]", {
          event,
          topic,
          ack: res?.map((r) => ({
            partition: r.partition,
            offset: r.baseOffset,
          })),
        });

        return;
      } catch (e: any) {
        console.error("[kafka][send_failed]", {
          event,
          topic,
          attempt: i + 1,
          err: e?.message || e,
        });

        if (i === 2) throw e;
        await new Promise((r) => setTimeout(r, 300 * (i + 1)));
      }
    }
  }
}
