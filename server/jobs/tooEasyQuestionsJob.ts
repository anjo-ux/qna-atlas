/**
 * Weekly agent: find live questions that ≥90% of learners get right (too easy)
 * and post a Slack digest to the question-reports channel so editors can harden them.
 *
 * Report-only — does not auto-rewrite.
 *
 *   npm run too-easy-agent
 *   TOO_EASY_AGENT_ENABLED=true  (hourly tick; runs when 7d watermark elapsed)
 */
import { storage } from "../storage";
import { postSlackNotification } from "../notifySupport";
import { extractQuestionStem } from "@shared/questionFormat";
import { subsectionTitles } from "@shared/questionImport";
import { orthoSubsectionTitles } from "@shared/orthoQuestionImport";
import {
  DEFAULT_MIN_ANSWERS,
  DEFAULT_MIN_CORRECT_RATE,
  filterTooEasyQuestions,
  formatCorrectPct,
  truncateForSlack,
  type TooEasyFinding,
} from "./tooEasyQuestionsLogic";

export const TOO_EASY_AGENT_JOB_NAME = "too_easy_questions";
const DEFAULT_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_TICK_MS = 60 * 60 * 1000;
const DEFAULT_MAX_LIST = 40;

export type TooEasyAgentResult = {
  skippedPeriod: boolean;
  findings: number;
  minAnswers: number;
  minCorrectRate: number;
  windowDays: number;
  digestPosted: boolean;
  errors: string[];
};

function minAnswers(): number {
  const n = Number(process.env.TOO_EASY_AGENT_MIN_ANSWERS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MIN_ANSWERS;
}

function minCorrectRate(): number {
  const n = Number(process.env.TOO_EASY_AGENT_MIN_CORRECT_RATE);
  if (Number.isFinite(n) && n > 0 && n <= 1) return n;
  // Allow "90" as shorthand for 0.9
  if (Number.isFinite(n) && n > 1 && n <= 100) return n / 100;
  return DEFAULT_MIN_CORRECT_RATE;
}

function maxList(): number {
  const n = Number(process.env.TOO_EASY_AGENT_MAX_LIST);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_LIST;
}

export function tooEasyAgentPeriodMs(): number {
  const n = Number(process.env.TOO_EASY_AGENT_PERIOD_MS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PERIOD_MS;
}

export function tooEasyAgentTickMs(): number {
  const n = Number(process.env.TOO_EASY_AGENT_INTERVAL_MS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TICK_MS;
}

export async function isTooEasyAgentDue(now = Date.now()): Promise<boolean> {
  const last = await storage.getLastSuccessfulAgentJobRun(TOO_EASY_AGENT_JOB_NAME);
  if (!last?.finishedAt && !last?.startedAt) {
    return process.env.TOO_EASY_AGENT_RUN_ON_START === "true";
  }
  const t = (last.finishedAt ?? last.startedAt).getTime();
  return now - t >= tooEasyAgentPeriodMs();
}

function subsectionTitle(id: string): string {
  return subsectionTitles[id] ?? orthoSubsectionTitles[id] ?? id;
}

function buildDigest(params: {
  findings: TooEasyFinding[];
  minAnswers: number;
  minCorrectRate: number;
  windowDays: number;
  stems: Map<string, string>;
}): string {
  const shown = params.findings.slice(0, maxList());
  const pct = formatCorrectPct(params.minCorrectRate);
  const lines = [
    `*Weekly too-easy questions* (≥${pct} correct)`,
    `Window: ${
      params.windowDays <= 0 ? "all history" : `last ${params.windowDays} day(s)`
    } · Min answers: ${params.minAnswers} · Threshold: ≥${pct} · Flagged: ${params.findings.length}`,
    `These live items are answered correctly too often — consider making them harder.`,
  ];
  if (params.findings.length === 0) {
    lines.push("");
    lines.push(`_No questions met the ≥${pct} correct + minimum sample threshold._`);
    return lines.join("\n");
  }
  lines.push("");
  lines.push("*Candidates (sorted by correct rate, then volume)*");
  for (const f of shown) {
    const stem = params.stems.get(f.questionId);
    const title = subsectionTitle(f.subsectionId);
    lines.push(
      `• \`${f.questionId}\` — ${formatCorrectPct(f.correctRate)} (${f.correct} correct / ${f.incorrect} wrong, ${f.uniqueUsers} users) · ${title}`
    );
    if (stem) {
      lines.push(`  ${truncateForSlack(stem, 220)}`);
    }
  }
  if (params.findings.length > shown.length) {
    lines.push(`_…and ${params.findings.length - shown.length} more_`);
  }
  return lines.join("\n");
}

export async function runTooEasyQuestionsJob(
  opts: { force?: boolean } = {}
): Promise<TooEasyAgentResult> {
  const min = minAnswers();
  const rate = minCorrectRate();
  const period = tooEasyAgentPeriodMs();
  const windowDays = Math.max(1, Math.round(period / (24 * 60 * 60 * 1000)));
  const empty: TooEasyAgentResult = {
    skippedPeriod: false,
    findings: 0,
    minAnswers: min,
    minCorrectRate: rate,
    windowDays,
    digestPosted: false,
    errors: [],
  };

  if (!opts.force && !(await isTooEasyAgentDue())) {
    return { ...empty, skippedPeriod: true };
  }

  const allHistory = process.env.TOO_EASY_AGENT_ALL_HISTORY === "true";
  const since = allHistory ? new Date(0) : new Date(Date.now() - period);
  const run = await storage.startAgentJobRun(TOO_EASY_AGENT_JOB_NAME);
  const errors: string[] = [];

  try {
    const rows = await storage.getHighCorrectRateQuestionsSince(since, min, rate);
    const findings = filterTooEasyQuestions(rows, min, rate);

    const stems = new Map<string, string>();
    for (const f of findings.slice(0, maxList())) {
      try {
        const q = await storage.getQuestion(f.questionId);
        if (q?.question) {
          stems.set(f.questionId, extractQuestionStem(q.question));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${f.questionId}: ${msg}`);
      }
    }

    const digestPosted = await postSlackNotification(
      "question-report",
      buildDigest({
        findings,
        minAnswers: min,
        minCorrectRate: rate,
        windowDays: allHistory ? 0 : windowDays,
        stems,
      })
    );

    const stats = {
      findings: findings.length,
      minAnswers: min,
      minCorrectRate: rate,
      windowDays,
      digestPosted,
      sampleIds: findings.slice(0, 20).map((f) => f.questionId),
      errors,
    };
    await storage.finishAgentJobRun(run.id, "success", stats);
    return {
      skippedPeriod: false,
      findings: findings.length,
      minAnswers: min,
      minCorrectRate: rate,
      windowDays,
      digestPosted,
      errors,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(msg);
    await storage.finishAgentJobRun(run.id, "error", { errors });
    throw e;
  }
}

if (process.argv[1]?.includes("tooEasyQuestionsJob")) {
  runTooEasyQuestionsJob({ force: true })
    .then((r) => console.log("Done:", r))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
