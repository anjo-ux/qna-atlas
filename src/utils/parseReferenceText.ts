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
