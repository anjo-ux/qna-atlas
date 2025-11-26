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
The inflammatory phase occurs from day 0 to 3 and involves platelets arriving first, followed by neutrophils, then macrophages. The proliferative phase spans from 3 days to 3 weeks and is characterized by fibroblast activity, during which most collagen is deposited. The remodeling phase extends from 3 weeks to 18 months, during which type III collagen (the most vascular type) is converted to type I collagen (the most common type in the body).

# Healing
Primary intention refers to directly closing a wound. Secondary intention describes an open wound that closes from intact peripheral skin through epithelialization from intact hair follicles at the wound edge, involving myofibroblasts. Tertiary intention (rarely used) involves direct closure after leaving the wound open for a few days.

# Wound Closure

## Cyanoacrylate
Cyanoacrylate is used for short-distance, tension-free wounds with no significant tissue trauma or infection. It has a higher dehiscence rate than sutures when applied to longer incisions.

## Sutures
Smaller suture sizes help minimize tissue trauma and foreign body burden. Monofilament sutures cause less tissue resistance. Multi-filament sutures are braided and have less memory, higher knot security, and higher tensile strength, but they are more likely to saw through tissue and harbor infection compared to monofilament sutures. Barbed sutures decrease operative time with no change in scar appearance in body contouring procedures.

# Scarring
The most important technical factor for healing is wound-edge eversion. Silicone sheeting improves scar appearance through hydration and compression. Pressure garments improve scarring in burn patients by reducing differentiation of fibroblasts to myofibroblasts.

# Abnormal Scarring

## Hypertrophic scarring
Hypertrophic scars stay within the confines of the original scar. Histologically, they feature increased type III collagen and involve myofibroblasts with parallel collagen organization. Treatment consists of intralesional steroids combined with 5-FU.

## Keloid
Keloids extend beyond the boundaries of the original scar. Symptoms include pruritis and poor cosmesis. Risk factors include anterior chest location and high Fitzpatrick skin type. Histologically, keloids show disorganized type I collagen with thick, randomly oriented collagen fibers. For mild cases, treatment involves intralesional injection. 5-FU has similar efficacy with less hypopigmentation than steroids, and its mechanism of action is to decrease fibroblast proliferation and collagen synthesis. For moderate to severe cases, surgical treatment is indicated. Excision with steroid injection has a 15% recurrence rate, while excision with XRT has a 14% recurrence rate. XRT should be started within 24 hours of excision, typically with 2-3 sessions. Recurrence risk factors include male sex, age under 29, size greater than 5cm, and associated skin graft.

# Wound Management

## Local wound care
Wet to dry dressings mechanically debride metalloproteinases and elastases. Hydrogels and hydrocolloids maintain a moist wound-healing environment. Honey stimulates the immune response and suppresses inflammation. Calcium alginate is absorptive, requires fewer dressing changes, and provides moist-wound healing. Hydrofiber has high absorptive capacity. Occlusive dressings create a moist-wound healing environment.

## Negative-pressure wound therapy
Negative-pressure wound therapy works through micro- and macro-deformational forces. It removes excess interstitial fluid, reopens capillaries, and releases VEGF. Evidence supports fewer dressing changes and fewer operations in diabetic wounds. Contraindications include include exposed vessels, active infection, malignant wounds, and non-debrided wounds.

## Hyperbaric oxygen therapy
Indications include for hyperbaric oxygen therapy include carbon monoxide poisoning, arterial insufficiency, acute traumatic ischemia, radiation injury, necrotizing soft-tissue infections, and refractory osteomyelitis.

## Dermal regeneration template
Dermal regeneration templates are composed of glycosaminoglycans and collagen. Their use is associated with decreased hypertrophic scarring in burns.

## Nutrition support
Vitamin C is involved in collagen cross-linking. Increased matrix metalloproteinases in the wound bed are associated with poor healing.

# Abnormal Wound Healing

## Radiation Injury
Acute radiation injury presents as skin erythema and is treated with hydrocortisone cream. Chronic radiation injury causes fibrosis of soft tissues and decreased microvascular supply to the skin, limiting the ability to undermine or advance local tissues. Regional or free tissue reconstructions should be used from outside the zone of XRT injury.

## Effect of nicotine on wound healing
Nicotine causes peripheral microvascular vasoconstriction and inhibits prostacyclin. It promotes increased platelet aggregation and impairs wound healing through decreased oxygen delivery. Wound healing improves after stopping smoking 4 weeks preoperatively. Diagnosis can be confirmed through urine cotinine testing.

## Steroids
Steroids slow down the inflammatory component of wound healing. Treatment to counteract this effect involves oral vitamin A.

## Calciphylaxis
Calciphylaxis is an ischemic skin lesion caused by calcification of small vessels. It is associated with ESRD. Treatment involves sodium thiosulfate.

# Pressure Injuries
Risk factors include male sex and spinal-cord injuries. Staging includes Stage I (transient erythema that self-resolves), Stage II (involves the dermis), Stage III (extends to subcutaneous tissue up to muscle fascia), and Stage IV (extends below muscle fascia with exposed bone). Diagnosis of osteomyelitis is made by bone biopsy, which is more accurate than advanced imaging. Consider abuse or neglect when multiple pressure injuries are present. Treatment includes debridement, local wound care, and management of osteomyelitis with antibiotics. Flap coverage options include: for ischial pressure injuries, posterior thigh musculocutaneous flap (for paraplegic patients), posterior thigh fasciocutaneous flap (for ambulatory patients), biceps femoris VY flap, gluteal flap, or gracilis flaps; for sacral injuries, gluteal flap or VY advancement; for trochanteric injuries, tensor fascia lata myocutaneous flap (which allows readvancement). Recurrence rates are 50-70%. Risk factors for recurrence include hyperglycemia or uncontrolled diabetes (the most significant), osteomyelitis, paraplegia, age over 70, immobility, poor nutrition, low BMI, anemia, ESRD, CVA, and hip fracture. Previous flaps should be re-advanced when possible.`,
    
    'flaps-and-grafts': `# Flap Basics
An axial flap carries its own blood supply. A random flap survives off the subdermal plexus and often follows a 3:1 length-to-width ratio. A bipedicled flap can extend to a 2:1 length-to-width ratio.

## Z plasty
Z-plasty is commonly used in scar contracture releases. It gains length by rearranging width: at 30 degrees there is 25% gain in length, at 45 degrees 50%, at 60 degrees 75%, at 75 degrees 100%, and at 90 degrees 125%. The 5-flap Z-plasty includes a V to Y advancement to the central limb for lengthening.

## Keystone flap
The keystone flap is a perforator island fasciocutaneous local flap. It is designed with the same width as the defect and uses a double V to Y donor closure. No undermining is performed to the flap.

# Flap Anatomy

## Neck
The submental fasciocutaneous flap receives its vascular supply from the submental artery, which arises from the cervical branch of the facial artery. It traverses level I lymph nodes in the neck and is used in intra-oral and lower face soft-tissue reconstruction.

## Trunk
The latissimus dorsi muscle/musculocutaneous flap receives its vascular supply from the thoracodorsal artery. Its function includes shoulder adduction, extension, and internal rotation. The donor site has decreased shoulder range of motion that improves by one year. This is a versatile flap used mostly in breast reconstruction and trunk reconstruction, and it is the largest single muscle available for free flap transfer.

The trapezius flap receives its vascular supply from the transverse cervical artery and is used in cervical-spine reconstruction.

The scapula bone flap receives its vascular supply from the circumflex scapular artery off the subscapular artery. It traverses the triangular space (bounded by teres minor, teres major, and long head of triceps). The tip of the scapula can be a chimeric flap with other tissues from the subscapular system (latissimus dorsi, parascapular flaps) and is used for shoulder, back of neck, and axilla reconstruction.

The paraspinous flap has Type IV segmental blood supply and is used in spinal coverage.

The omentum flap receives its vascular supply from the right and left gastroepiploic arteries (only one side is needed). It is used in sternal reconstruction and lymphatic surgery and requires subsequent skin coverage.

The lumbar artery perforator flap receives its vascular supply from the L4 lumbar artery perforator and runs between the erector spinae and quadratus lumborum. Innervation is from the is from the cluneal nerve. It is used as a secondary breast free flap option.

The groin flap receives its vascular supply from the superficial circumflex iliac artery and is used as a distant (non-microsurgical) flap for hand coverage.

The superficial circumflex iliac perforator flap is a thin, pliable flap with improved donor morbidity compared to the radial forearm flap.

The iliac crest osteocutaneous flap receives its vascular supply from the deep circumflex iliac artery and is used as an alternative bone flap in mandibular reconstruction, offering better vertical height than the fibula.

## Upper Extremity
The lateral arm flap receives its vascular supply from the posterior radial collateral artery and runs between the lateral triceps and brachialis. It is used in forearm and hand reconstruction as a thin fasciocutaneous free flap.

The reverse lateral arm flap receives its vascular supply from the radial recurrent artery and is used for elbow coverage as a pedicled flap.

The radial forearm flap receives its vascular supply from the radial artery. A normal Allen's test (intact palmar arch) is required. It is a thin, pliable fasciocutaneous flap that can be innervated using the lateral antebrachial cutaneous nerve. It is used as a pedicled (anterograde) flap for elbow coverage, as a reversed flap for hand coverage (to the level of proximal interphalangeal joints), or as a free flap for head and neck reconstruction (e.g., hemiglossectomy defects) and phalloplasty.

The ulnar artery flap receives its vascular supply from the ulnar artery. It has less tendon exposure risk than the radial forearm flap but has a shorter pedicle and smaller diameter vessel.

The posterior interosseous artery flap has its vascular pedicle between the 5th and 6th extensor compartments. It can be reversed and inset as distally as the level of the metacarpophalangeal joints.

The reverse homodigital island flap receives retrograde vascular supply from the contralateral digital artery with a crossing vessel proximal to the distal interphalangeal joint. It is used for finger-tip injuries and is a sensate flap.

## Lower Extremity
The anterolateral thigh flap receives its vascular supply from the lateral descending circumflex artery, which passes through the lateral inguinal ligament. Donor site morbidity includes weak knee extension. It can be used as a pedicled or free flap, in fasciocutaneous or musculocutaneous form. It can cover large defects up to 35x25cm and can be innervated using the lateral femoral cutaneous nerve.

The profunda artery perforator flap has a vascular pedicle that traverses through the adductor magnus. It includes the posteromedial thigh with its superior border at the gluteal crease. It is used as a secondary breast free flap option with a favorable donor site and supine positioning.

The posterior thigh fasciocutaneous flap receives its vascular supply from the descending branch of the inferior gluteal artery.

The medial femoral condyle/trochlea bone/periosteal flap receives its vascular supply from the descending geniculate artery, which passes posterior to the vastus medialis and anterior to the adductor. It can be used for defects up to 7cm and is used in scaphoid nonunion surgery.

The gracilis flap receives its vascular supply from the medial circumflex artery, which travels between the adductor magnus and adductor longus. The pedicle enters the muscle laterally. Innervation is from the is from the obturator nerve. It can be used as a free functional muscle flap or pedicled for perineal defects.

The rectus femoris flap receives its vascular supply from the descending branch of the lateral femoral circumflex artery. Its function includes hip flexion and knee extension, and it is used in groin coverage.

The gastrocnemius flap receives its vascular supply from the sural arteries and is used in upper 1/3 tibia and knee wounds.

The medial sural artery perforator flap has vascular perforators that can be traced to the popliteal artery. It is a thin, pliable fasciocutaneous flap.

The soleus flap receives its vascular supply proximally from the posterior tibial artery and distally from the peroneal artery.

The fibula bone flap receives its vascular supply from the peroneal artery. The anterior approach is between the extensor hallucis longus and interosseous septum, with the pedicle between the flexor hallucis longus (FHL) and posterior tibial muscles. The skin island is based on a perforator from the distal 1/3 of the leg. Donor morbidity includes decreased great toe flexion strength (due to harvest of the flexor hallucis longus). It is used for large bony defects and mandibular reconstruction, offering thick cortical bone stock. Up to 20cm of bone stock is available, and multiple osteotomies can be performed. Preserve 5-6cm of the proximal and distal aspects of the fibula. The flap can be performed even with a previous distal fibula fracture.

The reverse sural artery flap receives its vascular supply from peroneal artery perforators and the lesser saphenous vein. It is used as a reversed pedicled flap for heel defects. The most common cause of flap loss is venous insufficiency. This can be improved with surgical delay by incising the flap to produce ischemia-induced hyperplasia and hypertrophy of blood vessels, then completing elevation and inset of the flap 2-3 weeks later.

The posterior tibial artery perforator propeller flap has vascular perforators from between the soleus and flexor digitorum longus. It is used as a regional option for lower extremity coverage.

## Foot
The medial plantar artery flap receives its vascular supply as a continuation from the posterior tibial artery. The perforator is located between the flexor hallucis brevis and abductor hallucis muscles. Innervation is from the is from the medial plantar nerve, which arises from the tibial nerve. It is used in heel reconstruction.

# Grafts

Grafts survive off surrounding soft tissues until they generate their own blood supply.

## Skin grafts
There are three phases of initial skin graft healing, occurring over the first 5-6 days. During plasmatic imbibition, the graft survives off nutrients from the wound bed. During inosculation, new capillaries form. During revascularization, new blood vessels form.

Split-thickness grafts have less primary contracture (20% compared to 40% for FTSG) but more secondary contraction than full-thickness grafts. Secondary contraction is inversely related to the amount of dermis present. Meshing and fascial placement increase secondary contraction. Split-thickness grafts have lower metabolic demand than full-thickness grafts.

Negative-pressure wound therapy (NPWT) as a bolster improves skin graft take over other bolster options.

For donor site management, moist dressings are less painful (occlusive clear dressings, hydrocolloid) with similar healing to other dressings.

Skin grafts have lower survival in XRT wounds.

## Dermal substitutes
Dermal regenerative matrix template can be used over less vascularized wound beds. It requires a debrided wound with no infection. Matrix take increases with NPWT as a bolster. Skin grafting is performed 3 weeks after placement.

## Fat grafts
Fat graft take is usually around 50-60% and is related to harvest, processing, and injection technique. Injection with a low-shear device (most important factor) and small aliquots improve graft viability.

## Tendon grafts
Common tendon graft donor sites include the palmaris longus, plantaris (which has the longest length), and extensor digitorum longus.

## Cartilage grafts
Common cartilage graft donor sites include the septum, ear, and rib (5-7). The most common complication is warping. According to the Gibson principle, removing the perichondrium causes the cartilage to warp to the opposite side.

## Fascial grafts
Fascial grafts can be harvested from the tensor fascia lata and the temporoparietal fascia. The most common complication of temporoparietal fascia grafts is alopecia.

## Bone grafts
Bone healing occurs through three mechanisms: osteogenesis (formation of new bone by cells), osteoinduction (differentiation of cells for bone healing, e.g., bone morphogenic protein [BMP]), and osteoconduction (vessels grow into a mechanical scaffold, e.g., hydroxyapatite).

Bone flaps and vascularized bone grafts provide osteogenesis through osteoblasts. Non-vascularized bone grafts work differently: cancellous bone provides osteoinduction while cortical bone provides osteoconduction. Cortical bone allografts have greater mechanical strength than cancellous autografts.`,
    
    'microsurgery': `# Free Flap

## Complications
The most common complication is venous congestion. Diagnosis is made by observing fast capillary refill and purple flap color. Risk factors include using a venous coupler less than 2mm. Hand-sewn anastomosis for smaller veins reduces this risk. Treatment requires prompt return to the OR.

Arterial thrombosis is also a common complication. It presents as a white clot from platelet aggregation, often resulting from a technical problem. Diagnosis is made by observing ischemia of the flap, which appears pale and cool with no capillary refill. Treatment involves revising the anastomosis and administering local heparin.

## Flap salvage
The highest likelihood of salvage occurs with prompt return to the OR within the first 48 hours. Mechanical causes (such as vessel kinking) have more favorable outcomes than thrombosis. Salvage rates decrease with multiple repeat explorations and in irradiated fields.

## Vasopressor medications during free tissue transfer
Vasopressor medications have no effect on flap survival.

## Monitoring
Clinical monitoring includes Doppler assessment, color, capillary refill, turgor, and warmth. Near-infrared spectroscopy measures tissue oxygen saturation (both arterial and venous components). It has been shown to improve deep inferior epigastric (DIEP) flap breast reconstruction salvage rates compared to clinical monitoring alone due to earlier detection of microvascular problems.

# Hypercoagulable States

Virchow's triad consists of vessel injury, venous stasis, and hypercoagulable state. Risk factors include personal history of DVT/PE and family history. The risk persists for several weeks after an operation.

Inherited disorders include Factor V Leiden (the most common genetic cause), which causes resistance to activated protein C. Other inherited disorders include antiphospholipid syndrome and antithrombin deficiency.

Among acquired causes, tamoxifen is the most common medication-related cause.

# Medicines and Adjuncts

## Antiplatelet
Aspirin inhibits thromboxane A2, causing irreversible platelet inhibition.

## Anticoagulation
Heparin works by activating antithrombin III.

## Fibrinolytics
tPA (such as alteplase) activates plasminogen to plasmin, which degrades clots. It is used for fibrinolysis of microsurgical arterial thrombosis. The medication is injected locally into the flap via the artery and allowed to drain out a flap vein that is not anastomosed. It is associated with reduced fat necrosis but is not associated with increased salvage in DIEP flaps.

## Glycoprotein IIIa/IIb inhibitors
These are anti-platelet agents. There is some support for their use in the setting of reactive thrombocythemia (greater than 1 million) with free flaps.

## Leeches
Leeches are used to treat focal venous congestion (such as in finger replantation). They secrete hirudin, which is an anticoagulant. Prophylaxis with ciprofloxacin is recommended since approximately 15% of patients develop infection, and 80% of these infections are caused by Aeromonas. Alternatives include include ceftriaxone or doxycycline (though doxycycline is not suitable for pediatric patients).

## Vasodilators
Papaverine inhibits phosphodiesterase in vessel smooth muscle, resulting in vasodilation. Lidocaine blocks the sympathetic response in vessels. No evidence supports one topical vasodilator being better than another.`,
    
    'trunk': `# Chest

## Sternal wound infections
The Arnold classification divides sternal wound infections into three categories: acute (0-2 weeks), subacute (2-4 weeks, often with mediastinitis), and chronic (greater than 4 weeks, often with osteomyelitis). Diagnosis involves CT scan, antibiotics, and assessment for mediastinitis. Treatment includes debridement and flap coverage. Pectoralis major advancement flaps are commonly used. The pectoralis major turnover flap is an alternative for dead space and inferior defects. It is important to know if the internal mammary arteries (IMA) were used during cardiac bypass, as this technique can only be performed if the IMA is intact. Alternatives include include pedicled rectus abdominus (which requires an intact IMA) and omentum for sizable defects and dead space obliteration.

## Pectus excavatum
Pectus excavatum presents as a sunken anterior chest and sternum. Treatment involves chest wall reconstruction at age 6-12 if symptomatic. Skeletal correction options include Nuss external support bars and thoracoscopic retrosternal support bars. Soft-tissue correction options include custom silicone elastomer and augmentation mammaplasty.

## Pectus carinatum
Pectus carinatum is associated with connective tissue diseases such as Marfan and Loeys-Dietz syndromes. It presents with a prominent sternum.

## Anterior thoracic hypoplasia
Anterior thoracic hypoplasia presents as unilateral sunken chest with normal sternum, breast hypoplasia, normal pectoralis muscle, and no associated extremity abnormalities.

