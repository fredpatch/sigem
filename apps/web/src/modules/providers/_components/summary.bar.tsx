import { Badge } from "@/components/ui/badge";

export function ImportSummaryBar({
  meta,
}: {
  meta: { total: number; valid: number; invalid: number; headers: string[] };
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">Total: {meta.total}</Badge>
      <Badge variant="secondary">Valides: {meta.valid}</Badge>
      <Badge variant={meta.invalid ? "destructive" : "secondary"}>
        Invalides: {meta.invalid}
      </Badge>
      <Badge variant="outline">Colonnes: {meta.headers.length}</Badge>
    </div>
  );
}
