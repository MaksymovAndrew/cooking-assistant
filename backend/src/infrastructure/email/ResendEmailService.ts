import emailContent from "i18n/locales/en/email.json";

import { logger } from "config/logger";

import type { EmailSender } from "application/ports/EmailSender";

const RESEND_API_URL = "https://api.resend.com/emails";

const BODY_FONT_STACK =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
// serif fallback stack, no webfont - email clients can't reliably load the app's Fraunces display font
const HEADING_FONT_STACK = "Georgia,'Iowan Old Style','Times New Roman',serif";

const BG_WASH = "#f4f1fa";
const BRAND_COLOR = "#7e60bf";
const INK_COLOR = "#241b33";
const BODY_COLOR = "#5b5470";
const MUTED_COLOR = "#9691a8";
const DIVIDER_COLOR = "#ece7f6";

const TEXT_STYLE = `margin:0 0 28px;color:${BODY_COLOR};font-size:15px;line-height:1.6;`;
const BUTTON_STYLE = `display:inline-block;padding:13px 28px;background-color:${BRAND_COLOR};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;`;

// bowl + steam mark (Compact tier of frontend/src/components/icons/DonburiMarkCompact.tsx), stroke hardcoded since
// currentColor inheritance can't be relied on across email clients
const BRAND_MARK_SVG = `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="${BRAND_COLOR}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M12.5 12.5c-1-1.2 1-2.2 0-3.4"/><path d="M19.5 12.5c-1-1.2 1-2.2 0-3.4"/><path d="M5 15h22"/><path d="M5 15a11 11 0 0 0 22 0"/></svg>`;

interface EmailCopy {
    heading: string;
    body: string;
    button: string;
    footer: string;
}

// inline styles only - email clients strip <style> tags and ignore external CSS/webfonts
function emailShell(heading: string, bodyHtml: string, footer: string) {
    return `<div style="margin:0;padding:40px 16px;background-color:${BG_WASH};font-family:${BODY_FONT_STACK};"><div style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;"><div style="height:4px;background-color:${BRAND_COLOR};"></div><div style="padding:40px 40px 32px;text-align:center;"><div style="margin:0 0 28px;">${BRAND_MARK_SVG}<span style="display:inline-block;vertical-align:middle;margin-left:8px;color:${BRAND_COLOR};font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${emailContent.brandName}</span></div><h1 style="margin:0 0 16px;color:${INK_COLOR};font-family:${HEADING_FONT_STACK};font-size:24px;font-weight:600;">${heading}</h1>${bodyHtml}</div><div style="border-top:1px solid ${DIVIDER_COLOR};padding:24px 40px;text-align:center;"><p style="margin:0;color:${MUTED_COLOR};font-size:13px;line-height:1.5;">${footer}</p></div></div></div>`;
}

function contentHtml(link: string, copy: EmailCopy): string {
    return emailShell(
        copy.heading,
        `<p style="${TEXT_STYLE}">${copy.body}</p><a href="${link}" style="${BUTTON_STYLE}">${copy.button}</a>`,
        copy.footer,
    );
}

// Resend's REST API via native fetch (Node 22) - no SDK dependency needed for a single POST
export default class ResendEmailService implements EmailSender {
    constructor(
        private apiKey: string,
        private from: string,
    ) {}

    async sendPasswordResetEmail(to: string, link: string): Promise<void> {
        await this.send(
            to,
            emailContent.passwordReset.subject,
            contentHtml(link, emailContent.passwordReset),
        );
    }

    async sendVerificationEmail(to: string, link: string): Promise<void> {
        await this.send(
            to,
            emailContent.verification.subject,
            contentHtml(link, emailContent.verification),
        );
    }

    private async send(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        const response = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ from: this.from, to, subject, html }),
        });

        if (!response.ok) {
            const body = await response.text();

            logger.error(
                { status: response.status, body },
                "Resend email send failed",
            );
            throw new Error("Failed to send email");
        }
    }
}
