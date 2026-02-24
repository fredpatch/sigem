import {
  startConsumer as startSharedConsumer,
  KAFKA_TOPICS,
} from "@sigem/shared";
import { saveLog } from "../services/log.service";
import { CONFIG } from "src/config/config";
import { normalizeDoc } from "./normalize";
// import { logger } from "./logger";

const TOPIC = KAFKA_TOPICS.LOG_ACTION ?? "log.action";

export async function startConsumer() {
  const brokers = (CONFIG.kafka.broker || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  if (!brokers.length) {
    throw new Error("[kafka] Missing brokers; set KAFKA_BROKERS");
  }

  // console.log("[kafka] consumer starting", {
  //   brokers: brokers.join(","),
  //   groupId: CONFIG.kafka.groupId,
  //   topic: TOPIC,
  // });

  return startSharedConsumer({
    clientId: CONFIG.kafka.clientId,
    groupId: CONFIG.kafka.groupId,
    brokers,
    topics: [TOPIC],
    fromBeginning: true,
    startupLog: true,
    verifyOnConnect: true,
    connectWarnMs: 8000,
    kafkaConfig: {
      connectionTimeout: 15000,
      requestTimeout: 30000,
      retry: {
        retries: 8,
        initialRetryTime: 300,
        maxRetryTime: 5000,
      },
    },
    handler: async (_payload, meta) => {
      const raw = meta.raw ?? _payload;
      const headers = meta.headers ?? {};
      const doc = normalizeDoc(meta.topic, raw, headers);
      await saveLog(doc);
    },
  });
}
