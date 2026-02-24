import { getEventBus } from "./event.bus";

type EmitEventOptions<T extends Record<string, any>> = {
  type: string;
  payload: T;
  includeType?: boolean;
  log?: boolean;
  defaults?: Partial<T>;
};

export async function emitEvent<T extends Record<string, any>>({
  type,
  payload,
  includeType = true,
  log = false,
  defaults,
}: EmitEventOptions<T>) {
  const body = {
    ...(includeType ? { type } : {}),
    ...(defaults ?? {}),
    ...payload,
  } as T & { type?: string };

  if (log) {
    console.log("[kafka-event]", { topic: type, payload: body });
  }

  return getEventBus().emit(type, body);
}
