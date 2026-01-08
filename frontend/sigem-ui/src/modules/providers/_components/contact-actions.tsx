import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";
import { Copy, Phone, Mail } from "lucide-react";

type Props = {
  value: string;
  kind: "phone" | "email";
};

export function ContactActions({ value, kind }: Props) {
  const href = kind === "phone" ? `tel:${value}` : `mailto:${value}`;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() =>
          copyToClipboard(
            value,
            kind === "phone" ? "Numéro copié" : "Email copié"
          )
        }
        title="Copier"
      >
        <Copy className="h-4 w-4" />
      </Button>

      <a href={href} title={kind === "phone" ? "Appeler" : "Envoyer un email"}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {kind === "phone" ? (
            <Phone className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
        </Button>
      </a>
    </div>
  );
}
