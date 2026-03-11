/**
 * Audit ALL questions in the database for JSON/encoding conversion errors:
 * - Unicode replacement character (�)
 * - Undecoded HTML entities (&apos;, &quot;, &times;, &#39;, etc.)
 * - Wrong symbols (× instead of x, smart quotes, etc.)
 * - Invalid or suspicious characters in question, answer, and tags
 *
 * Run: npx tsx server/scripts/auditQuestionEncoding.ts
 *       npx tsx server/scripts/auditQuestionEncoding.ts --fix   (normalize smart quotes/nbsp)
 * Requires: DATABASE_URL
 */
import { db } from "../db";
import { questions } from "@shared/schema";

const UNICODE_REPLACEMENT = "\uFFFD"; // �

// HTML entities that should have been decoded (entityMap in questionImport + common ones)
const HTML_ENTITY_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /&apos;/g, name: "&apos;" },
  { pattern: /&quot;/g, name: "&quot;" },
  { pattern: /&#39;/g, name: "&#39;" },
  { pattern: /&#34;/g, name: "&#34;" },
  { pattern: /&times;/g, name: "&times;" },
  { pattern: /&amp;/g, name: "&amp;" },
  { pattern: /&lt;/g, name: "&lt;" },
  { pattern: /&gt;/g, name: "&gt;" },
  { pattern: /&nbsp;/g, name: "&nbsp;" },
  { pattern: /&ndash;/g, name: "&ndash;" },
  { pattern: /&mdash;/g, name: "&mdash;" },
  { pattern: /&rsquo;/g, name: "&rsquo;" },
  { pattern: /&lsquo;/g, name: "&lsquo;" },
  { pattern: /&ldquo;/g, name: "&ldquo;" },
  { pattern: /&rdquo;/g, name: "&rdquo;" },
  { pattern: /&#\d+;/g, name: "&#decimal;" },
  { pattern: /&#x[0-9a-fA-F]+;/g, name: "&#xhex;" },
];

// Characters that are often wrong conversions (e.g. × where "x" was intended)
const SUSPICIOUS_SYMBOLS: { char: string; code: string; description: string }[] = [
  { char: "\u00D7", code: "U+00D7", description: "Multiplication sign × (often should be letter x)" },
  { char: "\u2018", code: "U+2018", description: "Left single quote (smart quote)" },
  { char: "\u2019", code: "U+2019", description: "Right single quote (smart quote)" },
  { char: "\u201C", code: "U+201C", description: "Left double quote (smart quote)" },
  { char: "\u201D", code: "U+201D", description: "Right double quote (smart quote)" },
  { char: "\u00A0", code: "U+00A0", description: "Non-breaking space (often should be normal space)" },
];

interface Finding {
  id: string;
  field: "question" | "answer" | "tags";
  tagIndex?: number;
  type: string;
  detail: string;
  snippet: string;
}

function snippet(str: string, index: number, radius = 30): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(str.length, index + radius + 1);
  let s = str.slice(start, end);
  s = s.replace(/\n/g, " ").replace(/\r/g, "");
  if (start > 0) s = "…" + s;
  if (end < str.length) s = s + "…";
  return s;
}

function checkText(id: string, field: "question" | "answer" | "tags", text: string, tagIndex?: number): Finding[] {
  const findings: Finding[] = [];
  if (!text || typeof text !== "string") return findings;

  // 1. Unicode replacement character
  let idx = text.indexOf(UNICODE_REPLACEMENT);
  while (idx !== -1) {
    findings.push({
      id,
      field,
      tagIndex,
      type: "replacement_char",
      detail: "Unicode replacement character (�) - decoding error",
      snippet: snippet(text, idx),
    });
    idx = text.indexOf(UNICODE_REPLACEMENT, idx + 1);
  }

  // 2. Undecoded HTML entities
  for (const { pattern, name } of HTML_ENTITY_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const m of matches) {
      const index = m.index ?? 0;
      findings.push({
        id,
        field,
        tagIndex,
        type: "html_entity",
        detail: `Undecoded HTML entity: ${name}`,
        snippet: snippet(text, index),
      });
    }
  }

  // 3. Suspicious symbols (×, smart quotes, nbsp)
  for (const { char, code, description } of SUSPICIOUS_SYMBOLS) {
    let idx = text.indexOf(char);
    while (idx !== -1) {
      findings.push({
        id,
        field,
        tagIndex,
        type: "suspicious_symbol",
        detail: `${code} - ${description}`,
        snippet: snippet(text, idx),
      });
      idx = text.indexOf(char, idx + 1);
    }
  }

  // 4. Control characters (except normal newline/tab)
  const controlCharRe = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
  let m: RegExpExecArray | null;
  while ((m = controlCharRe.exec(text)) !== null) {
    findings.push({
      id,
      field,
      tagIndex,
      type: "control_char",
      detail: `Control character code ${m[0].charCodeAt(0)}`,
      snippet: snippet(text, m.index),
    });
  }

  return findings;
}

function checkTags(id: string, tags: unknown): Finding[] {
  const findings: Finding[] = [];
  if (tags == null) return findings;
  if (!Array.isArray(tags)) {
    findings.push({
      id,
      field: "tags",
      type: "invalid_json",
      detail: "tags is not an array",
      snippet: String(tags).slice(0, 80),
    });
    return findings;
  }
  for (let i = 0; i < tags.length; i++) {
    const t = tags[i];
    if (typeof t !== "string") {
      findings.push({
        id,
        field: "tags",
        tagIndex: i,
        type: "invalid_json",
        detail: `tags[${i}] is not a string: ${typeof t}`,
        snippet: String(t).slice(0, 80),
      });
    } else {
      findings.push(...checkText(id, "tags", t, i));
    }
  }
  return findings;
}

/** Normalize smart quotes and nbsp to ASCII for --fix. */
function normalizeSymbols(text: string): string {
  return text
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u00A0/g, " ");
}

