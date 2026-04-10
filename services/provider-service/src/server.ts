import "dotenv/config";
import application from "./app";
import { ensureKafkaTopics } from "./core/ensure-topics";
import { initEvents } from "./core/events";
import { connectToMongo } from "@sigem/shared";

const PORT = Number(process.env.PORT) || 4010;

async function bootstrap() {
  const kafkaBrokers = (process.env.KAFKA_BROKERS || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  // init EventBus (based on EVENTS_DRIVER), "eager connect" for health
  await initEvents({ eager: true });

  const server = await application();

  if ((process.env.EVENTS_DRIVER || "noop") === "kafka" && kafkaBrokers.length > 0) {
    await ensureKafkaTopics(kafkaBrokers);
  } else {
    console.log("[kafka] Topic provisioning skipped (no brokers configured)");
  }

  // Mongo
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL missing");
  }

  const mongoSsl = process.env.MONGO_SSL === "true";

  await connectToMongo({
    uri,
    options: { ssl: mongoSsl },
  });

  // Start server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Provider Service is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Provider Service", err);
  process.exit(1);
});
