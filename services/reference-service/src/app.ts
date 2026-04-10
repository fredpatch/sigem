import express from "express";
import cors from "cors";
import { referenceRouter } from "./routes/reference.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import morgan from "morgan";

export const app = express()

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/v1/health", (_req, res) => {
  res.json({
    name: "reference-service",
    status: "ok",
    ts: new Date().toISOString(),
    version: "v1",
  });
});

app.use("/v1", referenceRouter);

// 404
app.use((_req, res) => res.status(404).json({ ok: false, message: "Not found" }));

// errors
app.use(errorMiddleware);
