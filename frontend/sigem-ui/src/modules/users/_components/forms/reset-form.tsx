import { FormFieldWrapper } from "@/components/shared/form/form-field-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";
import { generateSecurePassword } from "@/utils/helpers";
import { Eye, EyeOff, KeyRound, LockKeyhole, RefreshCcw } from "lucide-react";
import { useState } from "react";

type Props = {
  form: any;
  id: boolean;
};

export const ResetForm = ({ form, id }: Props) => {
  const errors = form.formState.errors;
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const { user } = useAuthStore();
  const isEditingSelf = user?._id === form.getValues("id");

  // console.log(user?._id);

  const passwordGenerated = () => {
    const pass = generateSecurePassword();

    // console.log("🚀 ~ Password Generated", pass);
    form.setValue("newPassword", pass);
  };
  return (
    <>
      {/* Section Identity */}
      <div className="rounded-md border p-4 space-y-4">
        {/* Password */}
        <FormFieldWrapper
          label="Enter you current password"
          className=""
          error={errors.currentPassword?.message}
          tooltip={
            "You should enter the password that you are using at the moment."
          }
        >
          {/* Current Password */}
          <div className="relative">
            <Input
              id="currentPassword"
              className="pl-10 placeholder:text-muted"
              placeholder="Enter your current password"
              disabled={isEditingSelf}
              type={currentPasswordVisible ? "text" : "password"}
              {...form.register("currentPassword")}
            />
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />

            {/* Password options */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                onClick={() => setCurrentPasswordVisible((prev) => !prev)}
                className="text-muted hover:text-foreground hover:bg-transparent"
                variant={"ghost"}
                size={"icon"}
                disabled={isEditingSelf}
              >
                {currentPasswordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Enter your new password"
          className="mb-6"
          error={errors.newPassword?.message}
          tooltip={
            "You can manually set a password or let the system generate one."
          }
        >
          {/* New Password */}
          <div className="relative">
            <Input
              id="newPassword"
              className="pl-10 placeholder:text-muted"
              placeholder="Enter your new password"
              disabled={isEditingSelf}
              type={newPasswordVisible ? "text" : "password"}
              {...form.register("newPassword")}
            />
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />

            {/* Password options */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                onClick={() => setNewPasswordVisible((prev) => !prev)}
                className="text-muted hover:text-foreground hover:bg-transparent"
                variant={"ghost"}
                size={"icon"}
                disabled={isEditingSelf}
              >
                {newPasswordVisible ? (
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
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Confirm your password"
          className="mb-6"
          error={errors.confirmPassword?.message}
        >
          {/* Confirm Password */}
          <div className="relative">
            <Input
              id="confirmPassword"
              className="pl-10 placeholder:text-muted"
              placeholder="Confirm your new password"
              disabled={isEditingSelf}
              type={confirmPasswordVisible ? "text" : "password"}
              {...form.register("confirmPassword")}
            />
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />

            {/* Password options */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                className="text-muted hover:text-foreground hover:bg-transparent"
                variant={"ghost"}
                size={"icon"}
                disabled={isEditingSelf}
              >
                {confirmPasswordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </FormFieldWrapper>
        <div className="bg-orange-100 p-2 rounded-lg border-orange-700 border">
          <h3 className="text-xs text-yellow-800">
            New Password should be between 6 to 20 characters and should contain
            at least 1 uppercase letter, 1 lowercase letter and 1 digit.
          </h3>
        </div>
      </div>
    </>
  );
};

//
