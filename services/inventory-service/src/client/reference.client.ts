export type UpsertRefInput = {
    dept: string;
    resource: "asset" | "vehicle" | string;
    field: string;
    value: string;
};

function getReferenceServiceUrl() {
    const url = process.env.REFERENCE_SERVICE_URL;
    if (!url) throw new Error("REFERENCE_SERVICE_URL is not set");
    return url.replace(/\/+$/, "");
}

function normalizeValue(v: any) {
    if (v === null || v === undefined) return "";
    return String(v).trim();
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
            const payload = await res.text().catch(() => "");
            console.warn("[inventory-service] reference upsert failed", {
                status: res.status,
                payload,
                input,
            });
            return null;
        }
        const json = await res.json().catch(() => null);
        return json?.data ?? null;
    } catch (err: any) {
        console.warn("[inventory-service] reference upsert error", {
            message: err?.message ?? String(err),
            input,
        });
        return null;
    }
}

export async function upsertAssetRefs(params: {
    dept: string;
    label?: string | null;
    brand?: string | null;
    model?: string | null;
}) {
    const dept = normalizeValue(params.dept) || "MG";
    const tasks: Promise<any>[] = [];

    if (normalizeValue(params.label))
        tasks.push(upsertRefValue({ dept, resource: "asset", field: "label", value: params.label! }));
    if (normalizeValue(params.brand))
        tasks.push(upsertRefValue({ dept, resource: "asset", field: "brand", value: params.brand! }));
    if (normalizeValue(params.model))
        tasks.push(upsertRefValue({ dept, resource: "asset", field: "model", value: params.model! }));

    await Promise.allSettled(tasks);
}

export async function upsertCategoryRefs(params: {
    dept: string;
    label?: string | undefined;
}) {
    const dept = normalizeValue(params.dept) || "MG";
    const tasks: Promise<any>[] = [];

    if (normalizeValue(params.label)) {
        tasks.push(
            upsertRefValue({
                dept,
                resource: "category",
                field: "label",
                value: params.label!,
            })
        );
    }

    await Promise.allSettled(tasks);
}

export async function upsertLocationRefs(params: {
    dept: string;
    localisation?: string | null;
    batiment?: string | null;
    direction?: string | null;
    bureau?: string | null;
}) {
    const dept = normalizeValue(params.dept) || "MG";
    const tasks: Promise<any>[] = [];

    if (normalizeValue(params.localisation)) {
        tasks.push(
            upsertRefValue({
                dept,
                resource: "location",
                field: "localisation",
                value: params.localisation!,
            })
        );
    }

    if (normalizeValue(params.batiment)) {
        tasks.push(
            upsertRefValue({
                dept,
                resource: "location",
                field: "batiment",
                value: params.batiment!,
            })
        );
    }

    if (normalizeValue(params.direction)) {
        tasks.push(
            upsertRefValue({
                dept,
                resource: "location",
                field: "direction",
                value: params.direction!,
            })
        );
    }

    if (normalizeValue(params.bureau)) {
        tasks.push(
            upsertRefValue({
                dept,
                resource: "location",
                field: "bureau",
                value: params.bureau!,
            })
        );
    }

    await Promise.allSettled(tasks);
}