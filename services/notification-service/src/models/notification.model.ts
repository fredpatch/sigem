import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    type: { type: String, required: true }, // e.g., "asset.created"
    title: { type: String }, // optional convenience
    message: { type: String }, // optional convenience
    payload: { type: Schema.Types.Mixed, required: true },
    userId: { type: String }, // ciblage optionnel
    role: { type: String }, // ciblage par rôle optionnel
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    deleted: { type: Boolean, default: false },

    severity: { type: String, enum: ["info", "warning", "error", "success"], default: "info" },
  },
  { timestamps: true }
);

// TTL (ex: auto-supp 90j) — à activer si utile
NotificationSchema.index(
  { createdAt: -1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 }
);
NotificationSchema.index({ role: 1, createdAt: -1 });
NotificationSchema.index({ read: 1, createdAt: -1 });

export const Notification = model("Notification", NotificationSchema);
