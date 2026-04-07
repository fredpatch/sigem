import "dotenv/config";
import mongoose, { ConnectOptions } from "mongoose";

let isConnected = false;

type MongoConnectOptions = {
  uri?: string;
  isDev?: boolean;
  options?: ConnectOptions;
  shutdownSignals?: NodeJS.Signals[];
};

const DEFAULT_SIGNALS: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

function deriveLocalFallbackUri(primaryUri: string): string {
  try {
    const url = new URL(primaryUri);
    const dbName =
      url.pathname.replace(/^\//, "").split("?")[0] || "sigem_local";
    return `mongodb://localhost:27017/${dbName}`;
  } catch {
    return "mongodb://localhost:27017/sigem_local";
  }
}

export const connectToMongo = async (
  opts: MongoConnectOptions = {},
  fallbackUri?: string,
) => {
  if (isConnected) return;

  const isDev = opts.isDev ?? process.env.NODE_ENV === "development";
  const uri = opts.uri ?? process.env.MONGO_URL;

  if (!uri) {
    throw new Error("MONGO_URL missing");
  }

  const connectOptions: ConnectOptions = {
    autoIndex: isDev,
    heartbeatFrequencyMS: 10000,
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
    maxPoolSize: isDev ? 10 : 50,
    minPoolSize: isDev ? 2 : 10,
    socketTimeoutMS: 30000,
    writeConcern: { w: "majority" },
    retryWrites: true,
    family: 4,
    ssl: !isDev,
    compressors: "snappy,zlib",
    ...opts.options,
  };

  try {
    await mongoose.connect(uri, connectOptions);

    if (!mongoose.connection.db) {
      throw new Error("Database connection could not be established.");
    }

    isConnected = true;
    console.log("[database] Connected to primary MongoDB instance");
  } catch (primaryError) {
    const fallback = fallbackUri ?? deriveLocalFallbackUri(uri);

    console.warn(
      `[database] Attempting to connect to fallback MongoDB instance: ${fallback}`,
    );

    await mongoose.connect(fallback, connectOptions);

    isConnected = true;
    console.log("[database] Connected to fallback MongoDB instance");
  }

  const shutdown = async () => {
    await mongoose.connection.close();
    isConnected = false;
    console.log("Database connection closed");
  };

  const signals = opts.shutdownSignals ?? DEFAULT_SIGNALS;
  signals.forEach((signal) => process.on(signal, shutdown));
};

export default connectToMongo;
