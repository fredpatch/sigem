// src/controllers/log.controller.ts
import { Request, Response } from "express";
import { LogEntryModel } from "../models/log-entry.model";

export async function listLogs(req: Request, res: Response) {
  const {
    q,
    type,
    resourceType,
    resourceId,
    severity,
    from,
    to,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  const filter: any = {};
  if (type) filter.type = type;
  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = resourceId;
  if (severity) filter.severity = severity;
  if (from || to)
    filter.createdAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lt: new Date(to) } : {}),
    };
  if (q) filter.$text = { $search: q }; // ajouter index texte si besoin

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100);

  const cursor = LogEntryModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const [items, total] = await Promise.all([
    cursor.exec(),
    LogEntryModel.countDocuments(filter),
  ]);

  res.json({ items, page: pageNum, limit: limitNum, total });
}
