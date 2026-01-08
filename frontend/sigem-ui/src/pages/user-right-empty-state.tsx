import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const UserRightEmptyState = () => {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Sélectionnez un employé</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Recherchez un matricule dans l’annuaire à gauche pour afficher le
          profil et gérer l’accès SIGEM.
        </CardContent>
      </Card>
    </div>
  );
};
