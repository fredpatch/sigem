import { useParams } from "react-router-dom";
import { HELP_SECTIONS } from "../data/help-nav";

export function HelpSectionPage() {
  const { section } = useParams();
  const s = HELP_SECTIONS.find((x) => x.slug === section);

  if (!s) return <div>Section introuvable.</div>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">{s.title}</h1>
      {s.description ? (
        <p className="text-muted-foreground">{s.description}</p>
      ) : null}
      <div className="text-sm text-muted-foreground">
        Choisissez un sujet dans le menu de gauche.
      </div>
    </div>
  );
}
