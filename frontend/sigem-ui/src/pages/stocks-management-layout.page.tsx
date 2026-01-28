import { Outlet } from "react-router-dom";

export const StocksManagementLayoutPage = () => {
  return (
    <div className="mx-auto p-4">
      Stocks Management Layout Page
      <Outlet />
    </div>
  );
};
