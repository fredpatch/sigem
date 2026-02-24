import { sendEmail } from "../services/mail.service";
import { buildOtpEmailTemplate } from "@sigem/shared/templates";

export async function sendOtpEmail(params: {
    to: string;
    code: string;
    expiresInMinutes: number;
    userName?: string;
}) {
    const email = buildOtpEmailTemplate({
        code: params.code,
        expiresInMinutes: params.expiresInMinutes,
        userName: params.userName,
    })

    await sendEmail({
        to: params.to,
        subject: email.subject,
        html: email.html,
        text: email.text
    })
}
// text: `Votre code de sécurité est : ${params.code}. Il est valable pendant ${params.expiresInMinutes} minutes. Ne partagez jamais ce code avec qui que ce soit.`,