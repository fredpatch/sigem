"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom"; // adapte si Next: useRouter
import { useNotificationStore } from "@/modules/notifications/store/notification-store";
import { useNotification } from "@/modules/notifications/hooks/use-notification";
// import { useReadAllNotifications } from "../hooks/use-notifications"; // si tu l’as

export function NotificationBell() {
    const navigate = useNavigate(); // Next: const router = useRouter();
    const { readAll } = useNotification()
    const notifications = useNotificationStore((s) => s.items); // adapte au shape
    // const readAll = useReadAllNotifications();

    const { unreadCount, last } = useMemo(() => {
        const last = notifications?.slice?.(0, 5) ?? [];
        const unreadCount = (notifications ?? []).filter((n: any) => !n.isRead && !n.isDeleted).length;
        return { unreadCount, last };
    }, [notifications]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted hover:scale-105 transition-all rounded-full">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1">
                            <Badge className={cn("h-5 min-w-5 px-1.5 rounded-full")}>
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 bg-muted/20 hover:bg-secondary/20"
                        onClick={() => {
                            readAll.mutate({ scope: "user", includeGlobal: true });
                            // en attendant API: tu peux aussi marquer local store si tu as une action
                            navigate("/notifications"); // Next: router.push("/notifications")
                        }}
                    >
                        <CheckCheck className="h-4 w-4" />
                        Tout voir
                    </Button>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {last.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                        Aucune notification pour le moment.
                    </div>
                ) : (
                    <div className="max-h-[420px] overflow-auto">
                        {last.map((n: any) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={cn("flex flex-col items-start gap-1 py-3 cursor-pointer", !n.isRead && "bg-muted/40")}
                                onClick={() => {
                                    // Option: ouvrir la ressource liée
                                    if (n.relatedResource?.resourceType === "Asset") {
                                        navigate(`/assets/${n.relatedResource.resourceId}`);
                                    } else {
                                        navigate("/notifications");
                                    }
                                }}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span className="font-medium line-clamp-1">{n.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground line-clamp-2">{n.message}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-muted/40 cursor-pointer" onClick={() => navigate("/notifications")}>
                    Ouvrir le centre de notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
