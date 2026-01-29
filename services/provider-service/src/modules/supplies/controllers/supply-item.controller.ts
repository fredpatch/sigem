import { emitSupplyEvent } from "../../../core/events/supply.event";
import { catchError } from "../../../utils/catch-error";
import { getActor } from "../../../utils/get.matricule";
import { getPagination } from "../_utils";
import {
  createSupplyItemDTO,
  updateSupplyItemDTO,
} from "../schema/supplies.dto";
import { SupplyItemService } from "../services/supply-item.service";

const service = new SupplyItemService();

export class SupplyItemController {
  list = catchError(async (req, res) => {
    const { page, limit } = getPagination(req);
    const active =
      req.query.active === undefined
        ? undefined
        : String(req.query.active) === "true";

    const data = await service.list({
      search: req.query.search?.toString(),
      active,
      page,
      limit,
    });

    return res.json({ ok: true, data });
  });

  getById = catchError(async (req, res) => {
    const data = await service.getById(req.params.id);
    return res.json({ ok: true, data });
  });

  create = catchError(async (req, res) => {
    const parsed = createSupplyItemDTO.parse(req.body);
    const data = await service.create(parsed as any);

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.item.created", {
      severity: "success",
      title: "Article créé",
      message: `Un article a été créé${data.label ? ` : "${data.label}"` : ""}${data._id ? ` (#${data._id})` : ""}.`,
      resourceType: "SupplyItem",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        itemId: data._id,
        reference: data.labelNormalized,
        status: data.active ? "active" : "inactive",
      },
    });

    return res.status(201).json({ ok: true, data });
  });

  update = catchError(async (req, res) => {
    const parsed = updateSupplyItemDTO.parse(req.body);
    const data = await service.update(req.params.id, parsed as any);

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.item.updated", {
      severity: "success",
      title: "Article mis à jour",
      message: `Un article a été mis à jour${data.label ? ` : "${data.label}"` : ""}${data._id ? ` (#${data._id})` : ""}.`,
      resourceType: "SupplyItem",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        itemId: data._id,
        reference: data.labelNormalized,
        status: data.active ? "active" : "inactive",
      },
    });

    return res.json({ ok: true, data });
  });

  disable = catchError(async (req, res) => {
    const data = await service.disable(req.params.id);

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.item.deactivated", {
      userId: id,
      recipients: [], // broadcast rôle MG
      severity: "success",
      title: "Article désactivé",
      message: `Un article a été désactivé${data.label ? ` : "${data.label}"` : ""}${data._id ? ` (#${data._id})` : ""}.`,
      resourceType: "SupplyItem",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        itemId: data._id,
        reference: data.labelNormalized,
        status: data.active ? "active" : "inactive",
      },
    });

    return res.json({ ok: true, data });
  });

  enable = catchError(async (req, res) => {
    const data = await service.enable(req.params.id);

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.item.activated", {
      userId: id,
      recipients: [], // broadcast rôle MG
      severity: "success",
      title: "Article réactivé",
      message: `Un article a été réactivé${data.label ? ` : "${data.label}"` : ""}${data._id ? ` (#${data._id})` : ""}.`,
      resourceType: "SupplyItem",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        itemId: data._id,
        reference: data.labelNormalized,
        status: data.active ? "active" : "inactive",
      },
    });

    return res.json({ ok: true, data });
  });
}
