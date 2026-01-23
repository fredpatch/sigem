import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusConfig } from "../../helpers/helpers";
import { AlertCircle, Car, FileText, Gauge, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ReferenceComboboxField } from "@/components/shared/reference-combobox-field";
import { Guidelines } from "@/common/guidelines";
import { EmployeeDirectoryComboboxField } from "@/modules/users/_components/employee-directory-combobox-field";

type Props = {
  form: any;
  isEdit?: boolean;
};

export const VehicleForm = ({ form, isEdit }: Props) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    isPending,
  } = form;

  const status = watch("status") || "ACTIVE";
  const usageType = watch("usageType") || "";
  const energy = watch("energy") || "";
  // const insuranceProvider = watch("insuranceProvider") || "";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Guidelines
        variant="tips"
        className="-mt-2"
        compact
        title="Avant d’enregistrer"
        items={[
          "Vérifiez l’immatriculation : elle doit être unique et au bon format.",
          "Renseignez le kilométrage actuel (utile pour le suivi d’entretien).",
          "Complétez l’affectation si le véhicule est attribué à un agent.",
          "Les données administratives facilitent la conformité et les documents du parc.",
        ]}
      />

      {/* Header Info */}
      {isEdit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mr-4">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Les modifications seront appliquées immédiatement et pourront
            impacter les tâches de maintenance associées.
          </p>
        </div>
      )}

      {/* Section 1: Vehicle Identity */}
      <Card className="border-l-4 mr-4 border-l-blue-500">
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                Identité du véhicule
              </h3>
              <p className="text-xs text-gray-500">
                Informations générales et identification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormFieldWrapper
              label={isEdit ? "Modifier l'Immatriculation" : "Immatriculation"}
              error={errors.plateNumber?.message}
              tooltip="obligatoire"
            >
              <Input
                placeholder="KS-539-AA"
                className="font-mono"
                {...register("plateNumber")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Statut" error={errors.status?.message}>
              <Select
                value={status}
                onValueChange={(val: any) =>
                  setValue("status", val, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Choisir un statut"
                    //  value={statusConfig[status]?.label}
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(
                    ([key, config]: [string, any]) => (
                      <SelectItem key={key} value={key}>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </FormFieldWrapper>

            {/* <FormFieldWrapper
              className="placeholder:text-muted"
              label="Marque"
              error={errors.brand?.message}
            >
              <Input placeholder="Toyota, Renault..." {...register("brand")} />
            </FormFieldWrapper> */}
            <ReferenceComboboxField
              control={form.control}
              name="brand"
              label="Marque"
              placeholder="Toyota, Renault..."
              refKey="vehicle.brand"
              disabled={isPending}
            />

            {/* <FormFieldWrapper
              className="placeholder:text-muted"
              label="Modèle"
              error={errors.model?.message}
            >
              <Input placeholder="Yaris, Clio..." {...register("model")} />
            </FormFieldWrapper> */}
            <ReferenceComboboxField
              control={form.control}
              name="model"
              label="Modèle"
              placeholder="Yaris, Clio..."
              refKey="vehicle.model"
              disabled={isPending}
            />

            {/* <FormFieldWrapper
              className="placeholder:text-muted"
              label="Type (carrosserie)"
              error={errors.type?.message}
            >
              <Input placeholder="Berline, SUV, 4x4..." {...register("type")} />
            </FormFieldWrapper> */}
            <ReferenceComboboxField
              control={form.control}
              name="type"
              label="Type (carrosserie)"
              placeholder="Berline, SUV, 4x4..."
              refKey="vehicle.type"
              disabled={isPending}
            />

            <FormFieldWrapper
              className="placeholder:text-muted"
              label="Année du modèle"
              error={errors.year?.message}
            >
              <Input
                placeholder="2020"
                inputMode="numeric"
                {...register("year")}
              />
            </FormFieldWrapper>

            {/* <FormFieldWrapper
              label="VIN (n° de série)"
              className="placeholder:text-muted"
              error={errors.vin?.message}
              tooltip="optionnel"
            >
              <Input
                placeholder="Numéro de série"
                className="font-mono text-sm placeholder:text-muted-foreground"
                {...register("vin")}
              />
            </FormFieldWrapper> */}

            <FormFieldWrapper
              label="Kilométrage actuel"
              error={errors.currentMileage?.message}
            >
              <div className="relative">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  {...register("currentMileage", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-2 text-sm text-gray-400">
                  km
                </span>
              </div>
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Puissance fiscale"
              error={errors.fiscalPower?.message}
            >
              <div className="relative">
                <Input
                  type="number"
                  placeholder="5"
                  {...register("fiscalPower", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-2 text-sm text-gray-400">
                  CV
                </span>
              </div>
            </FormFieldWrapper>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Section 2: Technical Specs */}
        <Card className="border-l-4 mr-4 border-l-purple-500">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Caractéristiques techniques
                </h3>
                <p className="text-xs text-gray-500">
                  Performance et spécifications
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <FormFieldWrapper
                label="Type d'usage"
                error={errors.usageType?.message}
              >
                <Select
                  value={usageType}
                  onValueChange={(v: any) =>
                    setValue("usageType", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SERVICE">Service</SelectItem>
                    <SelectItem value="FONCTION">Fonction</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldWrapper>

              <FormFieldWrapper label="Énergie" error={errors.energy?.message}>
                <Select
                  value={energy}
                  onValueChange={(v: any) =>
                    setValue("energy", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type de carburant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESSENCE">⛽ Essence</SelectItem>
                    <SelectItem value="DIESEL">🛢️ Diesel</SelectItem>
                    <SelectItem value="HYBRIDE">🔋 Hybride</SelectItem>
                    <SelectItem value="ELECTRIQUE">⚡ Électrique</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldWrapper>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Administrative*/}
        <Card className="border-l-4 mr-4 border-l-amber-500">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Données administratives
                </h3>
                <p className="text-xs text-gray-500">Documents et conformité</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 space-y-4 gap-4">
              {/* <FormFieldWrapper
                label="Propriétaire"
                error={errors.ownership?.message}
              >
                <Input
                  placeholder="ANAC, Société..."
                  {...register("ownership")}
                />
              </FormFieldWrapper> */}
              <ReferenceComboboxField
                control={form.control}
                name="ownership"
                label="Propriétaire"
                placeholder="ANAC, Société..."
                refKey="vehicle.ownership"
                disabled={isPending}
              />

              <FormFieldWrapper
                label="Date d'acquisition"
                error={errors.acquisitionDate?.message}
              >
                <Input type="date" {...register("acquisitionDate")} />
              </FormFieldWrapper>
            </div>
            <FormFieldWrapper
              label="1ère immatriculation"
              error={errors.firstRegistrationDate?.message}
            >
              <Input type="date" {...register("firstRegistrationDate")} />
            </FormFieldWrapper>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Assignment */}
      <Card className="border-l-4 mr-4 border-l-indigo-500">
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                Affectation
              </h3>
              <p className="text-xs text-gray-500">
                Agent et direction responsables
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmployeeDirectoryComboboxField
              control={form.control}
              name="assignedToEmployeeMatricule"
              label="Employé (annuaire)"
              placeholder="Rechercher un agent…"
              disabled={isPending}
              onSelectEmployee={(emp) => {
                setValue("assignedToName", `${emp.firstName} ${emp.lastName}`, {
                  shouldValidate: true,
                });
                setValue("assignedToDirection", emp.direction ?? "", {
                  shouldValidate: true,
                });
                // si tu ajoutes ce champ au backend + schema
                setValue("assignedToFunction", emp.fonction ?? "", {
                  shouldValidate: true,
                });
              }}
            />

            <FormFieldWrapper
              label="Direction (optionnel)"
              error={errors.assignedToDirection?.message}
            >
              <Input
                placeholder="Direction"
                readOnly
                className="bg-muted/40"
                {...register("assignedToDirection")}
              />
            </FormFieldWrapper>
            <input type="hidden" {...register("assignedToName")} />
            <input type="hidden" {...register("assignedToFunction")} />
          </div>
        </CardContent>
      </Card>

      {!isEdit && (
        <Card className="mt-4 border border-amber-200 bg-amber-50/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h4 className="font-medium">Assurance</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper label="Assureur">
                <Input
                  placeholder="NSIA, Ogar..."
                  {...register("insuranceProvider")}
                />
              </FormFieldWrapper>

              <FormFieldWrapper label="Référence / Police (optionnel)">
                <Input
                  placeholder="N° police..."
                  {...register("insuranceReference")}
                />
              </FormFieldWrapper>

              <FormFieldWrapper label="Début de validité">
                <Input type="date" {...register("insuranceIssuedAt")} />
              </FormFieldWrapper>

              <FormFieldWrapper label="Fin de validité (expire le)">
                <Input type="date" {...register("insuranceExpiresAt")} />
              </FormFieldWrapper>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEdit && (
        <Card className="mt-4 border border-amber-200 bg-amber-50/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h4 className="font-medium">Visite technique</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper label="Référence">
                <Input
                  {...register("techInspectionReference")}
                  placeholder="Référence..."
                />
              </FormFieldWrapper>

              <FormFieldWrapper label="Début">
                <Input type="date" {...register("techInspectionIssuedAt")} />
              </FormFieldWrapper>

              <FormFieldWrapper label="Expire le">
                <Input type="date" {...register("techInspectionExpiresAt")} />
              </FormFieldWrapper>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEdit && (
        <Card className="mt-4 border border-amber-200 bg-amber-50/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h4 className="font-medium">Carte parking (optionnel)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper label="Référence (optionnel)">
                <Input
                  {...register("parkingCardReference")}
                  placeholder="Référence..."
                />
              </FormFieldWrapper>

              <FormFieldWrapper label="Début (optionnel)">
                <Input type="date" {...register("parkingCardIssuedAt")} />
              </FormFieldWrapper>

              <FormFieldWrapper label="Expire le">
                <Input type="date" {...register("parkingCardExpiresAt")} />
              </FormFieldWrapper>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEdit && (
        <Card className="mt-4 border border-amber-200 bg-amber-50/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h4 className="font-medium">Carte extincteur (optionnel)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper label="Référence (optionnel)">
                <Input
                  {...register("extinguisherReference")}
                  placeholder="Référence..."
                />
              </FormFieldWrapper>

              <FormFieldWrapper label="Début (optionnel)">
                <Input type="date" {...register("extinguisherIssuedAt")} />
              </FormFieldWrapper>

              <FormFieldWrapper label="Expire le">
                <Input type="date" {...register("extinguisherExpiresAt")} />
              </FormFieldWrapper>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes / observations */}
      <Card className="border-l-4 mr-4 border-l-lime-800">
        <CardContent>
          <FormFieldWrapper
            label="Observations / remarques de maintenance"
            error={errors.maintenanceNotes?.message}
          >
            <Textarea
              id="maintenanceNotes"
              className="placeholder:text-muted-foreground"
              rows={3}
              placeholder="Observations importantes sur le véhicule (état, historique, particularités...)"
              {...register("maintenanceNotes")}
            />
          </FormFieldWrapper>
        </CardContent>
      </Card>
    </div>
  );
};
