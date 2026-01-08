// log-service/src/kafka/normalize.ts
type AnyPayload = Record<string, any>;

function parseHeaders(h?: Record<string, Buffer | string | undefined>) {
  return Object.fromEntries(
    Object.entries(h ?? {}).map(([k, v]) => [
      k,
      typeof v === "string" ? v : v?.toString(),
    ])
  );
}

function unwrapEvent(raw: any) {
  // Cas 1: EventBus envelope { type, payload, ts }
  if (
    raw &&
    typeof raw === "object" &&
    "payload" in raw &&
    ("type" in raw || "ts" in raw)
  ) {
    return {
      outerType: raw.type, // ex: 'log.action' (type enveloppe)
      ts: raw.ts, // number (ms)
      evt: raw.payload ?? {}, // événement métier réel
    };
  }
  // Cas 2: message déjà “plat”
  return { outerType: undefined, ts: undefined, evt: raw ?? {} };
}

function deriveSeverity(
  evt: any
): "info" | "success" | "warning" | "error" | "critical" {
  if (evt.severity) return evt.severity;
  const s = evt.http?.status;
  if (s >= 500) return "error";
  if (s >= 400) return "warning";
  // si c'est un audit “ok” suite à un 2xx/3xx on peut considérer success
  if (s >= 200 && s < 400) return "success";
  return "info";
}

function splitResourceIfNeeded(evt: any) {
  let { resourceType, resourceId } = evt;
  if (!resourceType && typeof evt.resource === "string") {
    const [rt, rid] = evt.resource.split(":");
    resourceType = resourceType ?? rt;
    resourceId = resourceId ?? rid;
  }
  return { resourceType, resourceId };
}

export function normalizeDoc(
  topic: string,
  rawPayload: any,
  headers: Record<string, string | undefined>
) {
  const { outerType, ts, evt } = unwrapEvent(rawPayload);

  // ⚠️ ton log montre un typo 'audi.action' dans evt.type : on protège.
  const eventType =
    evt.type && typeof evt.type === "string"
      ? evt.type
      : evt.eventType && typeof evt.eventType === "string"
        ? evt.eventType
        : outerType || "audit.action";

  const { resourceType, resourceId } = splitResourceIfNeeded(evt);
  const severity = deriveSeverity(evt);

  const createdAt =
    (evt.timestamp && new Date(evt.timestamp)) ||
    (typeof ts === "number" && new Date(ts)) ||
    new Date();

  const doc: any = {
    eventId: headers["event-id"] || evt.eventId,
    type: eventType,
    topic,
    userId: evt.userId || headers["user-id"],
    role: evt.role || headers["user-role"],
    dept: evt.dept || "MG",
    resourceType,
    resourceId,
    payload: rawPayload, // on garde l’original pour forensic
    severity,
    createdAt,
  };

  // strip des undefined pour éviter des “champs vides”
  Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
  return doc;
}
