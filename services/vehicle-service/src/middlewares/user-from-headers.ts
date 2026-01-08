import { Request, Response, NextFunction } from "express";

export function userFromHeaders(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const id = req.headers["x-user-id"] as string | undefined;
  if (!id) return next();

  (req as any).user = {
    id,
    username: req.headers["x-user-username"],
    sessionId: req.headers["x-user-sessionid"],
    role: req.headers["x-user-role"],
    // dept: req.headers["x-user-dept"],
  };

  next();
}
