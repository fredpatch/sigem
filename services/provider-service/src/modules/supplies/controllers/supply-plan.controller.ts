import { catchError } from "../../../utils/catch-error";
import { getPagination, getUserId } from "../_utils";
import {
  changeSupplyPlanStatusDTO,
  createSupplyPlanDTO,
  updateSupplyPlanDTO,
} from "../schema/supplies.dto";
import { SupplyPlanService } from "../services/supply-plan.service";

const service = new SupplyPlanService();

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

    const data = await service.create({
      createdByUserId,
      scheduledFor: (parsed.scheduledFor as any) ?? null,
      department: (parsed.department as any) ?? null,
      notes: (parsed.notes as any) ?? null,
      lines: (parsed.lines as any) ?? [],
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

    return res.json({ ok: true, data });
  });

  autoPrice = catchError(async (req, res) => {
    const data = await service.autoPrice(req.params.id);
    return res.json({ ok: true, data });
  });

  cancel = catchError(async (req, res) => {
    const byUserId = getUserId(req);
    const note = req.body?.note?.toString();

    const data = await service.cancel(req.params.id, byUserId, note);
    return res.json({ ok: true, data });
  });
}
