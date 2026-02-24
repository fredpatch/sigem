import * as React from "react";

export function HelpArticle({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {updatedAt ? (
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {updatedAt}
          </p>
        ) : null}
      </header>

      <div className="rounded-xl border bg-background p-4">{children}</div>
    </article>
  );
}
