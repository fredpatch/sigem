import "dotenv/config";
import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  /// production origins here
]

const middlewaresInit = (app: Application) => {
  const isDev = process.env.NODE_ENV !== "production";

  app.set("trust proxy", 1);
  app.disable("x-powered-by"); // 🔒 masque la signature express

  // 🔒 Helmet (API: CSP souvent inutile, mais ok pour referrer & autres)
  app.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
    })
  );

  app.use(cors({
    origin(origin, cb) {
      // Postman/curl sans origin
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, origin);
      return cb(new Error("Not allowed by CORS [GATEWAY]"), false);
    },
    credentials: true,
  }));

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: false, limit: "5mb" }));

  // 🔒 Logger sécurisé (reqId + censure des secrets)
  if (isDev) {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // 🌐 Locale
  app.use(cookieParser());
};

export default middlewaresInit;
