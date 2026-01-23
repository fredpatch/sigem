/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Row } from "@tanstack/react-table";
import {
  Check,
  ClipboardList,
  Droplets,
  Files,
  FireExtinguisher,
  Gauge,
  MoreHorizontal,
  ParkingCircle,
  Pencil,
  RefreshCcwDot,
  ShieldCheck,
  Trash,
  Wrench,
} from "lucide-react";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { User } from "@/modules/auth/types/auth-type";
import { useUser } from "@/modules/users/hooks/useUser";
import { useConfirm } from "@/hooks/use-confirm";
import {
  AssetDTO,
  CategoryDTO,
  LocationDTO,
} from "@/modules/assets/types/asset-type";
import { useAsset } from "@/modules/assets/hooks/useAsset";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { useLocation } from "@/modules/locations/hooks/useLocation";
import {
  // VehicleDocumentType,
  VehicleTask,
} from "@/modules/vehicules/types/types";
import { Vehicle } from "@/modules/vehicules/types/vehicle.types";
import { useVehicles } from "@/modules/vehicules/hooks/use-vehicle";
import {
  VehicleDocument,
  VehicleDocumentType,
} from "@/modules/vehicules/types/vehicle-document.types";
import { useVehicleDocuments } from "@/modules/vehicules/hooks/use-vehicle-documents";
import { MGMaintenanceRow } from "@/modules/vehicules/types/mg.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Action<T> = {
  label: string;
  className?: string;
  variant:
    | "outline"
    | "destructive"
    | "default"
    | "secondary"
    | "ghost"
    | "tertiary";
  icon?: React.ReactNode;
  onClick: (data: T) => void;
  disabled?: boolean;
};

interface ActionTableProps<T> {
  row: Row<T>;
  actions: Action<T>[];
}

export const ActionTable = <T, _>({ row, actions }: ActionTableProps<T>) => {
  return (
    <div className="space-x-2 flex justify-end">
      {actions.map((action) => (
        <Tooltip>
          <TooltipTrigger>
            <Button
              key={action.label}
              variant={action.variant}
              className={action.className}
              disabled={action.disabled}
              size="sm"
              onClick={() => action.onClick(row.original)}
            >
              {action.icon}
              <TooltipContent>{action.label}</TooltipContent>
            </Button>
          </TooltipTrigger>
        </Tooltip>
      ))}
    </div>
  );
};

interface Props {
  row: Row<User>;
}

