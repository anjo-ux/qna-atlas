/**
 * Fill Ortho subsections that currently have 0 questions with original Atlas-style MCQs.
 * Uses curated topic seeds (not Anki wording) so empty taxonomy leaves get coverage.
 *
 *   ORTHO_FILL_PER_SUBSECTION=8 npm run generate:ortho-fill-empty
 */
import crypto from "crypto";
import OpenAI from "openai";
import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { sections, subsections, questions } from "@shared/schema";
import {
  ORTHO_SPECIALTY_ID,
  orthoSectionOrder,
  orthoSubsectionOrder,
  orthoSubsectionTitles,
  orthoSubsectionToSection,
} from "@shared/orthoQuestionImport";
import { validateQuestionFormat, contentRulesForGenerated } from "@shared/questionFormat";

const PER_SUBSECTION = Math.min(
  12,
  Math.max(5, parseInt(process.env.ORTHO_FILL_PER_SUBSECTION || "8", 10) || 8)
);
const CONCURRENCY = Math.min(
  4,
  Math.max(1, parseInt(process.env.ORTHO_CONCURRENCY || "3", 10) || 3)
);
const MODEL = process.env.OPENAI_QUESTION_GENERATION_MODEL || "gpt-4o-mini";

async function ensureOrthoSectionsAndSubsections(): Promise<void> {
  for (const s of orthoSectionOrder) {
    await db
      .insert(sections)
      .values({
        id: s.id,
        title: s.title,
        sortOrder: s.sortOrder,
        specialtyId: ORTHO_SPECIALTY_ID,
      })
      .onConflictDoUpdate({
        target: sections.id,
        set: {
          title: sql`excluded.title`,
          sortOrder: sql`excluded.sort_order`,
          specialtyId: sql`excluded.specialty_id`,
        },
      });
  }
  for (let i = 0; i < orthoSubsectionOrder.length; i++) {
    const subId = orthoSubsectionOrder[i];
    const sectionId = orthoSubsectionToSection[subId] ?? "ortho-basic-science";
    const title = orthoSubsectionTitles[subId] ?? subId;
    await db
      .insert(subsections)
      .values({ id: subId, sectionId, title, sortOrder: i })
      .onConflictDoUpdate({
        target: subsections.id,
        set: {
          sectionId: sql`excluded.section_id`,
          title: sql`excluded.title`,
          sortOrder: sql`excluded.sort_order`,
        },
      });
  }
}

