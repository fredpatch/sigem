import "dotenv/config";
import initApp, { API_VERSION } from "./app";
import { startConsumer } from "./common/consumer";
import { connectToMongo } from "@sigem/shared";

const PORT = Number(process.env.PORT ?? 4001);

async function main() {
  // Mongo
  const fallback = process.env.MONGO_URL_FALLBACK!;
  if (!fallback) {
    throw new Error("MONGO_URL_FALLBACK missing");
  }
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL missing");
  }

  await connectToMongo({ uri }, fallback);

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
