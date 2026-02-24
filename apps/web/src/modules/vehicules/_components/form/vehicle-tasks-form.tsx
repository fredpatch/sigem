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
import { useVehicleTaskTemplates } from "../../hooks/use-template-task";

type Props = {
  form: any; // idéalement: UseFormReturn<VehicleTaskFormValues>
  isEdit?: boolean;
};

export const VehicleTasksForm = ({ form, isEdit }: Props) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { data: templates = [] } = useVehicleTaskTemplates();

  const selectedTemplateId: string | undefined = watch("templateId");
  const vehicleId: string | undefined = watch("vehicleId");
  const severity: string | undefined = watch("severity");

  const isTemplateMode = !!selectedTemplateId;
  const isCreateMode = !isEdit;
  const lockFromTemplate = isCreateMode && isTemplateMode; // seul le create locke les champs

  const handleTemplateChange = (templateId: string) => {
    if (!templateId || templateId === "__none") {
      setValue("templateId", undefined, { shouldValidate: true });
      return;
    }

    setValue("templateId", templateId, { shouldValidate: true });

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Pré-fill intelligent: on ne remplace pas si l'utilisateur a déjà saisi quelque chose
    if (!watch("label")) setValue("label", template.label);
    if (!watch("description"))
      setValue("description", template.description || "");
    if (!watch("severity")) setValue("severity", template.defaultSeverity);
  };

  const templateSelectValue =
    selectedTemplateId && selectedTemplateId !== ""
      ? selectedTemplateId
      : "__none";

  const vehicleSelectValue =
    vehicleId && vehicleId !== "" ? vehicleId : "__none";

  // TODO: à remplacer par une vraie query de véhicules
  const fakeVehicles = [
    { id: "veh1", label: "Toyota Yaris TR-123-AA" },
    { id: "veh2", label: "Hilux GR-789-BB" },
  ];

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-4">
      {/* MODE INFO (edit + template) */}
      {isEdit && isTemplateMode && (
        <div className="rounded-md border bg-muted px-3 py-2 text-xs text-muted-foreground">
          Cette tâche est basée sur le modèle{" "}
          <span className="font-medium">
            {currentTemplate?.label ?? "Modèle inconnu"}
          </span>
          . Le modèle ne peut pas être changé, mais vous pouvez ajuster
          l&apos;échéance et les détails de cette occurrence.
        </div>
      )}

      {/* TEMPLATE SELECT (création uniquement) */}
      {!isEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="templateId">Modèle de tâche (optionnel)</Label>
          <Select
            value={templateSelectValue}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Aucun modèle (tâche manuelle)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">
                Aucun modèle (tâche manuelle)
              </SelectItem>
              {templates.map((tpl) => (
                <SelectItem key={tpl.id} value={tpl.id}>
                  {tpl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.templateId && (
            <p className="text-xs text-destructive mt-1">
              {errors.templateId.message as string}
            </p>
          )}
          {isTemplateMode && currentTemplate && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Basé sur le modèle :{" "}
              <span className="font-medium">{currentTemplate.label}</span>{" "}
              (priorité par défaut :{" "}
              <span className="uppercase">
                {currentTemplate.defaultSeverity}
              </span>
              )
            </p>
          )}
        </div>
      )}

      {/* VEHICLE */}
      <div className="space-y-1.5">
        <Label htmlFor="vehicleId">Véhicule</Label>
        <Select
          value={vehicleSelectValue}
          onValueChange={(val) => {
            if (val === "__none") {
              setValue("vehicleId", undefined, { shouldValidate: true });
              return;
            }
            setValue("vehicleId", val, { shouldValidate: true });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un véhicule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Choisir un véhicule</SelectItem>
            {fakeVehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.label}
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

      {/* LABEL */}
      <div className="space-y-1.5">
        <Label htmlFor="label">Libellé de la tâche</Label>
        <Input
          id="label"
          placeholder="Ex: Renouveler assurance véhicule"
          readOnly={lockFromTemplate}
          className={lockFromTemplate ? "bg-muted/60 cursor-not-allowed" : ""}
          {...register("label")}
        />
        {errors?.label && (
          <p className="text-xs text-destructive mt-1">
            {errors.label.message as string}
          </p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Détails supplémentaires (optionnel)"
          readOnly={lockFromTemplate}
          className={lockFromTemplate ? "bg-muted/60 cursor-not-allowed" : ""}
          {...register("description")}
        />
        {errors?.description && (
          <p className="text-xs text-destructive mt-1">
            {errors.description.message as string}
          </p>
        )}
      </div>

      {/* DUE DATE / MILEAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dueAt">Échéance (date)</Label>
          <Input id="dueAt" type="date" {...register("dueAt")} />
          {errors?.dueAt && (
            <p className="text-xs text-destructive mt-1">
              {errors.dueAt.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueMileage">Échéance (kilométrage)</Label>
          <Input
            id="dueMileage"
            type="number"
            inputMode="numeric"
            {...register("dueMileage", { valueAsNumber: true })}
          />
          {errors?.dueMileage && (
            <p className="text-xs text-destructive mt-1">
              {errors.dueMileage.message as string}
            </p>
          )}
        </div>
      </div>

      {/* SEVERITY */}
      <div className="space-y-1.5">
        <Label>Priorité</Label>
        <div className="flex gap-2">
          {["info", "warning", "critical"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                setValue("severity", s as any, { shouldValidate: true })
              }
              className={`px-3 py-1 rounded-md cursor-pointer text-xs border ${
                severity === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s === "info" && "FAIBLE"}
              {s === "warning" && "MOYENNE"}
              {s === "critical" && "CRITIQUE"}
            </button>
          ))}
        </div>
        {errors?.severity && (
          <p className="text-xs text-destructive mt-1">
            {errors.severity.message as string}
          </p>
        )}
        {isTemplateMode && currentTemplate && (
          <p className="text-[11px] text-muted-foreground mt-1">
            Priorité par défaut du modèle :{" "}
            <span className="uppercase">{currentTemplate.defaultSeverity}</span>
            . Vous pouvez l&apos;ajuster pour cette tâche.
          </p>
        )}
      </div>
    </div>
  );
};
