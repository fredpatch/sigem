export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MG_COS: "MG_COS",
  MG_COB: "MG_COB",
  MG_AGT: "MG_AGT",
  GUEST: "GUEST",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
