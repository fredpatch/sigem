import { CommitResponse, PreviewResponse } from "../types/import";

export const mockPreview: PreviewResponse = {
  ok: true,
  meta: {
    headers: ["Nbrs", "ANTITES", "DESIGNATION", "CONTACT", "MAIL"],
    total: 3,
    valid: 3,
    invalid: 0,
  },
  rows: [
    {
      index: 1,
      normalized: {
        name: "CK2",
        designation: "Centre Commercial",
        type: "FOURNISSEUR",
        phones: ["65405623"],
        emails: ["ck2lbv@cecagadis.com"],
        tags: [],
        isActive: true,
      },
      errors: [],
      warnings: [],
    },
    {
      index: 2,
      normalized: {
        name: "MANAGEMENT SOLUTION",
        designation: "Etude-Conseil- Audit-Formation",
        type: "FOURNISSEUR",
        phones: ["11775963", "66289845"],
        emails: ["contact@managementsolution.ga"],
        tags: [],
        isActive: true,
      },
      errors: [],
      warnings: ["Ligne 3 fusionnée (contacts supplémentaires)"],
    },
    {
      index: 4,
      normalized: {
        name: "EASY MANAGEMENT",
        designation: "Etude-Conseil- Audit-Formation",
        type: "FOURNISSEUR",
        phones: ["11445644", "11445658"],
        emails: ["easymanagementgab@gmail.com"],
        tags: [],
        isActive: true,
      },
      errors: [],
      warnings: [],
    },
  ],
  matches: [
    {
      rowIndex: 1,
      matches: [
        {
          id: "695fb8eff648b1bfa1f630b2",
          name: "CK2",
          designation: "Centre Commercial",
          score: 100,
          confidence: "high",
        },
      ],
    },
    {
      rowIndex: 2,
      matches: [
        {
          id: "695fd0ac2d7f7cbeba567165",
          name: "Management Solution",
          designation: "Etude-Conseil- Audit-Formation",
          score: 100,
          confidence: "high",
        },
      ],
    },
    {
      rowIndex: 4,
      matches: [
        {
          id: "695fbd38f648b1bfa1f630c0",
          name: "EASY MANAGEMENT",
          designation: "Etude-Conseil-Audit-Formation",
          score: 70,
          confidence: "medium",
        },
      ],
    },
  ],
};

export const mockCommit: CommitResponse = {
  ok: true,
  summary: { create: 1, update: 1, skip: 1, errors: 0 },
  bulk: {
    insertedCount: 1,
    matchedCount: 1,
    modifiedCount: 1,
    upsertedCount: 0,
  },
  results: [
    { rowIndex: 1, mode: "skip", ok: true, id: "695fb8eff648b1bfa1f630b2" },
    { rowIndex: 4, mode: "update", ok: true, id: "695fbd38f648b1bfa1f630c0" },
    { rowIndex: 99, mode: "create", ok: true },
  ],
  inserted: ["697b657a10ff2d9e8fbc0c0b"],
};