/** Curated concept seeds for taxonomy leaves that had no Anki-mapped topics. */
const SEED_TOPICS: Record<string, string[]> = {
  "ortho-bs-biomechanics": [
    "joint reaction force hip abductors",
    "moment arm cane contralateral hand",
    "Young modulus cortical vs cancellous bone",
    "stress riser after screw hole",
    "gait cycle stance vs swing",
    "Trendelenburg gait gluteus medius",
    "poisson ratio implant materials",
    "fatigue failure cyclic loading",
  ],
  "ortho-bs-implants": [
    "titanium vs stainless steel modulus",
    "polyethylene wear osteolysis",
    "cold welding locking plate",
    "ceramic on ceramic squeaking",
    "hydroxyapatite coating osseointegration",
    "working length bridge plating",
    "notching stem fatigue",
    "cobalt chrome hypersensitivity",
  ],
  "ortho-bs-anatomy": [
    "axillary nerve quadrangular space",
    "radial nerve spiral groove",
    "sciatic nerve piriformis",
    "obturator nerve adductors",
    "blood supply femoral head",
    "ACL tibial footprint",
    "suprascapular nerve spinoglenoid",
    "sural nerve harvest anatomy",
  ],
  "ortho-bs-approaches": [
    "deltopectoral approach axillary nerve",
    "Henry approach forearm PIN",
    "Kocher approach anconeus",
    "Smith-Petersen interval hip",
    "Hardinge approach superior gluteal",
    "posterior approach sciatic",
    "extensile lateral calcaneus sural",
    "parapatellar arthrotomy TKA",
  ],
  "ortho-bs-stats-ethics": [
    "sensitivity specificity PPV",
    "number needed to treat",
    "type I vs type II error",
    "informed consent capacity",
    "conflict of interest disclosure",
    "survivorship analysis censoring",
    "bias selection confounding",
    "p value vs clinical significance",
  ],
  "ortho-sports-shoulder": [
    "Bankart soft tissue repair indications",
    "Hill-Sachs engaging lesion",
    "SLAP peel-back throwers",
    "rotator cuff partial articular",
    "AC joint Rockwood classification",
    "internal impingement GIRD",
    "pectoralis major rupture repair",
    "scapular dyskinesis therapy",
  ],
  "ortho-sports-elbow": [
    "UCL Tommy John reconstruction",
    "valgus extension overload",
    "lateral epicondylitis ECRB",
    "osteochondritis capitellum",
    "distal biceps rupture hook test",
    "posterolateral rotatory instability",
    "medial epicondylitis flexor pronator",
    "little league elbow physis",
  ],
  "ortho-sports-hip": [
    "FAI cam pincer osteoplasty",
    "labral tear repair vs debridement",
    "athletic pubalgia adductor",
    "proximal hamstring avulsion",
    "iliopsoas snapping hip",
    "gluteus medius tear MRI",
    "stress fracture femoral neck",
    "hip arthroscopy traction neurapraxia",
  ],
  "ortho-recon-knee": [
    "TKA mechanical vs kinematic alignment",
    "patellar tracking lateral release",
    "PCL retaining vs substituting",
    "unicompartmental indications",
    "periprosthetic infection MSIS",
    "flexion contracture balancing",
    "metal allergy TKA options",
    "revision stemmed components",
  ],
  "ortho-recon-shoulder": [
    "anatomic TSA rotator cuff intact",
    "reverse TSA pseudoparalysis",
    "glenoid bone loss grafting",
    "subscapularis failure TSA",
    "acromial stress fracture RSA",
    "deltopectoral vs superior approach",
    "humeral stem loosening",
    "infection two-stage revision",
  ],
  "ortho-recon-complications": [
    "PJIs DAIR indications",
    "periprosthetic fracture Vancouver",
    "instability after THA",
    "trunnionosis adverse local tissue",
    "heterotopic ossification prophylaxis",
    "nerve palsy lengthening",
    "aseptic loosening osteolysis",
    "wound healing drainage protocol",
  ],
  "ortho-hand-tendon-nerve": [
    "flexor tendon zone II repair",
    "extensor tendon central slip",
    "carpal tunnel release timing",
    "cubital tunnel transposition",
    "AIN syndrome FDP FPL",
    "PIN syndrome finger extension",
    "jersey finger FDP avulsion",
    "trigger finger A1 pulley",
  ],
  "ortho-fa-forefoot": [
    "hallux valgus osteotomy choice",
    "hallux rigidus cheilectomy vs fusion",
    "Morton neuroma interdigital",
    "claw toe PIP resection",
    "metatarsalgia Weil osteotomy",
    "sesamoid fracture nonunion",
    "bunionette type III",
    "turf toe plantar plate",
  ],
  "ortho-fa-midfoot-hindfoot": [
    "Lisfranc unstable ORIF vs fusion",
    "Navicular stress fracture",
    "Charcot midfoot reconstruction",
    "posterior tibial tendon dysfunction",
    "cavovarus Coleman block",
    "calcaneal osteotomy medial slide",
    "talar osteonecrosis staging",
    "subtalar arthritis fusion",
  ],
  "ortho-fa-trauma-recon": [
    "calcaneus joint depression ORIF",
    "talar neck Hawkins classification",
    "pilon staged fixation",
    "ankle fracture syndesmosis",
    "Achilles rupture open vs MIS",
    "Jones fracture zone 2",
    "compartment foot fasciotomy",
    "malunion calcaneus osteotomy",
  ],
  "ortho-peds-hip": [
    "DDH Pavlik harness",
    "SCFE in situ pinning",
    "Legg-Calve-Perthes containment",
    "septic hip aspiration Kocher",
    "proximal femoral focal deficiency",
    "transient synovitis vs septic",
    "AVN after SCFE",
    "closed reduction DDH spica",
  ],
  "ortho-peds-upper": [
    "supracondylar Gartland III",
    "lateral condyle Milch",
    "Monteggia Bado classification",
    "nursemaid elbow reduction",
    "clavicle fracture adolescent",
    "medial epicondyle incarceration",
    "both bone forearm cast vs fix",
    "radial neck fracture Metaizeau",
  ],
  "ortho-peds-spine": [
    "AIS bracing Risser",
    "congenital scoliosis segmentation",
    "spondylolysis bracing activity",
    "early onset growing rods",
    "Scheuermann kyphosis",
    "tethered cord red flags",
    "neuromuscular scoliosis fusion",
    "back pain red flags child",
  ],
  "ortho-peds-trauma": [
    "Salter-Harris classification",
    "femur fracture age-based treatment",
    "toddler fracture tibia",
    "triplane ankle fracture",
    "Tillaux fracture ORIF",
    "non-accidental trauma patterns",
    "open fracture Gustilo peds",
    "physeal bar resection",
  ],
  "ortho-onc-workup": [
    "Enneking staging system",
    "biopsy principles tract",
    "MRI local staging marrow",
    "bone scan vs PET mets",
    "lab workup ESR CRP SPEP",
    "skip lesions osteosarcoma",
    "chest CT pulmonary mets",
    "multidisciplinary tumor board",
  ],
  "ortho-onc-benign": [
    "osteochondroma observation",
    "unicameral bone cyst injection",
    "ABC curettage adjuvant",
    "NOF nonossifying fibroma",
    "osteoid osteoma RFA",
    "enchondroma vs chondrosarcoma",
    "GCT Campanacci grade",
    "osteoblastoma spine",
  ],
  "ortho-onc-metastatic": [
    "pathologic fracture Mirels",
    "impending fracture prophylaxis",
    "renal cell embolization",
    "spinal cord compression steroids",
    "bisphosphonate oncology",
    "solitary metastasis resection",
    "radiation for pain control",
    "unknown primary workup",
  ],
};

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_QUESTION_GENERATION_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

