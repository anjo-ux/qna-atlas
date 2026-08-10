/**
 * Parsers + section mappers for validated Ortho question text banks
 * (AAOS-style vignettes and ABOS/OITE-style board review files).
 */
import { categorizeOrthoTopic, orthoSubsectionToSection } from "./orthoQuestionImport";

const NUM_TO_LETTER: Record<string, string> = {
  "1": "A",
  "2": "B",
  "3": "C",
  "4": "D",
  "5": "E",
  "6": "F",
};

export type ParsedValidatedQuestion = {
  sourceId: string;
  sourceFile: string;
  sectionCode: string; // e.g. "1A", "GP1", "SP2"
  sectionTitle: string;
  question: string; // Atlas format: stem + A) … lines
  answer: string; // Atlas format: "B)\nexplanation"
  subsectionId: string;
};

/** Map file subsection headers → default Ortho Atlas subsection. */
export const SOURCE_SECTION_TO_ORTHO: Record<string, string> = {
  "1A": "ortho-bs-bone-cartilage",
  "1B": "ortho-bs-bone-cartilage",
  "1C": "ortho-trauma-polytrauma",
  "2A": "ortho-spine-thoracolumbar",
  "2B": "ortho-spine-trauma",
  "3A": "ortho-shoulder-elbow",
  "3B": "ortho-hand-wrist",
  "4A": "ortho-recon-hip",
  "4B": "ortho-fa-ankle",
  "5A": "ortho-peds-hip",
  "5B": "ortho-peds-trauma",
  "6A": "ortho-onc-malignant",
  "6B": "ortho-onc-workup",
  // Board-review prefixes
  GP1: "ortho-bs-bone-cartilage",
  GP2: "ortho-bs-bone-cartilage",
  GP3: "ortho-trauma-polytrauma",
  SP1: "ortho-spine-thoracolumbar",
  SP2: "ortho-spine-trauma",
  UE1: "ortho-shoulder-elbow",
  UE2: "ortho-hand-wrist",
  LE1: "ortho-recon-hip",
  LE2: "ortho-fa-ankle",
  PD1: "ortho-peds-hip",
  PD2: "ortho-peds-trauma",
  NP1: "ortho-onc-malignant",
  NP2: "ortho-onc-workup",
};

function refineSubsection(defaultId: string, text: string): string {
  const { subsection } = categorizeOrthoTopic(text, "");
  // Prefer keyword refine when it stays in a related domain; otherwise keep section default.
  const related: Record<string, string[]> = {
    "ortho-bs-bone-cartilage": [
      "ortho-bs-bone-cartilage",
      "ortho-bs-biomechanics",
      "ortho-bs-implants",
      "ortho-bs-imaging",
      "ortho-bs-anatomy",
      "ortho-bs-approaches",
      "ortho-bs-stats-ethics",
    ],
    "ortho-trauma-polytrauma": [
      "ortho-trauma-polytrauma",
      "ortho-trauma-shoulder-arm",
      "ortho-trauma-forearm-wrist",
      "ortho-trauma-pelvis-acetabulum",
      "ortho-trauma-hip-femur",
      "ortho-trauma-knee-tibia",
      "ortho-trauma-foot-ankle",
    ],
    "ortho-spine-thoracolumbar": [
      "ortho-spine-thoracolumbar",
      "ortho-spine-cervical",
      "ortho-spine-deformity",
      "ortho-spine-trauma",
    ],
    "ortho-spine-trauma": [
      "ortho-spine-trauma",
      "ortho-spine-deformity",
      "ortho-spine-cervical",
      "ortho-spine-thoracolumbar",
    ],
    "ortho-shoulder-elbow": [
      "ortho-shoulder-elbow",
      "ortho-sports-shoulder",
      "ortho-sports-elbow",
      "ortho-trauma-shoulder-arm",
      "ortho-recon-shoulder",
    ],
    "ortho-hand-wrist": [
      "ortho-hand-wrist",
      "ortho-hand-trauma",
      "ortho-hand-tendon-nerve",
      "ortho-trauma-forearm-wrist",
    ],
    "ortho-recon-hip": [
      "ortho-recon-hip",
      "ortho-recon-knee",
      "ortho-recon-complications",
      "ortho-sports-hip",
      "ortho-sports-knee",
      "ortho-trauma-hip-femur",
      "ortho-trauma-knee-tibia",
    ],
    "ortho-fa-ankle": [
      "ortho-fa-ankle",
      "ortho-fa-forefoot",
      "ortho-fa-midfoot-hindfoot",
      "ortho-fa-trauma-recon",
      "ortho-trauma-foot-ankle",
    ],
    "ortho-peds-hip": [
      "ortho-peds-hip",
      "ortho-peds-lower",
      "ortho-peds-upper",
      "ortho-peds-spine",
      "ortho-peds-trauma",
    ],
    "ortho-peds-trauma": [
      "ortho-peds-trauma",
      "ortho-peds-hip",
      "ortho-peds-lower",
      "ortho-peds-upper",
      "ortho-peds-spine",
    ],
    "ortho-onc-malignant": [
      "ortho-onc-malignant",
      "ortho-onc-benign",
      "ortho-onc-workup",
      "ortho-onc-metastatic",
    ],
    "ortho-onc-workup": [
      "ortho-onc-workup",
      "ortho-onc-malignant",
      "ortho-onc-benign",
      "ortho-onc-metastatic",
    ],
  };
  const allowed = related[defaultId];
  if (allowed?.includes(subsection)) return subsection;
  return defaultId;
}

