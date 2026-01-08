import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { ReferenceComboboxField } from "@/components/shared/reference-combobox-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  form: any;
  isEdit?: boolean;
};

export const CategoryForm = ({ form, isEdit }: Props) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const disabled = form.formState.isSubmitting;
  const rawParent = watch("parentId");

  const parentValue =
    typeof rawParent === "object" ? rawParent?._id : rawParent;

  const familyValue = watch("family");

  return (
    <div className="space-y-4">
      {/* Label */}
      <ReferenceComboboxField
        control={form.control}
        name={"label"}
        label="Label"
        refKey="category.label"
        disabled={disabled}
        placeholder="Equipement, Informatique.."
      />

      {/* Family (only for root) */}
      {!parentValue && (
        <FormFieldWrapper label="Family" error={errors.family?.message}>
          <Select
            value={familyValue ?? ""}
            onValueChange={(val) => setValue("family", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INFORMATIQUE">INFORMATIQUE</SelectItem>
              <SelectItem value="EQUIPEMENT">EQUIPEMENT</SelectItem>
              <SelectItem value="MOBILIER">MOBILIER</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      )}

      {/* Description */}
      <FormFieldWrapper label="Description">
        <Textarea
          {...register("description")}
          placeholder="Optional description"
        />
      </FormFieldWrapper>
    </div>
  );
};

{
  /* Parent category (optional) */
}
{
  /* <FormFieldWrapper
        label="Parent category"
        error={errors.parentId?.message}
      >
        <Select
          value={parentValue ?? ""}
          onValueChange={(val) => setValue("parentId", val || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="None (root category)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {rootCategories.map((c: any) => (
              <SelectItem key={c._id} value={c._id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper> */
}
