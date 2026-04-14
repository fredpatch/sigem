import { CookieOptions, Response } from "express";

export const REFRESH_PATH = "/auth/refresh";

const isTruthy = (value?: string) =>
  ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());

const explicitCookieSecure = process.env.COOKIE_SECURE?.trim();
const secure =
  explicitCookieSecure !== undefined
    ? isTruthy(explicitCookieSecure)
    : (process.env.PUBLIC_URL ?? "").trim().startsWith("https://");

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure,
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  maxAge: 60 * 60 * 1000, // 1h
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  // path: REFRESH_PATH,
});

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) =>
  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

export const clearAuthCookies = (res: Response) =>
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: REFRESH_PATH });
