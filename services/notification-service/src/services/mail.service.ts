import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { mailCOnfig } from '../config/mail.config';

type SendEmailParams = {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
}

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

function getTransporter() {
    if (transporter) return transporter;

    const auth = mailCOnfig.user && mailCOnfig.pass ? {
        user: mailCOnfig.user,
        pass: mailCOnfig.pass,
    }
        : undefined;

    transporter = nodemailer.createTransport({
        host: mailCOnfig.host,
        port: mailCOnfig.port,
        secure: mailCOnfig.secure, // Only true for 465
        auth,
        tls: {
            rejectUnauthorized: mailCOnfig.rejectUnauthorized,
        }
    })

    return transporter;
}

export async function verifyMailer() {
    const t = getTransporter()
    await t.verify()
}

export async function sendEmail(params: SendEmailParams) {
    const t = getTransporter()

    const info = await t.sendMail({
        from: mailCOnfig.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
    })

    return { messageId: info.messageId, previewURL: nodemailer.getTestMessageUrl(info) }
}