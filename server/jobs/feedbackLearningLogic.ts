/** Pure ranking / JSON parsing for the weekly feedback agent (no I/O). */

export type AgentAction = "revise" | "needs_manual" | "skip";

export type AgentDecision = {
  action: AgentAction;
  reason: string;
  revisedQuestion?: string;
  revisedAnswer?: string;
  confidence?: string;
};

export type ReportSignal = {
  id: string;
  questionId: string;
  message: string;
  createdAt: Date;
};

export type MissRateRow = {
  questionId: string;
  subsectionId: string;
  answered: number;
  incorrect: number;
};

export type CandidateInput = {
  reports: ReportSignal[];
  missRates: MissRateRow[];
  contactQuestionIds: string[];
  lastRevisionAtByQuestionId: Map<string, Date>;
};

export type RankedCandidate = {
  questionId: string;
  reports: ReportSignal[];
  missRate: number | null;
  answered: number;
  reasons: string[];
};

const MEDIA_RE =
  /\b(missing|no|without|need[s]?|can't see|cannot see|where's|where is).{0,40}\b(image|imaging|photo|photograph|figure|x-?ray|radiograph|mri|ct scan|video|exhibit|picture|pic)\b|\b(image|imaging|photo|photograph|figure|x-?ray|picture)\b.{0,40}\b(missing|not shown|not included|broken|blank)\b/i;

export const MIN_REPORTS = 2;
export const MIN_ANSWERS_FOR_MISS = 20;
export const MISS_RATE_DELTA = 0.25;

export function looksLikeMissingMedia(message: string): boolean {
  return MEDIA_RE.test(message);
}

/** Question ids mentioned in free text (UUIDs or known bank ids). */
export function extractQuestionIdsFromText(text: string, knownIds: Set<string>): string[] {
  const found = new Set<string>();
  const uuidRe = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
  for (const m of text.matchAll(uuidRe)) {
    found.add(m[0]);
  }
  const tokenRe = /\b(?:ortho|prs)-[a-z0-9][\w.-]{4,120}\b/gi;
  for (const m of text.matchAll(tokenRe)) {
    found.add(m[0]);
  }
  for (const id of knownIds) {
    if (id && text.includes(id)) found.add(id);
  }
  return [...found];
}

export function subsectionMissAverages(rows: MissRateRow[]): Map<string, number> {
  const sums = new Map<string, { incorrect: number; answered: number }>();
  for (const r of rows) {
    const cur = sums.get(r.subsectionId) ?? { incorrect: 0, answered: 0 };
    cur.incorrect += r.incorrect;
    cur.answered += r.answered;
    sums.set(r.subsectionId, cur);
  }
  const out = new Map<string, number>();
  for (const [id, s] of sums) {
    if (s.answered > 0) out.set(id, s.incorrect / s.answered);
  }
  return out;
}

export function rankCandidates(input: CandidateInput): RankedCandidate[] {
  const byQ = new Map<string, ReportSignal[]>();
  for (const r of input.reports) {
    const list = byQ.get(r.questionId) ?? [];
    list.push(r);
    byQ.set(r.questionId, list);
  }
  const missByQ = new Map(input.missRates.map((m) => [m.questionId, m]));
  const subAvg = subsectionMissAverages(input.missRates);
  const contactSet = new Set(input.contactQuestionIds);

  const ids = new Set<string>([...byQ.keys(), ...contactSet]);
  const ranked: RankedCandidate[] = [];

  for (const questionId of ids) {
    const reports = byQ.get(questionId) ?? [];
    const lastRev = input.lastRevisionAtByQuestionId.get(questionId);
    const newestReport = reports.reduce<Date | null>((acc, r) => {
      if (!acc || r.createdAt > acc) return r.createdAt;
      return acc;
    }, null);
    if (lastRev && newestReport && newestReport <= lastRev && !contactSet.has(questionId)) {
      continue;
    }

    const miss = missByQ.get(questionId);
    const missRate = miss && miss.answered > 0 ? miss.incorrect / miss.answered : null;
    const avg = miss ? subAvg.get(miss.subsectionId) ?? 0.5 : 0.5;
    const highMiss =
      miss != null &&
      miss.answered >= MIN_ANSWERS_FOR_MISS &&
      missRate != null &&
      missRate >= avg + MISS_RATE_DELTA;

    const mediaReports = reports.filter((r) => looksLikeMissingMedia(r.message));
    const reasons: string[] = [];
    let include = false;

    if (reports.length >= MIN_REPORTS) {
      include = true;
      reasons.push(`${reports.length} reports`);
    }
    if (mediaReports.length >= 1) {
      include = true;
      reasons.push("missing-media report");
    }
    if (reports.length >= 1 && highMiss) {
      include = true;
      reasons.push(
        `miss rate ${(missRate! * 100).toFixed(0)}% vs subsection ${((avg) * 100).toFixed(0)}%`
      );
    }
    if (contactSet.has(questionId)) {
      include = true;
      reasons.push("mentioned in contact form");
    }

    if (!include) continue;
    ranked.push({
      questionId,
      reports,
      missRate,
      answered: miss?.answered ?? 0,
      reasons,
    });
  }

  ranked.sort((a, b) => {
    if (b.reports.length !== a.reports.length) return b.reports.length - a.reports.length;
    return (b.missRate ?? 0) - (a.missRate ?? 0);
  });
  return ranked;
}

export function parseAgentDecision(raw: string): AgentDecision | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const action = o.action;
  if (action !== "revise" && action !== "needs_manual" && action !== "skip") return null;
  const reason = typeof o.reason === "string" ? o.reason : "";
  const revisedQuestion = typeof o.revisedQuestion === "string" ? o.revisedQuestion : undefined;
  const revisedAnswer = typeof o.revisedAnswer === "string" ? o.revisedAnswer : undefined;
  const confidence = typeof o.confidence === "string" ? o.confidence : undefined;
  return { action, reason, revisedQuestion, revisedAnswer, confidence };
}

export function truncateForSlack(text: string, max = 400): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
