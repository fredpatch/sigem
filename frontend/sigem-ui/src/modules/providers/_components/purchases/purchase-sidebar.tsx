import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { usePurchases } from "../../hooks/use-purchasing";
import { useProvidersList } from "../../hooks/use-providers";

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

function StatusBadge({ status }: { status?: string }) {
  if (status === "CONFIRMED") return <Badge>Confirmé</Badge>;
  if (status === "DRAFT") return <Badge variant="secondary">Brouillon</Badge>;
  if (status === "CANCELLED")
    return <Badge variant="destructive">Annulé</Badge>;
  return <Badge variant="secondary">{status ?? "-"}</Badge>;
}

export function PurchasesSidebar() {
  const nav = useNavigate();
  const { openModal } = useModalStore();

  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const status = sp.get("status") ?? "ALL";
  const dateFrom = sp.get("dateFrom") ?? "";
  const dateTo = sp.get("dateTo") ?? "";
  const providerId = sp.get("providerId") ?? "";

  const { data: providersData } = useProvidersList({
    page: 1,
    limit: 100,
    search: "",
  });
  const providers = providersData?.items ?? [];

  const params = useMemo(() => {
    const params: any = { page: 1, limit: 50 };
    if (q.trim()) params.q = q.trim();
    if (status !== "ALL") params.status = status;
    if (providerId) params.providerId = providerId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    return params;
  }, [q, status, providerId, dateFrom, dateTo]);

  const { data, isLoading } = usePurchases(params);
  const items = data?.items ?? [];

  // console.log("PurchasesSidebar render", { params, items });

  const onNew = () => openModal(ModalTypes.PURCHASE_FORM);

  const applyParam = (key: string, value?: string) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (!value) next.delete(key);
      else next.set(key, value);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <Button onClick={onNew} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Nouvel achat
      </Button>

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            applyParam("q", v.trim() ? v : "");
          }}
          className="pl-9"
          placeholder="Rechercher (ref, fournisseur...)"
        />
      </div>

      {/* Filters */}
      {/* <div className="grid gap-2">
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={status === "ALL" ? "default" : "secondary"}
            onClick={() => applyParam("status", "")}
          >
            Tous
          </Button>
          <Button
            type="button"
            variant={status === "CONFIRMED" ? "default" : "secondary"}
            onClick={() => applyParam("status", "CONFIRMED")}
          >
            Confirmés
          </Button>
          <Button
            type="button"
            variant={status === "DRAFT" ? "default" : "secondary"}
            onClick={() => applyParam("status", "DRAFT")}
          >
            Brouillons
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Du</div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => applyParam("dateFrom", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Au</div>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => applyParam("dateTo", e.target.value)}
            />
          </div>
        </div>
      </div> */}
      {/* Status quick filters */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={status === "ALL" ? "default" : "secondary"}
          onClick={() => applyParam("status", "")}
        >
          Tous
        </Button>
        <Button
          type="button"
          variant={status === "CONFIRMED" ? "default" : "secondary"}
          onClick={() => applyParam("status", "CONFIRMED")}
        >
          Confirmés
        </Button>
        <Button
          type="button"
          variant={status === "DRAFT" ? "default" : "secondary"}
          onClick={() => applyParam("status", "DRAFT")}
        >
          Brouillons
        </Button>
      </div>

      {/* Provider filter (optionnel, mais pratique) */}
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">
          Fournisseur/prestataires
        </div>
        <select
          className="w-full h-10 rounded-md border bg-background px-3 text-sm"
          value={providerId}
          onChange={(e) => applyParam("providerId", e.target.value || "")}
        >
          <option value="">Tous les fournisseurs</option>
          {providers.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Du</div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => applyParam("dateFrom", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Au</div>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => applyParam("dateTo", e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-[55vh] overflow-auto rounded-md border bg-background">
        {isLoading ? (
          <div className="p-3 text-sm text-muted-foreground">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            Aucun achat trouvé.
          </div>
        ) : (
          <div className="divide-y">
            {items.map((p: any) => {
              const title = p.reference ? `Facture ${p.reference}` : "Achat";
              const providerName = p.provider?.name ?? "Fournisseur";

              const linesCount = Number(p.linesCount ?? 0);
              const totalQty = Number(p.totalQuantity ?? 0);

              // topItems : ["Chaise", "Bureau"] (déjà clean)
              const topItems = Array.isArray(p.topItems)
                ? p.topItems.filter(Boolean)
                : [];
              const topText = topItems.length ? topItems.join(", ") : "";

              return (
                <button
                  key={p.id}
                  onClick={() => nav(`/purchases/${p.id}`)}
                  className={cn(
                    "w-full text-left px-3 py-3 hover:bg-muted/40 transition"
                  )}
                >
                  {/* Row 1 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {providerName}
                        {p.dept ? ` • ${p.dept}` : ""}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground font-mono">
                        {fmtDate(p.date)}
                      </div>
                      <div className="text-sm font-semibold">
                        {moneyXaf(p.total ?? p.subtotal ?? 0)}
                      </div>
                    </div>
                  </div>

                  {/* Row 2 (summary items) */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {linesCount ? (
                      <>
                        {linesCount} article{linesCount > 1 ? "s" : ""}
                        {totalQty
                          ? ` • ${totalQty} unité${totalQty > 1 ? "s" : ""}`
                          : ""}
                        {topText ? ` - ${topText}` : ""}
                      </>
                    ) : (
                      "Aucune ligne enregistrée"
                    )}
                  </div>

                  {/* Row 3 (badges) */}
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    {p.discount ? (
                      <Badge variant="outline">Remise</Badge>
                    ) : null}
                    {p.tax ? <Badge variant="outline">TVA</Badge> : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function safeInt(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function summaryFromPurchase(p: any) {
  // ✅ idéal: fields renvoyés par API list()
  const linesCount =
    p.linesCount ??
    p.itemsCount ??
    (Array.isArray(p.lines) ? p.lines.length : 0);

  // qty total si dispo, sinon calc si lines présentes
  const qtyTotal =
    p.totalQuantity ??
    (Array.isArray(p.lines)
      ? p.lines.reduce((s: number, l: any) => s + safeInt(l.quantity), 0)
      : 0);

  const topLabel =
    p.topProductLabel ??
    (Array.isArray(p.lines) && p.lines[0]?.product?.label
      ? p.lines[0].product.label
      : Array.isArray(p.lines) && p.lines[0]?.productLabel
        ? p.lines[0].productLabel
        : "");

  return { linesCount, qtyTotal, topLabel };
}
