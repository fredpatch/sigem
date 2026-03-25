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
  corsOptions: MiddlewareInitOptions["cors"],
): CorsOptions => {
  const isDev = process.env.NODE_ENV !== "production";

  const allowlist = corsOptions?.allowlist ?? [];
  const allowNoOrigin = corsOptions?.allowNoOrigin ?? true;
  const credentials = corsOptions?.credentials ?? true;

  return {
    origin(origin, callback) {
      // ✅ Allow non-browser clients (curl, Postman, internal services)
      if (!origin) {
        return allowNoOrigin
          ? callback(null, true)
          : callback(new Error("CORS origin missing"), false);
      }

      // 🔥 DEV MODE: allow everything useful automatically
      if (isDev) {
        if (
          origin.includes("localhost") ||
          origin.includes("127.0.0.1") ||
          origin.includes("0.0.0.0") ||
          origin.includes("100.") // ✅ Tailscale range
        ) {
          return callback(null, true);
        }

        // 👉 Optional: allow ALL in dev (simplifies debugging)
        return callback(null, true);
      }

      // 🔒 PROD MODE: strict allowlist only
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
  options: MiddlewareInitOptions = {},
) => {
  const isDev = process.env.NODE_ENV !== "production";
  const bodyLimit = options.bodyLimit ?? "5mb";
  const urlencodedLimit = options.urlencodedLimit ?? "5mb";
  const trustProxy = options.trustProxy ?? 1;

  app.set("trust proxy", trustProxy);

  if (options.disablePoweredBy) {
    app.disable("x-powered-by");
  }

  // 🔒 Security headers
  app.use(
    helmet(
      options.helmetOptions ?? {
        referrerPolicy: { policy: "no-referrer" },
      },
    ),
  );

  // 🌐 CORS
  app.use(cors(buildCorsOptions(options.cors)));

  // 📦 Body parsing
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: urlencodedLimit }));

  // 🧾 Logging
  app.use(morgan(isDev ? "dev" : "combined"));

  // 🍪 Cookies
  app.use(cookieParser());
};

export type { MiddlewareInitOptions };
export default middlewaresInit;
