// notify.handler.ts
import { NotificationEventPayload } from "@sigem/shared";
import {
  fmtDate,
  fmtDocType,
  fmtDue,
  fmtMileage,
  fmtVehicle,
} from "@sigem/shared/utils/formatters";
import { mapSeverityToNotificationType } from "@sigem/shared/http";
import { Notification } from "../models/notification.model";
import { sendOtpEmail } from "./send-otp-email";
import { IMPORTANT, KNOWN_TOPICS } from "../utils/constants";

type SocketIO = any;

function inferTitleAndMessage(
  topic: string,
  evt: NotificationEventPayload,
): { title: string; message: string } {
  // Tu peux raffiner ce switch plus tard (Dashboard-friendly)
  switch (topic) {
    case "supply.plan.status.changed": {
      const e: any = evt;
      const label = e.label ?? e.planLabel ?? e.planName;
      const id = e.planId ?? e.resourceId ?? e.id;
      const from = e.fromStatus ?? e.data?.fromStatus;
      const to = e.toStatus ?? e.data?.toStatus;

      return {
        title: e.title ?? "Statut du plan mis à jour",
        message:
          e.message ??
          `Le statut du plan${label ? ` "${label}"` : ""}${id ? ` (#${id})` : ""}` +
            (from && to ? ` : ${from} → ${to}.` : "."),
      };
    }
    case "supply.plan.created": {
      const e: any = evt;
      const label = e.label ?? e.planLabel ?? e.planName;
      const id = e.planId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Plan prévisionnel créé",
        message:
          e.message ??
          `Un plan prévisionnel a été créé${label ? ` : "${label}"` : ""}${id ? ` (#${id})` : ""}.`,
      };
    }

    case "supply.plan.completed": {
      const e: any = evt;
      const label = e.label ?? e.planLabel ?? e.planName;
      const id = e.planId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Plan prévisionnel terminé",
        message:
          e.message ??
          `Le plan${label ? ` "${label}"` : ""}${id ? ` (#${id})` : ""} a été marqué comme terminé.`,
      };
    }

    case "supply.plan.deleted": {
      const e: any = evt;
      const label = e.label ?? e.planLabel ?? e.planName;
      const id = e.planId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Plan prévisionnel supprimé",
        message:
          e.message ??
          `Un plan prévisionnel a été supprimé${label ? ` : "${label}"` : ""}${id ? ` (#${id})` : ""}.`,
      };
    }

    case "supply.item.created": {
      const e: any = evt;
      const label = e.itemLabel ?? e.label ?? e.name;
      const id = e.itemId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Article créé",
        message:
          e.message ??
          `Un article a été créé${label ? ` : "${label}"` : ""}${id ? ` (#${id})` : ""}.`,
      };
    }

    case "supply.item.updated": {
      const e: any = evt;
      const label = e.itemLabel ?? e.label ?? e.name;
      const id = e.itemId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Article mis à jour",
        message:
          e.message ??
          `Un article a été mis à jour${label ? ` : "${label}"` : ""}${id ? ` (#${id})` : ""}.`,
      };
    }

    case "supply.item.deactivated":
    case "SUPPLY_ITEM_DEACTIVATED": {
      const e: any = evt;
      const label = e.itemLabel ?? e.label ?? e.name;
      const id = e.itemId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Article désactivé",
        message:
          e.message ??
          `Un article a été désactivé${label ? ` : "${label}"` : ""}${id ? ` (#${id})` : ""}.`,
      };
    }

    case "supply.item.activated":
    case "SUPPLY_ITEM_ACTIVATED": {
      const e: any = evt;
      const label = e.itemLabel ?? e.label ?? e.name;
      const id = e.itemId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Article activé",
        message:
          e.message ??
          `Un article a été activé${label ? ` : "${label}"` : ""}${id ? ` (#${id})` : ""}.`,
      };
    }

    case "supply.price.updated": {
      const e: any = evt;
      const label = e.itemLabel ?? e.label ?? e.name;
      const id = e.priceId ?? e.resourceId ?? e.id;
      const oldPrice = e.oldPrice ?? e.data?.oldPrice;
      const newPrice = e.newPrice ?? e.data?.newPrice;

      return {
        title: e.title ?? "Prix mis à jour",
        message:
          e.message ??
          `Le prix a été mis à jour${label ? ` pour "${label}"` : ""}` +
            (oldPrice != null && newPrice != null
              ? ` : ${oldPrice} → ${newPrice}`
              : "") +
            `${id ? ` (#${id})` : ""}.`,
      };
    }

    case "supply.price.deleted": {
      const e: any = evt;
      const label = e.itemLabel ?? e.label ?? e.name;
      const id = e.priceId ?? e.resourceId ?? e.id;

      return {
        title: e.title ?? "Prix supprimé",
        message:
          e.message ??
          `Un prix a été supprimé${label ? ` pour "${label}"` : ""}${id ? ` (#${id})` : ""}.`,
      };
    }
    case "asset.created":
    case "ASSET_CREATED":
      return {
        title: evt.title ?? "Nouvel équipement créé",
        message:
          evt.message ??
          `L'équipement "${evt.label ?? evt.assetId}" a été ajouté au patrimoine.`,
      };
    case "asset.updated":
    case "ASSET_UPDATED":
      return {
        title: evt.title ?? "Équipement mis à jour",
        message:
          evt.message ??
          `L'équipement "${evt.label ?? evt.assetId}" a été mis à jour.`,
      };

    case "asset.deleted":
    case "ASSET_DELETED":
      return {
        title: evt.title ?? "Équipement supprimé",
        message:
          evt.message ??
          `L'équipement "${evt.label ?? evt.assetId}" a été supprimé.`,
      };

    case "asset.restored":
    case "ASSET_RESTORED":
      return {
        title: evt.title ?? "Équipement restauré",
        message:
          evt.message ??
          `L'équipement "${evt.label ?? evt.assetId}" a été restauré.`,
      };

    case "asset.location.changed":
    case "ASSET_LOCATION_CHANGED":
      return {
        title: evt.title ?? "Changement de localisation",
        message:
          evt.message ??
          `L'équipement "${evt.label ?? evt.assetId}" a été déplacé` +
            (evt.fromLocationLabel && evt.toLocationLabel
              ? ` de "${evt.fromLocationLabel}" vers "${evt.toLocationLabel}".`
              : "."),
      };

    case "asset.status.changed":
    case "ASSET_STATUS_CHANGED":
      return {
        title: evt.title ?? "Changement d'état",
        message:
          evt.message ??
          `L'état de "${evt.label ?? evt.assetId}" est passé ` +
            (evt.fromStatus && evt.toStatus
              ? `de ${evt.fromStatus} à ${evt.toStatus}.`
              : "."),
      };

    case "asset.quantity.changed":
    case "ASSET_QUANTITY_CHANGED":
      return {
        title: evt.title ?? "Quantité mise à jour",
        message:
          evt.message ??
          `La quantité de "${evt.label ?? evt.assetId}" a changé` +
            (typeof evt.fromQuantity === "number" &&
            typeof evt.toQuantity === "number"
              ? ` (${evt.fromQuantity} → ${evt.toQuantity}).`
              : "."),
      };

    case "asset.transfer":
    case "ASSET_TRANSFER":
      return {
        title: evt.title ?? "Transfert d'équipement",
        message:
          evt.message ?? `Transfert de "${evt.label ?? evt.assetId}" effectué.`,
      };
    case "stock.low":
    case "STOCK_LOW":
      return {
        title: evt.title ?? "Stock faible",
        message:
          evt.message ??
          `Le stock de "${evt.label ?? evt.assetId}" est passé en seuil bas.`,
      };
    case "stock.critical":
    case "STOCK_CRITICAL":
      return {
        title: evt.title ?? "Stock critique",
        message:
          evt.message ??
          `Le stock de "${evt.label ?? evt.assetId}" est en niveau critique.`,
      };

    // =======================
    // VEHICLE: CRUD / ACTIONS
    // =======================
    case "vehicle.created": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      return {
        title: e.title ?? "Véhicule ajouté",
        message: e.message ?? `Véhicule ${vehicle} a été ajouté au parc.`,
      };
    }

    case "vehicle.updated": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const changes =
        Array.isArray(e.changes) && e.changes.length
          ? ` Modifs: ${e.changes.join(", ")}.`
          : "";
      return {
        title: e.title ?? "Véhicule mis à jour",
        message: e.message ?? `Véhicule ${vehicle}.${changes}`.trim(),
      };
    }

    case "vehicle.deleted": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      return {
        title: e.title ?? "Véhicule retiré",
        message: e.message ?? `Véhicule ${vehicle} a été retiré du parc.`,
      };
    }

    case "vehicle.mileage.updated": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const from = fmtMileage(e.fromMileage);
      const to = fmtMileage(e.toMileage ?? e.currentMileage);
      return {
        title: e.title ?? "Kilométrage mis à jour",
        message:
          e.message ??
          `Véhicule ${vehicle} : ${from ? `${from} → ` : ""}${to}.`,
      };
    }

    // =======================
    // VEHICLE DOCUMENTS: CRUD
    // =======================
    case "vehicle.document.created": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      const exp = fmtDate(e.expiresAt);
      return {
        title: e.title ?? "Document ajouté",
        message:
          e.message ??
          `${doc} ajouté pour le véhicule ${vehicle}. Expire le ${exp}.`,
      };
    }

    case "vehicle.document.updated": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      const changes =
        Array.isArray(e.changes) && e.changes.length
          ? ` Modifs: ${e.changes.join(", ")}.`
          : "";
      const exp = e.expiresAt ? ` Expire le ${fmtDate(e.expiresAt)}.` : "";
      return {
        title: e.title ?? "Document mis à jour",
        message:
          e.message ??
          `${doc} du véhicule ${vehicle} mis à jour.${changes}${exp}`.trim(),
      };
    }

    case "vehicle.document.deleted": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      return {
        title: e.title ?? "Document supprimé",
        message: e.message ?? `${doc} supprimé pour le véhicule ${vehicle}.`,
      };
    }

    // =======================
    // VEHICLE DOCUMENTS: MONITORING
    // =======================
    case "vehicle.document.due_soon": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      const exp = fmtDate(e.expiresAt);
      const daysLeft =
        typeof e.daysLeft === "number" ? ` (J-${e.daysLeft})` : "";
      return {
        title: e.title ?? `À renouveler : ${doc}`,
        message:
          e.message ?? `Véhicule ${vehicle}. Expire le ${exp}${daysLeft}.`,
      };
    }

    case "vehicle.document.expired": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      const exp = fmtDate(e.expiresAt);
      const late =
        typeof e.daysOverdue === "number" ? ` (+${e.daysOverdue}j)` : "";
      return {
        title: e.title ?? `Expiré : ${doc}`,
        message:
          e.message ?? `Véhicule ${vehicle}. Expiré depuis le ${exp}${late}.`,
      };
    }

    case "vehicle.document.renewed": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      const prev = e.previousExpiresAt ? fmtDate(e.previousExpiresAt) : null;
      const next = e.newExpiresAt
        ? fmtDate(e.newExpiresAt)
        : fmtDate(e.expiresAt);
      return {
        title: e.title ?? `Renouvelé : ${doc}`,
        message:
          e.message ??
          `Véhicule ${vehicle}. Validité ${prev ? `${prev} → ` : ""}${next}.`,
      };
    }

    // =======================
    // VEHICLE TASKS: CRUD / CYCLE
    // =======================
    case "vehicle.task.created": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tâche";
      const due = fmtDue(e);
      return {
        title: e.title ?? `Tâche créée : ${task}`,
        message: e.message ?? `Véhicule ${vehicle}. ${due}`.trim(),
      };
    }

    case "vehicle.task.updated": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tâche";
      const changes =
        Array.isArray(e.changes) && e.changes.length
          ? ` Modifs: ${e.changes.join(", ")}.`
          : "";
      const due = fmtDue(e);
      return {
        title: e.title ?? `Tâche mise à jour : ${task}`,
        message: e.message ?? `Véhicule ${vehicle}. ${due}${changes}`.trim(),
      };
    }

    case "vehicle.task.deleted": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tâche";
      return {
        title: e.title ?? `Tâche supprimée : ${task}`,
        message: e.message ?? `Véhicule ${vehicle}.`,
      };
    }

    case "vehicle.task.completed": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tâche";
      const when = e.completedAt
        ? fmtDate(e.completedAt)
        : fmtDate(e.timestamp);
      const km =
        e.completedMileage != null
          ? ` (${fmtMileage(e.completedMileage)})`
          : "";
      return {
        title: e.title ?? `Terminé : ${task}`,
        message: e.message ?? `Véhicule ${vehicle}. Réalisé le ${when}${km}.`,
      };
    }

    case "vehicle.task.next_planned": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tâche";
      const due = fmtDue(e);
      return {
        title: e.title ?? `Prochaine échéance planifiée : ${task}`,
        message: e.message ?? `Véhicule ${vehicle}. ${due}`.trim(),
      };
    }
    // Ajouts pour la surveillance des véhicules
    case "vehicle.task.due_soon": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const due = fmtDue(e);

      const taskLabel = e.taskLabel ?? e.label ?? "Maintenance";
      return {
        title: `À planifier : ${taskLabel}`,
        message: `Véhicule ${vehicle}. ${due}`.trim(),
      };
    }

    case "vehicle.task.overdue": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const due = fmtDue(e);

      const taskLabel = e.taskLabel ?? e.label ?? "Maintenance";
      return {
        title: `En retard : ${taskLabel}`,
        message: `Véhicule ${vehicle}. ${due}`.trim(),
      };
    }
    case "vehicle.document.expiring":
      return {
        title: evt.title ?? "Document véhicule bientôt expiré",
        message:
          evt.message ??
          `Le document "${(evt as any).documentType ?? "Document"}" du véhicule ${
            (evt as any).vehiclePlate ?? (evt as any).vehicleId ?? "-"
          } arrive à expiration.`,
      };
    default:
      return {
        title: evt.title ?? `Événement sur ${topic}`,
        message: evt.message ?? `Événement reçu sur ${topic}`,
      };
  }
}

