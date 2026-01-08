import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/modules/auth/hooks/use-auth";
// import { SigemStatusBadge } from "@/modules/users/_components/user-directory.sidebar";
import { useEmployee, useSigemUser } from "@/modules/users/hooks/useDirectory";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  "GUEST",
  "MG_AGT",
  "MG_COB",
  "MG_COS",
  "ADMIN",
  //   "SUPER_ADMIN",
] as const;

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copié dans le presse-papiers");
}

export const UserWorkspacePage = () => {
  const { matricule } = useParams<{ matricule: string }>();

  const { activateUser, deactivateUser, updateUserRole } = useAuth();
  const employee = useEmployee(matricule);
  const sigemUser = useSigemUser(matricule);

  const raw = sigemUser.data as any;
  const u = raw?.data ?? null; // u = sigem user object or null
  const [roleDraft, setRoleDraft] = useState<string>(u?.role ?? "GUEST");

  if (employee.isLoading) {
    return <div className="p-4">Chargement employé…</div>;
  }

  //   console.log("Employee data:", employee.data);
  //   console.log("SigemUser data:", sigemUser.data);

  if (employee.isError || !employee.data) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Employé introuvable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Le matricule <b>{matricule}</b> n’existe pas dans l’annuaire.
          </CardContent>
        </Card>
      </div>
    );
  }

  const e = employee.data;
  const canActivate = !u || u?.status !== "ACTIVE";
  const isDisabled = u?.status === "DISABLED";
  const isPending = u?.status === "PENDING";

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Workspace utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <b>Nom :</b> {e.firstName} {e.lastName}
          </div>
          <div>
            <b>Direction :</b> {e.direction}
          </div>
          <div>
            <b>Fonction :</b> {e.fonction}
          </div>
        </CardContent>
      </Card>

      {/* Bloc SIGEM */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compte SIGEM</CardTitle>
          {/* <SigemStatusBadge sigem={u} /> */}
        </CardHeader>

        <CardContent className="text-sm space-y-2">
          {sigemUser.isLoading ? (
            <div>Chargement compte…</div>
          ) : !u ? (
            <div className="text-muted-foreground">
              Aucun compte SIGEM associé à ce matricule.
            </div>
          ) : (
            <>
              <div>
                <b>Rôle :</b> {u.role}
              </div>
              {/* <div>
                <b>Email :</b> {u.email ?? "—"}
              </div>
              <div>
                <b>Username :</b> {u.username ?? "—"}
              </div>
              <div>
                <b>2FA :</b> {u.is2FAEnabled ? "ON" : "OFF"} |{" "}
                {u.is2FAValidated ? "Validé" : "En attente"}
              </div> */}
              <div>
                <b>Dernière connexion :</b>{" "}
                {format(new Date(u.lastLogin), "PPpp", { locale: fr }) ?? "-"}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bloc Actions (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Actions MG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            {(canActivate || isPending || isDisabled) && (
              <Button
                onClick={async () => {
                  const resp = await activateUser.mutateAsync({
                    matriculation: e.matricule,
                  });
                  const code = resp?.code; // selon ta réponse backend

                  if (code) {
                    // On affiche le code via toast + copie
                    toast.message("Code d’activation", {
                      description: `OTP: ${code}`,
                    });
                    copy(code);
                  }
                }}
                disabled={activateUser.isPending}
              >
                {isPending
                  ? "Régénérer code"
                  : isDisabled
                    ? "Réactiver (code)"
                    : "Activer (code)"}
              </Button>
            )}

            {u?.status === "ACTIVE" && (
              <Button
                variant="destructive"
                onClick={async () => {
                  await deactivateUser.mutateAsync({
                    matriculation: e.matricule,
                  });
                }}
                disabled={deactivateUser.isPending}
              >
                Désactiver
              </Button>
            )}

            {u && (
              <div className="space-y-2">
                {/* <div className="text-xs text-muted-foreground">Rôle</div> */}

                <div className="flex gap-2">
                  <Select value={roleDraft} onValueChange={setRoleDraft}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() =>
                      updateUserRole.mutate({
                        matriculation: u.matriculation,
                        role: roleDraft,
                      })
                    }
                    disabled={updateUserRole.isPending || roleDraft === u.role}
                  >
                    Appliquer
                  </Button>
                </div>

                {roleDraft !== u.role && (
                  <div className="text-xs text-muted-foreground">
                    Rôle actuel : <b>{u.role}</b>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Le bouton génère un code OTP. Transmets-le à l’agent pour activer
            son compte sur la page /activate.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
