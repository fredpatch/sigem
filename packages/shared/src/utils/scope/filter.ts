/**
 * Scope-based filtering for notifications and resources
 */
export type Scope = "user" | "role" | "all";

function isMissing(field: string) {
  // "global" = pas de ciblage explicite
  return {
    $or: [{ [field]: { $exists: false } }, { [field]: null }, { [field]: "" }],
  };
}

export function buildScopeFilter(params: {
  userId?: string;
  role?: string;
  scope: Scope;
  includeGlobal: boolean;
}) {
  const { userId, role, scope, includeGlobal } = params;

  const base: any = { deleted: { $ne: true } };

  // ✅ Clause "global" robuste (match absent OU null OU empty)
  const globalClause = includeGlobal
    ? [
        {
          $and: [isMissing("userId"), isMissing("role")],
        },
      ]
    : [];

  // ✅ mode "all": tout (debug / phase 1)
  if (scope === "all") {
    if (!includeGlobal) {
      // exclure global
      return {
        ...base,
        $or: [
          { userId: { $exists: true, $nin: [null, ""] } },
          { role: { $exists: true, $nin: [null, ""] } },
        ],
      };
    }
    return base; // tout inclut global
  }

  if (scope === "role") {
    if (!role) return { ...base, _id: null }; // aucun résultat si pas de role
    return { ...base, $or: [{ role }, ...globalClause] };
  }

  // scope=user
  if (!userId) return { ...base, _id: null }; // aucun résultat si pas de userId
  return { ...base, $or: [{ userId }, ...globalClause] };
}
