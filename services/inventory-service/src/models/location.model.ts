// Location.ts
import { Schema, model } from "mongoose";

export enum LocationLevel {
  LOCALISATION = "LOCALISATION",
  BATIMENT = "BATIMENT",
  DIRECTION = "DIRECTION",
  BUREAU = "BUREAU",
}

const LocationSchema = new Schema(
  {
    localisation: { type: String, required: true }, // ex: "ESTUAIRE"
    batiment: { type: String, required: true }, // ex: "A"
    direction: { type: String, required: true }, // ex: "DG", "Secrétaria", ...
    bureau: { type: String, required: true }, // ex: "Pool Charge d'étude"
    code: { type: String, required: true }, // ex: "ESTUAIRE-A-DG"
    path: { type: String, required: true }, // ex: "ESTUAIRE/A/DG/Pool Charge d'étude"
    level: {
      type: String,
      enum: Object.values(LocationLevel),
      default: LocationLevel.BUREAU,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// LocationSchema.index({ code: 1 }, { unique: true });
LocationSchema.index(
  { localisation: 1, batiment: 1, direction: 1, bureau: 1 },
  { unique: true }
);

// ----------------- helpers -----------------
const upper = (s?: string) => (s ?? "").toUpperCase().trim();

// "Agence Comptable" -> "AC", "Pool Charge d'étude" -> "PCE", "DG" -> "DG"
function shortFromLabel(label: string, maxLen = 3): string {
  const up = upper(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!up) return "";
  const words = up.split(/[^A-Z0-9]+/).filter(Boolean);
  if (words.length > 1)
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, maxLen);
  // single word -> take first consonants, fallback to first chars
  const consonants = up.replace(/[AEIOUY]/g, "");
  return (consonants || up).slice(0, maxLen);
}

// ----------------- auto-fill -----------------
LocationSchema.pre("validate", function (next) {
  const doc = this as any;

  doc.localisation = upper(doc.localisation);
  doc.batiment = upper(doc.batiment);
  doc.direction = upper(doc.direction);
  doc.bureau = upper(doc.bureau);

  // Human-readable path
  doc.path = `${doc.localisation}/${doc.batiment}/${doc.direction}/${doc.bureau}`;

  // Machine code (short & stable)
  const bureauShort = shortFromLabel(doc.bureau, 3); // e.g. "AC"
  doc.code = `${doc.localisation}-${doc.batiment}-${doc.direction}-${bureauShort}`;

  return next();
});

export const Location = model("Location", LocationSchema);
