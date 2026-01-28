// supply-dashboard.controller.ts
import { Request, Response } from "express";
import { SupplyDashboardService } from "../services/supply-dashboard.service";
import { catchError } from "../../../utils/catch-error";

export interface SupplyDashboardKpis {
  plans: {
    total: number;
    activeCount: number;
    activeLinesCount: number;
    linesMissingPrice: number;
    byStatus: Record<string, number>;
  };

  prices: {
    totalPrices: number;
    itemsWithPrice: number;
    totalItems: number;
    coveragePct: number;
    stalePricesCount: number;
    missingItemsCount: number;
    lastUpdateAt?: Date;
  };

  top: {
    items: Array<{ itemId: string; label: string; count: number }>;
    suppliers: Array<{ supplierId: string; name: string; count: number }>;
  };
}

export class SupplyDashboardController {
  private service = new SupplyDashboardService();

  getDashboard = catchError(async (req, res) => {
    const { from, to } = req.query as any;
    const dto = await this.service.getDashboard({
      from: typeof from === "string" ? from : undefined,
      to: typeof to === "string" ? to : undefined,
    });
    return res.json({ data: dto });
  });

  supplySideKpis = catchError(async (req, res) => {
    const days = parseInt(req.query.days as string) || 30;
    const dto = await this.service.getSideKpis({ days });
    return res.json({ data: dto });
  });
}
