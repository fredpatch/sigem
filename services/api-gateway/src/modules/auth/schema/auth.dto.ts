import { ROLES } from "@sigem/shared";
import { password_validation } from "src/utils/regex";
import z from "zod";

export const userIdSchema = z.string().min(1).max(24);
export const emailSchema = z.string().email().min(1).max(255);
export const passwordSchema = z.string().optional();
export const roleSchema = z.nativeEnum(ROLES).default(ROLES.MG_AGT);
export const matriculationSchema = z.string().min(1).max(20);

export const setPasswordSchema = z
  .object({
    matriculation: matriculationSchema,
    code: z.string().min(6).max(6),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  matriculation: matriculationSchema,
  password: z.string().optional(),
  userAgent: z.string().optional(),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    matriculation: matriculationSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(6).max(255),
    role: roleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .regex(
        password_validation,
        "Password should be between 6 to 20 characters and should contain at least 1 uppercase letter, 1 lowercase letter and 1 digit."
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const updateUserAccountSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  confirmPassword: z.string().optional(),
  role: roleSchema.optional(),
  verified: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
});

export const deleteUserSchema = z.object({
  userId: userIdSchema,
});
