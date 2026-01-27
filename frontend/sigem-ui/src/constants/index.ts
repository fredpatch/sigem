import {
  // Archive,
  ClipboardList,
  Files,
  KeySquare,
  LayoutDashboard,
} from "lucide-react";

export const SOCKET_EVENTS = {
  NEW_NOTIFICATION: "newNotification",
  NOTIFICATION_USER: "notification:user",
  NOTIFICATION_GLOBAL: "notification:global",

  PONG: "pong",
  PING: "ping",

  DIAG_PING: "sigem.diag.ping",
  DIAG_PONG: "sigem.diag.pong",

  LOG_ACTION: "log.action",
  NOTIFY_EVENT: "notify.event",

  ASSET_CREATED: "asset.created",
  ASSET_UPDATED: "asset.updated",
  ASSET_TRANSFER: "asset.transfer",
  ASSET_DELETED: "asset.deleted",
  ASSET_RESTORED: "asset.restored",
  ASSET_LOCATION_CHANGED: "asset.location.changed",
  ASSET_STATUS_CHANGED: "asset.status.changed",
  ASSET_QUANTITY_CHANGED: "asset.quantity.changed",

  STOCK_LOW: "stock.low",
  STOCK_CRITICAL: "stock.critical",
  STOCK_REPLENISHED: "stock.replenished",
};

export const NOTIFICATIONS = "notifications";
export const SOCKET_IO =
  import.meta.env.VITE_SOCKET_CONNECTION ?? "http://localhost:4001";

export const accountMenuLinks = [
  {
    to: "/home",
    icon: LayoutDashboard,
    title: "Tableau de bord",
  },
];
export const ICON_SIZE = "h-4 w-4";

export const navLinks = [
  // {
  //   to: "/home",
  //   icon: LayoutDashboard,
  //   title: "Tableau de bord",
  //   pathName: "home",
  // },
  // {
  //   id: 2,
  //   to: "/assets",
  //   icon: Archive,
  //   title: "Gestion du patrimoine",
  //   pathName: "assets",
  // },
  // {
  //   id: 3,
  //   to: "/users",
  //   icon: Users,
  //   title: "Gestion des utilisateurs",
  //   pathName: "users",
  // },
  // {
  //   id: 3,
  //   to: "/vehicle-management",
  //   icon: KeySquare,
  //   title: "Parc automobile",
  //   pathName: "vehicle-management",
  // },
  // {
  //   id: 5,
  //   to: "/vehicle-documents",
  //   icon: Files,
  //   title: "Documents des véhicules",
  //   pathName: "vehicle-documents",
  // },
  // {
  //   id: 4,
  //   to: "/vehicle-tasks",
  //   icon: ClipboardList,
  //   title: "Suivi des véhicules",
  //   pathName: "vehicle-tasks",
  // },
  // {
  //   id: 5,
  //   to: "/clients",
  //   icon: Users2,
  //   title: "Clients",
  //   pathName: "clients",
  // },
  // {
  //   id: 6,
  //   to: "/invoices",
  //   icon: NotebookPen,
  //   title: "Invoices",
  //   pathName: "invoices",
  // },
];

export const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

export const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

export const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

export const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
} as const;

export const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export const REGION_COLORS: Record<string, string> = {
  ESTUAIRE: "#0f766e", // teal-700
  "HAUT-OGOOUE": "#047857", // emerald-700
  "MOYEN-OGOOUE": "#1d4ed8", // blue-700
  POG: "#1d4ed8", // blue-700
  NGOUNIÉ: "#b45309", // amber-700
  NYANGA: "#be123c", // rose-700
  "OGOOUE-LOLO": "#7c2d12", // orange-900
  "OGOOUE-MARITIME": "#0369a1", // sky-700
  "OGOOUE-IVINDO": "#4d7c0f", // lime-700
  "WOLEU-NTEM": "#6d28d9", // violet-700
  MAKOKOU: "#6d28d9", // violet-700
  MOUILA: "#4d7c0f", // violet-700
  LIBREVILLE: "#0369a1", // sky-700
  UNKNOWN: "#6b7280", // gray-500
};

export const USAGE_COLORS: Record<string, string> = {
  SERVICE: "#0f766e",
  FONCTION: "#1d4ed8",
  POOL: "#b45309",
  LOCATION: "#be123c",
  UNKNOWN: "#6b7280",
};

export const ENERGY_COLORS: Record<string, string> = {
  DIESEL: "#047857",
  ESSENCE: "#b91c1c",
  HYBRIDE: "#7c3aed",
  ELECTRIQUE: "#0ea5e9",
  UNKNOWN: "#6b7280",
};