## Poland syndrome
Poland syndrome is characterized by absent sternal head of the pectoralis major, concave chest, breast hypoplasia, absent anterior axillary fold, and ipsilateral symbrachydactyly. It is associated with lymphatopoetic, renal, and lung tumors, but there is no increased breast cancer risk. Treatment involves breast reconstruction using DIEP flap, custom implant, or staged implant reconstruction depending on anatomy.

## Gynecomastia
Gynecomastia is caused by increased aromatization of androgen to estrogen. The majority of cases are idiopathic, but there are many etiologies including medications, marijuana, and cancers. Risk factors include prostate medications, which can also cause mastodynia. Gynecomastia is common in teenagers, and treatment is observation since most cases regress in less than a year. Diagnosis includes a testicular exam to evaluate for testicular cancer as an etiology.

The Rohrich grading system classifies gynecomastia as: Grade I (minimal hypertrophy), Grade II (moderate hypertrophy), Grade III (severe hypertrophy with mild ptosis), and Grade IV (severe hypertrophy with severe ptosis).

Treatment options include liposuction and direct excision for central gland prominence. Nipple transposition is used for 250-500gm resection with skin redundancy, while mastectomy with free nipple grafting is used for severe ptosis.

# Trunk

## Abdominal-wall reconstruction
The arcuate line is an area below the umbilicus that demarcates where the posterior sheath ends (formed by internal oblique and transversalis fascia); there is no defined posterior sheath inferior to this line. Innervation is from the of the abdominal muscles involves the transversalis abdominus plane (TAP), where the nerve runs between the transversus abdominus and internal oblique muscles (arising from intercostal nerves).

Prehabilitation with botulinum toxin injection to the lateral musculature increases the likelihood of primary closure of hernias.

Anterior components separation involves incising the fascia lateral to the semilunar line. Excursion is 4cm in the upper abdomen, 8cm in the mid abdomen, and 3cm in the suprapubic area per side.

Posterior components separation involves release of the transversus abdominus (TAR) medial to the semilunar line.

Mesh usage reduces recurrence compared to tissue repair. Mesh options include synthetic (which has better strength and is cheaper) and biologic (which is potentially more resilient with infection or GI spillage and is considered for high-risk, contaminated cases). Retrorectus position has the lowest complication and recurrence rate. Other mesh placements include intraperitoneal and onlay (over fascia). Bridge repair is used when unable to approximate fascia but has the highest recurrence risk compared to other mesh repairs.

Abdominal compartment syndrome is a complication where increased compartment pressure causes diaphragm elevation, vascular compression, and organ compression. Diagnosis is made by clinical exam, elevated bladder pressure (greater than 20), and peak inspiratory pressure greater than 30 on ventilator. Treatment is decompressive laparotomy.

## Congenital abdominal-wall diseases
Omphalocele is a midline, partial-thickness defect with intestines covered by a membrane. It is commonly associated with chromosome abnormalities such as trisomy 13.

Gastroschisis is a full-thickness defect located to the right of the umbilical cord with no intestinal coverage. Diagnosis is made by elevated maternal AFP. Treatment involves direct closure with or without components separation, and an abdominal silo is used if the defect is large. The silo protects the viscera and allows progressive reduction.

## Desmoid tumors
Desmoid tumors tend to occur in the abdominal wall and are associated with familial adenomatous polyposis syndrome.

## Chest wall reconstruction
Bony reconstruction is needed for defects involving more than 4 ribs or greater than 5cm, otherwise the patient is at risk for flail chest. XRT increases stiffness of the chest wall and decreases the need for bony reconstruction. Areas covered by the pectoralis major and posterior rib defects do not need bony reconstruction. Treatment involves alloplastic materials (PTFE/meshes, methylmethacrylate) for bony reconstruction with vascularized skin coverage.

## Perineal reconstruction
Post-oncologic defects following abdominoperineal resection (approximately 50%) and pelvic exenteration (80%) have a high complication rate with primary closure. Patients commonly have had neoadjuvant XRT to the perineum. Treatment options include vertical rectus abdominus musculocutaneous (VRAM) flap, pedicled ALT flap, pedicled PAP flaps, and gracilis flap (which has a higher complication rate).

Vaginal agenesis is associated with many conditions. Mayer Rokitansky Kuster Hauser syndrome involves 46XX karyotype with Mullerian duct aplasia and is associated with renal, cardiac, and hearing abnormalities, but patients have intact ovarian function and secondary sex characteristics. Partial and complete androgen insensitivity syndromes involve 46XY karyotype with no development of male genitals and a phenotypically female presentation. Treatment involves internal pudendal flaps, with stenosis being a complication that is managed with serial dilation. For posterior defects, VRAM is used. For anterior and lateral defects, the superficial perineal artery (pudendal thigh) flap is used, which maintains sensation through the pudendal nerve. For total defects, bilateral gracilis muscle flaps are used. Rectovaginal fistula is managed by controlling the source and inflammation with a diverting ostomy, followed by staged reconstruction using a gracilis muscle flap.

## Spine reconstruction
Spine wound dehiscence carries a risk of cerebrospinal fluid leak if the dura is exposed. Treatment involves vascularized tissue coverage over the dural repair using local fascia and muscle flaps with skin coverage.

Myelomeningocele is a congenital malformation of the spine with outpouching of the spinal cord at birth. It results from failure of neural tube closure during the 4th week of gestation and is associated with folic acid deficiency. Diagnosis is made by high AFP and neonatal ultrasound. The presence of hydrocephalus distinguishes it from meningocele. It can be associated with cardiac, renal, orthopaedic, and other neurologic abnormalities. Treatment includes antibiotics, neurosurgery to shunt and repair the dura, and prompt reconstruction and coverage of the spine with local flaps within 48 hours due to the risk of meningitis. It is a risk factor for tethered cord syndrome.

# Gender Surgery

## Head/neck
Facial feminization is classified using the Ousterhout classification, with type 3 being the most common (80%). Treatment includes frontal sinus setback, burring of the supraorbital ridge, hairline reduction, and brow lift.

Chondrolaryngoplasty addresses the thyroid cartilage. A potential complication is anterior commissure tendon injury, which presents as decreased voice pitch without hoarseness.

## Chest ("top") surgery
WPATH guidelines require adult status (greater than 18 years old) and one mental health letter of support. Hormones are not needed but are recommended for more than 1 year.

Masculinizing surgery includes periareolar mastectomy for small breast volume with no ptosis, and mastectomy with free nipple graft for patients with ptosis.

Feminizing surgery involves augmentation mammaplasty.

## Genital ("bottom") surgery
WPATH recommendations include informed consent, more than 12 months of hormones, living in the desired gender for more than 12 months, and support from two mental health providers.

