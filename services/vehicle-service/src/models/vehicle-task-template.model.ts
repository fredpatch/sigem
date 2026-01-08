import {
  TaskTriggerType,
  VehicleTaskTemplate,
  VehicleTaskType,
} from "src/types/vehicle-task-template.type";
import { type HydratedDocument, model, Model, Schema } from "mongoose";
import { VehicleDocumentType } from "src/types/vehicle-document.type";

export type VehicleTaskTemplateDoc = HydratedDocument<VehicleTaskTemplate>;
export type VehicleTaskTemplateModel = Model<VehicleTaskTemplate>;

const VehicleTaskTemplateSchema = new Schema<VehicleTaskTemplate>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
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
    documentType: {
      type: String,
      enum: Object.values(VehicleDocumentType),
      required: false,
    },

    everyKm: {
      type: Number,
      min: 0,
    },
    everyMonths: {
      type: Number,
      min: 0,
    },

    noticeKmBefore: {
      type: Number,
      min: 0,
      default: 500,
    },
    noticeDaysBefore: {
      type: Number,
      min: 0,
      default: 14,
    },

    defaultSeverity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "warning",
    },

    dept: {
      type: String,
      required: true,
      default: "MG",
      index: true,
    },

    requiresDocument: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "vehicle_task_templates",
  }
);

// Un code unique par dept (tu peux assouplir si besoin)
VehicleTaskTemplateSchema.index({ code: 1 }, { unique: true });

// Normalisation JSON
VehicleTaskTemplateSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const VehicleTaskTemplateEntity = model<
  VehicleTaskTemplate,
  VehicleTaskTemplateModel
>("VehicleTaskTemplate", VehicleTaskTemplateSchema);
