import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { UserDirectorySidebar } from "@/modules/users/_components/user-directory.sidebar";
import { Outlet } from "react-router-dom";

export const UserManagementLayout = () => {
  return (
    <PageSplitLayout
      className="xl:w-[480px]"
      title="Gestion des utilisateurs"
      subtitle="Administrez les comptes utilisateurs de l’application"
      sidebarContent={<UserDirectorySidebar key={"dir"} />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};
