/**
 * Summarize question reports from the DB: Question ID, report text, user email.
 * Run: npx tsx server/scripts/summarizeQuestionReports.ts
 */
import { storage } from "../storage";

async function main() {
  const reports = await storage.getAllQuestionReports();
  if (reports.length === 0) {
    console.log("No question reports found.");
    return;
  }
  console.log(`Total reports: ${reports.length}\n`);
  const sep = "─".repeat(80);
  for (let i = 0; i < reports.length; i++) {
    const r = reports[i];
    const email = r.userEmail?.trim() || "(anonymous)";
    console.log(`Report ${i + 1} | ${r.createdAt?.toISOString?.() ?? r.createdAt}`);
    console.log(sep);
    console.log("Question ID:", r.questionId);
    console.log("User email:", email);
    console.log("Report text:", r.message);
    console.log(sep);
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
