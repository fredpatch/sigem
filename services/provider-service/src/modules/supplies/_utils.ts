import { Request } from "express";

export function getPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  return { page, limit };
}

/**
 * Adapte ceci selon ton auth middleware.
 * Si tu as req.user = { id: string, ... } c’est parfait.
 */
export function getUserId(req: Request): string {
  // @ts-ignore
  return req.user?.id || req.headers["x-user-id"]?.toString() || "SYSTEM";
}
