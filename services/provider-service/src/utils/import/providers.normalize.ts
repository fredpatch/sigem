// utils/import/providers.normalize.ts
import type { ProviderType } from "../../models/provider.model";

export type ProviderImportMapping = Partial<
  Record<
    | "name"
    | "designation"
    | "type"
    | "phones"
    | "emails"
    | "website"
    | "notes"
    | "tags"
    | "dept"
    | "isActive",
    string | null
  >
>;

const splitMulti = (v: any) =>
  String(v ?? "")
    .split(/[,/;|\n]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

const normStr = (v: any) => String(v ?? "").trim();
const normLower = (v: any) => normStr(v).toLowerCase();

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const normPhone = (s: string) => s.replace(/[^\d+]/g, "").trim();

export type PreviewRow = {
  index: number;
  raw: Record<string, any>;
  normalized: {
    name?: string;
    designation?: string;
    type?: ProviderType;
    phones: string[];
    emails: string[];
    website?: string;
    notes?: string;
    tags: string[];
    dept?: string;
    isActive: boolean;
  };
  errors: string[];
  warnings: string[];
};

export function buildProviderPreviewRows(
  rows: Record<string, any>[],
  mapping: ProviderImportMapping,
): PreviewRow[] {
  return rows.map((raw, i) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const pick = (key: keyof ProviderImportMapping) => {
      const col = mapping[key];
      if (!col) return "";
      return raw[col] ?? "";
    };

    const name = normStr(pick("name"));
    const designation = normStr(pick("designation"));

    const typeRaw = normStr(pick("type")).toUpperCase();
    const type =
      typeRaw === "FOURNISSEUR" || typeRaw === "PRESTATAIRE"
        ? (typeRaw as ProviderType)
        : undefined;

    const rawPhones = splitMulti(pick("phones")).map(normPhone).filter(Boolean);
    const phones = rawPhones.filter((p) => p.replace(/\D/g, "").length >= 6);
    if (rawPhones.length !== phones.length)
      warnings.push("certains numéros trop courts ont été ignorés");

    const emails = splitMulti(pick("emails"))
      .map((e) => normLower(e))
      .filter(Boolean);

    const website = normStr(pick("website")) || undefined;
    const notes = normStr(pick("notes")) || undefined;
    const dept = normStr(pick("dept")) || undefined;

    const tags = splitMulti(pick("tags"))
      .map((t) => normLower(t))
      .filter(Boolean);

    const isActiveRaw = normStr(pick("isActive")).toLowerCase();
    const isActive =
      isActiveRaw === ""
        ? true
        : ["true", "1", "yes", "oui"].includes(isActiveRaw)
          ? true
          : ["false", "0", "no", "non"].includes(isActiveRaw)
            ? false
            : true;

    // validations
    if (!name) errors.push("name requis");
    if (!designation) errors.push("designation requis");

    if (typeRaw && !type)
      warnings.push(`type invalide "${typeRaw}" (défaut appliqué)`);
    const badEmails = emails.filter((e) => !isValidEmail(e));
    if (badEmails.length)
      warnings.push(`emails invalides: ${badEmails.join(", ")}`);

    return {
      index: i + 1,
      raw,
      normalized: {
        name: name || undefined,
        designation: designation || undefined,
        type: type ?? "FOURNISSEUR",
        phones,
        emails: emails.filter(isValidEmail),
        website,
        notes,
        tags,
        dept,
        isActive,
      },
      errors,
      warnings,
    };
  });
}
