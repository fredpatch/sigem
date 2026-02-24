import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useVehicleTaskTemplates } from "../../hooks/use-template-task";
import {
  Calendar,
  Gauge,
  FileText,
  AlertCircle,
  Wrench,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { useVehicles } from "../../hooks/use-vehicle";
import { useEffect } from "react";
import { Guidelines } from "@/common/guidelines";

type Props = {
  form: any;
  isEdit?: boolean;
};

export const VehicleTasksForm2 = ({ form }: Props) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { data: templates = [], isLoading: loadingTemplates } =
    useVehicleTaskTemplates();

  const selectedTemplateId = watch("templateId");
  const severity = watch("severity");

  const dueAt = watch("dueAt");
  const dueMileage = watch("dueMileage");

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const isTemplateMode = !!selectedTemplate;

  // 🧠 Optionnel : si tu passes documentType dans le context et le stockes dans defaultValues,
  // tu peux le récupérer ici via watch("documentType") et filtrer les templates.
  const documentType = watch("documentType"); // ex: "INSURANCE", "PARKING_CARD", etc.
  const taskType = watch("type");

  // Filtrage des templates : on ne garde que ceux liés à un document
  const filteredTemplates = templates.filter((tpl: any) => {
    // CAS 1 – On vient d'un document : documentType est défini
    if (documentType) {
      if (!tpl.requiresDocument) return false;

      if (tpl.documentType && tpl.documentType !== documentType) {
        return false;
      }
      return true;
    }

    // CAS 2 – On vient d'un véhicule (pas de documentType) :
    // on ne garde que les modèles "entretien" (sans document)
    return !tpl.requiresDocument;
  });

  const typeIcons = {
    OIL_CHANGE: Wrench,
    MAINTENANCE: ClipboardList,
    DOCUMENT_RENEWAL: FileCheck,
    OTHER: FileText,
  };

  const typeLabels = {
    OIL_CHANGE: "Vidange",
    MAINTENANCE: "Maintenance",
    DOCUMENT_RENEWAL: "Renouvellement doc.",
    OTHER: "Autre",
  };

  const templateSelectValue = selectedTemplateId || "__manual";

  const handleTemplateChange = (value: string) => {
    // valeur vide => mode manuel
    if (value === "__manual") {
      setValue("templateId", null, { shouldValidate: true });

      // On garde le label/description si l'utilisateur les a saisis,
      // mais on peut aussi décider de les reset si tu préfères.
      setValue("type", undefined, { shouldValidate: true });
      setValue("triggerType", undefined, { shouldValidate: true });
      // On remet une sévérité par défaut raisonnable
      setValue("severity", "warning", { shouldValidate: true });

      return;
    }

    // Template mode
    setValue("templateId", value, { shouldValidate: true });

    const template = filteredTemplates.find((t: any) => t.id === value);
    if (!template) return;

    // Auto-fill depuis le template
    setValue("label", template.label);
    setValue("description", template.description || "");
    setValue("severity", template.defaultSeverity);
    setValue("type", template.type);
    setValue("triggerType", template.triggerType);

    // 💡 IMPORTANT : on reset les échéances pour forcer un nouveau calcul
    setValue("dueMileage", undefined, { shouldValidate: true });
    setValue("dueAt", undefined, { shouldValidate: true });
  };

  // TODO: Replace with real vehicle query
  const { listActive } = useVehicles();
  const vehicles = listActive.data ?? [];
  const isLoadingVehicles = listActive.isLoading;

  const vehicleId: string | undefined = watch("vehicleId");
  const vehicleSelectValue =
    vehicleId && vehicleId !== "" ? vehicleId : "__none";

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    if (!selectedTemplate) return;
    if (!selectedVehicle) return;

    const { everyKm, everyMonths, triggerType } = selectedTemplate;
    const vehCurrentKm = selectedVehicle.currentMileage;
    const vehKmNum =
      typeof vehCurrentKm === "number"
        ? vehCurrentKm
        : vehCurrentKm != null
          ? Number(vehCurrentKm)
          : NaN;

    // console.log(everyKm, everyMonths, triggerType, vehCurrentKm);
    // ---------- KM suggestion ----------
    const isMileageTrigger =
      triggerType === "BY_MILEAGE" || triggerType === "BY_DATE_OR_MILEAGE";

    const isDueMileageEmpty =
      dueMileage === undefined ||
      dueMileage === null ||
      dueMileage === "" ||
      Number.isNaN(dueMileage as any);

    if (
      isMileageTrigger &&
      typeof everyKm === "number" &&
      Number.isFinite(vehKmNum) &&
      isDueMileageEmpty
    ) {
      const suggestedKm = vehKmNum + everyKm;
      setValue("dueMileage", suggestedKm, { shouldValidate: true });
    }

    // ---------- DATE suggestion ----------
    const isDateTrigger =
      triggerType === "BY_DATE" || triggerType === "BY_DATE_OR_MILEAGE";

    if (
      isDateTrigger &&
      typeof everyMonths === "number" &&
      !dueAt // empty string/undefined
    ) {
      const base = new Date();
      base.setMonth(base.getMonth() + everyMonths);

      // input[type=date] expects "YYYY-MM-DD"
      const iso = base.toISOString().slice(0, 10);
      setValue("dueAt", iso, { shouldValidate: true });
    }
  }, [selectedTemplate, selectedVehicle, dueMileage, dueAt, setValue]);

  return (
    <div className="space-y-5">
      <Guidelines
        variant="tips"
        className="-mt-2"
        compact
        title="Avant d’enregistrer"
        items={[
          "Choisissez un modèle de tâche pour activer la récurrence automatique (vidange, visite technique…).",
          "La tâche est créée pour le véhicule affiché (ex : KY 120 AA) - pas besoin de la rattacher manuellement.",
          "Si vous créez une tâche manuelle, définissez le type + déclencheur (date, kilométrage, ou les deux).",
          "Le kilométrage / la date limite déterminent quand la tâche devient Bientôt dûe puis En retard.",
        ]}
      />

      {/* MODE SELECTOR - Template vs Manual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground flex items-center gap-2">
            <ClipboardList className="size-3.5" />
            Modèle de tâche
          </Label>
          <Select
            value={templateSelectValue}
            onValueChange={handleTemplateChange}
            disabled={loadingTemplates}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue
                placeholder={
                  loadingTemplates
                    ? "Chargement des modèles..."
                    : "Choisir un modèle..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__manual">
                <div className="flex items-center gap-2">
                  <FileText className="size-4" />
                  <span>Tâche manuelle</span>
                </div>
              </SelectItem>
              {!loadingTemplates && templates.length > 0 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Modèles liés à ce type de document
                </div>
              )}
              {filteredTemplates.map((tpl: any) => {
                const Icon =
                  typeIcons[tpl.type as keyof typeof typeIcons] || FileText;
                return (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span>{tpl.label}</span>
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        {typeLabels[tpl.type as keyof typeof typeLabels] ??
                          tpl.type}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}

              {!loadingTemplates && filteredTemplates.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Aucun modèle spécifique pour ce type de document. Utilisez une
                  tâche manuelle.
                </div>
              )}
            </SelectContent>
          </Select>
          {errors?.templateId && (
            <p className="text-xs text-destructive mt-1">
              {errors.templateId.message as string}
            </p>
          )}

          {/* Template Info Display */}
          {isTemplateMode && selectedTemplate && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Configuration du modèle
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {selectedTemplate.everyKm && (
                  <Badge variant="secondary" className="gap-1">
                    <Gauge className="size-3" />
                    Tous les {selectedTemplate.everyKm.toLocaleString()} km
                  </Badge>
                )}
                {selectedTemplate.everyMonths && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="size-3" />
                    Tous les {selectedTemplate.everyMonths} mois
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={`gap-1 ${
                    selectedTemplate.defaultSeverity === "critical"
                      ? "bg-red-500/10 text-red-700"
                      : selectedTemplate.defaultSeverity === "warning"
                        ? "bg-amber-500/10 text-amber-700"
                        : "bg-slate-500/10 text-slate-700"
                  }`}
                >
                  <AlertCircle className="size-3" />
                  {selectedTemplate.defaultSeverity === "critical"
                    ? "Critique"
                    : selectedTemplate.defaultSeverity === "warning"
                      ? "Alerte"
                      : "Info"}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* VEHICLE SELECTION */}
        <div className="space-y-2">
          <Label
            htmlFor="vehicleId"
            className="text-xs uppercase text-muted-foreground"
          >
            Véhicule concerné
          </Label>

          <Select
            value={vehicleSelectValue}
            onValueChange={(val) => {
              if (val === "__none") {
                setValue("vehicleId", undefined, { shouldValidate: true });
                return;
              }
              setValue("vehicleId", val, { shouldValidate: true });
            }}
            disabled={isLoadingVehicles}
          >
            <SelectTrigger className="h-11">
              <SelectValue
                placeholder={
                  isLoadingVehicles
                    ? "Chargement des véhicules..."
                    : "Choisir un véhicule"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.brand || v.model
                    ? `${[v.brand, v.model].filter(Boolean).join(" ")}`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.vehicleId && (
            <p className="text-xs text-destructive mt-1">
              {errors.vehicleId.message as string}
            </p>
          )}
        </div>
      </div>

      {/* TASK DETAILS - Only show if manual mode OR allow override in template mode */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="label"
            className="text-xs uppercase text-muted-foreground"
          >
            Libellé de la tâche
          </Label>
          <Input
            id="label"
            placeholder="Ex: Renouveler assurance véhicule"
            className="h-11"
            {...register("label")}
          />
          {errors?.label && (
            <p className="text-xs text-destructive mt-1">
              {errors.label.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-xs uppercase text-muted-foreground"
          >
            Description
          </Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Détails supplémentaires (optionnel)"
            {...register("description")}
          />
        </div>
      </div>

      {/* DEADLINE */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="dueAt"
            className="text-xs uppercase text-muted-foreground flex items-center gap-1.5"
          >
            <Calendar className="size-3.5" />
            Date limite
          </Label>
          <Input
            id="dueAt"
            type="date"
            className="h-11"
            {...register("dueAt")}
          />
          {errors?.dueAt && (
            <p className="text-xs text-destructive mt-1">
              {errors.dueAt.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="dueMileage"
            className="text-xs uppercase text-muted-foreground flex items-center gap-1.5"
          >
            <Gauge className="size-3.5" />
            Kilométrage
          </Label>
          <Input
            id="dueMileage"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 5000 (suggestion)"
            className="h-11"
            {...register("dueMileage", { valueAsNumber: true })}
          />
          {errors?.dueMileage && (
            <p className="text-xs text-destructive mt-1">
              {errors.dueMileage.message as string}
            </p>
          )}
        </div>
      </div>

      {/* SEVERITY - Show even in template mode to allow override */}
      <div className="space-y-2">
        <Label className="text-xs uppercase text-muted-foreground flex items-center gap-1.5">
          <AlertCircle className="size-3.5" />
          Priorité
          {isTemplateMode && (
            <span className="text-[10px] font-normal normal-case ml-auto">
              (définie par le modèle)
            </span>
          )}
        </Label>
        <div className="flex gap-2">
          {(["info", "warning", "critical"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue("severity", s, { shouldValidate: true })}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                severity === s
                  ? s === "critical"
                    ? "bg-red-500/10 text-red-700 border-red-500/40"
                    : s === "warning"
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/40"
                      : "bg-slate-500/10 text-slate-700 border-slate-500/40"
                  : "bg-muted/30 text-muted-foreground border-transparent hover:border-muted-foreground/20"
              }`}
            >
              {s === "info" && "FAIBLE"}
              {s === "warning" && "MOYENNE"}
              {s === "critical" && "CRITIQUE"}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Mode Required Fields - Only show when no template */}
      {!isTemplateMode && (
        <div className="space-y-4 flex gap-2 pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground">
            Configuration manuelle requise
          </p>

          <div className="space-y-2">
            <Label
              htmlFor="type"
              className="text-xs uppercase text-muted-foreground"
            >
              Type de tâche
            </Label>
            <Select
              value={taskType || ""}
              onValueChange={(val) =>
                setValue("type", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choisir un type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => {
                  const Icon = typeIcons[value as keyof typeof typeIcons];
                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors?.type && (
              <p className="text-xs text-destructive mt-1">
                {errors.type.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="triggerType"
              className="text-xs uppercase text-muted-foreground"
            >
              Déclencheur
            </Label>
            <Select
              value={watch("triggerType") || ""}
              onValueChange={(val) =>
                setValue("triggerType", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choisir un déclencheur..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BY_DATE">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Par date</span>
                  </div>
                </SelectItem>
                <SelectItem value="BY_MILEAGE">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4" />
                    <span>Par kilométrage</span>
                  </div>
                </SelectItem>
                <SelectItem value="BY_DATE_OR_MILEAGE">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    <span>Date OU kilométrage</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors?.triggerType && (
              <p className="text-xs text-destructive mt-1">
                {errors.triggerType.message as string}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
