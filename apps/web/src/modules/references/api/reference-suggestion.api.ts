import { api } from "@/lib/axios";


export type ReferenceKey = `${string}.${string}`; // ex: "vehicle.brand"

export type ReferenceValueDTO = {
    id?: string;
    value: string;
    normalizedValue?: string;
    count?: number;
    lastUsedAt?: string;
    dept?: string;
    resource?: string;
    field?: string;
};

type ListParams = {
    key: ReferenceKey;
    q: string;
    limit?: number;
    dept?: string; // default MG
};
class ReferenceAPI {

    async list(params: ListParams): Promise<ReferenceValueDTO[]> {
        const { key, q, limit = 20, dept = "MG" } = params;
        const [resource, field] = key.split("."); // e.g., vehicle.brand

        console.log("Fetching references for", { resource, field, q, limit, dept });

        const res = await api.get("/references", { params: { resource, field, q, limit, dept } });

        return res.data ?? [];
    }

    async upsert(params: { key: ReferenceKey; value: string; dept?: string }): Promise<ReferenceValueDTO | null> {
        const { key, value, dept = "MG" } = params;
        const [resource, field] = key.split("."); // e.g., vehicle.brand

        const res = await api.post("/references/upsert", { resource, field, value, dept });

        return res.data ?? null;
    }
}

export const referenceSuggestionApi = new ReferenceAPI();