import type { Request, Response, NextFunction } from "express";
import * as cookie from "cookie";
import { jwtService } from "@sigem/shared/auth/jwt";
import { JwtUserPayload } from "@sigem/shared";
import { Vehicle } from "src/models/vehicle.model";

const cfg = {
  accessSecret: process.env.JWT_SECRET || "dev-secret",
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.headers.cookie;
    if (!raw) return res.status(401).json({ message: "No cookies" });

    const cookies = cookie.parse(raw.replace(/;\\s+/g, ";").trim());
    const token = cookies.accessToken?.trim();
    if (!token) return res.status(401).json({ message: "Missing accessToken" });

    const payload = jwtService.verifyAccessToken<JwtUserPayload>(token, cfg);
    if (!payload?.id || !payload?.role)
      return res.status(401).json({ message: "Invalid token payload" });

    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      matriculation: payload.matriculation,
    };

    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

type Role = "MG_ADMIN" | "MG_COS" | "MG_AGENT" | "MG_COB" | "MG_AGT" | string;

const MG_ROLES: Role[] = ["MG_ADMIN", "MG_COS", "MG_AGENT", "MG_COB", "MG_AGT"];

export function isMgRole(role?: string) {
  return !!role && MG_ROLES.includes(role as Role);
}

export async function authorizeVehicleOwnerByMatricule(
  req: any,
  res: any,
  next: any
) {
  const user = (req as any).user as { matriculation?: string; role?: string };
  if (!user?.matriculation)
    return res.status(401).json({ message: "Unauthenticated" });

  // MG roles bypass ownership checks (for internal tools)
  if (isMgRole(user.role)) return next();

  const vehicleId = req.params.id;
  const vehicle = await Vehicle.findById(vehicleId).select(
    "assignedToEmployeeMatricule"
  );
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

  if (!vehicle.assignedToEmployeeMatricule) {
    return res.status(403).json({ message: "Vehicle is not assigned" });
  }

  if (
    String(vehicle.assignedToEmployeeMatricule) !== String(user.matriculation)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return next();
}
