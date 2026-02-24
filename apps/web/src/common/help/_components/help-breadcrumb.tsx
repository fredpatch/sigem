import { Link, useParams } from "react-router-dom";
import { HELP_SECTIONS } from "../data/help-nav";

export function HelpBreadcrumb() {
  const { section, topic } = useParams();

  const s = HELP_SECTIONS.find((x) => x.slug === section);
  const t = s?.topics.find((x) => x.slug === topic);

  return (
    <nav className="mb-4 text-sm text-muted-foreground">
      <Link className="hover:underline" to="/help">
        Centre d’aide
      </Link>

      {s ? (
        <>
          <span className="mx-2">/</span>
          <Link className="hover:underline" to={`/help/${s.slug}`}>
            {s.title}
          </Link>
        </>
      ) : null}

      {t ? (
        <>
          <span className="mx-2">/</span>
          <span className="text-foreground">{t.title}</span>
        </>
      ) : null}
    </nav>
  );
}
