import { Router } from "express";
import mongoose from "mongoose";
import { getEventBus } from "../core/events";
export const router = Router();

router.get("/", (_req, res) => {
  let kafkaConnected = false;

  try {
    const bus = getEventBus();
    kafkaConnected =
      typeof bus.isConnected === "function" ? !!bus.isConnected() : false;
  } catch {}
  res.json({
    name: "SIGEM API Gateway",
    kafka: { connected: kafkaConnected },
    mongo: { connected: mongoose.connection.readyState === 1 },
    uptime: process.uptime(),
    ts: new Date().toISOString(),
    version: "v1",
  });
});
