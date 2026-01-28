import { Router } from "express";
import { SupplierPriceController } from "../controllers/supplier-price.controller";
import { SupplyItemController } from "../controllers/supply-item.controller";
import { SupplyPlanController } from "../controllers/supply-plan.controller";
import { authorizedRoles } from "../../../middlewares/authorized-roles";
import { authenticate } from "../../../middlewares/authenticate";
import { SupplyDashboardController } from "../controllers/supply-dashboard.controller";

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
  router.post("/items", items.create.bind(items));
  router.patch("/items/:id", items.update.bind(items));
  router.patch("/items/:id/disable", items.disable.bind(items));
  router.patch("/items/:id/enable", items.enable.bind(items));

  /**
   * SUPPLIER PRICES
   * On privilégie upsert pour éviter doublons (supplierId,itemId unique)
   */
  router.get("/prices", prices.list.bind(prices));
  router.get("/prices/:id", prices.getById.bind(prices));
  router.post("/prices/upsert", prices.upsert.bind(prices));
  router.patch("/prices/:id", prices.update.bind(prices));
  router.delete("/prices/:id", prices.remove.bind(prices));

  /**
   * SUPPLY PLANS
   */
  router.get("/plans", plans.list.bind(plans));
  router.get("/plans/:id", plans.getById.bind(plans));
  router.post("/plans", plans.create.bind(plans));
  router.patch("/plans/:id", plans.update.bind(plans));

  // Actions
  router.post("/plans/:id/status", plans.changeStatus.bind(plans));
  router.post("/plans/:id/auto-price", plans.autoPrice.bind(plans));
  router.post("/plans/:id/cancel", plans.cancel.bind(plans));

  // Dashboard stats
  router.get("/dashboard", dashboard.getDashboard.bind(dashboard));
  router.get("/dashboard/side", dashboard.supplySideKpis.bind(dashboard));

  return router;
}
