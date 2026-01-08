import { catchError } from "src/utils/catch-error";
import { generateUniqueUsername } from "src/utils/gen-username";
import {
  loginSchema,
  registerSchema,
  setPasswordSchema,
} from "../schema/auth.dto";
import { authService } from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "src/utils/cookies";
import { OK } from "src/constants/http-code";
import SessionModel from "../models/session.model";
import { JWtService } from "src/utils/jwt";
import { getEventBus } from "src/core/events";
import { KAFKA_TOPICS } from "@sigem/shared";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      username?: any;
      matriculation?: any;
    }
  }
}

export class AuthController {
  activateUserHandler = catchError(async (req, res) => {
    const { matriculation } = req.body;

    const response = await authService.activateUserByMG(matriculation);
    return res.status(response.status).json(response);
  });

  deactivateUserHandler = catchError(async (req, res) => {
    const { matriculation } = req.body;

    const response = await authService.deactivateUserByMG(matriculation);
    return res.status(response.status).json(response);
  });

  updateUserRoleHandler = catchError(async (req, res) => {
    const request = req.body;
    const { matriculation, role } = request;

    console.log("MAT:: ", matriculation, " ROLE:: ", role);

    const response = await authService.updateUserRoleByMG(matriculation, role);
    return res.status(response.status).json(response);
  });

  firstLoginSetPasswordHandler = catchError(async (req, res) => {
    const request = setPasswordSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    const response = await authService.setPasswordAfterActivation({
      matriculation: request.matriculation,
      code: request.code,
      password: request.password,
      userAgent: request.userAgent,
    });

    const { data, status, message, error, success } = response;

    return res.status(status).json({
      message,
      data: data?.user,
      error,
      success,
    });
  });

  registerHandler = catchError(async (req, res) => {
    // validate request
    const request = registerSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    // Call service
    const response = await authService.register(request as any);

    // Notifications
    await getEventBus().emit(KAFKA_TOPICS.USER_CREATED, {
      // actorId: actor.id,
      // actorName: actor.username,
      // actorSessionId: actor.sessionId,
      // role: actor.role,

      username: response.user.username,
      email: response.user.email,
      timestamp: new Date().toISOString(),
      severity: "success",
      recipients: [], // vide = broadcast rôle (géré côté notif svc)
    });

    // return response
    return res.status(201).json({
      data: response.user,
      message: "User created",
      success: true,
      status: 200,
    });
  });

  loginHandler = catchError(async (req, res) => {
    // validate request
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    // call service
    const response = await authService.login(request as any);

    // console.log("REFRESH TOKEN::: ", refreshToken);

    const { data, message, status, error, success } = response;

    return setAuthCookies({
      res,
      accessToken: data?.accessToken!,
      refreshToken: data?.refreshToken!,
    })
      .status(status)
      .json({
        success: success,
        error: error,
        message: message,
        data: data?.user,
      });
  });

  logoutHandler = catchError(async (req, res) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const decoded = await JWtService.verifyToken(accessToken || "");

    if (decoded) {
      await SessionModel.findByIdAndDelete(decoded?.sessionId);
    }

    clearAuthCookies(res);
    return res.status(204).end();
  });

  getMeHandler = catchError(async (req, res) => {
    // validate request
    const userId = req.user?.id;
    // Call service
    const response = await authService.getMe(userId!);

    // Notifications
    await getEventBus().emit(KAFKA_TOPICS.NOTIFY_EVENT, {
      // actorId: actor.id,
      // actorName: actor.username,
      // actorSessionId: actor.sessionId,
      // role: actor.role,

      username: response.data?.username,

      timestamp: new Date().toISOString(),
      severity: "success",
      recipients: [], // vide = broadcast rôle (géré côté notif svc)
    });

    // return response
    return res.status(200).json(response);
  });

  requestOtpHandler = catchError(async (req, res) => {
    // validate request
    const { matriculation, purpose } = req.body;

    // Call service
    const response = await authService.requestOTP(matriculation, purpose);

    // Notifications
    // await getEventBus().emit(KAFKA_TOPICS.AUTH_OTP_REQUESTED, {
    //   actorId: actor.id,
    //   actorName: actor.username,
    //   actorSessionId: actor.sessionId,
    //   role: actor.role,

    //   code: response.data?.code,
    //   message: response.message,
    //   status: response.status,
    //   expiresInMinutes: 5,
    //   timestamp: new Date().toISOString(),
    //   severity: "success",
    //   recipients: [], // vide = broadcast rôle (géré côté notif svc)
    // });

    // return response
    return res.status(response.status).json(response);
  });

  verifyOtpHandler = catchError(async (req, res) => {
    // validate request
    const request = req.body;
    const { matriculation, code, purpose } = request;

    // console.log(request);
    // Call service
    const response = await authService.verifyOTP({
      matriculation,
      code,
      purpose,
    });

    // return response
    return res.status(response.status).json(response);
  });
}

export const authController = new AuthController();

// aaspg-client-vps:2.2.1-c05d8c9
