import { catchError } from "../../../utils/catch-error";
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

    return res.json({ ok: true, data });
  });

  remove = catchError(async (req, res) => {
    const data = await service.remove(req.params.id);
    return res.json({ ok: true, data });
  });
}
