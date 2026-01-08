import "dotenv/config";

export const mailCOnfig = {
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    from: process.env.MAIL_FROM || "SIGEM <no-reply@anac-gabon.lan>",
    rejectUnauthorized: String(process.env.SMTP_REJECT_UNAUTH ?? "true") === "true",
}

export function assertMailConfig() {
    if (!mailCOnfig.host) {
        throw new Error("SMTP_HOST is not defined in environment variables");
    }
    if (!mailCOnfig.port || Number(mailCOnfig.port)) {
        throw new Error("SMTP_PORT is not defined or invalid in environment variables");
    }
}