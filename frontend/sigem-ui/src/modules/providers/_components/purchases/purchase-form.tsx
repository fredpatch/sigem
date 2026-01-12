import { useMemo } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { PurchaseCreateInput } from "../../schema/purchase.schema";
import { useProducts } from "../../hooks/use-purchasing";
import { useProvidersList } from "../../hooks/use-providers";

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function moneyXaf(n: number) {
  return `${toNumber(n).toLocaleString("fr-FR")} FCFA`;
}

export const PurchaseForm = ({
  form,
}: {
  form: UseFormReturn<PurchaseCreateInput>;
}) => {
  const { control, watch, setValue, register } = form;

  const linesFA = useFieldArray({
    control,
    name: "lines",
  });

  // data for selects
  const { data: productsData } = useProducts({
    page: 1,
    limit: 100,
    isActive: true,
  });
  const products = productsData?.items ?? [];

  const { data: providersData } = useProvidersList({
    page: 1,
    limit: 100,
    active: true,
    type: "FOURNISSEUR",
  });
  const providers = providersData?.items ?? [];

  const lines = watch("lines");
  const subtotal = useMemo(() => {
    return (lines ?? []).reduce((sum, l) => {
      const lineTotal = toNumber(l.quantity) * toNumber(l.unitPrice);
      return sum + lineTotal;
    }, 0);
  }, [lines]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4 grid gap-4 md:grid-cols-2">
          <FormFieldWrapper label="Fournisseur">
            <Select
              value={watch("providerId") || ""}
              onValueChange={(v) => setValue("providerId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un fournisseur..." />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.designation ? `- ${p.designation}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <div className="grid grid-cols-2 gap-3">
            <FormFieldWrapper label="Date">
              <Input type="date" {...register("date")} />
            </FormFieldWrapper>

            {/* <FormFieldWrapper label="Statut">
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWrapper> */}
          </div>

          <FormFieldWrapper label="Référence (optionnel)">
            <Input placeholder="Ex: FACT-2026-001" {...register("reference")} />
          </FormFieldWrapper>

          <FormFieldWrapper label="Notes (optionnel)">
            <Textarea
              rows={3}
              placeholder="Informations complémentaires..."
              {...register("notes")}
            />
          </FormFieldWrapper>
        </CardContent>
      </Card>

      {/* Lines */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Lignes d’achat</div>
              <div className="text-xs text-muted-foreground">
                Ajoutez les produits achetés avec quantité et prix unitaire.
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                linesFA.append({
                  productId: "",
                  quantity: 1,
                  unitPrice: 0,
                  notes: "",
                })
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </Button>
          </div>

          <div className="overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="[&>th]:text-left [&>th]:text-xs [&>th]:text-muted-foreground [&>th]:font-medium [&>th]:px-3 [&>th]:py-2">
                  <th style={{ width: "42%" }}>Produit</th>
                  <th style={{ width: "14%" }}>Qté</th>
                  <th style={{ width: "18%" }}>Prix unitaire</th>
                  <th style={{ width: "18%" }}>Total</th>
                  <th style={{ width: "8%" }} />
                </tr>
              </thead>

              <tbody className="divide-y">
                {linesFA.fields.map((f, index) => {
                  const qty = toNumber(lines?.[index]?.quantity);
                  const price = toNumber(lines?.[index]?.unitPrice);
                  const total = qty * price;

                  return (
                    <tr
                      key={f.id}
                      className="[&>td]:px-3 [&>td]:py-2 align-top"
                    >
                      <td>
                        <Select
                          value={watch(`lines.${index}.productId`) || ""}
                          onValueChange={(v) =>
                            setValue(`lines.${index}.productId`, v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un produit..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.label}{" "}
                                <span className="text-muted-foreground">
                                  ({p.code})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* note ligne (optionnel) */}
                        <Input
                          className="mt-2"
                          placeholder="Note ligne (optionnel)"
                          {...register(`lines.${index}.notes` as const)}
                        />
                      </td>

                      <td>
                        <Input
                          type="number"
                          min={1}
                          {...register(`lines.${index}.quantity` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>

                      <td>
                        <Input
                          type="number"
                          min={0}
                          {...register(`lines.${index}.unitPrice` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>

                      <td>
                        <div className="font-semibold">{moneyXaf(total)}</div>
                      </td>

                      <td className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => linesFA.remove(index)}
                          disabled={linesFA.fields.length <= 1}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-semibold">{moneyXaf(subtotal)}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                (TVA/remise pourront venir plus tard - pour le moment on garde
                simple)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
