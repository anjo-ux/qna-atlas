/**
 * Ortho Atlas question-bank taxonomy (sections → subsections) and deck/tag mappers.
 * Section/subsection ids are globally unique via the `ortho-` prefix (see specialties.contentIdPrefix).
 */

export const ORTHO_SPECIALTY_ID = "ortho" as const;

export const orthoSectionOrder: { id: string; title: string; sortOrder: number }[] = [
  { id: "ortho-basic-science", title: "Section 1: Basic Science", sortOrder: 0 },
  { id: "ortho-trauma", title: "Section 2: Trauma", sortOrder: 1 },
  { id: "ortho-sports", title: "Section 3: Sports Medicine", sortOrder: 2 },
  { id: "ortho-spine", title: "Section 4: Spine", sortOrder: 3 },
  { id: "ortho-adult-recon", title: "Section 5: Adult Reconstruction", sortOrder: 4 },
  { id: "ortho-hand-upper", title: "Section 6: Hand & Upper Extremity", sortOrder: 5 },
  { id: "ortho-foot-ankle", title: "Section 7: Foot & Ankle", sortOrder: 6 },
  { id: "ortho-pediatrics", title: "Section 8: Pediatrics", sortOrder: 7 },
  { id: "ortho-oncology", title: "Section 9: Oncology", sortOrder: 8 },
];

/** subsectionId → display title */
export const orthoSubsectionTitles: Record<string, string> = {
  // Basic science
  "ortho-bs-bone-cartilage": "Bone, Cartilage & Soft Tissue Biology",
  "ortho-bs-biomechanics": "Biomechanics & Gait",
  "ortho-bs-implants": "Implants & Biomaterials",
  "ortho-bs-imaging": "Imaging Principles",
  "ortho-bs-anatomy": "Regional Anatomy",
  "ortho-bs-approaches": "Surgical Approaches",
  "ortho-bs-stats-ethics": "Statistics, Ethics & Practice",
  // Trauma
  "ortho-trauma-shoulder-arm": "Shoulder, Humerus & Elbow Trauma",
  "ortho-trauma-forearm-wrist": "Forearm & Wrist Trauma",
  "ortho-trauma-pelvis-acetabulum": "Pelvis & Acetabulum",
  "ortho-trauma-hip-femur": "Hip & Femur Trauma",
  "ortho-trauma-knee-tibia": "Knee & Tibia Trauma",
  "ortho-trauma-foot-ankle": "Foot & Ankle Trauma",
  "ortho-trauma-polytrauma": "Polytrauma & Principles",
  // Sports
  "ortho-sports-shoulder": "Shoulder Sports Injuries",
  "ortho-sports-elbow": "Elbow Sports Injuries",
  "ortho-sports-hip": "Hip Sports Injuries",
  "ortho-sports-knee": "Knee Sports Injuries",
  // Spine
  "ortho-spine-cervical": "Cervical Spine",
  "ortho-spine-thoracolumbar": "Thoracolumbar Spine",
  "ortho-spine-deformity": "Spinal Deformity",
  "ortho-spine-trauma": "Spine Trauma",
  // Adult recon
  "ortho-recon-hip": "Hip Arthroplasty",
  "ortho-recon-knee": "Knee Arthroplasty",
  "ortho-recon-shoulder": "Shoulder Arthroplasty",
  "ortho-recon-complications": "Arthroplasty Complications",
  // Hand & upper
  "ortho-hand-trauma": "Hand Trauma",
  "ortho-hand-wrist": "Wrist Disorders",
  "ortho-hand-tendon-nerve": "Tendons, Nerves & Soft Tissue",
  "ortho-shoulder-elbow": "Shoulder & Elbow Disorders",
  // Foot & ankle
  "ortho-fa-forefoot": "Forefoot",
  "ortho-fa-midfoot-hindfoot": "Midfoot & Hindfoot",
  "ortho-fa-ankle": "Ankle Disorders",
  "ortho-fa-trauma-recon": "Foot & Ankle Trauma & Reconstruction",
  // Pediatrics
  "ortho-peds-hip": "Pediatric Hip",
  "ortho-peds-lower": "Pediatric Lower Extremity",
  "ortho-peds-upper": "Pediatric Upper Extremity",
  "ortho-peds-spine": "Pediatric Spine",
  "ortho-peds-trauma": "Pediatric Trauma",
  // Oncology
  "ortho-onc-workup": "Tumor Workup & Staging",
  "ortho-onc-benign": "Benign Bone & Soft Tissue Tumors",
  "ortho-onc-malignant": "Malignant Bone & Soft Tissue Tumors",
  "ortho-onc-metastatic": "Metastatic Disease",
};

