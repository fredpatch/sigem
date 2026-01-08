import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export type GuidelinesVariant =
  | "info"
  | "tips"
  | "warning"
  | "danger"
  | "success";

type GuidelinesItem =
  | string
  | {
      title?: string;
      text: string;
    };

type HelpRef =
  | { href: string } // full custom link
  | { section: string; topic: string }; // build /help/:section/:topic

type Props = {
  title?: string;
  description?: string;

  /** items simples (string) ou objets { title?, text } */
  items?: GuidelinesItem[];

  /** si tu veux un contenu custom au lieu des items */
  children?: React.ReactNode;

  /** info | tips | warning | danger | success */
  variant?: GuidelinesVariant;

  /** version compacte (pratique dans les modals) */
  compact?: boolean;

  /** actions (boutons, liens) à droite ou en bas */
  actions?: React.ReactNode;

  className?: string;

  /** Help Center link (optional) */
  helpRef?: HelpRef;
  showHelpLink?: boolean;
  helpLabel?: string;
  helpHint?: string;
};

const variantStyles: Record<
  GuidelinesVariant,
  { wrap: string; badge: string }
> = {
  info: {
    wrap: "border-blue-200/60 bg-blue-50/50",
    badge: "bg-blue-100 text-blue-700 border-blue-200/60",
  },
  tips: {
    wrap: "border-emerald-200/60 bg-emerald-50/50",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200/60",
  },
  warning: {
    wrap: "border-amber-200/60 bg-amber-50/50",
    badge: "bg-amber-100 text-amber-800 border-amber-200/60",
  },
  danger: {
    wrap: "border-rose-200/60 bg-rose-50/50",
    badge: "bg-rose-100 text-rose-800 border-rose-200/60",
  },
  success: {
    wrap: "border-green-200/60 bg-green-50/50",
    badge: "bg-green-100 text-green-800 border-green-200/60",
  },
};

function VariantIcon({ variant }: { variant: GuidelinesVariant }) {
  const cls = "h-4 w-4";
  switch (variant) {
    case "tips":
      return <Lightbulb className={cls} />;
    case "warning":
      return <AlertTriangle className={cls} />;
    case "danger":
      return <ShieldAlert className={cls} />;
    case "success":
      return <CheckCircle2 className={cls} />;
    case "info":
    default:
      return <Info className={cls} />;
  }
}

function VariantLabel(variant: GuidelinesVariant) {
  switch (variant) {
    case "tips":
      return "Conseils";
    case "warning":
      return "Important";
    case "danger":
      return "Attention";
    case "success":
      return "Bon à savoir";
    case "info":
    default:
      return "Infos";
  }
}

function resolveHelpHref(helpRef?: HelpRef) {
  if (!helpRef) return "/help"; // default to Help home
  if ("href" in helpRef) return helpRef.href;
  return `/help/${helpRef.section}/${helpRef.topic}`;
}

export function Guidelines({
  title = "Guide d’utilisation",
  description,
  items,
  children,
  variant = "info",
  compact = false,
  actions,
  className,

  helpRef,
  showHelpLink = true,
  helpLabel = "Aide",
  helpHint = "Besoin de détails ? Consultez le centre d’aide.",
}: Props) {
  const [open, setOpen] = React.useState(true);
  const styles = variantStyles[variant];
  const navigate = useNavigate();

  const helpHref = resolveHelpHref(helpRef);

  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        styles.wrap,
        compact && "p-3",
        className
      )}
    >
      <div className={cn("flex items-start gap-3", compact && "gap-2")}>
        <div
          className={cn(
            "mt-0.5 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
            styles.badge
          )}
        >
          <VariantIcon variant={variant} />
          <span>{VariantLabel(variant)}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={cn(
                  "text-sm font-semibold leading-5",
                  compact && "text-[13px]"
                )}
              >
                {title}
              </h3>

              {description ? (
                <p
                  className={cn(
                    "mt-1 text-sm text-muted-foreground",
                    compact && "text-[13px]"
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {actions ? <div className="shrink-0">{actions}</div> : null}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground"
              >
                {open ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {open && (
            <div className={cn("mt-3", compact && "mt-2")}>
              {children ? (
                children
              ) : items && items.length > 0 ? (
                <ul className={cn("space-y-2", compact && "space-y-1.5")}>
                  {items.map((it, idx) => {
                    const item =
                      typeof it === "string"
                        ? { text: it }
                        : { title: it.title, text: it.text };

                    return (
                      <li key={idx} className="flex gap-2">
                        <ChevronRight className="mt-[2px] h-4 w-4 shrink-0 opacity-70" />
                        <div className="min-w-0">
                          {item.title ? (
                            <div className="text-sm font-medium leading-5">
                              {item.title}
                            </div>
                          ) : null}
                          <div
                            className={cn(
                              "text-sm text-foreground/90",
                              compact && "text-[13px]"
                            )}
                          >
                            {item.text}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {showHelpLink ? (
                <footer className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="truncate">{helpHint}</span>
                  <Button
                    onClick={() => navigate(helpHref)}
                    variant="outline"
                    size="sm"
                    className={cn(compact && "h-8 px-2")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {helpLabel}
                  </Button>
                </footer>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
