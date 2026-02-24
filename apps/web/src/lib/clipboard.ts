import { toast } from "sonner";

export async function copyToClipboard(value: string, label = "Copié") {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(label);
  } catch {
    toast.error("Impossible de copier");
  }
}
