export type HelpTopic = {
  slug: string;
  title: string;
  summary?: string;
};

export type HelpSection = {
  slug: string;
  title: string;
  description?: string;
  topics: HelpTopic[];
};

export const HELP_SECTIONS: HelpSection[] = [
  {
    slug: "getting-started",
    title: "Démarrage",
    description:
      "Comprendre l’application, la navigation et les règles générales (rôles, sécurité).",
    topics: [
      { slug: "overview", title: "Vue d’ensemble" },
      { slug: "navigation", title: "Navigation & raccourcis" },
      { slug: "roles", title: "Rôles & permissions (RBAC)" },
      { slug: "security-2fa", title: "Sécurité & 2FA" },
    ],
  },
  {
    slug: "patrimoine",
    title: "Patrimoine",
    description: "Gestion des biens, catégories, statuts et bonnes pratiques.",
    topics: [
      { slug: "assets", title: "Gérer les biens" },
      { slug: "categories-codes", title: "Catégories & codes automatiques" },
      { slug: "statuses", title: "Statuts des biens" },
    ],
  },
  {
    slug: "vehicules",
    title: "Parc automobile",
    description: "Gestion des véhicules, affectation, kilométrage et actions.",
    topics: [
      { slug: "manage", title: "Gérer les véhicules" },
      { slug: "assignment", title: "Affectation" },
      { slug: "mileage", title: "Kilométrage" },
      { slug: "actions", title: "Actions rapides (docs / tâches)" },
    ],
  },
  {
    slug: "documents",
    title: "Documents véhicules",
    description: "Validité, statuts, rappels et conformité du parc.",
    topics: [
      { slug: "validity-status", title: "Validité & statuts" },
      { slug: "reminders", title: "Rappels & alertes" },
      {
        slug: "from-doc-to-task",
        title: "Planifier une tâche depuis un document",
      },
    ],
  },
  {
    slug: "maintenance",
    title: "Tâches & maintenance",
    description: "Modèles de tâche, déclencheurs, récurrence et clôture.",
    topics: [
      { slug: "models", title: "Modèles de tâche" },
      { slug: "triggers", title: "Déclencheurs (date / km)" },
      { slug: "complete-task", title: "Terminer une tâche" },
    ],
  },
  {
    slug: "emplacements",
    title: "Emplacements",
    description: "Hiérarchie de localisation et impacts sur les modules.",
    topics: [
      { slug: "hierarchy", title: "Hiérarchie & codes" },
      { slug: "best-practices", title: "Bonnes pratiques" },
    ],
  },
  {
    slug: "users",
    title: "Utilisateurs & sécurité",
    description: "Comptes, RBAC, statut, 2FA et sécurité.",
    topics: [
      { slug: "manage-users", title: "Gérer les utilisateurs" },
      { slug: "2fa", title: "2FA : validation & réinitialisation" },
    ],
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Questions fréquentes et solutions rapides.",
    topics: [{ slug: "common", title: "Problèmes fréquents" }],
  },
];
