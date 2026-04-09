import { getEventBus } from "src/core/events";
export async function emitAssetEvent(topic, payload) {
    await getEventBus().emit(topic, {
        ...payload,
        resourceType: payload.resourceType ?? "Asset",
        resourceId: payload.resourceId ?? payload.assetId,
        timestamp: payload.timestamp ?? new Date().toISOString(),
        severity: payload.severity ?? "info",
    });
}