Feminizing surgery involves estrogen treatment. DVT risk is highest with oral ethinyl estradiol and lowest with transdermal estradiol. Penetrative options include penile-inversion vaginoplasty and intestinal vaginoplasty. Penile-inversion vaginoplasty involves dissection in the retroprostatic fascia (Denonvillier's), with neovaginal stenosis being the most common complication.

Masculinizing surgery involves testosterone treatment, which lowers voice, increases muscle mass, increases body hair, and causes cessation of menses. Effects take 6 months to 5 years. Menses can return after discontinuing medication, but other changes remain. Surgical options include metoidioplasty, which uses local tissue to create a neophallus, and phalloplasty using radial forearm free flap (with urethral strictures and urethral fistulas being the most common complications), osteocutaneous flaps (which do not require a prosthesis for erection), or innervated flaps (using the ilioinguinal nerve for tactile sensation and dorsal clitoral nerve for erogenous sensation). Urethral reconstruction has urethral stricture as its most common complication, which is highest with skin graft prelamination.

Penile replantation and transplantation procedures rely on the deep dorsal penis artery as the dominant artery. The skin is also supplied by the inferior external pudendal artery.`,
    
    'skin-lesions': `# Skin

## Epidermis
The epidermis has 5 layers from deep to superficial: the basal layer, stratum spinosum, stratum lucidum, stratum granulosum, and stratum corneum. Keratinocytes originate from the basal layer, constitute 90% of epidermis cells, and act as an environmental barrier. Melanocytes are also present in the epidermis.

## Dermis
The dermis consists of two layers: the papillary layer (superficial) and the reticular layer (deep), which contains hair roots, sebaceous glands, and sweat glands. The dermis is predominantly made of type I collagen.

# Benign Skin Conditions

## Hidradenitis suppurativa
Hidradenitis suppurativa involves the apocrine glands and forms subcutaneous fistulae from occlusion of folliculopilosebaceous units. First-line treatment for mild cases includes topical or oral antibiotics, while second-line treatment for moderate cases includes TNF-alpha inhibitors. Severe cases require excision of involved areas with reconstruction.

## Dermoid cyst
Dermoid cysts are the most common childhood skin lesion.

## Cylindromas
Cylindromas are benign adnexal tumors that present as firm, nodular, pink-colored scalp lesions. Treatment is excision.

## Pilomatricoma
Pilomatricoma is a slow-growing blue nodule associated with hair follicles and calcific features. On examination, it is firm to touch and tender. It most commonly occurs in teenagers. Treatment is excision.

## Spiradenomas
Spiradenomas are benign dermal neoplasms that present as small, painful, bluish nodules. Treatment is excision.

# Malignant Skin Diseases

## Basal cell carcinoma
Basal cell carcinoma presents as pearly round nodules. Risk factors include xeroderma pigmentosum, which is an X-linked recessive gene disorder impairing nucleotide excision repair that presents with extreme sun sensitivity, extensive photoaging, and dry skin. Non-surgical treatment options include topical creams (5-FU, imatinib), electrodesiccation and curettage for superficial lesions, and XRT for high-risk patients who are non-surgical candidates. Mohs excision involves real-time circumferential skin lesion sectioning with frozen section review and is associated with a high cure rate (greater than 95% for basal and squamous cell carcinomas). Standard surgical treatment involves excision with 4mm margins.

## Squamous cell carcinoma
Squamous cell carcinoma arises from the stratum basale. Histologically, it shows poorly differentiated cords of spindle cells from keratinocytes. Aggressive subtypes include adenoid, adenosquamous, and desmoid variants. Actinic keratosis has approximately 10% malignant risk and is treated with cryotherapy, imiquimod (which acts on the skin immune system), or topical 5-FU. Squamous cell carcinoma is the most common primary malignant skin tumor of the hand. Mohs excision is an effective treatment option. Wide local excision uses 6mm margins for low-risk tumors and 1cm for aggressive tumors. XRT is used for non-surgical candidates and has better efficacy for smaller lesions.

## Melanoma
Melanoma arises from the stratum basale. Clinical features follow the ABCDs: Asymmetry, irregular Border, heterogenous Color, and Diameter greater than 6mm. Ulceration indicates a worse prognosis. Types include superficial spreading (most common) and nodular (which grows more vertically and has the lowest disease-specific survival). Lentigo maligna is a melanoma in situ variant treated with excision, XRT, or topical imiquimod (which upregulates immunomodulation). Neurocutaneous melanosis presents with midline involvement and more than 20 satellite lesions, requiring MRI central nervous system screening before 6 months of age. Diagnosis involves punch biopsy for depth assessment, labs (LDH), and imaging (CXR, possible PET/CT). Treatment includes wide local excision with margins based on depth: less than 1mm depth requires 1cm margins, 1-2mm requires 1-2cm margins, and greater than 2mm requires 2cm margins. Sentinel lymph node biopsy (SLNB) is indicated for primary lesion depth greater than 0.7mm. Completion lymph node dissection is performed for high nodal burden (more than 3 nodes) or extracapsular extension. Systemic immunotherapy is indicated for positive nodal disease or distant metastases.

## Merkel cell carcinoma
Merkel cell carcinoma is a neuroendocrine tumor. Histologically, it features nuclear molding, small blue cells, and salt-and-pepper chromatin on Hematoxylin and Eosin staining. More than 80% of cases are associated with Merkel cell polyomavirus. Treatment includes surgery with 1-2cm margins plus XRT and SLNB. Prognosis is poor.

## Angiosarcoma
Angiosarcoma presents as rapidly-growing red or purple macules or nodules, usually in the head and neck region. It is associated with prior XRT or lymphedema. Treatment includes surgery, XRT, and chemotherapy, but prognosis is poor.

## Split-thickness skin graft (STSG)
Split-thickness skin grafts are more forgiving to the recipient site than full-thickness skin grafts. First-intention failure can result from inadequate recipient site vascularity, infection, seroma, or hematoma. Seroma or hematoma can prevent the graft from taking and should be avoided by messengering and pie-crusting. The graft requires immobilization with a bolster to prevent shearing. Split-thickness grafts have less secondary contracture than full-thickness skin grafts. Thinner grafts have lower metabolic demand and higher skin contracture rate but require less vascular bed. They heal by secondary intention.

## Full-thickness skin graft (FTSG)
Full-thickness skin grafts have less secondary contracture than split-thickness skin grafts but require a higher quality recipient site. They heal by primary intention and provide better pigmentation match. Thicker grafts are more durable but have less re-epithelialization.

## Composite graft
Composite grafts contain multiple tissue types taken together from the donor site and require a meticulous recipient bed. Examples include ear cartilage with skin and dermal-fat grafts.

# Flap Classification

The Mathes and Nahai classification categorizes muscle flaps by blood supply: Type I has a single vascular pedicle (gastrocnemius, tensor fascia lata), Type II has a dominant pedicle with minor pedicles (gracilis, soleus, trapezius), Type III has two dominant pedicles (gluteus maximus, rectus abdominus), Type IV has segmental pedicles (sartorius, external oblique), and Type V has a single dominant pedicle with secondary segmental pedicles (latissimus, pectoralis major).

## Flap types
An axial flap carries its own blood supply. A random flap survives off the subdermal plexus and often follows a 3:1 length-to-width ratio. A bipedicled flap can extend to a 2:1 length-to-width ratio.

## Z plasty
Z-plasty is commonly used in scar contracture releases. It gains length by rearranging width: 30 degrees provides 25% gain in length, 45 degrees provides 50%, 60 degrees provides 75%, 75 degrees provides 100%, and 90 degrees provides 125%. The 5-flap Z-plasty includes a V to Y advancement to the central limb for lengthening.

## Keystone flap
The keystone flap is a perforator island fasciocutaneous local flap. It is designed with the same width as the defect and uses a double V to Y donor closure. No undermining is performed to the flap.

# Flap Anatomy

## Neck
The submental fasciocutaneous flap receives its vascular supply from the submental artery off the cervical branch of the facial artery. It traverses level I lymph nodes in the neck and is used in intra-oral and lower face soft-tissue reconstruction.

## Trunk
The latissimus dorsi muscle/musculocutaneous flap receives its vascular supply from the thoracodorsal artery. Its function includes shoulder adduction, extension, and internal rotation. The donor site has decreased shoulder range of motion that improves by one year. This versatile flap is used mostly in breast reconstruction and trunk reconstruction and is the largest single muscle available for free flap transfer.

The trapezius flap receives its vascular supply from the transverse cervical artery and is used in cervical-spine reconstruction.

The scapula bone flap receives its vascular supply from the circumflex scapular artery off the subscapular artery. It traverses the triangular space (bounded by teres minor, teres major, and long head of triceps). The tip of the scapula can be a chimeric flap with other tissues from the subscapular system (latissimus dorsi, parascapular flaps) and is used for shoulder, back of neck, and axilla reconstruction.

The paraspinous flap has Type IV segmental blood supply and is used in spinal coverage.

The omentum flap receives its vascular supply from the right and left gastroepiploic arteries (only one side is needed). It is used in sternal reconstruction and lymphatic surgery and requires subsequent skin coverage.

The lumbar artery perforator flap receives its vascular supply from the L4 lumbar artery perforator and runs between the erector spinae and quadratus lumborum. Innervation is from the cluneal nerve. It is used as a secondary breast free flap option.

The groin flap receives its vascular supply from the superficial circumflex iliac artery and is used as a distant (non-microsurgical) flap for hand coverage.

The superficial circumflex iliac perforator flap is a thin, pliable flap with improved donor morbidity compared to the radial forearm flap.

The iliac crest osteocutaneous flap receives its vascular supply from the deep circumflex iliac artery and is used as an alternative bone flap in mandibular reconstruction, offering better vertical height than the fibula.

## Upper Extremity
The lateral arm flap receives its vascular supply from the posterior radial collateral artery and runs between the lateral triceps and brachialis. It is used in forearm and hand reconstruction as a thin fasciocutaneous free flap.

The reverse lateral arm flap receives its vascular supply from the radial recurrent artery and is used for elbow coverage as a pedicled flap.

The radial forearm flap receives its vascular supply from the radial artery and requires a normal Allen's test (intact palmar arch). It is a thin, pliable fasciocutaneous flap that can be innervated using the lateral antebrachial cutaneous nerve. It is used as a pedicled (anterograde) flap for elbow coverage, as a reversed flap for hand coverage (to the level of proximal interphalangeal joints), or as a free flap for head and neck reconstruction (e.g., hemiglossectomy defects) and phalloplasty.

The ulnar artery flap receives its vascular supply from the ulnar artery. It has less tendon exposure risk than the radial forearm flap but has a shorter pedicle and smaller diameter vessel.

The posterior interosseous artery flap receives its vascular supply from the posterior interosseous artery and runs between the extensor digiti minimi and extensor carpi ulnaris. It is used for hand and elbow coverage, though pedicle length limits its use as a free flap.

## Lower Extremity
The medial sural artery perforator flap receives its vascular supply from the medial sural artery perforator and is used for heel and Achilles coverage.

The sural artery flap receives its vascular supply from the lesser saphenous vein and sural nerve. It is used as a pedicled flap for heel and Achilles coverage.

The fibula bone flap receives its vascular supply from the peroneal artery. It is a segmental bone flap with a skin paddle from the posterior/lateral leg. It is used in mandibular reconstruction, and the donor site has increased ankle fracture risk.

The anterolateral thigh flap receives its vascular supply from the descending branch of the lateral circumflex femoral artery. Innervation is from the lateral femoral cutaneous nerve. It can be a muscle perforator or septocutaneous flap. It is a versatile flap with a long pedicle and large donor site, used in head and neck reconstruction, trunk reconstruction, and extremity coverage.

The profunda artery perforator flap receives its vascular supply from the 1st or 2nd perforator of the profunda femoris artery. Innervation is from the posterior femoral cutaneous nerve. It is used in perineal reconstruction and breast reconstruction, though prone positioning for flap harvest is a disadvantage.

The gracilis flap receives its vascular supply from the medial circumflex femoral artery. It is used in perineal reconstruction, breast reconstruction, and functional muscle transfer.

The tensor fascia lata flap receives its vascular supply from the ascending branch of the lateral circumflex femoral artery and is used in trochanteric coverage and abdominal-wall defects.

The rectus femoris flap receives its vascular supply from the descending branch of the lateral circumflex femoral artery and is used for pelvic and groin coverage.`
  },
  'hand-lower-extremity': {
    'hand-digit-trauma': `# Dislocations

## Thumb
The most common thumb dislocation occurs dorsally through the dorsoradial ligament. The CMC stabilizers include the volar oblique, ulnar collateral, intermetacarpal, dorsoradial (most important), posterior oblique, and anterior oblique (which prevents radial subluxation) ligaments. Thumb CMC dislocations occur with axial force and flexion of the wrist. Diagnosis is made with XR using anteroposterior and lateral views in 30 degrees of pronation.

## Finger dislocations
Proximal interphalangeal (PIPJ) joint dislocations can be simple (reducible) or complex (irreducible due to interposed soft tissue). Dorsal dislocations are most common and involve interposition of the volar plate, while volar dislocations involve interposition of the extensor tendon. The Elson test is used to assess central slip integrity.

Metacarpophalangeal (MCP) joint dislocations are rare and often complex due to volar plate interposition, requiring surgical treatment. Volar dislocations have higher risk of digital nerve injury, while dorsal dislocations prevent volar plate repair.

# Phalangeal and Metacarpal Fractures

## Bennett fracture
Bennett fracture is a thumb metacarpal base intra-articular fracture. It is reduced with axial traction, pronation, and palmar abduction.

## 5th metacarpal neck (Boxer's) fracture
This fracture can tolerate up to 70 degrees of angulation. Treatment includes buddy tapes (ring to small finger) with active range of motion. Surgery is most commonly indicated for malrotation.

## Metacarpal fractures
Interosseous muscles are most likely to incarcerate in the fracture line. Open fractures with minor soft tissue injury can be irrigated, closed, and splinted in the ER with short-course antibiotics and outpatient follow-up. Treatment options include multiple operative techniques such as pinning, plating, intramedullary screw fixation, and lag screw. Lag-screw fixation is used for oblique fractures and allows primary bone healing.

## Proximal interphalangeal joint (PIPJ) fracture/dislocation
For simple, stable fractures involving less than 30% of the joint surface, diagnosis involves assessing stability of the joint with up to 30 degrees of PIPJ flexion. Treatment includes extension-block splinting or pinning (maintaining in slight flexion). Pilon base fractures and unstable fractures require dynamic external fixation. Fractures involving 30-50% of the volar base are treated with hemi-hamate arthroplasty or volar plate arthroplasty.

# Ligament Injuries

## Intrinsic-plus splint position
The intrinsic-plus splint position involves the wrist extended at 30 degrees, metacarpophalangeal joints (MCPJs) flexed at 75-90 degrees, and interphalangeal joints (IPJs) extended at 0 degrees. This position maintains the MCPJ collateral ligaments at full length.

## Intrinsic tightness
Intrinsic tightness is demonstrated when passive flexion of the proximal interphalangeal joint (PIPJ) is tight with the MCPJ hyperextended. Extrinsic tightness is demonstrated when PIPJ flexion is tight with the MCPJ flexed.

## Ulnar collateral ligament injury
Ulnar collateral ligament injury causes instability of the thumb MCPJ with radial-directed force. Symptoms include weakness and pain with pinch tasks. Diagnosis is made by finding increased laxity greater than 30 degrees with radial-directed stress to the thumb compared to the contralateral thumb, along with stress view XR. Ultrasound or MRI can evaluate for Stener lesion (UCL retracted into adductor muscle). First-line treatment is splinting. Ulnar collateral ligament reconstruction is indicated for failure of non-operative treatment or presence of Stener lesion.

# Digit Reconstruction

## Thumb reconstruction
The thumb accounts for 40-50% of overall hand function, so functional reconstructions are preferred. Volar defects are reconstructed with first dorsal metacarpal artery flap (for larger defects) or Moberg flap (for defects less than 1.5cm, up to 2cm with islandization). Combined volar and dorsal defects at the proximal phalanx level are treated with great toe wraparound flap. For total thumb reconstruction, toe-to-thumb transfer is performed when the CMC and metacarpal base are present, while pollicization is performed when the CMC or metacarpal base is absent. First webspace contracture is treated with Z-plasties (four-flap) or skin grafts for skin-only involvement, and flap coverage (e.g., posterior interosseous reverse flap) for involvement of deep structures.

## IPJ arthroplasty
Silicone arthroplasty improves pain but not motion.

## Fillet of finger flaps
Fillet of finger flaps are useful to provide coverage and reduce returns to the operating room. They should be considered when there is otherwise unsalvageable bone stock of an injured finger.

## Nailbed injuries
The germinal matrix produces the nail, while the sterile matrix is adherent to the nail. For large subungual hematomas or lacerations, acute treatment involves nail bed repair (2-octyl cyanoacrylate has similar outcomes and is less time-consuming than suture repair). Chronic treatment options include split-thickness nail matrix graft from the toe or nail ablation. Hook nail is a soft tissue defect from loss of distal sterile matrix with inadequate bone and soft tissue support for the nail, treated by releasing the scar with soft-tissue augmentation or excision of the distal sterile matrix. Nail ridging from untreated nail bed injury is treated by attempting direct closure of the nail bed at re-repair.

## Fingertip Injuries
Secondary intention healing is appropriate for wounds less than 1.5cm with no exposed bone. Treatment includes moist wound healing with petroleum jelly. This approach provides better sensation than flaps or skin grafts but is associated with longer healing time.

## Finger soft-tissue reconstruction
Cross-finger flaps use dorsal skin from an adjacent digit to cover a volar wound. Reverse cross-finger flaps use dorsal skin from an adjacent digit to cover a dorsal wound.`,

    'hand-nerves': `# Anatomy

## Brachial plexus
The upper roots (C5-7) control proximal functions including shoulder function and elbow flexion. Injury presents with shoulder adducted and internally rotated, elbow extended, forearm pronated, and fingers flexed. The lower roots (C8-T1) control distal functions of the wrist and hand.

The posterior cord gives rise to the axillary nerve (from upper roots C5-C6), which innervates the deltoid for shoulder abduction and some of the triceps. The C7 root contributes innervation to the triceps. The radial nerve (from lower roots C8 to T1) innervates wrist and digital extension and some of the triceps.

The lateral cord gives rise to the musculocutaneous nerve (from upper roots C5-7), which innervates the biceps and brachialis for elbow flexion.

The medial cord gives rise to the median nerve, which innervates thumb intrinsics, flexor carpi radialis (FCR), flexor pollicis longus (FPL), flexor digitorum superficialis (FDS), flexor digitorum profundus (FDP) to the index and middle fingers, and pronator teres. The ulnar nerve innervates the hand intrinsics (interossei), flexor carpi ulnaris (FCU), and FDP to the ring and small fingers.

## Superficial nerves
The medial antebrachial cutaneous nerve follows the basilic vein on the ulnar aspect of the forearm. The lateral antebrachial cutaneous nerve follows the cephalic vein on the radial aspect of the forearm and is a branch of the musculocutaneous nerve. The intercostobrachial nerve innervates the medial upper arm and pierces through the serratus anterior. The dorsal sensory branch of the ulnar nerve supplies dorsal and ulnar hand sensation. The saphenous nerve innervates the medial malleolus and travels with the greater saphenous vein.

# Compression Neuropathies

## Carpal tunnel syndrome
Carpal tunnel syndrome presents with numbness to the thumb, index, and middle fingers that is worse at night and can progress to affect the thumb intrinsic and thenar muscles. Diagnosis is made clinically or with electrodiagnostic testing. Nerve conduction studies show median nerve sensory peak latency greater than 3.5ms and motor latency greater than 4.5ms. Ultrasound or MRI demonstrates increased cross-sectional area of the median nerve. Approximately 10% of bilateral carpal tunnel cases are associated with amyloidosis, diagnosed by congo red stain on tenosynovium biopsy. Treatment for mild cases includes night splinting, and corticosteroid injection provides short-term relief. Carpal tunnel release is indicated for symptoms lasting more than 3 months or failure of conservative measures, with no long-term difference between open and endoscopic approaches.

## Cubital tunnel syndrome
Cubital tunnel syndrome presents with ring and small finger numbness that can progress to finger weakness due to involvement of the finger intrinsics. The Froment sign is elicited by pulling paper from a patient who is pinching and observing compensation with thumb flexion (FPL). Diagnosis is made clinically or with electrodiagnostic testing showing velocity decrease of approximately 10m/s around the elbow. Initial treatment includes an elbow extension splint. Surgical treatment involves cubital tunnel release in situ, with anterior transposition (submuscular or subcutaneous) performed for ulnar nerve subluxation or recurrence. Areas of compression include the Osbourne ligament (near the medial epicondyle), medial intermuscular septum and arcade of Struthers in the upper arm, FDP heads in the forearm, and anconeus epitrochlearis (a congenital anomalous muscle in the medial elbow).

## Guyon's canal
Guyon's canal is the third most common compressive neuropathy site and the second most common ulnar nerve compression site. Its borders include the hypothenar muscles, transverse carpal ligament, volar carpal ligament, and pisiform.

## Anterior interosseous nerve syndrome
Anterior interosseous nerve syndrome is a motor-only condition that affects the FPL and FDP to the index finger.

## Pronator/lacertus fibrosis compression
This compression affects both motor and sensory functions of the median nerve at the forearm. It includes anterior interosseous nerve weakness and thumb intrinsic weakness.

## Radial tunnel syndrome
Radial tunnel syndrome presents with lateral forearm pain. Diagnosis is made by finding tenderness 5cm distal to the lateral epicondyle without motor symptoms. MRI can confirm the diagnosis.

## Posterior interosseous palsy
Posterior interosseous palsy is diagnosed by finding an intact tenodesis effect (indicating intact tendons) with no active extension of the digits.

## Superficial branch of radial nerve compression
This compression presents with numbness over the dorsal thumb and index finger. Initial treatment includes splinting and rest. Surgical treatment involves releasing the fascia between the brachioradialis and extensor carpi radialis longus (ECRL), where the nerve pierces the ECRL at 8cm proximal to the radial styloid.

# Nerve Injuries

## Sunderland classification
The Sunderland classification grades nerve injuries: Grade I (neurapraxia) involves segmental demyelination; Grade II (axonotmesis) involves mild intrafascicular injury; Grade III involves moderate axonotmesis; Grade IV involves severe axonotmesis; Grade V (neurotmesis) involves complete transection of the nerve; Grade VI involves mixed components.

## Electrodiagnostic testing
EMG may show changes as early as 10 days from injury. Complete denervation shows positive sharp waves, fibrillation potentials, and decreased motor unit recruitment. Nerve recovery is indicated by nascent potentials.

## Brachial plexus injury
MRI should be performed a few weeks after injury to evaluate for root avulsions. Nerve root injury can affect the diaphragm (C3-5). Nerve transfers are indicated if there is no functional or EMG recovery at 3-6 months.

## Radial nerve injury
Following radial nerve injury, early reinnervation occurs in the brachioradialis and extensor carpi longus and brevis (ECRL, ECRB). The last muscle to reinnervate is the extensor indicis proprius.

## Ulnar nerve injury
The ulnar nerve innervates the FDP to the ring and small fingers and FCU proximally in the forearm, and the digital intrinsic muscles distally in the hand. Injury causes weak digital abduction and adduction and weak thumb adduction (adductor pollicis).

## Complex regional pain syndrome
Complex regional pain syndrome presents with burning pain and stiffness. Risk factors include smoking and female sex. Examination reveals shiny, swollen, warm skin with hypersensitivity. EMG and NCS are normal, while bone scan shows increased uptake in the affected area. The pathophysiology involves changes to C nerve fibers. Type I has no identifiable nerve injury, while Type II has an identifiable nerve injury.

## Parsonage-Turner syndrome
Parsonage-Turner syndrome is an acute brachial neuritis that can occur after viral infection. Diagnosis is made by finding multiple peripheral nerves involved on EMG/NCS and hourglass constriction of the brachial plexus on MRI.

# Nerve Repairs

## Repair and reconstruction
Tension-free coaptation is the most important technical factor. Nerve grafts are used for gaps greater than 1cm. Common nerve autografts include the sural, lateral antebrachial cutaneous, and medial antebrachial cutaneous nerves. Age is the most predictive factor of outcome, and more distal injuries have more favorable outcomes than proximal injuries. Nerves regenerate at approximately 1mm per day and can reinnervate muscle 12-18 months from injury.

## Nerve transfers
Nerve transfers are considered when the distance from injury to motor end plates makes reinnervation unlikely. The anterior interosseous (intrinsic) nerve transfer is used to reestablish hand intrinsic function after proximal ulnar nerve injury (around the elbow). The anterior interosseous nerve from the pronator quadratus is transferred to the ulnar motor branch at the distal forearm. The ulnar nerve topography at the distal forearm follows a sensory/motor/sensory pattern. For elbow flexion nerve transfer, the FCU fascicle of the ulnar nerve is transferred to the brachialis (Oberlin transfer), with or without the FCR fascicle of the median nerve to the biceps branches (McKinnon modification).

## Free functional muscle transfer
Free functional muscle transfer has a role in complete plexopathy and uses extra-plexus donor nerves such as the spinal accessory or intercostal nerves. The spinal accessory nerve runs in the posterior triangle of the neck and innervates the sternocleidomastoid and trapezius muscles. The gracilis flap is most commonly used to restore elbow flexion.

## Neuroma in continuity
Treatment involves excision and repair with nerve graft.

# Tendon Transfers

Tendon transfers require supple joints, soft tissue equilibrium, a donor of adequate excursion, adequate strength donor, expendable donor, straight line of pull, synergy, and single function per transfer. Common tendon transfers include pronator teres (PT) to extensor carpi radialis brevis (ECRB), flexor carpi radialis (FCR) to extensor digitorum communis (EDC), and flexor digitorum superficialis IV (FDS IV) to extensor pollicis longus (EPL).

## Targeted muscle reinnervation
Targeted muscle reinnervation (TMR) involves major peripheral nerve to selective motor branch nerve transfer. Synergistic transfers are selected, such as median nerve to flex digits. TMR decreases phantom pain and improves the ability to use myoelectric prosthetics. It is billed as a pedicled nerve transfer. Primary TMR is performed at the time of amputation. Secondary TMR is performed after amputation for pain or phantom sensation; pain is initially worse for the first 6 weeks, then plateaus and decreases over the following 6 months.

## Myoelectric prosthesis
Myoelectric prostheses sense surface EMG signals. Targeted muscle reinnervation creates stronger signals and allows more complex motions than body-powered prostheses. For synergistic function in above-elbow amputation, the median nerve is transferred to the biceps (short head) for hand closure.`,

    'hand-tendons': `# Flexor Tendons

## Exam
The flexor digitorum superficialis (FDS) actively flexes the proximal interphalangeal joint (PIPJ) and is tested with other digits in extension. At the wrist level, the middle and ring finger tendons lie volar to the index and small finger tendons. The small finger FDS is absent in approximately 15% of people.

The flexor digitorum profundus (FDP) actively flexes the distal interphalangeal joint (DIPJ) and is tested with other digits in extension. The Linburg-Comstock anomaly is a congenital adhesion between the FPL and FDP to the index finger proximal to the carpal tunnel.

The tenodesis effect is assessed by passively extending the wrist and observing the digital cascade for abnormalities.

The lumbrical muscles actively flex the MCPJ. They originate from the FDP in the proximal palm and insert on the radial lateral band.

## Injuries
There are 5 flexor zones from distal to proximal: Zone I is distal to the FDS insertion, Zone II is between the FDS insertion and the A1 pulley/distal palmar crease, Zone III is between the A1 pulley and carpal tunnel, Zone IV is the carpal tunnel, and Zone V is the forearm.

## Zone II
Treatment involves repair within 2 weeks. The strength of repair is related to the number of core strands, suture size, use of locking suture, and suture location (which should be dorsal). One-centimeter bites are the optimal suture distance for repair. Repair of one FDS slip is associated with decreased tendon resistance compared to repairing both FDS slips.

Post-operative care includes occupational therapy for 3-6 months. Early active motion begins the first few days after repair, with the same rupture risk but better range of motion compared to other protocols. The modified Duran early passive motion protocol typically does not start active motion until 3-4 weeks after repair.

## Staged flexor tendon repair
Staged repair is necessary after more than 2 weeks from injury or with significant damage to pulleys, as attritional changes occur to the flexor tendon over time.

Two-stage reconstruction involves Stage 1, where a silicone rod is placed from the DIPJ to the central palm or distal forearm, allowing the capsule to recreate the pulley system over 12 weeks. Stage 2 involves exchanging the silicone rod for a tendon autograft.

The Paneva-Holevich variation involves suturing the FDS to the FDP and placing the silicone rod distally at Stage 1, then using the FDS as the tendon autograft to the distal FDP stump at Stage 2.

## Secondary flexor tendon surgery
Secondary surgery, such as tenolysis, requires passive motion greater than active motion and stable soft tissues. It should be performed at least 6 months after initial repair.

## Partial lacerations
Conservative therapy can be trialed for up to 90% lacerations unless there is triggering.

## Jersey finger
Jersey finger is a flexor zone I (FDP) distal rupture. The classification includes Type I (avulsion to palm), Type II (retraction to PIPJ with bone segment), Type III (retraction to DIPJ with bone segment), Type IV (fracture with tendon avulsion), and Type V (comminuted distal phalanx fracture). Type I injuries should be repaired within 1 week, while Types II and III should be repaired within 3 weeks.

## Pulley injuries

### A1 pulley
Odd-numbered pulleys originate from the volar plate. Stenosing tenosynovitis (trigger finger) presents with a flexed posture of the digit that is usually manually reducible. Risk factors include diabetes. Treatment includes steroid injection, with A1 pulley release indicated for recurrent or advanced disease. Surgery should be delayed 12 weeks after steroid injection.

### A2 pulley
The A2 pulley arises from bone. At least 50% of the pulley is needed to prevent tendon bowstringing. Closed rupture of the pulley is associated with rock climbing positions and is treated with rest, ice, and ring splinting. Tendon autograft pulley reconstruction may be needed for severe injuries.

# Extensor Tendons

## Anatomy
There are 8 extensor zones that progress from distal to proximal, with odd zones over joints and even zones over bones. Zone VII is the extensor retinaculum, and Zone VIII is the forearm. The extensor indicis proprius (EIP) has the most distal forearm muscle belly of the extensor tendons.

## Exam
Central slip (extensor zone III) injury affects the main tendon for PIPJ extension. The Elson test is diagnostic: the patient cannot actively extend the DIPJ when the MCPJ and PIPJ are flexed if the central slip is intact (due to lateral bands), but can extend the PIPJ (due to intrinsics). Treatment includes PIPJ extension splinting for 4-6 weeks or surgical repair.

For intubated or non-cooperative patients, assess the tenodesis effect by passively flexing the wrist and observing digital extension.

## Injuries

### Zone III-V lacerations
Treatment includes repair and relative motion extension splinting, which provides better motion outcomes compared to traditional splint and motion protocols.

### Proximal interphalangeal joint flexion contracture
The Bunnell test is used to assess intrinsic and extrinsic tightness. Treatment includes release of the volar plate and checkrein ligaments.

### Boutonniere deformity
Boutonniere deformity results from central slip injury causing the PIPJ to flex and DIPJ to extend in a collapse pattern. It can be traumatic or inflammatory. Diagnosis is made by finding loss of active IPJ extension against force and an abnormal Elson test. Treatment includes splinting with the PIPJ extended and the DIPJ free.

### Swan neck deformity
Swan neck deformity causes the PIPJ to extend and the DIPJ to flex (extensor lag). It most commonly results from distal phalanx injury with nonunion (bony mallet), followed by zone I extensor tendon injury (soft tissue mallet).

For acute or subacute mallet finger (extensor zone I), treatment includes splinting in extension for 6-8 weeks. Pinning the DIPJ in extension is indicated if the patient is unable to tolerate splinting or has volar subluxation of the distal phalanx.

### Sagittal band injury
The sagittal band maintains the position of the extensor tendon over the metacarpal head. Symptoms include swelling and inability to extend the MCPJ from a flexed position. Treatment includes relative extension splinting for acute injuries with direct repair, or reconstruction for chronic injuries.

### Extensor pollicis longus rupture
This injury causes inability to extend the thumb IPJ or retropulse the thumb. The EPL is located in the 3rd extensor compartment, ulnar to Lister's tubercle in the distal radius. Attritional ruptures can occur with closed management of non-displaced distal radius fractures. Treatment is tendon transfer of the EIP to the extensor pollicis longus.

### 1st extensor compartment tendinopathy (De Quervain's)
De Quervain's tenosynovitis presents with radial styloid pain, swelling of the radial and distal forearm, and pain that worsens with thumb movements. The Eichhoff test demonstrates pain at the radial styloid with ulnar deviation of the wrist while the thumb is flexed in the palm. Treatment includes steroid injection, immobilization, and surgical release. Non-surgical treatment is less effective when a septum exists between the abductor pollicis longus and extensor pollicis brevis.

### Intersection syndrome
Intersection syndrome presents with pain 4-5cm proximal to Lister's tubercle, swelling, and worsening with wrist extension. Treatment includes splinting and steroid injection, with 2nd extensor compartment release for refractory cases.

### Lumbrical-plus deformity
Lumbrical-plus deformity causes paradoxical extension of the IPJ with active flexion of the remaining digits. It is caused by shortening of the FDP and lumbrical muscle.`,

    'replantation-vascular': `# Replantation

Table saws are the most common cause of digital amputation in adults. Relative indications for replantation include thumb amputation, pediatric patients, multiple digit amputations, flexor zone I injuries, and proximal amputations (e.g., wrist, forearm). Relative contraindications include ring avulsion injuries, single-digit flexor zone II injuries, and multi-segmental injuries.

## Timing of replantation
Digits have no muscle tissue and are more tolerant of ischemia. Cold ischemia time for digits is up to 24 hours (with case reports of longer ischemic times), and warm ischemia time is up to 12 hours.

Proximal amputations have shorter ischemia tolerances. Cold ischemia time is 12 hours, and warm ischemia time is 6 hours. Consider arterial shunts to restore blood flow within 6 hours, and it may be necessary to prioritize reperfusion over bony stabilization depending on time from injury. Muscle tissue is most susceptible to ischemia.

## Repair
Surgical options include digit-by-digit sequence (completing one digit at a time) versus structure-by-structure approach (completing all bone, then all tendon, then all microsurgical repairs). The mechanism of injury is the most important favorable factor, followed by the number of veins repaired. Better outcomes are achieved at high-volume centers. Vein grafts should be used for large gap arterial injuries greater than 2cm.

## Prostheses
For forearm-level amputation, wrist disarticulation preserves forearm rotation. Transradial amputation provides better prosthetic fitting but requires at least 5cm of ulna length distal to the elbow to fit a prosthesis.

# Other Vascular Diseases

## Hypothenar hammer syndrome
Hypothenar hammer syndrome presents with ischemic changes to the ring and small fingers, cold sensitivity, coolness, finger ulceration, and distal embolization. Diagnosis is made with digital-brachial index (less than 0.7 is abnormal, and less than 0.5 is associated with tissue loss) and angiogram showing a tortuous ulnar artery at the proximal hand level. First-line treatment for mild cases includes aspirin and calcium-channel blockers. Surgical treatment involves ulnar artery segmental resection with vascular reconstruction for moderate to severe symptoms, or ligation if the fingers are adequately perfused.

## Acute upper extremity arterial embolism
Diagnosis is made with Doppler ultrasound, CT or MR angiography, or formal angiography. First-line treatment is heparin infusion, followed by surgery if the clot is in an amenable location.

## IV extravasation
Surgical indications include full-thickness skin necrosis, chronic ulceration, persistent pain, or exposure to known caustic agents (e.g., certain chemotherapeutics).

## Pseudoaneurysm
Pseudoaneurysm presents as a pulsatile, rapidly enlarging mass. Small pseudoaneurysms can be treated with interventional radiology, while larger ones require surgical exploration and vessel repair.

## Supracondylar humerus fractures
Supracondylar humerus fractures are associated with distal ischemia from brachial artery involvement. Treatment includes closed reduction with reassessment of pulses. If pulses do not return, angiographic imaging is indicated.

## Brachial arterial line
Brachial arterial lines are most commonly associated with median nerve injury.

# Other Hand Emergencies

## High-pressure injection injury
High-pressure injection injuries involve paint solvents or oils at pressures greater than 2,000 psi. These can cause vascular compromise, severe damage to soft tissues, compartment syndrome, and infections. X-ray is obtained if radiopaque material was injected. Treatment requires emergent debridement. The amputation rate is high (30%) and worsens with treatment delays.`,

    'wrist-forearm-injuries': `# Carpal Injuries

## Scaphoid fracture
The scaphoid fracture is the most common carpal fracture. Diagnosis is made by anatomic snuff box tenderness. X-ray with scaphoid view (wrist in 20 degrees of ulnar deviation and 20 degrees of extension) is obtained, and MRI is the best test for occult fractures or to evaluate for union.

Distal pole fractures are treated with casting for 6-12 weeks or surgery for displacement, which allows faster return to activities. Waist and proximal pole fractures should be considered for screw fixation. Due to retrograde blood supply, the proximal pole is most prone to nonunion. Scaphoid nonunion advanced collapse (SNAC) is an arthritic pattern resulting from scaphoid nonunion, treated with scaphoidectomy and 4-corner fusion or proximal row carpectomy.

## Hamate
Hook of hamate fractures present with ulnar nerve symptoms, pain, and flexor tendon injuries causing decreased grip strength. The small finger flexor is the most common tendon to rupture. Diagnosis is made with X-ray (carpal tunnel view) or CT scan.

## Wrist ligament injuries

### Scapholunate ligament injuries
Scapholunate advanced collapse (SLAC) is an arthritic pattern that starts as a dorsal intersegmental instability (DISI) deformity, where the scaphoid flexes and the lunate extends. Arthritis develops in the proximal row first, then progresses to the midcarpal joints (radioscaphoid, scaphocapitate, capitolunate, then radiolunate). Diagnosis is made by X-ray showing a scapholunate gap greater than 3mm, scapholunate angle greater than 70 degrees on lateral view, or comparison with the contralateral side using clenched fist view (axial loading of the wrist). Arthroscopy is the most accurate diagnostic test. Treatment includes scaphoidectomy with four-corner fusion or proximal row carpectomy.

### Lunate dislocation
The Mayfield classification describes the predictable progression of intrinsic ligament injuries: Stage I is scapholunate ligament injury, Stage II is lunocapitate ligament injury, Stage III is lunotriquetral ligament injury, and Stage IV is volar dislocation of the lunate out of the fossa. The short radiolunate ligament generally remains intact.

Symptoms include acute median nerve sensation changes (acute carpal tunnel syndrome). Diagnosis is made by X-ray showing changes in Gilula's lines on PA view, and a spilled teacup sign or volar lunate position on lateral view. Treatment includes immediate closed reduction followed by ORIF with or without carpal tunnel release (urgent if irreducible or persistent median-nerve symptoms after reduction). This preserves 65-70% of wrist flexion and extension and 80% of grip strength compared to the uninjured side. X-ray may show post-traumatic arthritis.

### Volar intersegmental instability (VISI)
In VISI, the triquetrum extends and the lunate flexes.

## Distal radius fractures
Short-arm and long-arm casting have similar functional and radiographic outcomes, with less shoulder pain when using short-arm casts.

# Wrist Kinematics

In the proximal row, the scaphoid flexes the wrist and the triquetrum extends it, while the lunate keeps them neutral. The distal row allows dart thrower's motion (radial inclination in extension that moves to ulnar inclination in flexion). Ulnar variance is most accurately measured on lateral X-ray.

# Compartment Syndrome

## Acute
Acute compartment syndrome presents with severe pain and possible numbness. Risk factors include obtunded patients, crush injuries, and reperfusion injury (with TNF alpha release). Examination findings include pain with passive stretch, paresthesia, paralysis, pallor, and pulselessness (a late finding). Compartment manometry is diagnostic, with elevated compartment pressure greater than 30mmHg or within 30mmHg of diastolic blood pressure. Laboratory changes include hyperkalemia, metabolic acidosis, and hypocalcemia. Rhabdomyolysis can progress to acute kidney injury. Treatment is emergent compartment release.

## Chronic
Volkmann ischemic contracture is a chronic compartment syndrome that affects the deep volar compartment first. Treatment includes occupational therapy, surgical tendon lengthening for mild cases, flexor pronator slide for moderate cases, and superficialis to profundus transfer or free functional muscle transfer for severe cases.

# Elbow and Forearm Pathology

## Extensor carpi radialis brevis (ECRB) enthesopathy (lateral epicondylitis)
Lateral epicondylitis involves degenerative changes at the attachment of the ECRB to the lateral epicondyle. Diagnosis is made by lateral elbow tenderness with hyperextension of the middle finger (the ECRB inserts on the base of the third metacarpal). Treatment includes occupational therapy, activity modification, stretching exercises, corticosteroid injection, and surgical debridement, with similar outcomes regardless of treatment modality.

## Distal radioulnar joint instability
Distal radioulnar joint instability is associated with Essex-Lopresti and Galeazzi injuries that affect the interosseous membrane.`,

    'hand-tumors': `# Cysts

## Digital mucous cyst
Digital mucous cysts are secondary to distal interphalangeal osteoarthritis and can involve the nail fold. X-ray shows an osteophyte at the distal interphalangeal joint. Treatment involves excising the cyst cavity and removing the osteophyte.

## Ganglion cyst
Ganglion cysts most commonly occur on the dorsal wrist (approximately 60% of all ganglion cysts) originating from the scapholunate area. Volar cysts are also possible, most commonly from the radioscaphoid area. They characteristically wax and wane in size and transilluminate on examination. Treatment is excision, with approximately 50% recurrence risk.

# Benign Soft-Tissue Masses

## Glomus tumor
Glomus tumors most commonly occur in the subungual region. They present with a bluish appearance, severe pain with localized pressure, cold sensitivity, pinpoint sensitivity, and paroxysmal pain. Diagnosis is made with the cold-water test and by demonstrating pain decrease with inflation of a blood-pressure cuff. MRI shows the lesion as bright on T2-weighted images. Treatment is complete surgical excision.

## Giant cell tumor of tendon sheath
Giant cell tumor of the tendon sheath presents as a tan, multi-lobulated mass that does not transilluminate on examination. X-ray may show bone cortex invasion, and MRI demonstrates decreased T1 and T2 intensity. Pathology shows histiocytoid mononuclear cells. Treatment is marginal excision. These tumors can invade into the digital nerve and have a high recurrence rate.

## Extensor digitorum brevis manus
This anatomic variant occurs in 2-3% of the population. It is located near the radiocarpal joint just distal to the extensor retinaculum and does not transilluminate.

## Schwannoma
Schwannoma is the most common nerve tumor. It is a benign peripheral nerve tumor arising from glial cells with rare malignancy potential. On examination, it presents as a painless, smooth, non-adherent mass with a positive Tinel sign in the nerve distribution. Diagnosis is confirmed with MRI. Treatment is intrafascicular excision.

## Enchondroma
Enchondroma is the most common bone tumor of the hand. It is an abnormal cartilage deposit in bone that is prone to pathologic fractures. Rare syndromic associations include Maffucci syndrome (with venous malformations) and Ollier disease (which can progress to chondrosarcoma). Asymptomatic lesions are observed, while symptomatic lesions are treated with curettage and bone grafting.

## Giant cell tumors of the bone
Giant cell tumors of the bone are benign but locally aggressive. CT of the chest is obtained to evaluate for rare pulmonary metastasis. Early lesions are treated with curettage and bone grafting, while late lesions require resection and bone reconstruction.

## Osteoid osteoma
Osteoid osteoma is a benign bone tumor arising from osteoblasts. It presents with focal bony pain that is relieved by NSAIDs. Diagnosis is made with CT. Treatment is NSAIDs.

# Malignancies

## Melanonychia
Biopsy is indicated for streaks greater than 3mm that cross the eponychial fold due to the risk of acral lentiginous melanoma. Treatment includes wide local excision with local flap or FTSG reconstruction, with amputation for advanced cases. Prognosis is related to tumor stage.

## Soft-tissue sarcomas
Soft-tissue sarcomas can occur in the upper or lower extremity. Diagnosis is made with imaging or incisional biopsy (using a longitudinal incision). Histopathology shows anaplastic cells. Treatment includes wide local excision with margins of 1cm or more and radiation therapy for limb salvage. Amputation to above the nearest proximal joint is considered for advanced cases or older patients. Routine lymph node sampling is not performed unless there is clinical evidence of nodal involvement.

## Bony sarcomas
Chondrosarcoma is the most common malignant non-skin tumor of the hand, though squamous cell carcinoma is the most common overall. Osteosarcoma can metastasize to the lung.

## Nerve tumors
Malignant peripheral nerve sheath tumors metastasize to the lung.`,

    'hand-inflammation-infections': `# Osteoarthritis

## Thumb carpometacarpal (CMC) arthritis
Thumb CMC arthritis is the most common site of hand arthritis. Diagnosis is made with X-ray. The Eaton classification stages the disease, though symptoms do not correlate with imaging: Stage I shows joint space narrowing, Stage II shows small osteophytes, Stage III shows large osteophytes, and Stage IV shows collapse changes involving the scapho-trapezoid-trapezium (STT) joint. The Eaton stress view (thumbs pushed together) assesses laxity and subluxation, while the Roberts view (hyperpronated thumb) evaluates the trapeziometacarpal joint.

Treatment includes trapeziectomy. Ligament reconstruction with tendon interposition (LRTI) is commonly performed but is associated with a higher complication rate than trapeziectomy alone. The thumb metacarpophalangeal joint (MCPJ) hyperextends to compensate for advanced collapse, and MCPJ hyperextension greater than 30 degrees requires correction with MCPJ fusion.

## Scaphotrapeziotrapezoidal (STT) arthritis
STT arthritis can occur in isolation or with CMC arthritis. It is differentiated from CMC arthritis by the absence of axial thumb pain or subluxation of the thumb. Diagnosis is made with X-ray. Treatment includes occupational therapy and steroid injection, with STT arthrodesis for refractory cases.

## Flexor tendon rupture
Attritional flexor tendon rupture results from radiocarpal arthritis. Imaging is used to assess for osteophytes. Treatment involves resecting the osteophyte and tendon graft reconstruction.

# Inflammatory Arthritis

## Rheumatoid arthritis
Rheumatoid arthritis can progress to advanced wrist arthritis, attritional extensor tendon ruptures, and digital deformities such as boutonniere and swan neck deformities.

Wrist collapse involves loss of carpal height and weakening of intrinsic ligaments, causing ulnar subluxation of the carpus and radial deviation of the metacarpals. The digits develop ulnar drift with attenuation of the radial sagittal bands.

Extensor tendon ruptures are attritional ruptures from chronic inflammatory tenosynovitis. Extensor pollicis longus rupture is the most common tendon rupture and occurs around Lister's tubercle. Caput ulna (Vaughan-Jackson syndrome) involves ruptures of the extensor digitorum communis and digiti minimi around the ulna due to arthritis, progressing from radial to ulnar. Treatment is Darrach procedure (distal ulna head resection) or Sauve-Kapandji procedure (distal radioulnar joint fusion) for arthritis without caput ulna.

Digital deformities include boutonniere deformity of the digits, where the PIPJ flexes and DIPJ extends due to PIPJ synovitis attenuating the central slip and stretching the volar plate, with lateral bands compensating through volar translocation. Treatment includes occupational therapy and splinting, with Fowler tenotomy (release of terminal extensor tendon) for surgical cases. Boutonniere of the thumb is due to MCPJ synovitis. Swan neck deformity causes the PIPJ to extend and DIPJ to flex, treated with occupational therapy and splinting, or spiral oblique retinacular ligament reconstruction.

## Gout
Gout is caused by deposition of crystals in joint spaces, commonly affecting the wrist and elbow. Diagnosis is made by finding negatively birefringent crystals on wrist aspirate. Treatment includes colchicine.

## Pseudogout
Diagnosis is made by finding positively birefringent crystals on wrist aspirate.

## Psoriatic arthritis
Psoriatic arthritis preferentially affects the DIPJ and nail bed.

# Other Inflammatory Conditions

## Raynaud's disease
Raynaud's disease is idiopathic peripheral vasoconstriction of the digits due to overactive alpha-2 receptors.

## Raynaud's phenomenon
Raynaud's phenomenon is associated with underlying rheumatologic disease, most commonly scleroderma or CREST syndrome. Symptoms include small, non-healing ulcers at the fingertips, color changes, and chronic pain. First-line treatment is calcium-channel blockers, followed by botulinum toxin. Botulinum toxin inhibits Rho/Rho kinase, decreases substance P secretion, and decreases C-fiber receptors. It is injected into the perivascular area at the distal palm. Wrist, arch, and digital sympathectomy is reserved for severe, intractable cases.

## Digital clubbing
Digital clubbing is due to increased vascular connective tissue.

## Dupuytren's contracture
Dupuytren's contracture is a progressive palmar fascia contracture with largely genetic etiology, caused by myofibroblasts. The central cord is a pretendinous cord extension that affects the metacarpophalangeal joint (MCPJ). The spiral cord is located at the proximal phalanx and displaces the neurovascular bundle volarly and centrally. The natatory cord affects the webspace. The retrovascular cord is dorsal to the neurovascular bundle at the DIPJ. PIPJ contracture is most associated with recurrence after surgical treatment.

Treatment options include clostridium histolyticum (CCH) injection, where the cord is injected and then broken 1-3 days later. Complications include skin breakdown (most common) and transient numbness. Needle aponeurotomy with or without fat grafting is another option, as fat grafting inhibits myofibroblast proliferation. Surgical aponeurectomy can be complicated by flare reaction and complex regional pain syndrome, which are treated conservatively.

# Infections

## Bacterial

### Fight bite
Fight bite occurs when a human tooth punctures the extensor hood of the MCPJ from punching someone. There is a high rate of deep infection (MCPJ septic arthritis) and extensor tendon injury. The most common organisms are group A streptococcus, Staphylococcus aureus, and Eikenella. Treatment includes amoxicillin/clavulanic acid, MCPJ exploration, and joint irrigation.

### Animal bites
Cat bites tend to cause deep puncture injuries, while dog bites tend to be avulsive. For unprovoked dog attacks, the dog's rabies vaccine status should be assessed and local authorities contacted. The dog should be quarantined and observed for 10 days if the rabies vaccine is up to date; otherwise, testing is needed. For rabies treatment, lacerations are repaired after immunoglobulin is injected into the wound. The most common organisms are Staphylococcus aureus and Pasteurella. Treatment includes antibiotics with incision and drainage, loosely closing wounds. First-line antibiotics are amoxicillin/clavulanic acid. Second-line options for penicillin allergy include clindamycin and TMP/SMZ. Third-line options include fluoroquinolones and doxycycline.

### Flexor tenosynovitis
Flexor tenosynovitis results from inoculation of the flexor tendon sheath by direct puncture or bacteremia. Diagnosis is made by identifying the Kanavel signs: diffuse swelling, flexed posture of the digit, tenderness over the flexor sheath (most specific sign), and pain with passive extension. Treatment includes antibiotics and irrigation of the flexor tendon sheath between the A1 and A5 pulleys.

### IV drug use
Staphylococcus (MRSA) is the most common organism in IV drug users. Treatment includes vancomycin.

### Deep-space hand infections
Deep-space infections can spread from radial to ulnar via the radial bursa communicating to Parona's space, then to the ulnar bursa (horseshoe abscess).

## Viral

### Human papilloma virus
HPV warts are the most common viral skin lesion in children, and most spontaneously resolve.

### Herpetic whitlow
Herpetic whitlow presents as a small vesicular rash that progresses to blisters. Diagnosis is made with Tzank smear and antibody titers. Treatment is observation, with antiviral therapy (acyclovir) if diagnosed within the first 72 hours.`,

    'congenital-pediatric-hand': `# Embryology

## Extremity development
Extremity development occurs during gestational weeks 4-8. The proximal-distal axis is established by the apical epidermal ridge, formed from FGFR proteins, with defects causing amelia. The anteroposterior axis is established by the zone of polarizing activity, with duplication causing mirror foot deformity. The radio-ulnar axis is formed from sonic hedgehog protein and is responsible for mirror hand deformity. The volar surface is formed by BMP and Engrailed-1. The dorsal surface is formed by Wnt7a leading to LMX1B expression, with nail-patella syndrome being an autosomal dominant LMX1B defect.

## Bone ossification
The clavicle and femur are the first long bones to ossify at 8 weeks.

# Diseases

## Syndactyly
Syndactyly is due to failure of apoptosis of the web spaces. It is classified as simple or complex (based on bone involvement) and complete or incomplete (based on skin involvement). Treatment involves surgical release using a dorsal flap for the webspace and full-thickness skin grafts for the digits. Surgery is performed at 1 year of age, releasing one webspace at a time.

## Polydactyly
Post-axial polydactyly involves the ulnar side. Pre-axial polydactyly involves thumb duplication and is classified using the Wassel classification (I to VII, with IV being most common). Numbering goes from distal to proximal. Odd numbers have a bifid bone, and even numbers have two independent bones at the same bony level. Type VII includes anything else not otherwise classified.

## Congenital trigger thumb
Congenital trigger thumb presents with the thumb IPJ held in flexion. Diagnosis is made by palpating a Notta nodule at the A1 pulley. Treatment is pulley release for fixed deformity in children older than 1 year.

## Amniotic-band syndrome
Amniotic-band syndrome is associated with cleft lip, body wall defects, equinovarus, and imperforate anus. Examination findings range from mild skin depression to severe proximal edema, with acrosyndactyly. The Patterson classification includes: Stage I (simple constriction ring), Stage II (constriction ring with lymphedema), Stage III (constriction ring with acrosyndactyly), and Stage IV (amputation at any level). Treatment involves surgical release of the band for worsening swelling or distal discoloration of the limb, with staged releases (one half at a time for circumferential bands). Edema improves within a few weeks.

## Congenital compartment syndrome
Risk factors include amniotic bands and oligohydramnios. Symptoms include unilateral edema and bullae formation. Treatment is compartment release.

## Camptodactyly
Camptodactyly is a painless proximal interphalangeal joint flexion contracture, most commonly affecting the small finger.

## Clinodactyly
Clinodactyly is painless radial inclination of the distal phalanx, most commonly affecting the small finger.

## Thumb hypoplasia
The Blauth classification guides treatment: Type I requires no treatment. Type II (mild) is treated with first-webspace deepening (e.g., 4-flap Z-plasty) and UCL repair for instability. Type IIIA has a stable carpometacarpal (CMC) joint and may be treated with flexor digitorum superficialis (FDS) tendon transfer to the ulnar collateral ligament (UCL) if needed. Type IIIB has an unstable CMC joint. Types IIIB, IV, and V are treated with pollicization, where the index finger is placed into the thumb ray position. The tendon transfers include: extensor indicis proprius to extensor pollicis longus, extensor digitorum communis to abductor pollicis longus, palmar interosseous to adductor pollicis, dorsal interosseous to abductor pollicis brevis, and flexor digitorum profundus to flexor pollicis longus.

# Trauma

## Pediatric fractures
Pediatric fractures can involve the epiphysis (growth plate). Salter-Harris fractures are epiphyseal fractures involving the growth plate: Type I affects the same level, Type II is above the growth plate, Type III is lower (into the joint), Type IV is through the growth plate and joint, and Type V is a compression or rest injury.

## Seymour fracture
Seymour fracture is an open epiphyseal fracture of the distal phalanx with nail bed transection, where the germinal matrix gets entrapped. Treatment includes irrigation and open reduction, with pinning if unstable.

## Pediatric supracondylar fractures
Pediatric supracondylar fractures are common in ages 5-7. Perfusion must be assessed, and if compromised, closed reduction is performed first. Mild cases are observed, and brachial artery exploration is performed if perfusion remains compromised after closed reduction.

## Amputations
Pediatric amputations are most common in males and are most commonly caused by crush injury in doors (with window crush being second most common).

# Congenital Syndromes

## Radial longitudinal deficiency
Most cases of radial longitudinal deficiency are associated with syndromes and can have thumb hypoplasia or absence.

## Fanconi's anemia
Fanconi's anemia presents with absent radius and sometimes thumb hypoplasia. It progresses to aplastic anemia at age 4-5, which can be life threatening. Diagnosis involves CBC followed by chromosomal breakage testing. Treatment includes referral to a hematologist.

## Thrombocytopenia/absent radius
Diagnosis involves CBC.

## Holt-Oram syndrome
Holt-Oram syndrome is autosomal dominant and presents with radial longitudinal deficiency and cardiac abnormality (VSD).

## VACTERL
VACTERL association includes vertebral, anorectal, cardiac, tracheo-esophageal, renal, and limb abnormalities. Diagnosis involves renal ultrasound.

# Pediatric Brachial Plexopathy

Pediatric brachial plexopathy is observed for approximately 6 months for development of upper extremity motor function. MRI is used to evaluate for nerve-root level injury.`,

    'lower-extremity': `# Anatomy

## Lower extremity nerves
The tibial nerve innervates the gastrocnemius, soleus, plantaris, popliteus, flexor digitorum longus, and flexor hallucis longus (FHL). It is tested by plantarflexion and sensation to the plantar surface of the foot.

The femoral nerve innervates the anterior thigh muscles and is tested by leg extension.

The obturator nerve innervates the medial thigh muscles and is tested by thigh adduction.

The peroneal nerve innervates the lateral and anterior compartments and is associated with proximal tibiofibular joint dislocation. Injury presents with absent dorsiflexion of the foot and loss of sensation to the lateral foot. Treatment includes nerve repair, nerve grafting, or nerve transfer of FHL (tibial nerve) to anterior tibialis for severe injury.

The medial plantar nerve is a continuation of the tibial nerve.

## Lower extremity muscles
The superficial posterior compartment contains the gastrocnemius and soleus, which are tested by plantarflexion.

The deep posterior compartment contains the toe flexors. The FHL is tested with flexion of the great toe.

The anterior compartment contains the anterior tibialis and toe extensors, tested by dorsiflexion and inversion.

The lateral compartment contains the peroneus muscles, tested by ankle eversion.

The plantaris tendon is located between the medial gastrocnemius muscle and soleus, medial to the Achilles tendon. It is used as a tendon autograft.

## Popliteal fossa
The popliteal fossa contains the popliteal artery, tibial nerve, and common peroneal nerve. It is bordered by the medial head of gastrocnemius, semimembranosus, lateral head of gastrocnemius, and biceps femoris.

## Toe anatomy
Toe perfusion has a dominant dorsal system in 70% of patients, plantar system in 30%, and equivocal in 10%. A lateral angiogram is obtained before toe-to-thumb transfer.

# Lower Extremity Trauma

## Fracture fixation
Bony stabilization increases with interfragmentary compression. Primary bone healing is achieved with compression plates, lag screws, and tension bands. Secondary bone healing occurs with intramedullary nailing, bridge plating, external fixation, and K-wires, which support relative stability.

## Open fractures
IV cephalosporin or equivalent is given within the first 3 hours and continued for 72 hours. Length is restored with reduction and splinting. Pulses must be assessed.

## Gustilo classification
Type I is a clean wound less than 1cm. Type II is a clean wound greater than 1cm. Type IIIA has adequate soft tissue for coverage. Type IIIB has inadequate soft tissue for coverage with periosteal stripping. Type IIIC has arterial injury requiring repair.

## Secondary bone reconstruction
The Masquelet technique is a two-stage reconstruction. Stage 1 involves antibiotic spacer placement, with 4-8 weeks allowed for pseudomembrane to form. Stage 2 replaces the antibiotic spacer with cancellous bone graft into the pseudomembrane.

The Ilizarov technique (bone transport) involves performing an osteotomy away from the fracture site followed by distraction osteogenesis. Bone forms by intramembranous ossification.

The Capanna technique uses a free fibula flap inside a bone allograft and is used for large-gap sarcoma bony reconstruction.

## Limb salvage
Risk factors for limb loss include popliteal artery injury and ankle/foot fractures. Ideally, soft-tissue coverage is achieved within 10 days from injury. Limb salvage can be performed with tibial nerve injury if the nerve is reparable. Traumatic amputations most commonly occur due to ischemia, with good functional outcomes in appropriately selected patients.

## Morel-Lavallée lesion
A Morel-Lavallée lesion is a soft-tissue fascial shear injury with intact skin that is prone to seroma and lymphatic disruption. MRI is used for chronic injuries. Treatment includes compression bandaging, percutaneous aspiration, and possibly sclerosing agents.

# Lower Extremity Reconstruction

## Flaps
Pedicled propeller flaps identify a subcutaneous perforator to an island of skin. The most common cause of failure is venous congestion from kinking.

Free tissue transfer options include muscle flaps, which fill dead space better, and fasciocutaneous flaps, which have decreased donor-site morbidity.

## Tissue Expansion
Lower extremity tissue expander placement has the highest complication rate in the body.

# Vascular Diseases

## Lower extremity
Peripheral arterial disease presents as claudication that progresses from rest pain to tissue loss. Diagnosis involves palpating pulses and Doppler examination. The ankle-brachial index is used: greater than 1 is normal, 0.7-0.9 indicates claudication, and less than 0.5 indicates rest pain and tissue loss. Toe-brachial index is used for non-compressible vessels in diabetes mellitus.

Venous insufficiency ulcers are treated with elevation and serial compression dressings (Unna boot).

Lymphedema is most commonly caused by obesity in the United States and filariasis infection worldwide. Staging includes: Stage 0 is clinically normal but identified on lymphoscintigraphy, Stage 1 is clinically apparent and improves with limb elevation, Stage 2 shows pitting edema that does not improve with elevation, and Stage 3 shows fibrosis of soft tissues.

Neuropathic foot ulcers that are non-infected and non-ischemic are treated with contact casting. Granulocyte-stimulating factor use is associated with decreased need for below-knee amputation. Medical honey draws fluid from deep to superficial by osmosis. Hyperbaric oxygen is indicated for exposed bone.

# Aesthetic

## Calf augmentation
Submuscular position for implant associated with lowest complication rate.`
  },

  // Section 3: Craniomaxillofacial
  'craniomaxillofacial': {
    'cleft-lip-palate': `## Cleft Lip and Palate

### Embryology, Epidemiology, and Genetics
Cleft lip occurs when the median nasal prominences fail to fuse, while cleft palate results from failure of the medial and lateral palatine processes to fuse.

The genetic risk varies with family history: when one sibling is affected, there is a 2.5% risk; with two affected siblings, the risk increases to 10%; and when a parent and sibling are affected, the risk is 17%. Van der Woude syndrome is autosomal dominant with a 50% transmission risk.

Cleft lip with or without palate occurs in approximately 1 in 700 births, with a male to female ratio of 2:1 and 15% being syndromic. Isolated cleft palate occurs in approximately 1 in 1500 births, with a male to female ratio of 1:2 and 50% being syndromic.

### Cleft Care
Cleft lip is typically repaired at 3-6 months of age to establish muscular continuity.

Cleft palate is repaired at approximately 1 year of age, with delayed repair associated with worse speech outcomes.

Velopharyngeal insufficiency (VPI) is treated with buccal musculomucosal flaps, sphincter pharyngoplasty (which has the highest risk of obstructive sleep apnea), or pharyngeal flap.

Alveolar bone grafting is timed with the eruption of the permanent canine, typically at age 8-12 years.

Orthognathic surgery with LeFort I osteotomy is performed for Class III malocclusion.

CHARGE syndrome is the second most common syndromic cleft, characterized by Coloboma, Heart defects, Atresia choanae, growth Retardation, Genital anomalies, and Ear abnormalities.`,

    'facial-fractures': `## Facial Fractures and Skull

### Fractures
Frontal sinus posterior table fractures carry a risk of CSF leak, which is diagnosed using beta-2 transferrin testing.

Orbital floor fractures are the most common orbital fracture. They are repaired for sizable defects or persistent diplopia. Entrapment is most common in pediatric patients and requires prompt repair.

Naso-orbito-ethmoid (NOE) fractures carry risk of telecanthus (classified by Markowitz), canalicular injury, and CSF leak.

Zygomaticomaxillary complex (ZMC) fractures are treated with 2-point fixation for simple fractures and 3-point fixation for complex fractures.

Skull base fractures are a contraindication to nasotracheal intubation.

### Reconstruction
Scalp reconstruction with exposed cranium requires a flap. Tissue expansion is placed between the galea and temporalis.

Cranioplasty is indicated for defects greater than 6 square centimeters. Materials include PEEK (with infection being the most common complication), methylmethacrylate (which is exothermic), and hydroxyapatite.

Positional plagiocephaly is treated with repositioning and helmet molding for patients older than 3 months.`,

    'facial-paralysis': `## Facial Paralysis

### Anatomy
The main trunk of the facial nerve is located 6-8mm distal to the tympanomastoid suture. The frontal branch travels along Pitanguy's line, extending from 0.5cm below the tragus to 1.5cm above the lateral brow.

### Etiologies
Bell's palsy resolves in 80-90% of cases and is treated with steroids if diagnosed early.

Möbius syndrome involves absence of cranial nerves VI and VII and is treated with temporalis transfer or free gracilis muscle transfer.

Parry-Romberg syndrome causes progressive hemifacial atrophy that typically starts in the late teens and is treated with methotrexate and volume replacement.

### Reanimation
Dynamic reanimation includes free muscle transfer (using cross-facial nerve graft versus masseteric nerve) and temporalis turnover.

Static reanimation uses autologous slings, which have the lowest complication rate.`,

    'ear-reconstruction': `## Ear Reconstruction

### Congenital
The external auditory canal develops from the 1st cleft. The helix develops from the 1st and 2nd arches (forming from 6 hillocks). Preauricular sinus results from incomplete fusion.

Congenital anomalies include microtia, cryptotia (where the upper third is adherent), Stahl ear (with an accessory 3rd crus), and lop ear.

### Reconstruction
Neonatal molding should be started by 2 weeks of age (up to 3 months), with skin ulceration being the most common complication.

Autologous reconstruction uses a rib cartilage framework, with the Nagata technique being 2-stage and the Brent technique being 3-stage.

The temporoparietal fascia (TPF) flap is based on the superficial temporal artery and is the workhorse flap for ear coverage.

For ear replantation, venous repair does not change success rates. Leech therapy is used if no vein anastomosis is possible.

### Aesthetic
Prominent ear is corrected with otoplasty at age 6-7 years. The Mustardé suture creates the antihelical fold, and the Furnas suture corrects the conchal-mastoid angle.`,

    'mandible-dental-orthognathic': `## Mandible, Orthognathic, and Dental

### Mandible Fractures
Parasymphyseal fractures are treated with ORIF with or without MMF. Angle fractures are treated with ORIF using an intra-oral approach. Condylar fractures are generally treated with closed reduction and MMF.

The Champy technique places fixation at the external oblique ridge. Reconstruction plates are used for load-bearing applications.

Free fibula flap is used for defects greater than 5cm or in the setting of radiation therapy.

### Tumors
Ameloblastoma is the most common mandibular tumor and is treated with segmental mandibulectomy.

Odontogenic keratocyst (OKC) is the second most common benign tumor and is associated with Gorlin syndrome (PTCH1 mutation).

Periapical cyst is the most common cyst and arises from necrotic pulp.

### TMJ
Temporomandibular disorder (TMD) is most common in women aged 20-40 and presents with pain on palpation of mastication muscles.

Masseteric hypertrophy is most commonly caused by bruxism and is treated with botulinum toxin.

### Orthognathic
Class II malocclusion is treated with bilateral sagittal split osteotomy (BSSO) for mandibular advancement.

Class III malocclusion is treated with LeFort I osteotomy for maxillary advancement.

Vertical maxillary excess ("gummy smile") is treated with LeFort I impaction.`,

    'head-neck-tumors': `## Head and Neck Tumors

### Embryology
The pharyngeal arches are innervated as follows: the 1st arch (CN V, mastication), 2nd arch (CN VII, facial expression), 3rd arch (CN IX, stylopharyngeus), 4th arch (CN X, pharyngeal and laryngeal muscles), and 6th arch (CN XI, SCM and trapezius).

### Oral Cancer
Squamous cell carcinoma requires neck dissection for T2 or larger tumors. Chyle leak is the most common complication (diagnosed with triglycerides greater than 110 mg/dL in the drain output).

Free flaps are used for reconstruction. For total laryngopharyngeal reconstruction, the ALT flap provides better speech while the jejunal flap has easier inset.

Oropharyngeal cancer associated with HPV has better outcomes.

### Glandular
The parotid gland accounts for 80% of salivary tumors, with 80% being benign.

Pleomorphic adenoma is the most common benign tumor (80% of benign tumors). Warthin tumors are cystic, bilateral, and associated with smoking.

Mucoepidermoid carcinoma is the most common malignant salivary tumor and the most common in children. Adenoid cystic carcinoma has a propensity for perineural invasion.

Minor salivary gland tumors are 50% malignant, most commonly occur in the palate, and adenoid cystic carcinoma is the most common type.

### Lip Reconstruction
Primary closure is used for defects up to one-third of the lip. Lip switch flaps (Abbe and Estlander) are used for defects involving one-third to one-half of the lip. Regional flaps (Karapandzic and Bernard-Webster) are used for defects involving more than one-half of the lip.`,

    'congenital-syndromes': `## Congenital Syndromes

### Craniosynostosis
Apert syndrome presents with bicoronal craniosynostosis, complex syndactyly, and is caused by FGFR2 mutations.

Crouzon syndrome presents with complex craniosynostosis and midface retrusion but normal extremities, and is caused by FGFR2 mutations.

Pfeiffer syndrome presents with cloverleaf skull, exorbitism, and broad thumbs, and is caused by FGFR2 mutations.

Saethre-Chotzen syndrome presents with bilateral coronal craniosynostosis, low-set ears, and ptosis, and is caused by TWIST mutations.

Sagittal craniosynostosis causes scaphocephaly and is treated with endoscopic surgery if diagnosed early or open vault surgery if diagnosed late.

### Cleft Syndromes
Treacher Collins syndrome presents with microtia, colobomas, cleft palate, and retrognathia, and is caused by TCOF1 mutations.

Robin sequence presents with cleft palate, micrognathia, and glossoptosis. Treatment includes prone positioning and mandibular distraction.

Van der Woude syndrome presents with lower lip pits and cleft palate, is caused by IRF6 mutations, and has a 50% transmission rate.

Velocardiofacial syndrome (22q11.2 deletion) presents with submucous cleft palate, cardiac anomalies, and hypocalcemia.

### Other
Goldenhar syndrome is the second most common congenital facial malformation and presents with hemifacial microsomia and epibulbar dermoids.

Beckwith-Wiedemann syndrome presents with macrosomia, omphalocele, and macroglossia, and involves chromosome 11.`,
  },
  'breast-cosmetic': {
    'breast-augmentation': `# Breast Augmentation

## Breast Implants

### Aesthetic ideal
The ideal upper pole to lower pole volume ratio is 45:55.

### FDA Approval
FDA approval is for patients older than 22 years for aesthetic indications. Breast implants carry a black box warning and require a specialized consent form.

### Choices in Augmentation Mammaplasty

Shell options include smooth and textured.

Filling options include saline and silicone. Modern cohesive silicone gels have less rippling and rupture. Increased cross-linking of silicone improves form stability but makes implants more prone to rotation.

Pocket selection options include subpectoral/dual plane (most common) and subglandular. Subpectoral placement should be performed if the upper pole pinch test is less than 2cm. Dual plane is used for pseudoptosis.

Incision selection options include inframammary fold (IMF), periareolar, and trans-axillary.

### Surveillance
MRI or ultrasound is performed at 5-6 years, then every 2-3 years to evaluate for silent rupture.

### Breast Cancer Screening
Mammography uses the Eklund view, which displaces the implant toward the chest and pulls the breast tissue anteriorly.

## Complications

Reoperation for size is the most common complication.

Capsular contracture is graded using the Baker system: Grade I is normal, Grade II is palpable, Grade III is visible, and Grade IV is painful. The most common cause is biofilm, a subclinical infection associated with indwelling medical devices. Biofilm forms due to an extracellular polymeric substance matrix that provides a surface for bacterial adherence. The slow bacterial growth rate reduces antibiotic efficacy. Risk is reduced with IMF incision, subpectoral placement, and textured implants. There is no evidence to support extended antibiotic courses for prevention.

Double capsule has oral contraceptives as a risk factor. It presents with painless enlargement that becomes firm years after implantation.

Double bubble presents as two transverse creases at the lower pole of the breast due to incomplete scoring or release of the former IMF when lowering it with an implant. Risk factors include a superiorly displaced native IMF. Treatment involves releasing superficial fascial attachments to skin.

Snoopy nose deformity occurs when the gland descends but the implant stays in place. Treatment is mastopexy.

Animation deformity is treated by changing from subpectoral to subglandular plane, with or without acellular dermal matrix or mesh.

Rupture is diagnosed with MRI.

Galactocele is a milk-filled cyst caused by lactiferous duct blockage.

Pneumothorax presents with shortness of breath and chest tightness and is diagnosed with chest x-ray.

Atypical mycobacterial infections are more common with cosmetic tourism, do not respond to antibiotics, and cause non-healing wounds. Diagnosis is made with acid-fast stain and mycobacterial culture. Treatment involves implant removal and debridement.

Breast-implant-associated ALCL (BIA-ALCL) is covered in the breast reconstruction section.

Breast implant illness presents with vague systemic symptoms including fatigue, brain fog, headaches, and anxiety. It is a clinical diagnosis with no definitive laboratory or imaging test, and workup for autoimmune disease should be considered. Treatment is explantation with widely variable reported outcomes. Capsulectomy studies do not show a difference in outcomes. Worse outcomes occur when there is known autoimmune disease.`,

    'breast-reduction-mastopexy': `# Breast Reduction and Mastopexy

## Embryology

### Ectoderm
The mammary ridge exists from axilla to inguinal region (milk line) and begins at week 5-6. The remaining ridge involutes during development.

Polymastia is accessory breast tissue due to incomplete mammary ridge involution that can occur in the axilla. It presents with swelling of the mass during menses, and diagnosis is made by finding glandular tissue in the lower dermis or fat on pathology.

Supernumerary nipple is an additional nipple due to incomplete involution of the ectodermal ridge along the milk line. Polythelia refers to more than 2 supernumerary nipples and is associated with renal cancers and kidney disease.

Amastia occurs when the mammary ridge is absent, with both breast and nipple absent. Amazia refers to absent breast tissue with the nipple present.

Inverted nipples result from failure of mesenchyme to proliferate.

### Epithelial Cells
Epithelial cells are responsible for development of lactiferous ducts.

### Mesoderm
The mesoderm is responsible for development of breast parenchyma.

## Breast Aging

### Puberty breast development
A surge of insulin-like growth factor 1 (IGF-1) from breast tissue stimulates the pituitary gland. Estrogen promotes duct growth, while progesterone promotes lobular development. Tanner staging is used for ages 8-13.

### Menopause
Menopause is characterized by decreased progesterone and estrogen. Breast involution involves replacement of parenchyma with fat. Cooper ligaments become lax, and decreased elasticity leads to increased ptosis.

## Breast Reduction

### Anatomic Considerations
The blood supply includes superior sources (internal mammary perforators accounting for 60%), lateral sources (lateral thoracic artery), medial sources (internal mammary perforators), and inferior sources (external mammary perforators).

Sensory innervation comes from intercostal nerves (lateral and anterior cutaneous branches). The nipple-areola complex (NAC) is supplied by T4 anterolateral and anteromedial branches.

### Planning
The ideal sternal notch to nipple distance is 19-21cm. The nipple to inframammary fold distance should be 5-7cm.

The Regnault ptosis classification includes: Grade 0 (no ptosis), Grade I (nipple at level of IMF), Grade II (nipple below IMF but above lower pole), and Grade III (nipple below lower pole, pointing downward). Pseudoptosis refers to the gland being below the IMF but the nipple remaining above.

### Pedicle Selection
The inferior pedicle is most commonly used. It maintains inferior blood supply and sensation, is better for large reductions, and can accommodate up to 1500g resection.

The superior pedicle provides better nipple projection, is good for moderate reductions (less than 1000g), and achieves better upper pole fullness.

The superomedial pedicle is based on internal mammary perforators and provides good projection and sensation.

The free nipple graft is used for massive reductions (greater than 1500g) or compromised vascularity but results in loss of sensation and inability to breastfeed.

### Incision Patterns
The Wise pattern (anchor/inverted T) is most commonly used, is better for larger reductions, and leaves a visible scar in the IMF.

The vertical (lollipop) pattern has better aesthetics with less scarring and is good for moderate reductions. Techniques include Lejour and Hall-Findlay.

The periareolar (Benelli) pattern has minimal scarring but allows limited resection and has higher risk of areolar spreading and nipple flattening.

### Complications
Nipple necrosis has risk factors including smoking, diabetes, large reduction, and tension. Treatment includes local wound care and observation for demarcation.

Fat necrosis presents as a firm mass with oil cysts and is diagnosed with mammography and ultrasound. Treatment is observation, with excision if symptomatic.

Infection is treated with antibiotics and drainage if an abscess is present.

Hematoma occurring early (less than 24 hours) requires evacuation, while late hematomas are observed.

Wound dehiscence is most common at the T-junction and is treated with local wound care and secondary closure if needed.

Hypertrophic scarring is treated with silicone, steroids, and revision.

Loss of sensation is usually temporary but can be permanent.

Inability to breastfeed is higher with free nipple graft and superior pedicle techniques.

## Mastopexy

### Indications
Mastopexy is indicated for breast ptosis without volume excess and can be combined with augmentation.

### Augmentation-Mastopexy
Single-stage procedures have a higher revision rate. Two-stage procedures involve performing mastopexy first, then returning later to perform augmentation.

## Benign Breast Diseases

### Fibroadenoma
Giant fibroadenoma is a single solitary mass with asymmetric, rapid enlargement of one breast. It presents as a firm, rubbery nodule and is diagnosed with ultrasound. Pathology shows epithelial and stromal proliferation.

### Juvenile breast hypertrophy
Juvenile breast hypertrophy involves breast enlargement greater than 3.3 pounds during puberty. Pathology shows stromal tissue hypertrophy.

### Phyllodes tumor
Phyllodes tumors are generally benign but have high recurrence and rare risk of metastasis. They present as a painless breast mass and are treated with wide surgical margins (greater than 1cm).

### Tuberous breast deformity
Tuberous breast deformity presents with hypomastia/asymmetry, elevated IMF, constricted base, and herniated/widened areola. Treatment includes periareolar radial scoring and tissue expander or implant.

### Symptomatic galactocele/galactorrhea
Galactorrhea presents with swelling of breasts and milky discharge without signs of infection or fever. It is thought to be secondary to breast denervation after surgery. Prolactin levels are measured for diagnosis. Treatment is bromocriptine (a dopamine agonist).

### Mondor disease
Mondor disease presents with superficial thrombophlebitis showing an erythematous, tender cord in the breast. It self-resolves in 4-6 weeks and is managed with NSAIDs for pain control.

## Breast Cancer Screening

### Palpable mass on exam
A palpable mass is evaluated with diagnostic mammography and ultrasound.

### Breast cancer screening prior to reduction
Screening mammography should be performed if the patient is older than 40.

### Occult breast cancer in reduction mammaplasty specimen
Occult breast cancer occurs in 0.4% overall, increasing to 5.5% with a personal history of cancer.`,

    'breast-reconstruction': `# Breast Reconstruction

## Breast Cancer Overview

### Mastectomy Types
Total (simple) mastectomy involves removal of breast tissue and nipple-areola complex while preserving the pectoralis major muscle.

Modified radical mastectomy combines total mastectomy with axillary lymph node dissection while preserving the pectoralis muscles.

Skin-sparing mastectomy preserves the breast skin envelope but removes the nipple-areola complex, providing better aesthetic outcomes.

Nipple-sparing mastectomy preserves the nipple-areola complex and breast skin. Relative indications include no ptosis, tumor less than 5cm, tumor more than 1cm from the nipple, and no multi-centric disease. Contraindications include axillary disease, lymphovascular invasion, and HER2/neu positivity on pathology. Nipple necrosis rate is associated with incision type, with lateral inframammary being lowest and periareolar being highest.

Contralateral prophylactic mastectomy is indicated for genetic predisposition, high family risk, or patient preference. It increases overall surgical risks compared to unilateral mastectomy.

Breast-conserving therapy (partial mastectomy or lumpectomy) involves removal of the mass with margins, generally with adjuvant radiation. Contraindications include multi-centric disease, diffuse calcifications on imaging, history of chest radiation, and current pregnancy. Reconstruction after breast-conserving therapy is not covered by all insurers.

### Neoadjuvant chemotherapy
Neoadjuvant chemotherapy can shrink tumors to allow partial mastectomy instead of total mastectomy.

### Hormonal therapy
Tamoxifen is used in pre-menopausal patients and is a selective estrogen receptor modifier. It should be considered for holding perioperatively due to possible increased thrombosis risk.

Aromatase inhibitors are used in post-menopausal patients and prevent peripheral conversion of estrogen. They do not need to be held perioperatively for elective surgery.

### Radiation (XRT)
Post-mastectomy radiation is indicated for tumors greater than 5cm, more than 3 positive lymph nodes, or positive margins.

Radiation is indicated in nearly all partial mastectomies (breast-conserving therapy) for cancer. Absolute contraindications for breast-conserving therapy include early pregnancy, multi-centric tumor, diffuse microcalcifications, inflammatory breast cancer, and persistently positive margins.

Skin dyspigmentation is the most common radiation side effect.

Radiation increases failure rates with implant-based reconstruction and causes fibrosis with autologous reconstruction. If the need for post-mastectomy radiation is unknown, tissue expanders should be used rather than definitive flap reconstruction.

Chronic wounds after radiation require biopsy to evaluate for recurrence and evaluation for rib osteoradionecrosis.

## Implant-Based Reconstruction

### Pocket Positions
Pre-pectoral and subpectoral pocket positions are most commonly used.

The pre-pectoral pocket allows better medial placement and has decreased risk of animation deformity, but has higher implant rippling, higher upper pole contour deformity, and higher cost.

### Antibiotics Management
Antibiotics should be limited to perioperative use (prophylactic dose then 24 hours postoperatively). Prolonged courses increase infection risk.

### Types of Tissue Expanders
Saline-filled expanders with integrated ports are most common. Other options include air and carbon dioxide for rapid expansion, but these cannot be deflated. Expanders are not MRI compatible due to the magnet on the port.

### Complications
Post-mastectomy radiation is the most common cause of explantation. It increases capsular contracture (the number one risk factor), seroma, wound-healing problems, and infections. Implant or tissue expander exposure in the setting of radiation requires device explantation in the operating room.

Risk factors for salvage failure include deep infection (the number one risk factor), radiation, obesity, seroma, and diabetes mellitus.

For infected tissue expanders or implants, Staphylococcus aureus is the most common organism overall, and Pseudomonas is the most common gram-negative organism. Breast implant funnels decrease the risk of bacterial contamination.

Mastectomy skin necrosis is initially treated with nitroglycerin ointment.

Breast-implant-associated ALCL (BIA-ALCL) has textured implant or tissue expander history as a risk factor. The contralateral side is affected in 5% of cases. It presents with delayed seroma and is diagnosed with ultrasound and fine-needle aspiration for cytology. Fluid cytometry shows CD30 positive and ALK negative on Wright-Giemsa stain. Ralstonia is the most commonly associated bacteria. Treatment includes bilateral explantation (due to approximately 5% risk of contralateral involvement), total capsulectomy, and oncology referral.

Cyanoacrylate contact dermatitis has 10-15% incidence and presents with erythema limited to the incision area. It is a Type IV immune response (T-cell mediated to foreign agent). Treatment includes removing the offending agent and topical steroids.

Post-mastectomy pain syndrome presents with unilateral chest wall, axilla, and upper arm pain from the intercostobrachial nerve. Treatment includes gabapentin.

## Autologous Reconstruction

### Abdominal-Based Flaps

Regarding pre-existing scars, subcostal scars are the worst for flap perfusion. A Pfannenstiel incision sacrifices superficial drainage of the flap but reduces venous congestion of the flap.

The transverse rectus abdominis musculocutaneous (TRAM) flap is often pedicled and can be ipsilateral or contralateral. Its arterial supply is the superior epigastric artery (requiring an intact internal mammary artery). The Hartrampf zones from best to worst perfusion are: Zone I (ipsilateral rectus abdominis skin), Zone II (contralateral rectus abdominis skin), Zone III (ipsilateral lateral abdominal skin), and Zone IV (contralateral lateral abdominal skin). Surgical delay (dividing the inferior epigastric artery 2 weeks prior) can reduce fat necrosis and should be considered for higher BMI patients.

The deep inferior epigastric artery perforator (DIEP) flap uses modified Hartrampf zones. Perforators pass through the rectus abdominis muscle. The pedicle is the deep inferior epigastric artery and vein. It spares the rectus muscle, resulting in lower donor morbidity than TRAM. CTA is used preoperatively to map perforators. Complications include abdominal bulge and hernia (lower than TRAM but still possible), fat necrosis (peripheral zones III and IV are at risk), flap loss (less than 5%), and donor site seroma.

The superficial inferior epigastric artery (SIEA) flap is rarely used due to small, inconsistent vessels. The pedicle is the superficial inferior epigastric artery. Its advantage is no fascial violation. Adequate caliber vessels are present in only approximately 30% of patients.

### Other Autologous Options

The latissimus dorsi flap is a pedicled flap based on the thoracodorsal artery. It often needs an implant for volume and is good for partial defects and salvage reconstruction. Donor site morbidity includes back contour deformity and seroma. Its advantage is reliable, well-vascularized tissue.

The transverse upper gracilis (TUG) flap is a free flap from the medial thigh. The pedicle is the ascending branch of the medial circumflex femoral artery. It is good for small to moderate breasts. Donor site morbidity includes a medial thigh scar.

The profunda artery perforator (PAP) flap is a free flap from the posterior thigh. The pedicle is profunda femoris perforators. It is an alternative to DIEP for patients without adequate abdominal tissue and can be harvested in the prone position simultaneously with mastectomy.

Stacked flaps involve two flaps anastomosed to single recipient vessels for larger volume needs. Common combinations include bilateral PAP and bilateral TUG.

### Timing of Reconstruction
Immediate reconstruction occurs at the time of mastectomy. Advantages include single surgery, better aesthetics, and psychological benefit. Disadvantages include longer surgery and potential delay of adjuvant therapy if complications occur.

Delayed reconstruction occurs after mastectomy and adjuvant therapy are complete. Advantages include staging procedures and completion of all cancer treatment. Disadvantages include additional surgery and chest wall changes from radiation.

### Nipple-Areola Reconstruction
Nipple-areola reconstruction is performed 3-6 months after breast mound reconstruction.

Nipple techniques include local flaps (C-V flap, skate flap, star flap), nipple sharing from the contralateral breast, and 3D tattooing (non-surgical).

Areola techniques include tattooing (most common) and skin grafts from the inner thigh or labia.

Expected flattening of the reconstructed nipple occurs over time.`,

    'facial-rejuvenation': `# Facial Rejuvenation

## Facial Analysis
The face is divided into vertical thirds (upper, mid, lower) and horizontal fifths.

## Non-Surgical Rejuvenation

### Botulinum Toxin A
The mechanism of action involves SNAP-25 blocking acetylcholine at the pre-synaptic neurotransmitter terminal.

FDA aesthetic indications include forehead, glabella, and lateral eye rhytids. Glabellar lines include procerus (horizontal rhytids between the nose and medial eyebrow) and corrugator (vertical rhytids between the nose and eyebrow), with a usual dose of approximately 20 units. Frontalis treatment addresses horizontal forehead lines and is a brow elevator.

Non-aesthetic indications include migraines, hemifacial dyskinesia, blepharospasm, cervical dystonia, post-stroke upper limb spasticity, and urinary problems. Hyperhidrosis presents with bilateral symmetrical sweating, occurs for more than 6 months, has onset before age 25, and occurs more than weekly. Treatment is approximately 50 units per axilla.

Regarding complications, the LD50 (lethal dose for 50% of patients) is approximately 3000 units for a 70kg patient. Eyelid ptosis occurs due to spread to the levator palpebrae superioris and is treated with apraclonidine (an alpha-adrenergic agonist) eye drops, which act on Muller's muscle.

Use in pregnancy is unknown.

### Hyaluronic Acid Fillers
Regarding characteristics, the G' modulus indicates stiffness, with higher values increasing product stiffness.

Complications include acute arterial compromise and tissue necrosis. Risk factors include the glabella and nasolabial area near the ala. Symptoms include skin discoloration and worsening pain. Treatment involves injecting hyaluronidase.

Blindness occurs from intravascular occlusion of the central retinal artery due to embolism from the dorsal nasal artery to the internal carotid. Treatment requires immediate retrobulbar injection of hyaluronidase (within 60 minutes).

### Chemical Peels

Superficial peels include glycolic acid, which affects the epidermis with an endpoint of transparent frosting and can be neutralized with 1% sodium bicarbonate. Salicylic acid and Jessner peels are also superficial and reach the epidermis (basal layer).

Intermediate peels include TCA, which reaches the upper (papillary) dermis with a white frosting endpoint. The main complication is hyperpigmentation, with risk factors including higher Fitzpatrick skin types (IV, V, VI). Treatment includes hydroquinone.

Deep peels include phenol-croton, which reaches the mid dermis (upper reticular dermis). Cardiac and electrolyte monitoring are required. Ventricular dysrhythmia is a complication related to the speed of application. Monitoring for 15 minutes after application is necessary.

Chemical peels are safe to apply to non-undermined areas at the same time as rhytidectomy.

### Laser
CO2 and erbium ablative lasers are the most common for skin resurfacing. The chromophore is water (erbium has higher affinity). Antiviral prophylaxis for HSV is required due to the risk of reactivation. Pretreatment for post-inflammatory hyperpigmentation is needed in higher Fitzpatrick skin types (greater than IV) using hydroquinone, which works by blocking conversion of tyrosine to dihydroxyphenylalanine to decrease melanin production.

Complications include hypertrophic scarring, which is reduced by decreasing fluence (energy density), using smaller treatment areas, and avoiding multiple passes. Patients need to be off isotretinoin for more than 6 months to reduce the risk of abnormal scarring. Hyperpigmentation is another complication.

## Surgical Rejuvenation

### Hair Disorders

Male pattern alopecia (androgenic alopecia) is the most common cause of hair loss. It is classified using the Norwood-Hamilton classification (I-VII). Treatment includes minoxidil.

Alopecia areata is a T-cell mediated autoimmune response affecting regional hair follicles. Treatment includes steroid injection.

Trichotillomania has a psychiatric etiology involving pulling of hair. Treatment includes psychiatry referral.

Hair removal uses intermittent pulsed light that targets melanin of hair follicles. Electrolysis is used for patients with low skin melanin (Fitzpatrick type I).

Hair grafting uses micrografts (1 to 2 follicles) and minigrafts (3-4 follicles). Hair grafts initially enter the catagen phase and then the telogen phase a few weeks later. It can take several months before new hairs appear.

### Browlift
The pretrichial approach shortens forehead length. The transcoronal approach is used for short foreheads. The endoscopic approach has higher risk of supraorbital nerve injury (numbness to forehead).

### Rhytidectomy

The superficial musculoaponeurotic system (SMAS) is contiguous with the temporoparietal fascia and platysma.

The posterior incision excises skin to improve neck skin. Curving along the hairline will not distort it.

SMAS tightening decreases tension on skin closure.

The minimal access cranial suspension (MACS lift) requires less skin excision than other techniques but may need extension of the postauricular incision to remove more skin.

Short-scar rhytidectomy achieves similar jawline changes but has worse neck management than full-scar rhytidectomy.

Hematoma is a complication with risk factors including hypertension and male sex. Treatment includes blood pressure control with clonidine.

Skin loss is treated with observation, allowing demarcation, and healing by secondary intention.

Nerve injuries often self-resolve. Immediate postoperative changes are most commonly from local injection. In clinic, nerve injuries are usually neuropraxia and are treated with observation for up to 6 months. The highest risk area is sub-SMAS near the lateral malar eminence.

Marginal mandibular nerve injury affects the depressor labii inferioris, depressor anguli oris, and mentalis. The nerve is located deep to the platysma and superficial to the facial vein. It presents with inability to evert the lower lip, purse lips, or whistle.

Cervical branch injury presents with lower teeth being less visible with full smile on the affected side.

Great auricular nerve injury affects sensation to the ear lobe. McKinney's point is where the nerve becomes superficial at the midpoint of the sternocleidomastoid (SCM), 6.5cm inferior to the external auditory canal. It occurs from over-resection of skin adjacent to the earlobe.

Parotid duct injury is managed conservatively with a bland diet, percutaneous drainage, scopolamine patch, glycopyrrolate, or botulinum toxin injection.

Sialocele is an injury to the submandibular gland that presents with unilateral facial swelling and pain.

### Buccal Fat Reduction
The buccal fat pad has three lobes: anterior, intermediate, and posterior. The parotid duct passes through the posterior portion of the anterior lobe.

### Genioplasty

The genioglossus is innervated by the hypoglossal nerve (CN XII) and runs parallel with the posterior digastric muscle. Injury causes ipsilateral tongue paralysis.

Osseous genioplasty involves osteotomy to slide the inferior mandible anteriorly.

Implant options include porous polyethylene (which allows soft-tissue ingrowth) and silicone.

Mandibular contouring is used to treat a square jaw.

### Neck Rejuvenation
Assessment includes skin quality, location of excess (central versus lateral), platysma banding, and skin excess. Treatment options include cryolipolysis, suction-assisted lipectomy, direct excision, and lower rhytidectomy.`,

    'rhinoplasty': `# Rhinoplasty and Nasal Reconstruction

## Anatomy

### Upper Lateral Cartilages
The keystone area is the junction to the nasal bones, where cartilage is posterior to the nasal bones. An inverted-V deformity occurs if this area is disrupted and not corrected.

### Internal Nasal Valve
The internal nasal valve is the most common area of nasal-breathing obstruction. It is formed by the septum, upper lateral cartilage, and inferior turbinate.

### Depressor Septi Nasi
The depressor septi nasi is an anomalous muscle from the upper lip to the septum that changes the nose/lip relationship when animated.

## Nasal Analysis

### Assess Patency of Internal Nasal Valves
The Cottle maneuver involves distracting the cheek laterally and asking if nasal breathing improves. Rhinomanometry provides objective measurement.

### Bulbous Tip
A bulbous tip is characterized by convex lower lateral cartilages, wide domal width (less than 4mm), and wide angle of divergence.

## Nasal Reconstruction

### Nasal Subunits
The nasal subunits include the sidewalls, ala, soft triangles, dorsum, nasal tip, and columella.

### Reconstruction

Defects less than 1.5cm can be managed with healing by secondary intention, primary closure, or local flaps (such as bilobed flaps).

Defects between 1.5 and 2.5cm are reconstructed with local flaps (such as bilobed flaps).

Defects greater than 2.5cm or full-thickness defects require the paramedian forehead flap. The pedicle is the supratrochlear artery. The procedure has three stages: transfer, intermediate debulking (optional), and pedicle division at 3 weeks. It provides excellent color and texture match. The frontalis muscle is innervated by the facial nerve and can develop forehead paralysis without reinnervation.

Nasal lining options include septal mucosal flap, folded forehead flap, free mucosal graft, and full-thickness skin graft.

Nasal support is provided by cartilage grafts (from septum, ear, or rib) and bone grafts (from calvarium or iliac crest).

## Rhinoplasty Techniques

### Dorsal Hump Reduction
A rasp is used for bony humps. A scalpel or scissors is used for cartilaginous humps. Osteotomies may be needed to close an open roof.

### Tip Refinement
Cephalic trim of the lower lateral cartilages is performed, leaving at least a 6mm strip to maintain support. Interdomal and intradomal sutures are placed. Tip grafts include shield, cap, and onlay grafts.

### Nasal Dorsal Hump Augmentation
Treatment includes septal cartilage or alloplastic materials (acellular dermal matrix, silicone, or ePTFE).

### Decreased Nasal Tip Support
Treatment includes septal extension graft and columellar strut graft.

### Alar Flaring
Alar flare reduction should be assessed at the end of the case, as changing projection can affect alar width.

### Complications

Inverted-V deformity is collapse of the upper lateral cartilages from the bony nose. Treatment includes spreader grafts or auto spreader flaps.

Alar notching is most commonly caused by over-resection during cephalic trim.

Difficulty with nasal breathing from the internal nasal valve occurs from separating the upper lateral cartilage. Treatment includes spreader grafts or auto spreader flaps to increase the radius of the internal nasal valve.

External nasal valve problems occur from over-resection of the lower lateral cartilages. It presents with inward rotation and malposition of the lower lateral crura. Treatment includes lateral crural strut graft.`,

    'eye-aesthetic-reconstructive': `# Eye Aesthetic and Reconstructive

## Pre-Operative Evaluation

### Ptosis
Marginal reflex distance 1 (MRD-1) is the distance from the light reflex on the cornea to the upper eyelid margin in primary gaze, normally 4-5mm.

Hering's law states that there is equal innervation of bilateral levator palpebral muscles. Testing involves phenylephrine to stimulate Muller muscle to raise the more ptotic eyelid and decrease levator innervation, then observing if the contralateral eyelid falls.

### Horizontal Laxity
The slant from medial to lateral canthus can become negative (downward slanting) with age. Treatment includes canthopexy or canthoplasty.

### Malar Vector
The malar vector describes the relationship of the globe to malar soft tissues. It can become negative over time from deficient lid support and is a risk factor for lid ectropion. Treatment includes canthopexy or canthoplasty.

### Canalicular/Lacrimal Injury
Risk factors include medial canthus injuries. It is associated with epiphora, telecanthus, and ptosis. Anterior displacement of the eye punctum affects lacrimal drainage. This commonly occurs in the setting of naso-orbito-ethmoidal fractures.

Diagnosis uses the Jones tests. Jones test I involves injecting fluorescein to the medial canaliculus and observing for drainage through the nose (through the inferior meatus) for 5 minutes. Jones test II, if no drainage occurs, involves irrigating the medial canaliculus with saline and observing for drainage to diagnose a partial obstruction.

Treatment includes silicone stent for 3-6 months for acute injuries and dacryocystorhinostomy for chronic or salvage cases.

### Refractory Surgery
The timing of blepharoplasty after corneal surgery (such as LASIK) should be 6 months. There is increased risk for dry eyes due to changes to the corneal reflex arc. The tear film has three layers: outer lipid (prevents evaporation), middle aqueous (lubricates), and inner mucin (nourishes cornea). It is produced by the Meibomian glands.

### Rheumatologic Disease
Sjogren's syndrome presents with dry eyes, dry mouth, and polyarthritis. Diagnosis involves anti-SSA and anti-SSB serum tests.

## Ptosis Repair

### Pre-operative Evaluation
Levator function is assessed from downward to upward gaze: normal is greater than 12mm, good is 8-12mm, fair is 5-7mm, and poor is less than 4mm.

### Options
The Fasanella-Servat procedure (tarsus/Muller resection) is used for minimal ptosis with good levator function.

Levator advancement is used for fair levator function. Senile levator dehiscence is treated by suturing the levator aponeurosis to the tarsal plate. The levator is located deep to the pre-aponeurotic central fat pad.

Frontalis sling is used for poor levator function using non-absorbable biomaterials.

## Eyelid Reconstruction

### Direct Closure
Direct closure can be achieved with pentagonal excision and closure.

### Lamella
The anterior lamella is skin, which can be reconstructed with skin grafts or flaps (such as Tripier flaps). Post-burn contracture is treated with contracture release and skin grafting.

The middle lamella is tarsus, which can be reconstructed with cartilage grafts (such as ear cartilage) or acellular dermal matrix.

The posterior lamella is conjunctiva, which can be reconstructed with oral mucosa grafts (from the palate) or lid-switch flaps.

### Upper Eyelid Flaps
The Cutler-Beard flap is a lower to upper eyelid switch used for full-thickness upper eyelid defects greater than two-thirds.

### Lower Eyelid Flaps
The Hughes tarsoconjunctival flap is an upper to lower lid switch.

## Aesthetic Eyelid Surgery

### Upper Blepharoplasty
Skin excision extends up to the medial punctum.

Complications include nasal skin webbing from excessive medial skin resection. Lagophthalmos (incomplete eyelid closure) is treated with taping and observation. Transient ptosis is caused by swelling and bruising and usually resolves in a few days with observation. Lacrimal gland injury causes dry eye. Meibomian gland injury causes dry eyes and can occur even with skin-only excision; these glands produce oil that reduces tear evaporation. Loss of ocular protection results from injury to the extra-canthal orbicularis oculi muscle, which is innervated by the zygomatic branch.

### Lower Lid Blepharoplasty

The subconjunctival/skin muscle flap approach has the highest rate of ectropion. The subtarsal approach is another option. The transconjunctival approach has the lowest rate of ectropion.

Management of the tear trough involves release of the orbital retaining ligament and fat repositioning. The anatomic landmark is the levator labii superioris.

Lower lid malposition is the most common complication, caused by horizontal laxity of the tarsoligamentous sling. It is diagnosed with the snap-back test (distract 8mm). Treatment includes tarsal strip.

Injury to the inferior oblique, which divides the medial and central fat compartments, presents with inability to elevate and abduct the eye.

Retrobulbar hematoma presents with pain, diminished visual acuity (decreased perception of red light initially), bruising, proptosis, and decreased ocular movements. Treatment includes immediate lateral canthotomy, emergent ophthalmology consult, then mannitol and furosemide, followed by the operating room for orbital decompression.

Chemosis is prolapse of the conjunctiva and is treated with lubrication and eye patching. Conjunctivotomy is performed for severe or refractory cases.

Lateral scleral show results from inadequate canthal support.

### Eyelid Fat

The retro-orbicularis oculi fat (ROOF) is located in the upper eyelid. The sub-orbicularis oculi fat (SOOF) is located in the lower eyelid.

Eyelid xanthelasmas are excess fat deposits that affect the lower eyelids. Treatment includes chemical peels, cryotherapy, laser ablation, or direct excision and closure (no margins needed).

## Congenital

### Blepharoptosis
Treatment is delayed until age 3 unless there is significant visual obstruction, due to anesthetic risk.

### Insensate Cornea
Insensate cornea presents with recurrent ulcerations. Treatment includes supratrochlear to scleral limbus nerve transfer.

### Limbal Dermoids
Limbal dermoids are benign congenital tumors of the outer globe.`,

    'body-contouring': `# Body Contouring

## Liposuction

### Overview
Liposuction provides long-term reduction of subcutaneous fat in treated areas without change in untreated areas when weight is stable.

### Wetting Solution
The wetting solution is isotonic fluid with epinephrine and lidocaine. The maximum dose of lidocaine is 35mg/kg (some studies suggest up to 55mg/kg). Fluid is present in 10-30% of the aspirate. Peak lidocaine levels are reached at 8-18 hours from injection, with faster absorption above the clavicles.

Techniques include: dry (no tumescence, with estimated blood loss 20-40% of aspirate), wet (200-300cc tumescence per area), superwet (1:1 ratio, with estimated blood loss 1% of aspirate), and tumescent (2-3:1 ratio).

### High-Volume Liposuction
High-volume liposuction (greater than 5000cc) should be performed with overnight observation due to risk for volume shifts.

### Devices
Suction-assisted and ultrasound-assisted liposuction show no change in outcome, though there is less surgeon fatigue with ultrasound. Laser-assisted liposuction has less postoperative pain.

Cannula length is related to flow resistance. Cannula size is related to efficiency and risk of contour abnormality.

### Lymphedema
Lymphedema with pitting edema is a relative contraindication for aesthetic liposuction.

### Complications
Contour abnormalities are avoided by avoiding zones of adherence (such as the lateral gluteal depression) and using crisscrossing cannula passes with multiple vectors.

### Fat Grafting

Adipose-derived stem cells can differentiate into fibroblasts and keratinocytes directly. Anatomic areas with the highest stem cell composition are the abdomen and inner thighs.

For gluteal fat grafting, avoid intramuscular injection and downward trajectory, use large cannulas (greater than 4mm), and inject only while in motion.

Fat embolism is a complication that generally occurs within 72 hours from surgery. It presents with shortness of breath, confusion, and petechial rash. Treatment includes cardiopulmonary support.

### Non-Invasive Options

Cryolipolysis works through adipocyte apoptosis caused by crystallization at -5 to -15 degrees Celsius and ischemia/reperfusion injury. It achieves 20-25% reduction of fat in the treatment area.

The most common complication is transient hypoesthesia. Paradoxical adipose hyperplasia is an abnormal focal increase in subcutaneous fat within the treatment area. Risk factors include large applicator, male sex, Hispanic ethnicity, and abdominal site. Treatment involves observation for 6 months, then liposuction if needed.

## Abdominoplasty

### Planning
Scarpa's fascia is superficial to the rectus fascia. The superior extent of dissection is the costal margin.

### Technique
Muscle plication repairs diastasis recti. The procedure includes umbilical transposition, skin undermining, and excision.

### Complications
Hematoma is the most common complication, with male sex as a risk factor.

Seroma is the most common delayed complication.

Wound dehiscence is most common at the T-junction.

Skin and fat necrosis occur at lateral dog ears and areas of excessive tension.

Umbilical necrosis results from over-dissection and tension.

Abdominal bulge and hernia result from inadequate fascial repair.

DVT and PE prophylaxis is guided by the Caprini score.

Sensory changes and hypesthesia are common but usually improve.

### Variations
Mini-abdominoplasty involves limited undermining with no umbilical transposition.

Extended abdominoplasty includes the flanks.

Circumferential abdominoplasty (lower body lift) addresses the abdomen, flanks, back, buttocks, and lateral thighs.

Belt lipectomy is similar to lower body lift.

## Massive Weight Loss Surgery

### Post-Bariatric Body Contouring
Timing is after weight stabilization (more than 6 months) and nutritional optimization. Staged procedures are used due to the extensive surgery required. Body regions addressed include arms, breasts, abdomen, thighs, and buttocks.

### Lower Body Lift
The lower body lift involves circumferential excision at the waistline. It addresses the abdomen, flanks, back, buttocks, and lateral thighs, and lifts the buttocks and lateral thighs. It has a higher complication rate than isolated abdominoplasty.

### Corset Abdominoplasty
Corset abdominoplasty addresses both vertical and horizontal excess by trimming the torso circumferentially.

### Panniculectomy
Panniculectomy involves removal of the pannus only. It is considered a functional operation for persistent and recurrent intertriginous ulcerations. It does not include umbilical transposition or muscle plication and is less costly than abdominoplasty.

### Upper Body Lift
The upper body lift addresses back rolls, bra rolls, and the lateral chest, with incisions along the bra line.

### Medial Thighplasty
Medial thighplasty uses a vertical incision along the medial thigh and addresses medial thigh laxity.

### Complications
Complications are similar to abdominoplasty but occur at higher rates. Seroma, wound dehiscence, and skin necrosis are common.

Lymphedema can result from prolonged edema with circumferential technique, as the femoral triangle contains lymphatic channels.

DVT and PE prophylaxis is critical.

## Extremity Surgeries

### Brachioplasty (Arm Lift)

Brachioplasty is indicated for excess upper arm skin.

Liposuction alone is used when the pinch test is 1.5 to 3cm with good skin tone and no laxity. Liposuction-assisted brachioplasty facilitates soft-tissue dissection. The posteromedial scar location is most concealed.

The most common complication is hypertrophic scarring, followed by wound-healing problems.

The medial antebrachial cutaneous nerve is superficial at 14cm proximal to the elbow and travels in the medial arm next to the basilic vein. It is protected by leaving 1cm of fat at the deep fascia. There is no risk of injury with posterior resection.

### Thighplasty/Thigh Lift

Complications include prolonged edema with circumferential technique. The femoral triangle is where the lymphatic channels are located.

## Genital Aesthetic Surgery

### Labiaplasty
Hematoma is a complication, with male sex (in transgender patients) as a risk factor.

### Vaginal Rejuvenation
For clitoral hood reduction, excision should be lateral, not anterior or at the clitoral frenulum, as injury to sensory nerves at the anterior hood is a complication.

Laser rejuvenation has not been shown to improve symptoms in post-menopausal women.

## Others

### HIV-Associated Lipodystrophy
HIV-associated lipodystrophy presents with atrophy of malar and temporal fat and development of buffalo hump and cervical fat deposits associated with HAART medications.

Treatment includes fat grafting and poly-L-lactic acid filler to the face, and liposuction to the buffalo hump.`,
  },
  'core-surgical': {
    'anesthesia': `# Anesthesia

## Medications

### Local anesthetics
Shown to reduce post-operative opioid use.
**Local anesthetic toxicity**. Lidocaine maximum dose 7mg/kg with epinephrine, 4mg/kg plain. Can be higher (35-55mg/kg) as wetting solution in liposuction. Symptoms include lip numbness, metallic taste, slurred speech, nausea, anxiety, disorientation. Can progress to cardiac problems. Treatment includes secure airway first if unstable, fat emulsion (intra lipid) bolus then infusion.
**Local with epinephrine**. Peak vasoconstriction effect about 20-30 minutes. Reversal agent phentolamine (alpha-1 and -2 antagonist).
**Liposomal bupivacaine**. Can combine with saline or non-liposomal bupivacaine to dilute. Can give 20 minutes after injection of lidocaine. Maximum dose 20cc (266mg).

### Conscious sedation
Patients with reduced awareness but respond to verbal commands, protect airway.
IV agents (e.g., propofol, opioids, benzodiazepines). Midazolam and fentanyl better for anxiety/pain than single agents.
Requirements oxygen, ventilator support/intubation support available.
**Complication**. Hypotension. Tx IV fluids (1st line).

### Corticosteroids
Single perioperative dose associated with transient hyperglycemia, no change in wound healing.
Corticosteroid-related wound healing deficiency with use >30 days. Increased wound-healing complicated by 2-3x, impedes all phases of wound healing. Treatment includes vitamin A (oral).

### Tranexamic Acid (TXA)
Blocks plasminogen to plasmin (prevents clot degradation).
Perioperative use associated with reduced EBL across multiple specialties and operations including plastic surgery (orthognathic, craniosynostosis surgery, reduction mammaplasty).

## Risk Assessment

### ASA Classification
I no comorbidities, normal weight, no smoking.
II mild, controlled comorbidities.
III one or more moderate to severe comorbidities.
IV comorbidity that is a constant threat to life (recent cardiovascular disease (<3 months), uncontrolled ESRD).
V not expected to survive >24 hours without an emergency operation.
VI brain dead patient donating organs.

## Regional Anesthesia

### Specific nerve blocks
**Infraorbital nerve block**. Landmark infraorbital foramen of orbital rim. Ipsilateral central incisor to premolars.
**Mental nerve block**. Landmark second premolar.
**Pectoral nerve block**. PECS 1 between pectoralis major and minor. PECS 2 between pectoralis minor and serratus anterior.
**TAP (transversalis abdominus plane)**. Block abdominal nerves between internal oblique and transversus abdominus. Landmarks: latissimus dorsi, external oblique, and iliac crest (lumbar triangle). T7-L1 carries abdominal wall innervation. T10 highest nerve fiber density to abdomen.

## Anesthetic Complications

### Malignant hyperthermia
Autosomal dominant myopathy.
Due to inhaled anesthetics, succinylcholine.
Pathophysiology calcium release into skeletal muscle.
**Dx **. Early signs tachycardia, hypercapnia (increased end tidal CO2). Late signs metabolic acidosis, hyperphosphatemia, fever, ECG changes/hyperkalemia, myoglobinuria.
Treatment includes discontinue agent, supportive care, dantrolene. Can use propofol for future anesthesia.

### Muscle Relaxants
**Succinylcholine**. Associated with acute hyperkalemia.

### Post-operative nausea and vomiting
Risk factors include nonsmoking, female, history of postoperative nausea/vomiting, age >50, obesity (BMI >30).
Treatment includes aprepitant before induction.
Treatment includes propofol has lower association than other IV agents.

### Post-operative urinary retention
The most common from anesthetic medications.

### Operating room fire
Risk factors include nasal cannula and open oxygen sources.
Treatment includes remove endotracheal tube, interrupt all gases, remove all flammables (e.g., sponges), reestablish airway once fire put out.`,

    'perioperative-care': `# Perioperative Care

## Perioperative Optimization

### Medication management
**Aspirin**. Increases bleeding time. Continue perioperatively for low-risk procedures. No change in bleeding risk in minor skin surgeries.
**Ketorolac**. MOA COX-1 and -2 inhibitor. Increased bleeding time by thromboxane A2 inhibition. No increased bleeding risk in breast surgery.
**Acetaminophen**. No platelet effects.
**Gabapentinoids**. Block voltage-gated calcium channels. Used in multi-modal analgesia.
**Dual antiplatelet therapy**. Prescribed after cardiac stents. Recommend continuation for >6 months after drug-eluting stent placement, bridge with an antiplatelet gtt if needed to be held for an emergency.
**Warfarin**. Monitoring PT/INR (target 2-3 for most indications). Assess risk of perioperative thrombosis. If high risk bridge with heparin or LMWH. If low risk stop 5 days before surgery.
**Direct oral anticoagulants (DOACs)**. Hold 24-48 hours before surgery depending on renal function. No routine monitoring required.
**Antibiotic prophylaxis**. Timing within 1 hour of incision (2 hours for vancomycin). Cefazolin most common (covers skin flora). Use in all breast cases, clean/contaminated, contaminated, and dirty cases. Implant-based breast reconstruction no evidence for courses >24 hours. Not needed for clean hand surgery <2 hours, clean skin surgery. **Penicillin allergy**. Associated with <5% cephalosporin cross-reactivity.

### Perioperative pain management
**Opioid abuse**. Risk factors include younger age, bone procedures, psychiatric comorbidities, substance use history, and chronic pain history.

## OR Complications

### Blood loss estimates
**Normal circulating blood volumes **. Neonate 85cc/kg. Child 75cc/kg. Adult (70kg) 5500cc.

### Patient positioning in OR
Reduce peripheral neuropathy compression risk.
**Dorsal lithotomy**. Heel protection.
**Supine**. Forearm supinated. Reduce risk of ulnar neuropathy.
**Tucked arms**. Neutral forearm rotation.
**Prone**. Neck neutral.

### Retained foreign body
Risk factors include The most common incorrect final count (but most cases with retained objects had a normal final count), increased with change of surgical teams, emergency case.

### Radiation exposure
Low (<10Gy): transient erythema.
Moderate (10-20Gy): recurring erythema.
High (>20Gy): prone to tissue necrosis.

### Near-miss events
Potential to cause harm from an error but caught before affects patient.`,

    'critical-care': `# Critical Care

## Neurologic

### Postoperative delirium
Treatment includes avoid benzodiazepines, diphenhydramine.

### Diabetes insipidus
Elevated serum sodium after head injury. The mechanism of action is vasopressin via posterior pituitary.

### Cerebral edema
Treatment includes hypertonic saline.

### Brain death examination
Need cause that is permanent and irreversible.
Diagnosis involves absent brainstem reflexes (e.g., pupillary response to light).
Contraindications include hypothermia, neuromuscular blockade.

### Organ donation
Contraindications include lack of next-of-kin consent, minors (age <18), prion disease, metastatic disease.

### Autonomic dysreflexia
Exaggerated sympathetic response due to a triggering cause seen in spinal cord patients.
Risk factors include T6 or higher paralysis.
Symptoms include hypertension, bradycardia, flushing, sweating, headache.
Treatment includes remove clothing/cooling, place foley catheter to empty bladder.

## Cardiac

### Cardiopulmonary resuscitation
High-quality chest compressions for 2 minutes then check pulse.
**Ventricular dysrhythmias**. Treatment includes compressions, automated defibrillator.
**Pulseless electrical activity**. Treatment includes compressions, epinephrine.

### Rapid response team
Assesses floor patients with major vital-sign changes, evaluate need for ICU transfer. Common triggers rapid heart rate, hypotension, altered consciousness.

### Acute coronary syndrome
Symptoms include chest pain, shortness of breath.
Diagnosis involves ECG (1st), troponin.

### Cardiac tamponade
Beck's triad tachycardia, hypotension, jugular distention.
Diagnosis involves pericardial rub on auscultation, then US/echo.
Treatment includes drainage (percutaneous or pericardial window).

### Atrial fibrillation
Acute, unstable attempt cardioversion (<48 hours onset). If longer >48 hours, need to assess for left thrombus clot, consider anticoagulation.
Acute, stable medical management with beta blockers (1st line), calcium-channel blockers (2nd line), amiodarone for rhythm control.

## Respiratory

### Pulmonary function
Minute ventilation respiratory rate x tidal volume.

### Tension pneumothorax
Symptoms include hypotension, tachypneic, decreased oxygen saturation.
Treatment includes needle decompression then tube thoracostomy.

### Obstructive sleep apnea
Treatment includes CPAP support preoperatively and immediately postoperatively.

## Gastrointestinal

### Nutrition
**Perioperative protein recommendation**. 1gm/kg (about 60-70gm/day) 1 month before to 2 months after major surgery.
**Respiratory quotient**. <0.7 fat oxidation, underfeeding. 0.7-1 utilize protein then carbohydrate. >1.3 lipogenesis, overfeeding.

## Renal

### Contrast-induced nephropathy
Reduce risk with isotonic fluid volume before contrast bolus with imaging studies.

### Acute kidney injury
Diagnosis involves fractional excretion of sodium (FeNa) for etiology. Formula: (urine sodium x plasma creatinine) / (plasma sodium x urine creatinine). <1%: pre renal (hypovolemia or decreased perfusion). 1-3%: renal (The most common acute tubular necrosis). >3%: post-renal (obstruction).
Treatment includes targeted glucose control, isotonic fluids, provide protein-based nutrition.

### Hyperkalemia
ECG with peaked T waves.
Treatment includes calcium gluconate to protect heart, insulin and D50 to shift potassium intracellular, then furosemide/kayexalate/sodium polystyrene binders/dialysis to excrete.

### Cerebral salt wasting
Renal and fluid loss associated with intra-cranial injury.

### Syndrome of inappropriate anti-diuretic hormone (SIADH)
Hyponatremia in setting of volume expansion.

### Free water deficit
Water deficit = normal body water x (1-(serum Na/140)).

## Inflammatory/Infectious

### Septic shock
Decreased peripheral vascular resistance due to vasodilation from pro-inflammatory mediators (e.g., TNF-alpha, histamine).
Diagnosis involves vasopressor requirement and serum lactate > 2 in absence of hypovolemia.
Treatment includes blood cultures, early antibiotics (within 1 hour of presentation when suspected), volume resuscitation, pressors, supportive care. Can trend lactate levels to assess resuscitation.

### Bacterial resistance
Changes to cell membrane (increased esterification, decreased carotenoids), increased protease, increased binding proteins, increased biofilm.

### Anaphylaxis reaction
Symptoms include itchy eyes, rhinorrhea, anxiety, skin erythema, respiratory stridor.
Treatment includes intra-muscular epinephrine.
**Isosulfane blue allergy**. Dye used in sentinel lymph node biopsies. 1-3% of population have allergy. Treatment includes pressors.

### COVID infection
Increased cardiovascular complications post-operatively.

## Hematology

### Bleeding diseases
**Von Willebrand** The most common congenital bleeding disorder. Abnormal factor VIII binding. Tx DDAVP.`,

    'trauma': `# Trauma

## Trauma Evaluation

### Advanced trauma life support (ABCDEs)
**Airway**. Includes cervical spine immobilization depending on mechanism.
**Breathing**.
**Circulation, control hemorrhage**.
**Disability**.
**Exposure/environment**.
**Secondary survey**.
Ensure tetanus immunization up to date for dirty, devitalized wounds in setting of trauma.

## Trauma Management

### Hemorrhagic shock
Diagnosis involves increased pulse rate (early sign) in setting of known blood loss, vasoconstriction.
Treatment includes massive transfusion protocol. ~1:1 ratio of pRBC, FFP, avoid crystalloid.
**Tranexamic acid (TXA)**. Inhibits fibrinolysis (blocks conversion of plasminogen). Reduces traumatic blood loss. Monitor for color-vision changes with prolonged use.

### Trauma in pregnancy
**Early pregnancy**. Minimize CT scans on stable patients, if possible. Dx Rh status, 4 hours of fetal monitoring.
**Late pregnancy**. Asymptomatic hypotension. Logroll to left side. Offload IVC compression from fetus.

### Neck injuries
**Zone I** inferior neck from clavicles to thyroid cartilage.
**Zone II** thyroid cartilage to angle of the mandible. Most likely to require operative exploration. Dx CT angiogram if stable.
**Zone III** above angle of the mandible. Dx CT angiogram. Tx IR procedures (e.g., stent, coil embolization).`,

    'transplantation': `# Transplantation

## Allotransplantation in Plastic Surgery

### Facial transplantation
**Facial changes after transplantation**. Accelerated aging. Facial volume loss occurs due to loss of bone and non-fat elements of subcutaneous tissue. Occur in first three years, theorized to be from denervation changes.
**Complications**. Candidal mouth infection. Symptoms include white papules of oral mucosa. Treatment includes topical nystatin.

### Hand transplantation
Skin is the most immunogenic soft-tissue component.
Risk of reperfusion injury after transplantation. Diagnosis involves elevated potassium, CPK levels.

## Transplant Management

### Rejection
**Hyperacute** 0-2 days from preformed antibodies.
**Accelerated** 2-5 days.
**Acute** first 6 months, T cell mediated, newly formed. Organ dysfunction.
**Chronic** >6 months, T and B cells, progressive arterial disease.

### Immunosuppression
**Tacrolimus**. Side effect nephrotoxicity.

### Antibiotics
Taken prophylactically due to decreased immunity.
Opportunistic infections most likely to occur between months 1-12.`,

    'statistics-ethics-practice': `# Statistics, Ethics, and Practice Management

## Statistics

### Quantitative
**Student's t-test**. Compares means of independent quantitative data in 2 groups.
**ANOVA**. Compares variance of independent quantitative data in > 2 groups.
**Paired-sample t-test**. Compares means of dependent quantitative data in same group at different times.
**Linear regression**. Determines relationship between dependent and independent variables.

### Qualitative
**Chi-square test**. Compares categorical data in 2+ groups.
**Fisher exact test**. Used when sample sizes are small (<5 in any cell).

### Study Design
**Prospective cohort**. Follow subjects forward in time. Can establish temporal relationship.
**Retrospective cohort**. Look back at historical data.
**Case-control**. Compare subjects with disease to those without.
**Randomized controlled trial (RCT)**. Gold standard for establishing causation. Subjects randomly assigned to treatment/control.
**Meta-analysis**. Statistical combination of multiple studies.

### Measures
**Sensitivity** True positive / (True positive + False negative). Ability to detect disease when present.
**Specificity** True negative / (True negative + False positive). Ability to rule out disease when absent.
**Positive predictive value (PPV)**: True positive / (True positive + False positive). Probability disease present when test positive.
**Negative predictive value (NPV)**: True negative / (True negative + False negative). Probability disease absent when test negative.
**Number needed to treat (NNT)**: 1 / Absolute risk reduction. Number of patients needed to treat to prevent one adverse outcome.

### Statistical Significance
**P-value** Probability results occurred by chance. P<0.05 typically considered statistically significant.
**Confidence interval (CI)**: Range likely to contain true population parameter. 95% CI most common.
**Type I error (alpha)**: False positive, rejecting null when true.
**Type II error (beta)**: False negative, accepting null when false.
**Power** 1 - beta, ability to detect true difference.

## Practice Management

### Coding
**Global period**. 90 days after operation (10 days after some simple skin procedures). Includes professional services for all disease-related care after operation, including complications. Staged components excluded (e.g., division of a forehead flap). Includes subsequent tissue expander after device placement. Can bill initial consultation in addition to operation (but not additional visits needed for consent, photos, markings).
**New patient clinic visit**. First visit to practice or established patient not seen by you or a partner in the same practice in >36 months.
**CPT modifiers **. 22 added time/complexity. 50 bilateral procedure (e.g., breast reduction). 57 evaluation/management of an urgent/emergent procedures with surgery planned within 24 hours. 58 planned, staged operation (e.g., breast tissue expander to implant exchange).
**CPT coding for skin lesions**. Can code the excision or the closure but can't code both (if performed by same surgeon).

### Government and regulations
**Medicare**. Federally funded insurance generally for age >65. Consists of 4 components. A inpatient and nursing facility fees. B outpatient services. C add-on private coinsurance option (combines parts A, B, C). D drug benefits. Physician contracting. Obligated to offer the same cost (pre-negotiated fee schedule) for the same surgical service to all covered patients by that insurer.
**Medicaid**. Federally subsidized, state-run insurance offered to low-income individuals.
**Affordable Care Act**. Many components largely related to health insurance expansion of coverage. Does not include dental care. Mandates electronic health record system (EHR) to receive full federal payments for services. Small, incremental penalty per year if no EHR. Meaningful use. Encourages practices to use EHR components: electronic prescribing, patient portal access for health records, quality.
**Health Insurance Privacy Accountability Act (HIPAA)**. Allows individuals to transfer health coverage from one employer to another. Includes regulations covering patient privacy and data privacy in healthcare. Protects individually identifiable information (name, address, date of birth), including its use in research. Email communications must be encrypted. Privacy official: serves as privacy officer for a practice. If any breach, report to Department of Health and Human Services within 60 days. Report to local media for large breach (>500 patients affected).
**Americans with Disability Act**. Provider/health system needs to provide necessary services for patients to access care (e.g., interpretation).
**Certificate of Need**. State-level approval needed before building or expanding healthcare facilities. Allows geographic coordination of new services and construction.
**Sunshine Act**. Medical device, supply, and drug companies must disclose all payments and gifts > $10 to an individual provider to the federal government. Exception for continuing medical education events.
**American Board of Plastic Surgery**. Requires unrestricted state medical license for eligibility. Can revoke privileges for unethical or unprofessional behavior. Requires 125 total hours of continuing medical education every 5 years (25 hours in patient safety).
**In-office operating rooms and procedure rooms**. AAAASF. Private entity that certifies in-office operating and procedural rooms. Must have admitting/operating privileges at an acute hospital within 30 minutes' drive. Recommend overnight observation for high-volume liposuction (>5L). ASPS. Recommends operations less than 6-hour cases at in-office OR.`
  }
};

