import { MgCompleteOilChangeSchema } from "src/schema/mg-vehicle-actions.dto";
import { MgCreateVehicleSchema } from "src/schema/mg-vehicle-create.dto";
import { MgService } from "src/services/vehicle-mg.service";
import { VehicleTaskService } from "src/services/vehicle-task.service";
import { catchError } from "src/utils/catch-error";

export class MgController {
  private mgService: MgService;
  private taskService: VehicleTaskService;

  constructor() {
    this.mgService = new MgService();
    this.taskService = new VehicleTaskService();
  }

  completeOilChangeTask = catchError(async (req, res) => {
    const { vehicleId } = req.params;

    // console.log("MGController.completeOilChangeTask", {
    //   vehicleId,
    //   body: req.body,
    // });

    const payload = MgCompleteOilChangeSchema.parse(req.body);

    const task = await this.mgService.findOpenOilChangeTask({ vehicleId });
    if (!task) {
      return res.status(404).json({
        ok: false,
        message: "Aucune tâche de vidange ouverte trouvée pour ce véhicule.",
      });
    }

    const completed = await this.taskService.completeTask(String(task._id), {
      completedMileage: payload.completedMileage,
      completedAt: payload.completedAt,
      completionComment: payload.completionComment,
    });

    if (!completed) {
      return res.status(500).json({
        ok: false,
        message: "Impossible de valider la vidange.",
      });
    }

    return res.status(200).json({
      data: completed,
      ok: true,
      message: "Tâche de vidange complétée avec succès.",
    });
  });

  createMgVehicle = catchError(async (req, res) => {
    const dept = "MG";
    const input = MgCreateVehicleSchema.parse(req.body);

    // 1) Create vehicle
    const createVehicle = await this.mgService.createMgVehicle(input, dept);

    return res.status(201).json({
      createVehicle,
      ok: true,
      message: "Véhicule créé avec succès.",
    });
  });
}
