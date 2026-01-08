// core/providers/kafka.event.bus.ts
import { IEventBus } from "../event.bus";
import { Kafka, logLevel, Producer } from "kafkajs";
import { KAFKA_TOPICS, TOPICS } from "@sigem/shared";
import { env } from "src/config/env";

export class KafkaEventBus implements IEventBus {
  private producer!: Producer;

  constructor() {
    const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
    const clientId = env.KAFKA_CLIENT_ID;
    const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.NOTHING });

    this.producer = kafka.producer();
    console.log(
      `🟢 [KafkaEventBus] Initialized (clientId=${clientId}, brokers=${brokers.join(",")})`
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
    await this.connect();
    await this.ensureConnected();
    const topic = TOPICS[event] ?? TOPICS[KAFKA_TOPICS.LOG_ACTION];
    const msg = {
      value: JSON.stringify({ type: event, payload, ts: Date.now() }),
    };

    for (let i = 0; i < 3; i++) {
      try {
        await this.producer.send({ topic, messages: [msg] });
        return;
      } catch (e) {
        if (i === 2) throw e;
        await new Promise((r) => setTimeout(r, 300 * (i + 1)));
      }
    }
  }
}
