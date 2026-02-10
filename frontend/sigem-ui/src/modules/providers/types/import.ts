export type ImportMode = "create" | "update" | "skip";

export type MappingField =
  | "name"
  | "designation"
  | "phones"
  | "emails"
  | "website"
  | "tags"
  | "dept"
  | "notes";

export const MAPPING_FIELDS: Array<{
  key: MappingField;
  label: string;
  required?: boolean;
}> = [
  { key: "name", label: "Nom", required: true },
  { key: "designation", label: "Désignation", required: true },
  { key: "phones", label: "Téléphones" },
  { key: "emails", label: "Emails" },
  { key: "website", label: "Site web" },
  { key: "tags", label: "Tags" },
  { key: "dept", label: "Département" },
  { key: "notes", label: "Notes" },
];

export const norm = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

export function suggest(headers: string[]) {
  const h = headers.map((x) => ({ raw: x, n: norm(x) }));
  const find = (...keys: string[]) =>
    h.find((x) => keys.some((k) => x.n.includes(norm(k))))?.raw;

  return {
    name: find(
      "name",
      "nom",
      "entite",
      "antites",
      "fournisseur",
      "prestataire",
    ),
    designation: find("designation", "activité", "activite", "libelle"),
    phones: find("phone", "tel", "contact", "telephone"),
    emails: find("email", "mail", "e-mail"),
    website: find("site", "web", "website"),
    tags: find("tag", "categorie", "category"),
    dept: find("dept", "departement", "direction"),
    notes: find("note", "commentaire", "comment"),
  } as Record<string, string | undefined>;
}

export type PreviewRow = {
  index: number;
  normalized: {
    name?: string;
    designation?: string;
    type?: "FOURNISSEUR" | "PRESTATAIRE";
    phones: string[];
    emails: string[];
    tags: string[];
    isActive: boolean;
  };
  warnings: string[];
  errors: string[];
};

export type RowMatch = {
  rowIndex: number;
  matches: Array<{
    id: string;
    name: string;
    designation: string;
    score: number;
    confidence: "high" | "medium" | "low";
  }>;
};

export type CommitRow = {
  rowIndex: number;
  mode: ImportMode;
  targetId?: string; // si update/skip
  data?: any; // si create/update
};

export type PreviewResponse = {
  ok: boolean;
  meta: { headers: string[]; total: number; valid: number; invalid: number };
  rows: PreviewRow[];
  matches: RowMatch[];
};

export type CommitResult = {
  rowIndex: number;
  mode: ImportMode;
  ok: boolean;
  id?: string;
  error?: string;
};

export type ImportCommitPayload = { rows: CommitRow[] };

export type CommitResponse = {
  ok: boolean;
  summary: { create: number; update: number; skip: number; errors: number };
  bulk: null | {
    insertedCount: number;
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
  };
  results: CommitResult[];
  inserted?: string[];
};
