import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { useAuthStore } from "../../store/use-auth.store";

interface Props {
  matriculation: string;
  onSuccess: () => void;
}

export const TwoFactorForm = ({ matriculation, onSuccess }: Props) => {
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { verifyOTP } = useAuth();
  const otp = useAuthStore((state) => state.otp);

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP.mutateAsync({
        matriculation,
        code,
        purpose: "LOGIN_2FA",
      });
      onSuccess();
    } catch (error: any) {
      setError(error.response.data.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-md shadow">
      <h2 className="text-lg font-semibold mb-4">🔐 2FA Validation</h2>
      {/* <p className="text-sm mb-4">
        Please <strong>{username}</strong> enter the code sent to your email.
      </p> */}
      <p className="text-sm mb-4 text-red-800 text-center">
        <strong className="text-green-500">{otp}</strong>
      </p>
      <Input
        placeholder="Enter votre code OTP"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="flex w-[49%] gap-2">
        <Button
          variant={"destructive"}
          className="mt-4 w-full"
          // onClick={handleVerifyOTP}
        >
          Annuler
        </Button>
        <Button
          variant={"default"}
          className="mt-4 w-full"
          onClick={handleVerifyOTP}
        >
          Valider
        </Button>
      </div>
    </div>
  );
};
