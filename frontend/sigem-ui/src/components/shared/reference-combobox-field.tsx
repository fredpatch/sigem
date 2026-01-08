import * as React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReferences } from "@/modules/references/hooks/use-reference";

// ✅ type générique: "vehicle.brand", "asset.model", etc.
export type ReferenceKey = `${string}.${string}`;


type Props<T extends FieldValues> = {
    control: Control<T>;
    name: Path<T>;
    label?: string;
    placeholder?: string;
    refKey: ReferenceKey;
    disabled?: boolean;
    dept?: string;
    className?: string
};

export function ReferenceComboboxField<T extends FieldValues>({
    control,
    name,
    label,
    placeholder = "Rechercher...",
    refKey,
    disabled,
    dept = "MG",
    className
}: Props<T>) {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");

    const { suggestions } = useReferences({ key: refKey, q, dept, limit: 20 });
    const { data: items = [], isFetching } = suggestions

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                const current = (field.value as string) ?? "";

                return (
                    <div className="space-y-1">
                        {label && (
                            <div className="text-sm font-medium">{label}</div>
                        )}

                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={disabled}
                                    className={cn(
                                        "w-full h-11 justify-between bg-white text-left font-normal hover:bg-primary/30 hover:text-white",
                                        fieldState.error && "border-destructive"
                                    )}
                                >
                                    <span className={cn(!current && "text-muted-foreground placeholder:text-muted focus:border-blue-500 transition-colors")}>
                                        {current || placeholder}
                                    </span>
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        className={cn("border-muted-foreground/20 focus:border-primary transition-colors ", className)}
                                        value={q}
                                        onValueChange={setQ}
                                        placeholder={placeholder}
                                    />

                                    <CommandEmpty>
                                        {q?.trim()
                                            ? "Aucune suggestion. Appuie sur Entrée pour garder ta saisie."
                                            : "Commence à taper…"}
                                    </CommandEmpty>

                                    <CommandGroup>
                                        {q.trim().length > 0 && (
                                            <CommandItem
                                                value={q}
                                                onSelect={() => {
                                                    const v = q.trim();
                                                    field.onChange(v);
                                                    setOpen(false);
                                                }}
                                            >
                                                Utiliser : “{q.trim()}”
                                            </CommandItem>
                                        )}

                                        {items?.map((it: any) => (
                                            <CommandItem
                                                key={it.value}
                                                value={it.value}
                                                onSelect={() => {
                                                    field.onChange(it.value);
                                                    setOpen(false);
                                                }}
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span>{it.value}</span>
                                                    {!!it.count && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {it.count}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}

                                        {isFetching && (
                                            <div className="px-2 py-2 text-xs text-muted-foreground">
                                                Chargement…
                                            </div>
                                        )}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {fieldState.error?.message && (
                            <p className="text-xs text-destructive">{fieldState.error.message}</p>
                        )}
                    </div>
                );
            }}
        />
    );
}