function buildSystemPrompt(subsectionTitle: string, count: number): string {
  return `You are an expert orthopaedic surgery board-exam question writer for Ortho Atlas.
Write ${count} NEW, UNIQUE multiple-choice questions for the subsection: "${subsectionTitle}".

Style (match PRS Atlas / high-quality board banks):
- Rich clinical vignette stems (2–5 sentences): age/sex when relevant, complaint, history, key exam and/or imaging findings, then a judgment question.
- Prefer second- and third-order reasoning. No pure one-line recall.
- Exactly 4 or 5 options on separate lines: A) B) C) D) (optional E)).
- Answer format: letter on first line as "B)" then a teaching explanation (2–5 sentences).

Critical originality rules:
- Topic concepts below are ONLY coverage hints.
- Do NOT copy or closely paraphrase those hints as the stem.
- Invent original patient scenarios.
- Do not reference images/photos/"see image".
- Avoid the word "radiographic" in the stem.
- Each question must cover a different concept.

Output: JSON array only (no markdown fences), each object:
{ "question": "...\\nA) ...\\nB) ...", "answer": "B)\\nExplanation...", "tags": ["ortho", "..."] }`;
}

function parseGeneratedJson(raw: string): Array<{ question: string; answer: string; tags?: string[] }> {
  let text = raw.trim();
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();
  const parsed = JSON.parse(text) as unknown;
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const out: Array<{ question: string; answer: string; tags?: string[] }> = [];
  for (const item of arr) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as { question?: unknown }).question === "string" &&
      typeof (item as { answer?: unknown }).answer === "string"
    ) {
      const row = item as { question: string; answer: string; tags?: unknown };
      out.push({
        question: String(row.question).slice(0, 4000),
        answer: String(row.answer).slice(0, 2000),
        tags: Array.isArray(row.tags)
          ? row.tags.filter((t): t is string => typeof t === "string").slice(0, 10)
          : undefined,
      });
    }
  }
  return out;
}

