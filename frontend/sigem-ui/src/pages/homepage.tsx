import { MGMonitoringOverview } from "@/components/shared/layouts/monitoring-overview";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";
import GuestHome from "./guest-home";

const HomePage = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === ("GUEST" as any)) {
    return <GuestHome />;
  }
  return (
    <div className="mx-auto">
      <MGMonitoringOverview />
    </div>
  );
};

export default HomePage;
