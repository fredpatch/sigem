import { TaskTriggerType } from "src/types/vehicle-task-template.type";
import { VehicleTask } from "src/types/vehicle-task.types";

export type TaskAlertState =
    | { state: "DUE_SOON"; reason: "DATE" | "MILEAGE" }
    | { state: "OVERDUE"; reason: "DATE" | "MILEAGE" }
    | null;

export type AlertThresholds = {
    dueSoonDays: number; // ex: 7
    dueSoonKm: number;   // ex: 500
};

function daysBetween(a: Date, b: Date) {
    const ms = b.getTime() - a.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function computeTaskAlertState(
    task: Pick<VehicleTask, "triggerType" | "dueAt" | "dueMileage">,
    now: Date,
    currentMileage: number,
    thresholds: AlertThresholds
): TaskAlertState {
    const byDate = () => {
        if (!task.dueAt) return null;
        const due = new Date(task.dueAt);
        if (due.getTime() <= now.getTime()) return { state: "OVERDUE" as const, reason: "DATE" as const };

        const daysLeft = daysBetween(now, due); // 0..N
        if (daysLeft <= thresholds.dueSoonDays) return { state: "DUE_SOON" as const, reason: "DATE" as const };
        return null;
    };

    const byMileage = () => {
        if (typeof task.dueMileage !== "number") return null;
        const diff = task.dueMileage - currentMileage; // km restants
        if (diff <= 0) return { state: "OVERDUE" as const, reason: "MILEAGE" as const };
        if (diff <= thresholds.dueSoonKm) return { state: "DUE_SOON" as const, reason: "MILEAGE" as const };
        return null;
    };

    switch (task.triggerType) {
        case TaskTriggerType.BY_DATE:
            return byDate();

        case TaskTriggerType.BY_MILEAGE:
            return byMileage();

        case TaskTriggerType.BY_DATE_OR_MILEAGE: {
            const d = byDate();
            const m = byMileage();

            // Overdue prioritaire
            if (d?.state === "OVERDUE") return d;
            if (m?.state === "OVERDUE") return m;

            // Puis due soon
            return d ?? m ?? null;
        }

        default:
            return null;
    }
}
