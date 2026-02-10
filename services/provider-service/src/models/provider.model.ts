import { Document, model, Schema, Types } from "mongoose";

export type ProviderType = "FOURNISSEUR" | "PRESTATAIRE";

export interface ProviderDoc extends Document<Types.ObjectId> {
  name: string;
  designation: string;

  type?: ProviderType;
  phones: string[];
  emails: string[];
  website?: string;

  notes?: string;
  tags: string[];

  isActive: boolean;
  dept?: string; // optionnel (filtrage par département/entité)

  searchText: string; // pour recherche rapide

  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<ProviderDoc>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["FOURNISSEUR", "PRESTATAIRE"],
      default: "FOURNISSEUR",
    },

    // Multi contacts comme dans l’Excel
    phones: { type: [String], default: [] },
    emails: { type: [String], default: [] },
    website: { type: String, trim: true },

    notes: { type: String, trim: true },
    tags: { type: [String], default: [] },

    isActive: { type: Boolean, default: true, index: true },
    dept: { type: String, trim: true, index: true },

    // Pour recherche simple (optionnel, mais utile)
    // On remplit ça via pre-save ci-dessous
    searchText: { type: String, default: "", index: true },
  },
  { timestamps: true },
);

/**
 * Normalisation légère + searchText (pour search regex rapide)
 */
ProviderSchema.pre("save", function (next) {
  const doc = this as ProviderDoc & { searchText?: string };

  doc.name = doc.name?.trim();
  doc.designation = doc.designation?.trim();

  doc.phones = (doc.phones ?? []).map((p) => String(p).trim()).filter(Boolean);

  doc.emails = (doc.emails ?? [])
    .map((e) => String(e).trim().toLowerCase())
    .filter(Boolean);

  doc.tags = (doc.tags ?? [])
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);

  if (doc.website) doc.website = String(doc.website).trim();

  // searchText: concat pour recherche (name/designation/phones/emails/website/tags)
  const parts = [
    doc.name,
    doc.designation,
    doc.type,
    doc.dept,
    ...(doc.phones ?? []),
    ...(doc.emails ?? []),
    doc.website,
    ...(doc.tags ?? []),
  ].filter(Boolean);

  doc.searchText = parts.join(" ").toLowerCase();

  next();
});

// Index texte (optionnel) : si vous préférez $text plutôt que regex
// ProviderSchema.index({ name: "text", designation: "text", emails: "text", phones: "text", website: "text" });

// JSON propre
ProviderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

ProviderSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const ProviderModel = model<ProviderDoc>("Provider", ProviderSchema);
