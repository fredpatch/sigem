import "dotenv/config";
import application from "./app";
import connectToMongo from "./config/mongo";
import { ensureKafkaTopics } from "./core/ensure-topics";
import { initEvents } from "./core/events";

const PORT = Number(process.env.PORT) || 4010;

async function bootstrap() {
  // init EventBus (based on EVENTS_DRIVER), "eager connect" for health
  await initEvents({ eager: true });

  const server = await application();

  await ensureKafkaTopics(
    process.env.KAFKA_BROKERS!.split(",").map((b) => b.trim()),
  );

  // Mongo
  await connectToMongo();

  // Start server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Provider Service is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Provider Service", err);
  process.exit(1);
});
