import * as React from "react";
import { Check, ChevronsUpDown, Package } from "lucide-react";
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
} from "@/components/ui/command";

type Props = {
  items: any[];
  value?: string;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export function ItemSelect({ items, value, onChange, disabled }: Props) {
  const [open, setOpen] = React.useState(false);
  const selected = items.find((x) => String(x._id) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <Package className="h-4 w-4 text-muted-foreground" />
            {selected ? (
              <span className="truncate">
                {selected.label}{" "}
                <span className="text-muted-foreground">
                  {selected.unit ? `(${selected.unit})` : ""}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Choisir un article</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[420px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un article..." />
          <CommandEmpty>Aucun article.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {items.map((it) => {
              const isSelected = String(it._id) === String(value);
              return (
                <CommandItem
                  key={it._id}
                  value={`${it.label} ${it.unit ?? ""}`}
                  onSelect={() => {
                    onChange(String(it._id));
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
                    <div className="truncate font-medium">{it.label}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {it.unit ?? ""}
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
