"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";
import { Check } from "lucide-react";
import { useMemo } from "react";

type Severity = "info" | "warning" | "error" | "success";

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    type?: string; // ex: asset.updated (eventType)
    severity?: Severity;
    createdAt: string | Date;
    isRead: boolean;
    isDeleted: boolean;
    payload?: Record<string, any>;
    relatedResource?: {
        resourceType: string; // "Asset"
        resourceId: string;
    };
};

// function severityBadgeVariant(sev?: Severity) {
//     // shadcn Badge variants depend on your setup; we keep it simple
//     switch (sev) {
//         case "error":
//             return "destructive";
//         default:
//             return "secondary";
//     }
// }

// function sevLabel(sev?: Severity) {
//     return sev ?? "info";
// }

const SEVERITY_UI = {
    info: { label: "Information", badge: "border-blue-300 text-blue-700 bg-blue-50" },
    warning: { label: "Avertissement", badge: "border-amber-300 text-amber-700 bg-amber-50" },
    error: { label: "Critique", badge: "border-red-300 text-red-700 bg-red-50" },
    success: { label: "Succès", badge: "border-emerald-300 text-emerald-700 bg-emerald-50" },
} as const;

function sevUI(sev?: Severity) {
    return SEVERITY_UI[sev ?? "info"];
}

export function NotificationDetailsPanel(props: {
    selected?: NotificationItem | null;
    onMarkRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    onOpenResource?: (resourceType: string, resourceId: string) => void;
}) {
    const { selected, onMarkRead } = props;
    const { user } = useAuthStore()
    const isAdmin = user?.role.includes("SUPER_ADMIN") || user?.role.includes("ADMIN");

    // console.log("isAdmin", isAdmin);

    const meta = useMemo(() => {
        if (!selected) return null;

        const createdAt = new Date(selected.createdAt);
        const payload = selected.payload ?? {};

        return {
            createdAt,
            assetCode: payload.code as string | undefined,
            label: payload.label as string | undefined,
            fromStatus: payload.fromStatus as string | undefined,
            toStatus: payload.toStatus as string | undefined,
            role: payload.role as string | undefined,
            topicOrType: selected.type,
            payload,
        };
    }, [selected]);

    return (
        <Card className="h-fit min-h-[200px]">
            <div className="p-4">
                {!selected ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        Sélectionne une notification à gauche pour voir les détails.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h2 className="font-semibold text-lg truncate">{selected.title}</h2>
                                    <Badge variant={"outline"} className={cn("capitalize", sevUI(selected.severity).badge)}>
                                        {sevUI(selected.severity).label}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {meta?.createdAt.toLocaleString()}
                                </div>
                            </div>

                            {!selected.isRead && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    title="Marquer comme lu"
                                    onClick={() => onMarkRead?.(selected.id)}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Message */}
                        <div className="rounded-md border p-3 bg-muted/20">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selected.message}
                            </p>
                        </div>

                        {/* Meta */}
                        {isAdmin && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Informations</div>

                                    <div className="text-sm flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Type d’événement</span>
                                        <span className="font-medium">{meta?.topicOrType ?? "—"}</span>
                                    </div>

                                    {isAdmin && (
                                        <>
                                            {meta?.role && (
                                                <div className="text-sm flex items-center justify-between gap-3">
                                                    <span className="text-muted-foreground">Rôle</span>
                                                    <span className="font-medium">{meta.role}</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {meta?.label && (
                                        <div className="text-sm flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">Équipement</span>
                                            <span className="font-medium truncate">{meta.label}</span>
                                        </div>
                                    )}

                                    {meta?.assetCode && (
                                        <div className="text-sm flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">Code</span>
                                            <span className="font-medium">{meta.assetCode}</span>
                                        </div>
                                    )}

                                    {(meta?.fromStatus || meta?.toStatus) && (
                                        <div className="text-sm flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">Statut</span>
                                            <span className="font-medium">
                                                {meta?.fromStatus ?? "—"} → {meta?.toStatus ?? "—"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <Separator />

                                {/* Actions */}
                                {/* <div className="flex flex-wrap gap-2">
                                    {selected.relatedResource?.resourceId && (
                                <Button
                                    variant="default"
                                    className="gap-2"
                                    onClick={() =>
                                        onOpenResource?.(
                                            selected.relatedResource!.resourceType,
                                            selected.relatedResource!.resourceId
                                        )
                                    }
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Ouvrir la ressource
                                </Button>
                            )}

                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(
                                                    JSON.stringify(selected.payload ?? {}, null, 2)
                                                );
                                            } catch { }
                                        }}
                                        title="Copier le payload JSON"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copier payload
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className={cn("gap-2")}
                                        onClick={() => onDelete?.(selected.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Supprimer
                                    </Button>
                                </div> */}

                                {/* Debug payload (optionnel) */}
                                <details className="pt-2">
                                    <summary className="text-sm text-muted-foreground cursor-pointer select-none">
                                        Voir le payload (debug)
                                    </summary>
                                    <pre className="mt-2 text-xs rounded-md border p-3 overflow-auto max-h-[260px] bg-muted/20">
                                        {JSON.stringify(meta?.payload ?? {}, null, 2)}
                                    </pre>
                                </details>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
