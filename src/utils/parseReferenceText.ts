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
**Beckwith-Wiedemann**: Macrosomia, omphalocele, macroglossia, chromosome 11`
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
