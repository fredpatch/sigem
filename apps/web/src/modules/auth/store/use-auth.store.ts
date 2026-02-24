import { LoginDTO, OtpPurpose, User } from "../types/auth-type";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthAPI } from "../api/auth-api";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  preAuthUser: User | null;
  otp: any;
  finalizeLogin: () => void;
  login: (request: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  requestOtp: (matriculation: string, purpose?: OtpPurpose) => Promise<any>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      preAuthUser: null,
      otp: null,

      login: async (request: LoginDTO) => {
        try {
          await AuthAPI.login(request); // call  API
          // const requestOtp = await AuthAPI.requestOTP({
          //   matriculation: request.matriculation,
          // });
          const res = await AuthAPI.fetchMe();

          // console.log("OTP REQUEST from store", res);

          // console.log("🚀 ~ file: auth.ts:50 ~ login ~ res:", res);
          // set({ user: response.data, preAuthUser: res.data }); // Don't set user yet
          set({ user: null, preAuthUser: res.data, otp: null }); // Don't set user yet

          // Don't return the user until OTP is verified
          return res.data;
        } catch (error: any) {
          // toast.error(error?.message || "Login failed");
          // console.log("🚀 ~ file: authStore.ts:50 ~ login ~ error:", error);
          throw error;
        }
      },
      requestOtp: async (
        matriculation: string,
        purpose: OtpPurpose = "LOGIN_2FA"
      ) => {
        const r = await AuthAPI.requestOTP({ matriculation, purpose });

        // console.log("🚀 ~ file: use-auth.store.ts:78 ~ requestOtp: ~ r:", r);

        set({ otp: r.data?.code ?? r.code }); // adapt response shape
        return r;
      },

      finalizeLogin: () => {
        set((state) => ({ user: state.preAuthUser, preAuthUser: null }));
      },

      logout: async () => {
        try {
          await AuthAPI.logout();
          set({ user: null });
        } catch (err) {
          toast.error("Logout failed");
          throw err;
        }
      },

      fetchMe: async () => {
        try {
          const res = await AuthAPI.fetchMe();

          set({ user: res });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: "sigem-auth", // key in localStorage
      partialize: (state) => ({ user: state.user }),
    }
  )
);
