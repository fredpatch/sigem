import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import { authorizedRoles } from "../../../middlewares/authorized-roles";
import { StockController } from "../controller/stock.controller";
import { StockLocationController } from "../controller/stock-location.controller";
import { SupplierPriceController } from "../controller/supplier-price.controller";

const canWrite = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN",
);

export default function stockRoutes() {
  const router = Router();
  router.use(authenticate);
  router.use(canWrite);

  const stocks = new StockController();
  const location = new StockLocationController();
  const supplier = new SupplierPriceController();

  router.get("/", stocks.listStocks.bind(stocks));
  router.get("/movements", stocks.listMovements.bind(stocks));
  router.post("/movements", stocks.createMovement.bind(stocks));

  /**
   * Stock location init
   */
  router.get("/locations", location.getStockLocations.bind(location));
  router.post("/locations/init", location.initStockLocations.bind(location));

  /**
   * Supplier Price Lookup (for unit cost resolution in stock movements)
   */
  router.get(
    "/supplier-prices/lookup",
    supplier.lookupSupplierPrice.bind(supplier),
  );

  /**
   * Kpi
   */
  router.get("/kpis", stocks.getKpis.bind(stocks));

  /**
   * Seuil/Alerte
   */
  router.patch("/min-level", stocks.setLevel.bind(stocks));

  return router;
}
