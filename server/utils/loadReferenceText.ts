/**
 * Load textbook/reference text for AI question generation.
 * Supports .docx (via mammoth) or .txt. Used by the scheduled generation job.
 */
import * as fs from "fs";
import * as path from "path";
import mammoth from "mammoth";

const DEFAULT_REFERENCE_PATH = "client/public/data/reference-text.docx";
const MAX_REF_CHARS = 80_000; // ~20k tokens; leave room for prompt + questions

export function getReferencePath(): string {
  return process.env.QUESTION_REFERENCE_PATH || path.join(process.cwd(), DEFAULT_REFERENCE_PATH);
}

/**
 * Load reference text from .docx (mammoth → strip HTML) or .txt.
 * Returns plain text, truncated to MAX_REF_CHARS. Empty string if file missing or error.
 */
export async function loadReferenceText(): Promise<string> {
  const filePath = getReferencePath();
  if (!fs.existsSync(filePath)) {
    return "";
  }
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === ".docx") {
      const buf = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: buf as Buffer });
      const text = (result.value || "").trim();
      return text.length > MAX_REF_CHARS ? text.slice(0, MAX_REF_CHARS) + "\n\n[truncated]" : text;
    }
    if (ext === ".txt") {
      const text = fs.readFileSync(filePath, "utf-8").trim();
      return text.length > MAX_REF_CHARS ? text.slice(0, MAX_REF_CHARS) + "\n\n[truncated]" : text;
    }
  } catch (err) {
    console.error("[loadReferenceText]", err);
  }
  return "";
}
