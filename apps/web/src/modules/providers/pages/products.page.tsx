import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useProduct } from "../hooks/use-purchasing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldRow } from "../_components/products/field-row";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ProductSupplierCompareTab } from "../_components/products/product-supplier-compare-tab";

function typeLabel(t?: string) {
  if (t === "CONSUMABLE") return "Consommable";
  if (t === "MOBILIER") return "Mobilier";
  if (t === "EQUIPEMENT") return "Équipement";
  return t ?? "-";
}

export const ProductsPage = () => {
  return (
    <div className="p-4 text-sm text-muted-foreground">
      Sélectionnez un produit dans la liste ou créez-en un.
    </div>
  );
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { openModal } = useModalStore();
  const { data: product, isLoading } = useProduct(id);

  // si tu as un hook useProduct(id) tu peux l’ajouter; sinon on peut le déduire depuis list.
  // pour MVP: on affiche juste l’ID et le bouton edit
  if (!id) return null;

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">
            {isLoading ? "Chargement..." : (product?.label ?? "Produit")}
          </div>
          <div className="text-sm text-muted-foreground font-mono truncate">
            {product?.code ?? id}
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => openModal(ModalTypes.PRODUCT_FORM, product)}
        >
          Modifier
        </Button>
      </div>

      {/* Body */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : !product ? (
            <div className="text-sm text-muted-foreground">
              Produit introuvable.
            </div>
          ) : (
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">Infos</TabsTrigger>
                <TabsTrigger value="compare">
                  Comparaison fournisseurs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="pt-3">
                <div className="divide-y">
                  <FieldRow label="Libellé" value={product.label} />
                  <FieldRow
                    label="Code"
                    value={<span className="font-mono">{product.code}</span>}
                  />
                  <FieldRow label="Type" value={typeLabel(product.type)} />
                  <FieldRow label="Unité" value={product.unit || "-"} />
                  <FieldRow
                    label="Statut"
                    value={
                      product.isActive ? (
                        <Badge>Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )
                    }
                  />
                  <FieldRow
                    label="Tags"
                    value={
                      (product.tags?.length ?? 0) > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((t: string) => (
                            <Badge key={t} variant="secondary">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )
                    }
                  />
                  <FieldRow
                    label="Créé le"
                    value={
                      product.createdAt
                        ? format(new Date(product.createdAt), "PPp", {
                            locale: fr,
                          })
                        : "-"
                    }
                  />
                  <FieldRow
                    label="Mis à jour"
                    value={
                      product.updatedAt
                        ? format(new Date(product.updatedAt), "PPp", {
                            locale: fr,
                          })
                        : "-"
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="compare" className="pt-3">
                <ProductSupplierCompareTab productId={product.id} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
