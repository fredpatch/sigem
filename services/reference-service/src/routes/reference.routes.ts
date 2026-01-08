import { Router } from "express";
import { referenceController } from "../controllers/reference.controller";

export const referenceRouter = Router();

/**
 * GET /v1/references?dept=MG&resource=vehicle&field=brand&q=to&limit=10
 */
referenceRouter.get("/references", referenceController.suggestions)
/**
 * POST /v1/references/upsert
 * body: { dept, resource, field, value }
*/
referenceRouter.post("/references/upsert", referenceController.upsert)