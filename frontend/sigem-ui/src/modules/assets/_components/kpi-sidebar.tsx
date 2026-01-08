import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Cpu,
  Laptop,
  Boxes,
  Wrench,
  AlertOctagon,
  Layers,
  Hash,
} from "lucide-react";

const FAMILY_LABELS: Record<string, string> = {
  EQUIPEMENT: "Équipement",
  INFORMATIQUE: "Informatique",
  MOBILIER: "Mobilier",
};

export const AssetKPISidebar = ({
  total,
  statsBySituation,
  statsByFamily,
  statsByCategory,
  statsByPrefix,
}: {
  total: number;
  statsBySituation: Record<string, number>;
  statsByFamily: Record<string, number>;
  statsByCategory: Record<string, number>;
  statsByPrefix: Record<string, number>;
}) => {
  return (
    <div className="space-y-6">

      {/* TOTAL */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">Total Biens</p>
        <p className="mt-1 text-3xl font-semibold">{total}</p>
      </div>

      {/* SITUATION */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-orange-500" />
          Aperçu des statuts
        </h4>

        <div className="grid md:grid-cols-2 gap-1">
          <KPIItem
            classNames="text-[11px] font-medium space-x-0.5"
            label="En service"
            value={statsBySituation.EN_SERVICE}
            color="text-green-600"
            icon={<Wrench />}
          />
          <KPIItem
            classNames="text-[11px] font-medium space-x-0.5"
            label="Neuf"
            value={statsBySituation.NEUF}
            color="text-blue-600"
            icon={<Laptop />}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-1">
          <KPIItem
            classNames="text-[11px] font-medium space-x-0.5"
            label="En panne"
            value={statsBySituation.EN_PANNE}
            color="text-red-500"
            icon={<AlertOctagon />}
          />
          <KPIItem
            classNames="text-[11px] font-medium space-x-0.5"
            label="Hors service"
            value={statsBySituation.HORS_SERVICE}
            color="text-yellow-600"
            icon={<Wrench />}
          />
        </div>
      </div>

      {/* FAMILY DISTRIBUTION */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-600" />
          Familles
        </h4>

        <div className="grid md:grid-cols-2 gap-1">
          {Object.entries(statsByFamily).map(([fam, count]) => (
            <KPIItem
              classNames="text-[12px] font-semibold space-x-0.5"
              key={fam}
              label={FAMILY_LABELS[fam] || fam}
              value={count}
              icon={<Boxes />}
              color="text-primary"
            />
          ))}
        </div>
      </div>

      {/* TOP CATEGORIES */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          Top sous-catégories
        </h4>
        <div className="grid md:grid-cols-2 gap-1">
          {Object.entries(statsByCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([cat, count]) => (
              <KPIItem
                classNames="text-[11px] font-semibold space-x-0.5"
                key={cat}
                label={cat}
                value={count}
                icon={<Cpu />}
              />
            ))}
        </div>
      </div>

      {/* PREFIX = TYPE DISTRIBUTION */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Hash className="w-4 h-4 text-sky-600" />
          Dictionnaire de codes
        </h4>
        <div className="grid md:grid-cols-2 gap-1">
          {Object.entries(statsByPrefix)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([prefix, count]) => (
              <KPIItem
                classNames="text-[11px] font-medium"
                key={prefix}
                label={prefix}
                value={count}
                icon={<Hash />}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

// Reusable line item
const KPIItem = ({
  label,
  value,
  icon,
  color,
  classNames,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  classNames?: string;
}) => (
  <div className="w-full flex items-center justify-between rounded-md border px-3 py-2 bg-card shadow-sm">
    <div className={cn("flex items-center gap-2 text-sm", classNames)}>
      {icon && (
        <Button variant={"ghost"} className="h-2 w-2" size={"icon"}>
          {icon}
        </Button>
      )}
      <span className="">{label}</span>
    </div>
    <span className={`font-semibold ${color ?? "text-primary"}`}>{value}</span>
  </div>
);

// <div className="w-full flex items-center justify-between rounded-md border px-3 py-2 bg-muted/30">
//   <div className={cn("flex items-center gap-2 text-sm", classNames)}>
//     {icon && (
//       <Button variant={"ghost"} className="h-2 w-2" size={"icon"}>
//         {icon}
//       </Button>
//     )}
//     <span className="">{label}</span>
//   </div>
//   <span className={`font-semibold ${color ?? "text-primary"}`}>{value}</span>
// </div>
