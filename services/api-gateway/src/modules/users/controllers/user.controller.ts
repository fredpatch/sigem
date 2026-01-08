import { UserService } from "../services/user.service";
import { catchError } from "src/utils/catch-error";

export class UserController {
  static list = catchError(async (req, res) => {
    const role = req.user?.role;

    // Call service
    const response = await UserService.list(role);

    // send notification

    // return response
    return res.status(200).json({
      data: response.data,
      success: response.success,
      status: response.status,
      message: response.message,
    });
  });

  static listById = catchError(async (req, res) => {
    // validate request
    const { id } = req.params;

    // console.log(req.params);

    // console.log(`[UserService] Get user by id: ${id}`);

    // Call service
    const response = await UserService.listById(id);

    // return response
    return res.status(200).json({
      data: response.data,
      success: response.success,
      status: response.status,
      message: response.message,
    });
  });

  static listByMatricule = catchError(async (req, res) => {
    // validate request
    const { matricule } = req.params;
    // Call service
    const response = await UserService.listByMatricule(matricule);
    // return response
    return res.status(200).json({
      data: response.data,
      success: response.success,
      status: response.status,
      message: response.message,
    });
  });

  static update = catchError(async (req, res) => {
    // validate request
    const { id } = req.params;
    const { data } = req.body;
    const admin = req.user;

    // Call service
    const {
      data: user,
      message,
      status,
      success,
    } = await UserService.update(id, data);

    // send notification event

    // return response
    return res.status(200).json({
      data: user,
      success: success,
      status: status,
      message: message,
    });
  });

  static softDelete = catchError(async (req, res) => {
    // validate request
    const { id } = req.params;
    const admin = req.user;

    // Call service
    const {
      data: user,
      message,
      success,
      status,
    } = await UserService.softDelete(id);

    // send notification event

    // return response
    return res.status(200).json({
      data: user,
      success: success,
      status: status,
      message: message,
    });
  });

  static resetPassword = catchError(async (req, res) => {
    // validate request
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Call service
    const {
      data: user,
      message,
      success,
      status,
    } = await UserService.resetPassword(
      id,
      currentPassword,
      newPassword,
      confirmPassword
    );

    // send notification event

    // return response
    return res.status(200).json({
      data: user,
      success: success,
      status: status,
      message: message,
    });
  });

  static deactivate = catchError(async (req, res) => {
    // validate request
    const { id } = req.params;

    // Call service
    const {
      data: user,
      message,
      success,
      status,
    } = await UserService.deactivate(id);

    // send notification event

    // return response
    return res.status(200).json({
      data: user,
      success: success,
      status: status,
      message: message,
    });
  });
}
