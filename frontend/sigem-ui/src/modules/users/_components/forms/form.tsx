import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Ban,
  CheckCircle,
  Eye,
  EyeOff,
  Hash,
  KeyRound,
  Mail,
  RefreshCcw,
  Shield,
  ShieldBan,
  ShieldCheck,
  User,
  // User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateSecurePassword, getAssignableRoles } from "@/utils/helpers";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";
import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { Guidelines } from "@/common/guidelines";

type Props = {
  form: any;
  id: boolean;
};

export const UserForm = ({ form, id }: Props) => {
  const errors = form.formState.errors;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const { user } = useAuthStore();
  const assignableRoles = getAssignableRoles(user?.role ?? "agent");
  const isEditingSelf = user?._id === form.getValues("id");

  const passwordGenerated = () => {
    const pass = generateSecurePassword();

    // console.log("🚀 ~ Password Generated", pass);
    form.setValue("password", pass);
  };

  // ensure controlled values for checkboxes fields
  useEffect(() => {
    form.register("isActive");
    form.register("isBlocked");
  }, [form]);

  return (
    <div className="space-y-6">
      <Guidelines
        variant="warning"
        title="Avant de modifier un utilisateur"
        compact
        items={[
          "Le rôle (RBAC) détermine les droits d’accès aux modules de l’application.",
          "Désactiver un utilisateur bloque immédiatement sa connexion.",
          "La validation 2FA est obligatoire pour activer définitivement un compte.",
          "Les informations d’identité (email, matricule) doivent rester uniques.",
        ]}
      />

      <Guidelines
        variant="warning"
        className=""
        compact
        title="Sécurité & authentification"
        items={[
          "Un utilisateur sans 2FA validé ne peut pas accéder à l’application.",
          "Réinitialiser le 2FA oblige l’utilisateur à revalider son accès.",
          "Les rôles élevés (Admin, Super Admin) doivent être attribués avec prudence.",
        ]}
      />
      {/* Section Identity */}
      <div className="rounded-md border p-4 space-y-1">
        <h3 className="text-sm text-muted-foreground mb-4">Identity</h3>
        {/* Username */}
        <FormFieldWrapper
          className="mb-4"
          tooltip="ne peut pas être modifié manuellement"
          label={"Username"}
        >
          <div className="relative">
            <Input
              disabled
              {...form.register("username")}
              className="pl-10 placeholder:text-muted"
              placeholder="John Doe"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </FormFieldWrapper>

        {/* Email */}
        <FormFieldWrapper
          tooltip={"Cette action modifiera le nom d'utilisateur !"}
          label={"Email"}
          error={errors.email?.message}
        >
          <div className="relative">
            <Input
              className="pl-10 placeholder:text-muted"
              placeholder="john.doe@example.com"
              // disabled={id}
              type="email"
              {...form.register("email")}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper
          tooltip={"Cette action modifiera le nom d'utilisateur !"}
          label={"Matriculation"}
          error={errors.matriculation?.message}
        >
          <div className="relative">
            <Input
              className="pl-10 placeholder:text-muted"
              placeholder="eg: 1234-AB"
              // disabled={id}
              type="text"
              {...form.register("matriculation")}
            />
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </FormFieldWrapper>

        {/* Password */}
        {!id && (
          <FormFieldWrapper
            className="mt-4"
            label={"Password"}
            error={errors.password?.message}
            tooltip={
              "You can manually set a password or let the system generate one."
            }
          >
            <div className="flex flex-col gap-2 justify-between">
              <div className="relative">
                <Input
                  id="password"
                  className="pl-10 placeholder:text-muted-foreground"
                  placeholder="Enter user desired password"
                  // disabled={id}
                  type={passwordVisible ? "text" : "password"}
                  {...form.register("password")}
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                {/* Password options */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                    variant={"ghost"}
                    size={"icon"}
                    // disabled={id}
                  >
                    {passwordVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={passwordGenerated}
                    className="text-blue-500 hover:text-green-500 hover:bg-transparent"
                    variant={"ghost"}
                    size={"icon"}
                    // disabled={id}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  className="pl-10 placeholder:text-muted-foreground"
                  placeholder="Confirm user password"
                  // disabled={id}
                  type={passwordVisible ? "text" : "password"}
                  {...form.register("confirmPassword")}
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />

                {/* Password options */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                    variant={"ghost"}
                    size={"icon"}
                    // disabled={id}
                  >
                    {confirmPasswordVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </FormFieldWrapper>
        )}
      </div>
      {/* Role Select */}
      <FormFieldWrapper
        tooltip={isEditingSelf ? "You cannot edit your own role" : ""}
        label={id ? "Modifier le rôle" : "Rôle"}
        error={errors.role?.message}
        className="-mt-2"
      >
        <div className="relative">
          <Select
            disabled={isEditingSelf}
            defaultValue={form.getValues("role")}
            onValueChange={(value) => form.setValue("role", value)}
          >
            <SelectTrigger className="pl-10 w-full">
              <SelectValue placeholder="Sélectionnez un rôle" />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </FormFieldWrapper>
      <div className="rounded-md flex flex-col border p-4 space-y-5">
        <h3 className="text-sm text-muted-foreground">Status</h3>
        <div className="flex items-center justify-around">
          {/* Section: Status */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-1">
              <Switch
                disabled={isEditingSelf}
                id="isActive"
                checked={form.watch("isActive")}
                onCheckedChange={(value) => form.setValue("isActive", value)}
              />
              <Label htmlFor="isActive" className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-muted-foreground" /> Active
              </Label>
            </div>

            <div className="flex items-center space-x-1">
              <Switch
                id="isBlocked"
                disabled={isEditingSelf}
                className=""
                checked={form.watch("isBlocked")}
                onCheckedChange={(value) => form.setValue("isBlocked", value)}
              />
              <Label htmlFor="isActive" className="flex items-center gap-1">
                <Ban className="h-4 w-4 text-muted-foreground" />
                Blocked
              </Label>
            </div>
          </div>

          {/* Section: 2FA */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-1">
              <Switch
                id="is2FAEnabled"
                checked={form.watch("is2FAEnabled")}
                onCheckedChange={(value) =>
                  form.setValue("is2FAEnabled", value)
                }
              />
              <Label htmlFor="is2FAEnabled" className="flex items-center gap-1">
                <ShieldBan className="h-4 w-4 text-red-500" /> 2FA Active
              </Label>
            </div>

            <div className="flex items-center space-x-1">
              <Switch
                id="is2FAValidated"
                disabled={!form.watch("is2FAEnabled") || id}
                checked={form.watch("is2FAValidated")}
                onCheckedChange={(value) =>
                  form.setValue("is2FAValidated", value)
                }
              />
              <Label
                htmlFor="is2FAValidated"
                className="flex items-center gap-1"
              >
                <ShieldCheck className="h-4 w-4 text-green-500" />
                2FA Validated
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
