// src/features/vehicles/components/vehicle-document-modal.tsx
import { useMemo } from "react";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { GenericFormModal } from "@/components/shared/form/generic-form-modal";
import { ReusableForm } from "@/components/shared/form/form.component";
import { VehicleDocument } from "../../types/vehicle-document.types";
import { useVehicleDocuments } from "../../hooks/use-vehicle-documents";
import {
  vehicleDocumentFormSchema,
  VehicleDocumentFormValues,
} from "../../schema/vehicle-documents.schema";
import { VehicleDocumentForm } from "./vehicle-document-form";
import { isVehicle, isVehicleDocument } from "../../helpers";
import { Vehicle } from "../../types/vehicle.types";
import { useNavigate } from "react-router-dom";



export const VehicleDocumentModal = () => {
  const { name, data } = useModalStore();
  const raw = data as any;
  const navigate = useNavigate();

  const isEdit = isVehicleDocument(raw);
  const document = isEdit ? (raw as VehicleDocument) : undefined;
  const vehicle = !isEdit && isVehicle(raw) ? (raw as Vehicle) : undefined;

  // 🔑 vehicleId à utiliser pour la création
  const vehicleIdForCreate = vehicle?.id ?? document?.vehicleId.id;

  // Hook: on ne le scope pas forcément par vehicleId ici, ce n’est pas critique
  const { create, update } = useVehicleDocuments();
  const { mutateAsync: createDoc, isPending: createPending } = create;
  const { mutateAsync: updateDoc, isPending: updatePending } = update;

  const isPending = createPending || updatePending;

  const defaultValues = useMemo<VehicleDocumentFormValues>(() => {
    if (!isEdit || !document) {
      return {
        type: undefined as any, // Select géré par défaut front
        reference: "",
        issuedAt: "",
        expiresAt: "",
        reminderDaysBefore: "30,15,7" as any,
      } as any;
    }

    // on transforme les dates ISO en "yyyy-MM-dd"
    const toInputDate = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

    return {
      type: document.type,
      reference: document.reference ?? "",
      issuedAt: toInputDate(document.issuedAt ?? undefined),
      expiresAt: toInputDate(document.expiresAt),
      reminderDaysBefore: document.reminderDaysBefore.join(","),
    } as any;
  }, [isEdit, document]);

  if (name !== ModalTypes.VEHICLE_DOCUMENT_FORM) return null;

  const title = isEdit
    ? "Modifier le document"
    : "Ajouter un document au véhicule";
  const description = isEdit
    ? "Mettez à jour les informations de ce document."
    : "Enregistrez un nouveau document (assurance, visite technique, carte...) pour ce véhicule.";

  const handleSubmit = async (values: VehicleDocumentFormValues) => {
    // ⛔ sécurité : on doit avoir un vehicleId dans tous les cas
    if (!vehicleIdForCreate) return;

    if (isEdit && document) {
      await updateDoc({
        id: data.id,
        payload: {
          reference: values.reference || undefined,
          issuedAt: values.issuedAt,
          expiresAt: values.expiresAt,
          reminderDaysBefore: values.reminderDaysBefore,
        },
      });
    } else {
      // console.log("REGISTER NEW DOC", values);
      await createDoc({
        vehicleId: vehicleIdForCreate,
        type: values.type,
        reference: values.reference || undefined,
        issuedAt: values.issuedAt,
        expiresAt: values.expiresAt,
        reminderDaysBefore: values.reminderDaysBefore,
      });

      navigate("/vehicle-documents");
    }
  };

  return (
    <GenericFormModal className="min-w-[600px] md:min-w-[800px]" title={title} description={description}>
      <ReusableForm
        id={isEdit}
        disabled={isPending}
        schema={vehicleDocumentFormSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        renderFields={(form) => (
          <VehicleDocumentForm form={form} isEdit={isEdit} />
        )}
      />
    </GenericFormModal>
  );
};
