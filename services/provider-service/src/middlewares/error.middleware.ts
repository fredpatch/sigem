import type { Request, Response, NextFunction } from "express";

export function errorMiddleware(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    const status = Number(err?.statusCode ?? err?.status ?? 500);
    const message =
        err?.message ?? "Une erreur inattendue est survenue (reference-service).";

    // Log minimal (tu peux remplacer par ton logger)
    console.error("[reference-service:error]", err);

    return res.status(status).json({
        ok: false,
        message,
    });
}
