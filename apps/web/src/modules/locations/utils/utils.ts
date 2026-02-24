import { Briefcase, Building2, DoorClosed, Map } from "lucide-react";

export const levelConfig = {
  LOCALISATION: {
    label: "Localisation",
    icon: Map,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Top-level geographic location",
  },
  BATIMENT: {
    label: "Bâtiment",
    icon: Building2,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Building level",
  },
  DIRECTION: {
    label: "Direction",
    icon: Briefcase,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Department/Direction level",
  },
  BUREAU: {
    label: "Bureau",
    icon: DoorClosed,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Office/Room level",
  },
};
