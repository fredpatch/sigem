import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { CategoryFamilyLabels, FamilyType } from "../../types/asset-type";
import { useMemo } from "react";

interface CategorySelectFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
  id?: boolean;
}

export const CategorySelectField = ({
  form,
  disabled,
  id,
}: CategorySelectFieldProps) => {
  const { list } = useCategory();

  // 🧠 support both shapes: data = [] OR data = { items: [] }
  const rawData = list?.data as any;
  const categories = Array.isArray(rawData) ? rawData : (rawData?.items ?? []);

  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  // 2) Normaliser la valeur du champ (string ou objet)
  const rawCategory = watch("categoryId");
  const selectedCategoryValue =
    typeof rawCategory === "object" && rawCategory !== null
      ? ((rawCategory as any)._id ?? "")
      : (rawCategory ?? "");

  // 3) Roots = catégories sans parent
  const rootCategories = categories.filter((cat: any) => !cat.parentId);

  // 4) Catégorie actuellement liée à l’asset (en edit)
  const selectedCategory =
    selectedCategoryValue &&
    categories.find((cat: any) => cat._id === selectedCategoryValue);

  // 5) Liste d’options :
  //    - en create: juste les roots
  //    - en edit: roots + la catégorie actuelle (si c’est un enfant)
  const options: any[] = useMemo(() => {
    if (!selectedCategory || !selectedCategory.parentId) {
      return rootCategories;
    }
    const existsInRoots = rootCategories.some(
      (c: any) => c._id === selectedCategory._id
    );
    if (existsInRoots) return rootCategories;

    return [selectedCategory, ...rootCategories];
  }, [rootCategories, selectedCategory]);

  return (
    <FormFieldWrapper
      label={id ? "Edit Category" : "Famille de catégorie"}
      error={errors.categoryId?.message as string | undefined}
      tooltip="Sélectionnez la famille principale de l'actif (Équipement, Informatique, Mobilier)."
      className="w-full"
    >
      <Select
        disabled={disabled || list.isPending}
        value={selectedCategoryValue}
        onValueChange={(value) =>
          setValue("categoryId", value, { shouldValidate: true })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category family" />
        </SelectTrigger>

        <SelectContent>
          {options.length === 0 && (
            <SelectItem disabled value="__none">
              No root categories found
            </SelectItem>
          )}

          {options.map((cat: any) => {
            const fam = cat.family as FamilyType;

            return (
              <SelectItem key={cat._id} value={cat._id}>
                {/* label UX basé sur la famille, fallback sur label DB */}
                {CategoryFamilyLabels[fam] ?? cat.label}{" "}
                {/* tu peux afficher le code si tu veux:  ({cat.code}) */}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
};
