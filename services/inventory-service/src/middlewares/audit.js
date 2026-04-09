// audit.ts
import { KAFKA_TOPICS, emitAuditEvent } from "@sigem/shared";
const parseResource = (r) => {
    if (!r)
        return { resourceType: undefined, resourceId: undefined };
    const [resourceType, resourceId] = r.split(":");
    return { resourceType, resourceId };
};
// AUDIT_LOG_IGNORE_PATHS=/health,/metrics,/swagger
const AUDIT_IGNORE_PATHS = (process.env.AUDIT_LOG_IGNORE_PATHS ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
const shouldSkipAudit = (req) => AUDIT_IGNORE_PATHS.some((p) => req.originalUrl.includes(p));
export function audit(action, resource) {
    return (req, res, next) => {
        res.on("finish", async () => {
            try {
                if (shouldSkipAudit(req))
                    return;
                const { resourceType, resourceId } = parseResource(resource);
                const user = req.user;
                const severity = res.statusCode >= 500
                    ? "error"
                    : res.statusCode >= 400
                        ? "warning"
                        : "success";
                await emitAuditEvent(KAFKA_TOPICS.LOG_ACTION, {
                    // === canonical cover
                    version: 1,
                    type: "audit.action",
                    action,
                    resourceType,
                    resourceId,
                    userId: user?.id,
                    username: user?.username,
                    role: user?.role,
                    dept: "MG",
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
                }, { includeType: false });
            }
            catch (e) {
                // No throw in a "finish" listener
                console.error("[audit] emit failed:", e);
            }
        });
        next();
    };
}
