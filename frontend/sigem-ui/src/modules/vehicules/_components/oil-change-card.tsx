import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Droplets, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

function formatKm(n?: number) {
  if (typeof n !== "number") return "-";
  return `${n.toLocaleString()} km`;
}

type ApiOilStatus = "PLANNED" | "DUE_SOON" | "OVERDUE" | "UNKNOWN";

type Props = {
  currentMileage: number;
  nextDueKm?: number;
  intervalKm?: number;
  lastDoneKm?: number;
  lastDoneAt?: string;

  // ✅ new (from API)
  remainingKm?: number | null;
  apiStatus?: ApiOilStatus;

  // fallback threshold only if apiStatus absent
  thresholdSoonKm?: number;

  isLoading?: boolean;
  error?: any;
};

export function OilChangeCard({
  currentMileage,
  nextDueKm,
  intervalKm,
  lastDoneKm,
  lastDoneAt,
  thresholdSoonKm = 500,
  isLoading,
  error,
  remainingKm,
  apiStatus,
}: Props) {
  console.log("OilChangeCard:", {
    currentMileage,
    nextDueKm,
    intervalKm,
    lastDoneKm,
    lastDoneAt,
    remainingKm,
    apiStatus,
  });

  const hasCurrentKm = typeof currentMileage === "number" && currentMileage > 0;

  const computedRemaining =
    hasCurrentKm && typeof nextDueKm === "number"
      ? nextDueKm - currentMileage
      : undefined;

  // On prend remainingKm de l'API seulement si on ne peut pas calculer,
  // ou si c'est cohérent avec le calcul.
  const remaining =
    typeof computedRemaining === "number"
      ? computedRemaining
      : typeof remainingKm === "number"
        ? remainingKm
        : undefined;

  // Status : idéalement basé sur remaining (calculé)
  const status =
    typeof remaining !== "number"
      ? "UNKNOWN"
      : remaining <= 0
        ? "OVERDUE"
        : remaining <= thresholdSoonKm
          ? "DUE_SOON"
          : "PLANNED";

  const progress =
    typeof intervalKm === "number" &&
    intervalKm > 0 &&
    typeof remaining === "number"
      ? Math.max(
          0,
          Math.min(100, ((intervalKm - remaining) / intervalKm) * 100),
        )
      : undefined;

  const badge = (() => {
    switch (status) {
      case "OVERDUE":
        return (
          <Badge variant="destructive" className="rounded-none">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            En retard
          </Badge>
        );
      case "DUE_SOON":
        return (
          <Badge variant="secondary" className="rounded-none">
            <Droplets className="h-3.5 w-3.5 mr-1" />
            Bientôt
          </Badge>
        );
      case "PLANNED":
        return (
          <Badge className="rounded-none">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            OK
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-none">
            Vidange
          </Badge>
        );
    }
  })();

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="font-semibold flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            Vidange
          </div>
          <div className="text-sm text-muted-foreground">
            Suivi de la prochaine échéance (kilométrage)
          </div>
        </div>

        {badge}
      </div>

      <Separator />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Chargement…</div>
      ) : error ? (
        <div className="text-sm text-destructive">
          Impossible de charger les infos vidange.
        </div>
      ) : typeof nextDueKm !== "number" ? (
        <div className="text-sm text-muted-foreground">
          Aucune échéance vidange configurée pour ce véhicule.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">
                Prochaine vidange à
              </div>
              <div className="font-semibold">{formatKm(nextDueKm)}</div>
            </div>

            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Reste</div>
              <div
                className={cn(
                  "font-semibold",
                  status === "OVERDUE" && "text-destructive",
                )}
              >
                {!hasCurrentKm && typeof remainingKm !== "number"
                  ? "- (kilométrage manquant)"
                  : typeof remaining === "number"
                    ? formatKm(Math.abs(remaining))
                    : "-"}
                {typeof remaining === "number" && remaining < 0
                  ? " (dépassé)"
                  : ""}
              </div>
            </div>

            {typeof lastDoneKm === "number" && (
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">
                  Dernière vidange
                </div>
                <div className="font-semibold">{formatKm(lastDoneKm)}</div>
                {lastDoneAt && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(lastDoneAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {typeof intervalKm === "number" && intervalKm > 0 && (
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Intervalle</div>
                <div className="font-semibold">{formatKm(intervalKm)}</div>
              </div>
            )}
          </div>

          {typeof progress === "number" && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Progression</div>
              <Progress value={progress} />
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Si le kilométrage est à jour, le statut se calcule automatiquement.
          </div>
        </div>
      )}
    </Card>
  );
}
