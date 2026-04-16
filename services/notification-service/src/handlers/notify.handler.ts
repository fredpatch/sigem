import {
  fmtDate,
  fmtDocType,
  fmtDue,
  fmtMileage,
  fmtVehicle,
  mapSeverityToNotificationType,
  NotificationEventPayload,
} from "@sigem/shared";
import { Notification } from "../models/notification.model";
import { IMPORTANT, KNOWN_TOPICS } from "../utils/constants";

type SocketIO = any;

function pickDisplayValue(
  ...values: Array<string | number | null | undefined>
): string | undefined {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return undefined;
}

function normalizeNotificationMessage(topic: string, message: string): string {
  if (
    topic.startsWith("supply.item.") ||
    topic.startsWith("provider.") ||
    topic.startsWith("supply.price.")
  ) {
    return message.replace(/\s+\(#([^)]+)\)/g, "");
  }

  return message;
}

function resolveTopic(topic: string, evt: NotificationEventPayload): string {
  return topic === "notify.event" && evt.type ? evt.type : topic;
}

function shouldPersistNotification(
  topic: string,
  resolvedTopic: string,
  evt: NotificationEventPayload,
  severity: string,
): boolean {
  // `notify.event` is a transport wrapper. Persist only when it resolves to a
  // concrete business notification type.
  if (topic === "notify.event" && (!evt.type || resolvedTopic === "notify.event")) {
    return false;
  }

  const isKnown =
    KNOWN_TOPICS.has(resolvedTopic) || (!!evt.type && KNOWN_TOPICS.has(evt.type));

  return isKnown || IMPORTANT.has(severity);
}

function buildProviderMessage(evt: any, topic: string) {
  const label = pickDisplayValue(
    evt.label,
    evt.designation,
    evt.name,
    evt.data?.designation,
    evt.data?.name,
  );
  const providerId =
    evt.providerId ?? evt.resourceId ?? evt.id ?? evt.data?.providerId;
  const providerType = pickDisplayValue(evt.providerType, evt.data?.providerType);
  const subject =
    providerType === "FOURNISSEUR" ? "Le fournisseur" : "Le prestataire";

  const fallbackByTopic: Record<string, { title: string; verb: string }> = {
    "provider.created": { title: "Prestataire cree", verb: "cree" },
    "provider.updated": { title: "Prestataire mis a jour", verb: "mis a jour" },
    "provider.deactivated": {
      title: "Prestataire desactive",
      verb: "desactive",
    },
    "provider.activated": { title: "Prestataire reactive", verb: "reactive" },
  };

  const current = fallbackByTopic[topic];
  return {
    title: evt.title ?? current.title,
    message:
      evt.message ??
      `${subject}${label ? ` "${label}"` : providerId ? ` (ref. ${providerId})` : ""} a ete ${current.verb}.`,
  };
}

function buildSupplyItemMessage(evt: any, topic: string) {
  const label = pickDisplayValue(
    evt.itemLabel,
    evt.label,
    evt.name,
    evt.data?.reference,
    evt.data?.label,
  );
  const itemId = evt.itemId ?? evt.resourceId ?? evt.id ?? evt.data?.itemId;
  const fallbackByTopic: Record<string, { title: string; verb: string }> = {
    "supply.item.created": { title: "Article cree", verb: "cree" },
    "supply.item.updated": { title: "Article mis a jour", verb: "mis a jour" },
    "supply.item.deactivated": {
      title: "Article desactive",
      verb: "desactive",
    },
    SUPPLY_ITEM_DEACTIVATED: {
      title: "Article desactive",
      verb: "desactive",
    },
    "supply.item.activated": { title: "Article active", verb: "active" },
    SUPPLY_ITEM_ACTIVATED: { title: "Article active", verb: "active" },
  };

  const current = fallbackByTopic[topic];
  return {
    title: evt.title ?? current.title,
    message:
      evt.message ??
      `Un article a ete ${current.verb}${label ? ` : "${label}"` : itemId ? ` (ref. ${itemId})` : ""}.`,
  };
}

function buildSupplyPriceMessage(evt: any, topic: string) {
  const label = pickDisplayValue(
    evt.itemLabel,
    evt.label,
    evt.name,
    evt.data?.reference,
    evt.data?.label,
  );
  const priceId = evt.priceId ?? evt.resourceId ?? evt.id ?? evt.data?.priceId;
  const oldPrice = evt.oldPrice ?? evt.data?.oldPrice;
  const newPrice = evt.newPrice ?? evt.data?.newPrice ?? evt.data?.unitPrice;

  if (topic === "supply.price.updated") {
    return {
      title: evt.title ?? "Prix mis a jour",
      message:
        evt.message ??
        `Le prix a ete mis a jour${label ? ` pour "${label}"` : priceId ? ` (ref. ${priceId})` : ""}` +
          (oldPrice != null && newPrice != null
            ? ` : ${oldPrice} -> ${newPrice}.`
            : "."),
    };
  }

  return {
    title: evt.title ?? "Prix supprime",
    message:
      evt.message ??
      `Un prix a ete supprime${label ? ` pour "${label}"` : priceId ? ` (ref. ${priceId})` : ""}.`,
  };
}

function buildSupplyPlanMessage(evt: any, topic: string) {
  const label = pickDisplayValue(
    evt.label,
    evt.planLabel,
    evt.planName,
    evt.data?.label,
    evt.data?.reference,
  );
  const id = evt.planId ?? evt.resourceId ?? evt.id;
  const from = evt.fromStatus ?? evt.data?.fromStatus;
  const to = evt.toStatus ?? evt.data?.toStatus;

  switch (topic) {
    case "supply.plan.status.changed":
      return {
        title: evt.title ?? "Statut du plan mis a jour",
        message:
          evt.message ??
          `Le statut du plan${label ? ` "${label}"` : id ? ` (ref. ${id})` : ""}` +
            (from && to ? ` : ${from} -> ${to}.` : "."),
      };
    case "supply.plan.created":
      return {
        title: evt.title ?? "Plan previsionnel cree",
        message:
          evt.message ??
          `Un plan previsionnel a ete cree${label ? ` : "${label}"` : id ? ` (ref. ${id})` : ""}.`,
      };
    case "supply.plan.completed":
      return {
        title: evt.title ?? "Plan previsionnel termine",
        message:
          evt.message ??
          `Le plan${label ? ` "${label}"` : id ? ` (ref. ${id})` : ""} a ete marque comme termine.`,
      };
    default:
      return {
        title: evt.title ?? "Plan previsionnel supprime",
        message:
          evt.message ??
          `Un plan previsionnel a ete supprime${label ? ` : "${label}"` : id ? ` (ref. ${id})` : ""}.`,
      };
  }
}

function inferTitleAndMessage(
  topic: string,
  evt: NotificationEventPayload,
): { title: string; message: string } {
  switch (topic) {
    case "provider.created":
    case "provider.updated":
    case "provider.deactivated":
    case "provider.activated":
      return buildProviderMessage(evt as any, topic);

    case "supply.item.created":
    case "supply.item.updated":
    case "supply.item.deactivated":
    case "SUPPLY_ITEM_DEACTIVATED":
    case "supply.item.activated":
    case "SUPPLY_ITEM_ACTIVATED":
      return buildSupplyItemMessage(evt as any, topic);

    case "supply.price.updated":
    case "supply.price.deleted":
      return buildSupplyPriceMessage(evt as any, topic);

    case "supply.plan.status.changed":
    case "supply.plan.created":
    case "supply.plan.completed":
    case "supply.plan.deleted":
      return buildSupplyPlanMessage(evt as any, topic);

    case "asset.created":
    case "ASSET_CREATED":
      return {
        title: evt.title ?? "Nouvel equipement cree",
        message:
          evt.message ??
          `L'equipement "${evt.label ?? evt.assetId}" a ete ajoute au patrimoine.`,
      };

    case "asset.updated":
    case "ASSET_UPDATED":
      return {
        title: evt.title ?? "Equipement mis a jour",
        message:
          evt.message ??
          `L'equipement "${evt.label ?? evt.assetId}" a ete mis a jour.`,
      };

    case "asset.deleted":
    case "ASSET_DELETED":
      return {
        title: evt.title ?? "Equipement supprime",
        message:
          evt.message ??
          `L'equipement "${evt.label ?? evt.assetId}" a ete supprime.`,
      };

    case "asset.restored":
    case "ASSET_RESTORED":
      return {
        title: evt.title ?? "Equipement restaure",
        message:
          evt.message ??
          `L'equipement "${evt.label ?? evt.assetId}" a ete restaure.`,
      };

    case "asset.location.changed":
    case "ASSET_LOCATION_CHANGED":
      return {
        title: evt.title ?? "Changement de localisation",
        message:
          evt.message ??
          `L'equipement "${evt.label ?? evt.assetId}" a ete deplace` +
            (evt.fromLocationLabel && evt.toLocationLabel
              ? ` de "${evt.fromLocationLabel}" vers "${evt.toLocationLabel}".`
              : "."),
      };

    case "asset.status.changed":
    case "ASSET_STATUS_CHANGED":
      return {
        title: evt.title ?? "Changement d'etat",
        message:
          evt.message ??
          `L'etat de "${evt.label ?? evt.assetId}" est passe ` +
            (evt.fromStatus && evt.toStatus
              ? `de ${evt.fromStatus} a ${evt.toStatus}.`
              : "."),
      };

    case "asset.quantity.changed":
    case "ASSET_QUANTITY_CHANGED":
      return {
        title: evt.title ?? "Quantite mise a jour",
        message:
          evt.message ??
          `La quantite de "${evt.label ?? evt.assetId}" a change` +
            (typeof evt.fromQuantity === "number" &&
            typeof evt.toQuantity === "number"
              ? ` (${evt.fromQuantity} -> ${evt.toQuantity}).`
              : "."),
      };

    case "asset.transfer":
    case "ASSET_TRANSFER":
      return {
        title: evt.title ?? "Transfert d'equipement",
        message:
          evt.message ?? `Transfert de "${evt.label ?? evt.assetId}" effectue.`,
      };

    case "stock.low":
    case "STOCK_LOW":
      return {
        title: evt.title ?? "Stock faible",
        message:
          evt.message ??
          `Le stock de "${evt.label ?? evt.assetId}" est passe en seuil bas.`,
      };

    case "stock.critical":
    case "STOCK_CRITICAL":
      return {
        title: evt.title ?? "Stock critique",
        message:
          evt.message ??
          `Le stock de "${evt.label ?? evt.assetId}" est en niveau critique.`,
      };

    case "vehicle.created": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      return {
        title: e.title ?? "Vehicule ajoute",
        message: e.message ?? `Vehicule ${vehicle} a ete ajoute au parc.`,
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
        title: e.title ?? "Vehicule mis a jour",
        message: e.message ?? `Vehicule ${vehicle}.${changes}`.trim(),
      };
    }

    case "vehicle.deleted": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      return {
        title: e.title ?? "Vehicule retire",
        message: e.message ?? `Vehicule ${vehicle} a ete retire du parc.`,
      };
    }

    case "vehicle.mileage.updated": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const from = fmtMileage(e.fromMileage);
      const to = fmtMileage(e.toMileage ?? e.currentMileage);
      return {
        title: e.title ?? "Kilometrage mis a jour",
        message:
          e.message ?? `Vehicule ${vehicle} : ${from ? `${from} -> ` : ""}${to}.`,
      };
    }

    case "vehicle.document.created": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      const exp = fmtDate(e.expiresAt);
      return {
        title: e.title ?? "Document ajoute",
        message:
          e.message ?? `${doc} ajoute pour le vehicule ${vehicle}. Expire le ${exp}.`,
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
        title: e.title ?? "Document mis a jour",
        message:
          e.message ??
          `${doc} du vehicule ${vehicle} mis a jour.${changes}${exp}`.trim(),
      };
    }

    case "vehicle.document.deleted": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      return {
        title: e.title ?? "Document supprime",
        message: e.message ?? `${doc} supprime pour le vehicule ${vehicle}.`,
      };
    }

    case "vehicle.document.due_soon": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const doc = fmtDocType(e.documentType ?? e.type);
      const exp = fmtDate(e.expiresAt);
      const daysLeft =
        typeof e.daysLeft === "number" ? ` (J-${e.daysLeft})` : "";
      return {
        title: e.title ?? `A renouveler : ${doc}`,
        message:
          e.message ?? `Vehicule ${vehicle}. Expire le ${exp}${daysLeft}.`,
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
        title: e.title ?? `Expire : ${doc}`,
        message:
          e.message ?? `Vehicule ${vehicle}. Expire depuis le ${exp}${late}.`,
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
        title: e.title ?? `Renouvele : ${doc}`,
        message:
          e.message ??
          `Vehicule ${vehicle}. Validite ${prev ? `${prev} -> ` : ""}${next}.`,
      };
    }

    case "vehicle.task.created": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tache";
      const due = fmtDue(e);
      return {
        title: e.title ?? `Tache creee : ${task}`,
        message: e.message ?? `Vehicule ${vehicle}. ${due}`.trim(),
      };
    }

    case "vehicle.task.updated": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tache";
      const changes =
        Array.isArray(e.changes) && e.changes.length
          ? ` Modifs: ${e.changes.join(", ")}.`
          : "";
      const due = fmtDue(e);
      return {
        title: e.title ?? `Tache mise a jour : ${task}`,
        message: e.message ?? `Vehicule ${vehicle}. ${due}${changes}`.trim(),
      };
    }

    case "vehicle.task.deleted": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tache";
      return {
        title: e.title ?? `Tache supprimee : ${task}`,
        message: e.message ?? `Vehicule ${vehicle}.`,
      };
    }

    case "vehicle.task.completed": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tache";
      const when = e.completedAt ? fmtDate(e.completedAt) : fmtDate(e.timestamp);
      const km =
        e.completedMileage != null ? ` (${fmtMileage(e.completedMileage)})` : "";
      return {
        title: e.title ?? `Termine : ${task}`,
        message: e.message ?? `Vehicule ${vehicle}. Realise le ${when}${km}.`,
      };
    }

    case "vehicle.task.next_planned": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const task = e.taskLabel ?? e.label ?? "Tache";
      const due = fmtDue(e);
      return {
        title: e.title ?? `Prochaine echeance planifiee : ${task}`,
        message: e.message ?? `Vehicule ${vehicle}. ${due}`.trim(),
      };
    }

    case "vehicle.task.due_soon": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const due = fmtDue(e);
      const taskLabel = e.taskLabel ?? e.label ?? "Maintenance";
      return {
        title: `A planifier : ${taskLabel}`,
        message: `Vehicule ${vehicle}. ${due}`.trim(),
      };
    }

    case "vehicle.task.overdue": {
      const e: any = evt;
      const vehicle = fmtVehicle(e);
      const due = fmtDue(e);
      const taskLabel = e.taskLabel ?? e.label ?? "Maintenance";
      return {
        title: `En retard : ${taskLabel}`,
        message: `Vehicule ${vehicle}. ${due}`.trim(),
      };
    }

    case "vehicle.document.expiring":
      return {
        title: evt.title ?? "Document vehicule bientot expire",
        message:
          evt.message ??
          `Le document "${(evt as any).documentType ?? "Document"}" du vehicule ${
            (evt as any).vehiclePlate ?? (evt as any).vehicleId ?? "-"
          } arrive a expiration.`,
      };

    default:
      return {
        title: evt.title ?? `Evenement sur ${topic}`,
        message: evt.message ?? `Evenement recu sur ${topic}`,
      };
  }
}

