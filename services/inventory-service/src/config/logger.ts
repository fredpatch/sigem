import pino from "pino";
import { env } from "./env";

export const logger = pino({
  name: env.SERVICE_NAME,
  level: env.NODE_ENV === "production" ? "info" : "debug",
});
