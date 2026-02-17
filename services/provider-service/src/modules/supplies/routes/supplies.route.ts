import { Router } from "express";
import { SupplierPriceController } from "../controllers/supplier-price.controller";
import { SupplyItemController } from "../controllers/supply-item.controller";
import { SupplyPlanController } from "../controllers/supply-plan.controller";
import { authorizedRoles } from "../../../middlewares/authorized-roles";
import { authenticate } from "../../../middlewares/authenticate";
import { SupplyDashboardController } from "../controllers/supply-dashboard.controller";
import { audit } from "../../../middlewares/audit";

const canWrite = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN",
);

export default function suppliesRoutes() {
  const router = Router();
  router.use(authenticate);
  router.use(canWrite);

  const items = new SupplyItemController();
  const prices = new SupplierPriceController();
  const plans = new SupplyPlanController();
  const dashboard = new SupplyDashboardController();

  /**
   * ITEMS
   */
  router.get("/items", items.list.bind(items));
  router.get("/items/:id", items.getById.bind(items));
  router.post(
    "/items",
    audit("create", "supply_item"),
    items.create.bind(items),
  );
  router.patch(
    "/items/:id",
    audit("update", "supply_item"),
    items.update.bind(items),
  );
  router.patch(
    "/items/:id/disable",
    audit("update", "supply_item"),
    items.disable.bind(items),
  );
  router.patch(
    "/items/:id/enable",
    audit("update", "supply_item"),
    items.enable.bind(items),
  );

  /**
   * SUPPLIER PRICES
   * On privilégie upsert pour éviter doublons (supplierId,itemId unique)
   */
  router.get("/prices", prices.list.bind(prices));
  router.get("/prices/:id", prices.getById.bind(prices));
  router.post(
    "/prices/upsert",
    audit("upsert", "supplier_price"),
    prices.upsert.bind(prices),
  );
  router.patch(
    "/prices/:id",
    audit("update", "supplier_price"),
    prices.update.bind(prices),
  );
  router.delete(
    "/prices/:id",
    audit("delete", "supplier_price"),
    prices.remove.bind(prices),
  );

  /**
   * SUPPLY PLANS
   */
  router.get("/plans", plans.list.bind(plans));
  router.get(
    "/plans/:id",
    audit("read", "supply_plan"),
    plans.getById.bind(plans),
  );
  router.post(
    "/plans",
    audit("create", "supply_plan"),
    plans.create.bind(plans),
  );
  router.patch(
    "/plans/:id",
    audit("update", "supply_plan"),
    plans.update.bind(plans),
  );

  // Actions
  router.post(
    "/plans/:id/status",
    audit("update", "supply_plan"),
    plans.changeStatus.bind(plans),
  );
  router.post(
    "/plans/:id/auto-price",
    audit("update", "supply_plan"),
    plans.autoPrice.bind(plans),
  );
  router.post(
    "/plans/:id/cancel",
    audit("update", "supply_plan"),
    plans.cancel.bind(plans),
  );

  // Dashboard stats
  router.get("/dashboard", dashboard.getDashboard.bind(dashboard));
  router.get("/dashboard/side", dashboard.supplySideKpis.bind(dashboard));

  return router;
}
