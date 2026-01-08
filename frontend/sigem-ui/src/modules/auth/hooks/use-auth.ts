import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { LoginDTO, VerifyOtpDTO } from "../types/auth-type";
import { useAuthStore } from "../store/use-auth.store";
import { AuthAPI } from "../api/auth-api";
import { toast } from "sonner";

export function useAuth() {
  const queryClient = useQueryClient();
  const {
    logout: logoutUser,
    login: loginUser,
    finalizeLogin,
  } = useAuthStore();

  const login = useMutation({
    mutationKey: ["auth-login"],
    mutationFn: async (request: LoginDTO) => {
      await loginUser(request);
      // finalizeLogin();
    },
    onError(error: any) {
      console.log(error.message);
      // addNotification(null, error?.code, error?.message, "error");
    },
  });

  const logout = useMutation({
    mutationKey: ["auth-logout"],
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      // addNotification(null, "Comeback Soon !", "", "warning");
      queryClient.clear(); // Clear all queries on logout
    },
  });

  const verifyOTP = useMutation({
    mutationKey: ["auth-verify-otp"],
    mutationFn: (request: VerifyOtpDTO) => AuthAPI.verifyOTP(request),
    onSuccess: () => {
      console.log("OTP Validated");
      // addNotification(null, "OTP Validated", "", "success");
      finalizeLogin();
    },
    onError: (error: any) => {
      console.log(error.message);
      // addNotification(null, error?.response.data.message, "", "error");
    },
  });

  const me = useQuery({
    queryKey: ["auth-me"],
    queryFn: AuthAPI.fetchMe,
  });

  const activateUser = useMutation({
    mutationKey: ["auth-activate-user"],
    mutationFn: (request: { matriculation: string }) =>
      AuthAPI.activateUser(request),
    onSuccess: () => {
      toast.success("Code d’activation généré");
      // queryClient.invalidateQueries({ queryKey: ["users-by-matricule"] });
      queryClient.invalidateQueries({ queryKey: ["sigem-user"] });
      // queryClient.invalidateQueries({ queryKey: ["employee"] });
      // queryClient.invalidateQueries({ queryKey: ["users"] }); // si tu listes
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Activation échouée");
    },
  });

  const deactivateUser = useMutation({
    mutationKey: ["auth-deactivate-user"],
    mutationFn: (request: { matriculation: string }) =>
      AuthAPI.deactivateUser(request),
    onSuccess: () => {
      toast.success("Utilisateur désactivé");
      // queryClient.invalidateQueries({ queryKey: ["users-by-matricule"] });
      queryClient.invalidateQueries({ queryKey: ["sigem-user"] });
      // queryClient.invalidateQueries({ queryKey: ["employee"] });
      // queryClient.invalidateQueries({ queryKey: ["users"] }); // si tu listes
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Désactivation échouée");
    },
  });

  const updateUserRole = useMutation({
    mutationKey: ["auth-update-user-role"],
    mutationFn: (request: { matriculation: string; role: any }) =>
      AuthAPI.updateUserRole(request),
    onSuccess: () => {
      toast.success("Rôle utilisateur mis à jour");
      queryClient.invalidateQueries({ queryKey: ["sigem-user"] });
      queryClient.invalidateQueries({ queryKey: ["sigem-user"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["users-by-matricule"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["directory-search-enriched"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Mise à jour du rôle échouée");
    },
  });

  return {
    login,
    logout,
    verifyOTP,
    me,
    activateUser,
    deactivateUser,
    updateUserRole,
  };
}
