// utils/import/providers.plan.ts
type PreviewRow = {
  index: number;
  errors: string[];
  normalized: {
    name?: string;
    designation?: string;
    emails?: string[];
    phones?: string[];
    tags?: string[];
    type?: string;
    isActive?: boolean;
  };
};

type MatchItem = {
  id: string;
  score: number;
  confidence: "high" | "medium" | "low";
};

type MatchRow = { rowIndex: number; matches: MatchItem[] };

type CommitAction =
  | { rowIndex: number; mode: "skip"; reason: string }
  | { rowIndex: number; mode: "update"; id: string; patch: any }
  | { rowIndex: number; mode: "create"; doc: any };

const normKey = (s: string) =>
  (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");

const rowKey = (r: PreviewRow) =>
  `${normKey(r.normalized.name ?? "")}::${normKey(r.normalized.designation ?? "")}`;

const createDedupeKey = (r: PreviewRow) => {
  const emails = (r.normalized.emails ?? []).map((e) => e.toLowerCase()).sort();
  const phones = (r.normalized.phones ?? []).sort();
  // priorité email > phone > key
  if (emails.length) return `email:${emails.join("|")}`;
  if (phones.length) return `phone:${phones.join("|")}`;
  return `key:${rowKey(r)}`;
};

const pickBest = (m?: MatchRow) => (m?.matches?.length ? m.matches[0] : null);

export function buildProvidersCommitPlan(args: {
  previewRows: PreviewRow[];
  matches: MatchRow[];
  thresholds?: { highScore?: number };
}) {
  const { previewRows, matches, thresholds } = args;
  const highScore = thresholds?.highScore ?? 80;

  const matchByRow = new Map<number, MatchRow>();
  for (const m of matches) matchByRow.set(m.rowIndex, m);

  const usedProviderIds = new Map<string, number>(); // providerId -> firstRowIndex
  const usedCreateKeys = new Map<string, number>(); // dedupeKey -> firstRowIndex

  const actions: CommitAction[] = [];
  const toReview: number[] = []; // optionnel: rows medium/low

  for (const r of previewRows) {
    // 1) invalid rows
    if (r.errors?.length) {
      actions.push({
        rowIndex: r.index,
        mode: "skip",
        reason: `invalid: ${r.errors.join(", ")}`,
      });
      continue;
    }

    const best = pickBest(matchByRow.get(r.index));

    // 2) no match => create (with dedupe)
    if (!best) {
      const key = createDedupeKey(r);
      const first = usedCreateKeys.get(key);
      if (first) {
        actions.push({
          rowIndex: r.index,
          mode: "skip",
          reason: `duplicate-create: même contenu que ligne ${first}`,
        });
        continue;
      }
      usedCreateKeys.set(key, r.index);

      actions.push({
        rowIndex: r.index,
        mode: "create",
        doc: r.normalized, // ou transforme selon ton schema Provider
      });
      continue;
    }

    // 3) medium/low => skip + mark review (UI)
    const isHigh = best.confidence === "high" || best.score >= highScore;
    if (!isHigh) {
      toReview.push(r.index);
      actions.push({
        rowIndex: r.index,
        mode: "skip",
        reason: `review: match ${best.confidence} score=${best.score} (id=${best.id})`,
      });
      continue;
    }

    // 4) high => update, but skip duplicates for same provider id
    const already = usedProviderIds.get(best.id);
    if (already) {
      actions.push({
        rowIndex: r.index,
        mode: "skip",
        reason: `duplicate-update: même fournisseur que ligne ${already}`,
      });
      continue;
    }
    usedProviderIds.set(best.id, r.index);

    // patch = ce que tu acceptes en update (souvent merge arrays)
    actions.push({
      rowIndex: r.index,
      mode: "update",
      id: best.id,
      patch: r.normalized,
    });
  }

  // summary
  const summary = actions.reduce(
    (acc, a) => {
      acc[a.mode] += 1;
      return acc;
    },
    { create: 0, update: 0, skip: 0 },
  );

  return { actions, summary, toReview };
}
