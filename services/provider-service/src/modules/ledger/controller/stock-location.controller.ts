import { Types } from "mongoose";
import { catchError } from "../../../utils/catch-error";
import { getActor } from "../../../utils/get.matricule";
import {
  ensureDefaultStockLocation,
  getStockLocations,
} from "../services/stock-location.service";

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
