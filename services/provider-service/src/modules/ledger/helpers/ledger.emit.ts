export type LedgerEventType =
  | "ledger.entry.created"
  | "ledger.entry.updated"
  | "ledger.entry.adjusted"
  | "ledger.entry.deleted"
  | "ledger.exit.created"
  | "ledger.exit.updated"
  | "ledger.exit.adjusted"
  | "ledger.exit.deleted"
  | "ledger.seuil.created"
  | "ledger.seuil.updated"
  | "ledger.seuil.deleted"
  | "ledger.alert.critics"
  | "ledger.alert.warnings"
  | "ledger.alerts.cleared";

export type LedgerEventPayload = {
  resourceType: "LedgerEntry" | "LedgerExit" | "LedgerSeuil" | "LedgerAlert";
  resourceId: string;
  message: string;
  severity?: "info" | "warning" | "error" | "critical" | "success";
  data?: Record<string, any>;
};

export async function emitLedgerEvent(
  type: LedgerEventType,
  payload: LedgerEventPayload,
  log = false,
) {
  return emitEvent({
    type,
    payload,
    log,
    includeType: true,
  });
}
