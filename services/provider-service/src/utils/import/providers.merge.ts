// utils/import/providers.merge.ts
import type { PreviewRow } from "./providers.normalize";

export function mergeContinuationRows(rows: PreviewRow[]) {
  const out: PreviewRow[] = [];
  let lastValid: PreviewRow | null = null;

  for (const r of rows) {
    const name = (r.normalized.name ?? "").trim();
    const designation = (r.normalized.designation ?? "").trim();

    const hasIdentity = Boolean(name) || Boolean(designation);
    const hasContact =
      (r.normalized.phones?.length ?? 0) > 0 ||
      (r.normalized.emails?.length ?? 0) > 0;

    const isContinuation = !hasIdentity && hasContact;

    if (isContinuation && lastValid) {
      const phones = new Set([...(lastValid.normalized.phones ?? [])]);
      const emails = new Set([...(lastValid.normalized.emails ?? [])]);

      for (const p of r.normalized.phones ?? []) phones.add(p);
      for (const e of r.normalized.emails ?? []) emails.add(e);

      lastValid.normalized.phones = [...phones];
      lastValid.normalized.emails = [...emails];

      lastValid.warnings.push(
        `Ligne ${r.index} fusionnée (contacts supplémentaires)`,
      );
      continue;
    }

    out.push(r);

    // On définit lastValid sur une ligne avec identité + sans erreurs bloquantes
    if (r.errors.length === 0) lastValid = r;
  }

  return out;
}

// utils/import/providers.fallback.ts

export function applyDesignationFallback(rows: PreviewRow[]) {
  for (const r of rows) {
    const name = (r.normalized.name ?? "").trim();
    const designation = (r.normalized.designation ?? "").trim();

    if (name && !designation) {
      r.normalized.designation = "Non précisé";

      // remove error if present
      r.errors = (r.errors ?? []).filter((e) => e !== "designation requis");

      r.warnings = r.warnings ?? [];
      r.warnings.push("designation manquante → 'Non précisé'");
    }
  }
  return rows;
}
