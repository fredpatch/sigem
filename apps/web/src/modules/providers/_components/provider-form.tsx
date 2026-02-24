import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, Globe, Tags, Briefcase } from "lucide-react";

import type {
  ProviderCreateInput,
  ProviderUpdateInput,
} from "../schema/provider.schema";

type ProviderFormValues = ProviderCreateInput | ProviderUpdateInput;

interface Props {
  form: UseFormReturn<ProviderFormValues>;
  id: boolean; // isEdit
}

/**
 * Helpers: textarea <-> string[]
 */
function linesToArray(v: string) {
  return v
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function arrayToLines(arr?: string[]) {
  return (arr ?? []).filter(Boolean).join("\n");
}

export const ProviderForm = ({ form, id }: Props) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const disabled = isSubmitting;
  const type = watch("type");
  const phones = watch("phones") ?? [];
  const emails = watch("emails") ?? [];
  const tags = watch("tags") ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* --- INFOS GÉNÉRALES --- */}
      <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-9 w-9 rounded-lg border bg-primary/5 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">Informations générales</div>
            <div className="text-xs text-muted-foreground">
              Nom, désignation et type
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormFieldWrapper label="Nom" error={errors.name?.message as any}>
            <Input
              disabled={disabled}
              {...register("name")}
              placeholder="Ex: HOTEL BOULEVARD"
              className="h-11"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Désignation"
            error={errors.designation?.message as any}
          >
            <Input
              disabled={disabled}
              {...register("designation")}
              placeholder="Ex: Hôtel / Audit / Transport..."
              className="h-11"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Type" error={errors.type?.message as any}>
            <Select
              disabled={disabled}
              value={(type as any) || "PRESTATAIRE"}
              onValueChange={(v) => setValue("type", v as any)}
            >
              <SelectTrigger className="h-11">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-none text-[10px]"
                  >
                    {(type as any) || "PRESTATAIRE"}
                  </Badge>
                  <span className="text-sm">
                    {(type as any) === "FOURNISSEUR"
                      ? "Fournisseur"
                      : "Prestataire"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESTATAIRE">Prestataire</SelectItem>
                <SelectItem value="FOURNISSEUR">Fournisseur</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Département (optionnel)"
            error={errors.dept?.message as any}
          >
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                disabled={disabled}
                {...register("dept")}
                placeholder="Ex: MG"
                className="h-11 pl-10"
              />
            </div>
          </FormFieldWrapper>
        </div>
      </div>

      {/* --- CONTACTS --- */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">Contacts (téléphone)</div>
          </div>

          <FormFieldWrapper
            label="Numéros (1 par ligne)"
            error={errors.phones?.message as any}
            tooltip="Collez plusieurs numéros, un par ligne."
          >
            <Textarea
              disabled={disabled}
              value={arrayToLines(phones)}
              onKeyDown={(e) => {
                // 🔥 CRITICAL FIX
                if (e.key === "Enter") {
                  e.stopPropagation(); // prevent parent form from hijacking Enter
                }
              }}
              onChange={(e) =>
                setValue("phones", linesToArray(e.target.value) as any)
              }
              className="min-h-[120px] resize-none"
              placeholder={"Ex:\n+241 07 00 00 00\n+241 06 00 00 00"}
            />
          </FormFieldWrapper>

          <div className="mt-2 text-[11px] text-muted-foreground">
            {phones.length > 0 ? `${phones.length} numéro(s)` : "Aucun numéro"}
          </div>
        </div>

        <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">Emails</div>
          </div>

          <FormFieldWrapper
            label="Emails (1 par ligne)"
            error={errors.emails?.message as any}
            tooltip="Un email par ligne."
          >
            <Textarea
              disabled={disabled}
              value={arrayToLines(emails)}
              onKeyDown={(e) => {
                // 🔥 CRITICAL FIX
                if (e.key === "Enter") {
                  e.stopPropagation(); // prevent parent form from hijacking Enter
                }
              }}
              onChange={(e) =>
                setValue("emails", linesToArray(e.target.value) as any)
              }
              className="min-h-[120px] resize-none"
              placeholder={"Ex:\ncontact@domaine.com\nsupport@domaine.com"}
            />
          </FormFieldWrapper>

          <div className="mt-2 text-[11px] text-muted-foreground">
            {emails.length > 0 ? `${emails.length} email(s)` : "Aucun email"}
          </div>
        </div>
      </div>

      {/* --- SITE + TAGS + NOTES --- */}
      <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <FormFieldWrapper
            label="Site web"
            error={errors.website?.message as any}
          >
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                disabled={disabled}
                {...register("website")}
                placeholder="https://exemple.com"
                className="h-11 pl-10"
              />
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper
            label="Tags (1 par ligne)"
            error={errors.tags?.message as any}
          >
            <div className="relative">
              <Tags className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
              <Textarea
                disabled={disabled}
                value={arrayToLines(tags)}
                onKeyDown={(e) => {
                  // 🔥 CRITICAL FIX
                  if (e.key === "Enter") {
                    e.stopPropagation(); // prevent parent form from hijacking Enter
                  }
                }}
                onChange={(e) =>
                  setValue("tags", linesToArray(e.target.value) as any)
                }
                className="min-h-[90px] resize-none pl-10"
                placeholder={"Ex:\nHotel\nTransport\nAudit"}
              />
            </div>
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          className="mt-4"
          label="Notes (optionnel)"
          error={errors.notes?.message as any}
        >
          <Textarea
            disabled={disabled}
            {...register("notes")}
            className="min-h-[110px] resize-none"
            placeholder="Informations supplémentaires..."
          />
        </FormFieldWrapper>
      </div>

      {/* preview (optionnel) */}
      {id && (
        <div className="text-[11px] text-muted-foreground">
          Mode édition : les modifications seront appliquées après validation.
        </div>
      )}
    </motion.div>
  );
};
