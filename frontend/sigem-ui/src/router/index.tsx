import { createBrowserRouter } from "react-router-dom";
import { AuthUI } from "@/modules/auth/pages/auth-ui";
import { MainLayout } from "@/components/shared/layouts/main-layout";
import HomePage from "@/pages/homepage";
import RouteGuard from "./protection";
import NotFoundPage from "@/pages/not-found";
import AuthLayout from "@/components/shared/layouts/auth-layout";
// import UserManagementPage from "@/pages/users-management.page";
import { RootRedirect } from "./root-redirect";
import CategoriesLayout from "@/components/shared/layouts/setting-layout";
import { CategorySection } from "@/modules/categories/table/category.table";
import { LocationSection } from "@/modules/locations/table/location.table";
import LocationLayout from "@/components/shared/layouts/location-layout";
import AssetLayout from "@/pages/asset-layout";
import { AssetMain } from "@/modules/assets/pages";
import VehiclesTasksLayout from "@/pages/vehicles-tasks-layout";
import { VehicleTasksPage } from "@/modules/vehicules/page/vehicle-tasks.page";
import { VehicleManagementPage } from "@/modules/vehicules/page/vehicle-management.page";
import VehiclesManagementLayout from "@/pages/vehicles-management-layout";
import { VehicleDocumentsLayout } from "@/pages/vehicle-documents-layout";
import { VehicleDocumentsPage } from "@/modules/vehicules/page/vehicle-documents.page";
import { NotificationsPage } from "@/modules/notifications/pages/notifications.page";
import { HelpCenterPage } from "@/common/help/help-center-page";
import { HelpLayout } from "@/common/help/pages/help-layout";
import { HelpHomePage } from "@/common/help/pages/help-home";
import ActivateAccountPage from "@/modules/auth/pages/activate-account.page";
import { UserManagementLayout } from "@/pages/user-management.layout";
import { UserWorkspacePage } from "@/pages/user-workspace.page";
import { UserRightEmptyState } from "@/pages/user-right-empty-state";
import MyVehiclePage from "@/pages/my-vehicle";
import { ProvidersLayout } from "@/pages/providers-layout";
import { ProvidersPage } from "@/modules/providers/pages/provider-page";
import { PurchaseRequestsPage } from "@/modules/providers/pages/purchase-requests.page";
import { PurchasesPage } from "@/modules/providers/pages/purchases.page";
import {
  ProductDetailPage,
  ProductsPage,
} from "@/modules/providers/pages/products.page";
import { ProductsLayout } from "@/pages/products-layout";
import { PurchasesLayout } from "@/pages/purchases-layout";
import { PurchaseRequestsLayout } from "@/pages/purchase-requests-layout";
<<<<<<< HEAD
=======
import { PurchaseDetailPage } from "@/modules/providers/_components/purchases/Purchase-details";
>>>>>>> a6056fc97e8e878a7d42a358acd11c2322d17f8a

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },

  {
    element: <MainLayout />,
    children: [
      {
        path: "/home",
        element: (
          <RouteGuard
            allowedRoles={[
              "SUPER_ADMIN",
              "ADMIN",
              "MG_COS",
              "MG_AGT",
              "MG_COB",
              "GUEST",
            ]}
          >
            <HomePage />
          </RouteGuard>
        ),
      },
      {
        element: <CategoriesLayout />,
        children: [
          {
            path: "/categories",
            element: (
              <RouteGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MG_COS"]}>
                <CategorySection />
              </RouteGuard>
            ),
          },
        ],
      },

      {
        element: <LocationLayout />,
        children: [
          {
            path: "/locations",
            element: (
              <RouteGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MG_COS"]}>
                <LocationSection />
              </RouteGuard>
            ),
          },
        ],
      },
      {
        element: <AssetLayout />,
        children: [
          {
            path: "/assets",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <AssetMain />
              </RouteGuard>
            ),
          },
        ],
      },
      {
        element: <VehiclesTasksLayout />,
        children: [
          {
            path: "/vehicle-tasks",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <VehicleTasksPage />
              </RouteGuard>
            ),
          },
        ],
      },
      {
        element: <VehiclesManagementLayout />,
        children: [
          {
            path: "/vehicle-management",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <VehicleManagementPage />
              </RouteGuard>
            ),
          },
        ],
      },
      {
        path: "/help",
        element: <HelpLayout />,
        children: [
          {
            index: true,
            element: <HelpHomePage />,
          },
          { path: ":section", element: <HelpCenterPage /> },
          { path: ":section/:topic", element: <HelpCenterPage /> },
        ],
      },
      {
        element: <VehicleDocumentsLayout />,
        children: [
          {
            path: "/vehicle-documents",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <VehicleDocumentsPage />
              </RouteGuard>
            ),
          },
        ],
      },
      {
        element: <ProvidersLayout />,
        children: [
          {
            path: "/providers",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <ProvidersPage />
              </RouteGuard>
            ),
          },
        ],
      },
      {
        path: "/products",
        element: <ProductsLayout />,
        children: [
          {
            index: true,
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <ProductsPage />
              </RouteGuard>
            ),
          },
          {
            path: ":id",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <ProductDetailPage />
              </RouteGuard>
            ),
          },
        ],
      },
      {
<<<<<<< HEAD
        element: <PurchasesLayout />,
        children: [
          {
            path: "/purchases",
=======
        path: "/purchases",
        element: <PurchasesLayout />,
        children: [
          {
            index: true,
>>>>>>> a6056fc97e8e878a7d42a358acd11c2322d17f8a
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <PurchasesPage />
              </RouteGuard>
            ),
          },
<<<<<<< HEAD
=======

          {
            path: ":id",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <PurchaseDetailPage />
              </RouteGuard>
            ),
          },
>>>>>>> a6056fc97e8e878a7d42a358acd11c2322d17f8a
        ],
      },
      {
        element: <PurchaseRequestsLayout />,
        children: [
          {
            path: "/purchase-requests",
            element: (
              <RouteGuard
                allowedRoles={[
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MG_COS",
                  "MG_AGT",
                  "MG_COB",
                ]}
              >
                <PurchaseRequestsPage />
              </RouteGuard>
            ),
          },
        ],
      },
      {
        path: "/users",
        element: (
          <RouteGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MG_COS"]}>
            <UserManagementLayout />
          </RouteGuard>
        ),
        children: [
          // {
          //   index: true,
          //   element: <UserManagementPage />,
          // },
          {
            index: true,
            element: <UserRightEmptyState />,
          },
          { path: ":matricule", element: <UserWorkspacePage /> },
        ],
      },

      {
        path: "/notifications",
        element: (
          <RouteGuard
            allowedRoles={[
              "SUPER_ADMIN",
              "ADMIN",
              "MG_COS",
              "MG_AGT",
              "MG_COB",
            ]}
          >
            <NotificationsPage />
          </RouteGuard>
        ),
      },

      {
        path: "/my-vehicle",
        element: (
          <RouteGuard
            allowedRoles={[
              "SUPER_ADMIN",
              "ADMIN",
              "MG_COS",
              "MG_AGT",
              "MG_COB",
              "GUEST",
            ]}
          >
            <MyVehiclePage />
          </RouteGuard>
        ),
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    // errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/login", element: <AuthUI /> },
      { path: "/activate", element: <ActivateAccountPage /> },
    ],
  },
]);

export default router;
