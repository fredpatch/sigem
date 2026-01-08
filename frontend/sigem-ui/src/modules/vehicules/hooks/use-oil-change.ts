import { useQuery } from "@tanstack/react-query";
import { VehicleTaskAPI } from "../api/vehicle-tasks.api";

export function useOilChangeInfo(vehicleId?: string) {
  return useQuery<any>({
    queryKey: ["vehicles", vehicleId, "oil-change"],
    enabled: !!vehicleId,
    queryFn: async () => VehicleTaskAPI.getOilChangeInfo(vehicleId!),
  });
}
