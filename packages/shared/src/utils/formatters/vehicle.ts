/**
 * Format vehicle info from event payload
 */
export function fmtVehicle(anyEvt: any) {
  const plate =
    anyEvt.vehiclePlate ?? anyEvt.plateNumber ?? anyEvt.vehicleId ?? "-";
  const brand = anyEvt.vehicleBrand ?? "";
  const model = anyEvt.vehicleModel ?? "";
  const car = [brand, model].filter(Boolean).join(" ");
  return car ? `${plate} (${car})` : plate;
}

/**
 * Format vehicle due date/mileage info
 */
export function fmtDue(anyEvt: any) {
  // BY_DATE → afficher date
  if (anyEvt.dueAt) {
    const d = new Date(anyEvt.dueAt);
    if (!isNaN(d.getTime()))
      return `Échéance : ${d.toLocaleDateString("fr-FR")}`;
  }
  // BY_MILEAGE → afficher km
  if (typeof anyEvt.dueMileage === "number") {
    const cur =
      typeof anyEvt.currentMileage === "number" ? anyEvt.currentMileage : null;
    const left = cur !== null ? anyEvt.dueMileage - cur : null;
    if (left !== null)
      return `Échéance : ${anyEvt.dueMileage} km (reste ~${left} km)`;
    return `Échéance : ${anyEvt.dueMileage} km`;
  }
  return "";
}

/**
 * Format vehicle mileage
 */
export function fmtMileage(km?: number) {
  if (typeof km === "number") {
    return `${km.toLocaleString("fr-FR")} km`;
  }
  return "-";
}

/**
 * Format document type label
 */
export function fmtDocType(raw?: string) {
  if (!raw) return "Document";
  const map: Record<string, string> = {
    INSURANCE: "Assurance",
    PARKING_CARD: "Carte parking",
    EXTINGUISHER_CARD: "Carte extincteur",
    TECH_INSPECTION: "Visite technique",
    OTHER: "Document",
  };
  return map[raw] ?? raw;
}

/**
 * Format date in French locale
 */
export function fmtDate(d?: any) {
  if (!d) return "-";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("fr-FR");
  } catch {
    return "-";
  }
}
