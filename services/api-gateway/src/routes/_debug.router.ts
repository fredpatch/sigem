import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizedRoles } from "../middlewares/authorized-roles";

export const router = Router();

router.get(
  "/protected",
  authenticate,
  authorizedRoles("super_admin", "admin", "MG_COS", "MG_COB", "MG_AGT"),
  (req, res) => {
    res.json({ ok: true, user: req.user });
  }
);