export async function handleIncomingEvent(
  io: SocketIO,
  rawEvt: any,
  topic: string,
) {
  const evt = rawEvt as NotificationEventPayload;

  /* Uncomment this section when transport is secure for notifications */
  // 1) Send OTP email event
  // if (topic === "auth.otp.requested") {
  //   // expected payload
  //   // {email, code, expiresInMinutes, userName?}

  //   const { email, code, expiresInMinutes = 5, userName } = evt as any;

  //   if (!email || !code) {
  //     console.warn("OTP email event missing email or code:", evt);
  //     return;
  //   }

  //   try {
  //     await sendOtpEmail({
  //       to: email,
  //       code,
  //       expiresInMinutes,
  //       userName,
  //     })
  //   } catch (error) {
  //     // wont break the consumer: log and keep going
  //     console.error("[mail][otp] failed:", error);
  //   }

  //   // Selon ta stratégie:
  //   // - soit tu RETURN ici (OTP = email only)
  //   // - soit tu continues pour aussi enregistrer une notif DB
  //   return; // OTP email handled, no need to create a notification
  // }

  const { title, message } = inferTitleAndMessage(topic, evt);
  const severity = mapSeverityToNotificationType(evt.severity);
  const isKnown =
    KNOWN_TOPICS.has(topic) || (evt.type && KNOWN_TOPICS.has(evt.type));

  if (!isKnown && !IMPORTANT.has(severity)) {
    return; // Ignorer les notifications non importantes si le topic est inconnu
  }

  // 1️⃣ Sauvegarder en base
  const doc = await Notification.create({
    type: evt.type ?? topic,
    severity,
    title,
    message,
    payload: evt,
    userId: evt.userId,
    role: evt.role,
    read: false,
  });

  const anyEvt = evt as any;
  const relatedResource = anyEvt.taskId
    ? {
        resourceType: anyEvt.resourceType ?? "VehicleTask",
        resourceId: anyEvt.taskId,
      }
    : anyEvt.documentId
      ? {
          resourceType: anyEvt.resourceType ?? "VehicleDocument",
          resourceId: anyEvt.documentId,
        }
      : anyEvt.vehicleId
        ? {
            resourceType: anyEvt.resourceType ?? "Vehicle",
            resourceId: anyEvt.vehicleId,
          }
        : (evt as any).assetId || evt.resourceId
          ? {
              resourceType: evt.resourceType ?? "Asset",
              resourceId: (evt as any).assetId ?? evt.resourceId,
            }
          : undefined;

  const p = doc.payload ?? {};
  // 2️⃣ Construire le payload Socket aligné avec le front
  const notificationPayload = {
    id: doc._id.toString(),
    title: doc.title ?? doc.type,
    message: doc.message ?? "",
    type: doc.type,
    severity: doc.severity,
    createdAt: doc.createdAt,

    payload: doc.payload,
    meta: {
      // vehicle
      vehiclePlate: p.vehiclePlate,
      vehicleBrand: p.vehicleBrand,
      vehicleModel: p.vehicleModel,

      // task
      taskLabel: p.taskLabel,
      dueAt: p.dueAt,
      dueMileage: p.dueMileage,
      currentMileage: p.currentMileage,

      // document
      documentType: p.documentType ?? p.type,
      expiresAt: p.expiresAt,
    },

    relatedResource,
    isRead: doc.read,
    isDeleted: false,
  };

  // 3️⃣ Ciblage : userId > rôle > global
  if (evt.userId) {
    io.to(`user:${evt.userId}`).emit("notification:user", notificationPayload);
  } else if (evt.role) {
    io.to(`role:${evt.role}`).emit("notification:user", notificationPayload);
  } else if (Array.isArray(evt.recipients) && evt.recipients.length > 0) {
    evt.recipients.forEach((userId) => {
      io.to(`user:${userId}`).emit("notification:user", notificationPayload);
    });
  } else {
    io.emit("notification:global", notificationPayload);
  }
}
