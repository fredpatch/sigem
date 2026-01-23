// src/features/vehicles/components/vehicle-documents-sidebar.tsx
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { VehicleDocument } from "../types/vehicle-document.types";
import { useVehicleDocumentsMonitoring } from "../hooks/use-vehicle-documents";

const EXPIRY_SOON_DAYS = 30;

type DocStatusFilter = "ALL" | "EXPIRED" | "SOON" | "VALID";

export const VehicleDocumentsSidebarContent = () => {
  const [statusFilter, setStatusFilter] = useState<DocStatusFilter>("ALL");

  // Hook dédié "monitoring global" (tous docs du parc)
  const { data: items, isLoading, isError } = useVehicleDocumentsMonitoring();

  const { total, expired, soon, valid, filteredCounts } = useMemo(
    () => computeDocumentKpis(items ?? [], statusFilter),
    [items, statusFilter]
  );

  const isLoadingKpis = isLoading;
  const hasError = isError;

  return (
    <div className="space-y-4">
      {/* Bloc résumé global */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">
          Total documents
        </p>
        <p className="mt-1 text-3xl font-semibold">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : total}
        </p>

        {hasError ? (
          <p className="mt-1 text-xs text-red-600">
            Impossible de charger les indicateurs.
          </p>
        ) : (
          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-amber-700">
              {isLoadingKpis ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                `${expired} expirés`
              )}
            </span>
            <span className="text-orange-600">
              {isLoadingKpis ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                `${soon} à échéance (< ${EXPIRY_SOON_DAYS} j)`
              )}
            </span>
            <span className="text-emerald-600">
              {isLoadingKpis ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                `${valid} valides`
              )}
            </span>
          </span>
        )}
      </div>

      {/* Cartes KPI par statut */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Expirés"
          value={filteredCounts.expired}
          variant="destructive"
          loading={isLoadingKpis}
        />
        <KpiCard
          label={`Bientôt (< ${EXPIRY_SOON_DAYS} j)`}
          value={filteredCounts.soon}
          loading={isLoadingKpis}
        />
        <KpiCard
          className="col-span-2"
          label="Valides"
          value={filteredCounts.valid}
          loading={isLoadingKpis}
        />
      </div>

      {/* Répartition par type */}
      {/* <div className="rounded-lg border bg-card px-3 py-2">
        <p className="text-[11px] uppercase text-muted-foreground mb-1">
          Types de documents
        </p>
        <ul className="space-y-1">
          <TypeRow
            label="Assurances"
            value={byType[VehicleDocumentType.INSURANCE]}
          />
          <TypeRow
            label="Visites techniques"
            value={byType[VehicleDocumentType.TECH_INSPECTION]}
          />
          <TypeRow
            label="Cartes parking"
            value={byType[VehicleDocumentType.PARKING_CARD]}
          />
          <TypeRow
            label="Cartes extincteur"
            value={byType[VehicleDocumentType.EXTINGUISHER_CARD]}
          />
          <TypeRow
            label="Cartes grises"
            value={byType[VehicleDocumentType.REGISTRATION]}
          />
          <TypeRow
            label="Vignettes / taxes"
            value={byType[VehicleDocumentType.TAX_STICKER]}
          />
          <TypeRow label="Autres" value={byType[VehicleDocumentType.OTHER]} />
        </ul>
      </div> */}

      {/* Filtres par statut (impacte les KPI, pas encore le tableau) */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Filtrer les indicateurs
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusChip
            label="Tous"
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          />
          <StatusChip
            label="Expirés"
            active={statusFilter === "EXPIRED"}
            onClick={() => setStatusFilter("EXPIRED")}
          />
          <StatusChip
            label="Bientôt"
            active={statusFilter === "SOON"}
            onClick={() => setStatusFilter("SOON")}
          />
          <StatusChip
            label="Valides"
            active={statusFilter === "VALID"}
            onClick={() => setStatusFilter("VALID")}
          />
        </div>
      </div>

      <div className="pt-2 bg-primary/10 border shadow p-2 rounded-xl">
        <p className="text-sm text-primary font-medium">
          Vocabulaire de recherche
        </p>
        <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
          {/* <li>
            <strong>Expirés</strong> : Documents dont la date d&apos;expiration
            est passée.
          </li>
          <li>
            <strong>Bientôt</strong> : Documents arrivant à expiration dans les{" "}
            {EXPIRY_SOON_DAYS} prochains jours.
          </li>
          <li>
            <strong>Valides</strong> : Documents dont la date d&apos;expiration
            est au-delà des {EXPIRY_SOON_DAYS} prochains jours.
          </li> */}
          <li>
            <strong>Carte extincteur</strong> : Extinguisher
          </li>
          <li>
            <strong>Vignette / taxe</strong> : Tax sticker
          </li>
          <li>
            <strong>Assurance</strong> : Insurance
          </li>
          <li>
            <strong>Visite technique</strong> : Technical inspection
          </li>
          <li>
            <strong>Carte de parking</strong> : Parking card
          </li>
        </ul>
      </div>
    </div>
  );
};

