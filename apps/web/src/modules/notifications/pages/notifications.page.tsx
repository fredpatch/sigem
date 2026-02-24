import { useEffect, useMemo, useState } from "react";
import { useNotificationStore } from "../store/notification-store";
import { useNotification } from "../hooks/use-notification";
import { Button } from "@/components/ui/button";
import { Bell, Check, RefreshCw, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationSeverity } from "../hooks/use-real-time-notification";
import { NotificationDetailsPanel } from "./notification-details-panel";
import { SEVERITY_CONFIG, SeverityLevel } from "../types/notifications";

type Tab = "all" | "unread" | "read";

function toggleLevel(
    level: NotificationSeverity,
    levels: NotificationSeverity[],
    setLevels: (v: NotificationSeverity[]) => void
) {
    setLevels(levels.includes(level) ? levels.filter((x) => x !== level) : [...levels, level]);
}


export const NotificationsPage = () => {
    const [tab, setTab] = useState<Tab>("all");
    const [levels, setLevels] = useState<NotificationSeverity[]>([]);
    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const limit = 20;
    const severityParams = levels.length ? levels.join(",") : undefined

    const items = useNotificationStore((s) => s.items); // adapte
    const upsertMany = useNotificationStore((s) => s.upsertMany);
    const markLocalRead = useNotificationStore((s) => s.markAsRead);
    const softDeleteLocal = useNotificationStore((s) => s.softDelete);

    const { readAll, list, softDelete, markRead } = useNotification({ severity: severityParams, page, limit, includeGlobal: true, unreadOnly: tab === "unread" ? true : undefined, search: q || undefined, scope: "all" },
        { includeGlobal: true },);

    // Optionnel (si on veux sync serveur) :
    const { data: notifs, isLoading } = list;

    // hydrate store depuis l’API
    useEffect(() => {
        const serverItems = notifs?.items;

        console.log("Hydrate notifications store from server:", serverItems);
        if (!serverItems?.length) return;
        upsertMany(serverItems as any);
    }, [notifs?.items, upsertMany]);

    useEffect(() => setPage(1), [tab, q, severityParams]);

    const filtered = useMemo(() => {
        const base = (items ?? []).filter((n) => !n.isDeleted);

        const byTab = tab === "unread" ? base.filter((n) => !n.isRead) : tab === "read" ? base.filter((n) => n.isRead) : base;

        const bySeverity =
            levels.length > 0
                ? byTab.filter((n) => levels.includes((n.severity ?? "info") as any))
                : byTab;

        if (!q.trim()) return bySeverity;

        const s = q.trim().toLowerCase();

        return bySeverity.filter((n) =>
            (n.title ?? "").toLowerCase().includes(s) ||
            (n.message ?? "").toLowerCase().includes(s)
        );
    }, [items, tab, q, levels]);

    const unreadCount = useMemo(
        () => (items ?? []).filter((n) => !n.isRead && !n.isDeleted).length,
        [items]
    );

    useEffect(() => {
        if (selectedId) return;
        if (filtered.length > 0) setSelectedId(filtered[0].id);
    }, [filtered, selectedId]);

    const selected = useMemo(
        () => filtered.find((n) => n.id === selectedId) ?? null,
        [filtered, selectedId]
    );


    return (
        <div className="p-6 space-y-3 mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="relative mt-1">
                        <Bell className="h-7 w-7" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2">
                                <Badge className="h-5 min-w-5 px-1.5 rounded-full">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </Badge>
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Notifications</h1>
                        <p className="text-sm text-muted-foreground">
                            Centre de suivi des événements SIGEM.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        disabled={readAll.isPending || unreadCount === 0}
                        onClick={() => readAll.mutate({ scope: "user", includeGlobal: true })}
                    >
                        <Check className="h-4 w-4" />
                        Tout marquer comme lu
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => list.refetch()}
                        disabled={list.isFetching}
                        title="Rafraîchir"
                    >
                        <RefreshCw className={cn("h-4 w-4", list.isFetching && isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Search + Tabs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 w-full sm:max-w-md">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>

                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                    <TabsList>
                        <TabsTrigger value="all">Toutes</TabsTrigger>
                        <TabsTrigger value="unread">Non lues</TabsTrigger>
                        <TabsTrigger value="read">Lues</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="pl-6 flex flex-wrap gap-2">
                {(Object.keys(SEVERITY_CONFIG) as SeverityLevel[]).map((lvl) => {
                    const active = levels.includes(lvl);

                    return (
                        <Button
                            key={lvl}
                            type="button"
                            variant={levels.includes(lvl) ? "default" : "outline"}
                            size="sm"
                            data-active={active}
                            onClick={() => toggleLevel(lvl, levels, setLevels)}
                            className={SEVERITY_CONFIG[lvl].className}
                        >
                            {SEVERITY_CONFIG[lvl].label}
                        </Button>
                    )
                })}

                {levels.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setLevels([])}>
                        Réinitialiser
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                <div className="lg:col-span-7 xl:col-span-8 space-y-3">


                    {/* List */}
                    <ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
                        <div className="p-2 space-y-2">
                            {list.isLoading ? (
                                <div className="p-6 text-sm text-muted-foreground">Chargement…</div>
                            ) : filtered.length === 0 ? (
                                <div className="p-10 text-center text-sm text-muted-foreground">
                                    Aucune notification.
                                </div>
                            ) : (
                                filtered.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => setSelectedId(n.id)}
                                        className={cn(
                                            "group relative rounded-lg border p-4 transition hover:bg-muted/30",
                                            selectedId === n.id && "ring-1 ring-black/50",
                                            n.severity === "error" && "bg-destructive/20",
                                            n.severity === "warning" && "bg-yellow-500/20",
                                            n.severity === "success" && "bg-green-500/20",
                                            (!n.severity || n.severity === "info") && "bg-blue-500/20",
                                            !n.isRead && "border-primary/30 bg-muted/20"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                                                n.severity === "error" && "bg-destructive",
                                                n.severity === "warning" && "bg-yellow-500",
                                                n.severity === "success" && "bg-green-500",
                                                (!n.severity || n.severity === "info") && "bg-blue-500",
                                                !n.isRead && "animate-pulse bg-primary"
                                            )}
                                        />

                                        <div className="pl-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                                                        <h3 className="font-medium truncate">{n.title}</h3>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                                                    <div className="text-xs text-muted-foreground mt-2">
                                                        {new Date(n.createdAt).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                    {!n.isRead && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Marquer comme lu"
                                                            onClick={async () => {
                                                                // Optimiste
                                                                markLocalRead(n.id);
                                                                await markRead.mutateAsync({ id: n.id, read: true });
                                                            }}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        title="Supprimer"
                                                        onClick={async () => {
                                                            // Optimiste
                                                            softDeleteLocal(n.id);
                                                            await softDelete.mutateAsync({ id: n.id });
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="flex items-center justify-between pt-3">
                        <div className="text-sm text-muted-foreground">
                            Page {list.data?.page ?? page} / {list.data?.pages ?? 1} - {list.data?.total ?? 0} notifications
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Précédent
                            </Button>

                            <Button
                                variant="outline"
                                disabled={!list.data || page >= (list.data.pages ?? 1)}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Placeholder for additional content */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="h-[calc(100vh-260px)]">
                        <NotificationDetailsPanel
                            selected={selected as any}
                            onMarkRead={(id) => {
                                markLocalRead(id);
                                markRead.mutate({ id, read: true });
                            }}
                            onDelete={(id) => {
                                softDeleteLocal(id);
                                softDelete.mutate({ id });
                                // si on supprime l'item sélectionné, choisir le prochain
                                if (selectedId === id) setSelectedId(null);
                            }}
                        // onOpenResource={(resourceType, resourceId) => {
                        //   // mapping simple (à enrichir plus tard)
                        //   if (resourceType === "Asset") navigate(`/assets/${resourceId}`);
                        //   else navigate(`/`);
                        // }}
                        />
                    </div>
                </div>
            </div>

        </div>
    )

}
// <div className="space-y-4">
//     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//             <h1 className="text-2xl font-semibold">Centre de notifications</h1>
//             <p className="text-sm text-muted-foreground">
//                 Consulte et gère les alertes du système.
//             </p>
//         </div>

//         <div className="flex items-center gap-2">
//             <Button variant={"outline"} className="gap-2" onClick={() => {
//                 readAll.mutate({ scope: "user", includeGlobal: true })
//             }}>
//                 <CheckCheck className="size-4" />
//                 Tout marquer comme lu
//             </Button>

//             <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => {
//                     // si tu relies au server, tu peux refetch/invalidate ici
//                     qc.invalidateQueries({ queryKey: ["notifications"] })
//                 }}
//                 title="Rafraîchir"
//             >
//                 <RefreshCw className="size-4" />
//             </Button>
//         </div>
//     </div>

//     <div className="flex items-center gap-2">
//         <Search className="h-4 w-4 text-muted-foreground" />
//         <Input
//             placeholder="Rechercher une notification..."
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//         />
//     </div>

//     <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
//         <TabsList>
//             <TabsTrigger value="all">Toutes</TabsTrigger>
//             <TabsTrigger value="unread">Non lues</TabsTrigger>
//         </TabsList>

//         <TabsContent value="all" className="mt-4">
//             <BoardList items={filtered} />
//         </TabsContent>

//         <TabsContent value="unread" className="mt-4">
//             <BoardList items={filtered} />
//         </TabsContent>
//     </Tabs>
// </div>