import morgan from "morgan";
import cookieParser from "cookie-parser";
import express, { Application } from "express";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";

type MiddlewareInitOptions = {
  cors?: {
    allowlist?: string[];
    allowNoOrigin?: boolean;
    credentials?: boolean;
  };
  disablePoweredBy?: boolean;
  trustProxy?: number | boolean;
  bodyLimit?: string;
  urlencodedLimit?: string;
  helmetOptions?: Parameters<typeof helmet>[0];
};

const buildCorsOptions = (
  corsOptions: MiddlewareInitOptions["cors"]
): CorsOptions => {
  const allowlist = corsOptions?.allowlist ?? [];
  const allowNoOrigin = corsOptions?.allowNoOrigin ?? true;
  const credentials = corsOptions?.credentials ?? true;

  if (allowlist.length === 0) {
    return {
      origin: process.env.CORS_ORIGIN,
      credentials,
    };
  }

  return {
    origin(origin, callback) {
      if (!origin) {
        return allowNoOrigin
          ? callback(null, true)
          : callback(new Error("CORS origin missing"), false);
      }

      if (allowlist.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials,
  };
};

const middlewaresInit = (
  app: Application,
  options: MiddlewareInitOptions = {}
) => {
  const isDev = process.env.NODE_ENV !== "production";
  const bodyLimit = options.bodyLimit ?? "5mb";
  const urlencodedLimit = options.urlencodedLimit ?? "5mb";
  const trustProxy = options.trustProxy ?? 1;

  app.set("trust proxy", trustProxy);
  if (options.disablePoweredBy) {
    app.disable("x-powered-by");
  }

  // 🔒 Helmet (API: CSP souvent inutile, mais ok pour referrer & autres)
  app.use(
    helmet(options.helmetOptions ?? { referrerPolicy: { policy: "no-referrer" } })
  );

  app.use(cors(buildCorsOptions(options.cors)));
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: urlencodedLimit }));

  // 🔒 Logger sécurisé (reqId + censure des secrets)
  if (isDev) {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // 🌐 Locale
  app.use(cookieParser());
};

export type { MiddlewareInitOptions };
export default middlewaresInit;
