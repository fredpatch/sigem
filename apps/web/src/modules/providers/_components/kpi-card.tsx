import { cn } from "@/lib/utils";
import { ChevronRight, LucideIcon } from "lucide-react";

type Tone = "neutral" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "border-muted-foreground/15 bg-card",
  success: "border-emerald-500/25 bg-emerald-500/5",
  warning: "border-amber-500/25 bg-amber-500/5",
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  subLabel,
  tone = "neutral",
  onClick,
  active,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  subLabel?: React.ReactNode;
  tone?: Tone;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={onClick ? "Cliquer pour filtrer" : undefined}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition",
        "hover:shadow-md hover:bg-muted/40",
        onClick && "cursor-pointer",
        active && "ring-2 ring-primary",
        toneClasses[tone]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {subLabel && (
            <div className="text-[11px] text-muted-foreground/80">
              {subLabel}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-lg border bg-white/60 flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>

          {onClick && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          )}
        </div>
      </div>
    </button>
  );
}
