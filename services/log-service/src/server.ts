import "dotenv/config";
import initApp, { API_VERSION } from "./app";
import { startConsumer } from "./common/consumer";
import { connectToMongo } from "@sigem/shared/config";

const PORT = Number(process.env.PORT ?? 4001);

async function main() {
  // Mongo
  await connectToMongo();

  // Kafka Consumer
  startConsumer().catch((err) => {
    console.error(`msg: "Kafka consumer error", ${err} `);
    process.exitCode = 1;
  });

  // App
  const server = await initApp();

  server.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 API Log-Entry-Service running on port ${PORT}`);
    console.log(
      `🟢 Health check: http://localhost:${PORT}/${API_VERSION}/health`,
    );
  });
}

main().catch((e) => {
  console.error("Notification Service crash:", e);
  process.exit(1);
});
