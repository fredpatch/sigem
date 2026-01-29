import { Request } from "express";

export interface ActorInfo {
  id?: string;
  username?: string;
  sessionId?: string;
  role?: string;
  matriculation?: string;
  // dept?: string;
}

export function getMatriculationFromReq(req: Request): string | undefined {
  // adapté à ta stack actuelle : token, header, etc.
  const userMatriculate = (req as any).user?.matriculation as
    | string
    | undefined;
  const headerMatriculate = req.headers["x-user-matriculation"] as
    | string
    | undefined;
  const bodyMatriculate = (req.body as any)?.matriculation as
    | string
    | undefined;
  return userMatriculate || headerMatriculate || bodyMatriculate;
}

export function getActor(req: Request): ActorInfo {
  // If the service reconstructs req.user later, this takes priority
  const user = (req as any).user || {};

  return {
    id: user.id || (req.headers["x-user-id"] as string | undefined),

    username:
      user.username || (req.headers["x-user-username"] as string | undefined),

    sessionId:
      user.sessionId || (req.headers["x-user-sessionId"] as string | undefined),

    role: user.role || (req.headers["x-user-role"] as string | undefined),

    matriculation:
      user.matriculation ||
      (req.headers["x-user-matriculation"] as string | undefined),

    // dept: user.dept || (req.headers["x-user-dept"] as string | undefined),
  };
}
