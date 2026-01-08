// src/modules/categories/components/CategoryKPISidebar.tsx
import { FamilyType } from "@/modules/assets/types/asset-type";
import { Layers3, FolderTree, FolderOpen, Hash, Grid3x3 } from "lucide-react";
import type { ReactNode } from "react";

interface CategoryKPISidebarProps {
  totalCategories: number;
  rootCount: number;
  subCount: number;
  familyStats: Record<
    FamilyType,
    {
      total: number;
      root: number;
      sub: number;
    }
  >;
  prefixStats: Record<string, number>;
}

export const CategoryKPISidebar = ({
  totalCategories,
  rootCount,
  subCount,
  familyStats,
  prefixStats,
}: CategoryKPISidebarProps) => {
  const familiesUsed = Object.values(familyStats).filter(
    (f) => f.total > 0
  ).length;

  const topPrefixes = Object.entries(prefixStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">
          Total categories
        </p>
        <p className="mt-1 text-3xl font-semibold">{totalCategories}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {familiesUsed} family type{familiesUsed > 1 ? "s" : ""} in use
        </p>
      </div>

      {/* Hierarchy */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-blue-600" />
          Hierarchy
        </h4>
        <div className="flex gap-1">
          <KPIItem
            label="Root cat"
            value={rootCount}
            icon={<FolderOpen className="w-4 h-4" />}
            color="text-emerald-600"
          />
          <KPIItem
            label="Subcat"
            value={subCount}
            icon={<FolderTree className="w-4 h-4" />}
            color="text-primary"
          />
        </div>
      </div>

      {/* By family */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Layers3 className="w-4 h-4 text-violet-600" />
          Families
        </h4>
        <div className="grid md:grid-cols-2 gap-1">
          {Object.entries(familyStats).map(([fam, stats]) => {
            if (!stats.total) return null;

            const label =
              fam === "INFORMATIQUE"
                ? "Informatique"
                : fam === "EQUIPEMENT"
                  ? "Équipement"
                  : "Mobilier";

            return (
              <KPIItem
                key={fam}
                label={label}
                value={stats.total}
                icon={<Grid3x3 className="w-4 h-4" />}
                color="text-primary"
                subLabel={`${stats.root} root · ${stats.sub} sub`}
              />
            );
          })}
        </div>
      </div>

      {/* Prefix / code usage */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Hash className="w-4 h-4 text-sky-600" />
          Code prefixes
        </h4>
        <div className="grid md:grid-cols-2 gap-1">
          {topPrefixes.map(([prefix, count]) => (
            <KPIItem
              key={prefix}
              label={prefix}
              value={count}
              icon={<Hash className="w-4 h-4" />}
            />
          ))}
          {!topPrefixes.length && (
            <p className="text-xs text-muted-foreground italic">
              No categories yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const KPIItem = ({
  label,
  subLabel,
  value,
  icon,
  color,
}: {
  label: string;
  subLabel?: string;
  value: number;
  icon?: ReactNode;
  color?: string;
}) => (
  <div className="w-full flex items-center justify-between rounded-md border px-3 py-2 bg-card">
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 text-xs">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span>{label}</span>
      </div>
      {subLabel && (
        <span className="text-[11px] text-muted-foreground">{subLabel}</span>
      )}
    </div>
    <span className={`font-semibold ${color ?? "text-primary"}`}>{value}</span>
  </div>
);
