import { NextFunction, Request, Response } from "express";

export const catchError =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
