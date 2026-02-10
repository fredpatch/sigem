/**
 * Types "API response" standard côté SIGEM
 * - Ton axios interceptor renvoie déjà response.data
 * - Donc api.get(...) => directement le payload
 */
export type ProviderType = "FOURNISSEUR" | "PRESTATAIRE";

export interface Provider {
  id: string;
  name: string;
  designation: string;
  type?: ProviderType;

  phones: string[];
  emails: string[];
  website?: string;

  notes?: string;
  tags: string[];
  dept?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProvidersListQuery {
  search?: string;
  active?: boolean;
  type?: ProviderType;
  dept?: string;

  withoutContact?: boolean;

  page?: number;
  limit?: number;

  sort?: "name" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface ProvidersListResponse {
  items: Provider[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Payloads (alignés avec Zod backend)
export interface CreateProviderInput {
  name: string;
  designation: string;
  type?: ProviderType;
  phones?: string[]; // backend accepte string|string[]
  emails?: string[];
  website?: string;
  notes?: string;
  tags?: string[];
  dept?: string;
  isActive?: boolean;
}

export type UpdateProviderInput = Partial<CreateProviderInput>;

/**
 * Helpers
 */
export function toQueryParams(q: ProvidersListQuery) {
  // backend attend active en "true"/"false" (string) via query
  return {
    ...q,
    active: q.active === undefined ? undefined : String(q.active),
    page: q.page?.toString(),
    limit: q.limit?.toString(),
  };
}
// ProviderImportWizard

// UploadAndMappingStep

// PreviewTableStep

// CommitResultStep

// ProviderMatchPopover (affiche les matches top 3)

// ActionSelector (Create/Update/Skip)

// ImportSummaryBar (total/valid/warnings)

export type PreviewRow = {
  index: number;
  raw: Record<string, any>;
  normalized: {
    name?: string;
    designation?: string;
    type?: ProviderType;
    phones?: string[];
    emails?: string[];
    tags?: string[];
    isActive?: boolean;
  };
  errors: string[];
  warnings: string[];
};

export type MatchItem = {
  id: string;
  name: string;
  designation: string;
  score: number;
  confidence: "high" | "medium" | "low";
};

export type PreviewMatches = Array<{
  rowIndex: number;
  matches: MatchItem[];
}>;

export type ImportPreviewResponse = {
  ok: boolean;
  meta: { headers: string[]; total: number; valid: number; invalid: number };
  rows: PreviewRow[];
  matches: PreviewMatches;
};

export type CommitMode = "create" | "update" | "skip";

export type CommitRow = {
  rowIndex: number;
  mode: CommitMode;
  targetId?: string; // requis si update / optionnel si skip
  data?: any; // requis si create/update
};

export type ImportCommitPayload = { rows: CommitRow[] };

export type ImportCommitResponse = {
  ok: boolean;
  summary: { create: number; update: number; skip: number; errors: number };
  bulk: null | {
    insertedCount: number;
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
  };
  results: Array<{
    rowIndex: number;
    mode: CommitMode;
    ok: boolean;
    id?: string;
    error?: string;
  }>;
  inserted?: string[]; // si tu l’exposes côté API
};
