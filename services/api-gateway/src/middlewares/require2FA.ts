import { NextFunction } from "express";
import UserModel from "src/modules/auth/models/user.model";

export const require2FA = async (req: any, res: any, next: NextFunction) => {
  try {
    const userId = req?.user.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User Unauthenticated!" });

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });

    if (user.is2FAEnabled && !user.is2FAValidated) {
      return res
        .status(403)
        .json({ success: false, message: "2FA validation is required!" });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "2FA middleware validation error" });
  }
};
