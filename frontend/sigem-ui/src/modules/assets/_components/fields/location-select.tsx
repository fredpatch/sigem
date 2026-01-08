import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "@/modules/locations/hooks/useLocation";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";

interface LocationSelectFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
  id?: boolean;
}

export const LocationSelectField = ({
  form,
  disabled,
  id,
}: LocationSelectFieldProps) => {
  const { list } = useLocation();
  const locations = list.data?.items ?? [];

  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedValue = watch("locationId") ?? "";

  // 👉 On garde seulement les bureaux (niveau le plus fin)
  const bureauLocations = locations.filter((loc: any) => {
    // si tu as un enum LocationLevel côté front, tu peux comparer à "BUREAU"
    // sinon on peut soit:
    // - filtrer par loc.level === "BUREAU"
    // - soit ne pas filtrer si tout est déjà en niveau bureau
    return !loc.level || loc.level === "BUREAU";
  });

  const formatLabel = (loc: any) => {
    // Bureau – Direction (Batiment, Localisation)
    const localisation = loc.localisation ?? "";
    const batiment = loc.batiment ? `Bât. ${loc.batiment}` : "";
    const direction = loc.direction ?? "";
    const bureau = loc.bureau ?? "";

    const right = [direction, batiment, localisation]
      .filter(Boolean)
      .join(" • ");

    if (right) {
      return `${bureau} - (${direction})`;
    }
    return bureau || loc.path || loc.code || "Unknown bureau";
  };

  return (
    <FormFieldWrapper
      label={id ? "Edit Location" : "Emplacement du bien"}
      error={errors.root?.message}
      tooltip="Sélectionnez l'emplacement principal de l'actif (bâtiment, magasin, bureau…)."
    >
      <Select
        disabled={disabled || list.isPending}
        value={selectedValue}
        // defaultValue={selectedValue}
        onValueChange={(value) =>
          setValue("locationId", value, { shouldValidate: true })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select bureau" />
        </SelectTrigger>

        <SelectContent>
          {bureauLocations.length === 0 && (
            <SelectItem disabled value="__none">
              Aucun bureau disponible
            </SelectItem>
          )}

          {bureauLocations.map((loc: any) => (
            <SelectItem key={loc._id} value={loc._id}>
              {formatLabel(loc)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
};
