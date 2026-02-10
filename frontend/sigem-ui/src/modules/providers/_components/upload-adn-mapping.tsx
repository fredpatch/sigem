import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useProviderImportInspect } from "../hooks/use-import";
import { MAPPING_FIELDS, suggest } from "../types/import";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  onGeneratePreview: (payload: {
    file: File;
    mapping: any;
  }) => void | Promise<void>;
  isLoading?: boolean;
  error?: any;
};

const IGNORE = "__IGNORE__";
type InspectResponse = { ok: boolean; headers: string[]; sample?: any[] };

export function UploadAndMappingStep({ onGeneratePreview, error }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [inspect, setInspect] = useState<InspectResponse | null>(null);

  const [mapping, setMapping] = useState<Record<string, string>>({});

  const inspectMut = useProviderImportInspect();

  // quand file change -> inspect
  useEffect(() => {
    if (!file) {
      setInspect(null);
      setMapping({});
      return;
    }

    (async () => {
      const res = await inspectMut.mutateAsync(file);
      setInspect(res);

      const auto = suggest(res.headers ?? []);
      // initialise mapping seulement si vide (ne pas écraser choix user)
      setMapping((prev) => {
        if (Object.keys(prev).length) return prev;
        const next: Record<string, string> = {};
        for (const f of MAPPING_FIELDS) {
          const v = auto[f.key];
          if (v) next[f.key] = v;
        }
        return next;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const headers = inspect?.headers ?? [];

  const requiredOk = useMemo(() => {
    for (const f of MAPPING_FIELDS) {
      if (f.required && !mapping[f.key]) return false;
    }
    return true;
  }, [mapping]);

  const canSubmit = !!file && requiredOk && !inspectMut.isPending;

  const setField = (key: string, value?: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>1) Upload + Mapping</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload fichier */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="text-sm font-medium">Fichier à importer</div>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {file && (
            <div className="text-xs text-muted-foreground">
              Fichier sélectionné : {file.name}
            </div>
          )}
        </div>

        {/* Loading inspect */}
        {file && inspectMut.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Lecture des colonnes...
          </div>
        )}

        {/* Mapping */}
        {headers.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-medium">Mapping des colonnes</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MAPPING_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {f.label} {f.required ? "• requis" : ""}
                  </div>

                  <Select
                    value={mapping[f.key] ?? IGNORE}
                    onValueChange={(v) =>
                      v === IGNORE
                        ? setField(f.key, undefined)
                        : setField(f.key, v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="— sélectionner une colonne —" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={IGNORE}>(Ignorer)</SelectItem>

                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {f.required && !mapping[f.key] && (
                    <div className="text-xs text-red-600">
                      Champ requis non mappé
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground pt-2">
              Astuce : on a pré-rempli automatiquement quand une colonne
              ressemble au champ.
            </div>
          </div>
        )}

        {/* Erreur API */}
        {error && (
          <div className="rounded-md border p-3 text-sm text-red-600">
            {error.message || "Erreur lors de la génération de l’aperçu"}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            disabled={!canSubmit}
            onClick={() => {
              if (!file) return;
              onGeneratePreview({ file, mapping });
            }}
          >
            Générer aperçu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
