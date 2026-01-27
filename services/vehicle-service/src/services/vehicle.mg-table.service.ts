import { Vehicle } from "src/models/vehicle.model";
import { VehicleTaskEntity } from "src/models/vehicle-task.model";
import { VehicleTaskTemplateEntity } from "src/models/vehicle-task-template.model";
import { VehicleDocumentEntity } from "src/models/vehicle-document.model";

import { VehicleDocumentType } from "src/types/vehicle-document.type";
import { VehicleTaskStatus } from "src/types/vehicle-task.types";
import { VehicleTaskType } from "src/types/vehicle-task-template.type";
import { MGMaintenanceRow } from "src/schema/maintenance-row.dto";

// Functions
function pickDoc(
  docs: Array<{
    type: string;
    expiresAt?: Date;
    reference?: string;
    issuedAt?: Date;
    provider?: string;
  }>,
  type: string,
) {
  return docs.find((d) => d.type === type) ?? null;
}

function pickNextTask(tasks: any[]) {
  // next = PLANNED + plus proche (date ou mileage)
  const planned = tasks.filter((t) => t.status === VehicleTaskStatus.PLANNED);
  if (!planned.length) return null;

  planned.sort((a, b) => {
    const aKey = a.dueAt?.getTime?.() ?? Number.POSITIVE_INFINITY;
    const bKey = b.dueAt?.getTime?.() ?? Number.POSITIVE_INFINITY;

    const aKm =
      typeof a.dueMileage === "number"
        ? a.dueMileage
        : Number.POSITIVE_INFINITY;
    const bKm =
      typeof b.dueMileage === "number"
        ? b.dueMileage
        : Number.POSITIVE_INFINITY;

    // on priorise la dueAt si présente, sinon dueMileage
    return aKey !== bKey ? aKey - bKey : aKm - bKm;
  });

  return planned[0];
}

function pickLastCompletedTask(tasks: any[]) {
  const done = tasks.filter((t) => t.status === VehicleTaskStatus.COMPLETED);
  if (!done.length) return null;

  done.sort((a, b) => {
    const aKey = a.completedAt?.getTime?.() ?? 0;
    const bKey = b.completedAt?.getTime?.() ?? 0;

    const aKm = typeof a.completedMileage === "number" ? a.completedMileage : 0;
    const bKm = typeof b.completedMileage === "number" ? b.completedMileage : 0;

    // on priorise completedAt si présent, sinon completedMileage
    return bKey !== aKey ? bKey - aKey : bKm - aKm;
  });

  return done[0];
}