function resolveSubsection(sectionCode: string, stemAndTags: string): string {
  const key = sectionCode.toUpperCase();
  const defaultId =
    SOURCE_SECTION_TO_ORTHO[key] ||
    SOURCE_SECTION_TO_ORTHO[key.replace(/[^A-Z0-9]/g, "").slice(0, 2)] ||
    "ortho-bs-bone-cartilage";
  const refined = refineSubsection(defaultId, stemAndTags);
  return orthoSubsectionToSection[refined] ? refined : defaultId;
}

function toAtlasChoices(
  stem: string,
  choices: { letter: string; text: string }[]
): string {
  const lines = [stem.trim()];
  for (const c of choices) {
    lines.push(`${c.letter}) ${c.text.trim()}`);
  }
  return lines.join("\n");
}

function toAtlasAnswer(letter: string, explanation: string): string {
  const L = letter.toUpperCase();
  const exp = explanation.replace(/\s+/g, " ").trim();
  return `${L})\n${exp}`;
}

/** Parse AAOS-style file: Q-N / numbered 1-5 / A-N PREFERRED RESPONSE */
export function parseAaosStyleFile(text: string, sourceFile: string): ParsedValidatedQuestion[] {
  const out: ParsedValidatedQuestion[] = [];
  let sectionCode = "1A";
  let sectionTitle = "Basic science";

  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const secMatch = line.match(/^(\d[A-C])\.\s+(.+)/i);
    if (secMatch) {
      sectionCode = secMatch[1].toUpperCase();
      sectionTitle = secMatch[2].trim();
      i++;
      continue;
    }
    const qMatch = line.match(/^Q-(\d+)\s*$/);
    if (!qMatch) {
      i++;
      continue;
    }
    const qNum = qMatch[1];
    i++;
    const stemLines: string[] = [];
    while (i < lines.length && !/^[1-5]\.\s/.test(lines[i]) && !/^A-\d+/.test(lines[i])) {
      if (lines[i].trim()) stemLines.push(lines[i].trim());
      i++;
    }
    const choices: { letter: string; text: string }[] = [];
    while (i < lines.length && /^[1-5]\.\s/.test(lines[i])) {
      const m = lines[i].match(/^([1-5])\.\s*(.*)$/);
      if (!m) break;
      let choiceText = m[2].trim();
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^[1-5]\.\s/.test(lines[i]) &&
        !/^A-\d+/.test(lines[i])
      ) {
        choiceText += " " + lines[i].trim();
        i++;
      }
      choices.push({ letter: NUM_TO_LETTER[m[1]], text: choiceText });
    }
    // Skip to A-N
    while (i < lines.length && !new RegExp(`^A-${qNum}\\b`).test(lines[i])) i++;
    if (i >= lines.length) break;
    i++; // skip A-N line
    let preferred = "";
    let explanation = "";
    if (i < lines.length && /PREFERRED RESPONSE:\s*([1-5])/i.test(lines[i])) {
      preferred = lines[i].match(/PREFERRED RESPONSE:\s*([1-5])/i)![1];
      i++;
    }
    const expLines: string[] = [];
    while (
      i < lines.length &&
      !/^Q-\d+\s*$/.test(lines[i]) &&
      !/^={5,}/.test(lines[i]) &&
      !/^\d[A-C]\.\s/i.test(lines[i]) &&
      !/^SECTION\s/i.test(lines[i])
    ) {
      if (lines[i].trim()) expLines.push(lines[i].trim());
      i++;
    }
    explanation = expLines.join(" ");
    const letter = NUM_TO_LETTER[preferred];
    if (!letter || choices.length < 2 || stemLines.length === 0) continue;
    const stem = stemLines.join(" ");
    const question = toAtlasChoices(stem, choices);
    const answer = toAtlasAnswer(letter, explanation);
    const subsectionId = resolveSubsection(sectionCode, `${sectionTitle} ${stem}`);
    out.push({
      sourceId: `aaos-Q-${qNum}`,
      sourceFile,
      sectionCode,
      sectionTitle,
      question,
      answer,
      subsectionId,
    });
  }
  return out;
}

