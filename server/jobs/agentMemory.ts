import { createHash } from "crypto";

export type LessonDraft = {
  category: string;
  lesson: string;
};

export function lessonFingerprint(lesson: string): string {
  const norm = lesson.toLowerCase().replace(/\s+/g, " ").trim();
  return createHash("sha256").update(norm).digest("hex");
}

export function parseLessonDrafts(raw: string): LessonDraft[] {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: LessonDraft[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const lesson = typeof o.lesson === "string" ? o.lesson.trim() : "";
    const category = typeof o.category === "string" ? o.category.trim().slice(0, 64) : "general";
    if (lesson.length < 12) continue;
    out.push({ category: category || "general", lesson: lesson.slice(0, 800) });
  }
  return out;
}

export function formatMemoryBlock(
  lessons: { category: string; lesson: string }[],
  maxChars = 6000
): string {
  if (lessons.length === 0) return "";
  const lines = ["Persistent editorial memory (apply these rules on every pass):"];
  for (const l of lessons) {
    lines.push(`- [${l.category}] ${l.lesson}`);
  }
  let text = lines.join("\n");
  if (text.length > maxChars) text = `${text.slice(0, maxChars - 1)}…`;
  return text;
}

export function revisionFinetuneMessages(params: {
  system: string;
  user: string;
  assistant: string;
}): { role: string; content: string }[] {
  return [
    { role: "system", content: params.system },
    { role: "user", content: params.user },
    { role: "assistant", content: params.assistant },
  ];
}
