import { Kafka } from "kafkajs";

const REQUIRED_TOPICS = [
  "supply.plan.created",
  "supply.plan.updated",
  "supply.plan.status.changed",
  "supply.plan.completed",
  "supply.plan.deleted",

  "supply.item.created",
  "supply.item.updated",
  "supply.item.deactivated",
  "supply.item.activated",

  "supply.price.updated",
  "supply.price.deleted",
];

export async function ensureKafkaTopics(brokers: string[]) {
  const kafka = new Kafka({ clientId: "topic-ensurer", brokers });
  const admin = kafka.admin();

  await admin.connect();

  const existingTopics = await admin.listTopics();
  const missing = REQUIRED_TOPICS.filter((t) => !existingTopics.includes(t));

  if (missing.length) {
    console.log("🟡 Creating missing Kafka topics:", missing);

    await admin.createTopics({
      topics: missing.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
  } else {
    console.log("✅ All Kafka topics already exist");
  }

  await admin.disconnect();
}
