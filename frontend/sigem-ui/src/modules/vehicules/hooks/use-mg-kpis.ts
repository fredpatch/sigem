import { classifyDue, daysUntil } from "../helpers/helpers";
import { MGMaintenanceRow } from "../types/mg.types";

type DueCls =
  | "expired"
  | "soon"
  | "valid"
  | "valide"
  | "missing"
  | null
  | undefined;

function bumpDocCounters(
  expiresAt: string | null | undefined,
  counters: { expired: number; soon: number; valid: number; missing: number },
) {
  const d = daysUntil(expiresAt); // doit gérer null/undefined/""
  const cls = classifyDue(d) as DueCls;

  if (cls === "expired") counters.expired++;
  else if (cls === "soon") counters.soon++;
  else if (cls === "valid" || cls === "valide") counters.valid++;
  else counters.missing++;
}

export function computeMgSidebarKpis(rows: MGMaintenanceRow[]) {
  const total = rows.length;

  let assigned = 0;
  let unassigned = 0;
  let missingMileage = 0;

  const insurance = { expired: 0, soon: 0, valid: 0, missing: 0 };
  const tech = { expired: 0, soon: 0, valid: 0, missing: 0 };
  const parking = { expired: 0, soon: 0, valid: 0, missing: 0 };
  const extinguisher = { expired: 0, soon: 0, valid: 0, missing: 0 };

  let oilDueSoon = 0;
  let oilOverdue = 0;
  let oilMissing = 0;

  for (const v of rows) {
    if (v.assignedToName) assigned++;
    else unassigned++;

    if (typeof (v as any).currentMileage !== "number") missingMileage++;

    // ✅ DOCS = on se base sur les *ExpiresAt* des docs (validité)
    bumpDocCounters(v.insuranceExpiresAt, insurance);

    // ⚠️ ici c’est bien le document de contrôle technique (validité)
    bumpDocCounters(v.techInspectionExpiresAt, tech);

    // ⚠️ parkingCardExpiresAt (et pas parkingExpiresAt)
    bumpDocCounters(v.parkingCardExpiresAt, parking);

    bumpDocCounters(v.extinguisherExpiresAt, extinguisher);

    // oil change
    const nextKm = v.nextOilChangeKm ?? null;
    if (typeof nextKm !== "number") {
      oilMissing++;
    } else {
      const kmNow = (v as any).currentMileage as number | undefined;
      if (typeof kmNow === "number") {
        const delta = nextKm - kmNow;
        if (delta < 0) oilOverdue++;
        else if (delta <= 500) oilDueSoon++;
      } else {
        oilDueSoon++;
      }
    }
  }

  const docsExpired =
    insurance.expired + tech.expired + parking.expired + extinguisher.expired;
  const docsSoon =
    insurance.soon + tech.soon + parking.soon + extinguisher.soon;
  const docsValid =
    insurance.valid + tech.valid + parking.valid + extinguisher.valid;

  // ✅ (optionnel mais conseillé) : inclure missing dans le dénominateur conformité
  const docsMissing =
    insurance.missing + tech.missing + parking.missing + extinguisher.missing;

  const urgent = docsExpired + docsSoon + oilOverdue + oilDueSoon;

  const compliancePct =
    (docsValid /
      Math.max(1, docsExpired + docsSoon + docsValid + docsMissing)) *
    100;

  return {
    total,
    assigned,
    unassigned,
    missingMileage,

    urgent,

    docs: {
      expired: docsExpired,
      soon: docsSoon,
      valid: docsValid,
      compliancePct: Math.round(compliancePct),
      byType: {
        insurance,
        tech,
        parking,
        extinguisher,
      },
    },

    oil: {
      overdue: oilOverdue,
      soon: oilDueSoon,
      missing: oilMissing,
    },
  };
}
