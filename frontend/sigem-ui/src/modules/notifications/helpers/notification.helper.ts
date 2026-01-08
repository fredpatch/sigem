export function toQuery(params?: Record<string, any>) {
    if (!params) return "";

    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        sp.set(k, String(v));
    });

    const qs = sp.toString();
    return qs ? `?${qs}` : "";
}