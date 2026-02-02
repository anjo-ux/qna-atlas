import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { sections, subsections, questions } from "@shared/schema";
import { stripHtml, categorizeQuestion, sectionOrder, subsectionTitles, subsectionOrder, subsectionToSection } from "@shared/questionImport";

const DEFAULT_PATH = "client/public/data/questions.xlsx";
const ROW_OFFSET = 12;

function parseExcel(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
  const out: Array<{ id: string; question: string; answer: string; sectionId: string; subsectionId: string; tags: string[] }> = [];
  for (let i = ROW_OFFSET; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 6) continue;
    const id = String(row[0] ?? "").trim() || "q-" + i;
    const categoryPath = String(row[2] ?? "").trim();
    const qh = String(row[3] ?? "").trim();
    const ah = String(row[4] ?? "").trim();
    const tagsRaw = String(row[5] ?? "").trim();
    if (!qh || !ah) continue;
    const parts = categoryPath.split("::").map((p: string) => p.trim());
    const category = parts[parts.length - 2] || parts[0] || "";
    const subcategory = parts[parts.length - 1] || "";
    const { section: sectionId, subsection: subsectionId } = categorizeQuestion(category, subcategory);
    out.push({ id, question: stripHtml(qh), answer: stripHtml(ah), sectionId, subsectionId, tags: tagsRaw ? tagsRaw.split(/\s+/).filter(Boolean) : [] });
  }
  return out;
}

async function ensureSectionsAndSubsections() {
  for (const s of sectionOrder) {
    await db.insert(sections).values({ id: s.id, title: s.title, sortOrder: s.sortOrder }).onConflictDoNothing({ target: sections.id });
  }
  for (let i = 0; i < subsectionOrder.length; i++) {
    const subId = subsectionOrder[i];
    const sectionId = subsectionToSection[subId] ?? "comprehensive";
    const title = subsectionTitles[subId] ?? subId;
    await db.insert(subsections).values({ id: subId, sectionId, title, sortOrder: i }).onConflictDoNothing({ target: subsections.id });
  }
}

async function main() {
  const importPath = process.env.IMPORT_PATH || path.join(process.cwd(), DEFAULT_PATH);
  if (!fs.existsSync(importPath)) {
    console.error("File not found:", importPath);
    process.exit(1);
  }
  console.log("Importing from", importPath);
  const rows = parseExcel(importPath);
  console.log("Parsed", rows.length, "questions");
  await ensureSectionsAndSubsections();
  for (const r of rows) {
    await db.insert(questions).values({ id: r.id, subsectionId: r.subsectionId, question: r.question, answer: r.answer, tags: r.tags, source: "imported" })
      .onConflictDoUpdate({ target: questions.id, set: { question: sql`excluded.question`, answer: sql`excluded.answer`, tags: sql`excluded.tags`, updatedAt: new Date() } });
  }
  console.log("Upserted", rows.length, "questions");
}

main().catch((e) => { console.error(e); process.exit(1); });
