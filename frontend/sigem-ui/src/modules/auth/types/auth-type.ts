export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MG_COS" | "MG_COB" | "MG_AGT";

export interface User {
  _id: string;
  email: string;
  username: string;
  avatarUrl: string;
  department: string;
  // name: string;
  surname: string;
  role: UserRole;
  lastLogin: string;
  isActive: boolean;
  isBlocked: boolean;
  deletedAt: Date;
  isDeleted: boolean;
  is2FAValidated: boolean;
  is2FAEnabled: boolean;

  matriculation: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
}

export type OtpPurpose = "ACCOUNT_ACTIVATION" | "LOGIN_2FA" | "PASSWORD_RESET";

export type RequestOtpDTO = {
  matriculation: string;
  purpose?: OtpPurpose;
};

export type SetPasswordDTO = {
  matriculation: string;
  code: string;
  password: string;
  confirmPassword: string;
};

export type VerifyOtpDTO = {
  matriculation: string;
  code: string;
  purpose?: OtpPurpose;
};

export type LoginDTO = {
  matriculation: string;
  password: string;
};

export type RegisterDTO = {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

export interface LoginResponse {
  data?: User;
}

export interface MeResponse {
  data?: User;
  message: string;
}

export interface RegisterResponse {
  data?: User;
  message: string;
  success: boolean;
  status: number;
}

export interface OtpResponse {
  data?: User;
}

export interface RequestOtpResponse {
  message: string;
  code: string;
  success: boolean;
  status: number;
}

export interface UserResponseDTO {
  data?: User;
}
