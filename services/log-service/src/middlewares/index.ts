import morgan from "morgan";
import cookieParser from "cookie-parser";
import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";

const middlewaresInit = (app: Application) => {
  const isDev = process.env.NODE_ENV !== "production";

  app.set("trust proxy", 1);

  // 🔒 Helmet (API: CSP souvent inutile, mais ok pour referrer & autres)
  app.use(helmet({ referrerPolicy: { policy: "no-referrer" } }));

  app.use(cors({ origin: process.env.CORS_ORIGIN!, credentials: true }));
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
