import { Router } from "express";
import { listLogs } from "src/controllers/log.controller";

export const routes = Router();

routes.get("/", listLogs); // GET /v1/logs
