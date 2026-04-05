/**
 * Set visible=false for questions whose MCQ choices reference an image (e.g. "see image above").
 * Run after deploy: npx tsx server/scripts/hideSeeImageChoiceQuestions.ts
 */
import { db } from "../db";
import { questions } from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import { questionMcqChoicesReferenceSeeImage } from "@shared/questionFormat";

async function main() {
  const all = await db.select().from(questions);
  const ids: string[] = [];
  for (const row of all) {
    if (!row.visible) continue;
    if (questionMcqChoicesReferenceSeeImage(row.question)) ids.push(row.id);
  }
  console.log(`Questions with "see image" in choices (currently visible): ${ids.length}`);
  if (ids.length === 0) {
    console.log("Done.");
    return;
  }
  const updated = await db
    .update(questions)
    .set({ visible: false, updatedAt: new Date() })
    .where(and(inArray(questions.id, ids), eq(questions.visible, true)))
    .returning({ id: questions.id });
  console.log(`Set visible=false for ${updated.length} question(s).`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
