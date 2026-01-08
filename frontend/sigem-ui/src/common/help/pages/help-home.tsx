import { HelpBreadcrumb } from "../_components/help-breadcrumb";

export function HelpHomePage() {
  return (
    <div className="space-y-2">
      <HelpBreadcrumb />
      <h1 className="text-2xl font-bold">Centre d’aide</h1>
      <p className="text-muted-foreground">
        Retrouvez ici les guides d’utilisation de l’application.
      </p>
    </div>
  );
}
