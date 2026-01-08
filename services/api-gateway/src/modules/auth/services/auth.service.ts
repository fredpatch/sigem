import { CreateAccountParams, LoginParams } from "src/modules/types/auth.types";
import SessionModel from "../models/session.model";
import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { response, ROLES } from "@sigem/shared";
import { JWtService } from "src/utils/jwt";
import appAssert from "src/utils/assert";
import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  NOT_FOUND,
} from "src/constants/http-code";
import OtpModel, { OtpPurpose } from "../models/otp.model";
import { generateOTP } from "src/utils/generate-otp";
import {
  generateUniqueUsername,
  generateUserNameFromLastnameMatriculation,
} from "src/utils/gen-username";
import { generateRandomAvatar } from "src/utils/generate-avatar";
import { employeeDirectoryService } from "src/modules/employees/services/employee-directory.service";
import { normalizeMatricule } from "src/utils/formalize-matricule";

export class AuthService {
  async activateUserByMG(matriculation: string) {
    const m = normalizeMatricule(matriculation);

    const employee = await employeeDirectoryService.findByMatricule(m);
    appAssert(
      employee,
      NOT_FOUND,
      "Employee not found in Enterprise Directory"
    );

    const username = generateUserNameFromLastnameMatriculation(
      m,
      employee.firstName
    );

    const payloadFromDirectory = {
      matriculation: m,
      username,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.direction, // direction -> department
      jobTitle: employee.fonction, // ✅ new field
    };

    let user = await UserModel.findOne({ matriculation: m });

    if (!user) {
      user = await UserModel.create({
        ...payloadFromDirectory,
        status: "PENDING",
        role: ROLES.GUEST,
        isActive: false,
      });
    } else {
      if (user.status === "ACTIVE") {
        return response(
          null,
          "ALREADY_ACTIVE",
          "User already active",
          false,
          400
        );
      }

      user.set({
        ...payloadFromDirectory,
        status: "PENDING",
        isActive: false,
      });

      await user.save();
    }

    // generate activation OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpModel.deleteMany({
      userId: user._id,
      purpose: "ACCOUNT_ACTIVATION",
    });

    await OtpModel.create({
      userId: user._id,
      code,
      purpose: "ACCOUNT_ACTIVATION",
      expiresAt,
    });

    return response(
      { m, code, employee },
      null,
      "User activated (pending)",
      true,
      201
    );
  }

  async deactivateUserByMG(matriculation: string) {
    const employee =
      await employeeDirectoryService.findByMatricule(matriculation);
    appAssert(
      employee,
      NOT_FOUND,
      "Employee not found in Enterprise Directory"
    );

    const user = await UserModel.findOne({ matriculation });
    appAssert(user, NOT_FOUND, "User not found");

    if (user.status !== "ACTIVE") {
      return response(
        null,
        "NOT_ACTIVE",
        "User account is not active",
        false,
        400
      );
    }

    user.status = "DISABLED";
    user.isActive = false;
    await user.save();

    return response(
      { matriculation, employee },
      null,
      "User deactivated",
      true,
      200
    );
  }

  async updateUserRoleByMG(matriculation: string, role: any) {
    const employee =
      await employeeDirectoryService.findByMatricule(matriculation);
    appAssert(
      employee,
      NOT_FOUND,
      "Employee not found in Enterprise Directory"
    );
    // console.log("MATRICULATION:", matriculation, "ROLE:", role);
    const user = await UserModel.findOne({ matriculation });
    appAssert(user, NOT_FOUND, "User not found");

    user.role = role;
    await user.save();

    return response(
      { matriculation, role, employee },
      null,
      "User role updated",
      true,
      200
    );
  }

  async setPasswordAfterActivation({
    matriculation,
    code,
    password,
    userAgent,
  }: {
    matriculation: string;
    code: string;
    password: string;
    userAgent?: string;
  }) {
    const employee =
      await employeeDirectoryService.findByMatricule(matriculation);
    if (!employee) {
      return response(
        null,
        "NOT_IN_DIRECTORY",
        "Employee not found in Enterprise Directory",
        false,
        403
      );
    }

    const user = await UserModel.findOne({ matriculation });
    if (!user) {
      return response(null, "NOT_FOUND", "User not found", false, NOT_FOUND);
    }
    if (user.status !== "PENDING") {
      return response(
        null,
        "NOT_PENDING",
        "Account is not pending activation",
        false,
        400
      );
    }

    const otp = await OtpModel.findOne({
      userId: user._id,
      code,
      purpose: "ACCOUNT_ACTIVATION",
    });
    if (!otp) {
      return response(
        null,
        "INVALID_OTP",
        "Invalid OTP or OTP expired",
        false,
        NOT_FOUND
      );
    }
    if (otp.expiresAt <= new Date()) {
      return response(null, "OTP_EXPIRED", "OTP expired", false, BAD_REQUEST);
    }

    await OtpModel.deleteMany({
      userId: user._id,
      purpose: "ACCOUNT_ACTIVATION",
    });

    user.password = password;
    user.status = "ACTIVE";
    user.isActive = true;
    await user.save();

    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = JWtService.signToken({
      id: user._id,
      sessionId: session._id,
      role: user.role,
      matriculation: user.matriculation,
    });

    const refreshToken = JWtService.signToken({
      sessionId: session._id,
    });

    return response(
      {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
      },
      null,
      "Account activated",
      true,
      200
    );
  }

  async register(data: CreateAccountParams) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify existing user does not exist
      const existingUser = await UserModel.exists({
        email: data.email,
      }).session(session);

      // console.log(existingUser);
      appAssert(!existingUser, CONFLICT, "Email already in use");

      // Generate username from email (take part before @ and add random numbers)
      // const baseUsername = data.email.split("@")[0];
      // const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit number
      // const username = `${baseUsername}${randomSuffix}`;
      const username = await generateUniqueUsername(
        data.email,
        async (uname) => {
          const exists = await UserModel.findOne({ username: uname });
          return !!exists;
        }
      );

      if (!data.matriculation) {
        appAssert(
          !data.matriculation,
          BAD_REQUEST,
          "Matriculation is required"
        );
      }

      // generate user avatar
      const avatarUrl = generateRandomAvatar();

      // Create user with username
      const user = await UserModel.create(
        [
          {
            avatarUrl,
            email: data.email,
            matriculation: data.matriculation,
            username: username,
            password: data.password,
            role: data?.role || ROLES.MG_AGT,
          },
        ],
        { session }
      ); // Pass session to create
      const id = user[0]._id;

      // create session
      const userSession = await SessionModel.create(
        [
          {
            id,
            userAgent: data.userAgent,
          },
        ],
        { session }
      ); // Pass session to create

      // sign access token and refresh token
      const refreshToken = JWtService.signToken({
        sessionId: userSession[0]._id,
      });
      const accessToken = JWtService.signToken({
        id,
        sessionId: userSession[0]._id,
      });

      // Commit the transaction
      await session.commitTransaction();

      // Notification
      // console.log(user)

      // return users & token
      return {
        user: user[0].omitPassword(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Abort transaction on error
      console.log(error);
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      await session.endSession();
    }
  }

  async login({ matriculation, password, userAgent }: LoginParams) {
    const employee =
      await employeeDirectoryService.findByMatricule(matriculation);
    if (!employee) {
      return response(
        null,
        "NOT_IN_DIRECTORY",
        "Employee not found in Enterprise Directory",
        false,
        403
      );
    }

    const user = await UserModel.findOne({ matriculation }).select("+password");
    if (!user) {
      return response(
        null,
        "INVALID_CREDENTIALS",
        "Please check your credentials or contact support to activate your account",
        false,
        401
      );
    }

    if (user.status === "PENDING") {
      return response(
        null,
        "ACTIVATE_ACCOUNT",
        "Veuillez activer votre compte avant de vous connecter",
        false,
        403
      );
    }

    if (user.status === "DISABLED") {
      return response(
        null,
        "ACCOUNT_DISABLED",
        "Compte désactivé. Contactez MG.",
        false,
        403
      );
    }
    // appAssert(user, UNAUTHORIZED, "Invalid credentials");

    // validate the password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return response(
        null,
        "INVALID_CREDENTIALS",
        "Please enter valid credentials [password]",
        false,
        401
      );
    }
    // appAssert(isValidPassword, UNAUTHORIZED, "Invalid credentials");

    const userId = user._id;

    const session = await SessionModel.create({
      userId,
      userAgent,
    });

    // update the last login date
    user.lastLogin = new Date();
    await user.save();

    // Create login event notification

    const sessionInfo = {
      sessionId: session._id,
    };

    // sign access token and refresh token
    const refreshToken = await JWtService.signToken(sessionInfo);
    const accessToken = await JWtService.signToken({
      ...sessionInfo,
      id: user._id,
      role: user.role,
      username: user.username,
      matriculation: user.matriculation,
    });

    // console.log(accessToken);

    // return users & token
    return response(
      {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
      },
      null,
      "Login success",
      true,
      200
    );
  }

  async getMe(id: string) {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return response(null, "NOT_FOUND", "User not found", false, NOT_FOUND);
    }

    return response(user.omitPassword(), null, "success", true, 200);
  }

  async requestOTP(matriculation: string, purpose: OtpPurpose = "LOGIN_2FA") {
    const employee =
      await employeeDirectoryService.findByMatricule(matriculation);
    if (!employee) {
      return response(
        null,
        "NOT_IN_DIRECTORY",
        "Employee not found in Enterprise Directory",
        false,
        403
      );
    }

    const user = await UserModel.findOne({ matriculation });
    if (!user) {
      return response(null, "NOT_FOUND", "User not found", false, NOT_FOUND);
    }

    // Rules by purpose
    if (purpose === "ACCOUNT_ACTIVATION") {
      if (user.status !== "PENDING") {
        return response(
          null,
          "NOT_PENDING",
          "Account is not pending activation",
          false,
          400
        );
      }
    }

    if (purpose === "LOGIN_2FA") {
      if (user.status !== "ACTIVE") {
        return response(
          null,
          "NOT_ACTIVE",
          "Account is not active",
          false,
          403
        );
      }
      if (user.is2FAValidated) {
        return response(
          null,
          "VALIDATED_ALREADY",
          "2FA already validated",
          false,
          400
        );
      }
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OtpModel.create({
      userId: user.id,
      code,
      purpose,
      expiresAt,
    });

    // await sendMail({
    //   to: "f.patchelli@gmail.com", // -> user.email,
    //   subject: "🔐 Votre code de vérification CardForger Pro Builder",
    //   text: `Your verification code will expire in 5 minutes.`,
    //   html: `<p>Bonjour <strong>${user.name}</strong>,</p>
    //        <p>Voici votre code de vérification :</p>
    //        <h2 style="color:#333">${code}</h2>
    //        <p>Ce code expire dans 5 minutes.</p>`,
    // });

    return response(
      { code },
      null,
      `OTP sent successfully: ${code}`,
      true,
      201
    );
  }
  async verifyOTP({
    matriculation,
    code,
    purpose = "LOGIN_2FA",
  }: {
    matriculation: string;
    code: any;
    purpose?: OtpPurpose;
  }) {
    const user = await UserModel.findOne({ matriculation });
    appAssert(user, NOT_FOUND, "User not found");

    // status rules
    if (purpose === "ACCOUNT_ACTIVATION") {
      appAssert(
        user.status === "PENDING",
        BAD_REQUEST,
        "Account is not pending"
      );
    }
    if (purpose === "LOGIN_2FA") {
      appAssert(user.status === "ACTIVE", FORBIDDEN, "Account is not active");
    }

    const otpRecord = await OtpModel.findOne({ userId: user._id, code });
    appAssert(otpRecord, NOT_FOUND, "Invalid OTP or OTP expired");
    appAssert(otpRecord.expiresAt > new Date(), BAD_REQUEST, "OTP expired");

    // Optionnel : Delete all code for the user
    await OtpModel.deleteMany({ userId: user._id, purpose });

    // Marquer utilisateur comme "2FA validé"
    /* Comment the following to always enable 2FA when user try to login */
    // user.is2FAValidated = true;
    // await user.save();

    return {
      message: "OTP validated successfully",
      success: true,
      status: 200,
    };
  }
}

export const authService = new AuthService();
