import { pickUniqueCanonicalPrefix } from "src/services/code.service";
import { Category } from "../models/category.model";
import mongoose from "mongoose";

export async function ensureSubcategoryUnderFamily(
  session: mongoose.ClientSession,
  familyId: string,
  subcatLabel: string
) {
  const label = subcatLabel.trim(); // garde ta logique, tu peux aussi upper si besoin

  // ✅ recherche insensible à la casse (évite doublons Table/table)
  const existing = await Category.findOne({
    parentId: familyId,
    label: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  })
    .session(session)
    .exec();

  if (existing) {
    if (!existing.canonicalPrefix) {
      const cp = await pickUniqueCanonicalPrefix({
        session,
        parentId: familyId,
        label: existing.label as string,
      })

      existing.canonicalPrefix = cp;
      await existing.save({ session });
    }
    return existing.toObject();
  };

  const cp = await pickUniqueCanonicalPrefix({
    session,
    parentId: familyId,
    label
  })



  // If sub-cat exists under this family, return it; else create it.
  const sub = new Category({ parentId: familyId, label, canonicalPrefix: cp });

  await sub.save({ session });
  return sub.toObject();
}
