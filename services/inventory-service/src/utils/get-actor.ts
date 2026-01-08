import { Request } from "express";

export interface ActorInfo {
  id?: string;
  username?: string;
  sessionId?: string;
  role?: string;
  // dept?: string;
}

export function getActor(req: Request): ActorInfo {
  // If the service reconstructs req.user later, this takes priority
  const user = (req as any).user || {};

  return {
    id: user.id || (req.headers["x-user-id"] as string | undefined),

    username:
      user.username || (req.headers["x-user-username"] as string | undefined),

    sessionId:
      user.sessionId || (req.headers["x-user-sessionid"] as string | undefined),

    role: user.role || (req.headers["x-user-role"] as string | undefined),

    // dept: user.dept || (req.headers["x-user-dept"] as string | undefined),
  };
}
