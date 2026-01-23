import { VehicleTaskTemplateEntity } from "src/models/vehicle-task-template.model";
import {
  DOC_TEMPLATE_CONSTANTS,
  MG_DOC_TEMPLATE_DEFAULTS,
} from "src/types/mg.types";

export async function seedMgDocTemplates(dept = "MG") {
  const results: Array<{ code: string; action: "created" | "updated" }> = [];

  for (const d of MG_DOC_TEMPLATE_DEFAULTS) {
    const update = {
      dept,
      code: d.code,
      label: d.label,
      description: d.description ?? "",
      type: DOC_TEMPLATE_CONSTANTS.type,
      triggerType: DOC_TEMPLATE_CONSTANTS.triggerType,

      requiresDocument: true,
      documentType: d.documentType,

      everyMonths: d.everyMonths,
      everyKm: null,

      noticeDaysBefore: d.noticeDaysBefore ?? 30,
      noticeKmBefore: 0,

      defaultSeverity: d.defaultSeverity ?? "warning",
      active: true,
    };

    const existing = await VehicleTaskTemplateEntity.findOne({
      code: d.code,
    }).lean();

    if (!existing) {
      await VehicleTaskTemplateEntity.create(update);
      results.push({ code: d.code, action: "created" });
    } else {
      await VehicleTaskTemplateEntity.updateOne(
        { code: d.code },
        { $set: update }
      );
      results.push({ code: d.code, action: "updated" });
    }
  }

  return { dept, results };
}
