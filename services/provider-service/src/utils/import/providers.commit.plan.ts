import { CommitPlan } from "./commit.plan";

// utils/import/providers.commit.plan.ts
export type CommitMode = "create" | "update" | "skip";

export type CommitRow = {
  rowIndex: number;
  mode: CommitMode;
  targetId?: string;
  data?: any;
};

export type CommitResult = {
  rowIndex: number;
  mode: CommitMode;
  ok: boolean;
  id?: string;
  error?: string;
};

export type CommitAction =
  | { mode: "create"; rowIndex: number; data: any }
  | { mode: "update"; rowIndex: number; targetId: string; data: any }
  | { mode: "skip"; rowIndex: number; targetId?: string; reason?: string };

export function normalizeRowData(input: any) {
  const name = String(input?.name ?? "").trim();
  const designation = String(input?.designation ?? "").trim();
  const type = String(input?.type ?? "FOURNISSEUR").trim();

  const phones = Array.isArray(input?.phones) ? input.phones : [];
  const emails = Array.isArray(input?.emails) ? input.emails : [];
  const tags = Array.isArray(input?.tags) ? input.tags : [];

  const isActive = typeof input?.isActive === "boolean" ? input.isActive : true;

  // normalisations légères (tu peux enrichir)
  const uniq = (arr: string[]) => [
    ...new Set(arr.map((x) => String(x).trim()).filter(Boolean)),
  ];

  return {
    name,
    designation,
    type,
    phones: uniq(phones),
    emails: uniq(emails.map((e: any) => String(e).toLowerCase().trim())),
    tags: uniq(tags),
    isActive,
  };
}

export function buildProvidersCommitPlan(rows: CommitRow[]): CommitPlan {
  const summary = { create: 0, update: 0, skip: 0, errors: 0 };
  const results: CommitResult[] = [];
  const actions: CommitAction[] = [];

  // évite doublons DANS la requête
  const seen = new Set<string>();

  for (const r of rows) {
    const rowIndex = Number(r?.rowIndex);
    const mode = r?.mode as CommitMode;

    if (!rowIndex || !mode) {
      summary.errors++;
      results.push({
        rowIndex: rowIndex || -1,
        mode: mode as any,
        ok: false,
        error: "rowIndex/mode requis",
      });
      continue;
    }

    if (mode === "skip") {
      summary.skip++;
      results.push({ rowIndex, mode, ok: true, id: r.targetId });
      actions.push({ mode: "skip", rowIndex, targetId: r.targetId });
      continue;
    }

    if (!r.data) {
      summary.errors++;
      results.push({
        rowIndex,
        mode,
        ok: false,
        error: "data requis pour create/update",
      });
      continue;
    }

    const data = normalizeRowData(r.data);

    if (!data.name) {
      summary.errors++;
      results.push({ rowIndex, mode, ok: false, error: "name requis" });
      continue;
    }

    // clé anti-doublon dans la requête
    const dedupeKey =
      (r.targetId
        ? `id:${r.targetId}`
        : `nd:${(data.name ?? "").toLowerCase()}|${(data.designation ?? "").toLowerCase()}`) +
      `|mode:${mode}`;

    if (seen.has(dedupeKey)) {
      summary.skip++;
      results.push({
        rowIndex,
        mode: "skip",
        ok: true,
        id: r.targetId,
        error: "doublon dans payload → ignoré",
      });
      actions.push({ mode: "skip", rowIndex, targetId: r.targetId });
      continue;
    }
    seen.add(dedupeKey);

    if (mode === "create") {
      summary.create++;
      actions.push({ mode: "create", rowIndex, data });
      results.push({ rowIndex, mode, ok: true });
      continue;
    }

    // mode === "update"
    if (!r.targetId) {
      summary.errors++;
      results.push({
        rowIndex,
        mode,
        ok: false,
        error: "targetId requis pour update",
      });
      continue;
    }

    summary.update++;
    actions.push({ mode: "update", rowIndex, targetId: r.targetId, data });
    results.push({ rowIndex, mode, ok: true, id: r.targetId });
  }

  return { summary, results, actions };
}
