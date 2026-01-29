import { emitSupplyEvent } from "../../../core/events/supply.event";
import { catchError } from "../../../utils/catch-error";
import { getActor } from "../../../utils/get.matricule";
import { getPagination } from "../_utils";
import { upsertSupplierPriceDTO } from "../schema/supplies.dto";
import { SupplierPriceService } from "../services/supplier-price.service";

const service = new SupplierPriceService();

export class SupplierPriceController {
  list = catchError(async (req, res) => {
    const { page, limit } = getPagination(req);

    const data = await service.list({
      supplierId: req.query.supplierId?.toString(),
      itemId: req.query.itemId?.toString(),
      page,
      limit,
    });

    return res.json({ ok: true, data });
  });

  getById = catchError(async (req, res) => {
    const data = await service.getById(req.params.id);
    return res.json({ ok: true, data });
  });

  /**
   * Upsert recommandé pour éviter doublons (supplierId,itemId unique)
   */
  upsert = catchError(async (req, res) => {
    const parsed = upsertSupplierPriceDTO.parse(req.body);
    const data = await service.upsert(parsed as any);

    const { id, matriculation, role, username } = getActor(req);

    // Notification
    await emitSupplyEvent("supply.price.updated", {
      userId: id,
      recipients: [], // broadcast rôle MG
      severity: "success",
      title: "Prix fournisseur mis à jour",
      message: `Le prix fournisseur a été mis à jour à ${data.unitPrice}.`,
      resourceType: "SupplyPrice",
      resourceId: data._id.toString(),
      dept: "MGX",
      actor: {
        userId: id,
        role: role,
        name: username,
        matriculation: matriculation,
      },
      data: {
        priceId: data._id,
        itemId: data.itemId,
        unitPrice: data.unitPrice,
      },
    });

    return res.status(201).json({ ok: true, data });
  });

  update = catchError(async (req, res) => {
    // update partiel
    const unitPrice =
      req.body.unitPrice === undefined ? undefined : Number(req.body.unitPrice);

    const data = await service.update(req.params.id, {
      unitPrice,
      source: req.body.source,
    });

    await emitSupplyEvent("supply.price.updated", {
      severity: "info",
      title: "Prix mis à jour",
      message: `Prix mis à jour pour l'article "${data.itemId}".`,
      resourceType: "SupplyPrice",
      resourceId: data._id.toString(),
      data: {
        itemId: data.itemId,
        oldPrice: unitPrice,
        newPrice: data.unitPrice,
      },
    });

    return res.json({ ok: true, data });
  });

  remove = catchError(async (req, res) => {
    const data = await service.remove(req.params.id);
    return res.json({ ok: true, data });
  });
}
