import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  FileCheck,
  FileText,
  Gauge,
  Wrench,
} from "lucide-react";
import {
  VEHICLE_DOCUMENT_TYPES,
  VEHICLE_TASK_SEVERITY,
  VEHICLE_TASK_TRIGGER_TYPES,
  VEHICLE_TASK_TYPES,
} from "../../schema/template-task.schema";
import { Switch } from "@/components/ui/switch";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { ReferenceComboboxField } from "@/components/shared/reference-combobox-field";
import { Guidelines } from "@/common/guidelines";

type Props = {
  form: any;
  isEdit?: boolean;
};

export const TemplateTasksForm = ({ form }: Props) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const disabled = form.formState.isSubmitting;

  const type = watch("type");
  const triggerType = watch("triggerType");
  const severity = watch("defaultSeverity");
  const requiresDocument = watch("requiresDocument");
  const documentType = watch("documentType");

  // const everyKm = watch("everyKm");
  // const everyMonths = watch("everyMonths");
  const active = watch("active");

  const typeIcons: Record<string, any> = {
    OIL_CHANGE: Wrench,
    MAINTENANCE: ClipboardList,
    DOCUMENT_RENEWAL: FileCheck,
    OTHER: FileText,
  };

  const typeLabels: Record<string, string> = {
    OIL_CHANGE: "Vidange",
    MAINTENANCE: "Maintenance",
    DOCUMENT_RENEWAL: "Renouvellement doc.",
    OTHER: "Autre",
  };

  const triggerLabels: Record<string, string> = {
    BY_DATE: "Par date",
    BY_MILEAGE: "Par kilométrage",
    BY_DATE_OR_MILEAGE: "Date OU kilométrage",
  };

  const docTypeLabels: Record<string, string> = {
    INSURANCE: "Assurance",
    PARKING_CARD: "Carte de parking",
    EXTINGUISHER_CARD: "Carte extincteur",
    TECH_INSPECTION: "Visite technique",
    OTHER: "Autre document",
  };

  return (
    <div className="space-y-6">
      <Guidelines
        variant="tips"
        className="-mt-2"
        compact
        title="Modèle de tâche récurrente"
        items={[
          "Un modèle définit une règle de suivi applicable à plusieurs véhicules.",
          "Il permet de générer automatiquement des tâches (ex : vidange tous les 5 000 km).",
          "Le déclencheur indique si la tâche dépend d’une date, d’un kilométrage, ou des deux.",
          "Les champs de préavis déterminent quand la tâche devient Bientôt due.",
          "Un modèle peut être lié à un document véhicule (assurance, carte, extincteur…).",
          "La sévérité par défaut influence l’importance des notifications associées à la tâche.",
          "Un modèle ≠ une tâche. Les tâches sont créées à partir des modèles pour chaque véhicule.",
        ]}
      />
      <Guidelines
        variant="warning"
        className="-mt-2"
        compact
        title="Attention lors de la création/modification"
        items={[
          "Une récurrence mal définie peut créer des tâches incohérentes.",
          "Vérifiez toujours les unités (km / mois).",
          "Assurez-vous que le préavis est adapté au type de tâche.",
          "Les modifications affecteront les futures tâches planifiées.",
          "Pour les modèles liés à un document, assurez-vous que le type de document est pertinent.",
        ]}
      />

      {/* INFOS GÉNÉRALES */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Informations générales
        </p>

        <FormFieldWrapper
          label="Libellé du modèle"
          tooltip="Nom qui apparaîtra dans la liste des tâches planifiables."
          error={errors?.label?.message as string | undefined}
        >
          {/* <Input
            id="label"
            className="h-10"
            placeholder="Ex: Renouvellement assurance annuelle"
            {...register("label")}
          /> */}

          <ReferenceComboboxField
            control={form.control}
            name="label"
            placeholder="Ex: Renouvellement assurance annuelle"
            refKey="template.label"
            disabled={disabled}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Description"
          tooltip="Détaillez le contexte ou la procédure pour cette tâche."
          error={errors?.description?.message as string | undefined}
        >
          <Textarea
            id="description"
            rows={3}
            placeholder="Ex: Renouveler l'assurance responsabilité civile et dommages tous les 12 mois."
            {...register("description")}
          />
        </FormFieldWrapper>
      </div>

      {/* TYPE & DÉCLENCHEUR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldWrapper
          label="Type de tâche"
          tooltip="Permet de catégoriser les tâches (vidange, maintenance, renouvellement de document...)."
          error={errors?.type?.message as string | undefined}
        >
          <Select
            value={type || ""}
            onValueChange={(val) =>
              setValue("type", val, { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Choisir un type..." />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TASK_TYPES.map((t) => {
                const Icon = typeIcons[t] ?? FileText;
                return (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span>{typeLabels[t] ?? t}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Déclencheur"
          tooltip="Sur quoi se base la récurrence : uniquement la date, le kilométrage ou les deux."
          error={errors?.triggerType?.message as string | undefined}
        >
          <Select
            value={triggerType || ""}
            onValueChange={(val) =>
              setValue("triggerType", val, { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Choisir un déclencheur..." />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TASK_TRIGGER_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  <div className="flex items-center gap-2">
                    {t === "BY_DATE" && <Calendar className="size-4" />}
                    {t === "BY_MILEAGE" && <Gauge className="size-4" />}
                    {t === "BY_DATE_OR_MILEAGE" && (
                      <AlertCircle className="size-4" />
                    )}
                    <span>{triggerLabels[t]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>

      {/* RÉCURRENCE */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
          <Gauge className="size-3.5" />
          Récurrence
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper
            label="Tous les (km)"
            tooltip="Nombre de kilomètres entre deux occurrences de cette tâche. Laissez vide si non applicable."
            error={errors?.everyKm?.message as string | undefined}
          >
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex: 5 000"
              className="h-10"
              {...register("everyKm", { valueAsNumber: true })}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Tous les (mois)"
            tooltip="Nombre de mois entre deux occurrences. Laissez vide si uniquement basé sur les km."
            error={errors?.everyMonths?.message as string | undefined}
          >
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex: 12"
              className="h-10"
              {...register("everyMonths", { valueAsNumber: true })}
            />
          </FormFieldWrapper>
        </div>
      </div>

      {/* PRÉAVIS */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Préavis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper
            label="Préavis (km avant)"
            tooltip="À combien de kilomètres avant l'échéance doit-on commencer à notifier."
            error={errors?.noticeKmBefore?.message as string | undefined}
          >
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex: 500"
              className="h-10"
              {...register("noticeKmBefore", { valueAsNumber: true })}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            label="Préavis (jours avant)"
            tooltip="Nombre de jours avant l'échéance pour les notifications."
            error={errors?.noticeDaysBefore?.message as string | undefined}
          >
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex: 30"
              className="h-10"
              {...register("noticeDaysBefore", { valueAsNumber: true })}
            />
          </FormFieldWrapper>
        </div>
      </div>

      {/* LIEN DOCUMENT */}
      <div className="space-y-3 border-t pt-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Lier à un document véhicule
            </p>
            <p className="text-[11px] text-muted-foreground">
              Indique que ce modèle est conçu pour être planifié à partir d'un
              document (assurance, carte de parking, extincteur, etc.).
            </p>
          </div>
          <Switch
            checked={!!requiresDocument}
            onCheckedChange={(checked) => {
              setValue("requiresDocument", checked, {
                shouldValidate: true,
              });
              if (!checked) {
                setValue("documentType", null, { shouldValidate: true });
              }
            }}
          />
        </div>

        {requiresDocument && (
          <FormFieldWrapper
            label="Type de document"
            tooltip="Permet de filtrer les modèles disponibles en fonction du type de document sur la fiche véhicule."
            error={errors?.documentType?.message as string | undefined}
          >
            <Select
              value={documentType || ""}
              onValueChange={(val) =>
                setValue("documentType", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Choisir un type de document..." />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {docTypeLabels[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        )}
      </div>

      {/* SÉVÉRITÉ + ACTIF */}
      <div className="space-y-3 border-t pt-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Sévérité & statut
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-1 min-w-[220px]">
            {VEHICLE_TASK_SEVERITY.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setValue("defaultSeverity", s, {
                    shouldValidate: true,
                  })
                }
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                  severity === s
                    ? s === "critical"
                      ? "bg-red-500/10 text-red-700 border-red-500/40"
                      : s === "warning"
                        ? "bg-amber-500/10 text-amber-700 border-amber-500/40"
                        : "bg-slate-500/10 text-slate-700 border-slate-500/40"
                    : "bg-muted/30 text-muted-foreground border-transparent hover:border-muted-foreground/20"
                }`}
              >
                {s === "info" && "Info"}
                {s === "warning" && "Alerte"}
                {s === "critical" && "Critique"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={!!active}
              onCheckedChange={(checked) =>
                setValue("active", checked, { shouldValidate: true })
              }
            />
            <span className="text-xs text-muted-foreground">
              {active ? "Modèle actif" : "Modèle inactif"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
