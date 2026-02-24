import { Request, Response, NextFunction } from "express";

/**
 * Async error wrapper for Express route handlers
 */
export const catchError =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
