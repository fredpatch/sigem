import { app } from "./app";
import { connectToMongo } from "@sigem/shared";

const PORT = Number(process.env.PORT) || 4006;

async function bootstrap() {
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

  app.listen(PORT, () => {
    console.log(`Reference Service is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Reference Service", err);
  process.exit(1);
});
