import { Request } from "express";

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
