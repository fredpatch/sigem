import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCreateInput } from "../../schema/product.schema";

type ProductFormValues = ProductCreateInput;

function parseTags(input: string) {
  return input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const ProductForm = ({
  id,
  form,
}: {
  id: boolean;
  form: UseFormReturn<ProductFormValues & { tagsText?: string }>;
}) => {
  const tagsText = (form.watch("tagsText") as string) ?? "";

  return (
    <div className="grid gap-4">
      <FormFieldWrapper label="Libellé">
        <Input placeholder="Ex: Chaise visiteur" {...form.register("label")} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Type">
        <Select
          value={String(form.watch("type") ?? "CONSUMABLE")}
          onValueChange={(v) => form.setValue("type" as any, v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONSUMABLE">Consommable</SelectItem>
            <SelectItem value="MOBILIER">Mobilier</SelectItem>
            <SelectItem value="EQUIPEMENT">Équipement</SelectItem>
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      <FormFieldWrapper label="Unité (optionnel)">
        <Input
          placeholder="Ex: PIECE, LOT, CARTON"
          {...form.register("unit")}
        />
      </FormFieldWrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldWrapper label="Type">
          <Select
            value={String(form.watch("type") ?? "CONSUMABLE")}
            onValueChange={(v) => form.setValue("type" as any, v as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONSUMABLE">Consommable</SelectItem>
              <SelectItem value="MOBILIER">Mobilier</SelectItem>
              <SelectItem value="EQUIPEMENT">Équipement</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Unité (optionnel)">
          <Input
            placeholder="Ex: PIECE, LOT, CARTON"
            {...form.register("unit")}
          />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper
        label="Tags (optionnel)"
        tooltip="Séparez par des virgules (ex: chaise, bureau, mobilier)"
      >
        <Input
          placeholder="Ex: chaise, bureau, mobilier"
          {...form.register("tagsText" as any)}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {parseTags(tagsText)
            .slice(0, 10)
            .map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
        </div>
      </FormFieldWrapper>
    </div>
  );
};
