import { ModalGlobalProvider } from "@/providers/modal-providers";
import RouteGuard from "@/router/protection";
import { Outlet } from "react-router-dom";
import { SideNavBar } from "./sidebar-layout";

export function MainLayout() {
  return (
    <>
      <div className="flex flex-row h-screen w-screen">
        <SideNavBar />
        <main className="flex h-screen ml-12 w-full overflow-auto p-8 mx-auto">
          <RouteGuard>
            <>
              <ModalGlobalProvider />
              <Outlet />
            </>
          </RouteGuard>
        </main>
      </div>
    </>
  );
}
