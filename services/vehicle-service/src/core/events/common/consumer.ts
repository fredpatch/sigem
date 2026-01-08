// common/consumer.ts
import { Kafka, logLevel } from "kafkajs";

export async function startConsumer({
  clientId,
  groupId,
  brokers,
  topic,
  handler,
}: {
  clientId: string;
  groupId: string;
  brokers: string[];
  topic: string;
  handler: (message: any) => Promise<void>;
}) {
  const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.NOTHING });
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      try {
        const evt = JSON.parse(message.value.toString());
        await handler(evt);
      } catch (e) {
        console.error(`[${clientId}] consume error`, e);
      }
    },
  });

  return consumer;
}
