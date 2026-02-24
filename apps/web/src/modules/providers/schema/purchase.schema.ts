import { z } from "zod";

export const PurchaseLineSchema = z.object({
  productId: z.string().min(1, "Produit requis"),
  quantity: z.coerce.number().min(1, "Quantité requise"),
  unitPrice: z.coerce.number().min(0, "Prix requis"),
  notes: z.string().optional(),
});

export const PurchaseCreateSchema = z.object({
  providerId: z.string().min(1, "Fournisseur requis"),
  date: z.string().min(1, "Date requise"),
  // status: z.enum(["DRAFT", "CONFIRMED"]).default("CONFIRMED"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(PurchaseLineSchema).min(1, "Ajoutez au moins une ligne"),
});

export const PurchaseUpdateSchema = PurchaseCreateSchema.partial().extend({});

export type PurchaseUpdateInput = z.infer<typeof PurchaseUpdateSchema>;
export type PurchaseCreateInput = z.infer<typeof PurchaseCreateSchema>;

export const purchaseDefaultValues: PurchaseCreateInput = {
  providerId: "",
  date: new Date().toISOString().slice(0, 10),
  // status: "CONFIRMED",
  reference: "",
  notes: "",
  lines: [{ productId: "", quantity: 1, unitPrice: 0, notes: "" }],
};
