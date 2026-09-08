import { Resend } from 'resend';

/**
 * Single outbound-mail entry point (Resend).
 *
 * Resend renders no server-side templates for transactional sends, so the branded HTML lives
 * here in `renderPasswordResetEmail` and is version-controlled with the rest of the app.
 */

/** `RESEND_FROM_EMAIL` overrides this; the address must sit on a domain verified in Resend. */
const DEFAULT_FROM_ADDRESS = 'Atlas Review <noreply@prs-atlas.com>';

/**
 * A provider outage (revoked key, exhausted quota) previously looked exactly like a delivered
 * email. Callers check this window so every reply during an outage reports the outage, instead of
 * only the requests that happen to hit a real account — which would leak which emails are
 * registered.
 */
const OUTAGE_WINDOW_MS = 5 * 60 * 1000;
let outageUntil = 0;

/**
 * Account-level failures (revoked key, unverified sending domain, exhausted quota, provider
 * outage) break every send, so they open the window. A rejection of one message — a malformed
 * recipient, say — must not, or a single bad address would block resets for everyone. Resend
 * reports both kinds under the `validation_error` name, so the HTTP status is the usable signal.
 */
function isProviderLevelFailure(statusCode: number | null | undefined): boolean {
  if (typeof statusCode !== 'number') return true;
  if (statusCode === 401 || statusCode === 402 || statusCode === 403 || statusCode === 429) {
    return true;
  }
  return statusCode >= 500;
}

let client: Resend | null = null;
let clientKey = '';

export class EmailNotConfiguredError extends Error {
  constructor() {
    super('RESEND_API_KEY is not set');
    this.name = 'EmailNotConfiguredError';
  }
}

function apiKey(): string {
  return process.env.RESEND_API_KEY?.trim() ?? '';
}

export function emailIsConfigured(): boolean {
  return apiKey().length > 0;
}

export function emailProviderIsDown(): boolean {
  return Date.now() < outageUntil;
}

export function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_ADDRESS;
}

function resendClient(): Resend {
  const key = apiKey();
  if (!key) throw new EmailNotConfiguredError();
  // Recreate when the secret is rotated without a redeploy.
  if (!client || clientKey !== key) {
    client = new Resend(key);
    clientKey = key;
  }
  return client;
}

export type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/**
 * Sends one email, throwing on any provider failure so callers decide whether to surface it.
 * The Resend SDK resolves with `{ error }` instead of rejecting, so that is normalized here.
 */
