import { Router } from "express";
import { employeeDirectoryService } from "../services/employee-directory.service";
import { authenticate } from "src/middlewares/authenticate";
import UserModel from "src/modules/auth/models/user.model";
import { catchError } from "src/utils/catch-error";
import { normalizeMatricule } from "src/utils/formalize-matricule";

export const employeeRouter = Router();

employeeRouter.get("/search", async (req, res) => {
  const q = String(req.query.q || "");
  const data = await employeeDirectoryService.search(q);
  res.json({ data });
});

employeeRouter.get("/enriched-search", authenticate, async (req, res) => {
  const q = String(req.query.q || "");
  const limit = Number(req.query.limit || 10);

  // 1) Search RH
  const employees = await employeeDirectoryService.search(q, limit);

  // 2) Pull matching Mongo users by matriculation
  const matricules = employees
    .map((e) => normalizeMatricule(e.matricule))
    .filter(Boolean);
  const users = await UserModel.find({
    matriculation: { $in: matricules },
    isDeleted: { $ne: true },
  }).select("matriculation status role is2FAValidated is2FAEnabled lastLogin");

  const map = new Map(
    users.map((u) => [normalizeMatricule(u.matriculation), u])
  );

  // 3) Merge
  const data = employees.map((e) => {
    const m = normalizeMatricule(e.matricule);
    const u = map.get(m);

    return {
      matricule: m,
      firstName: e.firstName,
      lastName: e.lastName,
      direction: e.direction,
      fonction: e.fonction,
      sigem: u
        ? {
            exists: true,
            status: u.status,
            role: u.role,
            is2FAValidated: u.is2FAValidated,
            is2FAEnabled: u.is2FAEnabled,
            lastLogin: u.lastLogin,
          }
        : { exists: false },
    };
  });

  res.json({ data });
});

employeeRouter.get("/:matricule", authenticate, async (req, res) => {
  const matricule = String(req.params.matricule);
  const data = await employeeDirectoryService.findByMatricule(matricule);
  res.json({ data });
});

employeeRouter.get(
  "/",
  authenticate,
  catchError(async (req, res) => {
    const { q, limit, page, direction, fonction } = req.query as any;

    const result = await employeeDirectoryService.list({
      q: q ? String(q) : undefined,
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
      direction: direction ? String(direction) : undefined,
      fonction: fonction ? String(fonction) : undefined,
    });

    res.json(result);
  })
);
