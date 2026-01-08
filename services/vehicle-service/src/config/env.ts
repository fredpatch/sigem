import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4002),
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://admin:CHANGE_ME_STRONG@100.84.234.98:27017/sigem?replicaSet=rs0&authSource=admin&directConnection=true",
  SERVICE_NAME: process.env.SERVICE_NAME ?? "vehicle-service",
  KAFKA_BROKERS: process.env.KAFKA_BROKERS ?? "100.84.234.98:9092",
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID!,
  EVENTS_DRIVER: process.env.EVENTS_DRIVER!, // Provide a sensible default
} as const;

// console.log("All env vars:", process.env);
// console.log("EVENTS_DRIVER from process.env:", process.env.EVENTS_DRIVER);
// console.log("EVENTS_DRIVER from env object:", env.EVENTS_DRIVER);
