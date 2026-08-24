/**
 * Checks the Resend configuration and, with an argument, sends a real password-reset email.
 *
 *   npm run verify:email                 # config + verified domains only
 *   npm run verify:email you@example.com # also sends the branded reset email to that address
 */
import { Resend } from 'resend';
import { emailIsConfigured, fromAddress, renderPasswordResetEmail, sendEmail } from '../email';

async function main(): Promise<void> {
  const recipient = process.argv[2]?.trim();

  if (!emailIsConfigured()) {
    console.error('RESEND_API_KEY is NOT set in this process.');
    console.error('Add it to Replit Secrets and restart the repl so the variable is exported.');
    process.exit(1);
  }
  console.log('RESEND_API_KEY: set');
  console.log('From address:  ', fromAddress());

  const resend = new Resend(process.env.RESEND_API_KEY!.trim());
  const { data, error } = await resend.domains.list();
  if (error) {
    console.error('Could not list domains:', error);
    console.error('If this is a "restricted_api_key" error the key only allows sending, which is fine.');
  } else {
    const domains = data?.data ?? [];
    if (domains.length === 0) {
      console.warn('No domains on this Resend account — only onboarding@resend.dev can send.');
    }
    for (const domain of domains) {
      console.log(`Domain: ${domain.name} — status ${domain.status} (${domain.region})`);
    }
    const fromDomain = fromAddress().split('@').pop()?.replace('>', '').trim();
    const match = domains.find((d) => d.name === fromDomain);
    if (fromDomain && domains.length > 0 && !match) {
      console.warn(
        `WARNING: from-address domain "${fromDomain}" is not on this account. ` +
          `Set RESEND_FROM_EMAIL to an address on a verified domain.`
      );
    } else if (match && match.status !== 'verified') {
      console.warn(`WARNING: domain "${fromDomain}" is not verified yet (status ${match.status}).`);
    }
  }

  if (!recipient) {
    console.log('\nNo recipient given, so no email was sent.');
    return;
  }

  const { subject, html, text } = renderPasswordResetEmail({
    productName: 'Atlas Review',
    resetUrl: 'https://prs-atlas.com/reset-password?token=verification-test-token',
    logoUrl: 'https://prs-atlas.com/atlas-logo.png',
    loginUrl: 'https://prs-atlas.com/login',
    supportEmail: 'support@prs-atlas.com',
    expiresInMinutes: 60,
  });

  const id = await sendEmail({ to: recipient, subject, html, text }, 'Verify email setup');
  console.log(`\nTest email accepted by Resend (id ${id}). Check ${recipient}.`);
}

main().catch((error) => {
  console.error('\nVerification failed:', error);
  process.exit(1);
});
