/**
 * Hide currently flagged Ortho validation items (and any content-flagged set)
 * using the durable questions.flagged column. Specialty-agnostic API.
 *
 *   npm run apply:question-flags
 *   FLAG_PATH=server/data/orthoValidationFlags.json npm run apply:question-flags
 */
import * as fs from "fs";
import * as path from "path";
import { storage } from "../storage";

const FLAG_PATH =
  process.env.FLAG_PATH || path.join(process.cwd(), "server", "data", "orthoValidationFlags.json");

async function main() {
  if (!fs.existsSync(FLAG_PATH)) {
    console.error("Flag file not found:", FLAG_PATH);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(FLAG_PATH, "utf8")) as {
    flags?: { id: string }[];
  };
  const ids = Array.from(new Set((raw.flags ?? []).map((f) => f.id).filter(Boolean)));
  console.log(`Applying flags to ${ids.length} question(s) from ${FLAG_PATH}`);

  let ok = 0;
  let missing = 0;
  for (const id of ids) {
    const success = await storage.flagQuestion(id, "validation-flagged");
    if (success) ok++;
    else missing++;
  }
  console.log({ flagged: ok, missing });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
