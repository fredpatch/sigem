import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleTaskTemplateAPI } from "../api/vehicle-task-templates.api";
import {
  VehicleTaskTemplate,
  CreateVehicleTaskTemplateDTO,
  UpdateVehicleTaskTemplateDTO,
} from "../types/types";
import { useModalStore } from "@/stores/modal-store";

const VEHICLE_TASK_TEMPLATES_KEY = ["vehicle-task-templates"];

export function useVehicleTaskTemplates() {
  const query = useQuery<VehicleTaskTemplate[], Error>({
    queryKey: [VEHICLE_TASK_TEMPLATES_KEY],
    queryFn: () => VehicleTaskTemplateAPI.list(),
  });

  return query;
}

export function useCreateVehicleTaskTemplate() {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation<VehicleTaskTemplate, Error, CreateVehicleTaskTemplateDTO>({
    mutationFn: (payload) => VehicleTaskTemplateAPI.create(payload),
    onSuccess: (template) => {
      queryClient.invalidateQueries({
        queryKey: [VEHICLE_TASK_TEMPLATES_KEY, template.dept],
      });

      closeModal();
    },
  });
}

export function useUpdateVehicleTaskTemplate(id: string) {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation<VehicleTaskTemplate, Error, UpdateVehicleTaskTemplateDTO>({
    mutationFn: (payload) => VehicleTaskTemplateAPI.update(id, payload),
    onSuccess: (template) => {
      queryClient.invalidateQueries({
        queryKey: [VEHICLE_TASK_TEMPLATES_KEY, template.dept],
      });

      closeModal();
    },
  });
}
