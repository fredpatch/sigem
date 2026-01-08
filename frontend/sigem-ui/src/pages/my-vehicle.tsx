import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Car, Gauge, RefreshCcw } from "lucide-react";
import { useVehicles } from "@/modules/vehicules/hooks/use-vehicle";
import { OilChangeCard } from "@/modules/vehicules/_components/oil-change-card";
import { useOilChangeInfo } from "@/modules/vehicules/hooks/use-oil-change";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";

function formatDate(d?: string) {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function MyVehiclePage() {
  //   const { data: vehicles = [], isLoading, error, refetch, isFetching } =
  // const { mutateAsync: completeTask, isPending } = useCompleteVehicleTask();
  const { user } = useAuthStore();
  const { myVehicle, updateMileage } = useVehicles();
  const {
    data: vehicles = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = myVehicle;

  // console.log("My vehicles:", vehicles);

  const primary = useMemo(() => vehicles?.[0], [vehicles]);
  const oil = useOilChangeInfo(primary?.id);

  const [value, setValue] = useState<string>("");

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-sm text-destructive">Erreur de chargement.</div>
        <Button variant="secondary" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!primary) {
    return (
      <div className="p-6 space-y-3">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Car className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-semibold">Aucun véhicule assigné</div>
              <div className="text-sm text-muted-foreground">
                Contactez le service MG pour l’affectation.
              </div>
            </div>
          </div>
        </Card>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
    );
  }

  const submitting = updateMileage.isPending;

  const currentKm = primary.currentMileage ?? 0;

  return (
    <div className="p-6 max-w-2xl space-y-4 mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-bold">
            Bonjour{user?.firstName ? `, ${user.firstName}` : ""} 👋
          </div>
          <div className="text-sm text-muted-foreground">
            Accès invité : Mise à jour du kilométrage & suivi vidange
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Card className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-none">
                {primary.plateNumber}
              </Badge>
              <span className="font-semibold">
                {primary.brand} {primary.model}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              {primary.type ? `${primary.type} · ` : ""}
              {primary.year ? `${primary.year} · ` : ""}
              {primary.energy ? `${primary.energy} · ` : ""}
              {primary.usageType ? primary.usageType : ""}
            </div>

            {(primary.assignedToName ||
              primary.assignedToDirection ||
              primary.assignedToFunction) && (
              <div className="text-xs text-muted-foreground">
                Assigné à : {primary.assignedToName ?? "—"}
                {primary.assignedToDirection
                  ? ` · ${primary.assignedToDirection}`
                  : ""}
                {primary.assignedToFunction
                  ? ` · ${primary.assignedToFunction}`
                  : ""}
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground">
              Dernière mise à jour
            </div>
            <div className="text-sm font-mono">
              {formatDate(primary.mileageUpdatedAt)}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              Kilométrage actuel :{" "}
              <span className="font-semibold">
                {currentKm.toLocaleString()} km
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              inputMode="numeric"
              placeholder="Nouveau kilométrage (ex: 45223)"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
              className="sm:max-w-xs"
            />

            <Button
              onClick={() => {
                const next = Number(value);
                if (!Number.isFinite(next) || next <= 0) return;
                if (next < currentKm) {
                  // on laisse passer si tu veux, mais UX: avertir
                  // (tu peux aussi bloquer côté backend)
                }
                updateMileage.mutate({
                  id: primary.id,
                  payload: { currentMileage: next },
                });
                setValue("");
              }}
              disabled={submitting || !value}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour…
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Astuce : entre juste le kilométrage affiché sur le compteur.
          </div>
        </div>
      </Card>

      {/* TODO next: bloc “Vidange / prochaine échéance” quand on branche vehicle-tasks/alerts */}
      <OilChangeCard
        currentMileage={primary.currentMileage}
        nextDueKm={oil.data?.nextDueKm}
        intervalKm={oil.data?.intervalKm}
        lastDoneKm={oil.data?.lastDoneKm}
        lastDoneAt={oil.data?.lastDoneAt}
        remainingKm={oil.data?.remainingKm}
        apiStatus={oil.data?.status}
        isLoading={oil.isLoading}
        error={oil.error}
      />
    </div>
  );
}
