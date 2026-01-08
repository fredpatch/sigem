import { response } from "@sigem/shared";
import { Request } from "express";
import {
  CompleteVehicleTaskDTO,
  CreateVehicleTaskDTO,
  CreateVehicleTaskTemplateDTO,
  ListVehicleTasksQuery,
  UpdateVehicleTaskDTO,
  UpdateVehicleTaskTemplateDTO,
} from "src/schema/vehicle-task.dto";
import {
  VehicleTaskService,
  VehicleTaskTemplateService,
} from "src/services/vehicle-task.service";
import { VehicleTaskStatus } from "src/types/vehicle-task.types";
import { catchError } from "src/utils/catch-error";

function getDept(req: Request): string {
  return ((req as any).user?.dept as string | undefined) ?? "MG";
}

export class VehicleTaskTemplateController {
  private templateService = new VehicleTaskTemplateService();

  create = catchError(async (req, res) => {
    const dept = getDept(req);

    const payload: CreateVehicleTaskTemplateDTO = {
      ...req.body,
      dept,
    };

    const created = await this.templateService.createTemplate(payload);
    if (!created) {
      return res
        .status(401)
        .json(
          response(null, null, "Vehicle task template not created!", true, 401)
        );
    }

    return res
      .status(201)
      .json(
        response(
          created,
          null,
          "Vehicle task template created successfully",
          true,
          201
        )
      );
  });

  list = catchError(async (req, res) => {
    const dept = getDept(req);
    const onlyActive =
      typeof req.query.active !== "undefined"
        ? req.query.active === "true"
        : undefined;

    const items = await this.templateService.listTemplates(onlyActive);

    return res
      .status(200)
      .json(response(items, null, "Vehicle task templates fetched", true, 200));
  });

  getById = catchError(async (req, res) => {
    // const dept = getDept(req);
    const { id } = req.params;

    const tpl = await this.templateService.getTemplateById(id);

    if (!tpl) {
      return res
        .status(404)
        .json(
          response(null, null, "Vehicle task template not found", false, 404)
        );
    }

    return res
      .status(200)
      .json(response(tpl, null, "Vehicle task template fetched", true, 200));
  });

  update = catchError(async (req, res) => {
    const dept = getDept(req);
    const { id } = req.params;
    const payload = req.body as UpdateVehicleTaskTemplateDTO;

    const updated = await this.templateService.updateTemplate(
      id,
      dept,
      payload
    );

    if (!updated) {
      return res
        .status(404)
        .json(
          response(null, null, "Vehicle task template not found", false, 404)
        );
    }

    return res
      .status(200)
      .json(
        response(updated, null, "Vehicle task template updated", true, 200)
      );
  });
}

export class VehicleTaskController {
  private taskService = new VehicleTaskService();

  createForVehicle = catchError(async (req, res) => {
    const dept = getDept(req);
    const { vehicleId } = req.params;

    const payload: CreateVehicleTaskDTO = {
      ...(req.body as any),
      dept,
      vehicleId,
    };

    const created = await this.taskService.createTask(payload);
    return res
      .status(201)
      .json(response(created, null, "Vehicle task created", true, 201));
  });

  list = catchError(async (req, res) => {
    const {
      page,
      limit,
      status,
      severity,
      vehicleId,
      type,
      dueAfter,
      dueBefore,
    } = req.query as any;

    const params: ListVehicleTasksQuery = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as VehicleTaskStatus,
      severity: severity as any,
      vehicleId: vehicleId as string | undefined,
      type: type as any,
      dueAfter: dueAfter ? new Date(dueAfter as string) : undefined,
      dueBefore: dueBefore ? new Date(dueBefore as string) : undefined,
    };

    const result = await this.taskService.listTasks(params);

    return res.status(200).json(
      response(
        {
          items: result.items,
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
        null,
        "Vehicle tasks fetched",
        true,
        200
      )
    );
  });

  listByVehicle = catchError(async (req, res) => {
    const dept = getDept(req);
    const { vehicleId } = req.params;

    const { page, limit, status, severity, type, dueAfter, dueBefore } =
      req.query as any;

    const params: ListVehicleTasksQuery = {
      dept,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as any,
      severity: severity as any,
      vehicleId,
      type: type as any,
      dueAfter: dueAfter ? new Date(dueAfter as string) : undefined,
      dueBefore: dueBefore ? new Date(dueBefore as string) : undefined,
    };

    const result = await this.taskService.listTasks(params);

    return res.status(200).json(
      response(
        {
          items: result.items,
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
        null,
        "Vehicle tasks for vehicle fetched",
        true,
        200
      )
    );
  });

  getById = catchError(async (req, res) => {
    const { id } = req.params;

    const task = await this.taskService.getTaskById(id);

    if (!task) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle task not found", false, 404));
    }

    return res
      .status(200)
      .json(response(task, null, "Vehicle task fetched", true, 200));
  });

  update = catchError(async (req, res) => {
    const { id } = req.params;
    const payload = req.body as UpdateVehicleTaskDTO;

    const updated = await this.taskService.updateTask(id, payload);

    if (!updated) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle task not found", false, 404));
    }

    return res
      .status(200)
      .json(response(updated, null, "Vehicle task updated", true, 200));
  });

  complete = catchError(async (req, res) => {
    const { id } = req.params;
    const payload = req.body as CompleteVehicleTaskDTO;

    const completed = await this.taskService.completeTask(id, payload);

    if (!completed) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle task not found", false, 404));
    }

    return res
      .status(200)
      .json(response(completed, null, "Vehicle task completed", true, 200));
  });
}
