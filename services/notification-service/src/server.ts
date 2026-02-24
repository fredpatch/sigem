import "dotenv/config";
import { KAFKA_TOPICS } from "@sigem/shared/constants";
import { connectToMongo } from "@sigem/shared/config";
import { ensureKafkaTopics, startConsumer } from "@sigem/shared/kafka";
import initApp, { API_VERSION } from "./app";
import { createSocketServer } from "./ws/socket";
import { handleIncomingEvent } from "./handlers/notify.handler";

const PORT = Number(process.env.PORT ?? 4001);

async function main() {
  // App
  const server = await initApp();

  // Socket
  const { httpServer, io } = createSocketServer(server);

  // Mongo
  await connectToMongo();

  // Kafka setup
  const brokers = (process.env.KAFKA_BROKERS || "localhost:9092")
    .split(",")
    .map((b) => b.trim());

  await ensureKafkaTopics({ brokers });

  const topics = [
    KAFKA_TOPICS.NOTIFY_EVENT,
    KAFKA_TOPICS.ASSET_CREATED,
    KAFKA_TOPICS.ASSET_UPDATED,
    KAFKA_TOPICS.ASSET_TRANSFER,

    KAFKA_TOPICS.STOCK_LOW,
    KAFKA_TOPICS.STOCK_CRITICAL,
    KAFKA_TOPICS.STOCK_REPLENISHED,
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

    // users - auth
    // "auth.user.created",
    // "auth.user.updated",
    "auth.otp.requested",

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

  await startConsumer({
    clientId: process.env.KAFKA_CLIENT_ID || "sigem-notification",
    groupId: process.env.KAFKA_GROUP_ID || "sigem-notification-g",
    brokers,
    topics,
    startupLog: true,
    verifyOnConnect: true,
    connectWarnMs: 10000,
    handler: async (payload, meta) => {
      // Dev purpose || debugging
      // console.log(`🟣 [notif-service] received on ${meta.topic}:`, payload);
      await handleIncomingEvent(io, payload, meta.eventType ?? meta.topic);
    },
  });

  httpServer.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 API Notification-Service running on port ${PORT}`);
    // console.log(
    //   `🟢 Health check: http://localhost:${PORT}/${API_VERSION}/health`
    // );
  });
}

main().catch((e) => {
  console.error("Notification Service crash:", e);
  process.exit(1);
});
