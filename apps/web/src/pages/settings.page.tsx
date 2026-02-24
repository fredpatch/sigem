import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="p-4 max-w-7xl">
      <div className="flex flex-col gap-4 items-center">
        <div className="flex gap-2 justify-between flex-row">
          <span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Location management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage locations option availabilities across the application.
            </p>
          </span>
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => console.log("Category setting")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
