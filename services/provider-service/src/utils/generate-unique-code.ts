import { model } from "mongoose";
import { ProductDoc } from "../models/product.model";

export async function generateUniqueCode(modelName: string, base: string) {
  // format: BASE-0001
  const Product = model<ProductDoc>(modelName);
  const prefix = base || "PRODUIT";

  // On tente 1..9999, suffisant pour un prefix (sinon on ajuste)
  for (let i = 1; i < 10000; i++) {
    const code = `${prefix}-${String(i).padStart(4, "0")}`;
    const exists = await Product.exists({ code });
    if (!exists) return code;
  }
  // fallback extrême (si énorme collision)
  return `${prefix}-${Date.now()}`;
}

export function slugify(input: string) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32); // limite pour garder un code lisible
}
