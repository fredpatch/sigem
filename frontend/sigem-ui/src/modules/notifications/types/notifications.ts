export type NotificationScope = "user" | "role" | "all";

export type NotificationDTO = {
    id: string;
    title: string;
    message: string;
    type: string; // ex: "asset.created"
    createdAt: string | Date;
    isRead: boolean;
    isDeleted: boolean;
    relatedResource?: { resourceType: string; resourceId: string };
    payload?: unknown;
};

export type Paginated<T> = {
    page: number;
    limit: number;
    total: number;
    pages: number;
    items: T[];
};

export type ListNotificationsParams = {
    page?: number;
    limit?: number;
    scope?: NotificationScope;
    unreadOnly?: boolean;
    type?: string;
    severity?: string;
    search?: string;
    includeGlobal?: boolean;
};

export type ApiClient = {
    get<T>(url: string): Promise<T>;
    patch<T>(url: string, body?: any): Promise<T>;
    delete<T>(url: string): Promise<T>;
};

export const SEVERITY_LABELS: Record<
    "info" | "warning" | "error" | "success",
    string
> = {
    info: "Information",
    warning: "Avertissement",
    error: "Critique",
    success: "Succès",
};

export const SEVERITY_CONFIG = {
    info: {
        label: "Information",
        className:
            "border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-primary data-[active=true]:bg-blue-600 data-[active=true]:text-white",
    },
    warning: {
        label: "Avertissement",
        className:
            "border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-primary data-[active=true]:bg-amber-500 data-[active=true]:text-white",
    },
    error: {
        label: "Critique",
        className:
            "border-red-300 text-red-700 hover:bg-red-50 hover:text-primary data-[active=true]:bg-red-600 data-[active=true]:text-white",
    },
    success: {
        label: "Succès",
        className:
            "border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-primary data-[active=true]:bg-emerald-600 data-[active=true]:text-white",
    },
} as const;

export type SeverityLevel = keyof typeof SEVERITY_CONFIG;
