import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { userFromHeaders } from "./user-from-headers";
import cookieParser from "cookie-parser";
import { AppError } from "src/utils/error";
import AppErrorCode from "src/constant/constant";

const middlewaresInit = (app: Application) => {
  const isDev = process.env.NODE_ENV !== "production";
  const APP_ORIGIN = process.env.APP_ORIGIN;

  app.set("trust proxy", 1);
  app.disable("x-powered-by"); // 🔒 masque la signature express

  // 🔒 Helmet (API: CSP souvent inutile, mais ok pour referrer & autres)
  app.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin === APP_ORIGIN) {
          callback(null, true);
        } else {
          console.log(`Origin not allowed: ${origin}`);
          callback(
            new AppError(
              403,
              "Not allowed by CORS",
              AppErrorCode.INSUFFICIENT_PERMISSIONS
            )
          );
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: false, limit: "5mb" }));
  app.use(userFromHeaders);

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
