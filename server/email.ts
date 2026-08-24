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

const PAGE_BACKGROUND = '#f4f4f5';
const CARD_BORDER = '#e4e4e7';
const HEADING_COLOR = '#18181b';
const BODY_COLOR = '#3f3f46';
const MUTED_COLOR = '#71717a';
const ACCENT_COLOR = '#1a3aa0';
const BUTTON_COLOR = '#16257c';
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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
    <title>Password Reset</title>
  </head>
  <body style="margin:0; padding:0; background-color:${PAGE_BACKGROUND}; font-family:${FONT_STACK};">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Reset your ${safeProduct} password. This link expires in ${expiryLabel}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE_BACKGROUND};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">
            <tr>
              <td align="center" style="padding:24px 24px 8px 24px;">
                <img src="${safeLogoUrl}" width="96" height="96" alt="${safeProduct}" style="display:block; width:96px; height:96px; border:0; outline:none; text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 24px 24px 24px; font-family:${FONT_STACK}; font-size:19px; font-weight:700; color:${HEADING_COLOR};">
                The ${safeProduct}
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border:1px solid ${CARD_BORDER};">
                  <tr>
                    <td align="center" style="padding:36px 32px; border-bottom:1px solid ${CARD_BORDER}; font-family:${FONT_STACK}; font-size:34px; line-height:1.2; font-weight:600; color:${HEADING_COLOR};">
                      Password Reset
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:32px; border-bottom:1px solid ${CARD_BORDER}; font-family:${FONT_STACK}; font-size:16px; line-height:1.6; color:${BODY_COLOR};">
                      Please click the reset password button below to create a new password. If you did not submit this request, you can ignore this email.
                      <div style="padding-top:24px; font-size:20px; font-weight:700; color:${ACCENT_COLOR};">Thank you!</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:32px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" bgcolor="${BUTTON_COLOR}" style="background-color:${BUTTON_COLOR};">
                            <a href="${safeResetUrl}" style="display:inline-block; padding:16px 44px; font-family:${FONT_STACK}; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 24px 8px 24px; font-family:${FONT_STACK}; font-size:13px; line-height:1.6; color:${MUTED_COLOR};">
                This link can only be used once and expires in ${expiryLabel}.
                <br />
                If the button does not work, paste this address into your browser:
                <br />
                <a href="${safeResetUrl}" style="color:${ACCENT_COLOR}; word-break:break-all;">${safeResetUrl}</a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 24px 24px 24px; font-family:${FONT_STACK}; font-size:13px; line-height:1.6; color:${MUTED_COLOR};">
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
    `The ${productName} — Password Reset`,
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
