import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ContactActions } from "./contact-actions";

type Props = {
  values: string[];
  kind: "phone" | "email";
  emptyLabel?: string;
};

export function MultiValueCell({ values, kind, emptyLabel = "—" }: Props) {
  const list = (values ?? []).filter(Boolean);
  if (list.length === 0)
    return <span className="text-muted-foreground">{emptyLabel}</span>;

  const primary = list[0];
  const rest = list.slice(1);

  return (
    <div className="flex items-start justify-between gap-2 min-w-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground line-clamp-1">
          {primary}
        </div>
        {rest.length > 0 && (
          <div className="text-[11px] text-muted-foreground/80">
            +{rest.length} autre(s)
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <ContactActions value={primary} kind={kind} />

        {rest.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Plus"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              {list.map((v) => (
                <DropdownMenuItem
                  key={v}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate">{v}</span>
                  <ContactActions value={v} kind={kind} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
