import sgMail from "@sendgrid/mail";

export type SlackNotifyKind = "question-report" | "support-form";

function slackEscape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isSlackIncomingWebhook(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "hooks.slack.com";
  } catch {
    return false;
  }
}

function webhookUrlFor(kind: SlackNotifyKind): string | undefined {
  const fallback = process.env.SLACK_WEBHOOK_URL?.trim();
  const raw =
    kind === "question-report"
      ? process.env.SLACK_QUESTION_REPORTS_WEBHOOK_URL?.trim() || fallback
      : process.env.SLACK_SUPPORT_WEBHOOK_URL?.trim() || fallback;
  if (!raw) return undefined;
  if (!isSlackIncomingWebhook(raw)) {
    console.warn(`[Slack] Ignoring invalid webhook URL for ${kind} (expected https://hooks.slack.com/...)`);
    return undefined;
  }
  return raw;
}

/**
 * Incoming Webhook post. Never throws: support intake should still succeed if Slack is down.
 */
export async function postSlackNotification(
  kind: SlackNotifyKind,
  text: string
): Promise<boolean> {
  const url = webhookUrlFor(kind);
  if (!url) {
    console.warn(
      `[Slack] No webhook configured for ${kind} (set SLACK_WEBHOOK_URL or a channel-specific URL)`
    );
    return false;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[Slack] Webhook ${kind} failed: ${res.status} ${body}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[Slack] Webhook ${kind} error:`, error);
    return false;
  }
}

function clipForSlack(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export async function notifyQuestionReportSlack(params: {
  questionId: string;
  message: string;
  userEmail?: string | null;
  reportCount: number;
  autoHidden: boolean;
  databaseLabel?: string | null;
  stem?: string | null;
  choices?: { letter: string; text: string }[];
  correctAnswer?: string | null;
}): Promise<boolean> {
  const reporter = params.userEmail?.trim()
    ? slackEscape(params.userEmail.trim())
    : "(anonymous / not signed in)";
  const lines = [
    `*Question reported* \`${slackEscape(params.questionId)}\``,
    `Database: ${slackEscape(params.databaseLabel?.trim() || "Unknown")}`,
    `Reporter: ${reporter}`,
    `Total reports for this question: ${params.reportCount}${
      params.autoHidden ? " — auto-hidden" : ""
    }`,
  ];
  if (params.stem?.trim()) {
    lines.push("", "*Stem*", slackEscape(clipForSlack(params.stem, 1500)));
  }
  if (params.choices && params.choices.length > 0) {
    lines.push("", "*Answer choices*");
    for (const c of params.choices) {
      lines.push(
        slackEscape(`${c.letter}) ${clipForSlack(c.text, 400)}`)
      );
    }
  }
  if (params.correctAnswer?.trim()) {
    lines.push("", `*Correct answer:* ${slackEscape(clipForSlack(params.correctAnswer, 500))}`);
  }
  lines.push("", slackEscape(params.message.slice(0, 2000)));
  return postSlackNotification("question-report", lines.join("\n"));
}

export async function sendSupportContactEmail(params: {
  toEmail: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
  specialtyLabel: string;
}): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@prs-atlas.com";
  if (!apiKey) {
    console.warn("[Support form] SENDGRID_API_KEY is not set — no email will be sent.");
    return false;
  }

  const body = [
    `Support form submission (${params.specialtyLabel})`,
    "",
    `From: ${params.fromName} <${params.fromEmail}>`,
    `Subject: ${params.subject}`,
    "",
    params.message,
  ].join("\n");

  try {
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to: params.toEmail,
      from: fromEmail,
      replyTo: params.fromEmail,
      subject: `[Support] ${params.subject}`,
      text: body,
    });
    console.log("[Support form] Email sent to", params.toEmail);
    return true;
  } catch (error: unknown) {
    const err = error as { response?: { body?: unknown } };
    console.error("[Support form] SendGrid error:", err);
    if (err.response?.body) {
      console.error("[Support form] SendGrid response body:", JSON.stringify(err.response.body, null, 2));
    }
    return false;
  }
}

export async function notifySupportFormSlack(params: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
  specialtyLabel: string;
}): Promise<boolean> {
  const lines = [
    `*Support form* (${slackEscape(params.specialtyLabel)})`,
    `From: ${slackEscape(params.fromName)} <${slackEscape(params.fromEmail)}>`,
    `Subject: ${slackEscape(params.subject)}`,
    "",
    slackEscape(params.message.slice(0, 3000)),
  ];
  return postSlackNotification("support-form", lines.join("\n"));
}
