import { CommitMode, CommitRow, ImportPreviewResponse } from "./types/types";

export function buildMatchesIndex(preview: ImportPreviewResponse) {
  const map = new Map<number, ImportPreviewResponse["matches"][number]>();
  for (const m of preview.matches ?? []) map.set(m.rowIndex, m);
  return map;
}

export function defaultModeForRow(args: {
  hasErrors: boolean;
  bestMatchScore?: number;
}): CommitMode {
  if (args.hasErrors) return "skip";
  if ((args.bestMatchScore ?? 0) >= 80) return "skip"; // doublon fort → skip
  if ((args.bestMatchScore ?? 0) >= 50) return "update"; // doublon probable → update
  return "create"; // nouveau → create
}

export function buildCommitRow(args: {
  rowIndex: number;
  mode: CommitMode;
  targetId?: string;
  normalized: any;
}): CommitRow {
  const { rowIndex, mode, targetId, normalized } = args;

  if (mode === "skip") return { rowIndex, mode, targetId };

  // create/update -> data requis
  return {
    rowIndex,
    mode,
    ...(mode === "update" ? { targetId } : {}),
    data: normalized,
  };
}
