import "dotenv/config";
import {
  KAFKA_TOPICS,
  ensureKafkaTopics,
  startConsumer,
  connectToMongo,
} from "@sigem/shared";
import initApp from "./app";
import { createSocketServer } from "./ws/socket";
import { handleIncomingEvent } from "./handlers/notify.handler";

const PORT = Number(process.env.PORT ?? 4001);

async function main() {
  const server = await initApp();
  const { httpServer, io } = createSocketServer(server);

  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL missing");
  }

  const mongoSsl = process.env.MONGO_SSL === "true";

  await connectToMongo({
    uri,
    options: { ssl: mongoSsl },
  });

  const brokers = (process.env.KAFKA_BROKERS || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  if (brokers.length > 0) {
    await ensureKafkaTopics({ brokers });
  } else {
    console.log("[kafka] Topic provisioning skipped (no brokers configured)");
  }

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
    "vehicle.document.created",
    "vehicle.document.updated",
    "vehicle.document.deleted",
    "vehicle.document.due_soon",
    "vehicle.document.renewed",
    "vehicle.document.expiring",
    "vehicle.task.due_soon",
    "vehicle.task.overdue",
    "vehicle.task.completed",
    "vehicle.task.created",
    "vehicle.task.updated",
    "vehicle.task.deleted",
    "vehicle.task.next_planned",
    "vehicle.created",
    "vehicle.updated",
    "vehicle.deleted",
    "vehicle.mileage.updated",
    "vehicle.task_template.created",
    "vehicle.task_template.updated",
    "vehicle.task_template.activated",
    "vehicle.task_template.deactivated",
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
    "notify.event",
  ];

  if (brokers.length > 0) {
    await startConsumer({
      clientId: process.env.KAFKA_CLIENT_ID || "sigem-notification",
      groupId: process.env.KAFKA_GROUP_ID || "sigem-notification-g",
      brokers,
      topics,
      startupLog: true,
      verifyOnConnect: true,
      connectWarnMs: 10000,
      handler: async (payload, meta) => {
        await handleIncomingEvent(io, payload, meta.eventType ?? meta.topic);
      },
    });
  } else {
    console.log("[kafka] Consumer startup skipped (no brokers configured)");
  }

  httpServer.listen(PORT, "0.0.0.0", async () => {
    console.log(`Notification Service is running on port ${PORT}`);
  });
}

main().catch((e) => {
  console.error("Notification Service crash:", e);
  process.exit(1);
});