async function main() {
  const all = await db.select({ id: questions.id, question: questions.question, answer: questions.answer, tags: questions.tags }).from(questions);
  const total = all.length;
  const findings: Finding[] = [];

  for (const row of all) {
    findings.push(...checkText(row.id, "question", row.question ?? ""));
    findings.push(...checkText(row.id, "answer", row.answer ?? ""));
    findings.push(...checkTags(row.id, row.tags));
  }

  // Dedupe by id+field+type+detail+snippet (same issue can appear multiple times in one field)
  const seen = new Set<string>();
  const unique: Finding[] = [];
  for (const f of findings) {
    const key = `${f.id}\t${f.field}\t${f.tagIndex ?? ""}\t${f.type}\t${f.detail}\t${f.snippet}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(f);
  }

  const byType = new Map<string, number>();
  const byQuestion = new Map<string, Finding[]>();
  for (const f of unique) {
    byType.set(f.type, (byType.get(f.type) ?? 0) + 1);
    const list = byQuestion.get(f.id) ?? [];
    list.push(f);
    byQuestion.set(f.id, list);
  }

  const doFix = process.argv.includes("--fix");

  if (doFix && byQuestion.size > 0) {
    const { eq } = await import("drizzle-orm");
    for (const id of byQuestion.keys()) {
      const row = all.find((r) => r.id === id);
      if (!row) continue;
      const list = byQuestion.get(id)!;
      const needsQuestion = list.some((f) => f.field === "question");
      const needsAnswer = list.some((f) => f.field === "answer");
      let question = row.question ?? "";
      let answer = row.answer ?? "";
      if (needsQuestion) question = normalizeSymbols(question);
      if (needsAnswer) answer = normalizeSymbols(answer);
      if (needsQuestion || needsAnswer) {
        await db.update(questions).set({ question, answer, updatedAt: new Date() }).where(eq(questions.id, id));
        console.log(`Fixed: ${id}`);
      }
    }
    console.log("Done. Re-run without --fix to verify.\n");
    return;
  }

  console.log("=== Question encoding audit ===\n");
  console.log(`Total questions: ${total}`);
  console.log(`Questions with at least one finding: ${byQuestion.size}`);
  console.log(`Total unique findings: ${unique.length}\n`);

  if (unique.length === 0) {
    console.log("No JSON/encoding conversion errors found.");
    return;
  }

  console.log("Findings by type:");
  for (const [type, count] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }

  console.log("\n--- Affected question IDs and details ---\n");
  const sortedIds = [...byQuestion.keys()].sort();
  for (const id of sortedIds) {
    const list = byQuestion.get(id)!;
    console.log(`${id} (${list.length} finding(s)):`);
    for (const f of list) {
      const tagPart = f.tagIndex !== undefined ? ` [tags[${f.tagIndex}]]` : "";
      console.log(`  [${f.field}${tagPart}] ${f.type}: ${f.detail}`);
      console.log(`    snippet: ${f.snippet}`);
    }
    console.log("");
  }

  if (byQuestion.size > 0) {
    console.log("To normalize smart quotes and nbsp in affected questions, run: npx tsx server/scripts/auditQuestionEncoding.ts --fix");
  }

  process.exit(byQuestion.size > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