export async function handleIncomingEvent(
  io: SocketIO,
  rawEvt: any,
  topic: string,
) {
  const evt = rawEvt as NotificationEventPayload;
  const resolvedTopic = resolveTopic(topic, evt);

  const { title, message } = inferTitleAndMessage(resolvedTopic, evt);
  const normalizedMessage = normalizeNotificationMessage(
    resolvedTopic,
    message,
  );
  const severity = mapSeverityToNotificationType(evt.severity);
  if (!shouldPersistNotification(topic, resolvedTopic, evt, severity)) {
    return;
  }

  const doc = await Notification.create({
    type: evt.type ?? topic,
    severity,
    title,
    message: normalizedMessage,
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
  const notificationPayload = {
    id: doc._id.toString(),
    title: doc.title ?? doc.type,
    message: doc.message ?? "",
    type: doc.type,
    severity: doc.severity,
    createdAt: doc.createdAt,
    payload: doc.payload,
    meta: {
      vehiclePlate: p.vehiclePlate,
      vehicleBrand: p.vehicleBrand,
      vehicleModel: p.vehicleModel,
      taskLabel: p.taskLabel,
      dueAt: p.dueAt,
      dueMileage: p.dueMileage,
      currentMileage: p.currentMileage,
      documentType: p.documentType ?? p.type,
      expiresAt: p.expiresAt,
    },
    relatedResource,
    isRead: doc.read,
    isDeleted: false,
  };

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
