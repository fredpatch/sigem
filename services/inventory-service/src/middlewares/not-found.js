export function notFoundHandler(req, res, _next) {
    res.status(404).json({
        status: "error",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}
