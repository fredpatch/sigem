import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import { getEventBus } from "src/core/events";
import { KAFKA_TOPICS } from "@sigem/shared";
import { getActor } from "src/utils/get-actor";

export const LocationController = {
  async list(req: Request, res: Response) {
    const { search, localisation, batiment, direction, bureau, page, limit } =
      req.query;
    const data = await LocationService.list({
      search: search as string,
      localisation: localisation as string,
      batiment: batiment as string,
      direction: direction as string,
      bureau: bureau as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(data);
  },

  async get(req: Request, res: Response) {
    const item = await LocationService.getById(req.params.id);
    if (!item) return res.status(404).json({ message: "Location not found" });
    res.json(item);
  },

  async create(req: Request, res: Response) {
    try {

      const actor = getActor(req);
      const created = await LocationService.create(req.body);

      // -- notifier (NoOp for now)
      await getEventBus().emit(KAFKA_TOPICS.ASSET_CREATED, {
        actorId: actor.id,
        actorName: actor.username,
        actorSessionId: actor.sessionId,
        role: actor.role,

        assetId: created._id.toString(),
        locationId: created._id?.toString(),
        bureau: created.bureau,
        timestamp: new Date().toISOString(),
        severity: "success",
        recipients: [], // vide = broadcast rôle (géré côté notif svc)
      });

      res.status(201).json(created);
    } catch (e: any) {
      // Duplicate unique (combo 4 champs)
      if (e?.code === 11000)
        return res
          .status(409)
          .json({ message: "Location already exists", key: e.keyValue });
      res.status(400).json({ message: e.message || "Create location failed" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const updated = await LocationService.update(req.params.id, req.body);
      if (!updated)
        return res.status(404).json({ message: "Location not found" });
      res.json(updated);
    } catch (e: any) {
      if (e?.code === 11000)
        return res
          .status(409)
          .json({ message: "Location already exists", key: e.keyValue });
      res.status(400).json({ message: e.message || "Update location failed" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const deleted = await LocationService.remove(req.params.id);
      if (!deleted)
        return res.status(404).json({ message: "Location not found" });
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Delete location failed" });
    }
  },
};
