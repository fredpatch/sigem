import type { Request, Response, NextFunction } from "express";

export const authorizedRoles =
    (...roles: string[]) =>
        (req: Request, res: Response, next: NextFunction) => {
            const role = req.user?.role;

            if (!role) return res.status(401).json({ message: "Unauthorized" });
            if (!roles.includes(role))
                return res.status(403).json({ message: "Forbidden", need: roles });
            next();
        };
