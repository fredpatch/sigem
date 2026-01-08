import jwt from "jsonwebtoken";
import { JwtUserPayload } from "./types";

export interface JwtConfig {
  accessSecret: string; // JWT_SECRET
  refreshSecret?: string; // optionnel pour refresh
  refreshTtl?: string; // optionnel
}

class JWT {
  signAccessToken(data: JwtUserPayload, cfg: JwtConfig) {
    return jwt.sign(data, cfg.accessSecret, {
      expiresIn: "1h",
    });
  }

  verifyAccessToken<T extends JwtUserPayload = JwtUserPayload>(
    token: string,
    cfg: JwtConfig
  ): T {
    return jwt.verify(token, cfg.accessSecret) as T;
  }

  signRefreshToken(data: Pick<JwtUserPayload, "id">, cfg: JwtConfig) {
    if (!cfg.refreshSecret) throw new Error("Missing refreshSecret");
    return jwt.sign(data, cfg.refreshSecret, { expiresIn: "7d" });
  }

  verifyRefreshToken<T = { id: string }>(token: string, cfg: JwtConfig): T {
    if (!cfg.refreshSecret) throw new Error("Missing refreshSecret");
    return jwt.verify(token, cfg.refreshSecret) as T;
  }
}

export const jwtService = new JWT();
