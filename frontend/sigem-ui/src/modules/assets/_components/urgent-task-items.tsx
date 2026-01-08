import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { formatDueLabel, taskTypeLabel } from "@/utils/helpers";
import { AlertTriangle, ArrowUpRight, Clock } from "lucide-react";

function getId(v: any) {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v?._id === "string") return v._id;
  if (typeof v?._id?.toString === "function") return v._id.toString();
  if (typeof v?.toString === "function") return v.toString();
  return undefined;
}

export function UrgentTaskItem({
  task,
  variant,
}: {
  task: any;
  variant: "danger" | "warning";
}) {
  const { openModal } = useModalStore();
  const vehicleObj =
    task.vehicleId && typeof task.vehicleId === "object"
      ? task.vehicleId
      : null;

  const vehicleId = getId(task.vehicleId);
  const taskId = getId(task._id);

  const vehicleLabel =
    vehicleObj?.plateNumber ||
    vehicleObj?.code ||
    vehicleObj?.label ||
    (vehicleId ? `Véhicule ${vehicleId.slice(-6)}` : "Véhicule");

  const dueLabel = formatDueLabel(task);
  const typeLabel = taskTypeLabel(task);

  const sev = String(task.severity ?? "info").toLowerCase();
  const sevLabel =
    sev === "critical" ? "Critique" : sev === "warning" ? "Attention" : "Info";

  const clickable = Boolean(vehicleId);

  const openDetails = () => {
    if (!vehicleId) return;
    openModal(ModalTypes.VEHICLE_DETAILS, {
      vehicleId,
      snapshot: vehicleObj
        ? {
            id: getId(vehicleObj.id ?? vehicleObj._id) ?? vehicleId,
            plateNumber: vehicleObj.plateNumber,
            brand: vehicleObj.brand,
            model: vehicleObj.model,
            status: vehicleObj.status,
            currentMileage: vehicleObj.currentMileage,
            assignedToName: vehicleObj.assignedToName,
            assignedToDirection: vehicleObj.assignedToDirection,
          }
        : undefined,
      from: "top-urgences",
      taskId,
    });
  };

  // console.log(openDetails());

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openDetails();
      }}
      className={[
        "flex items-start justify-between gap-3 rounded-lg border p-3",
        "bg-muted/30 hover:bg-muted/50 transition-colors",
        clickable ? "cursor-pointer" : "cursor-default opacity-90",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">
            {task?.vehicleLabel ?? vehicleLabel}
          </p>

          {variant === "danger" ? (
            <Badge variant="destructive" className="shrink-0">
              En retard
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              Bientôt due
            </Badge>
          )}

          <Badge variant="outline" className="shrink-0">
            {sevLabel}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{typeLabel}</p>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {variant === "danger" ? (
            <AlertTriangle className="h-3.5 w-3.5" />
          ) : (
            <Clock className="h-3.5 w-3.5" />
          )}
          <span>{dueLabel}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2"
          onClick={(e) => {
            e.stopPropagation();
            openDetails();
          }}
          disabled={!clickable}
        >
          Voir <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>

        {/* <p className="text-[11px] text-muted-foreground uppercase">Statut</p> */}
        {/* <p className="text-sm font-semibold tabular-nums">{task.status}</p> */}
      </div>
    </div>
  );
}
