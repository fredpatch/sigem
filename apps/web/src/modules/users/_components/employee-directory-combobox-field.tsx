import * as React from "react";
import { Control, useController } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";

import {
  //   useEmployeeDirectoryListAll,
  useEmployeeDirectorySearch,
} from "../hooks/useEmployee";
import { EmployeeDirectoryItem } from "../api/employee.api";

type Props = {
  control: Control<any>;
  name: string; // ex: "assignedToEmployeeMatricule"
  label?: string;
  placeholder?: string;
  disabled?: boolean;

  /** callback quand on choisit un employé -> pour auto-fill */
  onSelectEmployee?: (emp: EmployeeDirectoryItem) => void;

  /** si tu veux afficher une valeur label personnalisée */
  formatLabel?: (emp: EmployeeDirectoryItem) => string;
};

export function EmployeeDirectoryComboboxField({
  control,
  name,
  label = "Employé",
  placeholder = "Rechercher un employé (min 2 lettres)…",
  disabled,
  onSelectEmployee,
  formatLabel,
}: Props) {
  const { field, fieldState } = useController({ control, name });

  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  // mini debounce
  React.useEffect(() => {
    const t = setTimeout(() => setQ((qRaw) => qRaw), 0);
    return () => clearTimeout(t);
  }, []);

  const qq = q.trim();
  const { data, isFetching } = useEmployeeDirectorySearch(qq);

  const items: EmployeeDirectoryItem[] = Array.isArray((data as any)?.items)
    ? (data as any).items
    : Array.isArray(data)
      ? (data as any)
      : [];

  const selectedMatricule = (field.value ?? "") as string;
  const selected =
    items.find((e) => String(e.matricule) === String(selectedMatricule)) ??
    null;

  const labelText = selected
    ? (formatLabel?.(selected) ??
      `${selected.matricule} - ${selected.firstName} ${selected.lastName}`)
    : placeholder;

  return (
    <FormFieldWrapper label={label} error={fieldState.error?.message}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !selectedMatricule && "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 opacity-70" />
              <span className="truncate">{labelText}</span>
            </span>
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-70" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-70" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[420px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={q}
              onValueChange={setQ}
              placeholder="Tapez un matricule, prénom ou nom…"
            />
            <CommandList>
              {qq.length < 2 ? (
                <CommandEmpty>Entrez au moins 2 caractères.</CommandEmpty>
              ) : items.length === 0 ? (
                <CommandEmpty>Aucun employé trouvé.</CommandEmpty>
              ) : (
                <CommandGroup heading="Résultats">
                  {items.map((emp) => {
                    const isActive =
                      String(emp.matricule) === String(selectedMatricule);

                    const rowLabel =
                      formatLabel?.(emp) ??
                      `${emp.matricule} - ${emp.firstName} ${emp.lastName}`;

                    const meta = [emp.direction, emp.fonction]
                      .filter(Boolean)
                      .join(" • ");

                    return (
                      <CommandItem
                        key={emp.matricule}
                        value={String(emp.matricule)}
                        onSelect={() => {
                          field.onChange(emp.matricule);
                          onSelectEmployee?.(emp);
                          setOpen(false);
                        }}
                        className="flex items-start gap-2"
                      >
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {rowLabel}
                          </div>
                          {meta && (
                            <div className="text-xs text-muted-foreground truncate">
                              {meta}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </FormFieldWrapper>
  );
}
