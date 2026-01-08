import { KAFKA_TOPICS, response } from "@sigem/shared";
import mongoose from "mongoose";
import { getEventBus } from "src/core/events/event.bus";
import UserModel from "src/modules/auth/models/user.model";
import { generateUniqueUsername } from "src/utils/gen-username";
import { resetPasswordSchema } from "src/modules/auth/schema/auth.dto";

export class UserService {
  static async list(role: unknown) {
    const users =
      role === "SUPER_ADMIN" || "ADMIN"
        ? await UserModel.find().select("-password")
        : await UserModel.find({ isDeleted: false }).select("-password");
    return response(
      users.map((user) => user.omitPassword()),
      null,
      "Users fetched",
      true,
      200
    );
  }

  static async listById(id: string) {
    const user = await UserModel.findById({ _id: id, isDeleted: false });
    if (!user) {
      return response(
        null,
        null,
        "[UserService 404] User not found",
        false,
        404
      );
    }

    return response(user.omitPassword(), null, "User fetched", true, 200);
  }

  static async listByMatricule(matricule: string) {
    const user = await UserModel.findOne({ matriculation: matricule });
    if (!user) {
      return response(
        null,
        null,
        "[UserService 404] User not found",
        false,
        404
      );
    }
    return response(user.omitPassword(), null, "User fetched", true, 200);
  }

  static async update(id: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // get the user
      const user = await UserModel.findById(id).session(session);
      if (!user) {
        response(
          null,
          "NOT_FOUND",
          "[UserService 404] User not found",
          false,
          404
        );
      }

      // email changed
      const emailChanged = data.email ?? user?.email;

      const username = await generateUniqueUsername(
        emailChanged,
        async (uname) => {
          const exists = await UserModel.findOne({ username: uname });
          return !!exists;
        }
      );

      // find user and update
      const userToUpdate = await UserModel.findByIdAndUpdate(
        id,
        {
          $set: {
            email: emailChanged,
            username: data.email
              ? data.email !== user?.email
                ? username
                : user?.username
              : user?.username,
            role: data.role ?? user?.role,
            isBlocked: data.isBlocked ?? user?.isBlocked,
            isActive: data.isActive ?? user?.isActive,
            is2FAValidated: data.is2FAValidated ?? user?.is2FAValidated,
            is2FAEnabled: data.is2FAEnabled ?? user?.is2FAEnabled,
          },
        },
        { new: true, runValidators: true, session }
      );

      await session.commitTransaction();

      // -- notifier (NoOp for now)
      await getEventBus().emit(KAFKA_TOPICS.USER_UPDATED, {
        user: userToUpdate?.username,
        detail: `User ${userToUpdate?.username} has been updated`,
        timestamp: new Date().toISOString(),
        severity: "success",
        recipients: [], // vide = broadcast rôle (géré côté notif svc)
      });

      return response(
        userToUpdate,
        null,
        "[UserService 200] User updated successfully",
        true,
        200
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async resetPassword(
    id: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const request = resetPasswordSchema.parse({
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    });

    // console.log("PASSWORDS :", request);

    // 2) Find user
    const user = await UserModel.findById(id);
    if (!user) {
      return response(null, "NOT_FOUND", "User Not Found", false, 404);
    }

    // 3) Check current password
    const isValid = await user.comparePassword(request.currentPassword);
    if (!isValid) {
      return response(
        null,
        "BAD_REQUEST",
        "Current password is incorrect",
        false,
        403
      );
    }

    // 4) Prevent same password
    if (request.currentPassword === request.newPassword) {
      return response(
        null,
        "BAD_REQUEST",
        "New password must be different from old password!",
        false,
        403
      );
    }

    // Assign RAW PASSWORD — let pre-save hook hash it!
    user.password = request.newPassword;
    await user.save();

    // Optionally: omit password before sending back
    // const safeUser = user.toObject();
    // delete (safeUser as any).password;

    return response(
      user.omitPassword(),
      null,
      "User password updated",
      true,
      200
    );
  }

  static async softDelete(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true, deletedAt: new Date() },
        },
        { session, new: true, runValidators: true }
      );
      if (!user) {
        return response(
          null,
          "NOT_FOUND",
          "[UserService 404] User not found",
          false,
          404
        );
      }

      await session.commitTransaction();

      // -- notifier (NoOp for now)
      await getEventBus().emit(KAFKA_TOPICS.USER_DELETED, {
        user: user?.id,
        detail: `User ${user?.username} has been deleted`,
        timestamp: new Date().toISOString(),
        severity: "success",
        recipients: [], // vide = broadcast rôle (géré côté notif svc)
      });

      return response(
        user,
        null,
        "[UserService 200] User marked for deletion successfully",
        true,
        200
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async deactivate(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        {
          $set: { isBlocked: true, isActive: false },
        },
        { session, new: true, runValidators: true }
      );
      if (!user) {
        return response(
          null,
          null,
          "[UserService 404] User not found",
          false,
          404
        );
      }

      await session.commitTransaction();

      // -- notifier (NoOp for now)
      await getEventBus().emit(KAFKA_TOPICS.USER_UPDATED, {
        user: user?.username,
        detail: `User ${user?.username} account has been deactivated`,
        timestamp: new Date().toISOString(),
        severity: "success",
        recipients: [], // vide = broadcast rôle (géré côté notif svc)
      });

      return response(
        user,
        null,
        "[UserService 200] User account deactivated successfully",
        true,
        200
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
