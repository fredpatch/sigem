// common/consumer.ts
import { Kafka, logLevel } from "kafkajs";
import { unwrapKafkaEvent } from "./unwrap";

export async function startConsumer({
  clientId,
  groupId,
  brokers,
  topics,
  handler,
}: {
  clientId: string;
  groupId: string;
  brokers: string[];
  topics: string[];
  handler: (
    evt: any,
    meta: {
      topic: string;
      partition: number;
      offset: string;
      eventType?: string;
    },
  ) => Promise<void>;
}) {
  const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.NOTHING });
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      try {
        const raw = JSON.parse(message.value.toString());
        const { eventType, payload } = unwrapKafkaEvent(raw);

        await handler(payload, {
          topic,
          partition,
          offset: message.offset,
          eventType,
        });
      } catch (e) {
        console.error(`[${clientId}] consume error`, e);
      }
    },
  });

  return consumer;
}
