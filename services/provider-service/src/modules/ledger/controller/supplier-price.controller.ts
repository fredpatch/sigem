import { catchError } from "../../../utils/catch-error";
import { SupplierPriceEntity } from "../../supplies/models/supplier-price.model";
import { toObjectId } from "./stock.controller";

export class SupplierPriceController {
  lookupSupplierPrice = catchError(async (req, res) => {
    const supplierId = toObjectId(req.query.supplierId, "supplierId");
    const itemId = toObjectId(req.query.itemId, "itemId");

    const price = await SupplierPriceEntity.findOne({
      supplierId,
      itemId,
    }).lean();

    if (!price) {
      return res.json({
        data: {
          success: true,
          found: false,
        },
      });
    }

    res.json({
      data: {
        success: true,
        found: true,
        unitPrice: price.unitPrice,
        currency: price.currency,
        source: price.source,
        updatedAt: price.updatedAt,
      },
    });
  });
}
