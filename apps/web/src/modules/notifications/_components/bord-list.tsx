import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function BoardList({ items }: { items: any[] }) {
    return (
        <ScrollArea className="h-[calc(100vh-260px)] rounded-md border">
            <div className="p-2">
                {items.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">
                        Rien à afficher ici.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "rounded-md border p-4 hover:bg-muted/30 transition cursor-pointer",
                                    !n.isRead && "border-primary/30 bg-muted/20"
                                )}
                                onClick={() => {
                                    // TODO: mark read + navigate if relatedResource exists
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {!n.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-primary" />
                                            )}
                                            <h3 className="font-medium leading-tight">{n.title}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{n.message}</p>
                                    </div>

                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}