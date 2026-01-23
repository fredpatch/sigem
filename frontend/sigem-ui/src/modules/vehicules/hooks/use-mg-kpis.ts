import { classifyDue, daysUntil } from "../helpers/helpers";
import { MGMaintenanceRow } from "../types/mg.types";

export function computeMgSidebarKpis(rows: MGMaintenanceRow[]) {
  const total = rows.length;

  let assigned = 0;
  let unassigned = 0;

  let missingMileage = 0;

  // docs
  let insuranceExpired = 0,
    insuranceSoon = 0,
    insuranceValid = 0,
    insuranceMissing = 0;
  let techExpired = 0,
    techSoon = 0,
    techValid = 0,
    techMissing = 0;
  let parkingExpired = 0,
    parkingSoon = 0,
    parkingValid = 0,
    parkingMissing = 0;
  let extExpired = 0,
    extSoon = 0,
    extValid = 0,
    extMissing = 0;

  // maintenance km
  let oilDueSoon = 0;
  let oilOverdue = 0;
  let oilMissing = 0;

  for (const v of rows) {
    // affectation
    if (v.assignedToName) assigned++;
    else unassigned++;

    // mileage quality
    if (typeof (v as any).currentMileage !== "number") missingMileage++; // si tu l’as dans row; sinon retire

    // insurance
    {
      const cls = classifyDue(daysUntil(v.insuranceExpiresAt));
      if (cls === "expired") insuranceExpired++;
      else if (cls === "soon") insuranceSoon++;
      else if (cls === "valide") insuranceValid++;
      else insuranceMissing++;
    }

    // tech
    {
      const cls = classifyDue(daysUntil(v.nextTechVisitAt));
      if (cls === "expired") techExpired++;
      else if (cls === "soon") techSoon++;
      else if (cls === "valide") techValid++;
      else techMissing++;
    }

    // parking (si tu l’as ajouté dans MGMaintenanceRow)
    {
      const cls = classifyDue(daysUntil((v as any).parkingExpiresAt));
      if (cls === "expired") parkingExpired++;
      else if (cls === "soon") parkingSoon++;
      else if (cls === "valide") parkingValid++;
      else parkingMissing++;
    }

    // extinguisher
    {
      const cls = classifyDue(daysUntil(v.extinguisherExpiresAt));
      if (cls === "expired") extExpired++;
      else if (cls === "soon") extSoon++;
      else if (cls === "valide") extValid++;
      else extMissing++;
    }

    // oil change
    {
      const nextKm = v.nextOilChangeKm ?? null;
      const lastKm = v.lastOilChangeKm ?? null;

      // si pas de prochaine échéance => data incomplète
      if (typeof nextKm !== "number") {
        oilMissing++;
      } else {
        // idéal: compare avec currentMileage (si tu l’as dans MG row)
        const kmNow = (v as any).currentMileage as number | undefined;
        if (typeof kmNow === "number") {
          const delta = nextKm - kmNow;
          if (delta < 0) oilOverdue++;
          else if (delta <= 500) oilDueSoon++; // seuil MG: 500km (à ajuster)
        } else {
          // fallback: si on n’a pas currentMileage, on juge “soon” si nextKm est proche du lastKm+cadence
          oilDueSoon++;
        }
      }
    }
  }

  const docsExpired =
    insuranceExpired + techExpired + parkingExpired + extExpired;
  const docsSoon = insuranceSoon + techSoon + parkingSoon + extSoon;
  const docsValid = insuranceValid + techValid + parkingValid + extValid;

  const urgent = docsExpired + docsSoon + oilOverdue + oilDueSoon;

  const compliancePct =
    (docsValid / Math.max(1, docsExpired + docsSoon + docsValid)) * 100;

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
        insurance: {
          expired: insuranceExpired,
          soon: insuranceSoon,
          valid: insuranceValid,
          missing: insuranceMissing,
        },
        tech: {
          expired: techExpired,
          soon: techSoon,
          valid: techValid,
          missing: techMissing,
        },
        parking: {
          expired: parkingExpired,
          soon: parkingSoon,
          valid: parkingValid,
          missing: parkingMissing,
        },
        extinguisher: {
          expired: extExpired,
          soon: extSoon,
          valid: extValid,
          missing: extMissing,
        },
      },
    },

    oil: {
      overdue: oilOverdue,
      soon: oilDueSoon,
      missing: oilMissing,
    },
  };
}
