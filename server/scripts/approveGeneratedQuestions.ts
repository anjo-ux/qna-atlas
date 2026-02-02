/**
 * Approve generated questions (set visible = true) so they go live.
 * Usage:
 *   npm run approve:questions              -- approve all generated+hidden that pass validation
 *   npm run approve:questions -- id1 id2  -- approve only the given question IDs
 * Run after db:push. Requires DATABASE_URL.
 */
import { db } from "../db";
import { questions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { storage } from "../storage";
import { validateQuestionFormat, contentRulesForGenerated } from "@shared/questionFormat";

async function main() {
  const idsFromArgs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (idsFromArgs.length > 0) {
    let approved = 0;
    for (const id of idsFromArgs) {
      const ok = await storage.updateQuestionVisibility(id, true);
      if (ok) approved++;
      else console.warn("Question not found or update failed:", id);
    }
    console.log(`Approved ${approved} of ${idsFromArgs.length} requested IDs.`);
    return;
  }
  const generatedHidden = await db
    .select()
    .from(questions)
    .where(and(eq(questions.source, "generated"), eq(questions.visible, false)));
  let approved = 0;
  let skipped = 0;
  for (const row of generatedHidden) {
    const formatResult = validateQuestionFormat(row.question, row.answer);
    if (!formatResult.valid) {
      skipped++;
      continue;
    }
    const contentResult = contentRulesForGenerated(row.question);
    if (!contentResult.pass) {
      skipped++;
      continue;
    }
    const ok = await storage.updateQuestionVisibility(row.id, true);
    if (ok) approved++;
  }
  console.log(`Approved ${approved} generated questions (skipped ${skipped} that failed validation or content rules).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
