// Review content organized by section and subsection
export const reviewContent: Record<string, Record<string, string>> = {
  comprehensive: {
    anatomy: `## Wound Healing

### Phases
- **Inflammatory (0 to 3 days)**: platelets then neutrophils then macrophages
- **Proliferative (3 days to 3 weeks)**: fibroblasts; most collagen deposited
- **Remodeling (3 weeks to 18 months)**: collagen III (most vascular) to I (MC in body)

### Healing
- **Primary intention**: directly closing a wound
- **Secondary intention**: open wound that closes from intact peripheral skin
  - Epithelialization from intact hair follicles at wound edge, involving myofibroblasts
- **Tertiary intention** (rare): direct closure after leaving wound open for a few days

### Wound Closure

**Cyanoacrylate**
- Use for short-distance, tension-free wounds with no significant tissue trauma or infection
- Higher dehiscence rate than sutures when put on longer incisions

**Sutures**
- Minimize tissue trauma and foreign body burden with smaller suture sizes
- **Monofilament suture**: less tissue resistance
- **Multi-filament suture**
  - Braided, less memory, higher knot security, higher tensile strength
  - More likely to saw through tissue, harbor infection than monofilament
- **Barbed suture**: decreases operative time, no change in scar appearance in body contouring

### Scarring
- **Technical**: wound-edge eversion (#1 factor for healing)
- **Silicone sheeting**: improves scar appearance by hydration, compression
- **Pressure garments**: improves scarring in burn patients from reduced differentiation of fibroblasts to myofibroblasts

### Abnormal Scarring

**Hypertrophic scarring**
- Stays within scar confines
- Histology: increased type III collagen, involves myofibroblasts; parallel collagen organization
- Tx: intralesional steroids + 5-FU

**Keloid**
- Extends beyond scar
- Sx: pruritis, poor cosmesis
- RF: anterior chest, high Fitzpatrick skin type
- Histology: disorganized type I collagen; thick, randomly oriented collagen
- **Tx: intralesional injection (mild cases)**
  - 5-FU: similar efficacy, less hypopigmentation than steroids
  - MOA: decreases fibroblast proliferation and collagen synthesis
- **Tx: surgery (moderate, severe cases)**
  - Excision + steroid injection: 15% recurrence
  - Excision + XRT: 14% recurrence
  - Start XRT within 24 hours of excision, 2-3 sessions
  - Recurrence: male, age <29, size >5cm, associated skin graft

### Wound Management

**Local wound care**
- **Wet to dry**: mechanically debrides metalloproteinases, elastases
- **Hydrogels, hydrocolloids**: maintain moist wound-healing environment
- **Honey**: stimulates immune response, suppresses inflammation
- **Calcium alginate**: absorptive, fewer dressing changes, provides moist-wound healing
- **Hydrofiber**: high absorptive capacity
- **Occlusive dressings**: moist-wound healing environment

**Negative-pressure wound therapy**
- Micro- and macro-deformational forces
- Removes excess interstitial fluid, reopens capillaries, releases VEGF
- Evidence for fewer dressing changes and fewer operations in diabetic wounds
- Contraindications: exposed vessels, active infection, malignant wounds, non-debrided wounds

**Hyperbaric oxygen therapy**
- Indications: carbon monoxide poisoning, arterial insufficiency, acute traumatic ischemia, radiation injury, necrotizing soft-tissue infections, refractory osteomyelitis

**Dermal regeneration template**
- Composed of glycosaminoglycans, collagen
- Histology: absent hair follicles
- Use associated with decreased hypertrophic scarring in burns

**Nutrition support**
- Vitamin C: involved in collagen cross-linking
- Increased matrix metalloproteinases in wound bed associated with poor healing

### Abnormal Wound Healing

**Radiation Injury**
- Acute: skin erythema
  - Tx: hydrocortisone cream
- Chronic: progressive endarteritis resulting in hypoxic, fibrotic, hypocellular tissue
  - Tx: surgical excision, flap closure (not skin grafts)

**Diabetes Mellitus**
- Nonenzymatic glycation compromises wound healing
- Associated with small vessel disease, peripheral neuropathy

**Pressure Sores**
- RF: immobility, malnutrition
- Most common location: ischium
- Classification (National Pressure Injury Advisory Panel):
  - Stage 1: non-blanchable erythema
  - Stage 2: superficial ulcer (dermis exposed)
  - Stage 3: full-thickness skin loss, subcutaneous fat visible
  - Stage 4: extends beyond fascia into tendon, bone, joint
- Tx: optimize patient factors (nutrition, smoking cessation), debride osteomyelitis, reconstruct with flap
  - Ischial
    - Inferior gluteus maximus flap (first choice)
    - Posterior thigh advancement flap (second choice)
  - Sacral
    - Gluteus maximus myocutaneous flap (superior based)
  - Trochanteric
    - Tensor fascia lata myocutaneous flap (allows readvancement)
- Complications: Recurrence (50-70%)
- RF: hyperglycemia/uncontrolled diabetes (#1), osteomyelitis, paraplegic, age >70, immobility, poor nutrition, low BMI, anemia, ESRD, CVA, hip fracture
- Re-advance previous flaps when possible`,

    'skin-lesions': `## Skin

### Epidermis
- 5 layers (deep to superficial): Basal, Spinosum, Lucidum, Granulosum, Corneum
- **Keratinocytes**
  - Originate from basal layer
  - 90% of epidermis cells
  - Acts as environmental barrier
- **Melanocytes**

### Dermis
- Papillary (superficial)
- Reticular (deep)
  - Hair roots, sebaceous and sweat glands
- Predominantly made of type I collagen

## Benign Skin Conditions

**Hidradenitis suppurativa**
- Apocrine gland involvement; forms subcutaneous fistulae from occlusion of folliculopilosebaceous units
- Tx: topical/oral antibiotics (1st line, mild cases), TNF-alpha inhibitors (2nd line, moderate cases)
- Tx surgical: excision of involved areas, reconstruction

**Dermoid cyst**
- Most common childhood skin lesion

**Cylindromas**
- Benign adnexal tumors
- Dx: firm, nodular, pink-colored scalp lesions
- Tx: excision

**Pilomatricoma**
- Slow-growing blue nodule associated with hair follicle, calcific features
- Dx: firm to touch, tender
- RF: teenagers
- Dx: CTNNB1
- Tx: excision

**Spiradenomas**
- Benign dermal neoplasms
- Dx: small, painful, bluish nodules
- Tx: excision

## Malignant Skin Diseases

### Basal cell carcinoma
- Pearly round nodules
- RF: xeroderma pigmentosum
  - X-linked recessive gene impairing nucleotide excision repair
  - Dx: extreme sun sensitivity, extensive photoaging, dry skin
- **Tx: non-surgical**: topical creams (5-FU, imatinib), electrodesiccation and curettage for superficial lesions, XRT for high-risk patients (non-surgical candidates)
- **Tx: Mohs excision**
  - Involves real-time circumferential skin lesion sectioning with frozen section review
  - Associated with high cure rate (>95% for basal and squamous cell carcinomas)
  - Indications: High-risk location, H-mask area (periocular, periauricular, temple, lips, perinasal, chin), recurrence, aggressive histology (perineural invasion), ill-defined margins, large tumors (>2cm), immunosuppressed patients
- **Tx surgery**: excision with 4mm margins
- Perineural involvement highest risk for recurrence

### Squamous cell carcinoma
- Arises from stratum basale
- Histology: poorly differentiated cords of spindle cells from keratinocytes
- Aggressive subtypes: adenoid, adenosquamous, desmoid
- **Actinic keratosis**: ~10% malignant risk
  - Tx: cryotherapy, imiquimod (acts on skin immune system), topical 5-FU
- Most-common primary malignant skin tumor of the hand
- **Tx: Mohs**
- **Tx surgery**: wide local excision with 6mm margins for low risk, 1cm for aggressive tumors, XRT for non-surgical candidates (efficacy better for smaller lesions)

### Melanoma
- Arises from stratum basale
- **Clinical features (ABCDs)**: Asymmetry, irregular Border, heterogenous Color, Diameter > 6mm
- Ulceration has worse prognosis
- Types: superficial spreading (#1), nodular (grows more vertically, lowest disease-specific survival)
- **Lentigo maligna**: melanoma in situ variant
  - Tx: excision, XRT, topical imiquimod (upregulates immunomodulation)
- **Neurocutaneous melanosis**: midline involvement, >20 satellite lesions
  - Dx: MRI central nervous system screening before 6 months
- **Dx**: punch biopsy for depth, labs (LDH), imaging (CXR, possible PET/CT)
- **Tx: Wide local excision**
  - Margins: <1mm depth – 1cm, 1-2mm – 1-2cm, >2mm – 2cm
- **Lymph node management:**
  - Sentinel lymph node biopsy (SLNB): indicated for >0.7mm primary lesion depth
  - Completion lymphadenectomy: not associated with survival benefit over SNLB except head and neck melanomas, young patients
- **Chemotherapy**: CTLA-4, PD-1 molecular therapies
- **Metastatic disease**: In-transit (best prognosis), solid organs (worst prognosis)
- **Spitz nevus** is a benign mimic`,

'flaps-and-grafts': `## Flaps

### Basic Principles
- Named based on vascular supply and tissue composition
- Angiosome: three-dimensional tissue block perfused by named artery and vein
- Choke vessels: reduced-caliber true anastomotic vessels connecting angiosomes
- Perforators: source vessels emanating from deeper named artery through deeper tissues to skin
- Classification (Mathes and Nahai):
  - Type I: one pedicle (e.g., gastrocnemius)
  - Type II: dominant pedicle and minor pedicles (e.g., gracilis)
  - Type III: two dominant pedicles (e.g., gluteus maximus, rectus abdominus)
  - Type IV: segmental vascular supply (e.g., sartorius)
  - Type V: one dominant pedicle and secondary segmental pedicles (e.g., latissimus dorsi, pectoralis major)

### Specific Flaps by Region

**Head and Neck**
- **Scalp**
  - Forehead flap: Vascular: supratrochlear artery; Used in nasal reconstruction
  - Orticochea flap: Vascular: occipital artery; Four flap rotation with primary and secondary defects
  - Juri flap: Vascular: superficial temporal artery; Used in temporal/parietal hairline advancement
- **Temporoparietal fascia flap (TPF)**
  - Vascular: superficial temporal artery, vein
  - Loose areolar tissue between superficial and deep layers of temporal fascia
  - Innervation: auriculotemporal nerve (V3)
  - Used in auricular and temporal reconstruction
- **Oral Cavity**
  - Tongue flap: Used in intra-oral reconstruction, lip reconstruction in children
  - Buccal mucosa flap: Vascular: buccal artery off internal maxillary; Used in intra-oral reconstruction
- **Neck**
  - Platysma myocutaneous flap: Vascular: submental branch of facial artery, occipital artery; Used in intra-oral reconstruction, lower lip reconstruction
  - Submental flap: Vascular: submental artery off facial artery; Traverses level I lymph nodes in neck; Use in intra-oral and lower face soft-tissue reconstruction

**Trunk**
- **Latissimus dorsi muscle/musculocutaneous flap**
  - Vascular: thoracodorsal artery
  - Function: shoulder adduction, extension, internal rotation
  - Donor site has decreased shoulder range of motion that improves by one year
  - Versatile flap used mostly in breast reconstruction and trunk reconstruction; is the largest single muscle available for free flap
- **Trapezius flap**
  - Vascular: transverse cervical artery
  - Used in cervical-spine reconstruction
- **Scapula bone flap**
  - Vascular: circumflex scapular artery off subscapular artery
  - Traverses triangular space (teres minor, teres major, long head of triceps)
  - Tip of scapula, can be chimeric flap with other tissues from subscapular system (latissimus dorsi, parascapular flaps)
  - Used for shoulder, back of neck, axilla reconstruction
- **Paraspinous flap**
  - Type IV segmental blood supply
  - Used in spinal coverage
- **Omentum flap**
  - Vascular: right and left gastroepiploic arteries (only need one side)
  - Used in sternal reconstruction, lymphatic surgery; needs subsequent skin coverage
- **Lumbar artery perforator flap**
  - Vascular: L4 lumbar artery perforator
  - Runs between erector spinae and quadratus lumborum
  - Innervation: cluneal nerve
  - Used as a secondary breast free flap option
- **Groin flap**
  - Vascular: superficial circumflex iliac artery
  - Used as a distant (non-microsurgical) flap for hand coverage
- **Superficial circumflex iliac perforator**
  - Thin, pliable flap; improved donor morbidity compared to radial forearm flap
- **Iliac crest osteocutaneous flap**
  - Vascular: deep circumflex iliac
  - Used as an alternative bone flap in mandibular reconstruction; better vertical height than fibula

**Upper Extremity**
- **Lateral arm flap**
  - Vascular: posterior radial collateral artery
  - Runs between lateral triceps and brachialis
  - Used in forearm and hand reconstruction as a thin fasciocutaneous free flap
- **Reverse lateral arm flap**
  - Vascular: radial recurrent artery
  - Used for elbow coverage as a pedicled flap
- **Radial forearm flap**
  - Vascular: radial artery
  - Need normal Allen's test (intact palmar arch)
  - Thin, pliable fasciocutaneous flap; can be innervated flap using lateral antebrachial cutaneous nerve
  - Used as pedicled (anterograde) for elbow coverage, reversed for hand coverage (to level of proximal interphalangeal joints), or free flap for head and neck reconstruction (e.g., hemiglossectomy defects), phalloplasty
- **Ulnar artery flap**
  - Vascular: ulnar artery
  - Less tendon exposure risk than radial forearm flap
  - Shorter pedicle, smaller diameter vessel than radial forearm flap
- **Posterior interosseous artery flap**
  - Vascular: pedicle between 5th/6th extensor compartments
  - Can be reversed and inset as distally as level of metacarpophalangeal joints
- **Reverse homodigital island flap**
  - Vascular: retrograde from contralateral digital artery with crossing vessel proximal to distal interphalangeal joint
  - Used for finger-tip injuries, sensate flap

**Lower Extremity**
- **Anterolateral thigh flap**
  - Vascular: lateral descending circumflex artery
  - Passes through lateral inguinal ligament
  - Donor site morbidity: weak knee extension
  - Used as pedicled or free flap, fasciocutaneous or musculocutaneous flap
  - Can cover large defects: up to 35x25cm; can be innervated using lateral femoral cutaneous nerve
- **Profunda artery perforator flap**
  - Vascular: first, second perforators off profunda artery
  - Innervation: posterior femoral cutaneous nerve
  - Used for posterior thigh, ischial reconstruction
- **Gracilis flap**
  - Vascular: medial circumflex femoral artery
  - Function: hip flexion and adduction
  - Innervation: obturator nerve
  - Can be used as a free functional muscle flap, pedicled for perineal defects
- **Rectus femoris flap**
  - Vascular: descending branch of the lateral femoral circumflex artery
  - Function: hip flexion, knee extension
  - Used in groin coverage
- **Gastrocnemius flap**
  - Vascular: sural arteries
  - Used in upper 1/3rd tibia, knee wounds
- **Medial sural artery perforator**
  - Vascular: perforators can be traced to the popliteal artery
  - Thin, pliable fasciocutaneous flap
- **Soleus flap**
  - Vascular: proximal from posterior tibial, distal from peroneal
- **Fibula bone flap**
  - Vascular: peroneal artery
  - Anterior approach between extensor hallucis longus and interosseous septum, pedicle between flexor hallucis longus (FHL) and posterior tibial muscles
  - Skin island based on perforator from distal 1/3rd of the leg
  - Donor morbidity: decreased great toe flexion strength (due to harvest of flexor hallucis longus)
  - Used for large bony defects, mandibular reconstruction; thick cortical bone stock
  - Up to 20cm of bone stock available; can perform multiple osteotomies
  - Preserve 5-6cm proximal and distal aspect of fibula
  - Can be performed with previous distal fibula fracture
- **Reverse sural artery flap**
  - Vascular: peroneal artery perforators artery, lesser saphenous vein
  - Used as a reversed pedicled flap for heel defects
  - MC cause flap loss: venous insufficiency
  - Improve with surgical delay
- **Posterior tibial artery perforator propeller flap**
  - Vascular: perforators from between soleus and flexor digitorum longus
  - Used as a regional option for lower extremity
- **Medial plantar artery flap**
  - Vascular: continuation from posterior tibial artery
  - Perforator between flexor hallucis brevis and abductor hallucis muscles
  - Innervation: medial plantar nerve from tibial nerve
  - Used in heel reconstruction

## Grafts

Survive off surrounding soft tissues until generate their own blood supply

### Skin grafts
- **Three phases of initial healing**, occur over first 5-6 days:
  - Plasmatic imbibition: graft survives off nutrients from wound bed
  - Inosculation: new capillaries form
  - Revascularization: new blood vessels form
- **Split-thickness grafts:**
  - Less primary contracture (20% compared to 40% for FTSG), more secondary contraction than full-thickness grafts
  - Secondary contraction is inversely related to amount of dermis
  - Meshing, fascial placement increases secondary contraction
  - Lower metabolic demand than full-thickness grafts
- **Bolster**: Negative-pressure wound therapy (NPWT) improves skin graft take over other bolster options
- **Donor-site management**: Moist dressings less painful (occlusive clear dressings, hydrocolloid), similar healing to other dressings
- Lower survival in XRT wounds

### Dermal substitutes
- **Dermal regenerative matrix template**
  - Can be used over less vascularized wound beds improves blood flow → granulation
  - Requires debrided wound, no infection
  - Increase in matrix take with NWPT as bolster
  - Perform skin graft 3 weeks after placement

### Fat grafts
- Graft take usually around 50-60%
- Related to harvest, processing, injection
- Injection with low-shear device (#1), small aliquots improve graft viability

### Tendon grafts
- Palmaris longus (#1), plantaris (gracilis and tensor fascia lata also used)
- Heal through extrinsic (synovial sheath), intrinsic (tenocytes) healing

### Nerve grafts
- Sural nerve (#1), medial/lateral antebrachial cutaneous nerves
- Great auricular nerve common for facial reanimation surgeries
- Nerve allograft: decellularized nerve tissue processed using detergent
- Acts as nerve conduit improving axonal regeneration over >3cm defects`,
  },
  
  // Add more content for other sections as needed...
};
