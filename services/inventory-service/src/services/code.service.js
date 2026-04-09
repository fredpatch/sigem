// src/modules/inventory/services/CodeService.ts
import { Category } from "../models/category.model";
import { Location } from "../models/location.model";
import { Sequence } from "../models/sequence.model";
// Par défaut: `${F}${B}${S}-${NNN}`
const DEFAULT_TEMPLATE = ({ F, B, S, NNN }) => `${F}${B}${S}-${NNN}`;
const upper = (s) => (s ?? "").toUpperCase();
export function initial(s) {
    return upper(s).trim().charAt(0) || "";
}
function pad3(n) {
    return String(n).padStart(3, "0");
}
// ---------- Sub-cat short from label (1–2) ----------
function subcatShortFromLabel(label, maxLen = 2) {
    const s = upper(label ?? "")
        .toUpperCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]+/g, " ")
        .trim();
    if (!s)
        return "XX";
    const words = s.split(" ").filter(Boolean);
    // Multi-mots: initiales (comme tu fais déjà)
    if (words.length > 1) {
        return words
            .map((w) => w[0])
            .join("")
            .slice(0, maxLen)
            .padEnd(maxLen, "X");
    }
    // Mot unique: 1ère + dernière lettre (plus distinctif que "consonnes")
    const w = words[0];
    if (w.length === 1)
        return (w + "X")
            .slice(0, maxLen); // pad si besoin
    if (maxLen === 1)
        return w[0];
    const first = w[0];
    const last = w[w.length - 1];
    // const candidate = `${first}${last}`.slice(0, maxLen);
    // fallback si last est vide (rare)
    // return candidate || w.slice(0, maxLen);
    return (w[0] + w[w.length - 1]).slice(0, maxLen);
}
// ---------- Building short (1–2) ----------
function compressShortCode(raw, maxLen = 2) {
    const s = upper(raw);
    if (!s)
        return "";
    const tokens = s.split(/[^A-Z0-9]+/).filter(Boolean);
    const shorts = tokens.filter((t) => t.length <= maxLen);
    if (shorts.length)
        return shorts[0];
    return tokens.length ? tokens[0].charAt(0) : "";
}
async function getFamilyInitial(categoryId, session) {
    const cat = await Category.findById(categoryId)
        .session(session ?? null)
        .select("label family parentId")
        .lean()
        .exec();
    if (!cat)
        return "";
    if (!cat.parentId)
        return initial(cat.family || cat.label);
    const parent = await Category.findById(cat.parentId)
        .select("label family parentId")
        .session(session ?? null)
        .lean()
        .exec();
    // If parent is not root (bad data), fallback to whatever we have
    if (!parent)
        return initial(cat.family || cat.label);
    if (parent.parentId)
        return initial(parent.family || parent.label);
    return initial(parent.family || parent.label);
}
// ---------- SUBCAT: robust (works even if canonicalPrefix missing) ----------
async function getSubcatShort(categoryId, subcatLabelHint, maxLen = 2, session) {
    const cat = await Category.findById(categoryId)
        .select("label canonicalPrefix parentId family")
        .session(session ?? null)
        .lean()
        .exec();
    if (!cat) {
        // worst-case: rely on hint
        return subcatShortFromLabel(subcatLabelHint, maxLen);
    }
    // If it's a root family, derive from asset label hint
    if (!cat.parentId) {
        return subcatShortFromLabel(subcatLabelHint, maxLen);
    }
    // If sub-cat has canonicalPrefix, use its tail (ensures stability if set)
    const cp = upper(cat.canonicalPrefix)?.replace(/[^A-Z0-9]/g, "");
    if (cp)
        return cp.slice(0, maxLen);
    // Fallback: derive from the sub-cat label
    const fromLabel = subcatShortFromLabel(cat.label, maxLen);
    if (fromLabel)
        return fromLabel;
    // Final fallback: derive from hint
    return subcatShortFromLabel(subcatLabelHint, maxLen);
}
// ---------- BUILDING: prefer Location.code, else fallbacks ----------
async function getBuildingCode(locationId, session) {
    const loc = await Location.findById(locationId)
        .select("code path localisation batiment direction bureau")
        .session(session ?? null)
        .lean()
        .exec();
    const candidates = [
        loc?.code, // e.g., "ESTUAIRE-A-DG-AC" (we compress it)
        loc?.batiment, // "A"
        loc?.bureau, // "Agence Comptable"
        loc?.path, // "ESTUAIRE/A/DG/AGENCE COMPTABLE"
        loc?.localisation,
        loc?.direction,
        loc?.label,
    ];
    for (const c of candidates) {
        const short = compressShortCode(typeof c === "string" ? c : "", 2);
        if (short)
            return short;
    }
    return "";
}
export async function nextSequence(prefix, session) {
    const doc = await Sequence.findOneAndUpdate({ _id: prefix }, { $inc: { seq: 1 } }, { new: true, upsert: true, session }).lean();
    return doc.seq;
}
export async function pickUniqueCanonicalPrefix(params) {
    const { session, parentId, label } = params;
    const siblings = await Category.find({ parentId })
        .select("canonicalPrefix label")
        .session(session)
        .lean()
        .exec();
    const used = new Set(siblings
        .map((c) => (c.canonicalPrefix ?? "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 2))
        .filter((x) => x.length === 2));
    // 1) candidat de base (TE/TU)
    const base = subcatShortFromLabel(label, 2);
    if (!used.has(base))
        return base;
    // 2) si collision, on essaie 1ère lettre + lettre suivante (déterministe)
    const clean = label
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "");
    const first = clean[0] || "X";
    for (let i = 1; i < clean.length; i++) {
        const cand = (first + clean[i]).slice(0, 2);
        if (cand.length === 2 && !used.has(cand))
            return cand;
    }
    // 3) fallback
    return "XX";
}
export async function buildAssetCode(categoryId, locationId, template = DEFAULT_TEMPLATE, subcatLabelHint, session) {
    const F = await getFamilyInitial(categoryId, session); // -> "I"
    const B = await getBuildingCode(locationId, session); // -> "A" (or "AC")
    const S = await getSubcatShort(categoryId, subcatLabelHint, 2, session); // -> "OC"
    // ✅ DEBUG TEMP
    // const cat = await Category.findById(categoryId)
    //   .select("label canonicalPrefix parentId")
    //   .session(session ?? null)
    //   .lean();
    // console.log("[buildAssetCode.debug]", {
    //   categoryId,
    //   locationId,
    //   subcatLabelHint,
    //   catLabel: cat?.label,
    //   catParentId: cat?.parentId ? String(cat.parentId) : null,
    //   catCanonicalPrefix: cat?.canonicalPrefix,
    //   computed: { F, B, S },
    // });
    // Strict bounding & sanitizing
    const F1 = (F || "").slice(0, 1).replace(/[^A-Z0-9]/g, "");
    const B2 = (B || "").slice(0, 2).replace(/[^A-Z0-9]/g, "");
    const S2 = (S || "").slice(0, 2).replace(/[^A-Z0-9]/g, "");
    // Guardrails: if F or S still empty, derive from hints (last resort)
    // TODO: !FIX category/family attribution on creation
    const Fsafe = F1 || initial("INFORMATIQUE"); // you can swap to initial(cat.family) if passed in
    const Ssafe = S2 || subcatShortFromLabel(subcatLabelHint, 2) || "X";
    const prefix = `${Fsafe}${B2}${Ssafe}`;
    const seq = await nextSequence(prefix, session);
    const NNN = pad3(seq);
    return {
        prefix,
        sequence: seq,
        code: template({ F: Fsafe, B: B2, S: Ssafe, NNN }),
    };
}
