import { cn } from "@/lib/utils";

export function FieldRow({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-3 py-2", className)}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="col-span-2 text-sm">{value ?? "-"}</div>
    </div>
  );
}
