import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
// } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { levelConfig } from "../../utils/utils";
import { SectionHeader } from "../section-header";
import { motion } from "framer-motion";
import {
  MapPin,
  // Layers,
  FileText,
  Navigation,
} from "lucide-react";
import { ReferenceComboboxField } from "@/components/shared/reference-combobox-field";
import { Guidelines } from "@/common/guidelines";
// import { Badge } from "@/components/ui/badge";

type Props = {
  form: UseFormReturn<any>;
  isEdit?: boolean;
};

export const LocationForm = ({ form, isEdit }: Props) => {
  const {
    register,
    // setValue,
    watch,
    formState: { errors },
  } = form;
  const disabled = form.formState.isSubmitting;
  const level = watch("level") ?? "BUREAU";
  const localisation = watch("localisation");
  const batiment = watch("batiment");
  const direction = watch("direction");
  const bureau = watch("bureau");

  const currentLevelConfig = levelConfig[level as keyof typeof levelConfig];

  // Build path preview
  const pathParts = [localisation, batiment, direction, bureau].filter(Boolean);
  const pathPreview = pathParts.join(" / ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Guidelines
        variant="tips"
        className="-mt-2"
        compact
        title="Avant de créer un emplacement"
        description="Structurez et localisez précisément les biens et véhicules de l’organisation."
        items={[
          "Renseignez la hiérarchie dans l’ordre (site → bâtiment → direction → bureau).",
          "Le bureau correspond à l’unité finale d’affectation.",
          "Utilisez des noms clairs et cohérents pour faciliter la recherche.",
          "Les notes permettent d’indiquer des contraintes ou consignes spécifiques.",
        ]}
      />

      <Guidelines
        variant="warning"
        className="-mt-2"
        compact
        title="Attention"
        items={[
          "La suppression d’un emplacement peut affecter les biens associés.",
          "Évitez de modifier la hiérarchie si l’emplacement est déjà utilisé.",
        ]}
      />

      {/* === LOCATION HIERARCHY === */}
      <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
        <SectionHeader
          icon={Navigation}
          title="Emplacement Hiérarchie"
          description="Construisez le chemin complet de l'emplacement de haut en bas"
        />

        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-2">
            {/* Localisation */}
            <FormFieldWrapper
              label="Région Géographique"
              error={errors.localisation?.message as string | undefined}
              tooltip="Région géographique ou zone (ex : ESTUAIRE, HAUT-OGOOUE)"
            >
              <div className="relative">
                {/* <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600/60" /> */}
                <ReferenceComboboxField
                  control={form.control}
                  className="pl-10"
                  name={"localisation"}
                  refKey="location.localisation"
                  disabled={disabled}
                  placeholder="e.g., ESTUAIRE"
                />
              </div>
            </FormFieldWrapper>

            {/* Bâtiment */}
            <FormFieldWrapper
              label="Bâtiment"
              error={errors.batiment?.message as string | undefined}
              tooltip="Identifiant du bâtiment (ex : A, B, C, Bâtiment Principal)"
            >
              <div className="relative">
                {/* <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600/60" />
                <Input
                  {...register("batiment")}
                  placeholder="e.g., A"
                  autoComplete="off"
                  className="pl-10 h-11 border-muted-foreground/20 placeholder:text-muted focus:border-purple-500 transition-colors uppercase"
                /> */}
                <ReferenceComboboxField
                  control={form.control}
                  name={"batiment"}
                  refKey="location.batiment"
                  disabled={disabled}
                  placeholder="e.g., A"
                />
              </div>
            </FormFieldWrapper>

            {/* Direction */}
            <FormFieldWrapper
              label="Direction / Département"
              error={errors.direction?.message as string | undefined}
              tooltip="Département, service ou direction (ex : DAF, DG, RH)"
            >
              <div className="relative">
                {/* <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600/60" />
                <Input
                  {...register("direction")}
                  placeholder="e.g., DAF"
                  autoComplete="off"
                  className="pl-10 h-11 border-muted-foreground/20 placeholder:text-muted focus:border-amber-500 transition-colors uppercase"
                /> */}
                <ReferenceComboboxField
                  control={form.control}
                  name={"direction"}
                  refKey="location.direction"
                  disabled={disabled}
                  placeholder="e.g., DAF"
                />
              </div>
            </FormFieldWrapper>
          </div>

          <div className="grid md:grid-cols-1 gap-2">
            {/* Bureau */}
            <FormFieldWrapper
              label="Bureau / Espace de travail"
              error={errors.bureau?.message as string | undefined}
              tooltip="Bureau, salle ou espace de travail spécifique (ex : BUREAU 101)"
            >
              <div className="relative">
                {/* <DoorClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600/60" />
                <Input
                  {...register("bureau")}
                  placeholder="e.g., POOL CHARGE D'ETUDE"
                  autoComplete="off"
                  className="pl-10 h-11 border-muted-foreground/20 placeholder:text-muted focus:border-green-500 transition-colors uppercase"
                /> */}
                <ReferenceComboboxField
                  control={form.control}
                  name={"bureau"}
                  refKey="location.bureau"
                  disabled={disabled}
                  placeholder="e.g., POOL CHARGE D'ETUDE"
                />
              </div>
            </FormFieldWrapper>
          </div>
        </div>

        {/* Path Preview */}
        {pathPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-3"
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Aperçu du chemin complet
                </p>
                <p className="text-sm font-mono font-semibold text-primary break-all">
                  {pathPreview}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ce chemin représente l'emplacement complet tel qu'il sera
                  enregistré dans le système.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* === HIERARCHY LEVEL === */}

      {/* === ADDITIONAL NOTES === */}
      <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
        <SectionHeader
          icon={FileText}
          title="Informations supplémentaires"
          description="Notes ou remarques optionnelles concernant cet emplacement"
        />

        <FormFieldWrapper
          label="Notes"
          error={errors.notes?.message as string | undefined}
          tooltip="Tout contexte, instructions ou informations supplémentaires"
        >
          <Textarea
            {...register("notes")}
            placeholder="Ajoutez des notes pertinentes concernant cet emplacement, telles que des restrictions d'accès, des exigences particulières ou des consignes d'utilisation..."
            rows={4}
            className="border-muted-foreground/20 focus:border-primary transition-colors resize-none"
          />
        </FormFieldWrapper>
      </div>

      {/* === LOCATION SUMMARY === */}
      {isEdit && pathPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl border-2 ${currentLevelConfig.borderColor} ${currentLevelConfig.bgColor} p-5`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${currentLevelConfig.bgColor} border ${currentLevelConfig.borderColor}`}
            >
              <currentLevelConfig.icon
                className={`h-6 w-6 ${currentLevelConfig.color}`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">
                Modification de l'emplacement
              </p>
              <p className={`text-xs font-medium ${currentLevelConfig.color}`}>
                {currentLevelConfig.label} Niveau
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {pathPreview}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
