/**
 * Export stored revision examples as OpenAI-style chat JSONL.
 *   npm run export:finetune > finetune-revisions.jsonl
 */
import { storage } from "../storage";

async function main() {
  const rows = await storage.listFinetuneExamples("revision", 10000);
  for (const row of rows) {
    const messages = (row.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    if (messages.length < 2) continue;
    process.stdout.write(`${JSON.stringify({ messages })}\n`);
  }
  console.error(`Wrote ${rows.length} examples to stdout`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
