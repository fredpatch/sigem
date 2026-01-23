// src/features/vehicles/components/vehicle-document-form.tsx
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleDocumentType } from "../../types/vehicle-document.types";
import { ReferenceComboboxField } from "@/components/shared/reference-combobox-field";
import { Guidelines } from "@/common/guidelines";

type Props = {
  form: any;
  isEdit?: boolean;
};

export const VehicleDocumentForm = ({ form, isEdit }: Props) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const disabled = form.formState.isSubmitting;
  const type = watch("type") || VehicleDocumentType.INSURANCE;

  return (
    <div className="space-y-4">
      <Guidelines
        variant="tips"
        className="-mt-2"
        compact
        title="Avant d’enregistrer"
        items={[
          "La tâche est créée pour le véhicule affiché (ex : KY 120 AA) - pas besoin de la rattacher manuellement.",
          "Choisissez un type de document pour activer la récurrence automatique (assurance, visite technique…).",
          "La date limite déterminent quand la tâche devient Bientôt dûe puis En retard.",
        ]}
      />

      {/* Type de document */}
      <div className="space-y-1.5">
        <FormFieldWrapper label="Type de document" error={errors.type?.message}>
          <Select
            value={type}
            onValueChange={(val) =>
              setValue("type", val as VehicleDocumentType, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VehicleDocumentType.INSURANCE}>
                Assurance
              </SelectItem>
              <SelectItem value={VehicleDocumentType.TECH_INSPECTION}>
                Visite technique
              </SelectItem>
              <SelectItem value={VehicleDocumentType.PARKING_CARD}>
                Carte de parking
              </SelectItem>
              <SelectItem value={VehicleDocumentType.EXTINGUISHER_CARD}>
                Carte extincteur
              </SelectItem>
              <SelectItem value={VehicleDocumentType.REGISTRATION}>
                Carte grise
              </SelectItem>
              <SelectItem value={VehicleDocumentType.TAX_STICKER}>
                Vignette / taxe
              </SelectItem>
              <SelectItem value={VehicleDocumentType.OTHER}>
                Autre document
              </SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>

      {/* Référence */}
      <div className="space-y-1.5">
        <FormFieldWrapper
          label="Référence (numéro de police, carte...)"
          error={errors.reference?.message}
        >
          <ReferenceComboboxField
            control={form.control}
            name="reference"
            placeholder="Ex: Police NSIA 2025-1234"
            refKey="document.reference"
            disabled={disabled}
          />
        </FormFieldWrapper>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FormFieldWrapper
            label="Date d'émission"
            error={errors.issuedAt?.message}
          >
            <Input id="issuedAt" type="date" {...register("issuedAt")} />
          </FormFieldWrapper>
        </div>
        <div className="space-y-1.5">
          <FormFieldWrapper
            label="Date d'expiration"
            error={errors.expiresAt?.message}
          >
            <Input id="expiresAt" type="date" {...register("expiresAt")} />
          </FormFieldWrapper>
        </div>
      </div>

      {/* Jours de rappel */}
      <div className="space-y-1.5">
        <FormFieldWrapper
          label="Rappels (jours avant expiration)"
          error={errors.reminderDaysBefore?.message}
        >
          <Input
            id="reminderDaysBefore"
            placeholder="Ex: 30,15,7"
            {...register("reminderDaysBefore")}
          />
        </FormFieldWrapper>
        <p className="text-[11px] text-muted-foreground">
          Entrez une liste de nombres séparés par des virgules. Par défaut: 30,
          15, 7 jours avant l&apos;expiration.
        </p>
      </div>

      {isEdit && (
        <p className="text-[11px] text-muted-foreground">
          La mise à jour de ce document ne modifie pas automatiquement les
          tâches existantes, mais impactera les alertes futures.
        </p>
      )}
    </div>
  );
};
