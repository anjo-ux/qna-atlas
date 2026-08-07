/**
 * Extract Ortho topic *concepts* from a self-authored Anki .apkg.
 *
 * IMPORTANT: Does NOT export question stems for the bank. Cloze answers and deck
 * paths become short concept labels only; Atlas MCQs are generated separately
 * in PRS-Atlas narrative style without copying Anki wording.
 *
 * Usage:
 *   IMPORT_PATH="attached_assets/Ortho Questions.apkg" npm run extract:ortho-topics
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { decompress } from "fzstd";
import initSqlJs from "sql.js";
import {
  categorizeOrthoTopic,
  orthoSubsectionToSection,
  type OrthoTopicBucket,
} from "@shared/orthoQuestionImport";

const DEFAULT_APKG = path.join(process.cwd(), "attached_assets", "Ortho Questions.apkg");
const DEFAULT_OUT = path.join(process.cwd(), "server", "data", "orthoTopics.json");

/** Cloze note type mid used by the Ortho deck (standard Cloze). */
const CLOZE_MIDS = new Set([
  1502496019638, // Cloze
  1358629116480,
  1358629116484,
  1395802358422,
]);

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(div|p|li|ul|ol)[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull cloze answers like {{c1::Axillary}} or {{c1::Axillary::hint}} → "Axillary". */
function extractClozeAnswers(text: string): string[] {
  const out: string[] = [];
  const re = /\{\{c\d+::([^}:]+)(?:::[^}]*)?\}\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const ans = stripHtml(m[1]).trim();
    if (ans && ans.length <= 120) out.push(ans);
  }
  return out;
}

/**
 * Build a short concept label from cloze prompt + answer without retaining
 * full Anki phrasing. Prefer the answer; add 3–6 context keywords from the prompt.
 */
function conceptFromCloze(rawText: string, answer: string): string {
  const cleaned = stripHtml(rawText)
    .replace(/\{\{c\d+::[^}]+\}\}/gi, " ")
    .replace(/[^\w\s\-/'+]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const stop = new Set([
    "a", "an", "the", "of", "to", "in", "on", "for", "with", "is", "are", "was", "were",
    "what", "which", "when", "where", "how", "does", "do", "did", "must", "may", "be",
    "and", "or", "by", "from", "that", "this", "as", "at", "it", "its", "patient",
    "view", "best", "most", "common", "following",
  ]);
  const words = cleaned.split(/\s+/).filter((w) => w.length > 2 && !stop.has(w)).slice(0, 6);
  const ctx = words.join(" ");
  const ans = answer.trim();
  if (!ctx) return ans;
  // Cap total length so prompts stay concept-sized, not stem-sized
  const label = `${ans} (${ctx})`;
  return label.length > 100 ? `${ans} (${words.slice(0, 3).join(" ")})`.slice(0, 100) : label;
}

async function unzipEntry(apkgPath: string, entryName: string, destPath: string): Promise<void> {
  // Prefer system unzip for the small collection files without exploding media
  const { spawnSync } = await import("child_process");
  const r = spawnSync("unzip", ["-o", "-j", apkgPath, entryName, "-d", path.dirname(destPath)], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(`unzip ${entryName} failed: ${r.stderr || r.stdout}`);
  }
  const extracted = path.join(path.dirname(destPath), path.basename(entryName));
  if (extracted !== destPath && fs.existsSync(extracted)) {
    fs.renameSync(extracted, destPath);
  }
}

async function loadCollectionDb(apkgPath: string): Promise<Buffer> {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ortho-apkg-"));
  const anki21b = path.join(tmp, "collection.anki21b");
  const anki2 = path.join(tmp, "collection.anki2");
  try {
    await unzipEntry(apkgPath, "collection.anki21b", anki21b);
    if (fs.existsSync(anki21b) && fs.statSync(anki21b).size > 1000) {
      const compressed = fs.readFileSync(anki21b);
      return Buffer.from(decompress(compressed));
    }
  } catch {
    // fall through to legacy collection.anki2
  }
  await unzipEntry(apkgPath, "collection.anki2", anki2);
  return fs.readFileSync(anki2);
}

async function main() {
  const apkgPath = process.env.IMPORT_PATH || DEFAULT_APKG;
  const outPath = process.env.ORTHO_TOPICS_OUT || DEFAULT_OUT;
  if (!fs.existsSync(apkgPath)) {
    console.error("APKG not found:", apkgPath);
    process.exit(1);
  }

  console.log("Reading", apkgPath);
  const dbBuf = await loadCollectionDb(apkgPath);
  const SQL = await initSqlJs();
  const db = new SQL.Database(dbBuf);

  const deckNameById = new Map<number, string>();
  for (const row of db.exec("SELECT id, name FROM decks")[0]?.values ?? []) {
    deckNameById.set(Number(row[0]), String(row[1]).replace(/\u001f/g, " :: "));
  }

  // Prefer a representative deck path per note via its cards
  const noteDeck = new Map<number, string>();
  for (const row of db.exec("SELECT nid, did FROM cards")[0]?.values ?? []) {
    const nid = Number(row[0]);
    const did = Number(row[1]);
    if (!noteDeck.has(nid)) {
      noteDeck.set(nid, deckNameById.get(did) ?? "");
    }
  }

  const buckets = new Map<string, Set<string>>();
  let clozeNotes = 0;
  let conceptsKept = 0;

  const notes = db.exec("SELECT id, mid, tags, flds FROM notes")[0]?.values ?? [];
  for (const row of notes) {
    const id = Number(row[0]);
    const mid = Number(row[1]);
    if (!CLOZE_MIDS.has(mid)) continue;
    clozeNotes++;
    const tags = String(row[2] ?? "");
    const flds = String(row[3] ?? "");
    const textField = flds.split("\x1f")[0] ?? "";
    const answers = extractClozeAnswers(textField);
    if (answers.length === 0) continue;
    const deckPath = noteDeck.get(id) ?? "";
    const { subsection } = categorizeOrthoTopic(deckPath, tags);
    if (!buckets.has(subsection)) buckets.set(subsection, new Set());
    const set = buckets.get(subsection)!;
    for (const ans of answers) {
      const concept = conceptFromCloze(textField, ans);
      if (concept.length < 2) continue;
      set.add(concept);
      conceptsKept++;
    }
  }

  const topicBuckets: OrthoTopicBucket[] = [...buckets.entries()]
    .map(([subsectionId, set]) => ({
      subsectionId,
      sectionId: orthoSubsectionToSection[subsectionId] ?? "ortho-basic-science",
      concepts: [...set].sort((a, b) => a.localeCompare(b)),
    }))
    .filter((b) => b.concepts.length > 0)
    .sort((a, b) => a.subsectionId.localeCompare(b.subsectionId));

  const payload = {
    extractedAt: new Date().toISOString(),
    sourceApkg: path.basename(apkgPath),
    clozeNotes,
    conceptMentions: conceptsKept,
    uniqueConcepts: topicBuckets.reduce((n, b) => n + b.concepts.length, 0),
    buckets: topicBuckets,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(
    `Wrote ${payload.uniqueConcepts} unique concepts across ${topicBuckets.length} subsections → ${outPath}`
  );
  for (const b of topicBuckets) {
    console.log(`  ${b.subsectionId}: ${b.concepts.length}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
