import jwt, { VerifyOptions, SignOptions, JwtPayload } from "jsonwebtoken";
import { Audience } from "src/modules/types/auth.types";
import { SessionDocument } from "src/modules/auth/models/session.model";
import { UserDocument } from "src/modules/auth/models/user.model";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

export type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};

export type AccessTokenPayload = {
  username?: string;
  id: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
  role: UserDocument["role"];
  matriculation: UserDocument["matriculation"];
};

type SignOptionsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions & VerifyOptions = {
  audience: Audience.User, // 👈 single string, valid for both
};

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "1h",
  secret: JWT_SECRET,
};

export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

export class JWtService {
  static async signToken(
    payload: AccessTokenPayload | RefreshTokenPayload,
    options?: SignOptionsAndSecret
  ) {
    const { secret, ...signOpts } = options || accessTokenSignOptions;

    return jwt.sign(payload, secret, {
      ...defaults,
      ...signOpts,
      algorithm: "HS256",
    });
  }

  static async verifyToken<TPayload extends JwtPayload = AccessTokenPayload>(
    token: string,
    options?: VerifyOptions & { secret?: string }
  ): Promise<TPayload | null> {
    const { secret = JWT_SECRET, ...verifyOpts } = options || {};
    try {
      const decoded = jwt.verify(token, secret, {
        ...defaults,
        ...verifyOpts,
      });

      // silence jsonwebtoken’s messy typings safely
      return decoded as unknown as TPayload;
    } catch {
      return null; // invalid / expired token
    }
  }
}

export const jwtService = new JWtService();
