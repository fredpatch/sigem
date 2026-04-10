import { app } from "./app";
import { connectToMongo } from "@sigem/shared";

const PORT = Number(process.env.PORT) || 4006;

async function bootstrap() {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Reference Service is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Reference Service", err);
  process.exit(1);
});
