import * as fs from "fs";
import * as path from "path";
import ExcelJS from "exceljs";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { sections, subsections, questions } from "@shared/schema";
import { stripHtml, categorizeQuestion, sectionOrder, subsectionTitles, subsectionOrder, subsectionToSection } from "@shared/questionImport";

const DEFAULT_PATH = "client/public/data/questions.xlsx";
const ROW_OFFSET = 12;

function cellToString(cell: ExcelJS.Cell): string {
  try {
    const t = cell.text;
    if (t != null && String(t).length > 0) return String(t);
  } catch {
    // cell.text can throw for some malformed cells
  }
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object" && "richText" in v && Array.isArray((v as { richText: { text: string }[] }).richText)) {
    return (v as { richText: { text: string }[] }).richText.map((p) => p.text).join("");
  }
  if (typeof v === "object" && "text" in v && typeof (v as { text: unknown }).text === "string") {
    return (v as { text: string }).text;
  }
  if (typeof v === "object" && "result" in v) {
    const r = (v as { result: unknown }).result;
    if (r !== null && r !== undefined && typeof r !== "object") return String(r);
  }
  return "";
}

async function parseExcel(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.worksheets[0];
  if (!ws) {
    throw new Error("Workbook has no worksheets");
  }

  const data: string[][] = [];
  ws.eachRow({ includeEmpty: true }, (row) => {
    let maxCol = 6;
    row.eachCell({ includeEmpty: true }, (_cell, colNumber) => {
      if (colNumber > maxCol) maxCol = colNumber;
    });
    const cells: string[] = [];
    for (let c = 1; c <= maxCol; c++) {
      cells.push(cellToString(row.getCell(c)));
    }
    data.push(cells);
  });

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
  const rows = await parseExcel(importPath);
  console.log("Parsed", rows.length, "questions");
  await ensureSectionsAndSubsections();
  for (const r of rows) {
    await db.insert(questions).values({ id: r.id, subsectionId: r.subsectionId, question: r.question, answer: r.answer, tags: r.tags, source: "imported" })
      .onConflictDoUpdate({ target: questions.id, set: { question: sql`excluded.question`, answer: sql`excluded.answer`, tags: sql`excluded.tags`, updatedAt: new Date() } });
  }
  console.log("Upserted", rows.length, "questions");
}

main().catch((e) => { console.error(e); process.exit(1); });
