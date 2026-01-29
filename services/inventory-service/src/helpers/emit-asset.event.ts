import { getEventBus } from "src/core/events";

export type AssetEventBase = {
  assetId: string;
  label?: string;
  code?: string;

  userId?: string;
  role?: string;

  severity?: "success" | "info" | "warning" | "error";
  timestamp?: string;

  resourceType?: "Asset";
  resourceId?: string;
};

export async function emitAssetEvent(
  topic: string,
  payload: AssetEventBase & Record<string, any>,
) {
  await getEventBus().emit(topic, {
    ...payload,
    resourceType: payload.resourceType ?? "Asset",
    resourceId: payload.resourceId ?? payload.assetId,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    severity: payload.severity ?? "info",
  });
}
