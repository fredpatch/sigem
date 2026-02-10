import { catchError } from "../../../utils/catch-error";
import { getActor } from "../../../utils/get.matricule";
import { StockMovementModel } from "../models/stock-movement.model";
import { StockKpiService } from "../services/stock-kpi.service";
import { StockService } from "../services/stock.service";
import { Types } from "mongoose";

export function toObjectId(v: any, field: string) {
  if (!v || typeof v !== "string" || !Types.ObjectId.isValid(v)) {
    const err: any = new Error(`${field} must be a valid ObjectId`);
    err.status = 400;
    throw err;
  }
  return new Types.ObjectId(v);
}

export function toBool(v: any) {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export function toInt(v: any, def: number) {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : def;
}

const service = new StockService();
const kpiService = new StockKpiService();

export class StockController {
  // GET /v1/stock?locationId=...&search=...&belowMin=true&limit=50
  listStocks = catchError(async (req, res) => {
    const locationId = toObjectId(req.query.locationId, "locationId");
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const belowMin = toBool(req.query.belowMin);
    const limit = toInt(req.query.limit, 50);

    // orgId / createdBy from auth context (MG-friendly)
    const { id } = getActor(req);

    const data = await service.listStock({
      //   orgId: new Types.ObjectId(id),
      locationId,
      search,
      belowMin,
      limit,
    });

    res.json({ success: true, data: data });
  });

  // GET /v1/stock/movements?locationId=...&supplyItemId=...&type=IN&search=...&page=1&limit=25
  listMovements = catchError(async (req, res) => {
    // orgId / createdBy from auth context (MG-friendly)
    // const { id: orgId } = getActor(req);

    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 25), 1), 100);
    const skip = (page - 1) * limit;

    const filter: any = {
      // ...(orgId ? { orgId } : {}),
    };

    if (req.query.locationId)
      filter.locationId = toObjectId(req.query.locationId, "locationId");
    if (req.query.supplyItemId)
      filter.supplyItemId = toObjectId(req.query.supplyItemId, "supplyItemId");
    if (req.query.type) filter.type = String(req.query.type);

    // recherche texte sur reason/refType (index text)
    const search =
      typeof req.query.search === "string" && req.query.search.trim()
        ? req.query.search.trim()
        : undefined;
    if (search) filter.$text = { $search: search };

    // console.log("listMovements filter", filter, { page, limit, skip });

    const [items, total] = await Promise.all([
      StockMovementModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("supplyItemId")
        .populate("providerId")
        .lean(),
      StockMovementModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  // POST /v1/stock/movements
  createMovement = catchError(async (req, res) => {
    const body = req.body || {};

    // orgId / createdBy from auth context (MG-friendly)
    const { id: orgId } = getActor(req);

    const createdBy =
      (req as any).user?._id && Types.ObjectId.isValid((req as any).user._id)
        ? new Types.ObjectId((req as any).user._id)
        : undefined;

    const input = {
      orgId,
      createdBy: orgId, // createdBy || new Types.ObjectId(id), // fallback to orgId if createdBy is not available (ex: script)

      type: String(body.type),
      supplyItemId: toObjectId(body.supplyItemId, "supplyItemId"),
      locationId: toObjectId(body.locationId, "locationId"),

      qty: body.qty !== undefined ? Number(body.qty) : undefined,
      countedQty:
        body.countedQty !== undefined ? Number(body.countedQty) : undefined,

      unitCost: body.unitCost !== undefined ? Number(body.unitCost) : undefined,
      providerId: body.providerId
        ? toObjectId(body.providerId, "providerId")
        : undefined,

      refType: body.refType ? String(body.refType) : undefined,
      refId: body.refId ? toObjectId(body.refId, "refId") : undefined,

      reason: body.reason ? String(body.reason) : undefined,
    } as any;

    const result = await service.createStockMovement(input, {
      blockNegative: true,
    });

    res.status(201).json({ success: true, data: result });
  });

  getKpis = catchError(async (req, res) => {
    const { locationId } = req.query as any;

    const data = await kpiService.getStockKpis({ locationId: locationId });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "KPIs not found for the specified location",
      });
    }

    res.json({ success: true, data });
  });

  setLevel = catchError(async (req, res) => {
    const { locationId, minLevel, supplyItemId } = req.body;

    const doc = await service.setStockMinLevel({
      locationId: toObjectId(locationId, "locationId"),
      supplyItemId: toObjectId(supplyItemId, "supplyItemId"),
      minLevel: Number(minLevel),
    });

    if (!doc) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Stock item not found for the specified location and supply item",
        });
    }

    res.json({ success: true, data: doc });
  });
}
