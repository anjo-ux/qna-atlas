/**
 * 1) Delete all questions that fail format validation (invalid).
 * 2) Hide questions containing "picture" or "pictured" (set visible = false).
 * Run: npx tsx server/scripts/cleanupQuestions.ts
 * Ensure migration 0001_add_questions_visible has been applied (db:push) first.
 */
import { db } from "../db";
import { questions } from "@shared/schema";
import { validateQuestionFormat } from "@shared/questionFormat";
import { inArray, or, ilike } from "drizzle-orm";

async function main() {
  const all = await db.select().from(questions);
  const invalidIds: string[] = [];

  for (const row of all) {
    const result = validateQuestionFormat(row.question, row.answer);
    if (!result.valid) invalidIds.push(row.id);
  }

  console.log(`Invalid questions to delete: ${invalidIds.length}`);
  if (invalidIds.length > 0) {
    const deleted = await db.delete(questions).where(inArray(questions.id, invalidIds)).returning({ id: questions.id });
    console.log(`Deleted ${deleted.length} invalid questions.`);
  }

  // Hide questions containing "picture", "pictured", or "photo" in the question (set visible = false)
  const hidden = await db
    .update(questions)
    .set({ visible: false, updatedAt: new Date() })
    .where(
      or(
        ilike(questions.question, "%picture%"),
        ilike(questions.question, "%pictured%"),
        ilike(questions.question, "%photo%")
      )
    )
    .returning({ id: questions.id });

  console.log(`Hidden ${hidden.length} questions containing "picture", "pictured", or "photo".`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
