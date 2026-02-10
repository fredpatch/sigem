import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { buildCommitRow, buildMatchesIndex, defaultModeForRow } from "../utils";
import { CommitMode, CommitRow, ImportPreviewResponse } from "../types/types";
import { useProvidersImportCommit } from "../hooks/use-import";

type Props = {
  preview: ImportPreviewResponse; // déjà fetché step 1
  onBack: () => void;
  onCommitted: (commit: any) => void; // setCommit + step 3
};

type RowState = {
  mode: CommitMode;
  targetId?: string;
};

export function PreviewTableStep({ preview, onBack, onCommitted }: Props) {
  const commitMut = useProvidersImportCommit();

  const matchesIndex = useMemo(() => buildMatchesIndex(preview), [preview]);

  // init state par ligne
  const [rowState, setRowState] = useState<Record<number, RowState>>(() => {
    const init: Record<number, RowState> = {};
    for (const r of preview.rows) {
      const best = matchesIndex.get(r.index)?.matches?.[0];
      const mode = defaultModeForRow({
        hasErrors: (r.errors?.length ?? 0) > 0,
        bestMatchScore: best?.score,
      });
      init[r.index] = { mode, targetId: best?.id };
    }
    return init;
  });

  const invalidCount = preview.rows.filter(
    (r) => (r.errors?.length ?? 0) > 0,
  ).length;

  const canCommit = useMemo(() => {
    if (commitMut.isPending) return false;
    // On bloque si errors dans le fichier
    if (invalidCount > 0) return false;

    // Vérifie update -> targetId obligatoire
    for (const r of preview.rows) {
      const st = rowState[r.index];
      if (!st) continue;
      if (st.mode === "update" && !st.targetId) return false;
    }
    return true;
  }, [commitMut.isPending, invalidCount, preview.rows, rowState]);

  const setMode = (rowIndex: number, mode: CommitMode) => {
    setRowState((prev) => {
      const next = { ...prev };
      const cur = next[rowIndex] ?? { mode: "skip" as CommitMode };
      next[rowIndex] = { ...cur, mode };
      return next;
    });
  };

  const setTarget = (rowIndex: number, targetId?: string) => {
    setRowState((prev) => {
      const next = { ...prev };
      const cur = next[rowIndex] ?? { mode: "update" as CommitMode };
      next[rowIndex] = { ...cur, targetId };
      return next;
    });
  };

  const buildPayload = (): CommitRow[] => {
    return preview.rows.map((r) => {
      const st = rowState[r.index] ?? { mode: "skip" as CommitMode };
      return buildCommitRow({
        rowIndex: r.index,
        mode: st.mode,
        targetId: st.targetId,
        normalized: r.normalized,
      });
    });
  };

  const handleCommit = async () => {
    const rows = buildPayload();
    const commit = await commitMut.mutateAsync({ rows });
    onCommitted(commit);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Aperçu import</div>
          <div className="text-sm text-muted-foreground">
            Total: {preview.meta.total} • Valides: {preview.meta.valid} •
            Invalides: {preview.meta.invalid}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md border" onClick={onBack}>
            Retour
          </button>

          <button
            className="px-3 py-2 rounded-md bg-black text-white disabled:opacity-50"
            onClick={handleCommit}
            disabled={!canCommit}
          >
            {commitMut.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Import en cours...
              </span>
            ) : (
              "Valider l’import"
            )}
          </button>
        </div>
      </div>

      {/* Bloc erreur global si invalid */}
      {invalidCount > 0 && (
        <div className="rounded-md border p-3 text-sm text-red-600">
          Le fichier contient {invalidCount} ligne(s) invalide(s). Corrige-les
          ou mets-les en “skip” côté fichier, puis relance l’aperçu.
        </div>
      )}

      {/* Erreur API commit */}
      {commitMut.isError && (
        <div className="rounded-md border p-3 text-sm text-red-600">
          {(commitMut.error as any)?.message || "Erreur lors du commit"}
        </div>
      )}

      {/* Table preview (simple) */}
      <div className="rounded-md border overflow-hidden">
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">
                <th className="p-2 w-16">#</th>
                <th className="p-2">Nom</th>
                <th className="p-2">Désignation</th>
                <th className="p-2">Contacts</th>
                <th className="p-2">Match</th>
                <th className="p-2 w-64">Action</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((r: any) => {
                const st = rowState[r.index];
                const bestMatches = matchesIndex.get(r.index)?.matches ?? [];
                const best = bestMatches[0];

                return (
                  <tr key={r.index} className="border-t align-top">
                    <td className="p-2 text-muted-foreground">{r.index}</td>

                    <td className="p-2">
                      <div className="font-medium">
                        {r.normalized.name ?? "-"}
                      </div>
                      {(r.errors?.length ?? 0) > 0 && (
                        <div className="mt-1 text-xs text-red-600">
                          {r.errors.join(" • ")}
                        </div>
                      )}
                      {(r.warnings?.length ?? 0) > 0 && (
                        <div className="mt-1 text-xs text-amber-600">
                          {r.warnings.join(" • ")}
                        </div>
                      )}
                    </td>

                    <td className="p-2">{r.normalized.designation ?? "-"}</td>

                    <td className="p-2 text-xs text-muted-foreground">
                      <div>{(r.normalized.phones ?? []).join(", ")}</div>
                      <div>{(r.normalized.emails ?? []).join(", ")}</div>
                    </td>

                    <td className="p-2 text-xs">
                      {best ? (
                        <div className="space-y-1">
                          <div className="font-medium">
                            {best.name} — {best.score}%
                          </div>
                          <div className="text-muted-foreground">
                            {best.designation}
                          </div>

                          {/* choix cible si update */}
                          {st?.mode === "update" && bestMatches.length > 0 && (
                            <select
                              className="mt-1 w-full border rounded px-2 py-1 text-xs"
                              value={st.targetId ?? ""}
                              onChange={(e) =>
                                setTarget(r.index, e.target.value || undefined)
                              }
                            >
                              <option value="">— choisir —</option>
                              {bestMatches.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.score}%)
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Aucun</span>
                      )}
                    </td>

                    <td className="p-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            className={`px-2 py-1 rounded border ${st?.mode === "skip" ? "bg-muted" : ""}`}
                            onClick={() => setMode(r.index, "skip")}
                          >
                            Skip
                          </button>
                          <button
                            className={`px-2 py-1 rounded border ${st?.mode === "update" ? "bg-muted" : ""}`}
                            onClick={() => setMode(r.index, "update")}
                            disabled={
                              (r.errors?.length ?? 0) > 0 ||
                              bestMatches.length === 0
                            }
                            title={
                              bestMatches.length === 0
                                ? "Aucun match pour update"
                                : ""
                            }
                          >
                            Update
                          </button>
                          <button
                            className={`px-2 py-1 rounded border ${st?.mode === "create" ? "bg-muted" : ""}`}
                            onClick={() => setMode(r.index, "create")}
                            disabled={(r.errors?.length ?? 0) > 0}
                          >
                            Create
                          </button>
                        </div>

                        {st?.mode === "update" && !st.targetId && (
                          <div className="text-xs text-red-600">
                            targetId requis pour update
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
