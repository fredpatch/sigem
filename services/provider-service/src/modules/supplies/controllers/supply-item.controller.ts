import { catchError } from "../../../utils/catch-error";
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
    return res.status(201).json({ ok: true, data });
  });

  update = catchError(async (req, res) => {
    const parsed = updateSupplyItemDTO.parse(req.body);
    const data = await service.update(req.params.id, parsed as any);
    return res.json({ ok: true, data });
  });

  disable = catchError(async (req, res) => {
    const data = await service.disable(req.params.id);
    return res.json({ ok: true, data });
  });

  enable = catchError(async (req, res) => {
    const data = await service.enable(req.params.id);
    return res.json({ ok: true, data });
  });
}
