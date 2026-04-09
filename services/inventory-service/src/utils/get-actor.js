export function getActor(req) {
    // If the service reconstructs req.user later, this takes priority
    const user = req.user || {};
    return {
        id: user.id || req.headers["x-user-id"],
        username: user.username || req.headers["x-user-username"],
        sessionId: user.sessionId || req.headers["x-user-sessionid"],
        role: user.role || req.headers["x-user-role"],
        // dept: user.dept || (req.headers["x-user-dept"] as string | undefined),
    };
}
