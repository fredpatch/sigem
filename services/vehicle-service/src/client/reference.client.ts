export type UpsertRefInput = {
    dept: string;
    resource: "vehicle" | string;
    field: "brand" | "model" | "type" | "ownership" | "assignedToDirection" | string;
    value: string;
};

export function getReferenceServiceUrl() {
    const url = process.env.REFERENCE_SERVICE_URL;
    if (!url) throw new Error("REFERENCE_SERVICE_URL is not set");
    return url.replace(/\/+$/, "");
}

function normalizeValue(v: any) {
    if (v === null || v === undefined) return "";
    return String(v).trim();
}

export async function safeJson(res: Response) {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return { raw: text };
    }
}

async function postWithTimeout(url: string, body: any, timeoutMs = 1500) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
    } finally {
        clearTimeout(t);
    }
}

export async function upsertRefValue(input: UpsertRefInput) {
    const value = normalizeValue(input.value);
    if (!value) return null;

    const url = `${getReferenceServiceUrl()}/v1/references/upsert`;

    try {
        const res = await postWithTimeout(url, { ...input, value }, 1500);

        if (!res.ok) {
            const payload = await safeJson(res);
            console.warn("[vehicle-service] reference upsert failed", {
                status: res.status,
                payload,
                input,
            });
            return null;
        }

        const json = await res.json().catch(() => null);
        return json?.data ?? null;
    } catch (err: any) {
        // Ne jamais casser le flow create/update
        console.warn("[vehicle-service] reference upsert error", {
            message: err?.message ?? String(err),
            input,
        });
        return null;
    }
}

/** Helper pratique: exécute plusieurs upserts sans casser le flow */
export async function upsertVehicleRefs(params: {
    dept: string;
    brand?: string;
    model?: string;
    type?: string;
    ownership?: string;
    assignedToDirection?: string;
}) {

    const dept = normalizeValue(params.dept) || "MG";

    const tasks: Promise<any>[] = [];

    if (params.brand) tasks.push(upsertRefValue({ dept, resource: "vehicle", field: "brand", value: params.brand }));
    if (params.model) tasks.push(upsertRefValue({ dept, resource: "vehicle", field: "model", value: params.model }));
    if (params.type) tasks.push(upsertRefValue({ dept, resource: "vehicle", field: "type", value: params.type }));
    if (params.ownership) tasks.push(upsertRefValue({ dept, resource: "vehicle", field: "ownership", value: params.ownership }));
    if (params.assignedToDirection) tasks.push(upsertRefValue({ dept, resource: "vehicle", field: "assignedToDirection", value: params.assignedToDirection }));

    // allSettled pour ne jamais throw
    await Promise.allSettled(tasks);
}

export async function upsertVehicleDocAndTasksRefs(params: {
    dept: string;
    templateLabel?: string;
    documentReference?: string;
}) {
    const dept = normalizeValue(params.dept) || "MG";
    const tasks: Promise<any>[] = [];

    if (params.templateLabel) {
        tasks.push(
            upsertRefValue({
                dept,
                resource: "template",
                field: "label",
                value: params.templateLabel!,
            })
        );
    }

    if (params.documentReference) {
        tasks.push(
            upsertRefValue({
                dept,
                resource: "document",
                field: "reference",
                value: params.documentReference!,
            })
        );
    }

    // allSettled pour ne jamais throw
    await Promise.allSettled(tasks);
}