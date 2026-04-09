import UserModel, { STATUS } from "../modules/auth/models/user.model";
import { ROLES } from "@sigem/shared";

const isTruthy = (value?: string) =>
  ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());

const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export async function initSuperAdminBootstrap() {
  const isProduction = process.env.NODE_ENV === "production";
  const enabled = isTruthy(process.env.BOOTSTRAP_SUPER_ADMIN_ENABLED);

  if (!isProduction || !enabled) {
    return;
  }

  const existingSuperAdmin = await UserModel.exists({
    role: ROLES.SUPER_ADMIN,
    isDeleted: false,
  });

  if (existingSuperAdmin) {
    console.log("[bootstrap] super admin already present, skipping bootstrap");
    return;
  }

  const matriculation = getRequiredEnv("BOOTSTRAP_SUPER_ADMIN_MATRICULATION");
  const username = getRequiredEnv("BOOTSTRAP_SUPER_ADMIN_USERNAME");
  const password = getRequiredEnv("BOOTSTRAP_SUPER_ADMIN_PASSWORD");
  const email = process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL?.trim();

  const conflictingUser = await UserModel.findOne({
    $or: [{ matriculation }, { username }, ...(email ? [{ email }] : [])],
  }).select("_id matriculation username email role");

  if (conflictingUser) {
    throw new Error(
      `[bootstrap] cannot create super admin because user ${conflictingUser._id} conflicts with bootstrap identity`,
    );
  }

  await UserModel.create({
    matriculation,
    username,
    password,
    email,
    firstName: "System",
    lastName: "Administrator",
    department: "Platform",
    jobTitle: "Bootstrap Super Admin",
    verified: true,
    isBlocked: false,
    isDeleted: false,
    isActive: true,
    is2FAEnabled: true,
    is2FAValidated: false,
    status: STATUS.ACTIVE,
    role: ROLES.SUPER_ADMIN,
  });

  console.log(
    `[bootstrap] super admin created for matriculation ${matriculation}`,
  );
}
