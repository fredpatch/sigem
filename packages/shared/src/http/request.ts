import { Request } from "express";

/**
 * Actor information extracted from request
 */
export interface ActorInfo {
  id?: string;
  username?: string;
  sessionId?: string;
  role?: string;
}

/**
 * Extract actor information from request (user object or headers)
 */
export function getActor(req: Request): ActorInfo {
  const user = (req as any).user || {};

  return {
    id: user.id || (req.headers["x-user-id"] as string | undefined),
    username:
      user.username || (req.headers["x-user-username"] as string | undefined),
    sessionId:
      user.sessionId || (req.headers["x-user-sessionid"] as string | undefined),
    role: user.role || (req.headers["x-user-role"] as string | undefined),
  };
}