export const orthoSubsectionOrder = Object.keys(orthoSubsectionTitles);

/** subsectionId → sectionId */
export const orthoSubsectionToSection: Record<string, string> = {
  "ortho-bs-bone-cartilage": "ortho-basic-science",
  "ortho-bs-biomechanics": "ortho-basic-science",
  "ortho-bs-implants": "ortho-basic-science",
  "ortho-bs-imaging": "ortho-basic-science",
  "ortho-bs-anatomy": "ortho-basic-science",
  "ortho-bs-approaches": "ortho-basic-science",
  "ortho-bs-stats-ethics": "ortho-basic-science",
  "ortho-trauma-shoulder-arm": "ortho-trauma",
  "ortho-trauma-forearm-wrist": "ortho-trauma",
  "ortho-trauma-pelvis-acetabulum": "ortho-trauma",
  "ortho-trauma-hip-femur": "ortho-trauma",
  "ortho-trauma-knee-tibia": "ortho-trauma",
  "ortho-trauma-foot-ankle": "ortho-trauma",
  "ortho-trauma-polytrauma": "ortho-trauma",
  "ortho-sports-shoulder": "ortho-sports",
  "ortho-sports-elbow": "ortho-sports",
  "ortho-sports-hip": "ortho-sports",
  "ortho-sports-knee": "ortho-sports",
  "ortho-spine-cervical": "ortho-spine",
  "ortho-spine-thoracolumbar": "ortho-spine",
  "ortho-spine-deformity": "ortho-spine",
  "ortho-spine-trauma": "ortho-spine",
  "ortho-recon-hip": "ortho-adult-recon",
  "ortho-recon-knee": "ortho-adult-recon",
  "ortho-recon-shoulder": "ortho-adult-recon",
  "ortho-recon-complications": "ortho-adult-recon",
  "ortho-hand-trauma": "ortho-hand-upper",
  "ortho-hand-wrist": "ortho-hand-upper",
  "ortho-hand-tendon-nerve": "ortho-hand-upper",
  "ortho-shoulder-elbow": "ortho-hand-upper",
  "ortho-fa-forefoot": "ortho-foot-ankle",
  "ortho-fa-midfoot-hindfoot": "ortho-foot-ankle",
  "ortho-fa-ankle": "ortho-foot-ankle",
  "ortho-fa-trauma-recon": "ortho-foot-ankle",
  "ortho-peds-hip": "ortho-pediatrics",
  "ortho-peds-lower": "ortho-pediatrics",
  "ortho-peds-upper": "ortho-pediatrics",
  "ortho-peds-spine": "ortho-pediatrics",
  "ortho-peds-trauma": "ortho-pediatrics",
  "ortho-onc-workup": "ortho-oncology",
  "ortho-onc-benign": "ortho-oncology",
  "ortho-onc-malignant": "ortho-oncology",
  "ortho-onc-metastatic": "ortho-oncology",
};

/**
 * Map Anki deck path / tags (lowercased) → Ortho subsection.
 * Order matters: first matching keyword wins.
 */
