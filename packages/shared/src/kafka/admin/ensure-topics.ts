// packages/shared/src/kafka/admin/ensure-topics.ts
import { Kafka } from "kafkajs";
import { KAFKA_TOPICS } from "../../constants/topics";

const REQUIRED_TOPICS = Object.values(KAFKA_TOPICS);

export interface EnsureTopicsConfig {
  brokers: string[];
  numPartitions?: number;
  replicationFactor?: number;
}

export async function ensureKafkaTopics(config: EnsureTopicsConfig) {
  const {
    brokers,
    numPartitions = 1,
    replicationFactor = 1,
  } = config;

  const kafka = new Kafka({ clientId: "topic-ensurer", brokers });
  const admin = kafka.admin();

  try {
    await admin.connect();

    const existingTopics = await admin.listTopics();
    const missing = REQUIRED_TOPICS.filter((t) => !existingTopics.includes(t));

    if (missing.length) {
      console.log("🟡 [Kafka] Creating missing topics:", missing);

      await admin.createTopics({
        topics: missing.map((topic) => ({
          topic,
          numPartitions,
          replicationFactor,
        })),
      });

      console.log("✅ [Kafka] Created missing topics");
    } else {
      console.log("✅ [Kafka] All topics already exist");
    }
  } finally {
    await admin.disconnect();
  }
}