const subsectionTitles: Record<string, Record<string, string>> = {
  'comprehensive': {
    'anatomy': 'Anatomy',
    'skin-lesions': 'Skin Lesions',
    'flaps-and-grafts': 'Flaps & Grafts',
    'microsurgery': 'Microsurgery',
    'infections': 'Infections',
    'burns': 'Burns',
    'trunk': 'Trunk & Gender-Affirming Surgery',
    'vascular-anomalies': 'Vascular Anomalies',
  },
  'hand-lower-extremity': {
    'hand-digit-trauma': 'Hand & Digit Trauma',
    'hand-nerves': 'Hand Nerves',
    'hand-tendons': 'Hand Tendons',
    'replantation-vascular': 'Replantation & Vascular',
    'wrist-forearm-injuries': 'Wrist & Forearm Injuries',
    'hand-tumors': 'Hand Tumors',
    'hand-inflammation-infections': 'Hand Inflammation & Infections',
    'congenital-pediatric-hand': 'Congenital and Pediatric Hand',
    'lower-extremity': 'Lower Extremity',
  },
  'craniomaxillofacial': {
    'cleft-lip-palate': 'Cleft Lip & Palate',
    'facial-fractures': 'Facial Fractures',
    'facial-paralysis': 'Facial Paralysis',
    'ear-reconstruction': 'Ear Reconstruction',
    'mandible-dental-orthognathic': 'Mandible, Dental, & Orthognathic',
    'head-neck-tumors': 'Head and Neck Tumors',
    'congenital-syndromes': 'Congenital Syndromes',
  },
  'breast-cosmetic': {
    'breast-augmentation': 'Breast Augmentation',
    'breast-reduction-mastopexy': 'Breast Reduction & Mastopexy',
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
    'statistics-ethics-practice': 'Statistics, Ethics, & Practice Management',
  }
};

export function loadReferenceText(): ReferenceSection[] {
  const sectionOrder = [
    { id: 'comprehensive', title: 'Section 1: Comprehensive' },
    { id: 'hand-lower-extremity', title: 'Section 2: Hand & Lower Extremity' },
    { id: 'craniomaxillofacial', title: 'Section 3: Craniomaxillofacial' },
    { id: 'breast-cosmetic', title: 'Section 4: Breast & Cosmetic' },
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
