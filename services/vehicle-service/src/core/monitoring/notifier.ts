import { getEventBus } from "src/core/events";
import type { Severity } from "@sigem/shared";

type VehicleTaskNotifyPayload = {
    type: string;
    severity?: Severity;

    role?: string;
    userId?: string;
    recipients?: string[];

    resourceType?: "VehicleTask" | "Vehicle";
    resourceId?: string;

    vehicleId: string;
    vehiclePlate?: string;
    vehicleLabel?: string;

    taskId: string;
    taskLabel?: string;

    dueAt?: Date | string;
    dueMileage?: number;

    title?: string;
    message?: string;
};

export async function emitVehicleTaskDueSoon(p: Omit<VehicleTaskNotifyPayload, "type">) {
    return getEventBus().emit("vehicle.task.due_soon", { ...p, type: "vehicle.task.due_soon" });
}

export async function emitVehicleTaskOverdue(p: Omit<VehicleTaskNotifyPayload, "type">) {
    return getEventBus().emit("vehicle.task.overdue", { ...p, type: "vehicle.task.overdue" });
}

export async function emitVehicleTaskCompleted(p: Omit<VehicleTaskNotifyPayload, "type">) {
    return getEventBus().emit("vehicle.task.completed", { ...p, type: "vehicle.task.completed" });
}
