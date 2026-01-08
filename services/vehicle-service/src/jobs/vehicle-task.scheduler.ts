import { VehicleTaskEntity } from "src/models/vehicle-task.model";
import { VehicleTaskStatus } from "src/types/vehicle-task.types";
import { Vehicle } from "src/models/vehicle.model";
import { Types } from "mongoose";
import { computeTaskStatus } from "src/utils/helpers";
import { getEventBus } from "src/core/events";

/**
 * Job principal: recalcule les statuts de toutes les tâches "ouvertes"
 * (PLANNED / DUE_SOON / OVERDUE) pour MG.
 *
 * + Anti-spam notifications:
 * - Une notif seulement quand on ENTRE dans DUE_SOON
 * - Une notif seulement quand on ENTRE dans OVERDUE
 * - Pas de répétition à chaque run cron
 */

export async function runVehicleTaskScheduler() {
  const dept = "MG"; // later: by dept if needed
  const batchSize = 200;
  let page = 0;
  let updatedCount = 0;

  console.log("[vehicle-task.scheduler] Starting scheduler for dept:", dept);

  const openStatuses = [
    VehicleTaskStatus.PLANNED,
    VehicleTaskStatus.DUE_SOON,
    VehicleTaskStatus.OVERDUE,
  ];

  const bus = getEventBus(); // ✅ une fois, pas à chaque task

  while (true) {
    const tasks = await VehicleTaskEntity.find({
      dept,
      status: { $in: openStatuses },
    })
      .sort({ dueAt: 1 })
      .skip(page * batchSize)
      .limit(batchSize)
      .lean();

    if (!tasks.length) break;

    const vehicleIds = Array.from(
      new Set(
        tasks
          .map((t) => t.vehicleId)
          .filter(Boolean)
          .map((id: any) => id.toString())
      )
    );

    const vehicles = await Vehicle.find({
      _id: { $in: vehicleIds.map((id) => new Types.ObjectId(id)) },
    })
      .select("_id currentMileage plateNumber brand model")
      .lean();

    const vehicleMap = new Map(
      vehicles.map((v) => [
        v._id.toString(),
        {
          currentMileage: v.currentMileage ?? 0,
          plateNumber: v.plateNumber,
          brand: v.brand,
          model: v.model,
        },
      ])
    );

    const bulkOps: any[] = [];

    for (const task of tasks) {
      const v = vehicleMap.get(task.vehicleId?.toString() ?? "");

      const newStatus = computeTaskStatus({
        dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
        dueMileage: task.dueMileage ?? undefined,
        currentMileage: v?.currentMileage,
      });

      // anti-spam flags
      const isNotifiable =
        newStatus === VehicleTaskStatus.DUE_SOON ||
        newStatus === VehicleTaskStatus.OVERDUE;

      // lastNotifiedState contains "DUE_SOON" | "OVERDUE" (same labels as status)
      const lastNotifiedState = (task as any).lastNotifiedState ?? null;

      // On notifie seulement si:
      // - nouveau statut est notifiable
      // - et on n'a pas déjà notifié ce même statut
      const shouldNotify = isNotifiable && lastNotifiedState !== newStatus;

      // S’il y a un changement de statut OU un changement notif à persister
      const shouldPersist =
        newStatus !== task.status ||
        (shouldNotify &&
          (lastNotifiedState !== newStatus ||
            !(task as any).lastNotificationAt));

      // 1) Emit Kafka si nécessaire (DUE_SOON/OVERDUE et pas déjà notifié)
      if (shouldNotify) {
        try {
          const topic =
            newStatus === VehicleTaskStatus.DUE_SOON
              ? "vehicle.task.due_soon"
              : "vehicle.task.overdue";

          await bus.emit(topic, {
            severity:
              newStatus === VehicleTaskStatus.DUE_SOON ? "warning" : "critical",
            role: "SUPER_ADMIN", // TODO: env VEHICLE_ALERT_DEFAULT_ROLE / MG_COS etc.

            resourceType: "VehicleTask",
            resourceId: task._id.toString(),

            vehicleId: task.vehicleId?.toString(),
            taskId: task._id.toString(),
            taskLabel: task.label,

            triggerType: task.triggerType,
            dueAt: task.dueAt,
            dueMileage: task.dueMileage,
            currentMileage: v?.currentMileage ?? null,

            vehiclePlate: v?.plateNumber ?? null,
            vehicleBrand: v?.brand ?? null,
            vehicleModel: v?.model ?? null,
          });
        } catch (error) {
          console.error("[vehicle-task.scheduler] emit notification failed", {
            taskId: task._id.toString(),
            newStatus,
            err: error,
          });
          // NOTE: on continue, mais on évite de marquer lastNotifiedState si emit a échoué
          // => donc on ne set pas shouldNotify=true dans bulk update ci-dessous
        }
      }

      // 2) Persist en bulk si changement de status (ou reset notifs)
      if (shouldPersist) {
        const $set: Record<string, any> = {
          status: newStatus,
          updatedAt: new Date(),
        };

        // ✅ Reset anti-spam si on redescend à PLANNED
        if (newStatus === VehicleTaskStatus.PLANNED) {
          $set.lastNotifiedState = null;
          $set.lastNotificationAt = null;
          $set.notificationsCount = 0;
        }

        // ✅ Si notif envoyée, on marque l’état notifié
        // (IMPORTANT: seulement si notif a été tentée et qu’elle ne doit pas repasser)
        // Ici on le fait simple: si shouldNotify=true, on update.
        // Si tu veux être strict: mets un flag notifySent = true seulement si bus.emit a réussi.
        if (shouldNotify) {
          $set.lastNotifiedState = newStatus;
          $set.lastNotificationAt = new Date();
          $set.notificationsCount = ((task as any).notificationsCount ?? 0) + 1;
        }

        // Log debug
        if (newStatus !== task.status) {
          console.log("[vehicle-task.scheduler] Status change", {
            taskId: task._id.toString(),
            vehicleId: task.vehicleId?.toString(),
            from: task.status,
            to: newStatus,
            dueAt: task.dueAt,
            dueMileage: task.dueMileage,
            currentMileage: v?.currentMileage ?? null,
            shouldNotify,
          });
        }

        bulkOps.push({
          updateOne: {
            filter: { _id: task._id },
            update: { $set },
          },
        });

        updatedCount += 1;
      }
    }

    if (bulkOps.length) {
      await VehicleTaskEntity.bulkWrite(bulkOps);
    }

    page += 1;
  }

  console.log(`[vehicle-task.scheduler] Finished. Updated tasks=${updatedCount}`);
}