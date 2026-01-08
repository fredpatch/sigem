import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDirectorySearchEnriched } from "../hooks/useEmployee";
import { useDebouncedValue } from "./use-debounced";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SigemStatusBadge({ sigem }: { sigem: any }) {
  if (!sigem?.exists)
    return (
      <Badge className="rounded-none" variant="secondary">
        NON ENRÔLÉ
      </Badge>
    );
  if (sigem.status === "ACTIVE")
    return <Badge className="rounded-none">ACTIVE</Badge>;
  if (sigem.status === "PENDING")
    return (
      <Badge variant="outline" className="rounded-none">
        PENDING
      </Badge>
    );
  return (
    <Badge variant="destructive" className="rounded-none">
      DISABLED
    </Badge>
  );
}

// function TwoFABadge({ sigem }: { sigem: any }) {
//   if (!sigem?.exists) return null;
//   if (!sigem.is2FAEnabled) return <Badge variant="secondary">2FA OFF</Badge>;
//   return sigem.is2FAValidated ? (
//     <Badge>2FA OK</Badge>
//   ) : (
//     <Badge variant="outline">2FA …</Badge>
//   );
// }

export function UserDirectorySidebar() {
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 500);
  const navigate = useNavigate();
  const { matricule } = useParams();

  //   const query = useEmployeeDirectorySearch(dq); // 🔜 hook
  const query = useDirectorySearchEnriched(dq); // 🔜 hook
  const items = query.data ?? [];

  return (
    <div className="space-y-3">
      <Input
        placeholder="Rechercher (matricule, prénom, nom)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/users")}
        disabled={!matricule}
      >
        Effacer la sélection
      </Button>

      <Card className="p-2">
        <div className="text-xs text-muted-foreground px-2 pb-2">
          Annuaire ANAC
        </div>

        <div className="max-h-[60vh] overflow-auto pr-1">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((e) => {
              const active = String(e.matricule) === String(matricule);

              return (
                <button
                  key={e.matricule}
                  onClick={() => navigate(`/users/${e.matricule}`)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition hover:bg-muted/40 focus:outline-none",
                    active ? "border-primary bg-muted/50" : "border-border"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm leading-tight">
                        {e.firstName} {e.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {e.direction}
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className="rounded-none font-mono text-xs"
                    >
                      {e.matricule}
                    </Badge>
                  </div>

                  {/* Badges */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <SigemStatusBadge sigem={e.sigem} />

                    {e.sigem?.exists && e.sigem?.role && (
                      <Badge
                        variant="secondary"
                        className="rounded-none text-xs"
                      >
                        {e.sigem.role}
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                    {e.fonction}
                  </div>
                </button>
              );
            })}
          </div>

          {!query.isLoading && items.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              Aucun résultat.
            </div>
          )}

          {query.isLoading && (
            <div className="p-3 text-sm text-muted-foreground">
              Chargement...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
