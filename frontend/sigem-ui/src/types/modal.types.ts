export const ModalTypes = {
  USER_FORM: "userForm",
  RESET_FORM: "resetForm",
  LOCATION_FORM: "locationForm",
  LOCATION_FAST_FORM: "locationForm1",
  CATEGORY_FORM: "categoryForm",

  ASSETS_FORM: "assetForm",

  VEHICLE_FORM: "vehicleForm",
  VEHICLE_TASKS_FORM: "vehicle-tasksForm",
  VEHICLE_TASK_PLAN_FROM_DOCUMENT: "VEHICLE_TASK_PLAN_FROM_DOCUMENT",
  VEHICLE_TASK_PLAN_FROM_VEHICLE: "VEHICLE_TASK_PLAN_FROM_VEHICLE",
  VEHICLE_MANAGEMENT_FORM: "vehicle-managementForm",
  VEHICLE_DOCUMENT_FORM: "vehicle-documentForm",
  VEHICLE_COMPLETE_TASKS_FORM: "vehicle-complete-tasksForm",
  TEMPLATE_TASKS_FORM: "template-tasksForm",

  // ➕ nouveau
  VEHICLE_DETAILS: "VEHICLE_DETAILS",
  VEHICLE_DOCUMENT_DETAILS: "VEHICLE_DOCUMENT_DETAILS",

  DELETE_CONFIRM: "deleteConfirm",
} as const;

export type ModalType = (typeof ModalTypes)[keyof typeof ModalTypes];
