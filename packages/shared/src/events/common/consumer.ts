// shared/src/events/common/consumer.ts
import { Kafka, logLevel, Consumer } from "kafkajs";
import { unwrapKafkaEvent } from "./unwrap";

export interface ConsumerConfig {
  clientId: string;
  groupId: string;
  brokers?: string[];
  topics: string[];
  startupLog?: boolean;
  verifyOnConnect?: boolean;
  connectWarnMs?: number;
  kafkaConfig?: {
    connectionTimeout?: number;
    authenticationTimeout?: number;
    requestTimeout?: number;
    retry?: {
      retries?: number;
      initialRetryTime?: number;
      maxRetryTime?: number;
      factor?: number;
      multiplier?: number;
    };
  };
  handler: (
    payload: any,
    meta: {
      topic: string;
      partition?: number;
      offset?: string;
      eventType?: string;
      headers?: Record<string, string | undefined>;
      raw?: any;
    },
  ) => Promise<void>;
  fromBeginning?: boolean;
}

export async function startConsumer(config: ConsumerConfig): Promise<Consumer> {
  const {
    clientId,
    groupId,
    brokers = (process.env.KAFKA_BROKERS || "localhost:9092")
      .split(",")
      .map((b) => b.trim()),
    topics,
    startupLog = false,
    verifyOnConnect = false,
    connectWarnMs = 0,
    kafkaConfig,
    handler,
    fromBeginning = false,
  } = config;

  const kafka = new Kafka({
    clientId,
    brokers,
    logLevel: logLevel.NOTHING,
    connectionTimeout: kafkaConfig?.connectionTimeout,
    authenticationTimeout: kafkaConfig?.authenticationTimeout,
    requestTimeout: kafkaConfig?.requestTimeout,
    retry: kafkaConfig?.retry,
  });

  const consumer = kafka.consumer({ groupId });

  let warnTimer: NodeJS.Timeout | undefined;
  if (connectWarnMs > 0) {
    warnTimer = setTimeout(() => {
      console.warn("[kafka] consumer connect taking longer than expected", {
        clientId,
        groupId,
        brokers: brokers.join(","),
        topics,
        connectWarnMs,
      });
    }, connectWarnMs);
  }

  await consumer.connect();
  if (warnTimer) clearTimeout(warnTimer);

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning });
  }

  if (verifyOnConnect) {
    const admin = kafka.admin();
    try {
      await admin.connect();
      await admin.fetchTopicMetadata({ topics });
    } catch (e) {
      console.warn("[kafka] consumer verify failed", {
        clientId,
        groupId,
        topics,
        err: e instanceof Error ? e.message : e,
      });
    } finally {
      await admin.disconnect();
    }
  }

  if (startupLog) {
    console.log("[kafka] consumer connected", {
      clientId,
      groupId,
      brokers: brokers.join(","),
      topics,
      fromBeginning,
    });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      try {
        const raw = JSON.parse(message.value.toString());
        const headers = Object.fromEntries(
          Object.entries(message.headers ?? {}).map(([k, v]) => [
            k,
            typeof v === "string" ? v : v?.toString(),
          ]),
        ) as Record<string, string | undefined>;
        const { eventType, payload } = unwrapKafkaEvent(raw);

        await handler(payload, {
          topic,
          partition,
          offset: message.offset,
          eventType,
          headers,
          raw,
        });
      } catch (e) {
        console.error(`[${clientId}] consume error on ${topic}`, e);
      }
    },
  });

  return consumer;
}
