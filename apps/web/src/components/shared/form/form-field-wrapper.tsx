import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FormFieldWrapperProps {
  children: React.ReactNode;
  label: string;
  error?: string;
  className?: string;
  tooltip?: string;
}

export const FormFieldWrapper = ({
  children,
  label,
  error,
  tooltip,
  className,
}: FormFieldWrapperProps) => {
  return (
    <div className={cn("space-y-2 relative", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground">{label}</Label>
        {tooltip && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground cursor-help text-xs underline">
                  ?
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="text-xs">{tooltip}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
      {error && <p className="text-destructive pt-1 text-xs">{error}</p>}
    </div>
  );
};
