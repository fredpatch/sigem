import { Badge } from "@/components/ui/badge";
import { getExpiryBadge } from "@/utils/helpers";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formatDate = (iso?: string | Date | null) => {
  if (!iso) return "N/A";
  try {
    return format(new Date(iso), "dd/MM/yyyy", { locale: fr });
  } catch {
    return "N/A";
  }
};

export const ComplianceCard = ({
  title,
  doc,
}: {
  title: string;
  doc?: {
    reference?: string | null;
    issuedAt?: string | null;
    expiresAt?: string | null;
  };
}) => {
  const b = getExpiryBadge(doc?.expiresAt ?? null);

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">{title}</p>
        <Badge variant={b.variant} className="text-[10px]">
          {b.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-1">
        <p className="mt-2 text-xs text-muted-foreground">
          Réf :{" "}
          {doc?.reference ? (
            <span className="font-mono text-foreground">{doc.reference}</span>
          ) : (
            "-"
          )}
        </p>

        <p className="text-xs text-muted-foreground">
          Délivrée : {formatDate(doc?.issuedAt as any)}
        </p>

        <p className="text-xs text-muted-foreground">
          Expire : {formatDate(doc?.expiresAt as any)}
        </p>
      </div>
    </div>
  );
};
