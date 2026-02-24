import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";

function truncateLabel(s: string, n = 18) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function MiniBar({
  title = "Top",
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

  const BAR_COLORS = [
    "#0ea5e9", // bleu
    "#22c55e", // vert
    "#f97316", // orange
    "#a855f7", // violet
    "#ef4444", // rouge
    "#64748b", // gris
  ];

  return (
    <div className="rounded-xl border p-3">
      <div className="text-sm font-semibold">{title}</div>

      <div className="mt-2 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safe}
            layout="vertical"
            margin={{ top: 8, right: 18, bottom: 5, left: 8 }}
            barCategoryGap={6}
          >
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => truncateLabel(String(v), 22)}
            />
            <XAxis type="number" hide />

            <Tooltip
              cursor={{ fill: "transparent" }}
              content={<MiniBarTooltip />}
              wrapperStyle={{ outline: "none" }}
              animationDuration={120}
            />

            <Bar dataKey="value" radius={[2, 8, 8, 2]}>
              {safe.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
              {/* ✅ valeur DANS la barre */}
              <LabelList
                dataKey="value"
                position="insideRight"
                style={{ fill: "white", fontSize: 11, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MiniBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-md border bg-background/95 px-3 py-2 shadow-md backdrop-blur"
      style={{ minWidth: 90 }}
    >
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">Article</div>
      </div>

      <div className="mt-1 text-xs font-bold leading-snug">
        {String(label ?? "")}
      </div>

      {/* <div className="mt-2 flex items-baseline justify-between">
        <div className="text-xs text-muted-foreground">Valeur</div>
        <div className="text-sm font-semibold tabular-nums">{value}</div>
      </div> */}
    </div>
  );
}
