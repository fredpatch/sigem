import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { CountDownToast } from "@/components/shared/countdown-toast";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "outline";
  dangerIcon?: boolean;
  loading?: boolean;
  autoCloseDelay?: number;
};

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "Are you sure?",
    description: "This action cannot be undone.",
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmVariant: "destructive",
    dangerIcon: false,
    loading: false,
    autoCloseDelay: 0,
  });

  const resolverRef = useRef<(value: boolean) => void>(() => {});
  const toastIdRef = useRef<string | number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userHasRespondedRef = useRef(false);

  const cleanup = () => {
    setIsOpen(false);
    userHasRespondedRef.current = true;
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const confirm = useCallback((opts?: ConfirmOptions): Promise<boolean> => {
    const merged = {
      title: opts?.title ?? "Are you sure?",
      description: opts?.description ?? "This action cannot be undone.",
      confirmText: opts?.confirmText ?? "Confirm",
      cancelText: opts?.cancelText ?? "Cancel",
      confirmVariant: opts?.confirmVariant ?? "destructive",
      dangerIcon: opts?.dangerIcon ?? false,
      loading: opts?.loading ?? false,
      autoCloseDelay: opts?.autoCloseDelay ?? 0,
    };

    setOptions(merged);
    setIsOpen(true);
    userHasRespondedRef.current = false;

    if (merged.autoCloseDelay) {
      const toastId = toast.custom(
        (t: any) => (
          <CountDownToast
            duration={merged.autoCloseDelay}
            onTimeout={() => {
              if (!userHasRespondedRef.current) {
                resolverRef.current(false); // trigger auto cancel
                cleanup();
                toast.dismiss(t.id);
                toast.success("Cancelled automatically");
              }
            }}
          />
        ),
        {
          duration: merged.autoCloseDelay + 100,
          id: "countdown-toast",
        }
      );

      toastIdRef.current = toastId;
    }

    return new Promise((resolve) => {
      resolverRef.current = (val: boolean) => {
        if (!userHasRespondedRef.current) {
          userHasRespondedRef.current = true;
          resolve(val);
          cleanup();
        }
      };
    });
  }, []);

  const handleCancel = () => resolverRef.current(false);
  const handleConfirm = () => resolverRef.current(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Enter") handleConfirm();
      if (e.key === "Escape") handleCancel();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const ConfirmDialog = () => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {options.dangerIcon && (
              <AlertTriangle className="text-red-500 w-5 h-5" />
            )}
            {options.title}
          </DialogTitle>
          <DialogDescription>{options.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={options.loading}
          >
            {options.cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={options.confirmVariant}
            disabled={options.loading}
          >
            {options.loading ? "Please wait..." : options.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmDialog, confirm] as const;
};
