# Atlas Review: Section → Subsection IDs (for external question generator)

Use this mapping in your other project's `SECTION_TO_ATLAS_SUBSECTION_IDS` (e.g. in `shared/constants.ts`) so the subsection dropdown shows only the subsections that belong to each section.

## By Atlas section ID (recommended)

```ts
// SECTION_TO_ATLAS_SUBSECTION_IDS: map your section name/key to Atlas subsection IDs
export const SECTION_TO_ATLAS_SUBSECTION_IDS: Record<string, string[]> = {
  // Section 1: Comprehensive
  comprehensive: [
    "anatomy",
    "skin-lesions",
    "flaps-and-grafts",
    "microsurgery",
    "infections",
    "burns",
    "trunk",
    "gender-affirming-surgery",
    "vascular-anomalies",
  ],
  // Section 2: Hand & Lower Extremity
  "hand-lower-extremity": [
    "hand-digit-trauma",
    "hand-nerves",
    "hand-tendons",
    "replantation-vascular",
    "wrist-forearm-injuries",
    "hand-tumors",
    "hand-inflammation-infections",
    "congenital-pediatric-hand",
    "lower-extremity",
  ],
  // Section 3: Craniomaxillofacial
  craniomaxillofacial: [
    "cleft-lip-palate",
    "facial-fractures",
    "facial-paralysis",
    "ear-reconstruction",
    "mandible-dental-orthognathic",
    "head-neck-tumors",
    "congenital-syndromes",
  ],
  // Section 4: Breast & Cosmetic
  "breast-cosmetic": [
    "breast-augmentation",
    "breast-reduction-mastopexy",
    "breast-reconstruction",
    "facial-rejuvenation",
    "eye-aesthetic-reconstructive",
    "rhinoplasty",
    "body-contouring",
  ],
  // Section 5: Core Surgical Principles
  "core-surgical": [
    "anesthesia",
    "perioperative-care",
    "critical-care",
    "trauma",
    "transplantation",
    "statistics-ethics-practice",
  ],
};
```

## By Atlas section title (if your UI uses these labels)

If your other project uses the full section titles as keys, you can use:

```ts
export const SECTION_TO_ATLAS_SUBSECTION_IDS: Record<string, string[]> = {
  "Section 1: Comprehensive": [
    "anatomy",
    "skin-lesions",
    "flaps-and-grafts",
    "microsurgery",
    "infections",
    "burns",
    "trunk",
    "gender-affirming-surgery",
    "vascular-anomalies",
  ],
  "Section 2: Hand & Lower Extremity": [
    "hand-digit-trauma",
    "hand-nerves",
    "hand-tendons",
    "replantation-vascular",
    "wrist-forearm-injuries",
    "hand-tumors",
    "hand-inflammation-infections",
    "congenital-pediatric-hand",
    "lower-extremity",
  ],
  "Section 3: Craniomaxillofacial": [
    "cleft-lip-palate",
    "facial-fractures",
    "facial-paralysis",
    "ear-reconstruction",
    "mandible-dental-orthognathic",
    "head-neck-tumors",
    "congenital-syndromes",
  ],
  "Section 4: Breast & Cosmetic": [
    "breast-augmentation",
    "breast-reduction-mastopexy",
    "breast-reconstruction",
    "facial-rejuvenation",
    "eye-aesthetic-reconstructive",
    "rhinoplasty",
    "body-contouring",
  ],
  "Section 5: Core Surgical Principles": [
    "anesthesia",
    "perioperative-care",
    "critical-care",
    "trauma",
    "transplantation",
    "statistics-ethics-practice",
  ],
};
```

## If your project uses different section names

Map your section name to one of the Atlas section IDs or titles above. For example, if you use "Comprehensive Integument" for Section 1:

```ts
SECTION_TO_ATLAS_SUBSECTION_IDS["Comprehensive Integument"] = [
  "anatomy",
  "skin-lesions",
  "flaps-and-grafts",
  "microsurgery",
  "infections",
  "burns",
  "trunk",
  "gender-affirming-surgery",
  "vascular-anomalies",
];
```

Or define a small mapping from your section names to Atlas section ids, then look up subsection IDs from the first table.

## Subsection ID → title reference (from Atlas)

| ID | Title |
|----|--------|
| anatomy | Anatomy |
| skin-lesions | Skin Lesions |
| flaps-and-grafts | Flaps & Grafts |
| microsurgery | Microsurgery |
| infections | Infections |
| burns | Burns |
| trunk | Trunk |
| gender-affirming-surgery | Gender-Affirming Surgery |
| vascular-anomalies | Vascular Anomalies |
| hand-digit-trauma | Hand & Digit Trauma |
| hand-nerves | Hand Nerves |
| hand-tendons | Hand Tendons |
| replantation-vascular | Replantation & Vascular |
| wrist-forearm-injuries | Wrist & Forearm Injuries |
| hand-tumors | Hand Tumors |
| hand-inflammation-infections | Hand Inflammation & Infections |
| congenital-pediatric-hand | Congenital and Pediatric Hand |
| lower-extremity | Lower Extremity |
| cleft-lip-palate | Cleft Lip & Palate |
| facial-fractures | Facial Fractures |
| facial-paralysis | Facial Paralysis |
| ear-reconstruction | Ear Reconstruction |
| mandible-dental-orthognathic | Mandible, Dental, & Orthognathic |
| head-neck-tumors | Head and Neck Tumors |
| congenital-syndromes | Congenital Syndromes |
| breast-augmentation | Breast Augmentation |
| breast-reduction-mastopexy | Breast Reduction & Mastopexy |
| breast-reconstruction | Breast Reconstruction |
| facial-rejuvenation | Facial Rejuvenation |
| rhinoplasty | Rhinoplasty |
| eye-aesthetic-reconstructive | Eye Aesthetic and Reconstructive |
| body-contouring | Body Contouring |
| anesthesia | Anesthesia |
| perioperative-care | Perioperative Care |
| critical-care | Critical Care |
| trauma | Trauma |
| transplantation | Transplantation |
| statistics-ethics-practice | Statistics, Ethics, & Practice Management |
