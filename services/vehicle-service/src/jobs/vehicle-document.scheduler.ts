import { Types } from "mongoose";
import { Vehicle } from "src/models/vehicle.model";
import { VehicleDocumentEntity } from "src/models/vehicle-document.model";
import { getEventBus } from "src/core/events";

type DocState = "DUE_SOON" | "EXPIRED" | null;

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function diffDays(a: Date, b: Date) {
    // a - b (en jours entiers)
    const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Détermine l'état du document en fonction de expiresAt et reminderDaysBefore.
 * - EXPIRED si now > expiresAt
 * - DUE_SOON si now est dans la fenêtre [expiresAt - max(reminderDaysBefore), expiresAt]
 * - sinon null (OK)
 */
function computeDocumentState(params: {
    expiresAt: Date;
    reminderDaysBefore?: number[];
    now?: Date;
}): { state: DocState; daysLeft?: number; daysOverdue?: number } {
    const now = params.now ?? new Date();
    const expiresAt = new Date(params.expiresAt);

    if (now > expiresAt) {
        return { state: "EXPIRED", daysOverdue: diffDays(now, expiresAt) };
    }

    const list = (params.reminderDaysBefore ?? [30, 15, 7])
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n > 0)
        .sort((a, b) => b - a);

    const maxWindow = list.length ? list[0] : 0;
    if (!maxWindow) return { state: null };

    const windowStart = new Date(expiresAt);
    windowStart.setDate(windowStart.getDate() - maxWindow);

    if (now >= windowStart) {
        return { state: "DUE_SOON", daysLeft: diffDays(expiresAt, now) };
    }

    return { state: null };
}

/**
 * Scheduler documents:
 * - détecte due_soon / expired
 * - notifie une seule fois par état (lastNotifiedState)
 * - reset si redevenu OK
 */
export async function runVehicleDocumentScheduler() {
    const dept = "MG";
    const batchSize = 200;
    let page = 0;
    let updatedCount = 0;

    console.log("[vehicle-doc.scheduler] Starting scheduler for dept:", dept);

    const bus = getEventBus();
    const now = new Date();

    while (true) {
        // On prend les docs potentiellement concernés:
        // - expiresAt proche ou dépassé (ça réduit le volume)
        // Fenêtre large: 120 jours en arrière -> 120 jours à venir
        const from = new Date(now);
        from.setDate(from.getDate() - 120);

        const to = new Date(now);
        to.setDate(to.getDate() + 120);

        const docs = await VehicleDocumentEntity.find({
            expiresAt: { $gte: from, $lte: to },
        })
            .sort({ expiresAt: 1 })
            .skip(page * batchSize)
            .limit(batchSize)
            .lean();

        if (!docs.length) break;

        const vehicleIds = Array.from(
            new Set(docs.map((d: any) => d.vehicleId?.toString()).filter(Boolean))
        );

        // ⚠️ Vehicle a dept, VehicleDocument non. Donc on filtre par dept via Vehicle.
        const vehicles = await Vehicle.find({
            _id: { $in: vehicleIds.map((id) => new Types.ObjectId(id)) },
            dept,
        })
            .select("_id plateNumber brand model")
            .lean();

        const vehicleMap = new Map(
            vehicles.map((v: any) => [
                v._id.toString(),
                { plateNumber: v.plateNumber, brand: v.brand, model: v.model },
            ])
        );

        const bulkOps: any[] = [];

        for (const doc of docs as any[]) {
            const v = vehicleMap.get(doc.vehicleId?.toString?.() ?? "");
            if (!v) continue; // doc lié à un véhicule hors dept

            const { state, daysLeft, daysOverdue } = computeDocumentState({
                expiresAt: doc.expiresAt,
                reminderDaysBefore: doc.reminderDaysBefore,
                now,
            });

            const lastNotifiedState: DocState = doc.lastNotifiedState ?? null;

            // Anti-spam: ne notifie que si on entre dans un état différent
            const shouldNotify = state && lastNotifiedState !== state;

            // Si doc redevient OK (ex: expiresAt repoussé), on reset le state
            const shouldReset = !state && lastNotifiedState !== null;

            if (!shouldNotify && !shouldReset) continue;

            // --- Emit Kafka si needed ---
            if (shouldNotify) {
                try {
                    const topic =
                        state === "EXPIRED"
                            ? "vehicle.document.expiring"
                            : "vehicle.document.due_soon";

                    await bus.emit(topic, {
                        severity: state === "EXPIRED" ? "critical" : "warning",
                        role: "SUPER_ADMIN", // TODO: mettre MG_COS par défaut via env

                        dept,
                        resourceType: "VehicleDocument",
                        resourceId: doc._id.toString(),

                        vehicleId: doc.vehicleId?.toString?.(),
                        vehiclePlate: v.plateNumber ?? null,
                        vehicleBrand: v.brand ?? null,
                        vehicleModel: v.model ?? null,

                        documentId: doc._id.toString(),
                        documentType: doc.type,
                        reference: doc.reference ?? null,

                        expiresAt: doc.expiresAt,
                        issuedAt: doc.issuedAt ?? null,

                        daysLeft: typeof daysLeft === "number" ? daysLeft : undefined,
                        daysOverdue:
                            typeof daysOverdue === "number" ? daysOverdue : undefined,
                    });
                } catch (error) {
                    console.error("[vehicle-doc.scheduler] emit failed", {
                        documentId: doc._id.toString(),
                        state,
                        err: error,
                    });
                    // si emit échoue, on ne marque pas lastNotifiedState
                    continue;
                }
            }

            const $set: Record<string, any> = {
                updatedAt: new Date(),
            };

            if (shouldReset) {
                $set.lastNotifiedState = null;
                // on ne touche pas forcément lastNotificationAt/history
            }

            if (shouldNotify) {
                $set.lastNotifiedState = state;
                $set.lastNotificationAt = new Date();
                $set.notificationsCount = (doc.notificationsCount ?? 0) + 1;
            }

            bulkOps.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set },
                },
            });

            updatedCount += 1;
        }

        if (bulkOps.length) {
            await VehicleDocumentEntity.bulkWrite(bulkOps);
        }

        page += 1;
    }

    console.log(
        `[vehicle-doc.scheduler] Finished. Updated docs=${updatedCount}`
    );
}
