export type Severity = "info" | "success" | "warning" | "error" | "critical";

export interface BaseEventPayload {
  timestamp: string; // ISO
  actorId?: string;
  ip?: string;
  userAgent?: string;
}

export interface AssetEventPayload extends BaseEventPayload {
  assetId: string;
  categoryId?: string;
  locationId?: string;
  label?: string;
  severity?: Severity; // par défaut "info" pour created/updated
  recipients?: string[]; // per-user; sinon côté notif svc on pourra router par rôle
}

export interface LogActionPayload extends BaseEventPayload {
  action: string; // e.g. CREATE_CATEGORY
  resource: string; // e.g. Category
  method?: string;
  path?: string;
  status?: number;
  isSensitive?: boolean;
}
