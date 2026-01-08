import { Document, model, Schema } from "mongoose";

export type ReferenceResource = "asset" | "vehicle" | "inventory" | string;
export type ReferenceField =
    | "brand"
    | "model"
    | "type"
    | "ownership"
    | "assignedToDirection"
    | string;

export interface ReferenceValueDocument extends Document {
    dept: string;                 // MG
    resource: ReferenceResource;  // vehicle
    field: ReferenceField;        // brand
    value: string;                // "Toyota"
    normalizedValue: string;      // "toyota"
    count: number;                // combien de fois utilisé
    lastUsedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReferenceValueSchema = new Schema<ReferenceValueDocument>(
    {
        dept: { type: String, required: true, index: true },
        resource: { type: String, required: true, index: true },
        field: { type: String, required: true, index: true },

        value: { type: String, required: true, trim: true },
        normalizedValue: { type: String, required: true, index: true },

        count: { type: Number, default: 1, min: 0 },
        lastUsedAt: { type: Date, default: Date.now },
    },
    { timestamps: true, collection: "reference_values" }
);

// Unicité fonctionnelle
ReferenceValueSchema.index(
    { dept: 1, resource: 1, field: 1, normalizedValue: 1 },
    { unique: true }
);

// JSON propre
ReferenceValueSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
    },
});

export const ReferenceValue = model<ReferenceValueDocument>(
    "ReferenceValue",
    ReferenceValueSchema
);