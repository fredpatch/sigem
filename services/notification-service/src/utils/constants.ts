/**
 * Notification-service specific constants
 */

export const KNOWN_TOPICS = new Set([
  "asset.created",
  "ASSET_CREATED",
  "asset.updated",
  "ASSET_UPDATED",
  "asset.deleted",
  "ASSET_DELETED",
  "asset.restored",
  "ASSET_RESTORED",
  "asset.location.changed",
  "ASSET_LOCATION_CHANGED",
  "asset.status.changed",
  "ASSET_STATUS_CHANGED",
  "asset.quantity.changed",
  "ASSET_QUANTITY_CHANGED",
  "asset.transfer",
  "ASSET_TRANSFER",

  "stock.low",
  "STOCK_LOW",
  "stock.critical",
  "STOCK_CRITICAL",

  // ✅ Vehicle monitoring
  "vehicle.task.due_soon",
  "vehicle.task.overdue",
  "vehicle.task.completed",
  "vehicle.task.created",
  "vehicle.task.updated",
  "vehicle.task.deleted",
  "vehicle.task.next_planned",

  // vehicle documents
  "vehicle.document.created",
  "vehicle.document.updated",
  "vehicle.document.deleted",
  "vehicle.document.due_soon",
  "vehicle.document.renewed",
  "vehicle.document.expiring",

  // vehicles
  "vehicle.created",
  "vehicle.updated",
  "vehicle.deleted",
  "vehicle.mileage.updated",

  // templates (optionnel)
  "vehicle.task_template.created",
  "vehicle.task_template.updated",
  "vehicle.task_template.activated",
  "vehicle.task_template.deactivated",

  "auth.otp.requested",

  "supply.plan.created",
  "supply.plan.updated",
  "supply.plan.status.changed",
  "supply.plan.completed",
  "supply.plan.deleted",

  "supply.item.created",
  "supply.item.updated",
  "supply.item.deactivated",
  "supply.item.activated",

  "supply.price.updated",
  "supply.price.deleted",
]);

export const IMPORTANT = new Set(["warning", "error"]);
