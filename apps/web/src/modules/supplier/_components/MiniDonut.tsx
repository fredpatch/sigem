import { cn } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";

export function MiniDonut({
  title = "Répartition",
  data,
}: {
  title?: string;
  data: Array<{ name: string; value: number }>;
}) {
  const safe = (data ?? []).filter((d) => Number(d.value) > 0);

  if (!safe.length) {
    return (
      <div className="rounded-xl border p-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-2 text-xs text-muted-foreground">Aucune donnée.</div>
      </div>
    );
  }

  // palette neutre (pas de style imposé, mais il faut bien une couleur)
  const colors = [
    "#0ea5e9",
    "#22c55e",
    "#f97316",
    "#a855f7",
    "#ef4444",
    "#64748b",
  ];

  // ✅ map stable: name -> color (même source que le donut)
  const colorMap = new Map<string, string>();
  safe.forEach((d, idx) =>
    colorMap.set(String(d.name), colors[idx % colors.length]),
  );

  return (
    <div className="rounded-xl border p-3">
      <div className="text-sm font-semibold">{title}</div>

      <div className="mt-2 h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safe}
              dataKey="value"
              nameKey="name"
              innerRadius={35}
              outerRadius={65}
              paddingAngle={2}
            >
              {safe.map((d) => (
                <Cell
                  key={d.name}
                  fill={colorMap.get(String(d.name)) ?? "#000"}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: any, _n: any, p: any) => [
                v,
                p?.payload?.name ?? "",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {safe.slice(0, 6).map((d) => {
          const c = colorMap.get(String(d.name)) ?? "#64748b";
          return (
            <div
              key={d.name}
              className={cn(
                "flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1 text-[11px]",
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c }}
              />
              <span className="font-semibold tabular-nums">{d.value}</span>
              <span className="text-muted-foreground">{d.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
