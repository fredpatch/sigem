import { ReferenceValue } from "../models/reference-value.model";
import { normalizeRefValue } from "../utils/normalize";

export class ReferenceService {
    async upsertReferenceValue(params: {
        dept: string,
        resource: string,
        field: string,
        value: string
    }) {
        const value = (params.value ?? "").trim()
        if (!value) return null;

        const normalizedValue = normalizeRefValue(value)

        const doc = await ReferenceValue.findOneAndUpdate({
            dept: params.dept,
            resource: params.resource,
            field: params.field,
            normalizedValue
        }, {
            $setOnInsert: {
                dept: params.dept,
                resource: params.resource,
                field: params.field,
                value,
                normalizedValue,
            },
            $set: { lastUsedAt: new Date() },
            $inc: { count: 1 }
        }, { upsert: true, new: true });

        return doc?.toJSON();
    }

    async suggestReferenceValues(params: {
        dept: string;
        resource: string;
        field: string;
        q?: string;
        limit?: number;
    }) {
        const limit = Math.min(Math.max(params.limit ?? 10, 1), 50);
        const q = (params.q ?? "").trim();

        const filter: any = {
            dept: params.dept,
            resource: params.resource,
            field: params.field,
        };

        if (q) {
            // match “contains” sur value (simple et efficace)
            filter.value = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
        }

        const docs = await ReferenceValue.find(filter)
            .sort({ count: -1, lastUsedAt: -1 })
            .limit(limit)
            .select({ value: 1, count: 1, lastUsedAt: 1 });

        return docs.map((d) => d.toJSON());
    }
}

export const referenceService = new ReferenceService();