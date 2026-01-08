export type RoleKey = "SUPER_ADMIN" | "ADMIN" | "MG_COS" | "MG_COB" | "MG_AGT";

export interface JwtUserPayload {
  id: string;
  username?: string;
  role: RoleKey;
  sessionId: string;
  matriculation?: string;
  // pour plus tard : scopes, bureau, dept, etc.
}
