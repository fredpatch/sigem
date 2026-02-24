import { UseFormReturn } from "react-hook-form";
import {
  AssetCreateInput,
  AssetSituationEnum,
  AssetUpdateInput,
} from "../../schema/schema";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CategorySelectField } from "../fields/category-select";
import { LocationSelectField } from "../fields/location-select";
import { situationConfig } from "../../utils/helpers";
import { motion } from "framer-motion";
import { SectionHeader } from "./section-header";
import {
  AlertCircle,
  FileText,
  Hash,
  Package,
  Wrench,
} from "lucide-react";
import { ReferenceComboboxField } from "@/components/shared/reference-combobox-field";

type AssetFormValues = AssetCreateInput | AssetUpdateInput;

interface AssetFormProps {
  form: UseFormReturn<AssetFormValues>;
  id: boolean;
}

export const AssetForm = ({ form, id }: AssetFormProps) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const situation = watch("situation");
  const disabled = form.formState.isSubmitting;

  const currentSituationConfig = situation
    ? situationConfig[situation as keyof typeof situationConfig]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* === BASIC INFORMATION === */}
      <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
        <SectionHeader
          icon={Package}
          title="Informations générales"
          description="Essential details about the asset"
        />

        <div className="space-y-4">
          {/* <FormFieldWrapper
            label={id ? "Edit Label" : "Asset Label"}
            error={errors.label?.message as string | undefined}
            tooltip="Nom ou description de l'actif (ex: Ordinateur complet, Imprimante HP, etc.)"
          >
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                disabled={disabled}
                {...register("label")}
                placeholder="e.g., Ordinateur Portable Dell XPS"
                className="pl-10 h-11 border-muted-foreground/20 focus:border-primary transition-colors"
              />
            </div>
          </FormFieldWrapper> */}
          <ReferenceComboboxField placeholder="e.g., Ordinateur Portable Dell XPS" label="Nom / description du bien (ex : Ordinateur complet, Imprimante HP, etc.)"
            control={form.control} name={"label" as any} refKey="asset.label" disabled={disabled} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationSelectField id={id} form={form} disabled={disabled} />
            <CategorySelectField id={id} form={form} disabled={disabled} />
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* === TECHNICAL DETAILS === */}
        <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
          <SectionHeader
            icon={Wrench}
            title="Détails techniques"
            description="Brand, model, and serial identification"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <FormFieldWrapper
              label="Brand"
              error={errors.brand?.message as string | undefined}
            >
              <Input
                disabled={disabled}
                {...register("brand")}
                placeholder="HP, Dell, Canon..."
                className="h-11 border-muted-foreground/20 focus:border-primary transition-colors"
              />
            </FormFieldWrapper> */}
            <ReferenceComboboxField
              control={form.control}
              name={"brand" as any}
              label="Marque"
              refKey="asset.brand"
              disabled={disabled}
              placeholder="HP, Dell.."
            />



            {/* <FormFieldWrapper
              label="Model"
              error={errors.model?.message as string | undefined}
            >
              <Input
                disabled={disabled}
                {...register("model")}
                placeholder="ProBook 450 G8"
                className="h-11 border-muted-foreground/20 focus:border-primary transition-colors"
              />
            </FormFieldWrapper> */}
            <ReferenceComboboxField
              control={form.control}
              name={"model" as any}
              label="Modèle"
              refKey="asset.model"
              placeholder="ProBook.."
              disabled={disabled}
            />

            <FormFieldWrapper
              label="Numéro de série"
              className="col-span-2"
              error={errors.serialNumber?.message as string | undefined}
            >
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  disabled={disabled}
                  {...register("serialNumber")}
                  placeholder="SN-12345-ABC"
                  className="pl-10 font-mono text-xs border-muted-foreground/20 focus:border-primary transition-colors"
                />
              </div>
            </FormFieldWrapper>
          </div>
        </div>
        {/* === QUANTITY & STATUS === */}
        <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
          <SectionHeader
            icon={AlertCircle}
            title="Statut & état"
            description="Current state and operational status"
          />

          <div className="space-y-4">
            <FormFieldWrapper
              label="Situation du bien"
              error={errors.situation?.message as string | undefined}
            >
              <Select
                disabled={disabled}
                value={situation}
                onValueChange={(value) =>
                  setValue("situation", value as AssetFormValues["situation"])
                }
              >
                <SelectTrigger
                  className={`h-12 border-2 transition-all ${currentSituationConfig
                    ? `${currentSituationConfig.borderColor} ${currentSituationConfig.bgColor}`
                    : "border-muted-foreground/20"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {currentSituationConfig && (
                      <>
                        <currentSituationConfig.icon
                          className={`h-4 w-4 ${currentSituationConfig.color}`}
                        />
                        <span className={currentSituationConfig.color}>
                          {currentSituationConfig.label}
                        </span>
                      </>
                    )}
                    {!situation && (
                      <span className="text-muted-foreground">
                        Select situation
                      </span>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {AssetSituationEnum.options.map((opt) => {
                    const config =
                      situationConfig[opt as keyof typeof situationConfig];
                    const SitIcon = config.icon;
                    return (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 py-1">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-md ${config.bgColor} border ${config.borderColor}`}
                          >
                            <SitIcon
                              className={`h-3.5 w-3.5 ${config.color}`}
                            />
                          </div>
                          <span className="font-medium">{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormFieldWrapper>

            {/* Hidden but functional quantity/unit fields */}
            <div className="hidden">
              <FormFieldWrapper
                label="Quantity"
                error={errors.quantity?.message as string | undefined}
              >
                <Input
                  type="number"
                  disabled={true}
                  {...register("quantity", { valueAsNumber: true })}
                  min={1}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Unit"
                error={errors.unit?.message as string | undefined}
              >
                <Input
                  disabled={true}
                  {...register("unit")}
                  placeholder="pcs"
                />
              </FormFieldWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* === OBSERVATIONS === */}
      <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
        <SectionHeader
          icon={FileText}
          title="Observations"
          description="Any relevant observations or remarks"
        />

        <FormFieldWrapper
          label="Observation"
          error={errors.observation?.message as string | undefined}
          tooltip="Note complémentaire sur l'état ou le contexte (ex: écran fissuré, déplacé en 2024, etc.)"
        >
          <Textarea
            disabled={disabled}
            {...register("observation")}
            className="min-h-[120px] border-muted-foreground/20 focus:border-primary transition-colors resize-none"
            placeholder="Ajoutez toute remarque utile sur l’état du bien, son historique ou des exigences particulières…"

          />
        </FormFieldWrapper>
      </div>

      {/* Current Status Preview (if editing) */}
      {id && situation && currentSituationConfig && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl border-2 ${currentSituationConfig.borderColor} ${currentSituationConfig.bgColor} p-4`}
        >
          <div className="flex items-center gap-3">
            <currentSituationConfig.icon
              className={`h-5 w-5 ${currentSituationConfig.color}`}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Current Status
              </p>
              <p
                className={`text-xs font-medium ${currentSituationConfig.color}`}
              >
                {currentSituationConfig.label}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
