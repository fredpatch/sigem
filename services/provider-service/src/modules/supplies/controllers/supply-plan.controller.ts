import { emitSupplyEvent } from "../../../core/events/supply.event";
import { catchError } from "../../../utils/catch-error";
import { getActor } from "../../../utils/get.matricule";
import { getPagination, getUserId } from "../_utils";
import {
  changeSupplyPlanStatusDTO,
  createSupplyPlanDTO,
  updateSupplyPlanDTO,
} from "../schema/supplies.dto";
import { SupplyPlanService } from "../services/supply-plan.service";

const service = new SupplyPlanService();

const convertPlanStatus = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "Brouillon";
    case "SCHEDULED":
      return "Planifié";
    case "WAITING_QUOTE":
      return "En attente de devis";
    case "WAITING_INVOICE":
      return "En attente de facture";
    case "ORDERED":
      return "Commandé";
    case "DELIVERED":
      return "Livré";
    case "COMPLETED":
      return "Terminé";
    case "CANCELLED":
      return "Annulé";
  }
};

export class SupplyPlanController {
  list = catchError(async (req, res) => {
    const { page, limit } = getPagination(req);

    const data = await service.list({
      status: req.query.status?.toString() as any,
      q: req.query.q?.toString(),
      from: req.query.from?.toString(),
      to: req.query.to?.toString(),
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
    const parsed = createSupplyPlanDTO.parse(req.body);
    const createdByUserId = getUserId(req);

    const { id, matriculation, role, username } = getActor(req);

    const data = await service.create({
      createdByUserId,
      scheduledFor: (parsed.scheduledFor as any) ?? null,
      department: (parsed.department as any) ?? null,
      notes: (parsed.notes as any) ?? null,
      lines: (parsed.lines as any) ?? [],
    });

    // Notification
    await emitSupplyEvent("supply.plan.created", {
      severity: "success",
      title: "Plan prévisionnel créé",
      message: `Le plan "${data.reference ?? data._id}" a été créé.`,
      resourceType: "SupplyPlan",
      resourceId: data._id.toString(),
      dept: "MGX",
      userId: id,
      recipients: [], // broadcast rôle MG
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        planId: data._id,
        reference: data.reference,
        status: data.status,
      },
    });

    return res.status(201).json({ ok: true, data });
  });

  update = catchError(async (req, res) => {
    const parsed = updateSupplyPlanDTO.parse(req.body);

    const data = await service.update(req.params.id, {
      scheduledFor: (parsed.scheduledFor as any) ?? null,
      department: (parsed.department as any) ?? null,
      notes: (parsed.notes as any) ?? null,
      lines: (parsed.lines as any) ?? undefined,
    });

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.plan.updated", {
      userId: id,
      recipients: [], // broadcast rôle MG
      severity: "success",
      title: "Plan prévisionnel mis à jour",
      message: `Le plan "${data.reference ?? data._id}" a été mis à jour.`,
      resourceType: "SupplyPlan",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        planId: data._id,
        reference: data.reference,
        status: data.status,
      },
    });

    return res.json({ ok: true, data });
  });

  changeStatus = catchError(async (req, res) => {
    const parsed = changeSupplyPlanStatusDTO.parse(req.body);
    const byUserId = getUserId(req);

    const data = await service.changeStatus({
      id: req.params.id,
      to: parsed.to as any,
      byUserId,
      note: parsed.note,
    });

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.plan.status.changed", {
      userId: id,
      recipients: [], // broadcast rôle MG
      severity: "success",
      title: "Statut du plan prévisionnel mis à jour",
      message: `Le plan "${data.reference ?? data._id}" est maintenant "${convertPlanStatus(data.status)}".`,
      resourceType: "SupplyPlan",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        planId: data._id,
        reference: data.reference,
        status: data.status,
      },
    });

    return res.json({ ok: true, data });
  });

  autoPrice = catchError(async (req, res) => {
    const data = await service.autoPrice(req.params.id);

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.plan.updated", {
      userId: id,
      recipients: [], // broadcast rôle MG
      severity: "success",
      title: "Plan prévisionnel mis à jour, en mode automatique",
      message: `Le prix du plan "${data.reference ?? data._id}" a été mis à jour automatiquement.`,
      resourceType: "SupplyPlan",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        planId: data._id,
        reference: data.reference,
        status: data.status,
      },
    });

    return res.json({ ok: true, data });
  });

  cancel = catchError(async (req, res) => {
    const byUserId = getUserId(req);
    const note = req.body?.note?.toString();

    const data = await service.cancel(req.params.id, byUserId, note);

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.plan.updated", {
      userId: id,
      recipients: [], // broadcast rôle MG
      severity: "success",
      title: "Plan prévisionnel annulé",
      message: `Le plan "${data.reference ?? data._id}" a été annulé.`,
      resourceType: "SupplyPlan",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        planId: data._id,
        reference: data.reference,
        status: data.status,
      },
    });

    return res.json({ ok: true, data });
  });
}
