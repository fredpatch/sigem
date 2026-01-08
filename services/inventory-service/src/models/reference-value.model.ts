import { model, Schema } from "mongoose"

export type ReferenceKey =
    | "asset.label"
    | "asset.brand"
    | "asset.model"

const normalize = (s?: string) =>
    (s ?? "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const ReferenceValueSchema = new Schema(
    {
        dept: { type: String, required: true, default: "MG", index: true }, // ex: "MG"
        key: { type: String, required: true, index: true }, // ex: "asset.label"
        value: { type: String, required: true },            // ex: "Ordinateur portable"
        normalized: { type: String, required: true },       // ex: "ORDINATEUR PORTABLE"
        usageCount: { type: Number, default: 0 },
        lastUsedAt: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

ReferenceValueSchema.index({ dept: 1, key: 1, normalized: 1 }, { unique: true });

ReferenceValueSchema.pre("validate", function (next) {
    const doc = this as any;
    doc.value = (doc.value ?? "").trim();
    doc.normalized = normalize(doc.value);
    next();
});

export const ReferenceValue = model("ReferenceValue", ReferenceValueSchema);
export const normalizeRef = normalize;