export const orthoCategoryMapping: { key: string; subsection: string }[] = [
  // Oncology
  { key: "oncology", subsection: "ortho-onc-malignant" },
  { key: "tumor", subsection: "ortho-onc-workup" },
  { key: "metastat", subsection: "ortho-onc-metastatic" },
  { key: "sarcoma", subsection: "ortho-onc-malignant" },
  { key: "benign bone", subsection: "ortho-onc-benign" },
  // Pediatrics
  { key: "pediatrics", subsection: "ortho-peds-lower" },
  { key: "pediatric", subsection: "ortho-peds-lower" },
  { key: "peds", subsection: "ortho-peds-lower" },
  { key: "scfe", subsection: "ortho-peds-hip" },
  { key: "ddh", subsection: "ortho-peds-hip" },
  { key: "legg-calve", subsection: "ortho-peds-hip" },
  { key: "clubfoot", subsection: "ortho-peds-lower" },
  // Recon
  { key: "recon", subsection: "ortho-recon-hip" },
  { key: "arthroplasty", subsection: "ortho-recon-hip" },
  { key: "tha", subsection: "ortho-recon-hip" },
  { key: "tka", subsection: "ortho-recon-knee" },
  { key: "revision", subsection: "ortho-recon-complications" },
  { key: "periprosthetic", subsection: "ortho-recon-complications" },
  // Sports
  { key: "knee and sports", subsection: "ortho-sports-knee" },
  { key: "sports", subsection: "ortho-sports-knee" },
  { key: "acl", subsection: "ortho-sports-knee" },
  { key: "meniscus", subsection: "ortho-sports-knee" },
  { key: "rotator", subsection: "ortho-sports-shoulder" },
  { key: "labrum", subsection: "ortho-sports-shoulder" },
  { key: "ucl", subsection: "ortho-sports-elbow" },
  // Spine
  { key: "spine trauma", subsection: "ortho-spine-trauma" },
  { key: "cervical", subsection: "ortho-spine-cervical" },
  { key: "scoliosis", subsection: "ortho-spine-deformity" },
  { key: "deformity", subsection: "ortho-spine-deformity" },
  { key: "spine", subsection: "ortho-spine-thoracolumbar" },
  { key: "lumbar", subsection: "ortho-spine-thoracolumbar" },
  // Trauma regions
  { key: "polytrauma", subsection: "ortho-trauma-polytrauma" },
  { key: "external fixation", subsection: "ortho-trauma-polytrauma" },
  { key: "pelvis and acetabulum", subsection: "ortho-trauma-pelvis-acetabulum" },
  { key: "pelvis", subsection: "ortho-trauma-pelvis-acetabulum" },
  { key: "acetabulum", subsection: "ortho-trauma-pelvis-acetabulum" },
  { key: "femur", subsection: "ortho-trauma-hip-femur" },
  { key: "thigh/hip", subsection: "ortho-trauma-hip-femur" },
  { key: "hip", subsection: "ortho-trauma-hip-femur" },
  { key: "tibia and fibula", subsection: "ortho-trauma-knee-tibia" },
  { key: "tibia", subsection: "ortho-trauma-knee-tibia" },
  { key: "leg/knee", subsection: "ortho-trauma-knee-tibia" },
  { key: "knee", subsection: "ortho-trauma-knee-tibia" },
  { key: "leg", subsection: "ortho-trauma-knee-tibia" },
  { key: "foot and ankle", subsection: "ortho-trauma-foot-ankle" },
  { key: "foot/ankle", subsection: "ortho-fa-ankle" },
  { key: "foot & ankle", subsection: "ortho-fa-ankle" },
  { key: "ankle", subsection: "ortho-fa-ankle" },
  { key: "forefoot", subsection: "ortho-fa-forefoot" },
  { key: "hindfoot", subsection: "ortho-fa-midfoot-hindfoot" },
  { key: "wrist and hand", subsection: "ortho-hand-trauma" },
  { key: "hand", subsection: "ortho-hand-trauma" },
  { key: "wrist", subsection: "ortho-hand-wrist" },
  { key: "forearm", subsection: "ortho-trauma-forearm-wrist" },
  { key: "elbow", subsection: "ortho-trauma-shoulder-arm" },
  { key: "humerus", subsection: "ortho-trauma-shoulder-arm" },
  { key: "arm", subsection: "ortho-trauma-shoulder-arm" },
  { key: "shoulder girdle", subsection: "ortho-shoulder-elbow" },
  { key: "shoulder and elbow", subsection: "ortho-shoulder-elbow" },
  { key: "shoulder", subsection: "ortho-trauma-shoulder-arm" },
  // Approaches / anatomy / basic science
  { key: "hoppenfeld", subsection: "ortho-bs-approaches" },
  { key: "surgical exposure", subsection: "ortho-bs-approaches" },
  { key: "approach", subsection: "ortho-bs-approaches" },
  { key: "basic science", subsection: "ortho-bs-bone-cartilage" },
  { key: "the basics", subsection: "ortho-bs-imaging" },
  { key: "biomechanic", subsection: "ortho-bs-biomechanics" },
  { key: "implant", subsection: "ortho-bs-implants" },
  { key: "biomaterial", subsection: "ortho-bs-implants" },
  { key: "anatomy", subsection: "ortho-bs-anatomy" },
  { key: "netter", subsection: "ortho-bs-anatomy" },
  { key: "xray", subsection: "ortho-bs-imaging" },
  { key: "x-ray", subsection: "ortho-bs-imaging" },
  { key: "imaging", subsection: "ortho-bs-imaging" },
  { key: "trauma", subsection: "ortho-trauma-polytrauma" },
];

export function categorizeOrthoTopic(deckPath: string, tags: string = ""): {
  section: string;
  subsection: string;
} {
  const combined = `${deckPath} ${tags}`.toLowerCase();
  for (const { key, subsection } of orthoCategoryMapping) {
    if (combined.includes(key)) {
      return {
        section: orthoSubsectionToSection[subsection] ?? "ortho-basic-science",
        subsection,
      };
    }
  }
  return { section: "ortho-basic-science", subsection: "ortho-bs-anatomy" };
}

export type OrthoTopicBucket = {
  subsectionId: string;
  sectionId: string;
  /** Short answer/concept phrases only — never full Anki note text. */
  concepts: string[];
};
