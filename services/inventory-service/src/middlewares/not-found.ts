// src/middlewares/not-found.ts
import { Request, Response, NextFunction } from "express";

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