// --- Helpers UI ---

const KpiCard = ({
  label,
  value,
  variant,
  className,
  loading,
}: {
  label: string;
  className?: string;
  value: number;
  loading?: boolean;
  variant?: "default" | "destructive";
}) => (
  <div
    className={`rounded-lg border bg-card px-3 py-2 ${className ?? ""} ${
      variant === "destructive" ? "border-destructive/40" : ""
    } ${loading ? "opacity-60 animate-pulse" : ""}`}
  >
    <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-bold tabular-nums">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : value}
    </p>
  </div>
);

const StatusChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs border transition ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    }`}
  >
    {label}
  </button>
);

const TypeRow = ({ label, value }: { label: string; value: number }) => (
  <li className="flex items-center justify-between text-[11px]">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold tabular-nums">{value}</span>
  </li>
);

// --- Logic KPI ---

function computeDocumentKpis(
  docsRaw: VehicleDocument[],
  statusFilter: DocStatusFilter
) {
  const docs = docsRaw ?? []; // 👈 sécurisation
  const now = new Date();

  let total = docs.length;
  let expired = 0;
  let soon = 0;
  let valid = 0;

  // const byType: Record<VehicleDocumentType, number> = {
  //   [VehicleDocumentType.INSURANCE]: 0,
  //   [VehicleDocumentType.TECH_INSPECTION]: 0,
  //   [VehicleDocumentType.PARKING_CARD]: 0,
  //   [VehicleDocumentType.EXTINGUISHER_CARD]: 0,
  //   [VehicleDocumentType.REGISTRATION]: 0,
  //   [VehicleDocumentType.TAX_STICKER]: 0,
  //   [VehicleDocumentType.OTHER]: 0,
  // };

  for (const doc of docs) {
    const exp = doc.expiresAt ? new Date(doc.expiresAt) : null;
    if (!exp) continue;

    const diffMs = exp.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // const docType = doc.type as VehicleDocumentType;
    // if (byType[docType] !== undefined) {
    //   byType[docType] += 1;
    // } else {
    //   byType[VehicleDocumentType.OTHER] += 1;
    // }

    if (diffDays < 0) {
      expired++;
    } else if (diffDays <= EXPIRY_SOON_DAYS) {
      soon++;
    } else {
      valid++;
    }
  }

  // Selon le filtre, on adapte les compteurs affichés dans les petites cartes
  let filteredCounts = { expired, soon, valid };

  if (statusFilter === "EXPIRED") {
    filteredCounts = { expired, soon: 0, valid: 0 };
  } else if (statusFilter === "SOON") {
    filteredCounts = { expired: 0, soon, valid: 0 };
  } else if (statusFilter === "VALID") {
    filteredCounts = { expired: 0, soon: 0, valid };
  }

  return { total, expired, soon, valid, filteredCounts };
}
