import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageSplitLayoutProps {
  title: string;
  subtitle?: string;
  className?: string;
  actions?: ReactNode;
  sidebarContent?: ReactNode; // stats, filters, etc.
  children: ReactNode; // main content (usually <Outlet />)
}

/**
 * Generic 2-pane layout:
 * - Left: title + subtitle + actions + optional extra sidebarContent
 * - Right: main content
 *
 * Designed to live INSIDE MainLayout (which already handles h-screen + sidebar).
 */
export function PageSplitLayout({
  title,
  subtitle,
  actions,
  sidebarContent,
  children,
  className,
}: PageSplitLayoutProps) {
  return (
    <div className="flex w-full gap-6">
      {/* LEFT PANEL (sidebar style on desktop) */}
      <aside
        className={cn(
          "hidden lg:block w-[280px] xl:w-[320px] shrink-0 border-r pr-6",
          className
        )}
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>

          {actions && <div className="pt-1">{actions}</div>}

          {sidebarContent && <div className="space-y-3">{sidebarContent}</div>}
        </div>
      </aside>

      {/* MOBILE HEADER (same title/actions but stacked) */}
      <div className="w-full lg:hidden mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
        {sidebarContent && (
          <div className="mt-3 space-y-3">{sidebarContent}</div>
        )}
      </div>

      {/* RIGHT PANEL (main content) */}
      <main className="flex-1 min-w-0 hidden md:block">{children}</main>
    </div>
  );
}
