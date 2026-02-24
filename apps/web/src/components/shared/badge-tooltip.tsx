import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "../ui/badge";

interface TooltipProps {
  content?: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "active"
    | "pending";
  className?: string;
}

export const BadgeWithToolTip = ({
  content,
  children,
  className,
  variant = "default",
}: TooltipProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={variant}
            className={`text-xs px-2 py-0.5 rounded-sm ${className || ""}`}
          >
            {children}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
