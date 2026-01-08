import { useParams, Link } from "react-router-dom";
import { HELP_SECTIONS } from "./data/help-nav";
// import { HELP_ARTICLES } from "./content/help-articles";
// import { HelpBreadcrumb } from "./components/help-breadcrumb";
// import { HelpArticle } from "./components/help-article";
import { Button } from "@/components/ui/button";
import { HelpBreadcrumb } from "./_components/help-breadcrumb";
import { HELP_ARTICLES } from "./_components/content/help-article";
import { HelpArticle } from "./_components/content/help-article-wrapper";

export function HelpCenterPage() {
  const { section, topic } = useParams();

  const s = HELP_SECTIONS.find((x) => x.slug === section);
  const t = s?.topics.find((x) => x.slug === topic);

  // /help/:section
  if (s && !topic) {
    return (
      <div className="space-y-2">
        <HelpBreadcrumb />
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="text-muted-foreground">
          {s.description ?? "Choisissez un sujet dans le menu de gauche."}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.topics.map((tp) => (
            <Link
              key={tp.slug}
              to={`/help/${s.slug}/${tp.slug}`}
              className="rounded-xl border bg-background p-4 hover:bg-muted"
            >
              <div className="text-sm font-semibold">{tp.title}</div>
              {tp.summary ? (
                <div className="mt-1 text-sm text-muted-foreground">
                  {tp.summary}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // /help/:section/:topic
  if (s && t) {
    const key = `${s.slug}/${t.slug}` as const;
    const article = HELP_ARTICLES[key];

    return (
      <div className="space-y-2">
        <HelpBreadcrumb />

        {article ? (
          <HelpArticle title={article.title} updatedAt={article.updatedAt}>
            {article.content}
          </HelpArticle>
        ) : (
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">
              Cet article n’est pas encore rédigé.
            </p>
            <Button asChild variant="outline">
              <Link to={`/help/${s.slug}`}>Retour à {s.title}</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <HelpBreadcrumb />
      <p>Article introuvable.</p>
    </div>
  );
}
