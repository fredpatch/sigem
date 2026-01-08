import { api } from "@/lib/axios";
import {
  LoginDTO,
  LoginResponse,
  OtpResponse,
  RegisterDTO,
  RequestOtpDTO,
  SetPasswordDTO,
  // RequestOtpResponse,
  VerifyOtpDTO,
} from "../types/auth-type";

export class AuthAPI {
  static async register(request: RegisterDTO) {
    const response = await api.post("/auth/register", request);
    return response.data;
  }

  static async login(request: LoginDTO): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", request);
    return response.data;
  }

  static async logout() {
    await api.post("/auth/logout");
  }

  static async fetchMe() {
    const res = await api.get("/auth/me");
    return res.data;
  }

  static async verifyOTP(request: VerifyOtpDTO): Promise<OtpResponse> {
    const res = await api.post<OtpResponse>("/auth/verify-otp", request);
    return res.data;
  }

  static async requestOTP(request: RequestOtpDTO): Promise<any> {
    const res = await api.post<any>("/auth/request-otp", request);
    return res.data;
  }

  static async setPasswordAfterActivation(request: SetPasswordDTO) {
    const res = await api.post("/auth/set-password", request);
    return res.data;
  }

  static async activateUser(request: { matriculation: string }) {
    const res = await api.post("/auth/mg/activate", request);
    return res.data; // { data: { matriculation, code }, ... }
  }
  static async deactivateUser(request: { matriculation: string }) {
    const res = await api.post("/auth/mg/deactivate", request);
    return res.data; // { data: { matriculation, code }, ... }
  }

  static async updateUserRole(request: { matriculation: string; role: any }) {
    const res = await api.patch("/auth/mg/role", request);
    return res.data;
  }
}
