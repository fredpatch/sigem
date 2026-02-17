import { KAFKA_TOPICS } from "@sigem/shared";
import { NextFunction, Request, Response } from "express";
import { getEventBus } from "../core/events";

const parseResource = (r?: string) => {
  if (!r) return { resourceType: undefined, resourceId: undefined };
  const [resourceType, resourceId] = r.split(":");
  return { resourceType, resourceId };
};

export function audit(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      try {
        if (res.statusCode < 400) {
          const { resourceType, resourceId } = parseResource(resource);
          const user = (req as any).user;
          const severity =
            res.statusCode >= 500
              ? "error"
              : res.statusCode >= 400
                ? "warning"
                : "success";

          // userId: (req as any).user?.id,
          // username: (req as any).user?.username,

          await getEventBus().emit(KAFKA_TOPICS.LOG_ACTION, {
            // === canonical cover
            version: 1,
            type: "audit.action",
            action,
            resourceType,
            resourceId,
            userId: user?.id,
            username: user?.username,
            role: user?.role,
            matriculation: user?.matriculation,
            dept: "MGX",
            severity,
            timestamp: new Date().toISOString(),

            // Http context
            http: {
              method: req.method,
              path: req.originalUrl,
              status: res.statusCode,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
            },
          });
        }
      } catch (e) {
        // No throw in a "finish" listener
        console.error("[audit] emit failed:", e);
      }
    });
    next();
  };
}
