import { Kafka } from "kafkajs";

const REQUIRED_TOPICS = [
    "sigem.diag.ping",
    "sigem.diag.pong",

    // vehicle documents
    "vehicle.document.created",
    "vehicle.document.updated",
    "vehicle.document.deleted",
    "vehicle.document.due_soon",
    "vehicle.document.renewed",
    "vehicle.document.expiring",

    // ✅ Vehicle monitoring
    "vehicle.task.due_soon",
    "vehicle.task.overdue",
    "vehicle.task.completed",
    "vehicle.task.created",
    "vehicle.task.updated",
    "vehicle.task.deleted",
    "vehicle.task.next_planned",

    // vehicles
    "vehicle.created",
    "vehicle.updated",
    "vehicle.deleted",
    "vehicle.mileage.updated",

    // templates (optionnel)
    "vehicle.task_template.created",
    "vehicle.task_template.updated",
    "vehicle.task_template.activated",
    "vehicle.task_template.deactivated",

    "auth.otp.requested"
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
