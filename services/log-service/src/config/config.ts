import "dotenv/config";

export const CONFIG = {
  port: parseInt(process.env.PORT ?? "4004", 10),
  env: process.env.NODE_ENV ?? "development",
  mongoUrl: process.env.MONGO_URL!,
  kafka: {
    broker: process.env.KAFKA_BROKERS!,
    clientId: process.env.KAFKA_CLIENT_ID ?? "sigem-log-svc",
    groupId: process.env.KAFKA_GROUP_ID ?? "sigem-log-svc",
  },
};
