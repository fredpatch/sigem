import { ReferenceService } from "../services/reference.service";
import { catchError } from "../utils/catch-error";

class ReferenceController {
    private referenceService = new ReferenceService();
    suggestions = catchError(async (req, res) => {
        const dept = String(req.query.dept ?? "MG");
        const resource = String(req.query.resource ?? "");
        const field = String(req.query.field ?? "");
        const q = req.query.q ? String(req.query.q) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;

        if (!resource || !field) {
            return res.status(400).json({ ok: false, message: "resource and field are required" });
        }

        const data = await this.referenceService.suggestReferenceValues({ dept, resource, field, q, limit });

        return res.json({ ok: true, data });
    })

    upsert = catchError(async (req, res) => {
        const dept = String(req.body?.dept ?? "MG");
        const resource = String(req.body?.resource ?? "");
        const field = String(req.body?.field ?? "");
        const value = String(req.body?.value ?? "");

        if (!resource || !field || !value?.trim()) {
            return res.status(400).json({ ok: false, message: "resource, field, value are required" });
        }

        const data = await this.referenceService.upsertReferenceValue({ dept, resource, field, value });

        if (!data) {
            return res.status(500).json({ ok: false, message: "Failed to upsert reference value" });
        }
        return res.json({ ok: true, data });
    })
}

export const referenceController = new ReferenceController();