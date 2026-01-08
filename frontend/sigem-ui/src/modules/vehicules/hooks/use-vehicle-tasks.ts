import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CompleteVehicleTaskDTO,
  CreateVehicleTaskDTO,
  UpdateVehicleTaskDTO,
  VehicleTask,
  VehicleTaskFilterQuery,
  VehicleTaskListResponse,
} from "../types/types";
import { VehicleTaskAPI } from "../api/vehicle-tasks.api";
import { useModalStore } from "@/stores/modal-store";

const VEHICLE_TASKS_KEY = ["vehicle-tasks"];

export function useVehicleTasks(filters?: VehicleTaskFilterQuery) {
  const query = useQuery<any, Error>({
    queryKey: [VEHICLE_TASKS_KEY, filters],
    queryFn: () => VehicleTaskAPI.list(filters),
  });

  return {
    ...query,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
  };
}

export function useVehicleTasksByVehicle(
  vehicleId?: string,
  filters?: VehicleTaskFilterQuery
) {
  const enabled = !!vehicleId;

  const query = useQuery<VehicleTaskListResponse, Error>({
    queryKey: [VEHICLE_TASKS_KEY, "vehicle", vehicleId, filters],
    queryFn: () => VehicleTaskAPI.listByVehicle(vehicleId!, filters),
    enabled,
  });

  return {
    ...query,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
  };
}

export function useVehicleTask(id?: string) {
  const enabled = !!id;

  return useQuery<VehicleTask, Error>({
    queryKey: [VEHICLE_TASKS_KEY, id],
    queryFn: () => VehicleTaskAPI.getById(id!),
    enabled,
  });
}

export function useUpdateVehicleTask() {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation<
    VehicleTask,
    Error,
    { id: string; payload: UpdateVehicleTaskDTO }
  >({
    mutationFn: ({ id, payload }) => VehicleTaskAPI.update(id, payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_TASKS_KEY] });
      queryClient.setQueryData<VehicleTask>(
        [VEHICLE_TASKS_KEY, task._id],
        task
      );

      closeModal();
    },
  });
}

export function useCompleteVehicleTask() {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation<
    VehicleTask,
    Error,
    { id: string; payload: CompleteVehicleTaskDTO }
  >({
    mutationFn: ({ id, payload }) => VehicleTaskAPI.complete(id, payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_TASKS_KEY] });
      queryClient.setQueryData<VehicleTask>(
        [VEHICLE_TASKS_KEY, task._id],
        task
      );

      closeModal();
    },
  });
}

export function useCreateVehicleTask() {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();

  return useMutation<VehicleTask, Error, CreateVehicleTaskDTO>({
    mutationFn: (payload) => VehicleTaskAPI.create(payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-tasks"] });
      queryClient.setQueryData(["vehicle-tasks", task._id], task);

      closeModal();
    },
  });
}
