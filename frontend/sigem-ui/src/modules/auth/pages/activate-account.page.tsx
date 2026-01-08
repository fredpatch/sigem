import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./auth-ui";
import { AuthAPI } from "@/modules/auth/api/auth-api";

export default function ActivateAccountPage() {
  const [params] = useSearchParams();
  const matriculation = useMemo(
    () => params.get("matriculation") || "",
    [params]
  );

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matriculation) return toast.error("Matricule manquant.");
    if (code.length !== 6) return toast.error("Code OTP invalide.");
    if (!password) return toast.error("Mot de passe requis.");
    if (password !== confirmPassword)
      return toast.error("Les mots de passe ne correspondent pas.");

    setLoading(true);
    try {
      await AuthAPI.setPasswordAfterActivation({
        matriculation,
        code,
        password,
        confirmPassword,
      });
      toast.success("Compte activé !");
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Activation échouée");
    } finally {
      setLoading(false);
    }
  };

  // For dev purposes, auto-request OTP on page load
  //   useEffect(() => {
  //     if (!matriculation) return;
  //     AuthAPI.requestOTP({ matriculation, purpose: "ACCOUNT_ACTIVATION" })
  //       .then(() => toast.success("Code OTP envoyé"))
  //       .catch((e) =>
  //         toast.error(
  //           e?.response?.data?.message || "Impossible d'envoyer le code"
  //         )
  //       );
  //   }, [matriculation]);

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-md bg-white shadow">
      <h2 className="text-lg font-semibold mb-4">Activation du compte</h2>

      <form onSubmit={onSubmit} className="space-y-3">
        <Input value={matriculation} readOnly />

        <Input
          placeholder="Code OTP (6 chiffres)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
        />

        {/* si ton PasswordInput n'est pas contrôlé, utilise <Input type="password" /> */}
        <PasswordInput
          name="password"
          label="Mot de passe"
          required
          autoComplete="current-password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordInput
          name="confirmPassword"
          label="Confirmer le mot de passe"
          required
          autoComplete="current-password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Activation..." : "Activer"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = "/login")}
        >
          Retour à la connexion
        </Button>
      </form>
    </div>
  );
}
