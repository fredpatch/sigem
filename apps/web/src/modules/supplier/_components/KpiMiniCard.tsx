import { cn } from "@/lib/utils";

type Tone = "default" | "ok" | "danger" | "warning";

export function KpiMiniCard({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  const toneCls =
    tone === "ok"
      ? "border-emerald-200/60 bg-emerald-50/40"
      : tone === "danger"
        ? "border-rose-200/60 bg-rose-50/40"
        : tone === "warning"
          ? "border-amber-200/60 bg-amber-50/40"
          : "border-muted bg-muted/20";

  return (
    <div className={cn("rounded-xl border p-3", toneCls)}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold leading-none">{value}</div>
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
