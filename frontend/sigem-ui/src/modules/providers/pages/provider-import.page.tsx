import { ProviderImportWizard } from "../_components/provider-import.wizard";

export const ProviderImportPage = () => {
  return (
    <div className="p-6 space-y-4 mx-auto">
      <div>
        <div className="text-2xl font-semibold">Import fournisseurs</div>
        <div className="text-sm text-muted-foreground">
          Importer un fichier (Excel/CSV), vérifier l’aperçu, choisir les
          actions, puis valider.
        </div>
      </div>

      <ProviderImportWizard />
    </div>
  );
};
