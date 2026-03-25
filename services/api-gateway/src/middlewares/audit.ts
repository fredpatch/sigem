import { KAFKA_TOPICS, emitAuditEvent } from "@sigem/shared";
import { NextFunction, Request, Response } from "express";

const parseResource = (r?: string) => {
  if (!r) return { resourceType: undefined, resourceId: undefined };
  const [resourceType, resourceId] = r.split(":");
  return { resourceType, resourceId };
};

const AUDIT_IGNORE_PATHS = (process.env.AUDIT_LOG_IGNORE_PATHS ?? "")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

const shouldSkipAudit = (req: Request) =>
  AUDIT_IGNORE_PATHS.some((p) => req.originalUrl.includes(p));

export function audit(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      try {
        if (shouldSkipAudit(req)) return;

        const { resourceType, resourceId } = parseResource(resource);
        const user = (req as any).user;
        const severity =
          res.statusCode >= 500
            ? "error"
            : res.statusCode >= 400
              ? "warning"
              : "info";

        // userId: (req as any).user?.id,
        // username: (req as any).user?.username,

        await emitAuditEvent(
          KAFKA_TOPICS.LOG_ACTION,
          {
            // === canonical cover
            version: "1",
            type: "audit.action",
            action,
            resourceType,
            resourceId,
            userId: user?.id,
            username: user?.username,
            role: user?.role,
            dept: "MG",
            severity,
            timestamp: new Date(),

            // Http context
            http: {
              method: req.method,
              path: req.originalUrl,
              status: res.statusCode,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
            },
          },
          { includeType: false },
        );
      } catch (e) {
        // No throw in a "finish" listener
        console.error("[audit] emit failed:", e);
      }
    });
    next();
  };
}
