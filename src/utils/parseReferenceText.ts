import * as XLSX from 'xlsx';

export interface ReferenceContent {
  section: string;
  subsection: string;
  content: string;
}

export interface ReferenceSection {
  id: string;
  title: string;
  subsections: ReferenceSubsection[];
}

export interface ReferenceSubsection {
  id: string;
  title: string;
  content: string;
}

// Manually extracted content from the parsed document
const referenceData: Record<string, Record<string, string>> = {
  'comprehensive': {
    'anatomy': `# Wound Healing Phases
- Inflammatory (0 to 3 days): platelets then neutrophils then macrophages
- Proliferative (3 days to 3 weeks): fibroblasts; most collagen deposited
- Remodeling (3 weeks to 18 months): collagen III (most vascular) to I (MC in body)

# Healing
- Primary intention: directly closing a wound
- Secondary intention: open wound that closes from intact peripheral skin
- Epithelialization from intact hair follicles at wound edge, involving myofibroblasts
- Tertiary intention (rare): direct closure after leaving wound open for a few days

# Wound Closure

## Cyanoacrylate
- Use for short-distance, tension-free wounds with no significant tissue trauma or infection
- Higher dehiscence rate than sutures when put on longer incisions

## Sutures
- Minimize tissue trauma and foreign body burden with smaller suture sizes
- Monofilament suture: less tissue resistance
- Multi-filament suture
  - Braided, less memory, higher knot security, higher tensile strength
  - More likely to saw through tissue, harbor infection than monofilament
- Barbed suture: decreases operative time, no change in scar appearance in body contouring

# Scarring
- Technical: wound-edge eversion (#1 factor for healing)
- Silicone sheeting: Improves scar appearance by hydration, compression
- Pressure garments: Improves scarring in burn patients from reduced differentiation of fibroblasts to myofibroblasts

# Abnormal Scarring

## Hypertrophic scarring
- Stays within scar confines
- Histology: increased type III collagen, involves myofibroblasts; parallel collagen organization
- Tx: intralesional steroids + 5-FU

## Keloid
- Extends beyond scar
- Sx: pruritis, poor cosmesis
- RF: anterior chest, high Fitzpatrick skin type
- Histology: disorganized type I collagen; thick, randomly oriented collagen
- Tx: intralesional injection (mild cases)
  - 5-FU: similar efficacy, less hypopigmentation than steroids
  - MOA: decreases fibroblast proliferation and collagen synthesis
- Tx: surgery (moderate, severe cases)
  - Excision + steroid injection: 15% recurrence
  - Excision + XRT: 14% recurrence
  - Start XRT within 24 hours of excision, 2-3 sessions
  - Recurrence: male, age <29, size >5cm, associated skin graft

# Wound Management

## Local wound care
- Wet to dry: mechanically debrides metalloproteinases, elastases
- Hydrogels, hydrocolloids: maintain moist wound-healing environment
- Honey: stimulates immune response, suppresses inflammation
- Calcium alginate: absorptive, fewer dressing changes, provides moist-wound healing
- Hydrofiber: high absorptive capacity
- Occlusive dressings: moist-wound healing environment

## Negative-pressure wound therapy
- Micro- and macro-deformational forces
- Removes excess interstitial fluid, reopens capillaries, releases VEGF
- Evidence for fewer dressing changes and fewer operations in diabetic wounds
- Contraindications: exposed vessels, active infection, malignant wounds, non-debrided wounds

## Hyperbaric oxygen therapy
- Indications: carbon monoxide poisoning, arterial insufficiency, acute traumatic ischemia, radiation injury, necrotizing soft-tissue infections, refractory osteomyelitis

## Dermal regeneration template
- Composed of glycosaminoglycans, collagen
- Use associated with decreased hypertrophic scarring in burns

## Nutrition support
- Vitamin C: involved in collagen cross-linking
- Increased matrix metalloproteinases in wound bed associated with poor healing

# Abnormal Wound Healing

## Radiation Injury
- Acute: skin erythema; Tx: hydrocortisone cream
- Chronic: Fibrosis of soft tissues, decreased microvascular supply to skin
  - Limited ability to undermine or advance local tissues
  - Use regional or free tissue reconstructions out of zone of XRT injury

## Effect of nicotine on wound healing
- Peripheral microvascular vasoconstriction
- Inhibits prostacyclin
- Promotes increased platelet aggregation, impairs wounds healing by decreased oxygen delivery
- Improved wound healing after stopping smoking 4 weeks preoperatively
- Dx: urine cotinine testing

## Steroids
- Slows down inflammatory component of wound healing
- Tx: vitamin A (oral)

## Calciphylaxis
- Ischemic skin lesion due to calcification of small vessels
- Associated with ESRD
- Tx: sodium thiosulfate

# Pressure Injuries
- RF: males, spinal-cord injuries
- Staging:
  - I: transient erythema, self-resolves
  - II: dermis
  - III: subcutaneous to muscle fascia
  - IV: below muscle fascia, exposed bone
- Dx: bone biopsy -- more accurate than advanced imaging for osteomyelitis
- Consider abuse/neglect when multiple pressure injuries present
- Tx: debridement, local wound care, management of osteomyelitis/antibiotics
- Tx: flap coverage
  - Ischial: Posterior thigh musculocutaneous (paraplegic patients), posterior thigh fasciocutaneous (ambulatory patients), biceps femoris VY, gluteal, gracilis flaps
  - Sacral: Gluteal flap, VY advancement
  - Trochanteric: Tensor fascia lata myocutaneous flap (allows readvancement)
- Complications: Recurrence (50-70%)
  - RF: hyperglycemia/uncontrolled diabetes (#1), osteomyelitis, paraplegic, age >70, immobility, poor nutrition, low BMI, anemia, ESRD, CVA, hip fracture
  - Re-advance previous flaps when possible`,
    
    'flaps-and-grafts': `# Flap Basics
- Axial: carries own blood supply
- Random: survives off subdermal plexus
  - Often 3:1 length-to-width ratio
  - Bipedicled: can go down to 2:1 length-to-width ratio

## Z plasty
- Used commonly in scar contracture releases
- Gain length by rearranging width
  - 30 degrees: 25% gain in length
  - 45 degrees: 50%
  - 60 degrees: 75%
  - 75 degrees: 100%
  - 90 degrees: 125%
- 5-flap Z plasty: Includes a V to Y advancement to the central limb for lengthening

## Keystone flap
- Perforator island fasciocutaneous local flap
- Design with same width as defect, double V to Y donor closure
- No undermining performed to the flap

# Flap Anatomy

## Neck
- Submental fasciocutaneous flap
  - Vascular: submental artery off cervical branch of facial artery
  - Traverses level I lymph nodes in neck
  - Use in intra-oral and lower face soft-tissue reconstruction

## Trunk
- Latissimus dorsi muscle/musculocutaneous flap
  - Vascular: thoracodorsal artery
  - Function: shoulder adduction, extension, internal rotation
  - Donor site has decreased shoulder range of motion that improves by one year
  - Versatile flap used mostly in breast reconstruction and trunk reconstruction; is the largest single muscle available for free flap
- Trapezius flap
  - Vascular: transverse cervical artery
  - Used in cervical-spine reconstruction
- Scapula bone flap
  - Vascular: circumflex scapular artery off subscapular artery
  - Traverses triangular space (teres minor, teres major, long head of triceps)
  - Tip of scapula, can be chimeric flap with other tissues from subscapular system (latissimus dorsi, parascapular flaps)
  - Used for shoulder, back of neck, axilla reconstruction
- Paraspinous flap
  - Type IV segmental blood supply
  - Used in spinal coverage
- Omentum flap
  - Vascular: right and left gastroepiploic arteries (only need one side)
  - Used in sternal reconstruction, lymphatic surgery; needs subsequent skin coverage
- Lumbar artery perforator flap
  - Vascular: L4 lumbar artery perforator
  - Runs between erector spinae and quadratus lumborum
  - Innervation: cluneal nerve
  - Used as a secondary breast free flap option
- Groin flap
  - Vascular: superficial circumflex iliac artery
  - Used as a distant (non-microsurgical) flap for hand coverage
- Superficial circumflex iliac perforator
  - Thin, pliable flap; improved donor morbidity compared to radial forearm flap
- Iliac crest osteocutaneous flap
  - Vascular: deep circumflex iliac
  - Used as an alternative bone flap in mandibular reconstruction; better vertical height than fibula

## Upper Extremity
- Lateral arm flap
  - Vascular: posterior radial collateral artery
  - Runs between lateral triceps and brachialis
  - Used in forearm and hand reconstruction as a thin fasciocutaneous free flap
- Reverse lateral arm flap
  - Vascular: radial recurrent artery
  - Used for elbow coverage as a pedicled flap
- Radial forearm flap
  - Vascular: radial artery
  - Need normal Allen's test (intact palmar arch)
  - Thin, pliable fasciocutaneous flap; can be innervated flap using lateral antebrachial cutaneous nerve
  - Used as pedicled (anterograde) for elbow coverage, reversed for hand coverage (to level of proximal interphalangeal joints), or free flap for head and neck reconstruction (e.g., hemiglossectomy defects), phalloplasty
- Ulnar artery flap
  - Vascular: ulnar artery
  - Less tendon exposure risk than radial forearm flap
  - Shorter pedicle, smaller diameter vessel than radial forearm flap
- Posterior interosseous artery flap
  - Vascular: pedicle between 5th/6th extensor compartments
  - Can be reversed and inset as distally as level of metacarpophalangeal joints
- Reverse homodigital island flap
  - Vascular: retrograde from contralateral digital artery with crossing vessel proximal to distal interphalangeal joint
  - Used for finger-tip injuries, sensate flap

## Lower Extremity
- Anterolateral thigh flap
  - Vascular: lateral descending circumflex artery
  - Passes through lateral inguinal ligament
  - Donor site morbidity: weak knee extension
  - Used as pedicled or free flap, fasciocutaneous or musculocutaneous flap
  - Can cover large defects: up to 35x25cm; can be innervated using lateral femoral cutaneous nerve
- Profunda artery perforator flap
  - Vascular: pedicle traverses through adductor magnus
  - Includes posteromedial thigh with superior border at gluteal crease
  - Used as secondary breast free flap option; favorable donor site, supine positioning
- Posterior thigh fasciocutaneous flap
  - Vascular: inferior gluteal artery descending branch
- Medial femoral condyle/trochlea bone/periosteal flap
  - Vascular: descending geniculate artery
  - Passes posterior to vastus medialis and anterior to adductor
  - Can be used for defects up to 7cm
  - Used in scaphoid nonunion surgery
- Gracilis flap
  - Vascular: medial circumflex artery
  - Travels between adductor magnus and adductor longus
  - Pedicle enters muscle laterally
  - Innervation: obturator nerve
  - Can be used as a free functional muscle flap, pedicled for perineal defects
- Rectus femoris flap
  - Vascular: descending branch of the lateral femoral circumflex artery
  - Function: hip flexion, knee extension
  - Used in groin coverage
- Gastrocnemius flap
  - Vascular: sural arteries
  - Used in upper 1/3rd tibia, knee wounds
- Medial sural artery perforator
  - Vascular: perforators can be traced to the popliteal artery
  - Thin, pliable fasciocutaneous flap
- Soleus flap
  - Vascular: proximal from posterior tibial, distal from peroneal
- Fibula bone flap
  - Vascular: peroneal artery
  - Anterior approach between extensor hallucis longus and interosseous septum, pedicle between flexor hallucis longus (FHL) and posterior tibial muscles
  - Skin island based on perforator from distal 1/3rd of the leg
  - Donor morbidity: decreased great toe flexion strength (due to harvest of flexor hallucis longus)
  - Used for large bony defects, mandibular reconstruction; thick cortical bone stock
  - Up to 20cm of bone stock available; can perform multiple osteotomies
  - Preserve 5-6cm proximal and distal aspect of fibula
  - Can be performed with previous distal fibula fracture
- Reverse sural artery flap
  - Vascular: peroneal artery perforators artery, lesser saphenous vein
  - Used as a reversed pedicled flap for heel defects
  - MC cause flap loss: venous insufficiency
  - Improve with surgical delay: Incise flap to produce ischemia-induced hyperplasia and hypertrophy of blood vessels; complete elevation/inset of flap 2-3 weeks later
- Posterior tibial artery perforator propeller flap
  - Vascular: perforators from between soleus and flexor digitorum longus
  - Used as a regional option for lower extremity

## Foot
- Medial plantar artery flap
  - Vascular: continuation from posterior tibial artery
  - Perforator between flexor hallucis brevis and abductor hallucis muscles
  - Innervation: medial plantar nerve from tibial nerve
  - Used in heel reconstruction

# Grafts

Survive off surrounding soft tissues until generate their own blood supply

## Skin grafts
- Three phases of initial healing, occur over first 5-6 days
  - Plasmatic imbibition: graft survives off nutrients from wound bed
  - Inosculation: new capillaries form
  - Revascularization: new blood vessels form
- Split-thickness grafts:
  - Less primary contracture (20% compared to 40% for FTSG), more secondary contraction than full-thickness grafts
  - Secondary contraction is inversely related to amount of dermis
  - Meshing, fascial placement increases secondary contraction
  - Lower metabolic demand than full-thickness grafts
- Bolster: Negative-pressure wound therapy (NPWT) improves skin graft take over other bolster options
- Donor-site management: Moist dressings less painful (occlusive clear dressings, hydrocolloid), similar healing to other dressings
- Lower survival in XRT wounds

## Dermal substitutes
- Dermal regenerative matrix template
  - Can be used over less vascularized wound beds
  - Requires debrided wound, no infection
  - Increase in matrix take with NWPT as bolster
  - Perform skin graft 3 weeks after placement

## Fat grafts
- Graft take usually around 50-60%
- Related to harvest, processing, injection
- Injection with low-shear device (#1), small aliquots improve graft viability

## Tendon grafts
- Donors: palmaris longus, plantaris (longest length), extensor digitorum longus

## Cartilage grafts
- Donors: septum, ear, rib (5-7)
- MC complication: warping
- Gibson principle: remove perichondrium and cartilage warps to opposite side

## Fascial grafts
- Tensor fascia lata
- Temporoparietal fascia
  - MC complication: alopecia

## Bone grafts
- Bone healing:
  - Osteogenesis: formation of new bone by cells
  - Osteoinduction: differentiate cells to bone healing (e.g., bone morphogenic protein [BMP])
  - Osteoconduction: vessels grow into mechanical scaffold (e.g., hydroxyapatite)
- Bone flaps/vascularized bone graft
  - Osteogenesis: osteoblasts
- Bone grafts
  - Cancellous: osteoinduction
  - Cortical: osteoconduction
  - Bone cortical allografts have greater mechanical strength than cancellous autograft`,
    
    'microsurgery': `# Free Flap

## Complications
- MC microsurgical problem: venous congestion
  - Dx: fast capillary refill, purple flap color
  - RF: <2mm venous coupler
  - Hand-sewn anastomosis for smaller veins to reduce risk
  - Tx: prompt return to OR
- MC cause acute flap loss: arterial thrombosis
  - White clot: platelet aggregation, often from technical problem
  - Dx: ischemia of flap, pale, cool, no capillary refill
  - Tx: revise anastomosis, local heparin

## Flap salvage
- Highest likelihood of salvage with prompt return to OR (1st 48 hours)
  - Mechanical causes (e.g., vessel kinking) favorable to thrombosis
- Decreased with multiple repeat explorations, irradiated fields

## Vasopressor medications during free tissue transfer
- No effect on flap survival

## Monitoring
- Clinical: Doppler, color, capillary refill, turgor, warmth
- Near-infrared spectroscopy
  - Measures tissue oxygen saturation (arterial and venous components)
  - Shown to improve deep inferior epigastric (DIEP) flap breast reconstruction salvage rate compared to clinical monitoring due to earlier detection of microvascular problems

# Hypercoagulable States

- Virchow's triad: vessel injury, venous stasis, hypercoagulable state
  - RF: personal history of DVT/PE, family history
  - Risk persists for several weeks after operation
- Inherited disorders
  - Factor V Leiden (MC genetic cause)
  - Resistance to activated protein C
  - Others: antiphospholipid syndrome, antithrombin deficiency
- MC medication associated with increased risk in plastic surgery: tamoxifen

# Medicines and Adjuncts

## Antiplatelet
- Aspirin: Thromboxane A2, irreversible platelet inhibition

## Anticoagulation
- Heparin: Antithrombin III

## Fibrinolytics
- tPA (e.g., alteplase)
  - Activate plasminogen to plasmin (degrades clot)
  - Use for fibrinolysis of microsurgical arterial thrombosis
  - Inject locally into flap via artery, allow to drain out a flap vein that is not anastomosed
  - Associated with reduced fat necrosis, not associated with increased salvage in DIEP flaps

## Glycoprotein IIIa/IIb inhibitors
- Anti-platelet agents
- Some support for use in setting of reactive thrombocythemia (>1 million) with free flaps

## Leeches
- Used to treat focal venous congestion (e.g., finger replant)
- Secretes hirudin (anticoagulant)
- Prophylaxis with ciprofloxacin (~15% patients develop infection, 80% of infections are aeromonas)
- Alternatives: ceftriaxone, doxycycline (not for pediatrics)

## Vasodilators
- Papaverine: Inhibits phosphodiesterase in vessel smooth muscle resulting in vasodilation
- Lidocaine: Blocks sympathetic response in vessels
  - No evidence supports one topical vasodilator better than another`,
    
    'trunk': `# Chest

## Sternal wound infections
- Arnold classification
  - Acute: 0-2 weeks
  - Subacute: 2-4 weeks, often with mediastinitis
  - Chronic: >4 weeks often with osteomyelitis
- Dx: CT scan, antibiotics (Abx), assess for mediastinitis
- Tx: debridement, flap coverage
  - Pectoralis major advancement flaps
  - Pectoralis major turnover flap: alternative for dead space, inferior defects
  - Need to know if internal mammary arteries (IMA) were used during cardiac bypass; can only perform if IMA is intact
  - Alternatives: Pedicled rectus abdominus (need intact IMA), Omentum for sizable defects, dead space obliteration

## Pectus excavatum
- Dx: sunken anterior chest and sternum
- Tx: chest wall reconstruction at age 6-12 if symptomatic
  - Skeletal correction: Nuss external support bars, thoracoscopic retrosternal support bars
  - Soft-tissue correction: custom silicone elastomer; augmentation mammaplasty

## Pectus carinatum
- Associated with connective tissue diseases (Marfan, Loeys-Dietz syndromes)
- Dx: prominent sternum

## Anterior thoracic hypoplasia
- Dx: unilateral sunken chest with normal sternum, breast hypoplasia, normal pectoralis muscle, no associated extremity abnormalities

## Poland syndrome
- Absent sternal head of pectoralis major, concave chest, breast hypoplasia, absent anterior axillary fold, ipsilateral symbrachydactyly
- Associated with lymphatopoetic, renal, and lung tumors; no increased breast cancer risk
- Tx: breast reconstruction (DIEP, custom implant, staged implant reconstruction depending on anatomy)

## Gynecomastia
- Due to increased aromatization of androgen to estrogen
- Majority idiopathic but many etiologies (medications, marijuana, and cancers)
- RF: prostate medications (also can cause mastodynia)
- Common in teenagers: Tx: observe, most regress in less than a year
- Dx: testicular exam to evaluate for testicular cancer etiology
- Rohrich grading
  - I: Minimal hypertrophy
  - II: Moderate hypertrophy
  - III: Severe hypertrophy with mild ptosis
  - IV: Severe hypertrophy, severe ptosis
- Tx: liposuction
- Tx: direct excision for central gland prominence
- Nipple transposition for 250-500gm resection with skin redundancy; mastectomy with free nipple grafting for severe ptosis

# Trunk

## Abdominal-wall reconstruction
- Anatomy
  - Arcuate line: area below umbilicus that demarcates where the posterior sheath ends (formed by internal oblique and transversalis fascia); there is no defined posterior sheath inferior to this line
  - Innervation of abdominal muscles: Transversalis abdominus plane (TAP) - nerve runs between transversus abdominus and internal oblique muscles (from intercostal nerves)
- Tx: Prehabilitation: botulinum toxin injection to lateral musculature increases likelihood of primary closure of hernias
- Anterior components separation
  - Incise fascia lateral to semilunar line
  - Excursion of 4cm to upper abdomen, 8cm mid abdomen, 3cm suprapubic (per side)
- Posterior components separation
  - Release of transversus abdominus (TAR) medial to semilunar line
- Mesh usage
  - Reduces recurrence compared to tissue repair
  - Mesh options: Synthetic (better strength, cheaper), Biologic (potentially more resilient with infection/GI spillage and considered for high-risk, contaminated cases)
  - Retrorectus position: lowest complication and recurrence rate
  - Other mesh placements: intraperitoneal, onlay (over fascia)
  - Bridge repair when unable to approximate fascia; highest recurrence risk compared to other mesh repairs
- Complications: Abdominal compartment syndrome
  - Increased compartment pressure causes diaphragm elevation, vascular compression, organ compression
  - Dx: clinical exam, elevated bladder pressure (>20), peak inspiratory pressure (>30) on ventilator
  - Tx: decompressive laparotomy

## Congenital abdominal-wall diseases
- Omphalocele
  - Midline, partial-thickness defect with intestines covered by a membrane
  - Commonly associated with a chromosome abnormality (e.g., trisomy 13)
- Gastroschisis
  - Right of umbilical cord, full-thickness defect with no intestinal coverage
  - Dx: elevated AFP (maternal)
  - Tx: direct closure +/- components separation, abdominal silo if large
  - Silo protects viscera, allows progressive reduction

## Desmoid tumors
- Tend to occur in abdominal wall; associated with familial adenomatous polyposis syndrome

## Chest wall reconstruction
- Bony reconstruction for >4 ribs, >5cm, otherwise at risk for flail chest
- XRT increases stiffness of chest wall, decreases need for bony reconstruction
- Areas covered by the pectoralis major, posterior rib defects don't need bony reconstruction
- Tx: alloplastic materials (PTFE/meshes, methylmethacrylate) for bony reconstruction, vascularized skin coverage

## Perineal reconstruction
- Post-oncologic defects
  - Abdominoperineal resection (~50%) and pelvic exenteration (80%) have high complication rate with primary closure
  - Commonly had neoadjuvant XRT to perineum
  - Tx: vertical rectus abdominus musculocutaneous (VRAM), pedicled ALT, pedicled PAP flaps, gracilis (higher complication rate)
- Vaginal reconstruction
  - Agenesis associated with many conditions:
    - Mayer Rokitansky Küster Hauser syndrome: 46XX with Müllerian duct aplasia, associated with renal, cardiac, hearing abnormalities; intact ovarian function, secondary-sex characteristics
    - Partial and complete androgen insensitivity syndromes: 46XY, no development of male genitals, phenotypically female
    - Tx: internal pudendal flaps; Complication: stenosis (manage with serial dilation)
  - Posterior defects: VRAM
  - Anterior and lateral defects: Superficial perineal artery (pudendal thigh) flap - maintains sensation (pudendal nerve)
  - Total defects: Bilateral gracilis muscle flaps
  - Rectovaginal fistula
    - Control source/inflammation with diverting ostomy then staged reconstruction
    - Tx: gracilis muscle flap

## Spine reconstruction
- Spine wound dehiscence
  - Risk for cerebrospinal fluid leak if dura exposed
  - Tx: vascularized tissue over dural repair (use local fascia, muscle flaps with skin coverage)
- Myelomeningocele
  - Congenital malformation of spine with outpouching of spinal cord at birth
  - Due to failure of neural tube closure during 4th week of gestation
  - Associated with folic acid deficiency
  - Dx: high AFP, neonatal ultrasound
  - Presence of hydrocephalus distinguishes from meningocele
  - Can be associated with cardiac, renal, orthopaedic, other neurologic abnormalities
  - Tx: antibiotics, neurosurgery to shunt, repair dura; prompt reconstruction/coverage of spine with local flaps (<48 hours due to risk of meningitis)
  - RF for tethered cord syndrome

# Gender Surgery

## Head/neck
- Facial feminization
  - Dx: Ousterhout classification (MC type 3 80%)
  - Tx: frontal sinus setback, burring supraorbital ridge, hairline reduction, brow lift
- Chondrolaryngoplasty
  - Addresses thyroid cartilage
  - Complication: anterior commissure tendon injury
  - Sx: decreased voice pitch without hoarseness

## Chest ("top") surgery
- WPATH guidelines: Adult (>18 years old), one mental health letter of support; Hormones not needed but recommended >1 year
- Masculinizing
  - Periareolar mastectomy for small breast volume, no ptosis
  - Mastectomy with free nipple graft for ptosis
- Feminizing
  - Augmentation mammaplasty

## Genital ("bottom") surgery
- WPATH Recommendations: Informed consent, >12 months hormones, living in desired gender >12 months, two mental health providers' support
- Feminizing
  - Tx: estrogen
  - DVT risk: highest with oral ethinyl estradiol, lowest with transdermal estradiol
  - Penetrative options: penile-inversion vaginoplasty, intestinal vaginoplasty
  - Penile-inversion vaginoplasty: Dissect in retroprostatic fascia (Denonvillier's); MC complication: neovaginal stenosis
- Masculinizing
  - Tx: testosterone
  - Lowers voice, increases muscle mass, increases body hair, cessation of menses: effects take 6 months to 5 years
  - Menses can return after d/c medication, other changes remain
  - Tx: surgical
    - Metoidioplasty: Uses local tissue to create neophallus
    - Phalloplasty: Radial forearm free flap (MC complication: urethral strictures, urethral fistulas); Osteocutaneous flaps (does not require prosthesis for erection); Innervated flaps: ilioinguinal nerve for tactile sensation, dorsal clitoral nerve for erogenous sensation
    - Urethral reconstruction: MC complication urethral stricture (highest with skin graft prelamination)
- Penile replantation/transplantation
  - Dominant artery: deep dorsal penis artery
  - Skin also supplied by inferior external pudendal artery`,
    
    'skin-lesions': `# Skin

## Epidermis
- 5 layers (deep to superficial): Basal, spinosum, lucidum, granulosum, corneum
- Keratinocytes: Originate from basal layer, 90% of epidermis cells, acts as environmental barrier
- Melanocytes

## Dermis
- Papillary (superficial)
- Reticular (deep): Hair roots, sebaceous and sweat glands
- Predominantly made of type I collagen

# Benign Skin Conditions

## Hidradenitis suppurativa
- Apocrine gland involvement; forms subcutaneous fistulae from occlusion of folliculopilosebaceous units
- Tx: topical/oral antibiotics (1st line, mild cases), TNF-alpha inhibitors (2nd line, moderate cases)
- Tx surgical: excision of involved areas, reconstruction

## Dermoid cyst
- Most common childhood skin lesion

## Cylindromas
- Benign adnexal tumors
- Dx: firm, nodular, pink-colored scalp lesions
- Tx: excision

## Pilomatricoma
- Slow-growing blue nodule associated with hair follicle, calcific features
- Dx: firm to touch, tender
- RF: teenagers
- Tx: excision

## Spiradenomas
- Benign dermal neoplasms
- Dx: small, painful, bluish nodules
- Tx: excision

# Malignant Skin Diseases

## Basal cell carcinoma
- Pearly round nodules
- RF: xeroderma pigmentosum
  - X-linked recessive gene impairing nucleotide excision repair
  - Dx: extreme sun sensitivity, extensive photoaging, dry skin
- Tx: non-surgical: topical creams (5-FU, imatinib), electrodesiccation and curettage for superficial lesions, XRT for high-risk patients (non-surgical candidates)
- Tx: Moh's excision
  - Involves real-time circumferential skin lesion sectioning with frozen section review
  - Associated with high cure rate (>95% for basal and squamous cell carcinomas)
- Tx surgery: excision with 4mm margins

## Squamous cell carcinoma
- Arises from stratum basale
  - Histology: poorly differentiated cords of spindle cells from keratinocytes
- Aggressive subtypes: adenoid, adenosquamous, desmoid
- Actinic keratosis: ~10% malignant risk
  - Tx: cryotherapy, imiquimod (acts on skin immune system), topical 5-FU
- Most-common primary malignant skin tumor of the hand
- Tx: Moh's
- Tx surgery: wide local excision with 6mm margins for low risk, 1cm for aggressive tumors, XRT for non-surgical candidates (efficacy better for smaller lesions)

## Melanoma
- Arises from stratum basale
- Clinical features (ABCDs): Asymmetry, irregular Border, heterogenous Color, Diameter > 6mm
- Ulceration has worse prognosis
- Types: superficial spreading (#1), nodular (grows more vertically, lowest disease-specific survival)
- Lentigo maligna: melanoma in situ variant
  - Tx: excision, XRT, topical imiquimod (upregulates immunomodulation)
- Neurocutaneous melanosis
  - Midline involvement, >20 satellite lesions
  - Dx: MRI central nervous system screening before 6 months
- Dx: punch biopsy for depth, labs (LDH), imaging (CXR, possible PET/CT)
- Tx:
  - Wide local excision:
    - Margins: <1mm depth – 1cm, 1-2mm – 1-2cm, >2mm – 2cm
  - Lymph node management:
    - Sentinel lymph node biopsy (SLNB): indicated for >0.7mm primary lesion depth
    - Completion lymph node dissection: high nodal burden (>3), extracapsular extension
  - Systemic therapy (immunotherapy): indications include positive nodal disease, distant metastases

## Merkel cell carcinoma
- Neuroendocrine tumor
- Histology: nuclear molding, small blue cells, salt-and-pepper chromatin on Hematoxylin and Eosin
- Risk of development: Merkel cell polyomavirus (>80% of cases)
- Tx: surgery with 1-2cm margins + XRT, SLNB
- Poor prognosis

## Angiosarcoma
- Rapidly-growing red or purple macules or nodules; usually in head and neck
- Associated with prior XRT or lymphedema
- Tx: surgery, XRT, chemotherapy; poor prognosis


## Split-thickness skin graft (STSG)
- More forgiving to recipient site than full-thickness skin graft
- First-intention failure: inadequate recipient site vascularity, infection, seroma, hematoma
- Seroma/hematoma: can prevent graft from taking; avoid by messengering, pie-crusting
- Requires immobilization/bolster to prevent shearing
- Less secondary contracture than full-thickness skin graft
- Thinner grafts: lower metabolic demand, higher skin contracture rate, requires less vascular bed
- Heals by secondary intention

## Full-thickness skin graft (FTSG)
- Less secondary contracture than split-thickness skin graft
- Requires higher quality recipient site
- Heals by primary intention
- Better pigmentation match
- Thicker grafts: more durable, less re-epithelialization

## Composite graft
- Multiple tissue types taken together from donor site; requires meticulous recipient bed
- Example: ear cartilage + skin, dermal-fat graft

# Flap Classification

- Mathes and Nahai muscle flap blood supply classification:
  - Type I: single vascular pedicle (gastrocnemius, tensor fascia lata)
  - Type II: dominant pedicle, minor pedicles (gracilis, soleus, trapezius)
  - Type III: two dominant pedicles (gluteus maximus, rectus abdominus)
  - Type IV: segmental pedicles (sartorius, external oblique)
  - Type V: single dominant pedicle, secondary segmental pedicles (latissimus, pectoralis major)

## Flap types
- Axial: carries own blood supply
- Random: survives off subdermal plexus
  - Often 3:1 length-to-width ratio
  - Bipedicled: can go down to 2:1 length-to-width ratio

## Z plasty
- Used commonly in scar contracture releases
- Gain length by rearranging width
- 30 degrees: 25% gain in length
- 45 degrees: 50%
- 60 degrees: 75%
- 75 degrees: 100%
- 90 degrees: 125%
- 5-flap Z plasty: Includes a V to Y advancement to the central limb for lengthening

## Keystone flap
- Perforator island fasciocutaneous local flap
- Design with same width as defect, double V to Y donor closure
- No undermining performed to the flap

# Flap Anatomy

## Neck
- Submental fasciocutaneous flap
  - Vascular: submental artery off cervical branch of facial artery
  - Traverses level I lymph nodes in neck
  - Use in intra-oral and lower face soft-tissue reconstruction

## Trunk
- Latissimus dorsi muscle/musculocutaneous flap
  - Vascular: thoracodorsal artery
  - Function: shoulder adduction, extension, internal rotation
  - Donor site has decreased shoulder range of motion that improves by one year
  - Versatile flap used mostly in breast reconstruction and trunk reconstruction; is the largest single muscle available for free flap
- Trapezius flap
  - Vascular: transverse cervical artery
  - Used in cervical-spine reconstruction
- Scapula bone flap
  - Vascular: circumflex scapular artery off subscapular artery
  - Traverses triangular space (teres minor, teres major, long head of triceps)
  - Tip of scapula, can be chimeric flap with other tissues from subscapular system (latissimus dorsi, parascapular flaps)
  - Used for shoulder, back of neck, axilla reconstruction
- Paraspinous flap
  - Type IV segmental blood supply
  - Used in spinal coverage
- Omentum flap
  - Vascular: right and left gastroepiploic arteries (only need one side)
  - Used in sternal reconstruction, lymphatic surgery; needs subsequent skin coverage
- Lumbar artery perforator flap
  - Vascular: L4 lumbar artery perforator
  - Runs between erector spinae and quadratus lumborum
  - Innervation: cluneal nerve
  - Used as a secondary breast free flap option
- Groin flap
  - Vascular: superficial circumflex iliac artery
  - Used as a distant (non-microsurgical) flap for hand coverage
- Superficial circumflex iliac perforator
  - Thin, pliable flap; improved donor morbidity compared to radial forearm flap
- Iliac crest osteocutaneous flap
  - Vascular: deep circumflex iliac
  - Used as an alternative bone flap in mandibular reconstruction; better vertical height than fibula

## Upper Extremity
- Lateral arm flap
  - Vascular: posterior radial collateral artery
  - Runs between lateral triceps and brachialis
  - Used in forearm and hand reconstruction as a thin fasciocutaneous free flap
- Reverse lateral arm flap
  - Vascular: radial recurrent artery
  - Used for elbow coverage as a pedicled flap
- Radial forearm flap
  - Vascular: radial artery
  - Need normal Allen's test (intact palmar arch)
  - Thin, pliable fasciocutaneous flap; can be innervated flap using lateral antebrachial cutaneous nerve
  - Used as pedicled (anterograde) for elbow coverage, reversed for hand coverage (to level of proximal interphalangeal joints), or free flap for head and neck reconstruction (e.g., hemiglossectomy defects), phalloplasty
- Ulnar artery flap
  - Vascular: ulnar artery
  - Less tendon exposure risk than radial forearm flap
  - Shorter pedicle, smaller diameter vessel than radial forearm flap
- Posterior interosseous artery flap
  - Vascular: posterior interosseous artery
  - Runs between extensor digiti minimi and extensor carpi ulnaris
  - Used for hand and elbow coverage; pedicle length limits free flap use

## Lower Extremity
- Medial sural artery perforator flap
  - Vascular: medial sural artery perforator
  - Used for heel coverage, Achilles coverage
- Sural artery flap
  - Vascular: lesser saphenous vein and sural nerve
  - Used for heel and Achilles coverage; pedicled flap
- Fibula bone flap
  - Vascular: peroneal artery
  - Segmental bone flap
  - Skin paddle: posterior/lateral leg
  - Used in mandibular reconstruction; donor site has increased ankle fracture risk
- Anterolateral thigh flap
  - Vascular: descending branch of lateral circumflex femoral artery
  - Innervation: lateral femoral cutaneous nerve
  - Muscle perforator or septocutaneous
  - Versatile flap with long pedicle, large donor site
  - Used in head and neck reconstruction, trunk reconstruction, extremity coverage
- Profunda artery perforator flap
  - Vascular: 1st or 2nd perforator of profunda femoris artery
  - Innervation: posterior femoral cutaneous nerve
  - Used in perineal reconstruction, breast reconstruction; disadvantage is prone position for flap harvest
- Gracilis flap
  - Vascular: medial circumflex femoral artery
  - Used in perineal reconstruction, breast reconstruction, functional muscle transfer
- Tensor fascia lata flap
  - Vascular: ascending branch of lateral circumflex femoral artery
  - Used in trochanteric coverage, abdominal-wall defects
- Rectus femoris flap
  - Vascular: descending branch of lateral circumflex femoral artery
  - Used for pelvic and groin coverage`
  },
  'hand-lower-extremity': {
    'hand-digit-trauma': `# Dislocations

## Thumb
- Anatomy: MC dislocation dorsally through dorsoradial ligament
- CMC stabilizers: Volar oblique, ulnar collateral, intermetacarpal, dorsoradial (most important), posterior oblique, anterior oblique (prevents radial subluxation)
- Occurs with axial force, flexion of the wrist
- Dx: XR with anteroposterior and lateral views in 30 degrees of pronation

## Finger dislocations
- Proximal interphalangeal (PIPJ) joint dislocation
  - Simple: reduce
  - Complex: unable to reduce due to interposed soft tissue
  - Dorsal (MC): interposed volar plate
  - Volar: interposed extensor tendon
  - Dx: Elson test to assess central slip integrity
- Metacarpophalangeal (MCP) joint dislocations
  - Rare, often complex due to volar plate interposition
  - Tx: surgical
  - Volar: higher risk of digital nerve injury
  - Dorsal: unable to repair volar plate

# Phalangeal, metacarpal fractures

## Bennett fracture
- Thumb metacarpal base intra-articular fracture
- Reduce with axial traction, pronation, and palmar abduction

## 5th metacarpal neck (Boxer's) fracture
- Can tolerate up to 70 degrees of angulation
- Tx: buddy tapes (ring to small finger)/active range of motion
- Tx surgery: MC for malrotation

## Metacarpal fractures
- Interosseous muscles most likely to incarcerate in fracture line
- Open fractures: Minor soft tissue injury can be irrigated, closed, splinted in ER with short-course antibiotics, outpatient follow up
- Tx: multiple operative techniques (pinning, plating, intramedullary screw fixation, lag screw)
- Lag-screw fixation: used for oblique fractures, allows primary bone healing

## Proximal interphalangeal joint (PIPJ) fracture/dislocation
- Simple, stable (<30% joint surface)
  - Dx: assess stability of joint with up to 30 degrees of PIPJ flexion
  - Tx: extension-block splinting or pinning (maintain in slight flexion)
- Pilon base fractures, unstable fractures: Tx: dynamic external fixation
- 30-50% volar base fractures: Tx: hemi-hamate arthroplasty, volar plate arthroplasty

# Ligament Injuries

## Intrinsic-plus splint position
- Wrist extended (30 degrees), metacarpophalangeal joints (MCPJs) flexed (75-90 degrees), interphalangeal joints (IPJs) extended (0 degrees)
- Maintains MCPJ collateral ligaments at full length

## Intrinsic tightness
- Intrinsic tightness: passive flexion of proximal interphalangeal joint (PIPJ) tight with MCPJ hyperextended
- Extrinsic tightness: PIPJ flexion tight with MCPJ flexed

## Ulnar collateral ligament injury
- Instability of thumb MCPJ with radial-directed force
- Sx: weakness, pain with pinch tasks
- Dx: increased laxity >30 degrees of radial-directed stress to thumb, compare to contralateral thumb
- Dx: stress view XR
- US (or MRI) evaluates for Stener lesion (UCL retracts into adductor muscle)
- Tx: splinting (1st line)
- Tx: ulnar collateral ligament reconstruction for failure of non-operative treatment, Stener lesion

# Digit Reconstruction

## Thumb reconstruction
- Thumb is 40-50% of overall hand function, favor functional reconstructions
- Volar defects: First dorsal metacarpal artery flap (larger defects), Moberg flap (defects <1.5cm, up to 2cm with islandization)
- Volar and dorsal defects: Great toe wraparound flap at proximal phalanx level
- Total thumb reconstruction
  - CMC and metacarpal base present: toe-to-thumb transfer
  - CMC or metacarpal base absent: pollicization
- 1st webspace contracture
  - Skin only: Z plasties (four-flap), skin grafts
  - Deep structures: flap coverage (e.g., posterior interosseous reverse flap)

## IPJ arthroplasty
- Silicone arthroplasty: Improves pain, not motion

## Fillet of finger flaps
- Useful to provide coverage and reduce returns to OR
- Consider when otherwise unsalvageable bone stock of injured finger

## Nailbed injuries
- Germinal matrix produces nail, sterile matrix is adherent to nail
- Tx (large subungual hematoma or laceration):
  - Acute: repair nail bed (2-octyl cyanoacrylate with similar outcomes, less time-consuming than suture repair)
  - Chronic: split thickness nail matrix graft from toe, nail ablation
- Hook nail: soft tissue defect from loss of distal sterile matrix, inadequate bone/soft tissue support for nail
  - Tx: release scar with soft-tissue augmentation, excision of distal sterile matrix
- Nail ridging from untreated nail bed injury: Tx: attempt direct closure of nail bed at re-repair

## Fingertip Injuries
- Secondary intention healing for <1.5cm, no exposed bone
  - Tx: moist wound healing, petroleum jelly
  - Better sensation than flaps or skin grafts; associated with longer healing time

## Finger soft-tissue reconstruction
- Cross-finger flap: uses dorsal skin from adjacent digit for a volar wound
- Reverse cross-finger flap: uses dorsal skin from adjacent digit for a dorsal wound`,

    'hand-nerves': `# Anatomy

## Brachial plexus
- Upper roots (C5-7) proximal functions (shoulder function, elbow flexion)
  - Sx: shoulder adducted/internally rotated, elbow extended, forearm pronated, fingers flexed
- Lower roots (C8-T1) distal functions (wrist, hand)
- Posterior cord
  - Axillary nerve: From upper roots (C5-C6); innervates deltoid (shoulder abduction), some of triceps
  - C7 root: Contributes innervation to triceps
  - Radial nerve: From lower roots (C8 to T1); innervates wrist and digital extension, some of triceps
- Lateral cord
  - Musculocutaneous nerve: From upper roots (C5-7); innervates biceps, brachialis for elbow flexion
- Medial cord
  - Median nerve: Innervates thumb intrinsics, flexor carpi radialis (FCR), flexor pollicis longus (FPL), flexor digitorum superficialis (FDS), flexor digitorum profundus (FDP) [index, middle fingers], pronator teres
  - Ulnar nerve: Innervates hand intrinsics (interosseous), flexor carpi ulnaris (FCU), FDP (ring and small fingers)

## Superficial nerves
- Medial antebrachial cutaneous nerve: Follows basilic vein on ulnar aspect of forearm
- Lateral antebrachial cutaneous nerve: Follows cephalic vein on radial aspect of forearm; musculocutaneous nerve branch
- Intercostobrachial nerve: Innervates medial upper arm; nerve pierces through serratus anterior
- Dorsal sensory branch of ulnar nerve: Supplies dorsal/ulnar hand sensation
- Saphenous nerve: Innervates medial malleolus; travels along with greater saphenous vein

# Compression Neuropathies

## Carpal tunnel syndrome
- Sx: numbness to thumb, index, middle fingers, worse at night; can progress to affect thumb intrinsic/thenar muscles
- Dx: clinical or electrodiagnostic testing
  - Nerve conduction studies: median nerve sensory peak latency >3.5ms, motor >4.5ms
  - Dx: US or MRI with increased cross-sectional area of median nerve
  - Dx: amyloidosis (~10% of bilateral carpal tunnel); congo red stain on tenosynovium biopsy
- Tx: night splinting (mild), corticosteroid injection for short-term relief
- Tx surgical: carpal tunnel release for symptoms >3 months, failure of conservative measures
  - No difference between open and endoscopic approaches long-term

## Cubital tunnel syndrome
- Sx: ring and small finger numbness; can progress to finger weakness due to affecting finger intrinsics
- Dx: Froment sign: pull a paper from a patient pinching, look for compensation with thumb flexion (FPL)
- Dx: clinical or electrodiagnostic test (velocity decrease ~10m/s around elbow)
- Tx: elbow extension splint
- Tx surgical: cubital tunnel release in situ
  - Anterior transposition (submuscular or subcutaneous) if ulnar nerve subluxation, recurrence
  - Areas of compression: Osbourne ligament (near medial epicondyle), medial intermuscular septum and arcade of Struthers in upper arm, FDP heads in forearm, anconeus epitrochlearis (congenital anomalous muscle in medial elbow)

## Guyon's canal
- 3rd most-common compressive neuropathy site (2nd most-common ulnar nerve compression site)
- Borders: hypothenar muscle, transverse carpal ligament, volar carpal ligament, pisiform

## Anterior interosseous nerve syndrome
- Motor only: affects FPL, FDP index finger

## Pronator/lacertus fibrosis compression
- Motor and sensory to median nerve at forearm
- Includes anterior interosseous nerve weakness, thumb intrinsic weakness motor changes

## Radial tunnel syndrome
- Sx: lateral forearm pain
- Dx: tenderness 5cm distal to lateral epicondyle, no motor symptoms
- Dx: MRI

## Posterior interosseous palsy
- Dx: intact tenodesis effect (tendons intact), no active extension of digits

## Superficial branch of radial nerve compression
- Sx: numbness over dorsal thumb and index finger
- Tx: splinting, rest
- Tx surgery: release fascia between brachioradialis and extensor carpi radialis longus (ECRL)
  - Pierces ECRL at 8cm proximal to radial styloid

# Nerve Injuries

## Sunderland classification
- I: Neurapraxia: segmental demyelination
- II: Axonotmesis: intrafascicular injury (mild)
- III: Axonotmesis (moderate)
- IV: Axonotmesis (severe)
- V: Neurotmesis: transection of nerve
- VI: Mixed components

## Electrodiagnostic testing
- EMG: May see some changes as early as 10 days from injury
- Complete denervation: positive sharp waves, fibrillation potentials, decreased motor unit recruitment
- Nerve recovery: nascent potentials

## Brachial plexus injury
- Dx: MRI a few weeks from injury to evaluate for root avulsions
- Nerve root injury can affect diaphragm (C3-5)
- Tx: nerve transfers if no functional or EMG recovery at 3-6 months

## Radial nerve injury
- Early reinnervation: brachioradialis, extensor carpi longus and brevis (ECRL, ECRB)
- Last reinnervation: extensor indicus proprius

## Ulnar nerve injury
- Innervates FDP ring and small fingers, FCU proximally in forearm, digital intrinsic muscles distally in hand
- Weak digital abduction/adduction, thumb adduction (adductor pollicis)

## Complex regional pain syndrome
- Sx: burning pain, stiffness
- RF: smokers, female
- Dx: shiny, swollen, warm skin, hypersensitivity on exam
- Dx: Normal EMG/NCS, bone scan with increased area intake
- Pathophysiology: changes to C nerve fibers
- Types: I: no identifiable nerve; II: identifiable nerve

## Parsonage-Turner
- Acute brachial neuritis, can occur after viral infection
- Dx: multiple peripheral nerves involved on EMG/NCS, hourglass constriction of the brachial plexus on MRI

# Nerve Repairs

## Repair and reconstruction
- Tension-free coaptation (#1 technical factor)
- Use nerve grafts for gaps >1cm
- Nerve autografts: sural, lateral antebrachial cutaneous, medial antebrachial cutaneous
- Age (#1) most predictive of outcome, more distal injury favorable to proximal injury
- Nerve regenerates at ~1mm/day, can reinnervate muscle 12-18 months from injury

## Nerve transfers
- Consider when distance from injury to motor end plates unlikely to reinnervate
- Anterior interosseous (intrinsic) nerve transfer
  - Used to reestablish hand intrinsic function after proximal ulnar nerve injury (around elbow)
  - Tx: anterior interosseous nerve from pronator quadratus transferred to ulnar motor branch at distal forearm
  - Ulnar nerve topography at distal forearm: sensory/motor/sensory
- Elbow flexion nerve transfer
  - Tx: FCU fascicle of ulnar nerve to brachialis (Oberlin) +/- FCR of median (McKinnon) to biceps branches

## Free functional muscle transfer
- Role in complete plexopathy
- Use extra-plexus donor nerve (e.g., spinal accessory, intercostals)
- Spinal accessory nerve: runs in posterior triangle of the neck, innervates sternocleidomastoid, trapezius muscles
- MC gracilis flap used to restore elbow flexion

## Neuroma in continuity
- Tx: excise, repair with nerve graft

# Tendon Transfers

- Need supple joints, soft tissue equilibrium, donor of adequate excursion, adequate strength donor, expendable donor, straight line of pull, synergy, single function per transfer
- Tendon transfers: PT to ECRB, FCR to extensor digitorum communis (EDC), FDS IV to extensor pollicis longus (EPL)

## Targeted muscle reinnervation
- Major peripheral nerve to selective motor branch nerve transfer
- Select synergistic transfers: e.g., median nerve to flex digits
- Decreases phantom pain, improved ability to use myoelectric prosthetics
- Billed as a pedicled nerve transfer
- Primary TMR: performed at amputation
- Secondary TMR: performed after amputation for pain or phantom sensation
  - Pain initially worse for first 6 weeks, then plateaus and decreases over following 6 months

## Myoelectric prosthesis
- Senses surface EMG signals
- Targeted muscle reinnervation creates stronger signals
- More complex motions than body-powered prosthesis
- Synergistic functions: Above-elbow amputation: median nerve to biceps (short head) for hand closure`,

    'hand-tendons': `# Flexor Tendons

## Exam
- Flexor digitorum superficialis (FDS)
  - Actively flexes proximal interphalangeal joint (PIPJ) with other digits in extension
  - Orientation of tendons (wrist level): middle and ring finger tendons volar to index and small finger tendons
  - Small finger FDS absent in ~15% of people
- Flexor digitorum profundus (FDP)
  - Actively flexes distal interphalangeal joint (DIPJ) with other digits in extension
  - Linburg-Comstock anomaly: congenital adhesion between FPL and FDP index finger proximal to carpal tunnel
- Tenodesis effect
  - Passively extend wrist, assess digital cascade for abnormalities
- Lumbrical muscle
  - Actively flexes MCPJ
  - Originates from FDP in proximal palm, insert on radial lateral band

## Injuries
- 5 zones from distal to proximal
  - I: distal to FDS insertion
  - II: between FDS insertion to A1 pulley/distal palmar crease
  - III: between A1 pulley and carpal tunnel
  - IV: carpal tunnel
  - V: forearm

## Zone II
- Tx surgery: repair within 2 weeks
  - Strength of repair related to # of core strands, suture size, locking suture, suture location (should be dorsal)
  - 1cm bites optimal suture distance for repair
  - Repair of one FDS associated with decreased tendon resistance compared to both FDS slips
- Post-operative care: occupational therapy for 3-6 months
  - Early active motion: begins first few days after repair (same rupture risk, better range of motion compared to other protocols)
  - Modified Duran: early passive motion protocol, typically don't start active motion until 3-4 weeks after repair

## Staged flexor tendon repair
- Necessary after >2 weeks from injury or significant damage to pulleys
- Attritional changes occur to flexor tendon over time
- Tx: 2-stage reconstruction
  - Stage 1: place silicone rod from DIPJ to central palm or distal forearm, allow capsule to recreate pulley system for 12 weeks
  - Stage 2: exchange silicone rod for tendon autograft
- Tx: Paneva-Holevich (2-stage reconstruction variation): suture FDS to FDP, place silicone rod distally at stage 1, use FDS as tendon autograft to distal FDP stump at stage 2

## Secondary flexor tendon surgery
- e.g., tenolysis: need passive greater than active motion, stable soft tissues
- Wait at least 6 months after initial repair

## Partial lacerations
- Can trial conservative therapy up to 90% laceration (unless there's triggering)

## Jersey finger
- Flexor zone I (FDP) distal rupture
- Classification:
  - I: avulsion to palm
  - II: retraction to PIPJ with bone segment
  - III: retraction to DIPJ with bone segment
  - IV: fracture, tendon avulsion
  - V: comminuted distal phalanx fracture
- Tx: types I: repair <1 week, II, III repair <3 weeks

## Pulley injuries

### A1 pulley
- Odd numbered pulleys originate from volar plate
- Stenosing tenosynovitis (trigger finger)
  - Flexed posture of digit, usually able to manually reduce
  - RF: diabetes
  - Tx: steroid injection
  - Tx: A1 pulley release if recurrent, advanced disease
  - Wait 12 weeks after steroid injection before surgery

### A2 pulley
- Arises from bone
- 50% of pulley needed to prevent tendon bowstringing
- Closed rupture of pulley
  - Associated with rock climbing positions
  - Tx: rest, ice, ring splint
  - Tx: tendon autograft pulley reconstruction

# Extensor Tendons

## Anatomy
- VIII zones: Progress from distal to proximal (odd over joints, even over bones)
- Zone VII: Extensor retinaculum
- Zone VIII: forearm
- Most distal forearm muscle belly for extensor tendons: extensor indicis proprius (EIP)

## Exam
- Central slip (extensor zone III) injury
  - Main tendon for PIPJ extension
  - Dx: Elson test: cannot actively extend DIPJ in flexed MCPJ and PIPJ position with intact central slip due to lateral bands (but can extend PIPJ due to intrinsics)
  - Tx: PIPJ extension splinting for 4-6 weeks or surgical repair
- Intubated/non-cooperative patient: Assess tenodesis effect (passively flex the wrist, assess digital extension)

## Injuries

### Zone III-V lacerations
- Tx: repair and relative motion extension splint (better motion outcomes compared to traditional splint/motion protocols)

### Proximal interphalangeal joint flexion contracture
- Test intrinsic/extrinsic tightness with Bunnell test
- Tx: release volar plate, checkrein ligaments

### Boutonierre deformity
- Central slip injury: PIPJ flexes, DIPJ extends in collapse pattern
- Can be traumatic or inflammatory
- Dx: loss of active IPJ extension against force, abnormal Elson's test
- Tx: splint with PIPJ extended, DIPJ free

### Swan neck deformity
- PIPJ extends, DIPJ flexes (extensor lag)
- MC from distal phalanx injury with nonunion (bony mallet), then zone I extensor tendon injury (soft tissue mallet)
- Acute/subacute mallet finger (extensor zone I)
  - Tx: splint in extension x 6-8 weeks
  - Tx: pin DIPJ in extension if unable to tolerate splint or volar subluxation of distal phalanx

### Sagittal band injury
- Maintains position of extensor tendon over the metacarpal head
- Sx: swelling, inability to extend MCPJ from flexed position
- Tx: relative extension splinting; direct repair (acute) or reconstruction (chronic)

### Extensor pollicis longus rupture
- Inability to extend thumb IPJ or retropulse thumb
- 3rd extensor compartment, ulnar to Lister's tubercle in distal radius
- Attritional ruptures occur with closed management of non-displaced distal radius fractures
- Tx: tendon transfer: EIP to extensor pollicis longus

### 1st extensor compartment tendinopathy (De Quervain's)
- Sx: radial styloid pain, swelling of radial/distal forearm, worse with thumb movements
- Dx: Eichoff test with pain to radial styloid with ulnar deviation of wrist with thumb flexed in palm
- Tx: steroid injection, immobilization, surgical release
- Non-surgical treatment less effective when septum between abductor pollicis longus and extensor pollicis brevis exists

### Intersection syndrome
- Dx: pain 4-5cm proximal to Lister's tubercle, swelling, worse with wrist extension
- Tx: splint, steroid injection; 2nd extensor compartment release

### Lumbrical-plus deformity
- Paradoxical extension of the IPJ with active flexion of remaining digits
- Due to shortening of the FDP and lumbrical muscle`,

    'replantation-vascular': `# Replantation

- MC cause: table saws (#1) for adults
- Relative indications: Thumb, child, multiple digits, flexor zone I, proximal amputations (e.g., wrist, forearm)
- Relative contraindications: Ring avulsion, single-digit flexor zone II, multi-segmental injury

## Timing of replantation
- Digits: no muscle tissue, more tolerant of ischemia
  - Cold ischemia time: 24 hours (case reports with longer ischemic times)
  - Warm ischemia time: up to 12 hours
- Proximal amputations
  - Cold ischemia time: 12 hours
  - Warm ischemia time: 6 hours
  - Consider arterial shunts to restore blood flow within 6 hours (may need to prioritize reperfusion over bony stabilization pending time from injury); muscle most susceptible to ischemia

## Repair
- Options: digit-by-digit sequence (one digit at a time) vs structure-by-structure (bone, tendon, microsurgical repairs)
- Favorable factors: mechanism of injury (#1), number of veins repaired, better outcomes at high-volume centers
- Use vein grafts for large gap arterial injuries (>2cm)

## Prostheses
- Forearm-level amputation
  - Wrist disarticulation: preserves forearm rotation
  - Transradial: better prosthetic fitting (need 5cm of ulna length distal to elbow to fit prosthesis)

# Other Vascular Diseases

## Hypothenar hammer syndrome
- Sx: ischemic changes to ring and small finger, cold sensitivity, coolness, finger ulceration, distal emoblization
- Dx: digital-brachial index (<0.7 abnormal, <0.5 associated with tissue loss)
- Dx: angiogram with tortuous ulnar artery at proximal hand level
- Tx: aspirin, calcium-channel blockers (1st line if mild)
- Tx: surgery: ulnar artery segment with vascular reconstruction (if moderate/severe symptoms), ligation if fingers perfused

## Acute upper extremity arterial embolism
- Dx: Doppler US, CT or MR angiography, formal angiography
- Tx: heparin gtt (1st), then surgery if amenable location of clot

## IV extravasation
- Tx: surgery: full-thickness skin necrosis, chronic ulceration, persistent pain, known caustic agent (e.g., certain chemotherapeutics)

## Pseudoaneurysm
- Sx: pulsatile, rapidly enlarging mass
- Tx: IR if small, otherwise explore and repair vessel

## Supracondylar humerus fractures
- Associated with distal ischemia from brachial artery involvement
- Tx: closed reduction, reassess pulses
- If no return of pulses, angiographic imaging

## Brachial arterial line
- MC complication: median nerve injury

# Other Hand Emergencies

## High-pressure injection injury
- Paint solvents, oils at >2,000 psi
- Can cause vascular compromise, severe damage to soft tissues, compartment syndrome, infections
- Dx: XR if radiopaque material injected
- Tx: emergent debridement
- High amputation rate (30%), worse with treatment delays`,

    'wrist-forearm-injuries': `# Carpal Injuries

## Scaphoid fracture
- MC carpal fracture
- Dx: anatomic snuff box tenderness
- Dx: XR (scaphoid view: wrist 20 degrees ulnar deviation, 20 degrees extension)
- Dx: MRI best test for occult fractures or evaluate for union
- Tx surgery:
  - Distal pole: cast x 6-12 weeks or surgery for displacement, faster return to activities
  - Waist and proximal pole: consider screw fixation
  - Retrograde blood supply, proximal pole most prone to nonunion
  - Scaphoid nonunion advanced collapse (SNAC): arthritic pattern from scaphoid nonunion
  - Tx: scaphoidectomy and 4-corner fusion vs proximal row carpectomy

## Hamate
- Hook of hamate fracture
  - Sx: ulnar nerve symptoms, pain, flexor tendon injuries (decreased grip strength)
  - MC tendon rupture: small finger flexor
  - Dx: XR (carpal tunnel view), CT scan

## Wrist ligament injuries

### Scapholunate ligament injuries
- Scapholunate advanced collapse (SLAC) arthritic pattern
  - Starts as a dorsal intersegmental instability (DISI) deformity; scaphoid flexes, lunate extends
  - Arthritis develops proximal row then midcarpal (radioscaphoid, scaphocapitate, capitolunate, then radiolunate)
  - Dx: XR with scapholunate gap >3mm, scapholunate angle >70 degrees on lateral, contralateral side with clenched fist view (axial loading of wrist)
  - Dx: arthroscopy (most accurate)
  - Tx: scaphoidectomy and four-corner fusion or proximal row carpectomy

### Lunate dislocation
- Mayfield classification: predictable progression of intrinsic ligament injuries
  - I: Scapholunate ligament (SL) injury
  - II: lunocapitate ligament injury
  - III: lunotriquetral ligament injury
  - IV: volar dislocation of lunate out of fossa
- Short radiolunate ligament generally remains intact
- Sx: acute median nerve sensation changes (acute carpal tunnel syndrome)
- Dx: XR with changes in Gilula's lines on PA; spilled teacup or volar lunate laterally
- Tx: immediate closed reduction followed by ORIF +/- carpal tunnel release (urgent if irreducible or persistent median-nerve symptoms after reduction)
- Preserves 65-70% wrist flexion/extension, 80% grip strength compared to uninjured side
- XR shows post-traumatic arthritis

### Volar intersegmental instability (VISI)
- Triquetrum extends, lunate flexes

## Distal radius fractures
- Similar functional and radiographic outcomes with short- vs long-arm casting; with less shoulder pain with short-arm cast

# Wrist Kinematics

- Proximal row: scaphoid flexes the wrist, triquetrum extends, kept neutral by lunate
- Distal row: allows dart thrower's motion (radial inclination in extension and moves to ulnar inclination in flexion)
- Ulnar variance: Dx: lateral XR most accurate view

# Compartment Syndrome

## Acute
- Sx: severe pain, possible numbness
- RF: obtunded, crush injury, reperfusion injury (TNF alpha release)
- Dx: pain with passive stretch, paresthesia, paralysis, pallor, pulselessness (late) on exam
- Dx: compartment manometry (compartment pressure >30 or within 30 of diastolic blood pressure)
- Dx: lab changes (hyperkalemia, metabolic acidosis, hypocalcemia)
- Rhabdomyolysis can progress to acute kidney injury
- Tx: compartment release

## Chronic
- Volkmann ischemic contracture
  - Affects deep volar compartment 1st
  - Tx: occupational therapy
  - Tx: surgical: tendon lengthening (mild), flexor pronator slide (moderate), superficialis to profundus (severe), free functional muscle transfer (severe)

# Elbow and Forearm Pathology

## Extensor carpi radialis brevis (ECRB) enthesopathy (lateral epicondylitis)
- Degenerative changes at attachment of ECRB to lateral epicondyle
- Dx: lateral elbow tenderness with hyperextension of middle finger (ECRB inserts on base of third metacarpal)
- Tx: occupational therapy/activity modification/stretching exercises, corticosteroid injection, surgical debridement (outcomes the same regardless of treatment)

## Distal radioulnar joint instability
- Associated with Essex Lopresti, Galeazzi injuries affecting the interosseous membrane`,

    'hand-tumors': `# Cysts

## Digital mucous cyst
- Secondary to distal interphalangeal osteoarthritis, can involve nail fold
- Dx: XR with osteophyte at distal interphalangeal joint
- Tx: excise cyst cavity, remove osteophyte

## Ganglion cyst
- MC dorsal wrist (~60% of all ganglion cysts) from scapholunate area; volar cysts possible (MC radioscaphoid area)
- Sx: wax/wane in size
- Dx: transilluminates on exam
- Tx: excision (~50% recurrence risk)

# Benign Soft-Tissue Masses

## Glomus tumor
- MC: subungual
- Sx: blueish appearance, severe pain with localized pressure, sensitive to cold, pinpoint sensitivity, paroxysmal pain
- Dx: cold-water test, pain decreases with inflation of blood-pressure cuff
- Dx: MRI T2 (lesion is bright)
- Tx: complete surgical excision

## Giant cell tumor of tendon sheath
- Tan, multi-lobulated mass
- Dx: does not transilluminate on exam
- Dx: XR can invade bone cortex, MRI decreased T1/T2 intensity
- Dx: histiocytoid mononuclear cells on pathology
- Tx: marginal excision
- Can invade into digital nerve
- MC complication: recurrence

## Extensor digitorum brevis manus
- 2-3% of population
- Near radiocarpal joint just distal to extensor retinaculum
- No transillumination

## Schwannoma
- MC nerve tumor
- Benign (with rare malignancy potential) peripheral nerve tumor from glial cells
- Dx: painless smooth, non-adherent mass, + Tinel sign in nerve distribution on exam
- Dx: MRI
- Tx: excision (intra fascicular)

## Enchondroma
- MC bone tumor of hand
- Abnormal cartilage deposit in bone; prone to pathologic fractures
- Rare syndromic associations (Mafucci: venous malformations, Ollier disease: can progress to chondrosarcoma)
- Tx: observe if asymptomatic
- Tx surgical: curettage and bone grafting

## Giant cell tumors of the bone
- Benign, locally aggressive
- Dx: CT chest (rare pulmonary metastasis)
- Tx: curettage and bone grafting for early, resection and bone reconstruction for late

## Osteoid osteoma
- Benign bone tumor arising from osteoblasts
- Sx: focal bony pain relieved by NSAIDs
- Dx: CT
- Tx: NSAIDs

# Malignancies

## Melonychia
- Biopsy for >3mm streak crossing eponychial fold (risk of acral lentiginous melanoma)
- Tx: wide local excision with local flap or FTSG reconstruction, amputation for advanced cases
- Prognosis related to tumor stage

## Soft-tissue sarcomas
- Can be in upper or lower extremity
- Dx: imaging or incisional biopsy (longitudinal)
- Dx: anaplastic cells on histopathology
- Tx: wide-local excision (1cm margin or more) and radiation therapy for limb salvage
- Amputation to above nearest proximal joint for advanced cases, older patients
- No routine lymph node sampling unless clinical evidence of nodal involvement

## Bony sarcomas
- Chondrosarcoma: MC malignant non-skin tumor of the hand (SCC is most common overall)
- Osteosarcoma: can metastasize to lung

## Nerve tumors
- Malignant peripheral nerve sheath tumors: metastasizes to lung`,

    'hand-inflammation-infections': `# Osteoarthritis

## Thumb carpometacarpal (CMC) arthritis
- MC site of hand arthritis
- Dx: XR
  - Eaton classification: symptoms don't correlate with imaging
  - I: joint space narrowing
  - II: small osteophytes
  - III: large osteophytes
  - IV: collapse changes: scapho-trapezoid-trapezium (STT) joint
  - Eaton stress view: thumbs pushed together, assess laxity/subluxation
  - Roberts view: hyperpronated thumb to evaluate trapeziometacarpal joint
- Tx: trapeziectomy
  - Ligament reconstruction with tendon interposition (LRTI) commonly performed; associated with higher complication rate than trapeziectomy alone
  - Thumb metacarpophalangeal joint (MCPJ) hyperextends to compensate for advanced collapse; need to correct >30 degrees MCPJ hyperextension
  - Tx: MCPJ fusion

## Scaphotrapeziotrapezoidal (STT) arthritis
- Can occur in isolation or with CMC arthritis
- Dx: no axial thumb pain or subluxation of thumb differentiates from CMC arthritis
- Dx: XR
- Tx: OT, steroid injection; STT arthrodesis

## Flexor tendon rupture
- Attritional from radiocarpal arthritis
- Dx: imaging to assess for osteophytes
- Tx: resect osteophyte, tendon graft reconstruction

# Inflammatory Arthritis

## Rheumatoid arthritis
- Can progress to advanced wrist arthritis, attritional extensor tendon ruptures, digital deformities (e.g., Boutonniere, swan neck deformities)
- Wrist collapse
  - Loss of carpal height, weakening of intrinsic ligaments
  - Causes ulnar subluxation of carpus, radial deviation of metacarpals
  - Digits go into ulnar drift and attenuate radial sagittal bands
- Extensor tendon ruptures
  - Attritional ruptures from chronic inflammatory tenosynovitis
  - Extensor pollicis longus rupture: MC tendon rupture, occurs around Lister's tubercle
  - Caput ulna (Vaughan-Jackson syndrome): ruptures of extensor digitorum communis and digit minimi around ulna due to arthritis, progresses radial to ulnar
  - Tx: Darrach (distal ulna head resection); Sauve-Kapandji (distal radioulnar joint fusion) for arthritis without caput ulna
- Digital deformities
  - Boutonniere (Digits): PIPJ flexes, DIPJ extends; PIPJ synovitis attenuates central slip, stretches volar plate; lateral bands compensate with volar translocation
  - Tx: OT/splinting; Fowler tenotomy (release terminal extensor tendon)
  - Boutonniere (Thumb): Due to metacarpophalangeal joint (MCPJ) synovitis
  - Swan neck: PIPJ extends, DIPJ flexes
  - Tx: OT/splinting; spiral oblique retinacular ligament reconstruction

## Gout
- Deposition of crystals in joint spaces (common to wrist, elbow)
- Dx: negatively birefringent crystals on wrist aspirate
- Tx: colchicine

## Pseudogout
- Dx: + birefringent crystals on wrist aspirate

## Psoriatic arthritis
- Preferentially affects DIPJ, nail bed

# Other Inflammatory Conditions

## Raynaud's disease
- Idiopathic peripheral vasoconstriction of the digits
- Due to overactive alpha-2 receptors

## Raynaud's phenomenon
- Associated with underlying rheumatologic disease (MC sclerodermia/CREST)
- Sx: small, non-healing ulcers at fingertips, color changes, chronic pain
- Tx: calcium-channel blockers, then botulinum toxin
- Botulinum toxin: inhibits Rho/Rho kinase, decrease substance P secretion, decrease C-fiber receptors
- Inject botulinum toxin to perivascular area at distal palm
- Tx surgery: wrist, arch, and digital sympathectomy (severe, intractable cases)

## Digital clubbing
- Due to increased vascular connective tissue

## Dupuytren's contracture
- Progressive palmar fascia contracture
- Largely genetic etiology
- Due to myofibroblasts
- Central cord: pretendinous cord extension, affects metacarpophalangeal joint (MCPJ)
- Spiral cord: at proximal phalanx, displaces neurovascular bundle volarly and centrally
- Natatory cord: webspace
- Retrovascular cord: dorsal to neurovascular bundle at DIPJ
- PIPJ contracture most associated with recurrence after surgical treatment
- Tx: clostridium histolyticum (CCH) injection (inject then break cord 1-3 days later; Complications: skin breakdown #1, transient numbness)
- Tx: needle aponeurotomy +/- fat grafting (fat grafting inhibits myofibroblast proliferation)
- Tx: surgical aponeurectemy (Complications: flare reaction, complex regional pain syndrome; Tx: conservative)

# Infections

## Bacterial

### Fight bite
- Human tooth to the extensor hood of the MCPJ from punching someone
- High rate of deep infection (MCPJ septic arthritis), extensor tendon injury
- Tx: amoxicillin/clavulanic acid, MCPJ exploration, joint irrigation
- MC organisms: group-A strep, staph aureus, eikenella

### Animal bites
- Cat bites tend to cause deep injury, dog bites tend to be avulsive
- Dog bites (unprovoked attacks): Assess dog rabies vaccine status; contact local authorities, quarantine/observe dog for 10 days if rabies vaccine up to date, otherwise testing needed
- Rabies treatment: repair lacerations after immunoglobulin injected into wound
- MC organisms: staph aureus, Pasteurella
- Tx: antibiotics; incision and drainage, loosely close wounds
  - 1st line: Amoxicillin/clavulanic acid
  - 2nd line (PCN allergy): clindamycin, TMP/SMZ
  - 3rd line: fluoroquinolones, doxycycline

### Flexor tenosynovitis
- Inoculation of flexor tendon sheath by direct puncture or bacteremia
- Dx: Kanavel signs: diffuse swelling, flexed posture of digit, tenderness over flexor sheath (#1), and pain with passive extension
- Tx: antibiotics; irrigation of flexor tendon sheath between A1 and A5 pulleys

### IV drug use
- MC organism: staph (MRSA)
- Tx: vancomycin

### Deep-space hand infections
- Radial to ulnar spread via radial bursa communicating to Parona's space then going to ulnar bursa (horseshoe abscess)

## Viral

### Human papilloma virus
- MC warts in children, most spontaneously resolve

### Herpetic whitlow
- Small vesicular rash, then blisters
- Dx: Tzank smear, antibodies titers
- Tx: observation, anti-viral (acyclovir) if diagnosed within first 72 hours`,

    'congenital-pediatric-hand': `# Embryology

## Extremity development
- Occurs during gestational weeks 4-8
- Proximal distal: apical epidermal ridge (formed from FGFR proteins; cause of amelia)
- Anteroposterior axis: Zone of polarizing activity (mirror foot: duplication of zone of polarizing activity)
- Radio ulnar: Formed from sonic hedgehog protein (responsible for mirror hand)
- Volar: BMP and Engrailed-1
- Dorsal: Formed from Wnt7a → LMX1B (Nail-patella syndrome: autosomal dominant LMX1B defect)

## Bone ossification
- Clavicle and femur first long bones to ossify at 8 weeks

# Diseases

## Syndactyly
- Due to failure of apoptosis of web spaces
- Classification: Simple or complex (based on bone involvement), complete or incomplete (based on skin involvement)
- Tx: surgical release
  - Dorsal flap for webspace, full-thickness skin grafts for digits
  - Perform at 1 year of age
  - Release one webspace at a time

## Polydactyly
- Post axial (ulnar)
- Pre-axial (thumb duplication)
  - Wassel classification: I to VII (IV most common)
  - Numbering goes from distal to proximal
  - Odd have a bifid bone, even have two independent bones at same bony level
  - VII: anything else not otherwise classified

## Congenital trigger thumb
- Sx: thumb IPJ held in flexion
- Dx: Notta nodule to A1 pulley
- Tx: pulley release for fixed deformity > 1 year old

## Amniotic-band syndrome
- Associated with cleft lip, body wall defects, equinovarus, imperforate anus
- Dx: ranges from mild skin depression to severe proximal edema on exam, acrosyndactyly
- Patterson classification
  - I: simple constriction ring
  - II: constriction ring with lymphedema
  - III: constriction ring with acrosyndactyly
  - IV: amputation at any level
- Tx: surgical release of band for worsening swelling, distal discoloration of limb
- Staged releases (one half at a time for circumferential bands)
- Edema improves in a few weeks

## Congenital compartment syndrome
- RF: amniotic bands, oligohydramnios
- Sx: unilateral edema, bullae formation
- Tx: compartment release

## Camptodactyly
- Painless proximal interphalangeal joint flexion contracture; MC small finger

## Clinodactyly
- Painless radial inclination of distal phalanx; MC small finger

## Thumb hypoplasia
- Blauth classification
  - Type I: no treatment needed
  - Type II (mild): first-webspace deepening (e.g., 4-flap Z plasty), UCL repair for instability
  - Type III:
    - A: stable carpometacarpal (CMC) joint; Tx (if needed): flexor digitorum superficialis (FDS) tendon transfer to ulnar collateral ligament (UCL)
    - B: unstable CMC, and type IV and V: Pollicization: index finger placed into thumb ray position
      - extensor indicis → proprius extensor pollicis longus
      - extensor digitorum communis → abductor pollicis longus
      - palmar interosseous → adductor pollicis
      - dorsal interosseous → abductor pollicis brevis
      - flexor digitorum profundus → flexor pollicis longus

# Trauma

## Pediatric fractures
- Can involve epiphysis (growth plate)
- Salter-Harris fractures for epiphyseal fractures (involve the growth plate)
  - I: S - Same level
  - II: A - Above
  - III: L - Lower
  - IV: T - Through
  - V: R - Rest

## Seymour fracture
- Open epiphyseal fracture of distal phalanx with nail bed transection, germinal matrix gets entrapped
- Tx: irrigation, open reduction; pinning if unstable

## Pediatric supracondylar fractures
- Common in ages 5-7
- Dx: assess perfusion; if compromised, first perform closed reduction, observe for mild cases
- Brachial artery exploration if perfusion compromised after closed reduction

## Amputations
- MC male
- MC crush in door (crush in window #2)

# Congenital Syndromes

## Radial longitudinal deficiency
- Most are associated with syndromes
- Can have thumb hypoplasia/absence

## Fanconi's anemia
- Absent radius, sometimes thumb hypoplasia
- Progresses to aplastic anemia at age 4-5 (can be life threatening)
- Dx: CBC, then chromosomal breakage testing
- Tx: refer to hematologist

## Thrombocytopenia/absent radius
- Dx: CBC

## Holt Oram
- Autosomal Dominant
- Radial longitudinal deficiency, cardiac abnormality (VSD)

## VACTERL
- Vertebral, anorectal, cardiac, trachea-esophageal, renal, limb abnormalities
- Dx: renal US

# Pediatric Brachial Plexopathy

- Observe ~6 months for development of upper extremity motor function
- Dx: MRI to evaluate for nerve-root level injury`,

    'lower-extremity': `# Anatomy

## Lower extremity nerves
- Tibial: gastrocnemius, soleus, plantaris, popliteus, flexor digitorum longus, flexor hallucis longus (FHL)
  - Dx: plantarflexion, sensation to plantar surface of the foot
- Femoral: anterior thighs muscles
  - Dx: leg extension
- Obturator: medial thigh muscles
  - Dx: thigh adduction
- Peroneal nerve: lateral and anterior compartments
  - Associated with proximal tibiofibular joint dislocation
  - Dx: absent dorsiflexion of the foot, sensation to lateral foot
  - Tx: nerve repair, nerve grafting, nerve transfer FHL (tibial nerve) to AT if severe injury
- Medial plantar nerve
  - Continuation of the tibial nerve

## Lower extremity muscles
- Superficial posterior: gastrocnemius and soleus
  - Dx: plantarflexion
- Deep posterior: toe flexors
  - Dx: FHL with flexion of great toe
- Anterior: anterior tibial, toe extenders
  - Dx: dorsiflexion, inversion
- Lateral: peroneus muscles
  - Dx: ankle eversion
- Plantaris tendon
  - Located between medial gastrocnemius muscle and soleus, medial to Achilles tendon
  - Used as a tendon autograft

## Popliteal fossa
- Contain popliteal artery, tibial nerve, common popliteal nerve
- Bordered by medial head of gastrocnemius, semimembranosus, lateral head of gastrocnemius, and biceps femoris

## Toe anatomy
- Perfusion with dominant dorsal system in 70% of patients, plantar system in 30%, equivocal 10%
- Dx: lateral angiogram before toe-to-thumb transfer

# Lower Extremity Trauma

## Fracture fixation
- Bony stabilization increases with interfragmentary compression
- Primary bone healing: compression plates, lag screws, tension bands
- Secondary bone healing: intramedullary nailing, bridge plating, external fixation, K wires support relative stability

## Open fractures
- IV cephalosporin (in first 3 hours) or equivalent x 72 hours
- Restore length with reduction, splinting
- Assess pulses

## Gustilo classification
- I: Clean wound, <1cm
- II: Clean wound, >1cm
- III:
  - A: Adequate soft tissue for coverage
  - B: Inadequate soft tissue for coverage, periosteal stripping
  - C: Arterial injury requiring repair

## Secondary-bone reconstruction
- Masquelet: two-stage reconstruction
  - 1st stage: antibiotic spacer placement, allow 4-8 weeks for pseudomembrane to form
  - 2nd stage: replace antibiotic spacer with cancellous bone graft into pseudomembrane
- Ilizarov/bone transport
  - Perform osteotomy away from fracture site, then distraction osteogenesis
  - Bone forms by intramembranous ossification
- Capanna technique
  - Free fibula free flap inside bone allograft
  - Used for large-gap sarcoma bony reconstruction

## Limb salvage
- RF for failure: popliteal artery injury, ankle/foot fractures
- Ideally, soft-tissue coverage within 10 days from injury
- Can be performed with tibial nerve injury (if nerve is reparable)
- Traumatic amputations occur MC due to ischemia; good functional outcomes in appropriately selected patients

## Morel-Lavallée lesion
- Soft-tissue fascial shear injury with intact skin
- Prone to seroma, lymphatic disruption
- Dx: MRI for chronic injuries
- Tx: compression bandaging, percutaneous aspiration, +/- sclerosing agents

# Lower Extremity Reconstruction

## Flaps
- Pedicled
  - Propeller
    - Identify subcutaneous perforator to island of skin
    - MC failure due to venous congestion from kinking
- Free tissue transfer
  - Muscle flaps: Fill dead space better
  - Fasciocutaneous flaps: Decreased donor-site morbidity

## Tissue Expansion
- Lower extremity placement has highest complication rate in the body

# Vascular Diseases

## Lower extremity
- Peripheral arterial disease
  - Claudication that progresses from rest pain to tissue loss
  - Dx: palpate pulses, Doppler exam
  - Dx: ankle-brachial index
    - >1: normal
    - 0.7-0.9: claudication
    - <0.5: rest pain, tissue loss
  - Dx: toe-brachial index for non-compressible vessels (diabetes mellitus)
- Venous insufficiency ulcers
  - Tx: elevate, serial compression dressings (Unna boot)
- Lymphedema
  - MC cause obesity (U.S.), filiarsis infection (worldwide)
  - Dx: Staging:
    - 0: clinically normal, identified on lymphoscintigraphy
    - 1: clinically apparent, improves with limb elevation
    - 2: pitting edema, does not improve with elevation
    - 3: fibrosis of soft tissues
- Neuropathic foot ulcers
  - Treat non-infected, non-ischemic ulcers with contact casting
  - Tx: granulocyte-stimulating factor use associated with decreased need for below-knee amputation
  - Tx: medical honey draws fluid from deep to superficial by osmosis
  - Tx: hyberbaric oxygen indicated for exposed bone

# Aesthetic

## Calf augmentation
- Submuscular position for implant associated with lowest complication rate`
  },

  // Section 3: Craniomaxillofacial
  'craniomaxillofacial': {
    'cleft-lip-palate': `## Cleft Lip and Palate

### Embryology, Epidemiology, and Genetics
**Embryology**: Cleft lip (median nasal prominences don't fuse), Cleft palate (medial and lateral palatine processes don't fuse)
**Genetics**: One sibling affected: 2.5% risk, Two siblings: 10%, Parent and sibling: 17%, Van der Woude (autosomal dominant): 50% risk
**Epidemiology**: Cleft lip/palate 1:700 (M:F 2:1, 15% syndromic), Cleft palate only 1:1500 (M:F 1:2, 50% syndromic)

### Cleft Care
**Cleft Lip**: Repair at 3-6 months, establish muscular continuity
**Cleft Palate**: Repair at ~1 year, worse speech with delayed repair
**VPI**: Tx: buccal musculomucosal flaps, sphincter pharyngoplasty (highest OSA risk), pharyngeal flap
**Alveolar Bone Grafting**: Time with permanent canine (~age 8-12)
**Orthognathic**: LeFort I for Class III occlusion
**CHARGE syndrome**: #2 syndromic cleft (Coloboma, Heart, Atresia, Retardation, Genital, Ear)`,

    'facial-fractures': `## Facial Fractures and Skull

### Fractures
**Frontal Sinus**: Posterior table fractures risk CSF leak (Dx: beta-2 transferrin)
**Orbital**: Floor fractures MC, repair for sizable defects/persistent diplopia; Entrapment MC in pediatrics (prompt repair needed)
**NOE Fractures**: Risk telecanthus (Markowitz classification), canalicular injury, CSF leak
**ZMC Fracture**: 2-point fixation (simple), 3-point (complex)
**Base of Skull**: Contraindication to nasotracheal intubation

### Reconstruction
**Scalp**: Flap if exposed cranium, tissue expansion between galea and temporalis
**Cranioplasty**: >6 sq cm defect; PEEK (MC complication: infection), Methylmethacrylate (exothermic), Hydroxyapatite
**Positional Plagiocephaly**: Tx: repositioning, helmet molding >3 months`,

    'facial-paralysis': `## Facial Paralysis

### Anatomy
**Main trunk**: 6-8mm distal to tympanomastoid suture
**Frontal branch**: Pitanguy's line (0.5cm below tragus to 1.5cm above lateral brow)

### Etiologies
**Bell's palsy**: 80-90% resolve, Tx: steroids if early
**Möbius**: CN VI, VII absence; Tx: temporalis transfer or free gracilis
**Parry-Romberg**: Progressive hemifacial atrophy, starts late teens; Tx: methotrexate, volume replacement

### Reanimation
**Dynamic**: Free muscle transfer (cross-facial graft vs masseteric nerve), temporalis turnover
**Static**: Autologous slings (lowest complication rate)`,

    'ear-reconstruction': `## Ear Reconstruction

### Congenital
**Embryology**: 1st cleft (EAC), 1st/2nd arches (helix - 6 hillocks), Preauricular sinus (incomplete fusion)
**Anomalies**: Microtia, Cryptotia (upper 1/3 adherent), Stahl ear (accessory 3rd crus), Lop ear

### Reconstruction
**Neonatal Molding**: Start by 2 weeks (up to 3 months), MC complication: skin ulceration
**Autologous**: Rib cartilage framework, Nagata (2-stage), Brent (3-stage)
**TPF flap**: Based on superficial temporal artery, workhorse for coverage
**Replantation**: Venous repair doesn't change success, leech therapy if no vein anastomosis

### Aesthetic
**Prominent ear**: Otoplasty age 6-7, Mustardé suture (antihelical fold), Furnas suture (conchal-mastoid angle)`,

    'mandible-dental-orthognathic': `## Mandible, Orthognathic, and Dental

### Mandible Fractures
**Locations**: Parasymphyseal (ORIF +/- MMF), Angle (ORIF, intra-oral approach), Condylar (generally closed with MMF)
**Fixation**: Champy technique (external oblique ridge), Reconstruction plate (load-bearing)
**Free flap**: Fibula for >5cm defects or XRT setting

### Tumors
**Ameloblastoma**: MC mandibular tumor, Tx: segmental mandibulectomy
**OKC**: #2 benign, associated with Gorlin syndrome (PTCH1)
**Periapical cyst**: MC cyst, from necrotic pulp

### TMJ
**TMD**: MC women 20-40, pain on palpation of mastication muscles
**Masseteric Hypertrophy**: MC from bruxism, Tx: botulinum toxin

### Orthognathic
**Class II**: BSSO for mandibular advancement
**Class III**: LeFort I for maxillary advancement
**Vertical Maxillary Excess**: "Gummy smile", Tx: LeFort I impaction`,

    'head-neck-tumors': `## Head and Neck Tumors

### Embryology
**Pharyngeal Arches**: 1(CN V-mastication), 2(CN VII-facial), 3(CN IX-stylopharyngeus), 4(CN X-pharyngeal/laryngeal), 6(CN XI-SCM/trapezius)

### Oral Cancer
**SCC**: Neck dissection for T2+ tumors, Chyle leak MC complication (triglycerides >110 mg/dL)
**Reconstruction**: Free flaps, Total laryngopharyngeal (ALT better speech, jejunum easier inset)
**Oropharyngeal**: HPV associated with better outcomes

### Glandular
**Parotid**: 80% of salivary tumors, 80% benign
- Pleomorphic adenoma (80% of benign), Warthin tumors (cystic, bilateral, smokers)
- Mucoepidermoid (MC malignant, MC in children), Adenoid cystic (perineural invasion)
**Minor Salivary**: 50% malignant, MC in palate, Adenoid cystic MC

### Lip Reconstruction
Primary closure (≤1/3), Lip switch flaps (1/3-1/2: Abbe, Estlander), Regional (>1/2: Karapandzic, Bernard-Webster)`,

    'congenital-syndromes': `## Congenital Syndromes

### Craniosynostosis
**Apert**: Bicoronal, complex syndactyly, FGFR2
**Crouzon**: Complex craniosynostosis, midface retrusion, normal extremities, FGFR2
**Pfeiffer**: Cloverleaf skull, exorbitism, broad thumbs, FGFR2
**Saethre-Chotzen**: Bilateral coronal, low ears, ptosis, TWIST
**Sagittal**: Scaphocephaly, Tx: endoscopic (early) vs open vault (late)

### Cleft Syndromes
**Treacher Collins**: Microtia, colobomas, cleft palate, retrognathia, TCOF1
**Robin Sequence**: Cleft palate, micrognathia, glossoptosis, Tx: prone positioning, mandibular distraction
**Van der Woude**: Lower lip pits, cleft palate, IRF6 (50% transmission)
**Velocardiofacial**: 22q11.2 deletion, cleft (submucous), cardiac, hypocalcemia

### Other
**Goldenhar**: #2 congenital facial malformation, hemifacial microsomia, epibulbar dermoids
**Beckwith-Wiedemann**: Macrosomia, omphalocele, macroglossia, chromosome 11`,

    'breast-augmentation': `# Breast Augmentation

## Breast Implants
- **Aesthetic ideal**: 45:55 upper pole to lower pole volume
- **FDA approved**: age >22 for aesthetic indications
  - Carries a black box warning
  - Requires specialized consent form

### Choices in Augmentation Mammaplasty
- **Shell**:
  - Smooth
  - Textured
- **Filling**:
  - Saline
  - Silicone
    - Modern cohesive gels with less rippling, rupture
    - Increased cross-linking of silicone improves form stability
    - More prone to rotation of implant
- **Pocket selection**:
  - Subpectoral/dual plane (MC)
    - Should perform if upper pole pinch test <2cm
    - Used for pseudoptosis
  - Subglandular
- **Incision selection**:
  - Inframammary fold (IMF)
  - Periareolar
  - Trans-axillary

### Surveillance
- MRI or US first 5-6 years then every 2-3 years to evaluate for silent rupture

### Breast Cancer Screening
- Mammography: Eklund view (displaces the implant toward the chest and pulls the breast tissue anteriorly)

## Complications
- **MC**: reoperation for size
- **Capsular contracture**
  - Baker grading:
    - I: Normal
    - II: Palpable
    - III: Visible
    - IV: Painful
  - MC cause: biofilm
    - Subclinical infection associated with indwelling medical devices
    - Forms due to extracellular polymeric substance matrix causing surface for bacterial adherence
    - Slow bacterial growth rate reduces antibiotic efficacy
    - Reduced risk with IMF incision, subpectoral placement, and textured implants
  - No evidence to support extended antibiotic courses to prevent
- **Double capsule**
  - RF: OCPs
  - Sx: painless enlargement, becomes firm years after implantation
- **Double bubble**
  - Two transverse creases at lower pole of breast due to incomplete scoring or release of former IMF when lowering it with an implant
  - RF: superiorly displaced native IMF
  - Tx: release superficial fascial attachments to skin
- **Snoopy nose deformity**
  - Gland descends, implant stays in place
  - Tx: mastopexy
- **Animation deformity**
  - Tx: change from subpectoral to subglandular plane, +/- acellular dermal matrix or mesh
- **Rupture**
  - Dx: MRI
- **Galactocele**: milk-filled cyst caused by lactiferous duct blockage
- **Pneumothorax**
  - Sx: shortness of breath, chest tightness
  - Dx: chest xray
- **Infection**
  - Atypical mycobacterial infections
    - More common with cosmetic tourism
    - Doesn't respond to antibiotics, causes non-healing wounds
    - Dx: acid-fast stain and mycobacterial culture
    - Tx: remove implant, debride
- **Breast-implant-associated-ALCL (BIA-ALCL)**: See breast reconstruction chapter
- **Breast implant illness**
  - Sx: vague systemic symptoms (fatigue, brain fog, headaches, anxiety)
  - Dx: clinical diagnosis, no definitive laboratory or imaging test, consider work up for autoimmune disease
  - Tx: explantation (widely variable outcomes reported)
    - +/- capsulectomy: studies don't show difference in outcomes
    - Worse outcomes when known autoimmune disease`,

    'breast-reduction-mastopexy': `# Breast Reduction and Mastopexy

## Embryology
- **Ectoderm**
  - Mammary ridge exists from axilla to inguinal region (milk line)
    - Begins week 5-6
    - Remaining ridge involutes during development
  - Diseases:
    - **Polymastia**: accessory breast tissue due to incomplete mammary ridge involution
      - Can occur in axilla
      - Sx: swelling of mass during menses
      - Dx: glandular tissue in lower dermis/fat on pathology
    - **Supranumery nipple**: additional nipple due to incomplete involution of ectodermal ridge along milk line
      - Polythelia: >2 supranumery nipples (associated with renal cancers and kidney disease)
    - **Amastia**: mammary ridge absent, breast and nipple absent
    - **Amazia**: no breast tissue, nipple present
    - **Inverted nipples**: failure of mesenchyme to proliferate
- **Epithelial Cells**: Responsible for development of lactiferous ducts
- **Mesoderm**: Development of breast parenchyma

## Breast Aging
- **Puberty breast development**
  - Surge of insulin-like growth factor 1 (IGF-1) from breast tissue stimulates pituitary gland
  - Estrogen: duct growth
  - Progesterone: glandular bud growth
- **Postpartum breast changes**
  - Dx: involution with decrease in differentiated lobules on pathology
- **Menopause breast changes**
  - Glandular involution due to decreased estrogen
- **Regnault ptosis classification**
  - I: nipple above inframammary fold (IMF)
  - II: nipple below IMF
  - III: nipple at most dependent aspect of breast
  - Pseudoptosis: nipple at or above IMF, majority of breast volume is below IMF

## Anatomy
- **Nipple areola complex**
  - Vascular: branches from internal mammary
  - Nerve: anterior branch of fourth intercostal nerve
  - Montgomery glands: affect skin lubrication
- **Breast reduction vascular pedicles**
  - Inferior: 6th intercostal artery supplies nipple
  - Superomedial: 2nd intercostal/IMA

## Techniques
- **Periareolar mastopexy**
  - Less projection compared to other techniques
  - Complications: Scar/areolar widening
- **Vertical mastopexy/reduction**
- **Wise mastopexy/reduction**
  - Indicated for grade III ptosis, long nipple:IMF
  - Angle of vertical limbs affects lower-pole shape
    - Wide angles: boxy lower pole

## Reduction Mammaplasty
- No improvement in outcomes with drain placement
- **Complications**
  - Wound-healing issues (#1): associated with higher resection weights
  - Hematoma: same risk with intra-operative tumescence (but lower EBL)
  - Hypertrophic scarring
  - Fat necrosis
    - Associated with increased resection weights, increased BMI
    - Dx: round, smooth, firm nodules, can be tender
    - Dx: mammogram (MMG), ultrasound (US) - can mimic concerning findings
  - Abnormal pathology
    - High-risk lesions: atypical ductal/lobular hyperplasia, ductal carcinoma in situ, papilloma with atypical features
    - Intra-operative malignancy: complete reduction, orient specimen for pathology
    - Incidental malignancy on pathology: Obtain MRI breast to look for more masses
    - May need re excision or radiation pending tissue diagnosis and margins

## Mastopexy/Augmentation
- Often needed for augmentation candidates with grade II, III ptosis
- Can perform as single stage or two stages
  - Single stage: place implant, perform mastopexy (higher rate of revisions than two-stage approach)
  - Two stages: perform mastopexy then return later to perform augmentation

## Benign Breast Diseases
- **Fibroadenoma**
  - Giant fibroadenoma: single solitary mass with asymmetric, rapid enlargement of one breast
  - Sx: firm, rubbery nodule
  - Dx: US
  - Dx: epithelial and stromal proliferation on pathology
- **Juvenile breast hypertrophy**
  - Breast enlargement >3.3 lbs. during puberty
  - Dx: stromal tissue hypertrophy on pathology
- **Phyllodes tumor**
  - Generally benign, high recurrence, rare risk of metastasis
  - Sx: painless breast mass
  - Tx: wide surgical margins (>1cm)
- **Tuberous breast deformity**
  - Hypomastia/asymmetry, elevated IMF, constricted base, herniated/widened areola
  - Tx: periareolar radial scoring, tissue expander versus implant
- **Symptomatic galactocele/galactorrhea**
  - Swelling of breasts, milky discharge, no signs of infection or fever
  - Thought to be secondary to breast denervation after surgery
  - Dx: prolactin
  - Tx: bromocriptine (dopamine agonist)
- **Mondor disease**
  - Dx: superficial thrombophlebitis with erythematous, tender cord in the breast
  - Tx: self-resolves in 4-6 weeks, NSAIDs/pain control

## Breast Cancer Screening
- **Palpable mass on exam**: Dx: diagnostic MMG with US
- **Breast cancer screening prior to reduction**: Screening MMG should be performed if age >40
- **Occult breast cancer in reduction mammaplasty specimen**: Occurs 0.4% overall, increased to 5.5% with personal history of cancer`,

    'breast-reconstruction': `# Breast Reconstruction

## Breast Anatomy
- **Blood supply**
  - Internal mammary artery (IMA): medial breast
  - Lateral thoracic artery: lateral breast
- **Innervation**
  - Fourth intercostal nerve (#1): medial, innervates NAC
  - Third and fifth intercostal nerves
  - Supraclavicular nerves: upper breast

## Breast Cancer Surgery
- **Lumpectomy**: Breast-conserving therapy (BCT)
  - Includes radiation therapy
  - Similar survival compared to mastectomy
- **Modified radical mastectomy (MRM)**: breast tissue, nipple areolar complex, axillary node dissection
  - Preserves pectoralis major/minor
- **Skin-sparing mastectomy**: preserves skin envelope
- **Nipple-sparing mastectomy**: preserves nipple and skin envelope
  - Indications: tumor >2cm from NAC, no clinical nipple involvement
  - Complication: nipple necrosis
    - RF: smoking, large breast size, prior breast surgery
- **Axillary lymph node dissection**
  - Indicated for clinically positive axillary nodes
  - Complication: lymphedema
    - Tx: compression, elevation, physical therapy
    - Surgical: lymphovenous bypass, vascularized lymph node transfer
- **Sentinel lymph node biopsy**
  - Using blue dye and/or radioactive tracer
  - Less morbidity than axillary dissection

## Reconstruction Timing
- **Immediate**: At time of mastectomy
  - Psychological benefit, fewer operations
  - Does not delay adjuvant chemotherapy
- **Delayed**: After completing adjuvant therapy
  - Better for advanced disease requiring radiation
- **Delayed-immediate**: Place tissue expander at mastectomy, delay permanent reconstruction
  - Preserves skin envelope while allowing time for adjuvant therapy decision

## Implant-Based Reconstruction
- **Two-stage**
  - Stage 1: Tissue expander placement
  - Stage 2: Exchange for permanent implant
- **Direct-to-implant**: Single-stage with permanent implant
  - Requires adequate soft tissue coverage
  - Can use acellular dermal matrix (ADM) for lower pole support
- **Acellular dermal matrix**
  - Provides additional soft-tissue support
  - Types: human (AlloDerm), porcine (Strattice, Permacol), bovine (SurgiMend)
  - Increased risk of seroma compared to submuscular placement alone
- **Pocket locations**
  - Subpectoral/dual plane: under pectoralis major (traditional)
  - Prepectoral: above muscle (requires ADM for complete coverage)
    - Less animation deformity, less pain
    - Requires adequate soft tissue thickness (>1cm pinch test)

## Autologous Reconstruction
- **Pedicled flaps**
  - TRAM (transverse rectus abdominis myocutaneous)
    - Based on superior epigastric vessels
    - Pedicle: pectoralis major → superior epigastric → TRAM
  - Latissimus dorsi
    - Based on thoracodorsal vessels
    - Often needs implant for adequate volume
    - Useful for partial breast reconstruction, implant salvage
- **Free flaps**
  - DIEP (deep inferior epigastric perforator)
    - Spares rectus muscle compared to free TRAM
    - Based on deep inferior epigastric vessels
    - Preserves abdominal wall strength
  - SIEA (superficial inferior epigastric artery)
    - Most superficial abdominal flap, spares fascia
    - Present in ~30% of patients
    - Smaller pedicle, lower flow
  - PAP (profunda artery perforator)
    - Based on profunda femoris perforators from posterior thigh
    - Useful when abdomen not available
  - SGAP/IGAP (superior/inferior gluteal artery perforator)
    - Based on superior or inferior gluteal vessels
    - Alternative when abdomen not available
  - TUG (transverse upper gracilis)
    - Based on medial circumflex femoral vessels
    - Small to moderate volume
  - Free TRAM
    - Entire rectus muscle with skin paddle
    - Higher abdominal morbidity than DIEP
- **Recipient vessels**
  - Internal mammary: Most reliable, requires rib resection (typically 3rd or 4th)
  - Thoracodorsal: Easier access, less dissection
  - Thoracoacromial: Shorter pedicle

## Fat Grafting
- Autologous fat transfer for contour improvement
- Coleman technique: harvesting, processing, injection
- Can be used as primary reconstruction (BRAVA + fat grafting) or secondary for contour
- Controversy regarding oncologic safety largely resolved - appears safe

## Nipple Reconstruction
- **Timing**: 3-6 months after breast mound reconstruction
- **Techniques**
  - Local flaps: C-V flap, skate flap, star flap
  - Nipple sharing: from contralateral nipple
  - Composite graft: from ear, toe
- **Areola tattooing**: Medical tattooing for pigmentation

## Radiation Effects
- Radiation therapy affects reconstruction outcomes
- **Implant-based**: Higher capsular contracture rate, worse aesthetic outcomes
- **Autologous**: Better outcomes with radiation, preferred for radiated chest walls
- Timing: Immediate reconstruction does not delay radiation therapy

## Breast-Implant-Associated Anaplastic Large Cell Lymphoma (BIA-ALCL)
- Rare T-cell lymphoma associated with textured implants
- **Presentation**: Late seroma (>1 year after implantation), mass
- **Diagnosis**
  - Aspirate fluid: CD30+, ALK-
  - PET scan for staging
- **Treatment**
  - En bloc capsulectomy with implant removal
  - Chemotherapy for advanced disease
- Prognosis: Generally good with early detection and complete excision

## Complications
- **Infection**: Most common in first 2 weeks
  - Tx: antibiotics, possible explantation
- **Seroma**: Fluid collection
  - More common with ADM
  - Tx: aspiration, drain placement
- **Hematoma**: Blood collection
  - Tx: evacuation if expanding or symptomatic
- **Capsular contracture**: Firm, painful breast
  - Baker grade III-IV requires treatment
  - Tx: capsulotomy, capsulectomy, implant exchange
- **Implant malposition**: Improper implant positioning
  - Tx: pocket revision, neosubmammary fold creation
- **Animation deformity**: Implant movement with muscle contraction
  - More common with subpectoral placement
- **Fat necrosis**: Firm nodules in autologous reconstruction
  - Usually self-limited
  - May require excision if symptomatic or suspicious on imaging
- **Flap loss**: Partial or complete (rare with microsurgery)
  - Arterial: pale, no capillary refill (emergency exploration)
  - Venous: purple, brisk capillary refill (leeches, possible exploration)
- **Abdominal complications**: Hernia, bulge, weakness (TRAM, free TRAM > DIEP)`,

    'facial-rejuvenation': `# Facial Rejuvenation

## Rhytidectomy (Facelift)
- **Anatomy**
  - SMAS (superficial musculoaponeurotic system): fibromuscular layer connecting facial muscles
    - Continuous with platysma inferiorly, galea superiorly
  - Retaining ligaments: zygomatic, mandibular (restrict SMAS mobility)
  - Facial nerve branches: frontal, zygomatic, buccal, marginal mandibular, cervical
- **Techniques**
  - Skin-only: Limited longevity, rarely performed
  - SMAS plication: Folding/tightening SMAS without division
  - SMAS imbrication: Overlapping SMAS layers
  - SMASectomy: Excising SMAS strip
  - SMAS flap elevation: Dissecting and advancing SMAS as separate layer
  - Deep plane: Dissection deep to SMAS, more extensive
  - Composite: Includes orbicularis oculi with SMAS
- **Incision**
  - Pre-auricular or post-auricular approach
  - Temporal hairline incision
  - Submental incision for neck
- **Nerve injury**
  - Frontal branch: Most commonly injured
    - Risk zone: Pitanguy's line (0.5cm below tragus to 1.5cm above lateral brow)
    - Runs between superficial and deep temporal fascia
  - Marginal mandibular nerve
    - Risk zone: Below mandibular border (50% of patients)
    - Protect by staying above mandible or deep to platysma
  - Greater auricular nerve: Sensory, 6.5cm below EAC
    - Injury causes numbness to earlobe and lower face
- **Complications**
  - Hematoma: MC complication (1-8%)
    - RF: male sex, hypertension, anticoagulation
    - Presents first 24 hours
    - Tx: evacuation to prevent skin necrosis and infection
  - Nerve injury: See above
  - Skin necrosis: RF: smoking, tension, hematoma
    - MC location: post-auricular area
  - Pixie ear deformity: Earlobe pulled inferiorly from excessive tension
  - Alopecia: Hair loss from incisions or tension
  - Parotid injury: Salivary fistula, sialocele

## Neck Rejuvenation
- **Cervicoplasty**: Skin excision only
- **Platysmaplasty**: Tightening platysma muscle
  - Medial: Midline plication of platysma bands
  - Lateral: SMAS elevation with platysma
  - Corset platysmaplasty: Crossing fibers for additional support
- **Submentoplasty**: Liposuction and/or direct excision of submental fat
- **Dedo classification of neck aging**
  - I: Normal, youthful neck
  - II: Skin laxity, early jowls  
  - III: Platysmal banding, moderate jowls
  - IV: Severe platysmal banding, loss of cervicomental angle

## Blepharoplasty (Eyelid Surgery)
- **Upper blepharoplasty**
  - Removes excess skin and orbital fat
  - Incision: Superior orbital crease
  - Preserve orbital septum to avoid hollowing
  - Can address ptosis simultaneously if present
- **Lower blepharoplasty**
  - Addresses lower lid bags, excess skin, tear trough deformity
  - Approaches:
    - Transcutaneous: Skin incision below lashes
    - Transconjunctival: Internal approach, no external scar
      - Better for younger patients with primarily fat excess
  - Fat management: excision vs repositioning to tear trough
- **Complications**
  - Lagophthalmos: Inability to close eye completely
    - Caused by over-resection of skin or scarring
    - Tx: aggressive lubrication, possible skin graft
  - Ectropion: Lower lid pulls away from globe
    - Caused by excessive skin removal, cicatricial scarring
    - Prevention: snap-back test, distraction test pre-op
    - Tx: massage, tape, possible surgery (skin graft, canthoplasty)
  - Vision changes: Rare but serious
    - Retrobulbar hematoma: Emergent lateral canthotomy
  - Dry eyes: Temporary or permanent
  - Chemosis: Conjunctival swelling
  - Asymmetry, contour irregularities

## Brow Lift
- **Approaches**
  - Coronal: Incision behind hairline, extensive elevation
    - Con: Elevates hairline, increases forehead length
  - Pretrichial: Incision at hairline
    - Shortens forehead, maintains hairline
  - Endoscopic: Small incisions with endoscopic dissection
    - Less invasive, shorter recovery
  - Temporal (lateral): Elevates lateral brow only
  - Direct: Incision above brow (rarely used, visible scar)
- **Fixation techniques**
  - Sutures, bone tunnels, screws, tissue glue
- **Nerve considerations**
  - Frontal nerve: Within temporoparietal fascia
  - Supraorbital/supratrochlear: Exits at orbital rim
- **Complications**
  - Alopecia, numbness, asymmetry, under/over-correction

## Non-Surgical Rejuvenation
- **Botulinum toxin**
  - MOA: Blocks acetylcholine release at neuromuscular junction
  - Uses: Glabellar lines, crow's feet, forehead lines, platysmal bands
  - Onset: 2-3 days, peak 1-2 weeks
  - Duration: 3-4 months
  - Complications: Ptosis, asymmetry, bruising
- **Dermal fillers**
  - **Hyaluronic acid**: Most common, reversible with hyaluronidase
    - Used for: lips, nasolabial folds, marionette lines, cheeks
    - Duration: 6-18 months depending on product
  - **Calcium hydroxylapatite**: Longer lasting, stimulates collagen
  - **Poly-L-lactic acid**: Stimulates collagen, gradual improvement
  - **Autologous fat**: Permanent but unpredictable retention
  - Complications:
    - Tyndall effect: Blue-gray hue from superficial HA
    - Vascular occlusion: Rare but serious (skin necrosis, blindness)
      - Tx: immediate massage, hyaluronidase, hyperbaric oxygen
    - Nodules, asymmetry, allergic reactions

## Chemical Peels
- **Superficial**
  - Glycolic acid, salicylic acid, Jessner's solution
  - Reaches epidermis to papillary dermis
  - Improves: fine lines, mild pigmentation, acne
  - Minimal downtime
- **Medium**
  - TCA 35-50%
  - Reaches papillary to upper reticular dermis
  - Improves: moderate photodamage, pigmentation, acne scars
  - Downtime: 7-10 days
  - Complication: Hyperpigmentation (RF: higher Fitzpatrick skin types)
    - Tx: hydroquinone
- **Deep**
  - Phenol-Croton oil
  - Reaches mid-reticular dermis
  - Dramatic improvement in severe photodamage, deep wrinkles
  - Requires cardiac monitoring, electrolyte monitoring
  - Complication: Ventricular dysrhythmia (related to speed of application)
    - Monitor for 15 minutes after application
  - Permanent hypopigmentation common
- Chemical peels safe to apply to non-undermined areas at same time as rhytidectomy

## Laser Resurfacing
- **Ablative lasers**
  - CO2, Erbium:YAG
  - Chromophore: water (Erbium has higher affinity)
  - Remove layers of skin to stimulate new collagen
  - Best for severe photodamage, deep wrinkles, scars
  - Downtime: 1-2 weeks
  - Prophylaxis with antiviral for HSV due to risk of reactivation
  - Pretreat for post-inflammatory hyperpigmentation in higher Fitzpatrick skin types (>IV)
    - Tx: hydroquinone (MOA: blocks conversion of tyrosine to dihydroxyphenylalanine)
- **Complications**
  - Hypertrophic scarring
    - Decrease fluence, smaller treatment area, avoid multiple passes
    - Need to be off isotretinoin for >6 months to reduce risk
  - Hyperpigmentation: More common with higher Fitzpatrick (IV, V)
    - Lowering fluence reduces risk
    - Non-ablative lasers better for higher Fitzpatrick scores
  - Hypopigmentation: Decrease dwell time for future treatments
- **Non-ablative lasers**
  - Nd:YAG, diode, pulsed dye
  - No removal of skin surface
  - Stimulates collagen remodeling
  - Less downtime, more treatments needed
  - Safer for darker skin types
- **Fractional lasers**
  - Create microthermal zones, sparing surrounding tissue
  - Faster healing than traditional ablative
  - Good for acne scars, texture improvement
- **Other laser applications**
  - **Pulsed dye laser**: Chromophore hemoglobin, Tx: burn scars, capillary malformations
  - **Q-switched laser**: Chromophore melanin, Tx: benign pigmented lesions
  - **IPL (intense pulsed light)**: Improves pigmentation, small blood vessels, fine rhytids
  - **Nd:YAG**: Tx: varicose veins
  - **Tattoo removal**: Match wavelength to pigment
    - 600nm: reds
    - 1064nm: dark blues, black

## Dermabrasion
- **Microdermabrasion**
  - Endpoint: papillary dermis with pinpoint, punctate bleeding
  - Superficial treatment
- **Dermabrasion**
  - Endpoint: reticular dermis with robust bleeding
  - More aggressive, better results for deeper scars
  - Good for acne scars, traumatic scars, rhinophyma

## Other Non-Surgical Treatments
- **Radiofrequency facial rejuvenation**
  - Delivers energy deep to skin
  - Promotes collagen contraction and remodeling
  - Non-invasive skin tightening
- **Microneedling**
  - Used in acne scars, traumatic scars, melasma, striae
  - Decreases post-inflammatory pigmentation in high Fitzpatrick skin types
  - Causes collagen and elastin induction
  - Can combine with PRP or other serums
- **Deoxycholic acid**
  - Inject preplatysmal fat for submental fullness
  - MOA: disruption of cellular membrane
  - Lateral limit: line from lateral canthus to antegonial notch
  - Complication: Hair loss from superficial injection (Tx: observation)
  - Multiple sessions usually needed

## Hair Restoration
- **Hair cycle phases**
  - Anagen (growth): 2-6 years
  - Catagen (transitional): 2-3 weeks
  - Telogen (shedding): 2-3 months
- **Male-pattern hair loss**
  - Norwood-Hamilton classification
  - Tx: finasteride (blocks 5-alpha reductase)
    - Contraindicated in pregnancy
  - Tx: minoxidil (topical vasodilator)
- **Female-pattern hair loss**
  - Diffuse thinning with preservation of frontal hairline
  - Ludwig classification: I (mild), II (vertex thinning), III (extensive, visible)
  - Tx: minoxidil
- **Alopecia areata**
  - T-cell mediated autoimmune response affecting regional hair follicles
  - Tx: steroid injection
- **Trichotillomania**
  - Psychiatric etiology of pulling hair
  - Tx: psychiatry referral
- **Hair removal**
  - Laser: IPL targets melanin of hair follicles
  - Electrolysis: Good for patients with low skin melanin (Fitzpatrick I)
- **Hair grafting**
  - Micrografts: 1-2 follicles
  - Minigrafts: 3-4 follicles
  - FUT (follicular unit transplantation): Strip harvest from donor area
  - FUE (follicular unit extraction): Individual follicle extraction
  - Grafts initially enter catagen then telogen phase
  - Can take several months before new hairs appear
- **Browlift**
  - Pretrichial: shortens forehead length
  - Transcoronal: increases forehead length`,

    'rhinoplasty': `# Rhinoplasty

## Nasal Anatomy
- **Skeletal framework**
  - Nasal bones: upper third
  - Upper lateral cartilages: middle third
  - Lower lateral cartilages (alar cartilages): lower third
    - Medial crura, intermediate crura, lateral crura
  - Septum: quadrangular cartilage, perpendicular plate of ethmoid, vomer
- **External nasal valve**: Nostril opening
- **Internal nasal valve**: Angle between septum and upper lateral cartilage
  - Normal angle: 10-15 degrees
  - Narrowing causes nasal obstruction
- **Nasal muscles**: Procerus, nasalis, depressor septi nasi
- **Blood supply**
  - Internal carotid: Anterior and posterior ethmoidal arteries
  - External carotid: Sphenopalatine, greater palatine, superior labial, lateral nasal
  - Kiesselbach's plexus: Anterior septum, MC site of epistaxis
- **Innervation**
  - Sensation: Ophthalmic (V1) and maxillary (V2) divisions of trigeminal
  - Motor: Facial nerve (VII)

## Evaluation
- **Analysis**
  - Frontal view: Width, symmetry, alar base width
  - Lateral view: Dorsal height, tip projection, nasolabial angle
  - Basal view: Nostril shape and symmetry, tip definition
- **Nasal angles**
  - Nasofrontal: 115-130 degrees
  - Nasofacial: 30-40 degrees
  - Nasolabial: 90-110 degrees (males), 95-115 degrees (females)
  - Nasomental: 120-130 degrees
- **Tip projection**
  - Goode ratio: Distance from alar crease to tip / Distance from nasal root to alar crease
  - Normal: 0.55-0.60

## Surgical Approaches
- **Open (external) rhinoplasty**
  - Transcolumellar incision with marginal incisions
  - Advantages: Better visualization, precise suture placement, easier structural grafting
  - Disadvantages: External scar (usually imperceptible), more tip edema
- **Closed (endonasal) rhinoplasty**
  - All incisions internal
  - Advantages: No external scar, less tip edema
  - Disadvantages: Limited visualization, more technically demanding

## Common Techniques
- **Dorsal hump reduction**
  - Rasp or osteotome for bony hump
  - Scalpel for cartilaginous hump
  - May create open roof requiring osteotomies
- **Osteotomies**
  - Lateral osteotomy: Narrow nasal bones
  - Medial osteotomy: Close open roof after hump reduction
  - Techniques: Percutaneous, endonasal
  - Low-to-low: Most common, best control
- **Tip refinement**
  - Cephalic trim: Reduce bulbous tip (preserve ≥6mm of lateral crus)
  - Tip sutures: Define and reshape tip cartilages
    - Transdomal: Narrow domes
    - Interdomal: Bring domes together
    - Lateral crural strut: Support lateral crus
  - Tip grafts: Shield, cap, onlay for added definition
- **Spreader grafts**
  - Between septum and upper lateral cartilages
  - Widen internal nasal valve, straighten dorsum
- **Alar base reduction**
  - Reduce nostril width
  - Sill excision vs wedge excision
- **Septoplasty**
  - Straighten deviated septum
  - Improve airway, provide graft material
  - Preserve dorsal and caudal struts (1cm each) for support
- **Turbinate reduction**
  - Reduce inferior turbinates for nasal obstruction
  - Techniques: Submucous resection, radiofrequency, outfracture

## Grafting
- **Structural grafts**
  - Spreader grafts: Support internal valve
  - Batten grafts: Support lateral crus, prevent collapse
  - Alar rim grafts: Support alar margin
  - Columellar strut: Support tip, increase projection
- **Augmentation grafts**
  - Dorsal onlay: Increase dorsal height
  - Tip grafts: Increase tip projection and definition
  - Radix graft: Increase nasal root height
- **Graft materials**
  - Autologous: Septal cartilage (#1), ear cartilage, rib cartilage
  - Homologous: Irradiated rib, AlloDerm
  - Alloplastic: Silicone, Medpor, Gore-Tex
    - Higher infection/extrusion risk than autologous

## Ethnic Rhinoplasty Considerations
- **Asian rhinoplasty**
  - Often desires: Higher dorsum, more tip projection, narrower alar base
  - Low radix, thick skin, weak cartilages
  - Augmentation more common than reduction
- **African American rhinoplasty**
  - Wide base, low dorsum, weak tip support, thick skin
  - Balance ethnic identity with aesthetic goals
- **Middle Eastern rhinoplasty**
  - High dorsum, large osseocartilaginous hump, ptotic tip common
  - Hump reduction, tip rotation, osteotomies often needed
- **Hispanic rhinoplasty**
  - Variable features, thick skin common
  - Individual assessment important

## Complications
- **Aesthetic**
  - Asymmetry, under/over-correction
  - Pollybeak deformity: Supratip fullness
    - Caused by inadequate supratip lowering or excessive tip deprojection
    - Prevention: Adequate cartilage removal, tip support
  - Inverted-V deformity: Visible shadows from upper lateral cartilage collapse
    - Prevention: Spreader grafts after hump reduction
  - Alar retraction: Nostril pulled up
    - Caused by over-resection of lateral crus
    - Prevention: Preserve ≥6mm of lateral crus
  - Tip ptosis: Drooping tip
    - Caused by inadequate tip support
  - Saddlenose deformity: Loss of dorsal support
    - Caused by over-resection of septum or dorsum
- **Functional**
  - Nasal obstruction
    - Causes: Valve collapse, septal deviation, turbinate hypertrophy, excessive reduction
  - Anosmia: Loss of smell (rare)
- **General surgical**
  - Infection (rare): More common with alloplastic implants
  - Bleeding: Usually minor, epistaxis common first week
  - Septal perforation: Caused by bilateral mucosal tears, excessive cautery
    - Prevention: Careful dissection, avoid through-and-through tears
- **Skin complications**
  - Skin necrosis: Rare, RF: cocaine use, multiple procedures, excessive soft tissue undermining
  - Prolonged edema: Thick skin, revision rhinoplasty
    - Can take 1-2 years to fully resolve

## Revision Rhinoplasty
- Wait 12 months after primary surgery
- More challenging due to scar tissue, altered anatomy, limited graft material
- Often requires rib or ear cartilage for grafting
- Cartilage resorption and warping more common
- Set realistic expectations with patient

## Post-operative Care
- Internal splints, external cast typically 1 week
- Avoid strenuous activity 2-3 weeks
- Avoid contact sports 6-8 weeks
- Final result 12-18 months (longer for thick skin)`,

    'eye-aesthetic-reconstructive': `# Eye Aesthetic and Reconstructive Surgery

## Eyelid Anatomy
- **Layers** (superficial to deep):
  - Skin: Thinnest in body
  - Orbicularis oculi: Superficial (pretarsal, preseptal, orbital portions)
  - Orbital septum: Barrier between lid and orbit
  - Orbital fat: Three pads upper lid, two pads lower lid
  - Levator aponeurosis (upper lid) / capsulopalpebral fascia (lower lid)
  - Tarsus: Dense connective tissue, provides structural support
  - Conjunctiva
- **Upper eyelid**
  - Levator palpebrae superioris: Elevates lid
    - CN III innervation
  - Müller's muscle: Sympathetic innervation, assists levator
  - Whitnall's ligament: Suspensory ligament of levator
- **Lower eyelid**
  - Capsulopalpebral fascia: Equivalent to levator in upper lid
  - Lockwood's ligament: Suspensory ligament of lower lid
- **Eyelid retractors**
  - Upper: Levator, Müller's muscle
  - Lower: Capsulopalpebral fascia, inferior tarsal muscle
- **Lacrimal system**
  - Tear production: Lacrimal gland (superolateral orbit)
  - Drainage: Puncta → canaliculi → lacrimal sac → nasolacrimal duct → inferior meatus
- **Blood supply**
  - Medial: Medial palpebral artery (from ophthalmic)
  - Lateral: Lateral palpebral artery (from lacrimal)
  - Marginal and peripheral arcades
- **Nerve supply**
  - Motor: CN VII (orbicularis), CN III (levator)
  - Sensation: Supraorbital, supratrochlear, infraorbital, lacrimal (CN V)

## Ptosis (Drooping Upper Eyelid)
- **Definitions**
  - MRD (marginal reflex distance): Distance from pupillary light reflex to upper lid margin
    - Normal: 4-5mm
  - Levator function: Upper lid excursion from downgaze to upgaze
    - Normal: >15mm
    - Good: 8-15mm
    - Fair: 5-7mm
    - Poor: <5mm
- **Etiology**
  - Congenital: Levator dysgenesis
  - Acquired: Aponeurotic (MC in adults), neurogenic (CN III palsy, Horner's), myogenic (myasthenia gravis), mechanical
- **Classification**
  - Mild: 1-2mm
  - Moderate: 3-4mm
  - Severe: ≥5mm
- **Evaluation**
  - MRD, levator function, Bell's phenomenon, dry eye symptoms
  - Rule out: Horner's syndrome (miosis, anhydrosis), myasthenia gravis (ice test, fatigue with prolonged upgaze)
- **Surgical correction**
  - **Approach based on levator function**:
    - Good function (>8mm): Levator advancement or resection
    - Poor function (<4mm): Frontalis suspension
      - Sling materials: Autogenous fascia lata (gold standard), AlloDerm, silicone, Gore-Tex
    - Moderate: Either approach possible
  - **Levator advancement**
    - External approach: Through skin
    - Conjunctival (Fasanella-Servat): Resects Müller's, tarsus, conjunctiva
      - For mild ptosis with positive phenylephrine test
  - **Frontalis suspension**
    - Connects lid to frontalis muscle with sling
    - For poor levator function, congenital ptosis
- **Complications**
  - Under/over-correction, asymmetry
  - Lagophthalmos: Inability to close eye
  - Exposure keratopathy: Corneal damage from incomplete closure
  - Loss of eyelid crease

## Blepharoplasty (See Facial Rejuvenation section)

## Ectropion (Lower Lid Turns Out)
- **Etiology**
  - Involutional (MC): Age-related laxity of lower lid
  - Cicatricial: Scarring (burns, trauma, previous surgery, sun damage)
  - Paralytic: Facial nerve palsy
  - Mechanical: Tumor, edema
- **Evaluation**
  - Snap-back test: Pull lid away from globe, should snap back in <1 second
  - Distraction test: Pull lid away from globe, should move <6mm
  - Medial/lateral canthal laxity
- **Treatment**
  - **Lateral tarsal strip**
    - MC procedure for involutional ectropion
    - Tightens horizontal lid laxity
    - Detach lateral canthal tendon, shorten lid, reattach to periosteum
  - **Medial spindle**: For medial ectropion
  - **Full-thickness skin graft**: For cicatricial ectropion
    - Donor sites: Contralateral upper lid, preauricular, postauricular
  - **Canthoplasty/canthopexy**: Tighten canthal tendons
- **Complications**
  - Recurrence, asymmetry
  - Lagophthalmos if over-corrected

## Entropion (Lower Lid Turns In)
- **Etiology**
  - Involutional: Laxity and disinsertion of lid retractors
  - Spastic: Orbicularis spasm
  - Cicatricial: Conjunctival scarring (trachoma, Stevens-Johnson, chemical burn)
- **Evaluation**
  - Observe with patient blinking
  - Assess for conjunctival scarring, retractor disinsertion
- **Treatment**
  - **Involutional**: Retractor reinsertion, lateral tarsal strip
  - **Cicatricial**: Conjunctival graft, tarsal fracture, posterior lamellar graft
  - **Temporary measures**: Taping, botulinum toxin to orbicularis (spastic)
- **Complications**
  - Recurrence, ectropion if over-corrected

## Lacrimal Disorders
- **Epiphora (excessive tearing)**
  - Causes: Nasolacrimal duct obstruction, punctal stenosis, ectropion, dry eye (reflex tearing)
  - Evaluation:
    - Dye disappearance test: Fluorescein in eye, observe drainage
    - Jones I test: Dye in eye, look for dye in nose (tests patency)
    - Jones II test: Irrigate lacrimal system to assess obstruction location
  - **Dacryocystorhinostomy (DCR)**
    - For nasolacrimal duct obstruction
    - Creates new pathway from lacrimal sac to nasal cavity
    - Approaches: External (incision on nose), endonasal (endoscopic)
  - **Punctal stenosis**: Dilation, punctoplasty
  - **Canalicular stenosis**: Canaliculoplasty, Jones tube (conjunctivodacryocystorhinostomy)
- **Dacryocystitis**
  - Infection of lacrimal sac
  - Sx: Pain, erythema, swelling at medial canthus
  - Dx: Clinical
  - Tx: Warm compresses, oral antibiotics
  - Tx: DCR after acute infection resolves (prevent recurrence)

## Thyroid Eye Disease (Graves Ophthalmopathy)
- Autoimmune disorder causing orbital inflammation, fat expansion, extraocular muscle enlargement
- **Presentation**: Proptosis, lid retraction, lagophthalmos, diplopia, compressive optic neuropathy
- **Stages**: Active inflammatory phase then inactive/fibrotic phase
- **Medical management**: Thyroid hormone control, selenium, IV steroids (acute), orbital radiation
- **Surgical management** (after stable 6 months):
  - Sequence: Orbital decompression → strabismus surgery → eyelid surgery
  - **Orbital decompression**: Remove orbital walls to increase volume
    - For: Compressive optic neuropathy, severe proptosis
    - Approaches: Medial wall, floor, lateral wall (2 or 3-wall)
  - **Eyelid retraction repair**: Lower upper lids, elevate lower lids
    - Techniques: Levator recession, spacer graft (hard palate, sclera, Alloderm)
- **Complications**: Diplopia, hypoesthesia, blindness (rare)

## Orbital Trauma (See Craniomaxillofacial section for orbital fractures)

## Eyelid Reconstruction
- **Principles**
  - Reconstruct in layers: Posterior lamella (tarsus/conjunctiva), anterior lamella (skin/muscle)
  - Maintain lid margin integrity
- **Small defects (<25%)**
  - Primary closure
- **Medium defects (25-50%)**
  - Lateral cantholysis and canthotomy: Release lateral canthal tendon to mobilize tissue
  - Tenzel flap: Semicircular flap from lateral lid
- **Large defects (50-75%)**
  - **Hughes flap**: Tarsoconjunctival flap from upper lid for lower lid reconstruction
    - Temporary tarsorrhaphy (divide after 6-8 weeks)
  - **Cutler-Beard flap**: Full-thickness flap from lower lid for upper lid reconstruction
    - Temporary tarsorrhaphy (divide after 6-8 weeks)
  - **Free tarsoconjunctival graft**: From contralateral upper lid
    - Cover with skin advancement or full-thickness skin graft
- **Total lid loss**
  - Free tarsal/mucosal graft for posterior lamella
  - Skin graft or flap for anterior lamella
  - May need canthal reconstruction

## Enucleation and Evisceration
- **Enucleation**: Removal of entire globe
  - Indications: Blind painful eye, intraocular malignancy, trauma with no vision potential
  - Technique: Cut extraocular muscles, optic nerve, place orbital implant
- **Evisceration**: Removal of intraocular contents, preserves sclera
  - Better cosmesis, faster healing
  - Contraindicated in intraocular malignancy (risk of spread)
- **Orbital implant**
  - Integrated (porous): Hydroxyapatite, porous polyethylene
    - Allows tissue ingrowth, motility coupling
    - Can place peg for improved prosthesis movement
  - Non-integrated: Silicone, acrylic
- **Prosthesis**: External artificial eye (fitted 6-8 weeks postop)
- **Socket contracture**
  - Loss of socket volume
  - Tx: Mucous membrane grafts, dermis fat grafts, tissue expansion

## Canalicular Repair
- **Canalicular laceration**: Eyelid trauma involving tear drainage
- **Jones test**: Fluorescein dye test to assess canalicular patency
- **Repair**
  - Primary repair within 48 hours preferred
  - Monocanalicular or bicanalicular stent
  - Microscope or loupe magnification
  - Identify and cannulate cut ends
  - Stent left in place 3-6 months`,

    'body-contouring': `# Body Contouring

## Liposuction
- **Indications**: Localized fat deposits resistant to diet and exercise
- **Ideal candidate**: Good skin elasticity, stable weight, realistic expectations
- **Techniques**
  - Suction-assisted lipectomy (SAL): Traditional, manual
  - Power-assisted lipectomy (PAL): Oscillating cannula, less surgeon fatigue
  - Ultrasound-assisted lipectomy (UAL): Ultrasound liquefies fat, good for fibrous areas (back, male breast)
  - Laser-assisted lipectomy (LAL): Laser energy, skin tightening benefit, less post-operative pain
- **Wetting solutions**
  - Dry: No injection
  - Wet: 200-300cc per area
  - Superwet: 1:1 ratio infiltrate to aspirate (most common)
  - Tumescent: >1:1 ratio (Klein solution: lidocaine, epinephrine, saline)
- **Physics**
  - Length of cannula related to flow resistance
  - Cannula size related to efficiency and risk of contour abnormality
    - Larger cannula: More efficient but higher contour irregularity risk
- **Complications**
  - Contour irregularities (#1)
    - Prevention: Avoid zones of adherence (e.g., lateral gluteal depression), use crisscrossing passes with multiple vectors
  - Seroma: Fluid collection
  - Hematoma
  - Lidocaine toxicity: Seizures, cardiac dysrhythmias
    - Lidocaine: 5-7mg/kg with epinephrine, 3-5mg/kg without
  - Fat embolism: Rare, potentially fatal
    - Sx: Shortness of breath, confusion, petechial rash
    - MC with gluteal fat grafting (see below)
    - Tx: Cardiopulmonary support
  - Pulmonary embolism, DVT: Prophylaxis per Caprini score
  - Skin necrosis: Over-resection, thermal injury
  - Hypothermia: Large volume, prolonged procedure
  - Fluid overload: Excessive wetting solution
  - Infection
  - Injury to underlying structures: Visceral perforation (rare)
- **Volume considerations**
  - Outpatient: <5000cc aspirate
  - >5000cc: Should be performed with overnight observation due to risk for volume shifts
- **Lymphedema**: Relative contraindication for aesthetic indications if pitting edema

## Fat Grafting
- **Indications**: Volume restoration (face, breast, buttocks), contour defects, scars
- **Technique** (Coleman technique):
  - Harvesting: Low-pressure suction, small cannulas, gentle handling
  - Processing: Centrifugation or decanting to separate fat from blood/oil
  - Injection: Small aliquots, multiple passes, layering
- **Adipose-derived stem cells (ADSCs)**
  - Can differentiate into fibroblasts, keratinocytes
  - Highest composition: Abdomen, inner thighs
  - Regenerative potential
- **Fat survival**: 30-70% of grafted fat survives
  - Depends on technique, site, vascularity
  - Volume overcorrection often needed
- **Gluteal fat grafting (Brazilian butt lift)**
  - High-risk procedure
  - **Complications**:
    - Fat embolism (#1 cause of death in aesthetic surgery)
      - MC occurs within 72 hours from surgery
      - Sx: Shortness of breath, confusion, petechial rash
      - Tx: Cardiopulmonary support
      - Prevention: 
        - Avoid intramuscular injection/downward trajectory
        - Use large cannula (>4mm)
        - Inject only while in motion
        - Stay superficial to muscle fascia
- **Breast fat grafting**
  - Primary reconstruction (BRAVA + fat) or secondary for contour
  - Oncologic safety established
  - Can cause microcalcifications on imaging

## Non-Invasive Fat Reduction
- **Cryolipolysis (CoolSculpting)**
  - MOA: Adipocyte apoptosis through crystallization and ischemia/reperfusion injury
  - Results: 20-25% fat reduction per treatment
  - Complications:
    - MC: Transient hypoesthesia
    - Paradoxical adipose hyperplasia (rare)
      - Abnormal focal increase in subcutaneous fat within treatment area
      - RF: Large applicator, male, Hispanic, abdominal site
      - Tx: Observe for 6 months, liposuction if persists

## Abdominoplasty
- **Indications**: Excess abdominal skin and fat, rectus diastasis, striae
- **Evaluation**: Assess skin laxity, fat distribution, hernias, prior scars
- **Technique**
  - Incision: Low transverse (5cm superior to introitus), umbilical incision
  - Undermining: To costal margins
  - Rectus plication: Repair diastasis with running suture
  - Skin excision: Remove infraumbilical skin
  - Umbilical transposition: Create new umbilical opening
  - Drain placement: Reduce seroma risk (optional)
- **Variations**
  - Mini-abdominoplasty: Less undermining, no umbilical transposition
  - Extended abdominoplasty: Extends to flanks
  - Circumferential abdominoplasty/belt lipectomy: Extends circumferentially (see below)
  - Fleur-de-lis: Adds vertical excision for severe laxity
- **Striae**
  - Stretching of skin caused by hormonal excess (pregnancy, exogenous steroids, adolescence, Cushing disease)
  - Abdominoplasty removes infraumbilical striae
- **Complications**
  - **Deep vein thrombosis/pulmonary embolism**
    - Plastic surgery operation with highest risk
    - Pre-operative assessment: Caprini 2005 scale
    - Biggest RF: Personal history of DVT, family history of thrombosis
    - Prophylaxis: Sequential compression devices, early ambulation, chemoprophylaxis based on risk
  - **Seroma** (MC complication)
    - Risk reduction: Progressive tension sutures, drain placement, limit activity
    - Tx: Aspirate for mild collections, leave drain for repeated collections
    - Tx: Sclerosant (doxycycline, bleomycin) for persistent seroma cavity
  - **Skin necrosis**
    - MC location: Supraumbilical skin (T-junction)
    - Increased risk when combined with liposuction
    - RF: Smoking, diabetes, tension
    - Prevention: Avoid undermining perfusion zones, no smoking
  - **Hematoma**
  - **Infection**
  - **Wound dehiscence**
  - **Skin hypoesthesia**
    - More common to infraumbilical skin
    - Sensation slowest to return in infra-abdominal region
    - Tx: Observe, improves but may not fully resolve
  - **Lateral femoral cutaneous nerve injury**
    - Sx: Pain, affects lateral thigh sensation (meralgia paresthetica)
    - Dx: Local anesthetic block
    - Tx: Desensitization, gabapentinoids, surgery for severe symptoms
  - **Umbilical necrosis**: Excessive tension, strangulation
  - **Unsightly scar**: Hypertrophy, widening, malposition
- **Combined procedures**
  - Abdominoplasty with liposuction: Higher complication rate
  - Safe to perform limited flank liposuction

## Massive Weight Loss Surgery
- **Indications**: Excess skin after bariatric surgery or massive weight loss
- **Timing**: Wait for stable weight >6 months (some recommend 12-18 months)
- **Bariatric surgery**
  - Gastric bypass: Highest complication rate compared to other methods
  - Nutritional considerations:
    - Protein: 60-100gm/day
    - Monitor: Iron (#1), vitamin B12 (macrocytic anemia), B6, thiamine (encephalopathy), fat-soluble vitamins (ADEK)
  - **Zinc deficiency**
    - Dx: Rash, acne, hypogeusia, immune deficiency

## Truncal Surgeries
- **Abdominoplasty**: See above
- **Belt lipectomy (lower body lift)**
  - Circumferential excision at waistline
  - Addresses: Abdomen, flanks, back, buttocks, lateral thighs
  - Lifts buttocks and lateral thighs
  - Higher complication rate than isolated abdominoplasty
- **Corset abdominoplasty**
  - Addresses both vertical and horizontal excess
  - Trim torso circumferentially
- **Panniculectomy**
  - Removal of pannus only
  - Considered functional operation for persistent and recurrent intertriginous ulcerations
  - No umbilical transposition, no muscle plication
  - Less costly than abdominoplasty
- **Upper body lift**
  - Addresses: Back rolls, bra rolls, lateral chest
  - Incisions: Along bra line
- **Medial thighplasty**
  - Vertical incision along medial thigh
  - Addresses medial thigh laxity
- **Complications**
  - Similar to abdominoplasty but higher rates
  - Seroma, wound dehiscence, skin necrosis common
  - **Lymphedema**: Prolonged edema with circumferential technique
    - Femoral triangle contains lymphatic channels
  - DVT/PE prophylaxis critical

## Extremity Surgeries
- **Brachioplasty (arm lift)**
  - **Indications**: Excess upper arm skin
  - **Techniques**
    - Liposuction only: For pinch test 1.5-3cm with good skin tone/no laxity
    - Liposuction-assisted brachioplasty: Facilitates soft-tissue dissection
    - Full brachioplasty: Skin excision from axilla to elbow
  - **Scar location**: Posteromedial most concealed (in bicipital groove)
  - **Complications**
    - Hypertrophic scarring (#1), wound-healing problems
    - **Medial antebrachial cutaneous nerve injury**
      - Sensation to medial forearm
      - Superficial at 14cm proximal to elbow
      - Travels in medial arm next to basilic vein
      - Protection: Leave 1cm of fat at deep fascia
      - No risk with posterior resection
    - Seroma
    - Lymphedema: Avoid dissection in axilla
    - Asymmetry
- **Thighplasty/thigh lift**
  - **Indications**: Excess medial or lateral thigh skin
  - **Medial thighplasty**
    - Incision: Groin crease extending to ischial tuberosity
    - Can extend vertically down medial thigh for severe laxity
  - **Lateral thighplasty**: Usually part of lower body lift
  - **Complications**
    - Scar widening, migration
    - **Prolonged edema**: Especially with circumferential technique
      - Femoral triangle contains lymphatic channels
    - Seroma
    - Wound dehiscence
    - Labial spreading (medial approach)
    - Asymmetry

## Body Contouring After Pregnancy (Mommy Makeover)
- **Common procedures**
  - Breast: Augmentation, lift, or augmentation-mastopexy
  - Abdomen: Abdominoplasty +/- liposuction
  - Combined procedures increase risk
- **Timing**: After completion of childbearing, stable weight, stopped breastfeeding
- **Safety**: Higher VTE risk with combined procedures

## Genital Aesthetic Surgery
- **Mons pubis reduction**
  - Monsplasty: Excise excess skin and fat
  - Often combined with abdominoplasty
- **Labiaplasty**
  - **Indications**: Labial hypertrophy causing pain, irritation, aesthetic concerns
  - **Techniques**:
    - Trim technique: Excise protruding edge
    - Wedge technique: Maintains natural edge
  - **Complications**: Hematoma (MC, RF: male partner)
- **Vaginal rejuvenation**
  - Vaginoplasty: Tighten vaginal canal
  - Clitoral hood reduction: Excise laterally, not anteriorly/clitoral frenulum
    - Complication: Injury to sensory nerves at anterior hood
  - Laser rejuvenation: Not shown to improve symptoms in post-menopausal women

## HIV-Associated Lipodystrophy
- **Presentation**: Atrophy of malar and temporal fat, development of buffalo hump/cervical fat deposits
- Associated with HAART medications
- **Treatment**:
  - Face: Fat grafting, poly-L-lactic acid filler
  - Buffalo hump: Liposuction`
  },
  'core-surgical': {
    'anesthesia': `# Anesthesia

## Medications

### Local anesthetics
- Shown to reduce post-operative opioid use
- **Local anesthetic toxicity**
  - Lidocaine maximum dose: 7mg/kg with epinephrine, 4mg/kg plain
    - Can be higher (35-55mg/kg) as wetting solution in liposuction
  - Sx: lip numbness, metallic taste, slurred speech, nausea, anxiety, disorientation
    - Can progress to cardiac problems
  - Tx: secure airway first if unstable, fat emulsion (intra lipid) bolus then infusion
- **Local with epinephrine**
  - Peak vasoconstriction effect: about 20-30 minutes
    - Reversal agent: phentolamine (alpha-1 and -2 antagonist)
- **Liposomal bupivacaine**
  - Can combine with saline or non-liposomal bupivacaine to dilute
  - Can give 20 minutes after injection of lidocaine
  - Maximum dose 20cc (266mg)

### Conscious sedation
- Patients with reduced awareness but respond to verbal commands, protect airway
- IV agents (e.g., propofol, opioids, benzodiazepines)
  - Midazolam and fentanyl better for anxiety/pain than single agents
- Requirements: oxygen, ventilator support/intubation support available
- **Complication**
  - Hypotension
    - Tx: IV fluids (1st line)

### Corticosteroids
- Single perioperative dose associated with transient hyperglycemia, no change in wound healing
- Corticosteroid-related wound healing deficiency with use >30 days
  - Increased wound-healing complicated by 2-3x, impedes all phases of wound healing
  - Tx: vitamin A (oral)

### Tranexamic Acid (TXA)
- Blocks plasminogen to plasmin (prevents clot degradation)
- Perioperative use associated with reduced EBL across multiple specialties and operations including plastic surgery (orthognathic, craniosynostosis surgery, reduction mammaplasty)

## Risk Assessment

### ASA Classification
- I: no comorbidities, normal weight, no smoking
- II: mild, controlled comorbidities
- III: one or more moderate to severe comorbidities
- IV: comorbidity that is a constant threat to life (recent cardiovascular disease (<3 months), uncontrolled ESRD)
- V: not expected to survive >24 hours without an emergency operation
- VI: brain dead patient donating organs

## Regional Anesthesia

### Specific nerve blocks
- **Infraorbital nerve block**
  - Landmark: infraorbital foramen of orbital rim
  - Ipsilateral central incisor to premolars
- **Mental nerve block**
  - Landmark: second premolar
- **Pectoral nerve block**
  - PECS 1: between pectoralis major and minor
  - PECS 2: between pectoralis minor and serratus anterior
- **TAP (transversalis abdominus plane)**
  - Block abdominal nerves between internal oblique and transversus abdominus
    - Landmarks: latissimus dorsi, external oblique, and iliac crest (lumbar triangle)
  - T7-L1 carries abdominal wall innervation
    - T10 highest nerve fiber density to abdomen

## Anesthetic Complications

### Malignant hyperthermia
- Autosomal dominant myopathy
- Due to inhaled anesthetics, succinylcholine
- Pathophysiology: calcium release into skeletal muscle
- **Dx:**
  - Early signs: tachycardia, hypercapnia (increased end tidal CO2)
  - Late signs: metabolic acidosis, hyperphosphatemia, fever, ECG changes/hyperkalemia, myoglobinuria
- Tx: discontinue agent, supportive care, dantrolene
  - Can use propofol for future anesthesia

### Muscle Relaxants
- **Succinylcholine**
  - Associated with acute hyperkalemia

### Post-operative nausea and vomiting
- RF: nonsmoking, female, history of postoperative nausea/vomiting, age >50, obesity (BMI >30)
- Tx: aprepitant before induction
- Tx: propofol has lower association than other IV agents

### Post-operative urinary retention
- MC from anesthetic medications

### Operating room fire
- RF: nasal cannula and open oxygen sources
- Tx: remove endotracheal tube, interrupt all gases, remove all flammables (e.g., sponges), reestablish airway once fire put out`,

    'perioperative-care': `# Perioperative Care

## Perioperative Optimization

### Medication management
- **Aspirin**
  - Increases bleeding time
  - Continue perioperatively for low-risk procedures
    - No change in bleeding risk in minor skin surgeries
- **Ketorolac**
  - MOA: COX-1 and -2 inhibitor
  - Increased bleeding time by thromboxane A2 inhibition
  - No increased bleeding risk in breast surgery
- **Acetaminophen**
  - No platelet effects
- **Gabapentinoids**
  - Block voltage-gated calcium channels
  - Used in multi-modal analgesia
- **Dual antiplatelet therapy**
  - Prescribed after cardiac stents
  - Recommend continuation for >6 months after drug-eluting stent placement, bridge with an antiplatelet gtt if needed to be held for an emergency
- **Warfarin**
  - Monitoring: PT/INR (target 2-3 for most indications)
  - Assess risk of perioperative thrombosis
  - If high risk: bridge with heparin or LMWH
  - If low risk: stop 5 days before surgery
- **Direct oral anticoagulants (DOACs)**
  - Hold 24-48 hours before surgery depending on renal function
  - No routine monitoring required
- **Antibiotic prophylaxis**
  - Timing: within 1 hour of incision (2 hours for vancomycin)
  - Cefazolin most common (covers skin flora)
  - Use in all breast cases, clean/contaminated, contaminated, and dirty cases
    - Implant-based breast reconstruction: no evidence for courses >24 hours
  - Not needed for clean hand surgery <2 hours, clean skin surgery
  - **Penicillin allergy**
    - Associated with <5% cephalosporin cross-reactivity

### Perioperative pain management
- **Opioid abuse**
  - RF: younger age, bone procedures, psychiatric comorbidities, substance use history, and chronic pain history

## OR Complications

### Blood loss estimates
- **Normal circulating blood volumes:**
  - Neonate: 85cc/kg
  - Child: 75cc/kg
  - Adult (70kg): 5500cc

### Patient positioning in OR
- Reduce peripheral neuropathy compression risk
- **Dorsal lithotomy**
  - Heel protection
- **Supine**
  - Forearm supinated
    - Reduce risk of ulnar neuropathy
- **Tucked arms**
  - Neutral forearm rotation
- **Prone**
  - Neck neutral

### Retained foreign body
- RF: MC incorrect final count (but most cases with retained objects had a normal final count), increased with change of surgical teams, emergency case

### Radiation exposure
- Low (<10Gy): transient erythema
- Moderate (10-20Gy): recurring erythema
- High (>20Gy): prone to tissue necrosis

### Near-miss events
- Potential to cause harm from an error but caught before affects patient`,

    'critical-care': `# Critical Care

## Neurologic

### Postoperative delirium
- Tx: avoid benzodiazepines, diphenhydramine

### Diabetes insipidus
- Elevated serum sodium after head injury
  - MOA: vasopressin via posterior pituitary

### Cerebral edema
- Tx: hypertonic saline

### Brain death examination
- Need cause that is permanent and irreversible
- Dx: absent brainstem reflexes (e.g., pupillary response to light)
- Contraindications: hypothermia, neuromuscular blockade

### Organ donation
- Contraindications: lack of next-of-kin consent, minors (age <18), prion disease, metastatic disease

### Autonomic dysreflexia
- Exaggerated sympathetic response due to a triggering cause seen in spinal cord patients
- RF: T6 or higher paralysis
- Sx: hypertension, bradycardia, flushing, sweating, headache
- Tx: remove clothing/cooling, place foley catheter to empty bladder

## Cardiac

### Cardiopulmonary resuscitation
- High-quality chest compressions for 2 minutes then check pulse
- **Ventricular dysrhythmias**
  - Tx: compressions, automated defibrillator
- **Pulseless electrical activity**
  - Tx: compressions, epinephrine

### Rapid response team
- Assesses floor patients with major vital-sign changes, evaluate need for ICU transfer
  - Common triggers: rapid heart rate, hypotension, altered consciousness

### Acute coronary syndrome
- Sx: chest pain, shortness of breath
- Dx: ECG (1st), troponin

### Cardiac tamponade
- Beck's triad: tachycardia, hypotension, jugular distention
- Dx: pericardial rub on auscultation, then US/echo
- Tx: drainage (percutaneous or pericardial window)

### Atrial fibrillation
- Acute, unstable: attempt cardioversion (<48 hours onset)
  - If longer >48 hours, need to assess for left thrombus clot, consider anticoagulation
- Acute, stable: medical management with beta blockers (1st line), calcium-channel blockers (2nd line), amiodarone for rhythm control

## Respiratory

### Pulmonary function
- Minute ventilation: respiratory rate x tidal volume

### Tension pneumothorax
- Sx: hypotension, tachypneic, decreased oxygen saturation
- Tx: needle decompression then tube thoracostomy

### Obstructive sleep apnea
- Tx: CPAP support preoperatively and immediately postoperatively

## Gastrointestinal

### Nutrition
- **Perioperative protein recommendation**
  - 1gm/kg (about 60-70gm/day) 1 month before to 2 months after major surgery
- **Respiratory quotient**
  - <0.7: fat oxidation, underfeeding
  - 0.7-1: utilize protein then carbohydrate
  - >1.3: lipogenesis, overfeeding

## Renal

### Contrast-induced nephropathy
- Reduce risk with isotonic fluid volume before contrast bolus with imaging studies

### Acute kidney injury
- Dx: fractional excretion of sodium (FeNa) for etiology
  - Formula: (urine sodium x plasma creatinine) / (plasma sodium x urine creatinine)
  - <1%: pre renal (hypovolemia or decreased perfusion)
  - 1-3%: renal (MC acute tubular necrosis)
  - >3%: post-renal (obstruction)
- Tx: targeted glucose control, isotonic fluids, provide protein-based nutrition

### Hyperkalemia
- ECG with peaked T waves
- Tx: calcium gluconate to protect heart, insulin and D50 to shift potassium intracellular, then furosemide/kayexalate/sodium polystyrene binders/dialysis to excrete

### Cerebral salt wasting
- Renal and fluid loss associated with intra-cranial injury

### Syndrome of inappropriate anti-diuretic hormone (SIADH)
- Hyponatremia in setting of volume expansion

### Free water deficit
- Water deficit = normal body water x (1-(serum Na/140))

## Inflammatory/Infectious

### Septic shock
- Decreased peripheral vascular resistance due to vasodilation from pro-inflammatory mediators (e.g., TNF-alpha, histamine)
- Dx: vasopressor requirement and serum lactate > 2 in absence of hypovolemia
- Tx: blood cultures, early antibiotics (within 1 hour of presentation when suspected), volume resuscitation, pressors, supportive care
  - Can trend lactate levels to assess resuscitation

### Bacterial resistance
- Changes to cell membrane (increased esterification, decreased carotenoids), increased protease, increased binding proteins, increased biofilm

### Anaphylaxis reaction
- Sx: itchy eyes, rhinorrhea, anxiety, skin erythema, respiratory stridor
- Tx: intra-muscular epinephrine
- **Isosulfane blue allergy**
  - Dye used in sentinel lymph node biopsies
  - 1-3% of population have allergy
  - Tx: pressors

### COVID infection
- Increased cardiovascular complications post-operatively

## Hematology

### Bleeding diseases
- **Von Willebrand**: MC congenital bleeding disorder
  - Abnormal factor VIII binding
  - Tx: DDAVP`,

    'trauma': `# Trauma

## Trauma Evaluation

### Advanced trauma life support (ABCDEs)
- **Airway**
  - Includes cervical spine immobilization depending on mechanism
- **Breathing**
- **Circulation, control hemorrhage**
- **Disability**
- **Exposure/environment**
- **Secondary survey**
- Ensure tetanus immunization up to date for dirty, devitalized wounds in setting of trauma

## Trauma Management

### Hemorrhagic shock
- Dx: increased pulse rate (early sign) in setting of known blood loss, vasoconstriction
- Tx: massive transfusion protocol
  - ~1:1 ratio of pRBC, FFP, avoid crystalloid
- **Tranexamic acid (TXA)**
  - Inhibits fibrinolysis (blocks conversion of plasminogen)
  - Reduces traumatic blood loss
  - Monitor for color-vision changes with prolonged use

### Trauma in pregnancy
- **Early pregnancy**
  - Minimize CT scans on stable patients, if possible
  - Dx: Rh status, 4 hours of fetal monitoring
- **Late pregnancy**
  - Asymptomatic hypotension
    - Logroll to left side
      - Offload IVC compression from fetus

### Neck injuries
- **Zone I**: inferior neck from clavicles to thyroid cartilage
- **Zone II**: thyroid cartilage to angle of the mandible
  - Most likely to require operative exploration
  - Dx: CT angiogram if stable
- **Zone III**: above angle of the mandible
  - Dx: CT angiogram
  - Tx: IR procedures (e.g., stent, coil embolization)`,

    'transplantation': `# Transplantation

## Allotransplantation in Plastic Surgery

### Facial transplantation
- **Facial changes after transplantation**
  - Accelerated aging
    - Facial volume loss occurs due to loss of bone and non-fat elements of subcutaneous tissue
    - Occur in first three years, theorized to be from denervation changes
- **Complications**
  - Candidal mouth infection
    - Sx: white papules of oral mucosa
    - Tx: topical nystatin

### Hand transplantation
- Skin is the most immunogenic soft-tissue component
- Risk of reperfusion injury after transplantation
  - Dx: elevated potassium, CPK levels

## Transplant Management

### Rejection
- **Hyperacute**: 0-2 days from preformed antibodies
- **Accelerated**: 2-5 days
- **Acute**: first 6 months, T cell mediated, newly formed. Organ dysfunction.
- **Chronic**: >6 months, T and B cells, progressive arterial disease

### Immunosuppression
- **Tacrolimus**
  - Side effect: nephrotoxicity

### Antibiotics
- Taken prophylactically due to decreased immunity
- Opportunistic infections most likely to occur between months 1-12`,

    'statistics-ethics-practice': `# Statistics, Ethics, and Practice Management

## Statistics

### Quantitative
- **Student's t-test**
  - Compares means of independent quantitative data in 2 groups
- **ANOVA**
  - Compares variance of independent quantitative data in > 2 groups
- **Paired-sample t-test**
  - Compares means of dependent quantitative data in same group at different times
- **Linear regression**
  - Determines relationship between dependent and independent variables

### Qualitative
- **Chi-square test**
  - Compares categorical data in 2+ groups
- **Fisher exact test**
  - Used when sample sizes are small (<5 in any cell)

### Study Design
- **Prospective cohort**
  - Follow subjects forward in time
  - Can establish temporal relationship
- **Retrospective cohort**
  - Look back at historical data
- **Case-control**
  - Compare subjects with disease to those without
- **Randomized controlled trial (RCT)**
  - Gold standard for establishing causation
  - Subjects randomly assigned to treatment/control
- **Meta-analysis**
  - Statistical combination of multiple studies

### Measures
- **Sensitivity**: True positive / (True positive + False negative)
  - Ability to detect disease when present
- **Specificity**: True negative / (True negative + False positive)
  - Ability to rule out disease when absent
- **Positive predictive value (PPV)**: True positive / (True positive + False positive)
  - Probability disease present when test positive
- **Negative predictive value (NPV)**: True negative / (True negative + False negative)
  - Probability disease absent when test negative
- **Number needed to treat (NNT)**: 1 / Absolute risk reduction
  - Number of patients needed to treat to prevent one adverse outcome

### Statistical Significance
- **P-value**: Probability results occurred by chance
  - P<0.05 typically considered statistically significant
- **Confidence interval (CI)**: Range likely to contain true population parameter
  - 95% CI most common
- **Type I error (alpha)**: False positive, rejecting null when true
- **Type II error (beta)**: False negative, accepting null when false
- **Power**: 1 - beta, ability to detect true difference

## Practice Management

### Coding
- **Global period**
  - 90 days after operation (10 days after some simple skin procedures)
    - Includes professional services for all disease-related care after operation, including complications
      - Staged components excluded (e.g., division of a forehead flap)
      - Includes subsequent tissue expander after device placement
    - Can bill initial consultation in addition to operation (but not additional visits needed for consent, photos, markings)
- **New patient clinic visit**
  - First visit to practice or established patient not seen by you or a partner in the same practice in >36 months
- **CPT modifiers:**
  - 22: added time/complexity
  - 50: bilateral procedure (e.g., breast reduction)
  - 57: evaluation/management of an urgent/emergent procedures with surgery planned within 24 hours
  - 58: planned, staged operation (e.g., breast tissue expander to implant exchange)
- **CPT coding for skin lesions**
  - Can code the excision or the closure but can't code both (if performed by same surgeon)

### Government and regulations
- **Medicare**
  - Federally funded insurance generally for age >65
  - Consists of 4 components
    - A: inpatient and nursing facility fees
    - B: outpatient services
    - C: add-on private coinsurance option (combines parts A, B, C)
    - D: drug benefits
  - Physician contracting
    - Obligated to offer the same cost (pre-negotiated fee schedule) for the same surgical service to all covered patients by that insurer
- **Medicaid**
  - Federally subsidized, state-run insurance offered to low-income individuals
- **Affordable Care Act**
  - Many components largely related to health insurance expansion of coverage
    - Does not include dental care
  - Mandates electronic health record system (EHR) to receive full federal payments for services
    - Small, incremental penalty per year if no EHR
    - Meaningful use
      - Encourages practices to use EHR components: electronic prescribing, patient portal access for health records, quality
- **Health Insurance Privacy Accountability Act (HIPAA)**
  - Allows individuals to transfer health coverage from one employer to another
  - Includes regulations covering patient privacy and data privacy in healthcare
  - Protects individually identifiable information (name, address, date of birth), including its use in research
    - Email communications must be encrypted
    - Privacy official: serves as privacy officer for a practice
    - If any breach, report to Department of Health and Human Services within 60 days
      - Report to local media for large breach (>500 patients affected)
- **Americans with Disability Act**
  - Provider/health system needs to provide necessary services for patients to access care (e.g., interpretation)
- **Certificate of Need**
  - State-level approval needed before building or expanding healthcare facilities
  - Allows geographic coordination of new services and construction
- **Sunshine Act**
  - Medical device, supply, and drug companies must disclose all payments and gifts > $10 to an individual provider to the federal government
    - Exception for continuing medical education events
- **American Board of Plastic Surgery**
  - Requires unrestricted state medical license for eligibility
  - Can revoke privileges for unethical or unprofessional behavior
  - Requires 125 total hours of continuing medical education every 5 years (25 hours in patient safety)
- **In-office operating rooms and procedure rooms**
  - AAAASF
    - Private entity that certifies in-office operating and procedural rooms
      - Must have admitting/operating privileges at an acute hospital within 30 minutes' drive
      - Recommend overnight observation for high-volume liposuction (>5L)
  - ASPS
    - Recommends operations less than 6-hour cases at in-office OR`
  }
};

