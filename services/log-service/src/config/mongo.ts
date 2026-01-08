import "dotenv/config";
import mongoose from "mongoose";
import { logger } from "src/common/logger";

// export default async function connectToMongo() {
//   const uri = process.env.MONGO_URL!;
//   if (!uri) throw new Error("MONGO_URL missing");
//   await mongoose.connect(uri);
//   console.log("✅ [Mongo] Connected (notification-service)");
// }

const MONGO_URI = process.env.MONGO_URL!;

export const connectToMongo = async () => {
  const isDev = process.env.NODE_ENV === "development";
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: isDev, // Disable in Prod
      heartbeatFrequencyMS: 10000, // How often to check the status of the connection
      serverSelectionTimeoutMS: 10000, // How long the driver will wait for server selection
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: isDev ? 10 : 50, // Maximum number of sockets available for the connection pool
      minPoolSize: isDev ? 2 : 10, // Minimum number of sockets available for the connection pool
      socketTimeoutMS: 30000, // How long the server will wait for a new connection
      writeConcern: { w: "majority" },
      retryWrites: true, // Enable retryable writes
      family: 4, // Use IPv4, skip trying IPv6
      ssl: !isDev, // Disable SSL
      compressors: "snappy,zlib", // Compress messages using snappy or zlib
      // authMechanism: "SCRAM-SHA-256", // Authentication mechanism to use
    });

    // Verify replica set status
    if (!mongoose.connection.db) {
      throw new Error("Database connection could not be established.");
    }
    const adminDb = mongoose.connection.db.admin();
    // const status = await adminDb.command({ replSetGetStatus: 1 });
    // console.log("Replica set status:", status);
    console.log(
      `🟢 Connected to database 🗄️ ${String(mongoose.connection.name).toUpperCase()}`
    );
  } catch (error: any) {
    console.error("Could not connect to database", error?.message);
    process.exit(1);
  }
};

const shutdown = async () => {
  await mongoose.connection.close();
  console.log("Database connection closed");
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default connectToMongo;