/** Parse board-review file: ID. stem / A-E / ANSWER: / EXPLANATION: */
export function parseBoardReviewFile(text: string, sourceFile: string): ParsedValidatedQuestion[] {
  const out: ParsedValidatedQuestion[] = [];
  let sectionCode = "GP1";
  let sectionTitle = "Basic science";

  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const header = line.match(/^(\d[A-C])\.\s+(.+)/i);
    if (header) {
      sectionCode = header[1].toUpperCase();
      sectionTitle = header[2].trim();
      i++;
      continue;
    }
    const qStart = line.match(/^([A-Z]{1,3}\d?)-(\d+)\.\s*(.*)$/);
    if (!qStart) {
      i++;
      continue;
    }
    const prefix = qStart[1].toUpperCase();
    const num = qStart[2];
    let stem = qStart[3].trim();
    i++;
    while (
      i < lines.length &&
      !/^\s*[A-E]\.\s/.test(lines[i]) &&
      !/^ANSWER:/i.test(lines[i]) &&
      !/^[A-Z]{1,3}\d?-\d+\./.test(lines[i])
    ) {
      if (lines[i].trim()) stem += " " + lines[i].trim();
      i++;
    }
    const choices: { letter: string; text: string }[] = [];
    while (i < lines.length && /^\s*[A-E]\.\s/.test(lines[i])) {
      const m = lines[i].match(/^\s*([A-E])\.\s*(.*)$/);
      if (!m) break;
      let choiceText = m[2].trim();
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^\s*[A-E]\.\s/.test(lines[i]) &&
        !/^ANSWER:/i.test(lines[i]) &&
        !/^[A-Z]{1,3}\d?-\d+\./.test(lines[i])
      ) {
        choiceText += " " + lines[i].trim();
        i++;
      }
      choices.push({ letter: m[1].toUpperCase(), text: choiceText });
    }
    while (i < lines.length && !/^ANSWER:/i.test(lines[i])) {
      if (/^[A-Z]{1,3}\d?-\d+\./.test(lines[i])) break;
      i++;
    }
    if (i >= lines.length || !/^ANSWER:/i.test(lines[i])) continue;
    const ansLetter = lines[i].match(/^ANSWER:\s*([A-E])/i)?.[1]?.toUpperCase() ?? "";
    i++;
    let explanation = "";
    if (i < lines.length && /^EXPLANATION:\s*/i.test(lines[i])) {
      explanation = lines[i].replace(/^EXPLANATION:\s*/i, "").trim();
      i++;
      while (
        i < lines.length &&
        !/^[A-Z]{1,3}\d?-\d+\./.test(lines[i]) &&
        !/^={5,}/.test(lines[i]) &&
        !/^\d[A-C]\.\s/i.test(lines[i]) &&
        !/^SECTION\s/i.test(lines[i])
      ) {
        if (lines[i].trim()) explanation += " " + lines[i].trim();
        i++;
      }
    }
    if (!ansLetter || choices.length < 2 || !stem) continue;
    const question = toAtlasChoices(stem, choices);
    const answer = toAtlasAnswer(ansLetter, explanation);
    const code = prefix; // GP1, SP2, etc.
    const subsectionId = resolveSubsection(code, `${sectionTitle} ${stem}`);
    out.push({
      sourceId: `board-${prefix}-${num}`,
      sourceFile,
      sectionCode: code,
      sectionTitle,
      question,
      answer,
      subsectionId,
    });
  }
  return out;
}

export function normalizeForSimilarity(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function similarityRatio(a: string, b: string): number {
  const aw = new Set(normalizeForSimilarity(a).split(/\s+/).filter((w) => w.length > 2));
  const bw = new Set(normalizeForSimilarity(b).split(/\s+/).filter((w) => w.length > 2));
  if (aw.size < 5 || bw.size < 5) return 0;
  let overlap = 0;
  for (const w of aw) if (bw.has(w)) overlap++;
  return overlap / Math.min(aw.size, bw.size);
}

/** True if stems are near-duplicates (prefer validated import over generated). */
export function isNearDuplicate(a: string, b: string, threshold = 0.62): boolean {
  return similarityRatio(a, b) >= threshold;
}
