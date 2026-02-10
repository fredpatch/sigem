export type CommitMode = "create" | "update" | "skip";

export type CommitRow = {
  rowIndex: number; // index de la ligne source (excel)
  mode: CommitMode; // create | update | skip
  targetId?: string; // requis si update/skip sur existant
  data?: {
    name: string;
    designation?: string;
    type?: "FOURNISSEUR" | "PRESTATAIRE" | string;
    phones?: string[];
    emails?: string[];
    tags?: string[];
    isActive?: boolean;
  };
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

export function normalizeRowData(data: NonNullable<CommitRow["data"]>) {
  const name = (data.name || "").trim();
  const designation = (data.designation || "").trim();
  const phones = uniq(
    (data.phones ?? [])
      .map((p) => String(p).trim())
      .filter((p) => p.length >= 6),
  );
  const emails = uniq(
    (data.emails ?? [])
      .map((e) => String(e).trim().toLowerCase())
      .filter((e) => e.includes("@")),
  );
  const tags = uniq(
    (data.tags ?? []).map((t) => String(t).trim()).filter(Boolean),
  );

  return {
    name,
    designation: designation || "Non précisé",
    type: data.type ?? "FOURNISSEUR",
    phones,
    emails,
    tags,
    isActive: data.isActive ?? true,
  };
}
