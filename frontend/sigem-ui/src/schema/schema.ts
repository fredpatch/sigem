import { z } from "zod";

export const password_validation = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const userSchema = z
  .object({
    email: z.string().email("Valid email required"),
    password: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 8,
        "Password must be at least 8 characters long"
      ),
    confirmPassword: z.string().optional(),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "MG_AGT", "MG_COS", "MG_COB"]),
    isActive: z.boolean().optional().default(true),
    isBlocked: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .regex(
        password_validation,
        "*Password should be between 6 to 20 characters and should contain at least 1 uppercase letter, 1 lowercase letter and 1 digit."
      ),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UserDefaultValue = {
  username: "",
  email: "",
  role: "MG_AGT",
  isActive: true,
  isBlocked: false,
};
