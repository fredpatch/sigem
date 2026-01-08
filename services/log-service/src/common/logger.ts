import winston, { format } from "winston";

const { combine, timestamp, printf, colorize, align, json, prettyPrint, cli } =
  format;

const logFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH::mm A" }),
  printf(
    ({ timestamp, level, message }) =>
      `[${timestamp}]::[${level.toUpperCase()}]: ${message}`
  )
);

export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [new winston.transports.Console()],
});
