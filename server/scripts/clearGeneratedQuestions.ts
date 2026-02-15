/**
 * Delete all questions with source = 'generated' from the database.
 * Run: npm run clear:generated-questions
 */
import { db } from "../db";
import { questions } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  const deleted = await db
    .delete(questions)
    .where(eq(questions.source, "generated"))
    .returning({ id: questions.id });
  console.log(`Deleted ${deleted.length} generated question(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
