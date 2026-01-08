import { Request, Response } from "express";
import { AssetService } from "../services/asset.service";
import { getEventBus } from "src/core/events";
import { KAFKA_TOPICS } from "@sigem/shared";
import { getActor } from "src/utils/get-actor";
import { catchError } from "src/utils/catch-error";

export const AssetController = {
  list: catchError(async (req, res) => {
    const { search, categoryId, locationId, situation, page, limit, includeDeleted } =
      req.query;


    // ✅ boolean parse
    const wantIncludeDeleted = String(includeDeleted) === "true";

    // Admin peut voir tout, les autres pas
    // const isAdmin = getActor(req).role === "ADMIN" || getActor(req).role === "SUPER_ADMIN";
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";

    const data = await AssetService.list({
      search: search as string,
      categoryId: categoryId as string,
      locationId: locationId as string,
      situation: situation as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,

      includeDeleted: wantIncludeDeleted && isAdmin,
    });
    res.status(200).json(data);
  }),

  get: catchError(async (req, res) => {
    const item = await AssetService.getById(req.params.id);
    if (!item) return res.status(404).json({ message: "Asset not found" });
    res.json(item);
  }),

  create: catchError(async (req, res) => {
    // console.log("ASSET CREATE CONTROLLER");
    const request = req.body;
    const created = await AssetService.create(request);
    const actor = getActor(req);

    // -- notifier (NoOp for now)
    await getEventBus().emit(KAFKA_TOPICS.ASSET_CREATED, {
      actorId: actor.id,
      actorName: actor.username,
      actorSessionId: actor.sessionId,
      role: actor.role,

      assetId: created._id.toString(),
      categoryId: created.categoryId?.toString(),
      locationId: created.locationId?.toString(),
      label: created.label,
      timestamp: new Date().toISOString(),
      severity: "success",
      recipients: [], // vide = broadcast rôle (géré côté notif svc)
    });

    res.status(201).json(created);
  }),

  update: catchError(async (req, res) => {
    const actor = getActor(req);

    // 1) charger avant (pour diff)
    const before = await AssetService.getRawById(req.params.id);

    const saved = await AssetService.update(req.params.id, req.body);
    if (!saved) return res.status(404).json({ message: "Asset not found" });

    // 2) détecter les changements clés
    const locationChanged = String(before?.locationId) !== String(saved.locationId);
    const statusChanged = before?.situation !== saved.situation;
    const quantityChanged = (before?.quantity ?? 0) !== (saved.quantity ?? 0);

    // -- notifier (NoOp for now)
    // await getEventBus().emit(KAFKA_TOPICS.ASSET_UPDATED, {
    //   actorId: actor.id,
    //   actorName: actor.username,
    //   actorSessionId: actor.sessionId,
    //   role: actor.role,

    //   assetId: updated?.id,
    //   categoryId: updated?.categoryId,
    //   locationId: updated?.locationId,
    //   label: updated?.label,
    //   timestamp: new Date().toISOString(),
    //   severity: "success",
    //   recipients: [], // vide = broadcast rôle (géré côté notif svc)
    // });

    await getEventBus().emit(KAFKA_TOPICS.ASSET_UPDATED, {
      assetId: saved._id.toString(),
      label: saved.label,
      code: saved.code,
      userId: actor?.id,
      role: actor?.role,
      severity: "warning",

      fromLocationId: locationChanged ? String(before?.locationId) : undefined,
      toLocationId: locationChanged ? String(saved.locationId) : undefined,

      fromStatus: statusChanged ? before?.situation : undefined,
      toStatus: statusChanged ? saved.situation : undefined,

      fromQuantity: quantityChanged ? (before?.quantity ?? 0) : undefined,
      toQuantity: quantityChanged ? (saved.quantity ?? 0) : undefined,
    });

    res.json(saved);
  }),

  remove: catchError(async (req, res) => {

    const actor = getActor(req);
    const before = await AssetService.getRawById(req.params.id);

    const deleted = await AssetService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Asset not found" });

    await getEventBus().emit(KAFKA_TOPICS.ASSET_UPDATED, {
      assetId: deleted._id.toString(),
      label: before?.label ?? deleted.label,
      code: (before as any)?.code ?? (deleted as any).code,
      userId: actor?.id,
      role: actor?.role,
      severity: "critical",
    });

    res.json({ data: deleted, success: true, message: "Asset deleted" });

  }),

  restore: catchError(async (req, res) => {
    const id = req.params.id;

    const actor = getActor(req);

    const before = await AssetService.getRawById(req.params.id);

    const restored = await AssetService.restore(id);

    await getEventBus().emit(KAFKA_TOPICS.ASSET_UPDATED, {
      assetId: restored?.id.toString(),
      label: before?.label ?? restored?.label,
      code: (before as any)?.code ?? (restored as any).code,
      userId: actor?.id,
      role: actor?.role,
      severity: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Asset restored",
      data: restored,
    });
  }),

  async previewCode(req: Request, res: Response) {
    const { categoryId, locationId } = req.query;
    try {
      // ⚠️ ne pas consommer la séquence ici (pas de nextSequence)
      // juste calculer F, B, S et renvoyer prefix + "next?" côté UI
      // Pour un vrai "reserve", il faut un endpoint dédié avec rollback possible.
      res.json({
        suggestion: "EAS-???",
        note: "Sequence not reserved in preview",
      });
    } catch (e) {
      res.status(400).json({ message: "Cannot preview code" });
    }
  },
};
