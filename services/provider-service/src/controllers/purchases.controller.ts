import { validate } from "../core/http/validate";
import { PurchasesService } from "../services/purchases.service";
import { catchError } from "../utils/catch-error";
import {
  createPurchaseSchema,
  listPurchasesQuerySchema,
  updatePurchaseSchema,
} from "../validators/purchases.schema";

class PurchasesController {
  // Controller methods would be defined here
  private purchasesService = new PurchasesService();

  create = catchError(async (req, res) => {
    const body = validate(createPurchaseSchema, req.body);
    const data = await this.purchasesService.createPurchase(body as any);
    res.status(data.status).json(data);
  });

  update = catchError(async (req, res) => {
    const body = validate(updatePurchaseSchema, req.body);
    const { id } = req.params;
    const data = await this.purchasesService.updatePurchase(id, body as any);
    res.status(data.status).json(data);
  });

  confirm = catchError(async (req, res) => {
    const { id } = req.params;
    const data = await this.purchasesService.confirmPurchase(id);
    res.status(data.status).json(data);
  });

  getOne = catchError(async (req, res) => {
    const data = await this.purchasesService.getPurchaseDetail(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.status(data.status).json(data);
  });

  list = catchError(async (req, res) => {
    const q = validate(listPurchasesQuerySchema, req.query);
    const data = await this.purchasesService.listPurchases(q);
    res.status(data.status).json(data);
  });

  cancel = catchError(async (req, res) => {
    const data = await this.purchasesService.cancelPurchase(req.params.id);
    res.status(data.status).json(data);
  });
}

export const purchasesController = new PurchasesController();
