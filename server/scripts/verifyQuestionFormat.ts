/**
 * Verify every question in the DB has the required format:
 * - question text
 * - answer choices (A, B, C, D, etc., at least 2)
 * - show answer (correct letter detectable)
 * - answer explanation
 * Run: npx tsx server/scripts/verifyQuestionFormat.ts
 */
import { db } from "../db";
import { questions } from "@shared/schema";
import { validateQuestionFormat } from "@shared/questionFormat";

async function main() {
  const all = await db.select().from(questions);
  let invalid = 0;
  const invalidDetails: { id: string; errors: string[]; choiceCount: number; correctAnswer: string | null }[] = [];

  for (const row of all) {
    const result = validateQuestionFormat(row.question, row.answer);
    if (!result.valid) {
      invalid++;
      invalidDetails.push({
        id: row.id,
        errors: result.errors,
        choiceCount: result.choiceCount,
        correctAnswer: result.correctAnswer,
      });
    }
  }

  console.log(`Total questions: ${all.length}`);
  console.log(`Valid: ${all.length - invalid}`);
  console.log(`Invalid: ${invalid}`);

  if (invalidDetails.length > 0) {
    console.log("\nInvalid question IDs and errors:");
    for (const d of invalidDetails) {
      console.log(`  ${d.id}: ${d.errors.join("; ")} (choices=${d.choiceCount}, correct=${d.correctAnswer ?? "none"})`);
    }
    process.exit(1);
  }

  console.log("\nAll questions have valid format (question, choices A-D, show answer, answer explanation).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
