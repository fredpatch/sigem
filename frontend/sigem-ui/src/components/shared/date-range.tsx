import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
// import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId } from "react";
import { DateRange } from "react-day-picker";

type Props = {
  label?: string;
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  className?: string;
};

export function DateRangePickerControlled({
  // label = "Période",
  value,
  onChange,
  className,
}: Props) {
  const id = useId();

  return (
    <div className={cn("space-y-2", className)}>
      {/* <Label htmlFor={id}>{label}</Label> */}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "group w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20",
              !value?.from && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "truncate",
                !value?.from && "text-muted-foreground",
              )}
            >
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "dd/MM/y")} -{" "}
                    {format(value.to, "dd/MM/y")}
                  </>
                ) : (
                  format(value.from, "dd/MM/y")
                )
              ) : (
                "Choisir une période"
              )}
            </span>

            <CalendarIcon
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
