import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Vehicle } from "../../types/vehicle.types";
import { useVehicles } from "../../hooks/use-vehicle";
import { useVehicleDocuments } from "../../hooks/use-vehicle-documents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fmt, labelEnergy, labelUsage } from "@/utils/helpers";
import { ComplianceCard } from "@/modules/assets/_components/compliance-card";
import { Car } from "lucide-react";

const formatDate = (iso?: string | Date | null) => {
  if (!iso) return "N/A";
  try {
    return format(new Date(iso), "dd/MM/yyyy", { locale: fr });
  } catch {
    return "N/A";
  }
};

const formatMileage = (km?: number | null) => {
  if (km == null) return "-";
  return `${km.toLocaleString("fr-FR")} km`;
};

type VehicleDetailsModalPayload = {
  id: string;
  snapshot?: Partial<Vehicle>;
  from?: string;
  taskId?: string;
};

type VehicleDocument = {
  id: string;
  type: string; // "INSURANCE" | "PARKING_CARD" | ...
  reference?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  reminderDaysBefore?: number[];
  notificationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const InfoField = ({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon?: any;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
    </div>
    <p
      className={`text-sm ${mono ? "font-mono" : "font-medium"} ${!value || value === "-" ? "text-muted-foreground" : ""}`}
    >
      {value || "-"}
    </p>
  </div>
);

// const SectionHeader = ({
//   icon: Icon,
//   title,
//   subtitle,
// }: {
//   icon: any;
//   title: string;
//   subtitle?: string;
// }) => (
//   <div className="flex items-start gap-3 pb-3">
//     <div className="rounded-lg bg-primary/10 p-2">
//       <Icon className="w-4 h-4 text-primary" />
//     </div>
//     <div>
//       <h3 className="font-semibold text-base">{title}</h3>
//       {subtitle && (
//         <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
//       )}
//     </div>
//   </div>
// );

const getStatusVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "IN_MAINTENANCE":
      return "secondary";
    case "INACTIVE":
      return "outline";
    case "RETIRED":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Actif";
    case "IN_MAINTENANCE":
      return "En maintenance";
    case "INACTIVE":
      return "Inactif";
    case "RETIRED":
      return "Retiré";
    default:
      return status;
  }
};

