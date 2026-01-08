import { VehicleTask, VehicleTaskStatus } from "src/types/vehicle-task.types";
import { model, type HydratedDocument, Schema, Model } from "mongoose";
import {
  TaskTriggerType,
  VehicleTaskType,
} from "src/types/vehicle-task-template.type";

export type VehicleTaskDoc = HydratedDocument<VehicleTask>;
export type VehicleTaskModel = Model<VehicleTask>;

const VehicleTaskSchema = new Schema<VehicleTask>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Vehicle",
      index: true,
    },
    vehicleDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "vehicleDocument",
      required: false,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(VehicleTaskType),
      required: true,
      index: true,
    },
    triggerType: {
      type: String,
      enum: Object.values(TaskTriggerType),
      required: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    dueAt: {
      type: Date,
      index: true,
    },
    dueMileage: {
      type: Number,
      min: 0,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(VehicleTaskStatus),
      required: true,
      default: VehicleTaskStatus.PLANNED,
      index: true,
    },

    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "warning",
      index: true,
    },

    lastNotificationAt: {
      type: Date,
    },
    lastNotifiedState: {
      type: String,
      enum: ["DUE_SOON", "OVERDUE"],
      default: null,
    },
    notificationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedAt: {
      type: Date,
    },
    completedMileage: {
      type: Number,
      min: 0,
    },
    completionComment: {
      type: String,
      trim: true,
    },

    dept: {
      type: String,
      required: true,
      default: "MG",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "vehicle_tasks",
  }
);

// Index utile pour le monitoring : tâches "ouvertes" triées par échéance
VehicleTaskSchema.index({
  dept: 1,
  status: 1,
  dueAt: 1,
  dueMileage: 1,
});

// Normalisation JSON
VehicleTaskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const VehicleTaskEntity = model<VehicleTask, VehicleTaskModel>(
  "VehicleTask",
  VehicleTaskSchema
);
