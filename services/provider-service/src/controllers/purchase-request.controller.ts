import { validate } from "../core/http/validate";
import { PurchaseRequestsService } from "../services/purchase-requests.service";
import { catchError } from "../utils/catch-error";
import {
  createPurchaseRequestSchema,
  listPurchaseRequestsQuerySchema,
  transitionSchema,
} from "../validators/purchase-request.schema";

class PurchaseRequestController {
  private purchaseRequestService = new PurchaseRequestsService();

  createRequest = catchError(async (req, res) => {
    const body = validate(createPurchaseRequestSchema, req.body);
    const data = await this.purchaseRequestService.createRequest(body as any);
    res.status(data.status).json(data);
  });

  list = catchError(async (req, res) => {
    const q = validate(listPurchaseRequestsQuerySchema, req.query);
    const data = await this.purchaseRequestService.listRequests(q);
    res.status(data.status).json(data);
  });

  details = catchError(async (req, res) => {
    const data = await this.purchaseRequestService.getRequestDetail(
      req.params.id
    );
    if (!data) return res.status(404).json({ error: "Not found" });
    res.status(data.status).json(data);
  });

  transition = catchError(async (req, res) => {
    const body = validate(transitionSchema, req.body);
    const user = req.user?.id as any;
    const data = await this.purchaseRequestService.transitionRequest(
      req.params.id,
      body.action,
      user
    );
    res.status(data.status).json(data);
  });

  convertToPurchase = catchError(async (req, res) => {
    const body = req.body ?? {};
    const data = await this.purchaseRequestService.convertRequestToPurchase(
      req.params.id,
      body
    );
    if (!data) return res.status(404).json({ error: "Not found" });
    res.status(data.status).json(data);
  });
}

export const purchaseRequestController = new PurchaseRequestController();