function stableQuestionId(subsectionId: string, question: string): string {
  const h = crypto
    .createHash("sha256")
    .update(subsectionId)
    .update("\n")
    .update(question)
    .digest("hex")
    .slice(0, 20);
  return `ortho-q-${h}`;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function generateForEmpty(
  openai: OpenAI,
  subsectionId: string,
  concepts: string[]
): Promise<{ created: number; skipped: number }> {
  const title = orthoSubsectionTitles[subsectionId] ?? subsectionId;
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(title, PER_SUBSECTION) },
      {
        role: "user",
        content: `Subsection id: ${subsectionId}
Cover these orthopaedic concepts (topic guidance only; write original vignettes):
${concepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Generate exactly ${PER_SUBSECTION} MCQs as a JSON array.`,
      },
    ],
    temperature: 0.75,
    max_tokens: 8000,
  });
  const content = response.choices?.[0]?.message?.content;
  if (!content) return { created: 0, skipped: 1 };

  let items: Array<{ question: string; answer: string; tags?: string[] }> = [];
  try {
    items = parseGeneratedJson(content);
  } catch (e) {
    console.error(`  parse fail ${subsectionId}:`, e);
    return { created: 0, skipped: 1 };
  }

  let created = 0;
  let skipped = 0;
  for (const item of items) {
    const fmt = validateQuestionFormat(item.question, item.answer);
    if (!fmt.valid) {
      skipped++;
      continue;
    }
    const rules = contentRulesForGenerated(item.question);
    if (!rules.pass) {
      skipped++;
      continue;
    }
    const id = stableQuestionId(subsectionId, item.question);
    const tags = Array.from(new Set([...(item.tags ?? []), "ortho", "atlas-style", subsectionId, "fill-empty"]));
    await db
      .insert(questions)
      .values({
        id,
        subsectionId,
        question: item.question,
        answer: item.answer,
        tags,
        source: "generated",
        visible: true,
      })
      .onConflictDoUpdate({
        target: questions.id,
        set: {
          question: sql`excluded.question`,
          answer: sql`excluded.answer`,
          tags: sql`excluded.tags`,
          visible: sql`excluded.visible`,
          updatedAt: new Date(),
        },
      });
    created++;
  }
  return { created, skipped };
}

async function main() {
  await ensureOrthoSectionsAndSubsections();

  const emptyIds: string[] = [];
  for (const [subsectionId, concepts] of Object.entries(SEED_TOPICS)) {
    if (!orthoSubsectionToSection[subsectionId]) continue;
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(questions)
      .where(eq(questions.subsectionId, subsectionId));
    const n = Number(row?.n ?? 0);
    if (n === 0) emptyIds.push(subsectionId);
    else console.log(`skip ${subsectionId} (already ${n})`);
  }

  console.log(
    JSON.stringify({ empty: emptyIds.length, perSubsection: PER_SUBSECTION, concurrency: CONCURRENCY, model: MODEL })
  );
  if (emptyIds.length === 0) {
    console.log("No empty seeded subsections to fill.");
    return;
  }

  const openai = getOpenAI();
  let created = 0;
  let skipped = 0;

  await mapPool(emptyIds, CONCURRENCY, async (subsectionId) => {
    const concepts = SEED_TOPICS[subsectionId] ?? [];
    process.stdout.write(`→ ${subsectionId}… `);
    try {
      const r = await generateForEmpty(openai, subsectionId, concepts);
      created += r.created;
      skipped += r.skipped;
      console.log(`created=${r.created} skipped=${r.skipped}`);
    } catch (e) {
      console.error("error", e);
      skipped += PER_SUBSECTION;
    }
  });

  console.log("Done:", { created, skipped, subsections: emptyIds.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
