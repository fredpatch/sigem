import { listLogs } from "@/controllers/log.controller";
import { Router } from "express";

export const routes = Router();

routes.get("/", listLogs); // GET /v1/logs
