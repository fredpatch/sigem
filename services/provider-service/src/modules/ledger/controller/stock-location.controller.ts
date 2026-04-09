import { Types } from "mongoose";
import {
  ensureDefaultStockLocation,
  getStockLocations,
} from "../services/stock-location.service";
import { catchError, getActor } from "@sigem/shared";

export class StockLocationController {
  initStockLocations = catchError(async (req, res) => {
    const { id } = getActor(req);
    const orgId = new Types.ObjectId(id);

    const location = await ensureDefaultStockLocation({ orgId });

    res.status(201).json({
      success: true,
      data: location,
    });
  });

  getStockLocations = catchError(async (req, res) => {
    const location = await getStockLocations();

    res.status(201).json({
      success: true,
      data: location,
    });
  });
}
