import {
  Building2,
  MapPin,
  Route,
  Compass,
  Landmark,
  Rows3,
} from "lucide-react";
import type { ReactNode } from "react";

interface LocationKPISidebarProps {
  totalLocations: number;
  localisationCount: number;
  buildingCount: number;
  directionCount: number;
  byLocalisation: Record<string, number>;
  byDirection: Record<string, number>;
}

export const LocationKPISidebar = ({
  totalLocations,
  localisationCount,
  buildingCount,
  directionCount,
  byLocalisation,
  byDirection,
}: LocationKPISidebarProps) => {
  const topLocalisations = Object.entries(byLocalisation)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topDirections = Object.entries(byDirection)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* TOTAL */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">
          Total des emplacements (bureaux)
        </p>
        <p className="mt-1 text-3xl font-semibold">{totalLocations}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {localisationCount} site{localisationCount > 1 ? "s" : ""} ·{" "}
          {buildingCount} bâtiment{buildingCount > 1 ? "s" : ""} ·{" "}
          {directionCount} direction{directionCount > 1 ? "s" : ""}.
        </p>
      </div>

      {/* STRUCTURE OVERVIEW */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Rows3 className="w-4 h-4 text-blue-600" />
          Aperçu de la structure
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          <KPIItem
            label="Sites"
            value={localisationCount}
            icon={<MapPin className="w-4 h-4" />}
            color="text-emerald-600"
          />
          <KPIItem
            label="Bâtiments"
            value={buildingCount}
            icon={<Building2 className="w-4 h-4" />}
            color="text-primary"
          />
          <KPIItem
            label="Directions"
            value={directionCount}
            icon={<Landmark className="w-4 h-4" />}
            color="text-violet-600"
          />
        </div>
      </div>

      {/* TOP LOCALISATIONS */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-600" />
          Top sites (par nombre de bureaux)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {topLocalisations.length ? (
            topLocalisations.map(([loc, count]) => (
              <KPIItem
                key={loc}
                label={loc}
                value={count}
                icon={<MapPin className="w-4 h-4" />}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Aucun site enregistré pour le moment.
            </p>
          )}
        </div>
      </div>

      {/* TOP DIRECTIONS */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Route className="w-4 h-4 text-cyan-600" />
          Top directions (par nombre de bureaux)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {topDirections.length ? (
            topDirections.map(([dir, count]) => (
              <KPIItem
                key={dir}
                label={dir}
                value={count}
                icon={<Route className="w-4 h-4" />}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Aucune direction renseignée pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const KPIItem = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon?: ReactNode;
  color?: string;
}) => (
  <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-card">
    <div className="flex items-center gap-2 text-sm">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span>{label}</span>
    </div>
    <span className={`font-semibold ${color ?? "text-primary"}`}>{value}</span>
  </div>
);
