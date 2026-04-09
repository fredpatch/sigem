export function userFromHeaders(req, _res, next) {
    const id = req.headers["x-user-id"];
    if (!id)
        return next();
    req.user = {
        id,
        username: req.headers["x-user-username"],
        sessionId: req.headers["x-user-sessionid"],
        role: req.headers["x-user-role"],
        // dept: req.headers["x-user-dept"],
    };
    next();
}
