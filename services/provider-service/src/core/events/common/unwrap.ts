export type KafkaEnvelope<T = any> = {
  type?: string;
  payload?: T;
  ts?: number;
};

export function unwrapKafkaEvent<T = any>(
  raw: any
): {
  eventType?: string;
  payload: T;
  ts?: number;
  raw: any;
} {
  // Cas enveloppe { type, payload, ts }
  if (raw && typeof raw === "object" && "payload" in raw) {
    const env = raw as KafkaEnvelope<T>;
    return {
      eventType: env.type,
      payload: (env.payload ?? raw) as T,
      ts: env.ts,
      raw,
    };
  }

  // Cas payload direct (si un service push sans enveloppe)
  return { payload: raw as T, raw };
}
