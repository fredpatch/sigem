import { Guidelines } from "@/common/guidelines";
import { TableComponent } from "@/components/shared/table/table";
import { columns } from "@/modules/users/_components/table/columns";
import { useUser } from "@/modules/users/hooks/useUser";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Loader2, Plus } from "lucide-react";

const UserManagementPage = () => {
  const { list } = useUser();
  const { openModal } = useModalStore();
  const { data: users, error, isLoading } = list;

  const loading = isLoading;
  const err = error;

  return (
    <div>
      <div className="space-y-2 mt-2">
        <Guidelines
          variant="warning"
          className=""
          compact
          title="Sécurité & authentification"
          items={[
            "Un utilisateur sans 2FA validé ne peut pas accéder à l’application.",
            "Réinitialiser le 2FA oblige l’utilisateur à revalider son accès.",
            "Les rôles élevés (Admin, Super Admin) doivent être attribués avec prudence.",
          ]}
        />
      </div>

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : err ? (
        <p className="text-sm text-red-500">
          Une erreur est survenue lors du chargement des utilisateurs.
        </p>
      ) : (
        <>
          <TableComponent
            emptyState="Aucun utilisateur trouvé"
            btnActionIcon={<Plus className="w-4 h-4" />}
            onSubmit={() => openModal(ModalTypes.USER_FORM)}
            filterKeys={["firstname", "matriculation"]}
            columns={columns}
            items={users || []}
            onBulkAction={(selectedUsers: any) => {
              console.log("Bulk deactivate", selectedUsers);
            }}
          />
        </>
      )}

      <div className="pb-4 space-y-2 mt-4">
        <Guidelines
          variant="info"
          title="Comment gérer les utilisateurs de l’application ?"
          description="Administrez les accès, rôles et statuts des utilisateurs."
          items={[
            "Cette page permet de gérer les comptes utilisateurs ayant accès à l’application.",
            "Chaque utilisateur dispose : d’un rôle (RBAC) définissant ses permissions, d’un statut (Actif / Inactif), d’un état de sécurité 2FA (actif par défaut).",
            "Le dernier login permet d’identifier les comptes réellement utilisés.",
            "Les comptes inactifs ou en attente de validation 2FA ne peuvent pas se connecter.",
            "Utilisez les filtres pour rechercher un utilisateur par email.",
          ]}
        />
      </div>
    </div>
  );
};

export default UserManagementPage;
