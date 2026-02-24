import { Outlet } from "react-router-dom";
import { HelpSidebar } from "../_components/help-sidebar";

export function HelpLayout() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <HelpSidebar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
