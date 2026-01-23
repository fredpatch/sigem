import { VehicleTask } from "../types/types";
import {
  VehicleDocument,
  // VehicleDocumentType,
} from "../types/vehicle-document.types";

export const computeKpis = (items: VehicleTask[]) => {
  let open = 0;
  let dueSoon = 0;
  let overdue = 0;
  let completed = 0;

  for (const t of items) {
    if (t.status === "COMPLETED") {
      completed++;
      continue;
    }

    if (t.status === "OVERDUE") {
      overdue++;
      open++;
    } else if (t.status === "DUE_SOON") {
      dueSoon++;
      open++;
    } else if (t.status === "PLANNED") {
      open++;
    }
  }

  return { open, dueSoon, overdue, completed };
};

export const EXPIRY_SOON_DAYS = 30;

export function computeDocumentKpis(docs: VehicleDocument[]) {
  const now = new Date();

  let total = docs.length;
  let expired = 0;
  let soon = 0;
  let valid = 0;

  // const byType: Record<VehicleDocumentType, number> = {
  //   [VehicleDocumentType.INSURANCE]: 0,
  //   [VehicleDocumentType.TECH_INSPECTION]: 0,
  //   [VehicleDocumentType.PARKING_CARD]: 0,
  //   [VehicleDocumentType.EXTINGUISHER_CARD]: 0,
  //   [VehicleDocumentType.REGISTRATION]: 0,
  //   [VehicleDocumentType.TAX_STICKER]: 0,
  //   [VehicleDocumentType.OTHER]: 0,
  // };

  for (const doc of docs) {
    const exp = doc.expiresAt ? new Date(doc.expiresAt) : null;
    if (!exp) continue;

    const diffMs = exp.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // const docType = doc.type as VehicleDocumentType;
    // if (byType[docType] !== undefined) {
    //   byType[docType] += 1;
    // } else {
    //   byType[VehicleDocumentType.OTHER] += 1;
    // }

    if (diffDays < 0) {
      expired++;
    } else if (diffDays <= EXPIRY_SOON_DAYS) {
      soon++;
    } else {
      valid++;
    }
  }

  return { total, expired, soon, valid };
}

export const getDocumentStatus = (doc: VehicleDocument) => {
  if (!doc.expiresAt) {
    return {
      label: "Inconnu",
      variant: "outline" as const,
    };
  }

  const now = new Date();
  const exp = new Date(doc.expiresAt);
  const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return {
      label: "Expiré",
      variant: "destructive" as const,
    };
  }

  if (diffDays <= EXPIRY_SOON_DAYS) {
    return {
      label: "Bientôt expiré",
      variant: "default" as const,
    };
  }

  return {
    label: "Valide",
    variant: "outline" as const,
  };
};

export const statusConfig: any = {
  ACTIVE: {
    label: "Actif",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  IN_MAINTENANCE: {
    label: "En maintenance",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  INACTIVE: {
    label: "Inactif",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  RETIRED: { label: "Retiré", color: "bg-red-100 text-red-800 border-red-200" },
};

export function isMissingDate(d?: string | Date | null) {
  if (!d) return true;
  const dt = new Date(d as any);
  return Number.isNaN(dt.getTime());
}

export function daysUntil(dateStr?: string | Date | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr as any);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function classifyDue(days: number | null, soonThreshold = 30) {
  if (days == null) return "missing" as const;
  if (days < 0) return "expired" as const;
  if (days <= soonThreshold) return "soon" as const;
  return "valide" as const;
}
