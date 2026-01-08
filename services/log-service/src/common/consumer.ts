import { Kafka, logLevel } from "kafkajs";
import { saveLog } from "../services/log.service";
// @ts-ignore - selon ton export: @sigem/shared/constants
import { KAFKA_TOPICS } from "@sigem/shared/constants";
import { CONFIG } from "src/config/config";
import { normalizeDoc } from "./normalize";
// import { logger } from "./logger";

const TOPIC = KAFKA_TOPICS.LOG_ACTION ?? "log.action";

export async function startConsumer() {
  const kafka = new Kafka({
    clientId: CONFIG.kafka.clientId,
    brokers: [CONFIG.kafka.broker],
    logLevel: logLevel.INFO,
  });

  const consumer = kafka.consumer({ groupId: CONFIG.kafka.groupId });

  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  // logger.info(`
  //   msg: "Kafka consumer ready",
  //   topic: ${TOPIC},
  //   groupId: ${CONFIG.kafka.groupId},
  // `);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // const key = message.key?.toString();
      const value = message.value?.toString() ?? "{}";
      const headers = Object.fromEntries(
        Object.entries(message.headers ?? {}).map(([k, v]) => [
          k,
          v?.toString(),
        ])
      );

      const payload = JSON.parse(value);
      const doc = normalizeDoc(topic, payload, headers);

      await saveLog(doc);

    },
  });

  return consumer;
}
