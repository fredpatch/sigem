import { Role } from "@sigem/shared";

export type CreateAccountParams = {
  email: string;
  matriculation: string;
  password: string;
  role?: Role;
  userAgent?: string;
};

export const enum Audience {
  User = "User",
  Admin = "Admin",
}

export type LoginParams = {
  matriculation: string;
  password: string;
  userAgent?: string;
};
