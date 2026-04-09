export function errorHandler(err, _req, res, _next) {
    console.error("Unhandled error", err);
    const status = err.statusCode ?? 500;
    const message = err.message ?? "Internal server error";
    res.status(status).json({
        status: "error",
        message,
    });
}
