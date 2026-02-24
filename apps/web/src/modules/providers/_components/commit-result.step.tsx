import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommitResponse } from "../types/import";

export function CommitResultStep({
  commit,
  onReset,
  onBackToPreview,
}: {
  commit: CommitResponse;
  onReset: () => void;
  onBackToPreview: () => void;
}) {
  const counts = commit.summary;

  const grouped = useMemo(() => {
    const items = commit.results ?? [];
    const ok = items.filter((r) => r.ok);
    const ko = items.filter((r) => !r.ok);
    return { ok, ko };
  }, [commit.results]);

  const hasErrors = counts.errors > 0 || grouped.ko.length > 0;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle>3) Résultat import</CardTitle>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Créés: {counts.create}</Badge>
          <Badge variant="secondary">Mis à jour: {counts.update}</Badge>
          <Badge variant="secondary">Ignorés: {counts.skip}</Badge>
          <Badge variant={hasErrors ? "destructive" : "secondary"}>
            Erreurs: {counts.errors}
          </Badge>

          {commit.bulk && (
            <>
              <Badge variant="outline">
                bulk.inserted: {commit.bulk.insertedCount}
              </Badge>
              <Badge variant="outline">
                bulk.modified: {commit.bulk.modifiedCount}
              </Badge>
              <Badge variant="outline">
                bulk.matched: {commit.bulk.matchedCount}
              </Badge>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inserted IDs */}
        {!!commit.inserted?.length && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm font-medium">IDs créés</div>
            <div className="flex flex-wrap gap-2">
              {commit.inserted.map((id) => (
                <Badge key={id} variant="secondary">
                  {id}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Errors list */}
        {grouped.ko.length > 0 && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm font-medium text-destructive">
              Lignes en erreur
            </div>
            <div className="space-y-2">
              {grouped.ko.slice(0, 100).map((r) => (
                <div
                  key={`${r.rowIndex}-${r.mode}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">#{r.rowIndex}</Badge>
                    <Badge variant="outline">{r.mode}</Badge>
                  </div>
                  <div className="text-muted-foreground truncate max-w-[65%]">
                    {r.error ?? "Erreur inconnue"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success list */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="text-sm font-medium">Détails (aperçu)</div>
          <div className="space-y-2">
            {(commit.results ?? []).slice(0, 100).map((r) => (
              <div
                key={`${r.rowIndex}-${r.mode}-${r.id ?? "na"}`}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">#{r.rowIndex}</Badge>
                  <Badge
                    variant={
                      r.mode === "create"
                        ? "secondary"
                        : r.mode === "update"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {r.mode}
                  </Badge>
                  {r.id && <Badge variant="outline">{r.id}</Badge>}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={r.ok ? "secondary" : "destructive"}>
                    {r.ok ? "OK" : "KO"}
                  </Badge>
                  {r.error && (
                    <span className="text-muted-foreground truncate max-w-[260px]">
                      {r.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onBackToPreview}>
            Retour aperçu
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onReset}>
              Nouvel import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
