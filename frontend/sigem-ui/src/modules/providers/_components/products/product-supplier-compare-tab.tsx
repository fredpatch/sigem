import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductPriceCompare } from "../../hooks/use-purchasing";

function moneyXaf(n?: number) {
  const v = Number(n ?? 0);
  return `${v.toLocaleString("fr-FR")} FCFA`;
}

function fmtDate(d?: string) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function ProductSupplierCompareTab({
  productId,
}: {
  productId: string;
}) {
  const [limit, setLimit] = useState(10);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const params = useMemo(() => {
    const p: any = { limit };
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    return p;
  }, [limit, dateFrom, dateTo]);

  const { data, isLoading, refetch } = useProductPriceCompare(
    productId,
    params
  );

  const items = data?.items ?? data?.data?.items ?? []; // selon ton unwrap

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Du</div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[170px]"
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Au</div>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[170px]"
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Top</div>
          <Input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 10))}
            className="w-[90px]"
          />
        </div>

        <Button variant="secondary" onClick={() => refetch()}>
          Actualiser
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/20">
          <div className="text-sm font-medium">Comparaison des prix</div>
          <div className="text-xs text-muted-foreground">
            Basé sur les achats confirmés (historique).
          </div>
        </div>

        {isLoading ? (
          <div className="p-3 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            Aucun achat confirmé trouvé pour ce produit sur la période.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="[&>th]:text-left [&>th]:font-medium [&>th]:text-xs [&>th]:text-muted-foreground [&>th]:px-3 [&>th]:py-2">
                  <th>Fournisseur</th>
                  <th>Dernier prix</th>
                  <th>Date</th>
                  <th>Min</th>
                  <th>Moy</th>
                  <th>Max</th>
                  <th>Nb</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((it: any, idx: number) => (
                  <tr
                    key={it.provider?.id ?? idx}
                    className="[&>td]:px-3 [&>td]:py-2"
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {it.provider?.name ?? "-"}
                        </div>
                        {idx === 0 ? <Badge>Meilleur prix</Badge> : null}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {it.provider?.designation ?? ""}
                      </div>
                    </td>
                    <td className="font-semibold">
                      {moneyXaf(it.last?.unitPrice)}
                    </td>
                    <td className="text-muted-foreground">
                      {fmtDate(it.last?.date)}
                    </td>
                    <td>{moneyXaf(it.stats?.min)}</td>
                    <td>{moneyXaf(it.stats?.avg)}</td>
                    <td>{moneyXaf(it.stats?.max)}</td>
                    <td>{it.stats?.count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="text-xs text-muted-foreground">
        Astuce : Vous pouvez comparer les fournisseurs avant un nouvel achat.
      </div>
    </div>
  );
}
