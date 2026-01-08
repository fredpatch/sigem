import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import React, { ReactNode, useEffect } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { Form } from "@/components/ui/form";

interface ReusableFormProps<T extends z.ZodTypeAny> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  renderFields: (
    form: ReturnType<typeof useForm<z.infer<T>>>
  ) => React.ReactNode;
  disabled?: boolean;
  id: boolean;
  footerActions?: ReactNode;
}

export const ReusableForm = <T extends z.ZodTypeAny>({
  schema,
  defaultValues,
  onSubmit,
  renderFields,
  disabled,
  id,
  footerActions,
}: ReusableFormProps<T>) => {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // 🧠 Important pour le mode édition : quand defaultValues change, on ré-injecte dans le form
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const handleInvalid = (errors: FieldErrors<T>) => {
    // TEMP: debug
    console.error("[Form validation errors]", errors);
  };
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
          className="space-y-4"
        >
          {renderFields(form)}
          <DialogFooter>
            <Button disabled={disabled} type="submit">
              {disabled && (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Please wait...</span>
                </div>
              )}
              {id ? (
                <div className="flex items-center gap-2">
                  <Pencil className="size-4 text-white" />
                  <span>Mettre à jour</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-white" />
                  <span>Enregistrer</span>
                </div>
              )}
            </Button>

            {footerActions && footerActions}
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
