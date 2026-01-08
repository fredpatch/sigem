export const log = (...args: any[]) =>
  process.env.NODE_ENV === "production" ? null : console.log("[GW]", ...args);
