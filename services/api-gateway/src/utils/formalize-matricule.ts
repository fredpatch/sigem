export function normalizeMatricule(input: unknown): string {
  const s = String(input ?? "").trim();

  // garde uniquement les chiffres
  const digits = s.replace(/\D/g, "");

  // si vide → renvoie vide (ou throw si tu préfères)
  if (!digits) return "";

  // si + de 4, on ne tronque pas: on garde tel quel (à ajuster selon ta règle)
  // si tu veux FORCER 4: digits.slice(-4)
  return digits.padStart(4, "0");
}
