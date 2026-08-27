/**
 * Post Slack question-report messages for PRS items that were hidden before
 * the Slack report workflow existed, using the same payload as live reports
 * (id, database, stem, choices, correct answer, any stored report text).
 *
 * Default set (~171): PRS, currently hidden, and either flagged (missing-photo)
 * or auto-hidden because the stem says "photograph is shown".
 *
 *   npm run backfill:flagged-slack
 *   npm run backfill:flagged-slack -- --dry-run
 *   npm run backfill:flagged-slack -- --all-flagged   (every flagged+hidden row, incl. ortho)
 */
import { and, eq, ilike, or } from "drizzle-orm";
import { db, pool } from "../db";
import {
  databaseLabelForSpecialty,
  notifyQuestionReportSlack,
  postSlackNotification,
  slackFieldsFromQuestion,
} from "../notifySupport";
import { questionReports, questions, sections, subsections } from "@shared/schema";
import type { SpecialtyId } from "@shared/specialties";

const DELAY_MS = 800;
const MAX_ATTEMPTS = 3;

function parseArgs(argv: string[]) {
  let dryRun = false;
  let allFlagged = false;
  let limit: number | undefined;
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--all-flagged") allFlagged = true;
    else if (arg.startsWith("--limit=")) {
      const n = Number(arg.slice("--limit=".length));
      if (!Number.isFinite(n) || n < 1) {
        throw new Error(`Invalid --limit: ${arg}`);
      }
      limit = Math.floor(n);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return { dryRun, allFlagged, limit };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function auditTags(tags: string[] | null): string[] {
  const interesting = new Set([
    "content-flagged",
    "missing-photo",
    "needs-manual-revision",
    "validation-flagged",
    "rescreen-flagged",
    "admin-flagged",
  ]);
  return (tags ?? []).filter((t) => interesting.has(t));
}

function backfillMessage(params: {
  flagged: boolean;
  tags: string[] | null;
  photographShown: boolean;
  reportTexts: string[];
}): string {
  const lines: string[] = [];
  lines.push("[Pre-Slack backfill] Hidden before the Slack report workflow.");
  if (params.flagged) {
    const tags = auditTags(params.tags);
    lines.push(
      tags.length
        ? `Flagged (content-audit). Tags: ${tags.join(", ")}.`
        : "Flagged (content-audit)."
    );
  }
  if (params.photographShown) {
    lines.push('Auto-hidden: stem references a photograph ("photograph is shown") with no attached image.');
  }
  if (params.reportTexts.length > 0) {
    lines.push("", "Original learner report(s):");
    for (const text of params.reportTexts) {
      lines.push(`• ${text}`);
    }
  } else {
    lines.push("", "No learner report text was stored for this item.");
  }
  return lines.join("\n");
}

async function postWithRetry(send: () => Promise<boolean>, label: string): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const ok = await send();
    if (ok) return true;
    if (attempt < MAX_ATTEMPTS) {
      const wait = DELAY_MS * attempt * 2;
      console.warn(`Retry ${attempt}/${MAX_ATTEMPTS} for ${label} after ${wait}ms`);
      await sleep(wait);
    }
  }
  return false;
}

async function main() {
  const { dryRun, allFlagged, limit } = parseArgs(process.argv.slice(2));

  const rows = await db
    .select({
      id: questions.id,
      question: questions.question,
      answer: questions.answer,
      flagged: questions.flagged,
      tags: questions.tags,
      specialtyId: sections.specialtyId,
    })
    .from(questions)
    .innerJoin(subsections, eq(questions.subsectionId, subsections.id))
    .innerJoin(sections, eq(subsections.sectionId, sections.id))
    .where(
      allFlagged
        ? and(eq(questions.flagged, true), eq(questions.visible, false))
        : and(
            eq(questions.visible, false),
            eq(sections.specialtyId, "prs"),
            or(eq(questions.flagged, true), ilike(questions.question, "%photograph is shown%"))
          )
    );

  rows.sort((a, b) => a.id.localeCompare(b.id));
  const selected = limit ? rows.slice(0, limit) : rows;

  const reports = await db.select().from(questionReports);
  const reportsByQuestion = new Map<string, typeof reports>();
  for (const r of reports) {
    const list = reportsByQuestion.get(r.questionId) ?? [];
    list.push(r);
    reportsByQuestion.set(r.questionId, list);
  }

  const scope = allFlagged
    ? "all flagged+hidden (PRS + Ortho)"
    : 'PRS hidden, flagged or "photograph is shown"';
  console.log(
    JSON.stringify(
      {
        scope,
        matched: rows.length,
        posting: selected.length,
        dryRun,
        delayMs: DELAY_MS,
      },
      null,
      2
    )
  );

  if (selected.length === 0) {
    console.log("Nothing to post.");
    return;
  }

  if (dryRun) {
    const sample = selected[0];
    const sampleReports = reportsByQuestion.get(sample.id) ?? [];
    console.log(
      "Dry run sample:",
      JSON.stringify(
        {
          questionId: sample.id,
          specialtyId: sample.specialtyId,
          flagged: sample.flagged,
          reportCount: sampleReports.length,
          stem: slackFieldsFromQuestion(sample.question, sample.answer).stem?.slice(0, 180),
        },
        null,
        2
      )
    );
    console.log("Dry run — no Slack messages sent.");
    return;
  }

  const introOk = await postWithRetry(
    () =>
      postSlackNotification(
        "question-report",
        [
          "*Pre-Slack backfill*",
          `Posting ${selected.length} hidden question(s) (${scope}) with the same stem / choices / keyed answer as live reports.`,
          "Individual items follow.",
        ].join("\n")
      ),
    "intro"
  );
  if (!introOk) {
    throw new Error("Failed to post intro message; aborting so the channel is not left half-filled.");
  }

  let posted = 0;
  let failed = 0;
  const failedIds: string[] = [];

  for (let i = 0; i < selected.length; i++) {
    const row = selected[i];
    const stored = (reportsByQuestion.get(row.id) ?? []).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const emails = stored.map((r) => r.userEmail?.trim()).filter((e): e is string => Boolean(e));
    const fields = slackFieldsFromQuestion(row.question, row.answer);
    const photographShown = row.question.toLowerCase().includes("photograph is shown");
    const ok = await postWithRetry(
      () =>
        notifyQuestionReportSlack({
          questionId: row.id,
          message: backfillMessage({
            flagged: row.flagged,
            tags: row.tags,
            photographShown,
            reportTexts: stored.map((r) => r.message.trim()).filter(Boolean),
          }),
          userEmail: emails[0] ?? "(backfill / no original reporter)",
          reportCount: stored.length,
          autoHidden: true,
          databaseLabel: databaseLabelForSpecialty(row.specialtyId as SpecialtyId),
          stem: fields.stem,
          choices: fields.choices,
          correctAnswer: fields.correctAnswer,
        }),
      row.id
    );
    if (ok) posted++;
    else {
      failed++;
      failedIds.push(row.id);
    }
    if ((i + 1) % 25 === 0 || i === selected.length - 1) {
      console.log(`Progress ${i + 1}/${selected.length} posted=${posted} failed=${failed}`);
    }
    if (i < selected.length - 1) await sleep(DELAY_MS);
  }

  console.log(JSON.stringify({ posted, failed, failedIds }, null, 2));
  await pool.end().catch(() => undefined);
  if (failed > 0) process.exit(1);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => pool.end().catch(() => undefined));
