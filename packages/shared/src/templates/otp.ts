import { escapeHtml } from "./email";

export type OtpEmailParams = {
  code: string;
  expiresInMinutes: number;
  userName?: string;
  appName?: string;
};

/**
 * Build OTP email template
 */
export function buildOtpEmailTemplate(params: OtpEmailParams) {
  const { code, expiresInMinutes, userName, appName = "SIGEM" } = params;

  return {
    subject: `Votre code de sécurité ${appName}`,
    html: `
<div style="font-family: Arial, Helvetica, sans-serif; background:#f6f7f9; padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px">
    
    <h2 style="margin-top:0;color:#111">
      Code de vérification
    </h2>

    <p style="color:#333">
      ${userName ? `Bonjour <strong>${escapeHtml(userName)}</strong>,` : "Bonjour,"}
    </p>

    <p style="color:#333">
      Voici votre code de sécurité pour vous connecter à <strong>${appName}</strong> :
    </p>

    <div style="text-align:center;margin:24px 0">
      <div style="
        display:inline-block;
        padding:14px 24px;
        font-size:28px;
        letter-spacing:6px;
        font-weight:bold;
        background:#111;
        color:#fff;
        border-radius:6px;
      ">
        ${escapeHtml(code)}
      </div>
    </div>

    <p style="color:#333">
      Ce code est valable pendant <strong>${expiresInMinutes} minutes</strong>.
    </p>

    <p style="color:#b00020;font-weight:bold">
      ⚠️ Ne partagez jamais ce code avec qui que ce soit.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>

    <p style="font-size:12px;color:#666">
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
    </p>

  </div>

  <p style="text-align:center;font-size:12px;color:#999;margin-top:12px">
    Message automatique - merci de ne pas répondre.
  </p>
</div>
`,
    text: `
${appName} - Code de sécurité

Votre code de vérification : ${code}

Ce code est valable pendant ${expiresInMinutes} minutes.

Ne partagez jamais ce code avec qui que ce soit.
Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
`,
  };
}