export async function getMGMaintenanceTable(
  dept = "MG",
): Promise<MGMaintenanceRow[]> {
  // 1) véhicules
  const vehicles = await Vehicle.find({ dept, status: "ACTIVE" })
    .lean()
    .sort({ plateNumber: 1 });

  if (!vehicles.length) return [];

  const vehicleIds = vehicles.map((v: any) => v._id);

  // 2) docs
  const docs = await VehicleDocumentEntity.find({
    vehicleId: { $in: vehicleIds },
  }).lean();

  const docsByVehicle = new Map<string, any[]>();
  for (const d of docs) {
    const key = String(d.vehicleId);
    if (!docsByVehicle.has(key)) docsByVehicle.set(key, []);
    docsByVehicle.get(key)!.push(d);
  }

  // 3) tasks
  const tasks = await VehicleTaskEntity.find({
    vehicleId: { $in: vehicleIds },
    // on peut filtrer aux types utiles Excel, sinon laisse vide
    type: {
      $in: [
        VehicleTaskType.OIL_CHANGE,
        VehicleTaskType.MAINTENANCE,
        VehicleTaskType.DOCUMENT_RENEWAL,
      ],
    },
  }).lean();

  const tasksByVehicle = new Map<string, any[]>();
  for (const t of tasks) {
    const key = String(t.vehicleId);
    if (!tasksByVehicle.has(key)) tasksByVehicle.set(key, []);
    tasksByVehicle.get(key)!.push(t);
  }

  // 4) template oil-change (cadence)
  const oilTemplate = await VehicleTaskTemplateEntity.findOne({
    dept,
    type: VehicleTaskType.OIL_CHANGE,
    active: true,
  }).lean();

  const oilEveryKm = oilTemplate?.everyKm ?? null;

  // 5) projection
  return vehicles.map((v: any) => {
    const vId = String(v._id);

    const vDocs = docsByVehicle.get(vId) ?? [];
    const vTasks = tasksByVehicle.get(vId) ?? [];

    // --- DOCS ---
    const insuranceDoc = pickDoc(vDocs, VehicleDocumentType.INSURANCE);
    const extinguisherDoc = pickDoc(
      vDocs,
      VehicleDocumentType.EXTINGUISHER_CARD,
    );
    const techDoc = pickDoc(vDocs, VehicleDocumentType.TECH_INSPECTION);
    const parkingDoc = pickDoc(vDocs, VehicleDocumentType.PARKING_CARD);

    // --- TASKS (à standardiser selon ton design) ---
    // ⚠️ Ici je suppose:
    // - Visite technique est un DOCUMENT_RENEWAL avec documentType=TECH_INSPECTION (ou label contains)
    // - Vidange est OIL_CHANGE
    // - Checking est MAINTENANCE label=CHECKING (ou type OTHER si tu veux)
    const oilTasks = vTasks.filter(
      (t) => t.type === VehicleTaskType.OIL_CHANGE,
    );

    const lastOil = pickLastCompletedTask(oilTasks);
    const nextOil = pickNextTask(oilTasks);

    const lastOilChangeNote =
      (lastOil?.completionComment &&
        String(lastOil.completionComment).trim()) ||
      null;
    const lastOilChangeAt = lastOil?.completedAt ?? null;

    // TODO: à ajuster selon ton implémentation réelle pour la visite technique
    const docById = new Map<string, any>();
    for (const d of vDocs) docById.set(String(d._id), d);

    const techTasks = vTasks.filter((t) => {
      if (t.type !== VehicleTaskType.DOCUMENT_RENEWAL) return false;
      const doc = t.vehicleDocumentId
        ? docById.get(String(t.vehicleDocumentId))
        : null;
      return doc?.type === VehicleDocumentType.TECH_INSPECTION;
    });
    const lastTech = pickLastCompletedTask(techTasks);
    const nextTech = pickNextTask(techTasks);

    // TODO: à ajuster pour le checking (selon ton type/label)
    const checkingTasks = vTasks.filter(
      (t) =>
        t.type === VehicleTaskType.MAINTENANCE &&
        /check/i.test(String(t.label ?? "")),
    );
    const baseNotes = v.maintenanceNotes?.trim() || null;

    const mergedNotes =
      [
        lastOilChangeNote
          ? `Dernière vidange le ${lastOilChangeAt?.toLocaleDateString()} : ${lastOilChangeNote}`
          : null,
        baseNotes ? `Notes véhicule : ${baseNotes}` : null,
      ]
        .filter((n) => n)
        .join(" | ") || null;

    return {
      id: vId,
      plateNumber: v.plateNumber,
      type: v.type ?? null,
      brand: v.brand,
      model: v.model,
      energy: v.energy ?? null,
      assignedToName: v.assignedToName ?? null,
      assignedToDirection: v.assignedToDirection ?? null,
      fiscalPower: v.fiscalPower ?? null,

      firstRegistrationDate: v.firstRegistrationDate ?? null,
      ownership: v.ownership ?? null,
      acquisitionDate: v.acquisitionDate ?? null,

      insuranceProvider: insuranceDoc?.provider ?? null, // si tu l’as dans Vehicle

      insuranceExpiresAt: insuranceDoc?.expiresAt ?? null,
      insuranceIssuedAt: insuranceDoc?.issuedAt ?? null,

      extinguisherIssuedAt: extinguisherDoc?.issuedAt ?? null,
      extinguisherExpiresAt: extinguisherDoc?.expiresAt ?? null,

      techInspectionIssuedAt: techDoc?.issuedAt ?? null,
      techInspectionExpiresAt: techDoc?.expiresAt ?? null,

      parkingCardIssuedAt: parkingDoc?.issuedAt ?? null,
      parkingCardExpiresAt: parkingDoc?.expiresAt ?? null,

      lastTechVisitAt: lastTech?.completedAt ?? null,
      nextTechVisitAt: nextTech?.dueAt ?? null,

      oilChangeEveryKm: oilEveryKm,
      lastOilChangeKm: lastOil?.completedMileage ?? lastOil?.dueMileage ?? null,
      nextOilChangeKm: nextOil?.dueMileage ?? null,

      lastCheckingKm: lastOil?.completedMileage ?? lastOil?.dueMileage ?? null,

      maintenanceNotes: mergedNotes,

      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    } satisfies MGMaintenanceRow;
  });
}
