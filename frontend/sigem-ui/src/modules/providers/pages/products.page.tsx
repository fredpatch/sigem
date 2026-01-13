import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useProduct } from "../hooks/use-purchasing";

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
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Détails produit</div>
          <div className="text-sm text-muted-foreground">{id}</div>
        </div>

        <Button
          variant="secondary"
          onClick={() => openModal(ModalTypes.PRODUCT_FORM, product)}
        >
          Modifier
        </Button>
      </div>
      {!isLoading && product && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Ici on affichera label, code, type, tags, etc.
            <br />
            Ensuite on ajoutera l’onglet “Comparaison fournisseurs” (Step 3.5).
          </CardContent>
        </Card>
      )}
    </div>
  );
};
