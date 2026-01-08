import { NextFunction, Request, Response } from "express";

export function forwardUserHeaders(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const user = (req as any).user;

  // console.log(user);

  if (user) {
    req.headers["x-user-id"] = user.id;
    req.headers["x-user-username"] = user.username;
    req.headers["x-user-role"] = user.role;
    req.headers["x-user-sessionId"] = user.sessionId;
    req.headers["x-user-matriculation"] = user.matriculation;
  }
  next();
}
