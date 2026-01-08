// notification-service/common/consumer.ts
import { Kafka, logLevel } from "kafkajs";
import { unwrapKafkaEvent } from "./unwrap";

type Cfg = {
  clientId: string;
  groupId: string;
  brokers: string[];
  topic?: string;
  topics?: string[];
  handler: (
    message: any,
    meta: { topic: string; eventType?: string; ts?: number; raw?: any }
  ) => Promise<void>;
};

export async function startConsumer(cfg: Cfg) {
  const { clientId, groupId, brokers, topic, topics, handler } = cfg;

  const list = topics?.length ? topics : topic ? [topic] : [];
  if (!list.length) {
    throw new Error("[Kafka] startConsumer: provide `topics` or `topic`.");
  }

  const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.NOTHING });
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();

  for (const t of list) {
    await consumer.subscribe({ topic: t, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      try {
        const raw = JSON.parse(message.value.toString());
        const { payload, eventType, ts } = unwrapKafkaEvent(raw);

        await handler(payload, { topic, eventType, ts, raw });
      } catch (e) {
        console.error(`[${clientId}] consume error on ${topic}`, e);
      }
    },
  });

  console.log(`✅ [Kafka] Consumer ready on topic=[${list.join(", ")}]`);
  return consumer;
}
