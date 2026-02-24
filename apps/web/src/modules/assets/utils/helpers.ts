import {
  AlertTriangle,
  Armchair,
  CheckCircle2,
  Laptop,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";

// Family config
export const familyConfig = {
  EQUIPEMENT: {
    icon: Wrench,
    label: "Équipement",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  INFORMATIQUE: {
    icon: Laptop,
    label: "Informatique",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  MOBILIER: {
    icon: Armchair,
    label: "Mobilier",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
};

export const situationConfig = {
  NEUF: {
    label: "Neuf",
    icon: Sparkles,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  EN_SERVICE: {
    label: "En Service",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  EN_PANNE: {
    label: "En Panne",
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  HORS_SERVICE: {
    label: "Hors Service",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  REFORME: {
    label: "Réformé",
    icon: XCircle,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
  },
};