export const UserActionCell = ({ row }: Props) => {
  const { openModal, setSelectedItem } = useModalStore();
  const { softDelete } = useUser(row.original._id);
  const { mutateAsync: remove, isPending } = softDelete;
  const [ConfirmDialog, confirm] = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <ActionTable
        row={row}
        actions={[
          {
            label: "Modifier l'utilisateur",
            variant: "outline",
            onClick: () => {
              setSelectedItem(row.original);
              openModal(ModalTypes.USER_FORM, row.original);
            },
            icon: <Pencil className="h-4 w-4" />,
          },
          {
            label: "Reinitialiser le mot de passe",
            variant: "tertiary",
            onClick: () => {
              setSelectedItem(row.original);
              openModal(ModalTypes.RESET_FORM, row.original);
            },
            icon: <RefreshCcwDot className="h-4 w-4" />,
          },
          {
            label: "Desactiver l'utilisateur",
            variant: "destructive",
            disabled: isPending,
            onClick: async () => {
              setSelectedItem(row.original);

              const ok = await confirm({
                title: "Delete user?",
                description:
                  "Vous êtes sur le point de supprimer cet utilisateur, vous ne pourrez pas annuler cette opération ! Voulez-vous continuer ?",
                confirmText: "Oui",
                cancelText: "Annuler",
                confirmVariant: "destructive",
                dangerIcon: true,
                loading: isPending,
                autoCloseDelay: 5000, // 5s
              });

              if (ok) {
                await remove();
                // console.log("DELETED USER::", row.original._id);
              }
            },
            icon: <Trash className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

interface AssetProps {
  row: Row<AssetDTO>;
}
export const AssetActionCell = ({ row }: AssetProps) => {
  const { openModal, setSelectedItem } = useModalStore();
  const { softDelete } = useAsset(row.original._id);
  const { mutateAsync: remove, isPending } = softDelete;
  const [ConfirmDialog, confirm] = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <ActionTable
        row={row}
        actions={[
          {
            label: "Edit",
            variant: "outline",
            onClick: () => {
              setSelectedItem(row.original);
              openModal(ModalTypes.ASSETS_FORM, row.original);
            },
            icon: <Pencil className="h-4 w-4" />,
          },
          {
            label: "Delete",
            variant: "destructive",
            disabled: isPending,
            onClick: async () => {
              setSelectedItem(row.original);

              const ok = await confirm({
                title: "Delete asset?",
                description:
                  "You are about to delete that asset, you cannot undo that operation! Do you want to continue?",
                confirmText: "Yes",
                cancelText: "Abort",
                confirmVariant: "destructive",
                dangerIcon: true,
                loading: isPending,
                autoCloseDelay: 5000, // 5s
              });

              if (ok) {
                await remove();
                // console.log("DELETED Asset::", row.original._id);
              }
            },
            icon: <Trash className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

interface CategoryProps {
  row: Row<CategoryDTO>;
}
export const CategoryActionCell = ({ row }: CategoryProps) => {
  const { openModal, setSelectedItem } = useModalStore();
  const { softDelete } = useCategory(row.original._id);
  const { mutateAsync: remove, isPending } = softDelete;
  const [ConfirmDialog, confirm] = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <ActionTable
        row={row}
        actions={[
          {
            label: "Edit",
            variant: "outline",
            onClick: () => {
              setSelectedItem(row.original);
              openModal(ModalTypes.CATEGORY_FORM, row.original);
            },
            icon: <Pencil className="h-4 w-4" />,
          },
          {
            label: "Delete",
            variant: "destructive",
            disabled: isPending,
            onClick: async () => {
              setSelectedItem(row.original);

              const ok = await confirm({
                title: "Delete category?",
                description:
                  "You are about to delete that category, you cannot undo that operation! Do you want to continue?",
                confirmText: "Yes",
                cancelText: "Abort",
                confirmVariant: "destructive",
                dangerIcon: true,
                loading: isPending,
                autoCloseDelay: 5000, // 5s
              });

              if (ok) {
                await remove();
                // console.log("DELETED Asset::", row.original._id);
              }
            },
            icon: <Trash className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

interface LocationProps {
  row: Row<LocationDTO>;
}
export const LocationActionCell = ({ row }: LocationProps) => {
  const { openModal, setSelectedItem } = useModalStore();
  const { softDelete } = useLocation(row.original._id);
  const { mutateAsync: remove, isPending } = softDelete;
  const [ConfirmDialog, confirm] = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <ActionTable
        row={row}
        actions={[
          {
            label: "Edit",
            variant: "outline",
            onClick: () => {
              setSelectedItem(row.original);
              openModal(ModalTypes.LOCATION_FORM, row.original);
            },
            icon: <Pencil className="h-4 w-4" />,
          },
          {
            label: "Delete",
            variant: "destructive",
            disabled: isPending,
            onClick: async () => {
              setSelectedItem(row.original);

              const ok = await confirm({
                title: "Delete location?",
                description:
                  "You are about to delete that location, you cannot undo that operation! Do you want to continue?",
                confirmText: "Yes",
                cancelText: "Abort",
                confirmVariant: "destructive",
                dangerIcon: true,
                loading: isPending,
                autoCloseDelay: 5000, // 5s
              });

              if (ok) {
                await remove();
                // console.log("DELETED Asset::", row.original._id);
              }
            },
            icon: <Trash className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

interface VehicleTaskProps {
  row: Row<VehicleTask>;
}

export const VehicleTaskActionCell = ({ row }: VehicleTaskProps) => {
  const { openModal, setSelectedItem } = useModalStore();
  const [ConfirmDialog, confirm] = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <ActionTable
        row={row}
        actions={[
          {
            label: "Modifier le suivi",
            variant: "outline",
            onClick: () => {
              setSelectedItem(row.original);
              openModal(ModalTypes.VEHICLE_TASKS_FORM, row.original);
            },
            icon: <Pencil className="h-4 w-4" />,
          },
          {
            label: "Terminées la tache",
            variant: "default",
            onClick: () => {
              setSelectedItem(row.original._id);
              openModal(ModalTypes.VEHICLE_COMPLETE_TASKS_FORM, row.original);
            },
            icon: <Check className="h-4 w-4" />,
          },
          {
            label: "Delete",
            variant: "destructive",
            // disabled: isPending,
            onClick: async () => {
              setSelectedItem(row.original);

              const ok = await confirm({
                title: "Delete task?",
                description:
                  "You are about to delete that task, you cannot undo that operation! Do you want to continue?",
                confirmText: "Yes",
                cancelText: "Abort",
                confirmVariant: "destructive",
                dangerIcon: true,
                // loading: isPending,
                autoCloseDelay: 5000, // 5s
              });

              if (ok) {
                // await remove();
                console.log("DELETED Task::", row.original._id);
              }
            },
            icon: <Trash className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

interface VehicleProps {
  row: Row<Vehicle>;
}

export const VehicleActionCell = ({ row }: VehicleProps) => {
  const { openModal, setSelectedItem } = useModalStore();
  const { softDelete } = useVehicles();
  const { mutateAsync: remove, isPending } = softDelete;
  const [ConfirmDialog, confirm] = useConfirm();

  const handleEdit = () => {
    const doc = row.original;
    setSelectedItem(doc);
    openModal(ModalTypes.VEHICLE_MANAGEMENT_FORM, doc);
  };

  const handleDelete = async () => {
    const vehicle = row.original;
    setSelectedItem(vehicle);

    const ok = await confirm({
      title: "Delete vehicle?",
      description:
        "You are about to remove that vehicle from the park, you cannot undo that operation! Do you want to continue?",
      confirmText: "Yes",
      cancelText: "Abort",
      confirmVariant: "destructive",
      dangerIcon: true,
      loading: isPending,
      autoCloseDelay: 5000, // 5s
    });

    if (ok) {
      await remove(row.original.id);
      // console.log("DELETED Task::", row.original.id);
    }
  };

  const handleAddDocument = () => {
    const doc = row.original;
    setSelectedItem(doc);
    openModal(ModalTypes.VEHICLE_DOCUMENT_FORM, doc);
  };

  const handlePlanMaintenance = () => {
    const vehicle = row.original;
    setSelectedItem(vehicle);
    openModal(ModalTypes.VEHICLE_TASK_PLAN_FROM_VEHICLE, {
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plateNumber,
      vehicleLabel: `${vehicle.brand} ${vehicle.model}`,
    });
  };

  return (
    <>
      <ConfirmDialog />
      <ActionTable
        row={row}
        actions={[
          {
            label: "Ajouter un document",
            variant: "secondary",
            onClick: handleAddDocument,
            icon: <Files className="h-4 w-4" />,
          },
          {
            label: "Planifier un entretien",
            variant: "default",
            onClick: handlePlanMaintenance,
            icon: <ClipboardList className="h-4 w-4" />,
          },
          {
            label: "Modifier",
            variant: "outline",
            onClick: handleEdit,
            icon: <Pencil className="h-4 w-4" />,
          },
          {
            label: "Supprimer",
            variant: "destructive",
            disabled: isPending,
            onClick: handleDelete,
            icon: <Trash className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

// interface VehicleDocumentsProps {
//   row: Row<VehicleDocument>;
// }

// export const VehicleDocumentActionCell = ({ row }: VehicleDocumentsProps) => {
//   const { openModal, setSelectedItem } = useModalStore();
//   const { remove } = useVehicleDocuments();
//   const { mutateAsync: deleteDocument, isPending } = remove;
//   const [ConfirmDialog, confirm] = useConfirm();

//   const handleEdit = () => {
//     const doc = row.original;
//     setSelectedItem(doc);
//     openModal(ModalTypes.VEHICLE_DOCUMENT_FORM, doc);
//   };

//   const handleTask = () => {
//     const doc = row.original;
//     setSelectedItem(doc);
//     const label = `${doc.vehicleId.brand} ${doc.vehicleId.model}`;
//     openModal(ModalTypes.VEHICLE_TASK_PLAN_FROM_DOCUMENT, {
//       vehicleId: doc.vehicleId,
//       vehicleDocumentId: doc.id,
//       documentType: doc.type,
//       vehiclePlate: doc.vehicleId.plateNumber,
//       vehicleLabel: label,
//     });
//   };

//   const handleDelete = async () => {
//     const doc = row.original;

//     setSelectedItem(doc);

//     const ok = await confirm({
//       title: "Supprimer ce document ?",
//       description:
//         "Vous êtes sur le point de supprimer définitivement ce document véhicule. Cette opération est irréversible. Voulez-vous continuer ?",
//       confirmText: "Oui, supprimer",
//       cancelText: "Annuler",
//       confirmVariant: "destructive",
//       dangerIcon: true,
//       loading: isPending,
//       autoCloseDelay: 5000,
//     });

//     if (!ok) return;

//     await deleteDocument(doc.id);
//     // Optionnel: toast de succès ici
//     // toast.success("Document véhicule supprimé");
//   };

//   return (
//     <>
//       <ConfirmDialog />
//       <ActionTable
//         row={row}
//         actions={[
//           {
//             label: "Planifier un suivi",
//             variant: "default",
//             onClick: handleTask,
//             icon: <ClipboardList className="h-4 w-4" />,
//           },
//           {
//             label: "Modifier le document",
//             variant: "outline",
//             onClick: handleEdit,
//             icon: <Pencil className="h-4 w-4" />,
//           },
//           {
//             label: "Supprimer le document",
//             variant: "destructive",
//             disabled: isPending,
//             onClick: handleDelete,
//             icon: <Trash className="h-4 w-4" />,
//           },
//         ]}
//       />
//     </>
//   );
// };

interface MgVehicleProps {
  row: Row<MGMaintenanceRow>;
}

export const MGVehicleActionCell = ({ row }: MgVehicleProps) => {
  const { openModal, setSelectedItem } = useModalStore();
  const v = row.original;

  const openDocModal = (documentType: VehicleDocumentType) => {
    openModal(ModalTypes.VEHICLE_DOCUMENT_MODAL, {
      vehicle: v,
      documentType,
    });
  };

  const openUpdateMileage = () => {
    setSelectedItem(v);
    openModal(ModalTypes.VEHICLE_UPDATE_MILEAGE, v);
  };

  const openCompleteOilChange = () => {
    setSelectedItem(v);
    openModal(ModalTypes.VEHICLE_COMPLETE_OIL_CHANGE, v);
  };

  const openCompleteTech = () => {
    openDocModal("TECH_INSPECTION");
  };

  const openUpdateParkingCard = () => {
    openDocModal("PARKING_CARD");
  };

  const openUpdateInsurance = () => {
    openDocModal("INSURANCE");
  };

  const openUpdateExtinguisherCard = () => {
    openDocModal("EXTINGUISHER_CARD");
  };

  const openEdit = () => {
    setSelectedItem(v);
    openModal(ModalTypes.VEHICLE_MANAGEMENT_FORM, v);
  };
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={openEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier les informations du véhicule
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openUpdateMileage}>
            <Gauge className="mr-2 h-4 w-4" />
            Mettre à jour le kilométrage
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openCompleteOilChange}>
            <Droplets className="mr-2 h-4 w-4" />
            Valider une vidange
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openCompleteTech}>
            <Wrench className="mr-2 h-4 w-4" />
            Valider visite technique
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openUpdateParkingCard}>
            <ParkingCircle className="mr-2 h-4 w-4" />
            Mettre à jour la carte parking
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openUpdateInsurance}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Mettre à jour l'assurance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openUpdateExtinguisherCard}>
            <FireExtinguisher className="mr-2 h-4 w-4" />
            Mettre à jour la carte extincteur
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// <>
//   <ActionTable
//     row={row}
//     actions={[
//
//

//       {
//         label: "Mettre à jour la carte extincteur",
//         variant: "outline",
//         onClick: () => openDocModal("EXTINGUISHER_CARD"),
//         icon: <Files className="h-4 w-4" />,
//       },
//     ]}
//   />
// </>
