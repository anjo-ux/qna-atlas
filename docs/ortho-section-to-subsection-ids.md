# Ortho Atlas: Section → Subsection IDs

Generated from Ortho specialty taxonomy in `shared/orthoQuestionImport.ts`.
All ids use the `ortho-` prefix so they never collide with PRS bank ids.

| Section | Subsection IDs |
|--------|----------------|
| ortho-basic-science | ortho-bs-bone-cartilage, ortho-bs-biomechanics, ortho-bs-implants, ortho-bs-imaging, ortho-bs-anatomy, ortho-bs-approaches, ortho-bs-stats-ethics |
| ortho-trauma | ortho-trauma-shoulder-arm, ortho-trauma-forearm-wrist, ortho-trauma-pelvis-acetabulum, ortho-trauma-hip-femur, ortho-trauma-knee-tibia, ortho-trauma-foot-ankle, ortho-trauma-polytrauma |
| ortho-sports | ortho-sports-shoulder, ortho-sports-elbow, ortho-sports-hip, ortho-sports-knee |
| ortho-spine | ortho-spine-cervical, ortho-spine-thoracolumbar, ortho-spine-deformity, ortho-spine-trauma |
| ortho-adult-recon | ortho-recon-hip, ortho-recon-knee, ortho-recon-shoulder, ortho-recon-complications |
| ortho-hand-upper | ortho-hand-trauma, ortho-hand-wrist, ortho-hand-tendon-nerve, ortho-shoulder-elbow |
| ortho-foot-ankle | ortho-fa-forefoot, ortho-fa-midfoot-hindfoot, ortho-fa-ankle, ortho-fa-trauma-recon |
| ortho-pediatrics | ortho-peds-hip, ortho-peds-lower, ortho-peds-upper, ortho-peds-spine, ortho-peds-trauma |
| ortho-oncology | ortho-onc-workup, ortho-onc-benign, ortho-onc-malignant, ortho-onc-metastatic |

## Pipeline

1. `npm run extract:ortho-topics` — APKG → `server/data/orthoTopics.json` (concepts only)
2. `npm run generate:ortho-questions` — concepts → original Atlas-style MCQs (OpenAI), seeded under `specialty_id=ortho`
