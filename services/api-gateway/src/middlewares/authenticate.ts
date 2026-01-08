import type { Request, Response, NextFunction } from "express";
import * as cookie from "cookie";
import { jwtService } from "@sigem/shared/auth/jwt";
import { JwtUserPayload } from "@sigem/shared";

const cfg = {
  accessSecret: process.env.JWT_SECRET!,
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
      sessionId: payload.sessionId,
      username: payload.username,
      role: payload.role,
      matriculation: payload.matriculation,
    };

    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
