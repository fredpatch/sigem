import { useProvidersList } from "@/modules/providers/hooks/use-providers";
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
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Si tu as shadcn Select, utilise-le.
// Sinon on reste simple avec <select>.
type Props = {
  value?: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  onlyType?: "FOURNISSEUR" | "PRESTATAIRE"; // optionnel
  disabled?: boolean;
};

export function ProviderSelect({
  value,
  onChange,
  placeholder = "Choisir un fournisseur",
  onlyType,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  // Adapte query selon ton ProvidersListQuery (ex: { page, limit, search, isActive, type })
  const q = useProvidersList({
    page: 1,
    limit: 100,
    search: "",
    isActive: true,
    type: onlyType, // si ton API supporte le filtre
  } as any);

  const providers =
    q.data?.items ?? q.data?.items ?? (q.data as any)?.items ?? [];

  const selected = providers.find((p: any) => String(p.id) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || q.isLoading}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {selected ? (
              <span className="truncate">
                {selected.name}{" "}
                <span className="text-muted-foreground">
                  {selected.type ? `(${selected.type})` : ""}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                {q.isLoading ? "Chargement..." : placeholder}
              </span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un fournisseur..." />
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            <CommandItem
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
              className="text-muted-foreground"
            >
              Effacer la sélection
            </CommandItem>

            {providers.map((p: any) => {
              const isSelected = String(p.id) === String(value);
              return (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.type ?? ""}`}
                  onSelect={() => {
                    onChange(String(p.id));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.type ?? ""} {p.phones?.[0] ? ` (${p.phones[0]})` : ""}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