export async function sendEmail(email: OutgoingEmail, label: string): Promise<string> {
  const resend = resendClient();

  const payload = {
    from: fromAddress(),
    to: email.to,
    subject: email.subject,
    text: email.text,
    ...(email.html ? { html: email.html } : {}),
    ...(email.replyTo ? { replyTo: email.replyTo } : {}),
  };

  let data: { id: string } | null;
  let error: { name?: string; message: string; statusCode?: number | null } | null;
  try {
    ({ data, error } = await resend.emails.send(payload));
  } catch (thrown) {
    // Network/DNS failures reject instead of resolving with `error`.
    outageUntil = Date.now() + OUTAGE_WINDOW_MS;
    console.error(`[${label}] Resend request failed:`, thrown);
    throw thrown;
  }

  if (error) {
    if (isProviderLevelFailure(error.statusCode)) {
      outageUntil = Date.now() + OUTAGE_WINDOW_MS;
    }
    console.error(`[${label}] Resend rejected the send:`, error);
    throw new Error(`Resend error (${error.name ?? 'unknown'}): ${error.message}`);
  }

  outageUntil = 0;
  console.log(`[${label}] Email sent to ${email.to} (resend id ${data?.id ?? 'unknown'})`);
  return data?.id ?? '';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PAGE_BACKGROUND = '#f7f7f5';
const CARD_BACKGROUND = '#ffffff';
const CARD_BORDER = '#e8e7e3';
const HEADING_COLOR = '#171717';
const BODY_COLOR = '#3f3f46';
const MUTED_COLOR = '#73736e';
const ACCENT_COLOR = '#1e5aa8';
const BUTTON_COLOR = '#1e5aa8';
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Circular mark used in branded mail. PNG (not SVG) so Outlook and Gmail render it. */
export const EMAIL_LOGO_PATH = '/atlas-logo-circle.png';
const EMAIL_LOGO_PX = 144;

export type PasswordResetEmailContent = {
  subject: string;
  html: string;
  text: string;
};

/**
 * Branded password-reset email. Table-based with inline styles because Outlook and Gmail strip
 * embedded stylesheets and ignore flexbox.
 */
export function renderPasswordResetEmail(params: {
  productName: string;
  resetUrl: string;
  logoUrl: string;
  loginUrl: string;
  supportEmail: string;
  expiresInMinutes: number;
}): PasswordResetEmailContent {
  const { productName, resetUrl, logoUrl, loginUrl, supportEmail, expiresInMinutes } = params;
  const safeProduct = escapeHtml(productName);
  const safeResetUrl = escapeHtml(resetUrl);
  const safeLogoUrl = escapeHtml(logoUrl);
  const safeSupport = escapeHtml(supportEmail);
  const expiryLabel =
    expiresInMinutes % 60 === 0 && expiresInMinutes >= 60
      ? `${expiresInMinutes / 60} hour${expiresInMinutes === 60 ? '' : 's'}`
      : `${expiresInMinutes} minutes`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>Password reset</title>
  </head>
  <body style="margin:0; padding:0; background-color:${PAGE_BACKGROUND}; font-family:${FONT_STACK};">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Reset your ${safeProduct} password. This link expires in ${expiryLabel}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE_BACKGROUND};">
      <tr>
        <td align="center" style="padding:48px 16px 40px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:560px;">
            <tr>
              <td align="center" style="padding:8px 24px 0 24px;">
                <img src="${safeLogoUrl}" width="${EMAIL_LOGO_PX}" height="${EMAIL_LOGO_PX}" alt="${safeProduct}" style="display:block; width:${EMAIL_LOGO_PX}px; height:${EMAIL_LOGO_PX}px; border:0; outline:none; text-decoration:none; border-radius:50%;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 24px 36px 24px; font-family:${FONT_STACK}; font-size:13px; font-weight:500; letter-spacing:0.32em; text-transform:uppercase; color:${HEADING_COLOR};">
                ${safeProduct}
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CARD_BACKGROUND}; border:1px solid ${CARD_BORDER}; border-radius:16px;">
                  <tr>
                    <td align="center" style="padding:40px 36px 8px 36px; font-family:${FONT_STACK}; font-size:26px; line-height:1.25; font-weight:600; letter-spacing:-0.02em; color:${HEADING_COLOR};">
                      Password reset
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:16px 36px 8px 36px; font-family:${FONT_STACK}; font-size:16px; line-height:1.65; color:${BODY_COLOR};">
                      Click the button below to create a new password. If you did not request this, you can ignore this email.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:28px 36px 40px 36px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" bgcolor="${BUTTON_COLOR}" style="background-color:${BUTTON_COLOR}; border-radius:8px;">
                            <a href="${safeResetUrl}" style="display:inline-block; padding:14px 36px; font-family:${FONT_STACK}; font-size:15px; font-weight:600; letter-spacing:0.02em; color:#ffffff; text-decoration:none; border-radius:8px;">Reset password</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 28px 8px 28px; font-family:${FONT_STACK}; font-size:13px; line-height:1.65; color:${MUTED_COLOR};">
                This link can only be used once and expires in ${expiryLabel}.
                <br />
                If the button does not work, paste this address into your browser:
                <br />
                <a href="${safeResetUrl}" style="color:${ACCENT_COLOR}; word-break:break-all;">${safeResetUrl}</a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 28px 8px 28px; font-family:${FONT_STACK}; font-size:13px; line-height:1.65; color:${MUTED_COLOR};">
                Need help? Contact <a href="mailto:${safeSupport}" style="color:${ACCENT_COLOR};">${safeSupport}</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${productName} — Password Reset`,
    '',
    'Please open the link below to create a new password. If you did not submit this request, you can ignore this email.',
    '',
    resetUrl,
    '',
    `This link can only be used once and expires in ${expiryLabel}.`,
    `Sign in page: ${loginUrl}`,
    `Need help? Contact ${supportEmail}.`,
  ].join('\n');

  return { subject: `Reset your ${productName} password`, html, text };
}
