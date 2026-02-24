import { useParams } from "react-router-dom";
import { HELP_SECTIONS } from "../data/help-nav";

export function HelpTopicPage() {
  const { section, topic } = useParams();

  const s = HELP_SECTIONS.find((x) => x.slug === section);
  const t = s?.topics.find((x) => x.slug === topic);

  if (!s || !t) return <div>Article introuvable.</div>;

  return (
    <article className="space-y-3">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <p className="text-muted-foreground">
        (Contenu à rédiger) — {s.title} / {t.title}
      </p>
    </article>
  );
}
