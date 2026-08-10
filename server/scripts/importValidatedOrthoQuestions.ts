/**
 * Import validated Ortho question text banks into the Ortho specialty q-bank.
 * Deduplicates against existing Ortho questions (skips near-duplicates; optionally
 * replaces generated near-duplicates with the validated text).
 *
 *   npm run import:ortho-validated
 */
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import { sql, like } from "drizzle-orm";
import { db } from "../db";
import { sections, subsections, questions } from "@shared/schema";
import {
  ORTHO_SPECIALTY_ID,
  orthoSectionOrder,
  orthoSubsectionOrder,
  orthoSubsectionTitles,
  orthoSubsectionToSection,
} from "@shared/orthoQuestionImport";
import {
  parseAaosStyleFile,
  parseBoardReviewFile,
  isNearDuplicate,
  type ParsedValidatedQuestion,
} from "@shared/orthoValidatedImport";
import { validateQuestionFormat } from "@shared/questionFormat";

const AAOS_PATH =
  process.env.ORTHO_AAOS_PATH ||
  path.join(process.cwd(), "attached_assets", "aaos_style_questions-2.txt");
const BOARD_PATH =
  process.env.ORTHO_BOARD_PATH ||
  path.join(process.cwd(), "attached_assets", "ortho_board_review_questions-3.txt");

const REPLACE_GENERATED_DUPES = process.env.ORTHO_REPLACE_GENERATED_DUPES !== "0";

async function ensureOrthoSectionsAndSubsections(): Promise<void> {
  for (const s of orthoSectionOrder) {
    await db
      .insert(sections)
      .values({
        id: s.id,
        title: s.title,
        sortOrder: s.sortOrder,
        specialtyId: ORTHO_SPECIALTY_ID,
      })
      .onConflictDoUpdate({
        target: sections.id,
        set: {
          title: sql`excluded.title`,
          sortOrder: sql`excluded.sort_order`,
          specialtyId: sql`excluded.specialty_id`,
        },
      });
  }
  for (let i = 0; i < orthoSubsectionOrder.length; i++) {
    const subId = orthoSubsectionOrder[i];
    const sectionId = orthoSubsectionToSection[subId] ?? "ortho-basic-science";
    const title = orthoSubsectionTitles[subId] ?? subId;
    await db
      .insert(subsections)
      .values({ id: subId, sectionId, title, sortOrder: i })
      .onConflictDoUpdate({
        target: subsections.id,
        set: {
          sectionId: sql`excluded.section_id`,
          title: sql`excluded.title`,
          sortOrder: sql`excluded.sort_order`,
        },
      });
  }
}

function stableId(sourceId: string, question: string): string {
  const h = crypto.createHash("sha256").update(sourceId).update("\n").update(question).digest("hex").slice(0, 20);
  return `ortho-val-${h}`;
}

async function main() {
  await ensureOrthoSectionsAndSubsections();

  const parsed: ParsedValidatedQuestion[] = [];
  if (fs.existsSync(AAOS_PATH)) {
    const aaos = parseAaosStyleFile(fs.readFileSync(AAOS_PATH, "utf8"), path.basename(AAOS_PATH));
    console.log(`Parsed AAOS-style: ${aaos.length}`);
    parsed.push(...aaos);
  } else {
    console.warn("Missing", AAOS_PATH);
  }
  if (fs.existsSync(BOARD_PATH)) {
    const board = parseBoardReviewFile(fs.readFileSync(BOARD_PATH, "utf8"), path.basename(BOARD_PATH));
    console.log(`Parsed board-review: ${board.length}`);
    parsed.push(...board);
  } else {
    console.warn("Missing", BOARD_PATH);
  }

  // Format-filter
  const valid: ParsedValidatedQuestion[] = [];
  let formatSkipped = 0;
  for (const p of parsed) {
    const fmt = validateQuestionFormat(p.question, p.answer);
    if (!fmt.valid) {
      formatSkipped++;
      console.warn(`format skip ${p.sourceId}: ${fmt.errors.join("; ")}`);
      continue;
    }
    valid.push(p);
  }
  console.log(`Format-valid: ${valid.length} (skipped ${formatSkipped})`);

  const existing = await db
    .select({
      id: questions.id,
      question: questions.question,
      answer: questions.answer,
      subsectionId: questions.subsectionId,
      source: questions.source,
      tags: questions.tags,
    })
    .from(questions)
    .where(like(questions.id, "ortho-%"));

  console.log(`Existing Ortho questions: ${existing.length}`);

  let imported = 0;
  let skippedDup = 0;
  let replacedGenerated = 0;

  for (const p of valid) {
    const dup = existing.find((e) => isNearDuplicate(e.question, p.question));
    if (dup) {
      const tags = Array.isArray(dup.tags) ? dup.tags : [];
      const isGenerated = dup.source === "generated" || tags.includes("atlas-style");
      if (REPLACE_GENERATED_DUPES && isGenerated) {
        await db
          .update(questions)
          .set({
            question: p.question,
            answer: p.answer,
            subsectionId: p.subsectionId,
            tags: Array.from(
              new Set([
                ...tags.filter((t) => t !== "atlas-style" && t !== "fill-empty"),
                "ortho",
                "validated-import",
                p.sourceFile,
                p.sourceId,
                p.subsectionId,
              ])
            ),
            source: "imported",
            visible: true,
            updatedAt: new Date(),
          })
          .where(sql`${questions.id} = ${dup.id}`);
        replacedGenerated++;
        // Update in-memory so later items don't rematch the old stem
        dup.question = p.question;
        dup.answer = p.answer;
        dup.source = "imported";
        continue;
      }
      skippedDup++;
      continue;
    }

    const id = stableId(p.sourceId, p.question);
    await db
      .insert(questions)
      .values({
        id,
        subsectionId: p.subsectionId,
        question: p.question,
        answer: p.answer,
        tags: ["ortho", "validated-import", p.sourceFile, p.sourceId, p.subsectionId],
        source: "imported",
        visible: true,
      })
      .onConflictDoUpdate({
        target: questions.id,
        set: {
          question: sql`excluded.question`,
          answer: sql`excluded.answer`,
          subsectionId: sql`excluded.subsection_id`,
          tags: sql`excluded.tags`,
          source: sql`excluded.source`,
          visible: sql`excluded.visible`,
          updatedAt: new Date(),
        },
      });
    imported++;
    existing.push({
      id,
      question: p.question,
      answer: p.answer,
      subsectionId: p.subsectionId,
      source: "imported",
      tags: ["validated-import"],
    });
  }

  // Subsection distribution
  const bySub = new Map<string, number>();
  for (const p of valid) bySub.set(p.subsectionId, (bySub.get(p.subsectionId) ?? 0) + 1);

  console.log(
    JSON.stringify(
      {
        imported,
        replacedGenerated,
        skippedDup,
        formatSkipped,
        parsedTotal: parsed.length,
        bySubsection: Object.fromEntries([...bySub.entries()].sort()),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
