import { cn } from "@/lib/utils";

export function LineStat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        {sub ? (
          <div className="text-[11px] text-muted-foreground">{sub}</div>
        ) : null}
      </div>

      <div className="shrink-0 text-sm font-medium">{value}</div>
    </div>
  );
}
