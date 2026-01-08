import { Kafka } from "kafkajs";

const REQUIRED_TOPICS = [
    "vehicle.task.due_soon",
    "vehicle.task.overdue",
    "vehicle.task.completed",
    "vehicle.document.expiring",
];

export async function ensureKafkaTopics(brokers: string[]) {
    const kafka = new Kafka({ clientId: "topic-ensurer", brokers });
    const admin = kafka.admin();

    await admin.connect();

    const existingTopics = await admin.listTopics();
    const missing = REQUIRED_TOPICS.filter(t => !existingTopics.includes(t));

    if (missing.length) {
        console.log("🟡 Creating missing Kafka topics:", missing);

        await admin.createTopics({
            topics: missing.map(topic => ({
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
