export interface AssetEventPayload {
  assetId: string;
  action:
    | "asset.created"
    | "asset.updated"
    | "asset.deleted"
    | "asset.assigned";
  performedBy: string;
  recipients: string[];
  message?: string;
  timestamp?: string;
}

export interface AssetEvent {
  type: "ASSET_EVENT";
  payload: AssetEventPayload;
}
