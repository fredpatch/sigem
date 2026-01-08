import { NavLink, useLocation } from "react-router-dom";
import { HELP_SECTIONS } from "../data/help-nav";
import { cn } from "@/lib/utils";

export function HelpSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="rounded-xl border bg-background p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold">Centre d’aide</h2>
        <p className="text-xs text-muted-foreground">
          Guides & procédures d’utilisation
        </p>
      </div>

      <div className="space-y-4">
        {HELP_SECTIONS.map((section) => (
          <div key={section.slug}>
            <NavLink
              to={`/help/${section.slug}`}
              className={({ isActive }) =>
                cn(
                  "block text-sm font-medium hover:underline",
                  isActive && "text-primary"
                )
              }
            >
              {section.title}
            </NavLink>

            <div className="mt-2 space-y-1 pl-2">
              {section.topics.map((t) => {
                const href = `/help/${section.slug}/${t.slug}`;
                const active = pathname === href;

                return (
                  <NavLink
                    key={t.slug}
                    to={href}
                    className={cn(
                      "block rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                      active && "bg-muted text-foreground"
                    )}
                  >
                    {t.title}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
