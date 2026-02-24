import "dotenv/config";
import mongoose, { ConnectOptions } from "mongoose";

type MongoConnectOptions = {
  uri?: string;
  isDev?: boolean;
  options?: ConnectOptions;
  shutdownSignals?: NodeJS.Signals[];
};

const DEFAULT_SIGNALS: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

export const connectToMongo = async (opts: MongoConnectOptions = {}) => {
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

    console.log(
      `🟢 Connected to database 🗄️ ${String(mongoose.connection.name).toUpperCase()}`,
    );
  } catch (error: any) {
    console.error("Could not connect to database", error?.message);
    process.exit(1);
  }

  const shutdown = async () => {
    await mongoose.connection.close();
    console.log("Database connection closed");
  };

  const signals = opts.shutdownSignals ?? DEFAULT_SIGNALS;
  signals.forEach((signal) => process.on(signal, shutdown));
};

export default connectToMongo;
