// utils/import/providers.match.ts
import { ProviderModel } from "../../models/provider.model";

const normKey = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");

export async function matchProviders(previewRows: any[]) {
  const emails = new Set<string>();
  const phones = new Set<string>();
  const keys = new Set<string>();

  for (const r of previewRows) {
    for (const e of r.normalized.emails ?? []) emails.add(e);
    for (const p of r.normalized.phones ?? []) phones.add(p);
    const k = `${normKey(r.normalized.name ?? "")}::${normKey(r.normalized.designation ?? "")}`;
    if (k !== "::") keys.add(k);
  }

  const candidates = await ProviderModel.find({
    $or: [
      { emails: { $in: [...emails] } },
      { phones: { $in: [...phones] } },
      // fallback: on match plus bas via keys en mémoire
    ],
  }).lean();

  // index mémoire
  const byEmail = new Map<string, any[]>();
  const byPhone = new Map<string, any[]>();
  const byKey = new Map<string, any[]>();

  for (const c of candidates) {
    for (const e of c.emails ?? []) {
      const arr = byEmail.get(e) ?? [];
      arr.push(c);
      byEmail.set(e, arr);
    }
    for (const p of c.phones ?? []) {
      const arr = byPhone.get(p) ?? [];
      arr.push(c);
      byPhone.set(p, arr);
    }
    const k = `${normKey(c.name)}::${normKey(c.designation)}`;
    const arr = byKey.get(k) ?? [];
    arr.push(c);
    byKey.set(k, arr);
  }

  // match row->candidate + score
  return previewRows.map((r: any) => {
    const hits: any[] = [];
    const rowEmails = r.normalized.emails ?? [];
    const rowPhones = r.normalized.phones ?? [];
    const rowKey = `${normKey(r.normalized.name ?? "")}::${normKey(r.normalized.designation ?? "")}`;

    for (const e of rowEmails) hits.push(...(byEmail.get(e) ?? []));
    for (const p of rowPhones) hits.push(...(byPhone.get(p) ?? []));
    hits.push(...(byKey.get(rowKey) ?? []));

    // dédoublonner candidates
    const uniq = new Map<string, any>();
    for (const h of hits) uniq.set(String(h._id), h);

    const scored = [...uniq.values()]
      .map((c) => {
        let score = 0;
        if (rowEmails.some((e: string) => (c.emails ?? []).includes(e)))
          score += 70;
        if (rowPhones.some((p: string) => (c.phones ?? []).includes(p)))
          score += 60;
        if (rowKey === `${normKey(c.name)}::${normKey(c.designation)}`)
          score += 40;
        score = Math.min(100, score);

        const confidence =
          score >= 80 ? "high" : score >= 50 ? "medium" : "low";
        return {
          id: c._id,
          name: c.name,
          designation: c.designation,
          score,
          confidence,
        };
      })
      .sort((a, b) => b.score - a.score);

    return { rowIndex: r.index, matches: scored.slice(0, 3) };
  });
}
