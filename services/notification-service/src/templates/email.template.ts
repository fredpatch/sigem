export function buildSimpleEmail(opt: { title: string; message: string; ctaUrl?: string; }) {
    const { title, message, ctaUrl } = opt;

    return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5">
    <h2 style="margin:0 0 12px">${escapeHtml(title)}</h2>
    <p style="margin:0 0 16px">${escapeHtml(message)}</p>
    ${ctaUrl
            ? `<p><a href="${ctaUrl}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Ouvrir dans SIGEM</a></p>`
            : ""
        }
    <hr style="margin:20px 0;border:none;border-top:1px solid #eee"/>
    <small style="color:#666">Message automatique — ne pas répondre.</small>
  </div>
  `;
}

export function escapeHtml(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}