export const VehicleDetailsModal = () => {
  const { name, data, closeModal } = useModalStore();

  const baseVehicle = data as Vehicle;
  const payload = data as VehicleDetailsModalPayload;
  const vehicleId = payload?.id;

  // On refetch proprement le véhicule par ID (au cas où il a été mis à jour)
  // const { listById } = useVehicles(baseVehicle?.id);
  const { listById } = useVehicles(vehicleId);
  const { data: vehicleFromApi } = listById as {
    data?: Vehicle;
  };

  const vehicle = vehicleFromApi ?? baseVehicle;

  // Documents liés (mini-aperçu : count)
  const { list = [] } = useVehicleDocuments(vehicleId);
  const docsQuery = list as {
    data?: any[];
    isLoading: boolean;
    isError: boolean;
  };

  const docs = docsQuery.data ?? [];
  // const docCount = docsQuery.data?.length ?? 0;

  const docsByType = (docs as VehicleDocument[]).reduce(
    (acc, d) => {
      if (!d?.type) return acc;
      // s’il y a doublons, on garde celui qui expire le plus tard (ou le plus proche, selon ta logique)
      const prev = acc[d.type];
      if (!prev) acc[d.type] = d;
      else {
        const prevExp = prev.expiresAt
          ? new Date(prev.expiresAt).getTime()
          : -Infinity;
        const curExp = d.expiresAt
          ? new Date(d.expiresAt).getTime()
          : -Infinity;
        acc[d.type] = curExp > prevExp ? d : prev;
      }
      return acc;
    },
    {} as Record<string, VehicleDocument>,
  );

  const titleLabel =
    [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") ||
    "Détails véhicule";

  if (name !== ModalTypes.VEHICLE_DETAILS || !data) return null;

  return (
    <Dialog open onOpenChange={closeModal}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col">
        <div className="bg-linear-to-br from-primary/5 via-primary/3 to-background px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <Car className="w-6 h-6" />
                  {titleLabel}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  Immatriculation:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {vehicle.plateNumber}
                  </span>
                </DialogDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={getStatusVariant(vehicle.status)}
                  className="text-xs px-3 py-1"
                >
                  {getStatusLabel(vehicle.status)}
                </Badge>
                {vehicle.type && (
                  <p className="text-xs text-muted-foreground">
                    {vehicle.type}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="mt-4 space-y-3 flex-1 overflow-y-auto p-2">
          {/* Identité technique */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Marque
              </p>
              <p className="text-sm font-medium">{vehicle.brand || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Modèle
              </p>
              <p className="text-sm font-medium">{vehicle.model || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Type
              </p>
              <p className="text-sm">
                {vehicle.type || (
                  <span className="text-muted-foreground">-</span>
                )}
              </p>
            </div>
          </section>

          <Separator />

          {/* Kilométrage + dates */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Kilométrage actuel
              </p>
              <p className="text-sm font-semibold">
                {formatMileage(vehicle.currentMileage)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Maj kilométrage
              </p>
              <p className="text-sm">
                {formatDate(vehicle.mileageUpdatedAt as any)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Créé le
              </p>
              <p className="text-sm">{formatDate(vehicle.createdAt as any)}</p>
            </div>
          </section>

          <Separator />

          {/* Affectation */}
          <section className="space-y-1">
            <p className="text-[11px] uppercase text-muted-foreground">
              Affectation
            </p>
            {vehicle.assignedToName || vehicle.assignedToDirection ? (
              <div className="space-y-0.5">
                {vehicle.assignedToName && (
                  <p className="text-sm font-medium">
                    {vehicle.assignedToName}
                  </p>
                )}
                {vehicle.assignedToDirection && (
                  <p className="text-xs text-muted-foreground">
                    {vehicle.assignedToDirection}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Non affecté actuellement.
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Usage
              </p>
              <p className="text-sm font-medium">
                {labelUsage(vehicle.usageType)}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Énergie
              </p>
              <p className="text-sm font-medium">
                {labelEnergy(vehicle.energy)}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Propriété
              </p>
              <p className="text-sm">{fmt(vehicle.ownership) || "ANAC"}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Date d’acquisition
              </p>
              <p className="text-sm">
                {formatDate(vehicle.acquisitionDate as any)}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                1ère immatriculation
              </p>
              <p className="text-sm">
                {formatDate(vehicle.firstRegistrationDate as any)}
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">
                Conformité
              </p>
              <p className="text-sm text-muted-foreground">
                Statut calculé à partir des documents du véhicule.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ComplianceCard title="Assurance" doc={docsByType["INSURANCE"]} />
              <ComplianceCard
                title="Carte Parking"
                doc={docsByType["PARKING_CARD"]}
              />
              <ComplianceCard
                title="Carte Extincteur"
                doc={docsByType["EXTINGUISHER_CARD"]}
              />
              <ComplianceCard
                title="Visite technique"
                doc={docsByType["TECH_INSPECTION"]}
              />
            </div>
          </section>
          {/* <Separator /> */}

          {/* Documents liés : KPI + mini-table */}
          <section className="space-y-3">
            {/* <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">
                  Documents liés
                </p>
                {docsQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Chargement des documents…
                  </p>
                ) : docCount === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun document enregistré pour ce véhicule.
                  </p>
                ) : (
                  <p className="text-sm">
                    {docCount} document{docCount > 1 ? "s" : ""} associé
                    {docCount > 1 ? "s" : ""}.
                  </p>
                )}
              </div>
            </div> */}

            {/* Mini-table */}
            {/* {!docsQuery.isLoading && docCount > 0 && (
              <div className="rounded-lg border bg-muted/40">
                <ScrollArea className="max-h-72">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/70 backdrop-blur">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Référence
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Expiration
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((doc) => {
                        const status = getDocumentStatus(doc);
                        console.log(doc);
                        return (
                          <tr
                            key={doc.id}
                            className="border-b last:border-0 hover:bg-background/60"
                          >
                            <td className="px-3 py-2 align-top">
                              {getDocTypeLabel(doc.type)}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {doc.reference ? (
                                <span className="font-mono">
                                  {doc.reference}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {formatDate(doc.expiresAt)}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <Badge
                                variant={status.variant}
                                className="text-[10px]"
                              >
                                {status.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            )} */}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
