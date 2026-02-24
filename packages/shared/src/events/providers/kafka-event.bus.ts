// shared/src/events/providers/kafka-event.bus.ts
import { IEventBus } from "../event.bus";
import { Kafka, logLevel, Producer } from "kafkajs";
import { KAFKA_TOPICS, TOPICS } from "../../constants/topics";

export interface KafkaEventBusConfig {
  brokers: string[];
  clientId: string;
}

export class KafkaEventBus implements IEventBus {
  private producer!: Producer;
  private brokers: string[];
  private clientId: string;

  constructor(config?: KafkaEventBusConfig) {
    this.brokers = config?.brokers || (process.env.KAFKA_BROKERS || "localhost:9092").split(",").map(b => b.trim());
    this.clientId = config?.clientId || process.env.KAFKA_CLIENT_ID || "sigem-service";
    
    const kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
      logLevel: logLevel.NOTHING,
    });

    this.producer = kafka.producer();
    console.log(
      `🟢 [KafkaEventBus] Initialized (clientId=${this.clientId}, brokers=${this.brokers.join(",")})`,
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
    await this.ensureConnected();

    const topic = TOPICS[event as keyof typeof TOPICS] ?? TOPICS[KAFKA_TOPICS.LOG_ACTION];
    const msg = {
      value: JSON.stringify({ type: event, payload, ts: Date.now() }),
    };

    for (let i = 0; i < 3; i++) {
      try {
        await this.producer.send({ topic, messages: [msg] });
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