const subsectionTitles: Record<string, Record<string, string>> = {
  'comprehensive': {
    'anatomy': 'Anatomy',
    'skin-lesions': 'Skin Lesions',
    'flaps-and-grafts': 'Flaps and Grafts',
    'microsurgery': 'Microsurgery',
    'infections': 'Infections',
    'burns': 'Burns',
    'trunk': 'Trunk & Gender-Affirming Surgery',
    'vascular-anomalies': 'Vascular Anomalies',
  },
  'hand-lower-extremity': {
    'hand-digit-trauma': 'Hand and Digit Trauma',
    'hand-nerves': 'Hand Nerves',
    'hand-tendons': 'Hand Tendons',
    'replantation-vascular': 'Replantation and Vascular',
    'wrist-forearm-injuries': 'Wrist and Forearm Injuries',
    'hand-tumors': 'Hand Tumors',
    'hand-inflammation-infections': 'Hand Inflammation and Infections',
    'congenital-pediatric-hand': 'Congenital and Pediatric Hand',
    'lower-extremity': 'Lower Extremity',
  },
  'craniomaxillofacial': {
    'cleft-lip-palate': 'Cleft Lip and Palate',
    'facial-fractures': 'Facial Fractures',
    'facial-paralysis': 'Facial Paralysis',
    'ear-reconstruction': 'Ear Reconstruction',
    'mandible-dental-orthognathic': 'Mandible, Dental, and Orthognathic',
    'head-neck-tumors': 'Head and Neck Tumors',
    'congenital-syndromes': 'Congenital Syndromes',
  },
  'breast-cosmetic': {
    'breast-augmentation': 'Breast Augmentation',
    'breast-reduction-mastopexy': 'Breast Reduction and Mastopexy',
    'breast-reconstruction': 'Breast Reconstruction',
    'facial-rejuvenation': 'Facial Rejuvenation',
    'rhinoplasty': 'Rhinoplasty',
    'eye-aesthetic-reconstructive': 'Eye Aesthetic and Reconstructive',
    'body-contouring': 'Body Contouring',
  },
  'core-surgical': {
    'anesthesia': 'Anesthesia',
    'perioperative-care': 'Perioperative Care',
    'critical-care': 'Critical Care',
    'trauma': 'Trauma',
    'transplantation': 'Transplantation',
    'statistics-ethics-practice': 'Statistics, Ethics, and Practice Management',
  }
};

export function loadReferenceText(): ReferenceSection[] {
  const sectionOrder = [
    { id: 'comprehensive', title: 'Section 1: Comprehensive' },
    { id: 'hand-lower-extremity', title: 'Section 2: Hand and Lower Extremity' },
    { id: 'craniomaxillofacial', title: 'Section 3: Craniomaxillofacial' },
    { id: 'breast-cosmetic', title: 'Section 4: Breast and Cosmetic' },
    { id: 'core-surgical', title: 'Section 5: Core Surgical Principles' },
  ];

  return sectionOrder.map(({ id, title }) => {
    const subsectionData = referenceData[id] || {};
    const titles = subsectionTitles[id] || {};
    
    const subsections: ReferenceSubsection[] = Object.entries(subsectionData).map(([subsectionId, content]) => ({
      id: subsectionId,
      title: titles[subsectionId] || subsectionId,
      content,
    }));

    return {
      id,
      title,
      subsections,
    };
  }).filter(section => section.subsections.length > 0);
}
