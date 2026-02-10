import { validate } from "../core/http/validate";
import { ProviderModel } from "../models/provider.model";
import { ProviderService } from "../services/provider.service";
import { CommitMode, CommitRow, normalizeRowData } from "../types/types";
import { catchError } from "../utils/catch-error";
import { parseTabularFile } from "../utils/import/parse-tabular-file";
import { buildProvidersBulkOps } from "../utils/import/providers.commit.bulk";
import { matchProviders } from "../utils/import/providers.match";
import {
  applyDesignationFallback,
  mergeContinuationRows,
} from "../utils/import/providers.merge";
import { buildProviderPreviewRows } from "../utils/import/providers.normalize";
import { buildProvidersCommitPlan } from "../utils/import/providers.commit.plan";
import {
  CreateProviderSchema,
  ListProvidersQuerySchema,
  providerCatalogQuerySchema,
  ProviderIdParamSchema,
  UpdateProviderSchema,
} from "../validators/provider.schema";

const pickCounts = (bulk: any) => ({
  insertedCount: bulk.insertedCount ?? 0,
  matchedCount: bulk.matchedCount ?? 0,
  modifiedCount: bulk.modifiedCount ?? 0,
  upsertedCount: bulk.upsertedCount ?? 0,
});

function getInsertedIdMap(bulk: any): Record<number, string> {
  // mongoose/mongo variations
  const raw = bulk?.insertedIds ?? bulk?.getInsertedIds?.() ?? {};
  // raw peut être: { "0": ObjectId("...") }
  const out: Record<number, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[Number(k)] = String((v as any)?._id ?? v);
  }
  return out;
}

class ProviderController {
  private providerService = new ProviderService();

  create = catchError(async (req, res) => {
    const payload = validate(CreateProviderSchema, req.body);
    const provider = await this.providerService.create(payload);

    res.status(201).json(provider);
  });

  getOne = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);
    const provider = await this.providerService.findById(id);

    res.status(200).json(provider);
  });

  update = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);
    const payload = validate(UpdateProviderSchema, req.body);

    const provider = await this.providerService.update(id, payload);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  });

  disable = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);

    const provider = await this.providerService.disable(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  });

  activate = catchError(async (req, res) => {
    const { id } = validate(ProviderIdParamSchema, req.params);

    const provider = await this.providerService.activate(id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  });

  list = catchError(async (req, res) => {
    // const query = validate(ListProvidersQuerySchema, req.query);
    const query = validate(ListProvidersQuerySchema, req.query);
    const result = await this.providerService.list(query);
    res.json(result);
  });

  stats = catchError(async (req, res) => {
    const stats = await this.providerService.stats();
    res.json(stats);
  });

  catalog = catchError(async (req, res) => {
    const q = validate(providerCatalogQuerySchema, req.query);
    const data = await this.providerService.catalog({
      providerId: req.params.providerId,
      ...q,
    });
    res.status(data.status).json(data);
  });

  importPreview = catchError(async (req, res) => {
    const file = req.file;
    if (!file)
      return res.status(400).json({ ok: false, message: "file requis" });

    const mapping = req.body?.mapping ? JSON.parse(req.body.mapping) : null;
    if (!mapping)
      return res.status(400).json({ ok: false, message: "mapping requis" });

    const { rows, headers } = parseTabularFile(file.buffer, file.originalname);

    let previewRows = buildProviderPreviewRows(rows, mapping);
    previewRows = mergeContinuationRows(previewRows);
    previewRows = applyDesignationFallback(previewRows);

    const validCount = previewRows.filter((r) => r.errors.length === 0).length;
    const errorCount = previewRows.length - validCount;

    const matches = await matchProviders(
      previewRows.filter((r) => r.errors.length === 0),
    );

    return res.json({
      data: {
        ok: true,
        meta: {
          headers,
          total: previewRows.length,
          valid: validCount,
          invalid: errorCount,
        },
        rows: previewRows.slice(0, 200), // preview limité
        matches,
      },
    });
  });

  importInspect = catchError(async (req, res) => {
    const file = req.file;

    // console.log("Received file for inspect", {
    //   file: Boolean(file),
    //   data: file,
    //   originalname: file?.originalname,
    //   mimetype: file?.mimetype,
    //   size: file?.size,
    // });

    if (!file)
      return res.status(400).json({ ok: false, message: "file requis" });

    const { rows, headers } = parseTabularFile(file.buffer, file.originalname);

    return res.json({
      data: {
        ok: true,
        headers,
        sample: rows.slice(0, 5), // optionnel, utile pour UI
      },
    });
  });

  importCommit = catchError(async (req, res) => {
    const rows: CommitRow[] = req.body?.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "rows requis (array)" });
    }

    const plan = buildProvidersCommitPlan(rows);
    const ops = buildProvidersBulkOps(plan.actions);

    if (!ops.length) {
      return res.json({
        ok: true,
        summary: plan.summary,
        results: plan.results,
        bulk: null,
      });
    }

    try {
      const bulk = await ProviderModel.bulkWrite(ops, { ordered: false });
      const insertedMap = getInsertedIdMap(bulk);

      // mapper results create -> id via opIndex
      for (const r of plan.results) {
        if (r.mode !== "create") continue;

        const action = plan.actions.find(
          (a) => a.mode === "create" && a.rowIndex === r.rowIndex,
        ) as any;
        const opIndex = action?.opIndex;
        if (typeof opIndex === "number" && insertedMap[opIndex]) {
          r.id = insertedMap[opIndex];
        }
      }

      return res.json({
        ok: true,
        summary: plan.summary,
        bulk: pickCounts(bulk),
        results: plan.results,
      });
    } catch (e: any) {
      return res.status(400).json({
        ok: false,
        message: "bulkWrite failed",
        error: e?.message,
        summary: plan.summary,
        results: plan.results,
        writeErrors: e?.writeErrors?.map((we: any) => ({
          index: we.index,
          code: we.code,
          errmsg: we.errmsg,
        })),
      });
    }
  });
}

export const providerController = new ProviderController();
