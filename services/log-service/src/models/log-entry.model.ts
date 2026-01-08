import { Schema, model } from "mongoose";

/**
 * Schéma générique pour les logs d'action.
 * TTL 90j via expireAt (index TTL).
 */
const LogEntrySchema = new Schema(
  {
    eventId: { type: String, index: true },
    type: { type: String, required: true }, // ex: "audit.action"
    topic: { type: String, required: true }, // "log.action"
    userId: { type: String },
    username: { type: String }, // <-- AJOUT
    role: { type: String },
    dept: { type: String, default: "MG" },
    resourceType: { type: String },
    resourceId: { type: String },
    payload: { type: Schema.Types.Mixed },
    http: {
      // <-- AJOUT (optionnel mais utile)
      method: String,
      path: String,
      status: Number,
      ip: String,
      userAgent: String,
    },
    severity: {
      type: String,
      enum: ["info", "success", "warning", "error", "critical"],
      default: "info",
    },
    createdAt: { type: Date, default: () => new Date(), index: true },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 3600 * 1000),
      index: true,
    },
  },
  {
    collection: "logs",
  }
);

LogEntrySchema.index({ "http.path": 1, createdAt: -1 });
LogEntrySchema.index({ username: 1, createdAt: -1 });
LogEntrySchema.index({ type: 1, createdAt: -1 });
LogEntrySchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

export type LogEntry = typeof LogEntryModel extends infer T ? T : any;
export const LogEntryModel = model("LogEntry", LogEntrySchema);
