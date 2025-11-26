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
5 layers (deep to superficial): Basal, spinosum, lucidum, granulosum, corneum.
Keratinocytes Originate from basal layer, 90% of epidermis cells, acts as environmental barrier.
Melanocytes.

## Dermis
Papillary (superficial).
Reticular (deep): Hair roots, sebaceous and sweat glands.
Predominantly made of type I collagen.

# Benign Skin Conditions

## Hidradenitis suppurativa
Apocrine gland involvement; forms subcutaneous fistulae from occlusion of folliculopilosebaceous units.
Treatment includes topical/oral antibiotics (1st line, mild cases), TNF-alpha inhibitors (2nd line, moderate cases).
Treatment involves excision of involved areas, reconstruction.

## Dermoid cyst
Most common childhood skin lesion.

## Cylindromas
Benign adnexal tumors.
Diagnosis involves firm, nodular, pink-colored scalp lesions.
Treatment includes excision.

## Pilomatricoma
Slow-growing blue nodule associated with hair follicle, calcific features.
Diagnosis involves firm to touch, tender.
Risk factors include teenagers.
Treatment includes excision.

## Spiradenomas
Benign dermal neoplasms.
Diagnosis involves small, painful, bluish nodules.
Treatment includes excision.

# Malignant Skin Diseases

## Basal cell carcinoma
Pearly round nodules.
Risk factors include xeroderma pigmentosum. X-linked recessive gene impairing nucleotide excision repair. Diagnosis involves extreme sun sensitivity, extensive photoaging, dry skin.
Treatment includes non-surgical: topical creams (5-FU, imatinib), electrodesiccation and curettage for superficial lesions, XRT for high-risk patients (non-surgical candidates).
Treatment includes Moh's excision. Involves real-time circumferential skin lesion sectioning with frozen section review. Associated with high cure rate (>95% for basal and squamous cell carcinomas).
Treatment involves excision with 4mm margins.

## Squamous cell carcinoma
Arises from stratum basale. Histology poorly differentiated cords of spindle cells from keratinocytes.
Aggressive subtypes adenoid, adenosquamous, desmoid.
Actinic keratosis ~10% malignant risk. Treatment includes cryotherapy, imiquimod (acts on skin immune system), topical 5-FU.
Most-common primary malignant skin tumor of the hand.
Treatment includes Moh's.
Treatment involves wide local excision with 6mm margins for low risk, 1cm for aggressive tumors, XRT for non-surgical candidates (efficacy better for smaller lesions).

## Melanoma
Arises from stratum basale.
Clinical features (ABCDs): Asymmetry, irregular Border, heterogenous Color, Diameter > 6mm.
Ulceration has worse prognosis.
Types superficial spreading (#1), nodular (grows more vertically, lowest disease-specific survival).
Lentigo maligna melanoma in situ variant. Treatment includes excision, XRT, topical imiquimod (upregulates immunomodulation).
Neurocutaneous melanosis. Midline involvement, >20 satellite lesions. Dx MRI central nervous system screening before 6 months.
Diagnosis involves punch biopsy for depth, labs (LDH), imaging (CXR, possible PET/CT).
Treatment includes Wide local excision:  Margins: <1mm depth – 1cm, 1-2mm – 1-2cm, >2mm – 2cm. Lymph node management:  Sentinel lymph node biopsy (SLNB): indicated for >0.7mm primary lesion depth. Completion lymph node dissection: high nodal burden (>3), extracapsular extension. Systemic therapy (immunotherapy): indications include positive nodal disease, distant metastases.

## Merkel cell carcinoma
Neuroendocrine tumor.
Histologically, it features nuclear molding, small blue cells, salt-and-pepper chromatin on Hematoxylin and Eosin.
Risk of development Merkel cell polyomavirus (>80% of cases).
Treatment includes surgery with 1-2cm margins + XRT, SLNB.
Poor prognosis.

## Angiosarcoma
Rapidly-growing red or purple macules or nodules; usually in head and neck.
It is associated with prior XRT or lymphedema.
Treatment includes surgery, XRT, chemotherapy; poor prognosis.


## Split-thickness skin graft (STSG)
More forgiving to recipient site than full-thickness skin graft.
First-intention failure inadequate recipient site vascularity, infection, seroma, hematoma.
Seroma/hematoma can prevent graft from taking; avoid by messengering, pie-crusting.
Requires immobilization/bolster to prevent shearing.
Less secondary contracture than full-thickness skin graft.
Thinner grafts lower metabolic demand, higher skin contracture rate, requires less vascular bed.
Heals by secondary intention.

## Full-thickness skin graft (FTSG)
Less secondary contracture than split-thickness skin graft.
Requires higher quality recipient site.
Heals by primary intention.
Better pigmentation match.
Thicker grafts more durable, less re-epithelialization.

## Composite graft
Multiple tissue types taken together from donor site; requires meticulous recipient bed.
Example ear cartilage + skin, dermal-fat graft.

# Flap Classification

Mathes and Nahai muscle flap blood supply classification Type I single vascular pedicle (gastrocnemius, tensor fascia lata). Type II dominant pedicle, minor pedicles (gracilis, soleus, trapezius). Type III two dominant pedicles (gluteus maximus, rectus abdominus). Type IV segmental pedicles (sartorius, external oblique). Type V single dominant pedicle, secondary segmental pedicles (latissimus, pectoralis major).

## Flap types
Axial carries own blood supply.
Random survives off subdermal plexus. Often 3 1 length-to-width ratio. Bipedicled can go down to 2 1 length-to-width ratio.

## Z plasty
Used commonly in scar contracture releases.
Gain length by rearranging width.
30 degrees 25% gain in length.
45 degrees 50%.
60 degrees 75%.
75 degrees 100%.
90 degrees 125%.
5-flap Z plasty Includes a V to Y advancement to the central limb for lengthening.

## Keystone flap
Perforator island fasciocutaneous local flap.
Design with same width as defect, double V to Y donor closure.
No undermining performed to the flap.

# Flap Anatomy

## Neck
Submental fasciocutaneous flap. The vascular supply is from the submental artery off cervical branch of facial artery. Traverses level I lymph nodes in neck. Use in intra-oral and lower face soft-tissue reconstruction.

## Trunk
Latissimus dorsi muscle/musculocutaneous flap. The vascular supply is from the thoracodorsal artery. Its function includes shoulder adduction, extension, internal rotation. Donor site has decreased shoulder range of motion that improves by one year. Versatile flap used mostly in breast reconstruction and trunk reconstruction; is the largest single muscle available for free flap.
Trapezius flap. The vascular supply is from the transverse cervical artery. Used in cervical-spine reconstruction.
Scapula bone flap. The vascular supply is from the circumflex scapular artery off subscapular artery. Traverses triangular space (teres minor, teres major, long head of triceps). Tip of scapula, can be chimeric flap with other tissues from subscapular system (latissimus dorsi, parascapular flaps). Used for shoulder, back of neck, axilla reconstruction.
Paraspinous flap. Type IV segmental blood supply. Used in spinal coverage.
Omentum flap. The vascular supply is from the right and left gastroepiploic arteries (only need one side). Used in sternal reconstruction, lymphatic surgery; needs subsequent skin coverage.
Lumbar artery perforator flap. Vascular L4 lumbar artery perforator. Runs between erector spinae and quadratus lumborum. Innervation is from the cluneal nerve. Used as a secondary breast free flap option.
Groin flap. The vascular supply is from the superficial circumflex iliac artery. Used as a distant (non-microsurgical) flap for hand coverage.
Superficial circumflex iliac perforator. Thin, pliable flap; improved donor morbidity compared to radial forearm flap.
Iliac crest osteocutaneous flap. The vascular supply is from the deep circumflex iliac. Used as an alternative bone flap in mandibular reconstruction; better vertical height than fibula.

## Upper Extremity
Lateral arm flap. The vascular supply is from the posterior radial collateral artery. Runs between lateral triceps and brachialis. Used in forearm and hand reconstruction as a thin fasciocutaneous free flap.
Reverse lateral arm flap. The vascular supply is from the radial recurrent artery. Used for elbow coverage as a pedicled flap.
Radial forearm flap. The vascular supply is from the radial artery. Need normal Allen's test (intact palmar arch). Thin, pliable fasciocutaneous flap; can be innervated flap using lateral antebrachial cutaneous nerve. Used as pedicled (anterograde) for elbow coverage, reversed for hand coverage (to level of proximal interphalangeal joints), or free flap for head and neck reconstruction (e.g., hemiglossectomy defects), phalloplasty.
Ulnar artery flap. The vascular supply is from the ulnar artery. Less tendon exposure risk than radial forearm flap. Shorter pedicle, smaller diameter vessel than radial forearm flap.
Posterior interosseous artery flap. The vascular supply is from the posterior interosseous artery. Runs between extensor digiti minimi and extensor carpi ulnaris. Used for hand and elbow coverage; pedicle length limits free flap use.

## Lower Extremity
Medial sural artery perforator flap. The vascular supply is from the medial sural artery perforator. Used for heel coverage, Achilles coverage.
Sural artery flap. The vascular supply is from the lesser saphenous vein and sural nerve. Used for heel and Achilles coverage; pedicled flap.
Fibula bone flap. The vascular supply is from the peroneal artery. Segmental bone flap. Skin paddle posterior/lateral leg. Used in mandibular reconstruction; donor site has increased ankle fracture risk.
Anterolateral thigh flap. The vascular supply is from the descending branch of lateral circumflex femoral artery. Innervation is from the lateral femoral cutaneous nerve. Muscle perforator or septocutaneous. Versatile flap with long pedicle, large donor site. Used in head and neck reconstruction, trunk reconstruction, extremity coverage.
Profunda artery perforator flap. Vascular 1st or 2nd perforator of profunda femoris artery. Innervation is from the posterior femoral cutaneous nerve. Used in perineal reconstruction, breast reconstruction; disadvantage is prone position for flap harvest.
Gracilis flap. The vascular supply is from the medial circumflex femoral artery. Used in perineal reconstruction, breast reconstruction, functional muscle transfer.
Tensor fascia lata flap. The vascular supply is from the ascending branch of lateral circumflex femoral artery. Used in trochanteric coverage, abdominal-wall defects.
Rectus femoris flap. The vascular supply is from the descending branch of lateral circumflex femoral artery. Used for pelvic and groin coverage.`
  },
  'hand-lower-extremity': {
    'hand-digit-trauma': `# Dislocations

## Thumb
Anatomy The most common dislocation dorsally through dorsoradial ligament.
CMC stabilizers Volar oblique, ulnar collateral, intermetacarpal, dorsoradial (most important), posterior oblique, anterior oblique (prevents radial subluxation).
Occurs with axial force, flexion of the wrist.
Diagnosis involves XR with anteroposterior and lateral views in 30 degrees of pronation.

## Finger dislocations
Proximal interphalangeal (PIPJ) joint dislocation. Simple: reduce. Complex: unable to reduce due to interposed soft tissue. Dorsal (MC): interposed volar plate. Volar: interposed extensor tendon. Diagnosis involves Elson test to assess central slip integrity.
Metacarpophalangeal (MCP) joint dislocations. Rare, often complex due to volar plate interposition. Treatment includes surgical. Volar: higher risk of digital nerve injury. Dorsal: unable to repair volar plate.

# Phalangeal, metacarpal fractures

## Bennett fracture
Thumb metacarpal base intra-articular fracture.
Reduce with axial traction, pronation, and palmar abduction.

## 5th metacarpal neck (Boxer's) fracture
Can tolerate up to 70 degrees of angulation.
Treatment includes buddy tapes (ring to small finger)/active range of motion.
Treatment involves The most common for malrotation.

## Metacarpal fractures
Interosseous muscles most likely to incarcerate in fracture line.
Open fractures Minor soft tissue injury can be irrigated, closed, splinted in ER with short-course antibiotics, outpatient follow up.
Treatment includes multiple operative techniques (pinning, plating, intramedullary screw fixation, lag screw).
Lag-screw fixation used for oblique fractures, allows primary bone healing.

## Proximal interphalangeal joint (PIPJ) fracture/dislocation
Simple, stable (<30% joint surface). Diagnosis involves assess stability of joint with up to 30 degrees of PIPJ flexion. Treatment includes extension-block splinting or pinning (maintain in slight flexion).
Pilon base fractures, unstable fractures Treatment includes dynamic external fixation.
30-50% volar base fractures Treatment includes hemi-hamate arthroplasty, volar plate arthroplasty.

# Ligament Injuries

## Intrinsic-plus splint position
Wrist extended (30 degrees), metacarpophalangeal joints (MCPJs) flexed (75-90 degrees), interphalangeal joints (IPJs) extended (0 degrees).
Maintains MCPJ collateral ligaments at full length.

## Intrinsic tightness
Intrinsic tightness passive flexion of proximal interphalangeal joint (PIPJ) tight with MCPJ hyperextended.
Extrinsic tightness PIPJ flexion tight with MCPJ flexed.

## Ulnar collateral ligament injury
Instability of thumb MCPJ with radial-directed force.
Symptoms include weakness, pain with pinch tasks.
Diagnosis involves increased laxity >30 degrees of radial-directed stress to thumb, compare to contralateral thumb.
Diagnosis involves stress view XR.
US (or MRI) evaluates for Stener lesion (UCL retracts into adductor muscle).
Treatment includes splinting (1st line).
Treatment includes ulnar collateral ligament reconstruction for failure of non-operative treatment, Stener lesion.

# Digit Reconstruction

## Thumb reconstruction
Thumb is 40-50% of overall hand function, favor functional reconstructions.
Volar defects First dorsal metacarpal artery flap (larger defects), Moberg flap (defects <1.5cm, up to 2cm with islandization).
Volar and dorsal defects Great toe wraparound flap at proximal phalanx level.
Total thumb reconstruction. CMC and metacarpal base present toe-to-thumb transfer. CMC or metacarpal base absent pollicization.
1st webspace contracture. Skin only Z plasties (four-flap), skin grafts. Deep structures flap coverage (e.g., posterior interosseous reverse flap).

## IPJ arthroplasty
Silicone arthroplasty Improves pain, not motion.

## Fillet of finger flaps
Useful to provide coverage and reduce returns to OR.
Consider when otherwise unsalvageable bone stock of injured finger.

## Nailbed injuries
Germinal matrix produces nail, sterile matrix is adherent to nail.
Tx (large subungual hematoma or laceration):  Acute: repair nail bed (2-octyl cyanoacrylate with similar outcomes, less time-consuming than suture repair). Chronic: split thickness nail matrix graft from toe, nail ablation.
Hook nail soft tissue defect from loss of distal sterile matrix, inadequate bone/soft tissue support for nail. Treatment includes release scar with soft-tissue augmentation, excision of distal sterile matrix.
Nail ridging from untreated nail bed injury Treatment includes attempt direct closure of nail bed at re-repair.

## Fingertip Injuries
Secondary intention healing for <1.5cm, no exposed bone. Treatment includes moist wound healing, petroleum jelly. Better sensation than flaps or skin grafts; associated with longer healing time.

## Finger soft-tissue reconstruction
Cross-finger flap uses dorsal skin from adjacent digit for a volar wound.
Reverse cross-finger flap uses dorsal skin from adjacent digit for a dorsal wound.`,

    'hand-nerves': `# Anatomy

## Brachial plexus
Upper roots (C5-7) proximal functions (shoulder function, elbow flexion). Symptoms include shoulder adducted/internally rotated, elbow extended, forearm pronated, fingers flexed.
Lower roots (C8-T1) distal functions (wrist, hand).
Posterior cord. Axillary nerve From upper roots (C5-C6); innervates deltoid (shoulder abduction), some of triceps. C7 root Contributes innervation to triceps. Radial nerve From lower roots (C8 to T1); innervates wrist and digital extension, some of triceps.
Lateral cord. Musculocutaneous nerve From upper roots (C5-7); innervates biceps, brachialis for elbow flexion.
Medial cord. Median nerve Innervates thumb intrinsics, flexor carpi radialis (FCR), flexor pollicis longus (FPL), flexor digitorum superficialis (FDS), flexor digitorum profundus (FDP) [index, middle fingers], pronator teres. Ulnar nerve Innervates hand intrinsics (interosseous), flexor carpi ulnaris (FCU), FDP (ring and small fingers).

## Superficial nerves
Medial antebrachial cutaneous nerve Follows basilic vein on ulnar aspect of forearm.
Lateral antebrachial cutaneous nerve Follows cephalic vein on radial aspect of forearm; musculocutaneous nerve branch.
Intercostobrachial nerve Innervates medial upper arm; nerve pierces through serratus anterior.
Dorsal sensory branch of ulnar nerve Supplies dorsal/ulnar hand sensation.
Saphenous nerve Innervates medial malleolus; travels along with greater saphenous vein.

# Compression Neuropathies

## Carpal tunnel syndrome
Symptoms include numbness to thumb, index, middle fingers, worse at night; can progress to affect thumb intrinsic/thenar muscles.
Diagnosis involves clinical or electrodiagnostic testing. Nerve conduction studies: median nerve sensory peak latency >3.5ms, motor >4.5ms. Diagnosis involves US or MRI with increased cross-sectional area of median nerve. Diagnosis involves amyloidosis (~10% of bilateral carpal tunnel); congo red stain on tenosynovium biopsy.
Treatment includes night splinting (mild), corticosteroid injection for short-term relief.
Treatment involves carpal tunnel release for symptoms >3 months, failure of conservative measures. No difference between open and endoscopic approaches long-term.

## Cubital tunnel syndrome
Symptoms include ring and small finger numbness; can progress to finger weakness due to affecting finger intrinsics.
Diagnosis involves Froment sign: pull a paper from a patient pinching, look for compensation with thumb flexion (FPL).
Diagnosis involves clinical or electrodiagnostic test (velocity decrease ~10m/s around elbow).
Treatment includes elbow extension splint.
Treatment involves cubital tunnel release in situ. Anterior transposition (submuscular or subcutaneous) if ulnar nerve subluxation, recurrence. Areas of compression Osbourne ligament (near medial epicondyle), medial intermuscular septum and arcade of Struthers in upper arm, FDP heads in forearm, anconeus epitrochlearis (congenital anomalous muscle in medial elbow).

## Guyon's canal
3rd most-common compressive neuropathy site (2nd most-common ulnar nerve compression site).
Borders hypothenar muscle, transverse carpal ligament, volar carpal ligament, pisiform.

## Anterior interosseous nerve syndrome
Motor only affects FPL, FDP index finger.

## Pronator/lacertus fibrosis compression
Motor and sensory to median nerve at forearm.
Includes anterior interosseous nerve weakness, thumb intrinsic weakness motor changes.

## Radial tunnel syndrome
Symptoms include lateral forearm pain.
Diagnosis involves tenderness 5cm distal to lateral epicondyle, no motor symptoms.
Diagnosis involves MRI.

## Posterior interosseous palsy
Diagnosis involves intact tenodesis effect (tendons intact), no active extension of digits.

## Superficial branch of radial nerve compression
Symptoms include numbness over dorsal thumb and index finger.
Treatment includes splinting, rest.
Treatment involves release fascia between brachioradialis and extensor carpi radialis longus (ECRL). Pierces ECRL at 8cm proximal to radial styloid.

# Nerve Injuries

## Sunderland classification
I Neurapraxia segmental demyelination.
II Axonotmesis intrafascicular injury (mild).
III Axonotmesis (moderate).
IV Axonotmesis (severe).
V Neurotmesis transection of nerve.
VI Mixed components.

## Electrodiagnostic testing
EMG May see some changes as early as 10 days from injury.
Complete denervation positive sharp waves, fibrillation potentials, decreased motor unit recruitment.
Nerve recovery nascent potentials.

## Brachial plexus injury
Diagnosis involves MRI a few weeks from injury to evaluate for root avulsions.
Nerve root injury can affect diaphragm (C3-5).
Treatment includes nerve transfers if no functional or EMG recovery at 3-6 months.

## Radial nerve injury
Early reinnervation brachioradialis, extensor carpi longus and brevis (ECRL, ECRB).
Last reinnervation extensor indicus proprius.

## Ulnar nerve injury
Innervates FDP ring and small fingers, FCU proximally in forearm, digital intrinsic muscles distally in hand.
Weak digital abduction/adduction, thumb adduction (adductor pollicis).

## Complex regional pain syndrome
Symptoms include burning pain, stiffness.
Risk factors include smokers, female.
Diagnosis involves shiny, swollen, warm skin, hypersensitivity on exam.
Diagnosis involves Normal EMG/NCS, bone scan with increased area intake.
Pathophysiology changes to C nerve fibers.
Types I no identifiable nerve; II identifiable nerve.

## Parsonage-Turner
Acute brachial neuritis, can occur after viral infection.
Diagnosis involves multiple peripheral nerves involved on EMG/NCS, hourglass constriction of the brachial plexus on MRI.

# Nerve Repairs

## Repair and reconstruction
Tension-free coaptation (#1 technical factor).
Use nerve grafts for gaps >1cm.
Nerve autografts sural, lateral antebrachial cutaneous, medial antebrachial cutaneous.
Age (#1) most predictive of outcome, more distal injury favorable to proximal injury.
Nerve regenerates at ~1mm/day, can reinnervate muscle 12-18 months from injury.

## Nerve transfers
Consider when distance from injury to motor end plates unlikely to reinnervate.
Anterior interosseous (intrinsic) nerve transfer. Used to reestablish hand intrinsic function after proximal ulnar nerve injury (around elbow). Treatment includes anterior interosseous nerve from pronator quadratus transferred to ulnar motor branch at distal forearm. Ulnar nerve topography at distal forearm: sensory/motor/sensory.
Elbow flexion nerve transfer. Tx FCU fascicle of ulnar nerve to brachialis (Oberlin) +/- FCR of median (McKinnon) to biceps branches.

## Free functional muscle transfer
Role in complete plexopathy.
Use extra-plexus donor nerve (e.g., spinal accessory, intercostals).
Spinal accessory nerve runs in posterior triangle of the neck, innervates sternocleidomastoid, trapezius muscles.
The most common gracilis flap used to restore elbow flexion.

## Neuroma in continuity
Treatment includes excise, repair with nerve graft.

# Tendon Transfers

Need supple joints, soft tissue equilibrium, donor of adequate excursion, adequate strength donor, expendable donor, straight line of pull, synergy, single function per transfer.
Tendon transfers PT to ECRB, FCR to extensor digitorum communis (EDC), FDS IV to extensor pollicis longus (EPL).

## Targeted muscle reinnervation
Major peripheral nerve to selective motor branch nerve transfer.
Select synergistic transfers e.g., median nerve to flex digits.
Decreases phantom pain, improved ability to use myoelectric prosthetics.
Billed as a pedicled nerve transfer.
Primary TMR performed at amputation.
Secondary TMR performed after amputation for pain or phantom sensation. Pain initially worse for first 6 weeks, then plateaus and decreases over following 6 months.

## Myoelectric prosthesis
Senses surface EMG signals.
Targeted muscle reinnervation creates stronger signals.
More complex motions than body-powered prosthesis.
Synergistic functions Above-elbow amputation median nerve to biceps (short head) for hand closure.`,

    'hand-tendons': `# Flexor Tendons

## Exam
Flexor digitorum superficialis (FDS). Actively flexes proximal interphalangeal joint (PIPJ) with other digits in extension. Orientation of tendons (wrist level): middle and ring finger tendons volar to index and small finger tendons. Small finger FDS absent in ~15% of people.
Flexor digitorum profundus (FDP). Actively flexes distal interphalangeal joint (DIPJ) with other digits in extension. Linburg-Comstock anomaly: congenital adhesion between FPL and FDP index finger proximal to carpal tunnel.
Tenodesis effect. Passively extend wrist, assess digital cascade for abnormalities.
Lumbrical muscle. Actively flexes MCPJ. Originates from FDP in proximal palm, insert on radial lateral band.

## Injuries
5 zones from distal to proximal. I distal to FDS insertion. II between FDS insertion to A1 pulley/distal palmar crease. III between A1 pulley and carpal tunnel. IV carpal tunnel. V forearm.

## Zone II
Treatment involves repair within 2 weeks. Strength of repair related to # of core strands, suture size, locking suture, suture location (should be dorsal). 1cm bites optimal suture distance for repair. Repair of one FDS associated with decreased tendon resistance compared to both FDS slips.
Post-operative care occupational therapy for 3-6 months. Early active motion begins first few days after repair (same rupture risk, better range of motion compared to other protocols). Modified Duran early passive motion protocol, typically don't start active motion until 3-4 weeks after repair.

## Staged flexor tendon repair
Necessary after >2 weeks from injury or significant damage to pulleys.
Attritional changes occur to flexor tendon over time.
Treatment includes 2-stage reconstruction. Stage 1: place silicone rod from DIPJ to central palm or distal forearm, allow capsule to recreate pulley system for 12 weeks. Stage 2: exchange silicone rod for tendon autograft.
Treatment includes Paneva-Holevich (2-stage reconstruction variation): suture FDS to FDP, place silicone rod distally at stage 1, use FDS as tendon autograft to distal FDP stump at stage 2.

## Secondary flexor tendon surgery
e.g., tenolysis need passive greater than active motion, stable soft tissues.
Wait at least 6 months after initial repair.

## Partial lacerations
Can trial conservative therapy up to 90% laceration (unless there's triggering).

## Jersey finger
Flexor zone I (FDP) distal rupture.
Classification I avulsion to palm. II retraction to PIPJ with bone segment. III retraction to DIPJ with bone segment. IV fracture, tendon avulsion. V comminuted distal phalanx fracture.
Treatment includes types I: repair <1 week, II, III repair <3 weeks.

## Pulley injuries

### A1 pulley
Odd numbered pulleys originate from volar plate.
Stenosing tenosynovitis (trigger finger). Flexed posture of digit, usually able to manually reduce. Risk factors include diabetes. Treatment includes steroid injection. Treatment includes A1 pulley release if recurrent, advanced disease. Wait 12 weeks after steroid injection before surgery.

### A2 pulley
Arises from bone.
50% of pulley needed to prevent tendon bowstringing.
Closed rupture of pulley. Associated with rock climbing positions. Treatment includes rest, ice, ring splint. Treatment includes tendon autograft pulley reconstruction.

# Extensor Tendons

## Anatomy
VIII zones Progress from distal to proximal (odd over joints, even over bones).
Zone VII Extensor retinaculum.
Zone VIII forearm.
Most distal forearm muscle belly for extensor tendons extensor indicis proprius (EIP).

## Exam
Central slip (extensor zone III) injury. Main tendon for PIPJ extension. Diagnosis involves Elson test: cannot actively extend DIPJ in flexed MCPJ and PIPJ position with intact central slip due to lateral bands (but can extend PIPJ due to intrinsics). Treatment includes PIPJ extension splinting for 4-6 weeks or surgical repair.
Intubated/non-cooperative patient Assess tenodesis effect (passively flex the wrist, assess digital extension).

## Injuries

### Zone III-V lacerations
Treatment includes repair and relative motion extension splint (better motion outcomes compared to traditional splint/motion protocols).

### Proximal interphalangeal joint flexion contracture
Test intrinsic/extrinsic tightness with Bunnell test.
Treatment includes release volar plate, checkrein ligaments.

### Boutonierre deformity
Central slip injury PIPJ flexes, DIPJ extends in collapse pattern.
Can be traumatic or inflammatory.
Diagnosis involves loss of active IPJ extension against force, abnormal Elson's test.
Treatment includes splint with PIPJ extended, DIPJ free.

### Swan neck deformity
PIPJ extends, DIPJ flexes (extensor lag).
The most common from distal phalanx injury with nonunion (bony mallet), then zone I extensor tendon injury (soft tissue mallet).
Acute/subacute mallet finger (extensor zone I). Treatment includes splint in extension x 6-8 weeks. Treatment includes pin DIPJ in extension if unable to tolerate splint or volar subluxation of distal phalanx.

### Sagittal band injury
Maintains position of extensor tendon over the metacarpal head.
Symptoms include swelling, inability to extend MCPJ from flexed position.
Treatment includes relative extension splinting; direct repair (acute) or reconstruction (chronic).

### Extensor pollicis longus rupture
Inability to extend thumb IPJ or retropulse thumb.
3rd extensor compartment, ulnar to Lister's tubercle in distal radius.
Attritional ruptures occur with closed management of non-displaced distal radius fractures.
Treatment includes tendon transfer: EIP to extensor pollicis longus.

### 1st extensor compartment tendinopathy (De Quervain's)
Symptoms include radial styloid pain, swelling of radial/distal forearm, worse with thumb movements.
Diagnosis involves Eichoff test with pain to radial styloid with ulnar deviation of wrist with thumb flexed in palm.
Treatment includes steroid injection, immobilization, surgical release.
Non-surgical treatment less effective when septum between abductor pollicis longus and extensor pollicis brevis exists.

### Intersection syndrome
Diagnosis involves pain 4-5cm proximal to Lister's tubercle, swelling, worse with wrist extension.
Treatment includes splint, steroid injection; 2nd extensor compartment release.

### Lumbrical-plus deformity
Paradoxical extension of the IPJ with active flexion of remaining digits.
Due to shortening of the FDP and lumbrical muscle.`,

    'replantation-vascular': `# Replantation

The most common table saws (#1) for adults.
Relative indications Thumb, child, multiple digits, flexor zone I, proximal amputations (e.g., wrist, forearm).
Relative contraindications Ring avulsion, single-digit flexor zone II, multi-segmental injury.

## Timing of replantation
Digits no muscle tissue, more tolerant of ischemia. Cold ischemia time 24 hours (case reports with longer ischemic times). Warm ischemia time up to 12 hours.
Proximal amputations. Cold ischemia time 12 hours. Warm ischemia time 6 hours. Consider arterial shunts to restore blood flow within 6 hours (may need to prioritize reperfusion over bony stabilization pending time from injury); muscle most susceptible to ischemia.

## Repair
Options digit-by-digit sequence (one digit at a time) vs structure-by-structure (bone, tendon, microsurgical repairs).
Favorable factors mechanism of injury (#1), number of veins repaired, better outcomes at high-volume centers.
Use vein grafts for large gap arterial injuries (>2cm).

## Prostheses
Forearm-level amputation. Wrist disarticulation preserves forearm rotation. Transradial better prosthetic fitting (need 5cm of ulna length distal to elbow to fit prosthesis).

# Other Vascular Diseases

## Hypothenar hammer syndrome
Symptoms include ischemic changes to ring and small finger, cold sensitivity, coolness, finger ulceration, distal emoblization.
Diagnosis involves digital-brachial index (<0.7 abnormal, <0.5 associated with tissue loss).
Diagnosis involves angiogram with tortuous ulnar artery at proximal hand level.
Treatment includes aspirin, calcium-channel blockers (1st line if mild).
Treatment includes surgery: ulnar artery segment with vascular reconstruction (if moderate/severe symptoms), ligation if fingers perfused.

## Acute upper extremity arterial embolism
Diagnosis involves Doppler US, CT or MR angiography, formal angiography.
Treatment includes heparin gtt (1st), then surgery if amenable location of clot.

## IV extravasation
Treatment includes surgery: full-thickness skin necrosis, chronic ulceration, persistent pain, known caustic agent (e.g., certain chemotherapeutics).

## Pseudoaneurysm
Symptoms include pulsatile, rapidly enlarging mass.
Treatment includes IR if small, otherwise explore and repair vessel.

## Supracondylar humerus fractures
It is associated with distal ischemia from brachial artery involvement.
Treatment includes closed reduction, reassess pulses.
If no return of pulses, angiographic imaging.

## Brachial arterial line
The most common median nerve injury.

# Other Hand Emergencies

## High-pressure injection injury
Paint solvents, oils at >2,000 psi.
Can cause vascular compromise, severe damage to soft tissues, compartment syndrome, infections.
Diagnosis involves XR if radiopaque material injected.
Treatment includes emergent debridement.
High amputation rate (30%), worse with treatment delays.`,

    'wrist-forearm-injuries': `# Carpal Injuries

## Scaphoid fracture
The most common carpal fracture.
Diagnosis involves anatomic snuff box tenderness.
Diagnosis involves XR (scaphoid view: wrist 20 degrees ulnar deviation, 20 degrees extension).
Diagnosis involves MRI best test for occult fractures or evaluate for union.
Treatment involves Distal pole cast x 6-12 weeks or surgery for displacement, faster return to activities. Waist and proximal pole consider screw fixation. Retrograde blood supply, proximal pole most prone to nonunion. Scaphoid nonunion advanced collapse (SNAC) arthritic pattern from scaphoid nonunion. Treatment includes scaphoidectomy and 4-corner fusion vs proximal row carpectomy.

## Hamate
Hook of hamate fracture. Symptoms include ulnar nerve symptoms, pain, flexor tendon injuries (decreased grip strength). The most common tendon rupture small finger flexor. Dx XR (carpal tunnel view), CT scan.

## Wrist ligament injuries

### Scapholunate ligament injuries
Scapholunate advanced collapse (SLAC) arthritic pattern. Starts as a dorsal intersegmental instability (DISI) deformity; scaphoid flexes, lunate extends. Arthritis develops proximal row then midcarpal (radioscaphoid, scaphocapitate, capitolunate, then radiolunate). Diagnosis involves XR with scapholunate gap >3mm, scapholunate angle >70 degrees on lateral, contralateral side with clenched fist view (axial loading of wrist). Diagnosis involves arthroscopy (most accurate). Treatment includes scaphoidectomy and four-corner fusion or proximal row carpectomy.

### Lunate dislocation
Mayfield classification predictable progression of intrinsic ligament injuries. I Scapholunate ligament (SL) injury. II lunocapitate ligament injury. III lunotriquetral ligament injury. IV volar dislocation of lunate out of fossa.
Short radiolunate ligament generally remains intact.
Symptoms include acute median nerve sensation changes (acute carpal tunnel syndrome).
Diagnosis involves XR with changes in Gilula's lines on PA; spilled teacup or volar lunate laterally.
Treatment includes immediate closed reduction followed by ORIF +/- carpal tunnel release (urgent if irreducible or persistent median-nerve symptoms after reduction).
Preserves 65-70% wrist flexion/extension, 80% grip strength compared to uninjured side.
XR shows post-traumatic arthritis.

### Volar intersegmental instability (VISI)
Triquetrum extends, lunate flexes.

## Distal radius fractures
Similar functional and radiographic outcomes with short- vs long-arm casting; with less shoulder pain with short-arm cast.

# Wrist Kinematics

Proximal row scaphoid flexes the wrist, triquetrum extends, kept neutral by lunate.
Distal row allows dart thrower's motion (radial inclination in extension and moves to ulnar inclination in flexion).
Ulnar variance Diagnosis involves lateral XR most accurate view.

# Compartment Syndrome

## Acute
Symptoms include severe pain, possible numbness.
Risk factors include obtunded, crush injury, reperfusion injury (TNF alpha release).
Diagnosis involves pain with passive stretch, paresthesia, paralysis, pallor, pulselessness (late) on exam.
Diagnosis involves compartment manometry (compartment pressure >30 or within 30 of diastolic blood pressure).
Diagnosis involves lab changes (hyperkalemia, metabolic acidosis, hypocalcemia).
Rhabdomyolysis can progress to acute kidney injury.
Treatment includes compartment release.

## Chronic
Volkmann ischemic contracture. Affects deep volar compartment 1st. Treatment includes occupational therapy. Treatment includes surgical tendon lengthening (mild), flexor pronator slide (moderate), superficialis to profundus (severe), free functional muscle transfer (severe).

# Elbow and Forearm Pathology

## Extensor carpi radialis brevis (ECRB) enthesopathy (lateral epicondylitis)
Degenerative changes at attachment of ECRB to lateral epicondyle.
Diagnosis involves lateral elbow tenderness with hyperextension of middle finger (ECRB inserts on base of third metacarpal).
Treatment includes occupational therapy/activity modification/stretching exercises, corticosteroid injection, surgical debridement (outcomes the same regardless of treatment).

## Distal radioulnar joint instability
It is associated with Essex Lopresti, Galeazzi injuries affecting the interosseous membrane.`,

    'hand-tumors': `# Cysts

## Digital mucous cyst
Secondary to distal interphalangeal osteoarthritis, can involve nail fold.
Diagnosis involves XR with osteophyte at distal interphalangeal joint.
Treatment includes excise cyst cavity, remove osteophyte.

## Ganglion cyst
The most common dorsal wrist (~60% of all ganglion cysts) from scapholunate area; volar cysts possible (The most common radioscaphoid area).
Symptoms include wax/wane in size.
Diagnosis involves transilluminates on exam.
Treatment includes excision (~50% recurrence risk).

# Benign Soft-Tissue Masses

## Glomus tumor
The most common subungual.
Symptoms include blueish appearance, severe pain with localized pressure, sensitive to cold, pinpoint sensitivity, paroxysmal pain.
Diagnosis involves cold-water test, pain decreases with inflation of blood-pressure cuff.
Diagnosis involves MRI T2 (lesion is bright).
Treatment includes complete surgical excision.

## Giant cell tumor of tendon sheath
Tan, multi-lobulated mass.
Diagnosis involves does not transilluminate on exam.
Diagnosis involves XR can invade bone cortex, MRI decreased T1/T2 intensity.
Diagnosis involves histiocytoid mononuclear cells on pathology.
Treatment includes marginal excision.
Can invade into digital nerve.
The most common recurrence.

## Extensor digitorum brevis manus
2-3% of population.
Near radiocarpal joint just distal to extensor retinaculum.
No transillumination.

## Schwannoma
The most common nerve tumor.
Benign (with rare malignancy potential) peripheral nerve tumor from glial cells.
Diagnosis involves painless smooth, non-adherent mass, + Tinel sign in nerve distribution on exam.
Diagnosis involves MRI.
Treatment includes excision (intra fascicular).

## Enchondroma
The most common bone tumor of hand.
Abnormal cartilage deposit in bone; prone to pathologic fractures.
Rare syndromic associations (Mafucci: venous malformations, Ollier disease: can progress to chondrosarcoma).
Treatment includes observe if asymptomatic.
Treatment involves curettage and bone grafting.

## Giant cell tumors of the bone
Benign, locally aggressive.
Diagnosis involves CT chest (rare pulmonary metastasis).
Treatment includes curettage and bone grafting for early, resection and bone reconstruction for late.

## Osteoid osteoma
Benign bone tumor arising from osteoblasts.
Symptoms include focal bony pain relieved by NSAIDs.
Diagnosis involves CT.
Treatment includes NSAIDs.

# Malignancies

## Melonychia
Biopsy for >3mm streak crossing eponychial fold (risk of acral lentiginous melanoma).
Treatment includes wide local excision with local flap or FTSG reconstruction, amputation for advanced cases.
Prognosis related to tumor stage.

## Soft-tissue sarcomas
Can be in upper or lower extremity.
Diagnosis involves imaging or incisional biopsy (longitudinal).
Diagnosis involves anaplastic cells on histopathology.
Treatment includes wide-local excision (1cm margin or more) and radiation therapy for limb salvage.
Amputation to above nearest proximal joint for advanced cases, older patients.
No routine lymph node sampling unless clinical evidence of nodal involvement.

## Bony sarcomas
Chondrosarcoma The most common malignant non-skin tumor of the hand (SCC is most common overall).
Osteosarcoma can metastasize to lung.

## Nerve tumors
Malignant peripheral nerve sheath tumors metastasizes to lung.`,

    'hand-inflammation-infections': `# Osteoarthritis

## Thumb carpometacarpal (CMC) arthritis
The most common site of hand arthritis.
Diagnosis involves XR. Eaton classification: symptoms don't correlate with imaging. I: joint space narrowing. II: small osteophytes. III: large osteophytes. IV: collapse changes: scapho-trapezoid-trapezium (STT) joint. Eaton stress view: thumbs pushed together, assess laxity/subluxation. Roberts view: hyperpronated thumb to evaluate trapeziometacarpal joint.
Treatment includes trapeziectomy. Ligament reconstruction with tendon interposition (LRTI) commonly performed; associated with higher complication rate than trapeziectomy alone. Thumb metacarpophalangeal joint (MCPJ) hyperextends to compensate for advanced collapse; need to correct >30 degrees MCPJ hyperextension. Treatment includes MCPJ fusion.

## Scaphotrapeziotrapezoidal (STT) arthritis
Can occur in isolation or with CMC arthritis.
Diagnosis involves no axial thumb pain or subluxation of thumb differentiates from CMC arthritis.
Diagnosis involves XR.
Treatment includes OT, steroid injection; STT arthrodesis.

## Flexor tendon rupture
Attritional from radiocarpal arthritis.
Diagnosis involves imaging to assess for osteophytes.
Treatment includes resect osteophyte, tendon graft reconstruction.

# Inflammatory Arthritis

## Rheumatoid arthritis
Can progress to advanced wrist arthritis, attritional extensor tendon ruptures, digital deformities (e.g., Boutonniere, swan neck deformities).
Wrist collapse. Loss of carpal height, weakening of intrinsic ligaments. Causes ulnar subluxation of carpus, radial deviation of metacarpals. Digits go into ulnar drift and attenuate radial sagittal bands.
Extensor tendon ruptures. Attritional ruptures from chronic inflammatory tenosynovitis. Extensor pollicis longus rupture The most common tendon rupture, occurs around Lister's tubercle. Caput ulna (Vaughan-Jackson syndrome) ruptures of extensor digitorum communis and digit minimi around ulna due to arthritis, progresses radial to ulnar. Tx Darrach (distal ulna head resection); Sauve-Kapandji (distal radioulnar joint fusion) for arthritis without caput ulna.
Digital deformities. Boutonniere (Digits): PIPJ flexes, DIPJ extends; PIPJ synovitis attenuates central slip, stretches volar plate; lateral bands compensate with volar translocation. Treatment includes OT/splinting; Fowler tenotomy (release terminal extensor tendon). Boutonniere (Thumb): Due to metacarpophalangeal joint (MCPJ) synovitis. Swan neck: PIPJ extends, DIPJ flexes. Treatment includes OT/splinting; spiral oblique retinacular ligament reconstruction.

## Gout
Deposition of crystals in joint spaces (common to wrist, elbow).
Diagnosis involves negatively birefringent crystals on wrist aspirate.
Treatment includes colchicine.

## Pseudogout
Diagnosis involves + birefringent crystals on wrist aspirate.

## Psoriatic arthritis
Preferentially affects DIPJ, nail bed.

# Other Inflammatory Conditions

## Raynaud's disease
Idiopathic peripheral vasoconstriction of the digits.
Due to overactive alpha-2 receptors.

## Raynaud's phenomenon
It is associated with underlying rheumatologic disease (The most common sclerodermia/CREST).
Symptoms include small, non-healing ulcers at fingertips, color changes, chronic pain.
Treatment includes calcium-channel blockers, then botulinum toxin.
Botulinum toxin inhibits Rho/Rho kinase, decrease substance P secretion, decrease C-fiber receptors.
Inject botulinum toxin to perivascular area at distal palm.
Treatment involves wrist, arch, and digital sympathectomy (severe, intractable cases).

## Digital clubbing
Due to increased vascular connective tissue.

## Dupuytren's contracture
Progressive palmar fascia contracture.
Largely genetic etiology.
Due to myofibroblasts.
Central cord pretendinous cord extension, affects metacarpophalangeal joint (MCPJ).
Spiral cord at proximal phalanx, displaces neurovascular bundle volarly and centrally.
Natatory cord webspace.
Retrovascular cord dorsal to neurovascular bundle at DIPJ.
PIPJ contracture most associated with recurrence after surgical treatment.
Treatment includes clostridium histolyticum (CCH) injection (inject then break cord 1-3 days later; Complications include include skin breakdown #1, transient numbness).
Treatment includes needle aponeurotomy +/- fat grafting (fat grafting inhibits myofibroblast proliferation).
Treatment includes surgical aponeurectemy (Complications include include flare reaction, complex regional pain syndrome; Treatment includes conservative).

# Infections

## Bacterial

### Fight bite
Human tooth to the extensor hood of the MCPJ from punching someone.
High rate of deep infection (MCPJ septic arthritis), extensor tendon injury.
Treatment includes amoxicillin/clavulanic acid, MCPJ exploration, joint irrigation.
The most common group-A strep, staph aureus, eikenella.

### Animal bites
Cat bites tend to cause deep injury, dog bites tend to be avulsive.
Dog bites (unprovoked attacks): Assess dog rabies vaccine status; contact local authorities, quarantine/observe dog for 10 days if rabies vaccine up to date, otherwise testing needed.
Rabies treatment repair lacerations after immunoglobulin injected into wound.
The most common staph aureus, Pasteurella.
Treatment includes antibiotics; incision and drainage, loosely close wounds. 1st line: Amoxicillin/clavulanic acid. 2nd line (PCN allergy): clindamycin, TMP/SMZ. 3rd line: fluoroquinolones, doxycycline.

### Flexor tenosynovitis
Inoculation of flexor tendon sheath by direct puncture or bacteremia.
Diagnosis involves Kanavel signs: diffuse swelling, flexed posture of digit, tenderness over flexor sheath (#1), and pain with passive extension.
Treatment includes antibiotics; irrigation of flexor tendon sheath between A1 and A5 pulleys.

### IV drug use
The most common staph (MRSA).
Treatment includes vancomycin.

### Deep-space hand infections
Radial to ulnar spread via radial bursa communicating to Parona's space then going to ulnar bursa (horseshoe abscess).

## Viral

### Human papilloma virus
The most common warts in children, most spontaneously resolve.

### Herpetic whitlow
Small vesicular rash, then blisters.
Diagnosis involves Tzank smear, antibodies titers.
Treatment includes observation, anti-viral (acyclovir) if diagnosed within first 72 hours.`,

    'congenital-pediatric-hand': `# Embryology

## Extremity development
Occurs during gestational weeks 4-8.
Proximal distal apical epidermal ridge (formed from FGFR proteins; cause of amelia).
Anteroposterior axis Zone of polarizing activity (mirror foot duplication of zone of polarizing activity).
Radio ulnar Formed from sonic hedgehog protein (responsible for mirror hand).
Volar BMP and Engrailed-1.
Dorsal Formed from Wnt7a → LMX1B (Nail-patella syndrome autosomal dominant LMX1B defect).

## Bone ossification
Clavicle and femur first long bones to ossify at 8 weeks.

# Diseases

## Syndactyly
Due to failure of apoptosis of web spaces.
Classification Simple or complex (based on bone involvement), complete or incomplete (based on skin involvement).
Treatment includes surgical release. Dorsal flap for webspace, full-thickness skin grafts for digits. Perform at 1 year of age. Release one webspace at a time.

## Polydactyly
Post axial (ulnar).
Pre-axial (thumb duplication). Wassel classification: I to VII (IV most common). Numbering goes from distal to proximal. Odd have a bifid bone, even have two independent bones at same bony level. VII: anything else not otherwise classified.

## Congenital trigger thumb
Symptoms include thumb IPJ held in flexion.
Diagnosis involves Notta nodule to A1 pulley.
Treatment includes pulley release for fixed deformity > 1 year old.

## Amniotic-band syndrome
It is associated with cleft lip, body wall defects, equinovarus, imperforate anus.
Diagnosis involves ranges from mild skin depression to severe proximal edema on exam, acrosyndactyly.
Patterson classification. I simple constriction ring. II constriction ring with lymphedema. III constriction ring with acrosyndactyly. IV amputation at any level.
Treatment includes surgical release of band for worsening swelling, distal discoloration of limb.
Staged releases (one half at a time for circumferential bands).
Edema improves in a few weeks.

## Congenital compartment syndrome
Risk factors include amniotic bands, oligohydramnios.
Symptoms include unilateral edema, bullae formation.
Treatment includes compartment release.

## Camptodactyly
Painless proximal interphalangeal joint flexion contracture; The most common small finger.

## Clinodactyly
Painless radial inclination of distal phalanx; The most common small finger.

## Thumb hypoplasia
Blauth classification. Type I no treatment needed. Type II (mild) first-webspace deepening (e.g., 4-flap Z plasty), UCL repair for instability. Type III A stable carpometacarpal (CMC) joint; Tx (if needed) flexor digitorum superficialis (FDS) tendon transfer to ulnar collateral ligament (UCL). B unstable CMC, and type IV and V Pollicization index finger placed into thumb ray position. extensor indicis → proprius extensor pollicis longus. extensor digitorum communis → abductor pollicis longus. palmar interosseous → adductor pollicis. dorsal interosseous → abductor pollicis brevis. flexor digitorum profundus → flexor pollicis longus.

# Trauma

## Pediatric fractures
Can involve epiphysis (growth plate).
Salter-Harris fractures for epiphyseal fractures (involve the growth plate). I: S - Same level. II: A - Above. III: L - Lower. IV: T - Through. V: R - Rest.

## Seymour fracture
Open epiphyseal fracture of distal phalanx with nail bed transection, germinal matrix gets entrapped.
Treatment includes irrigation, open reduction; pinning if unstable.

## Pediatric supracondylar fractures
Common in ages 5-7.
Diagnosis involves assess perfusion; if compromised, first perform closed reduction, observe for mild cases.
Brachial artery exploration if perfusion compromised after closed reduction.

## Amputations
The most common male.
The most common crush in door (crush in window #2).

# Congenital Syndromes

## Radial longitudinal deficiency
Most are associated with syndromes.
Can have thumb hypoplasia/absence.

## Fanconi's anemia
Absent radius, sometimes thumb hypoplasia.
Progresses to aplastic anemia at age 4-5 (can be life threatening).
Diagnosis involves CBC, then chromosomal breakage testing.
Treatment includes refer to hematologist.

## Thrombocytopenia/absent radius
Diagnosis involves CBC.

## Holt Oram
Autosomal Dominant.
Radial longitudinal deficiency, cardiac abnormality (VSD).

## VACTERL
Vertebral, anorectal, cardiac, trachea-esophageal, renal, limb abnormalities.
Diagnosis involves renal US.

# Pediatric Brachial Plexopathy

Observe ~6 months for development of upper extremity motor function.
Diagnosis involves MRI to evaluate for nerve-root level injury.`,

    'lower-extremity': `# Anatomy

## Lower extremity nerves
Tibial gastrocnemius, soleus, plantaris, popliteus, flexor digitorum longus, flexor hallucis longus (FHL). Diagnosis involves plantarflexion, sensation to plantar surface of the foot.
Femoral anterior thighs muscles. Diagnosis involves leg extension.
Obturator medial thigh muscles. Diagnosis involves thigh adduction.
Peroneal nerve lateral and anterior compartments. Associated with proximal tibiofibular joint dislocation. Diagnosis involves absent dorsiflexion of the foot, sensation to lateral foot. Treatment includes nerve repair, nerve grafting, nerve transfer FHL (tibial nerve) to AT if severe injury.
Medial plantar nerve. Continuation of the tibial nerve.

## Lower extremity muscles
Superficial posterior gastrocnemius and soleus. Diagnosis involves plantarflexion.
Deep posterior toe flexors. Dx FHL with flexion of great toe.
Anterior anterior tibial, toe extenders. Diagnosis involves dorsiflexion, inversion.
Lateral peroneus muscles. Diagnosis involves ankle eversion.
Plantaris tendon. Located between medial gastrocnemius muscle and soleus, medial to Achilles tendon. Used as a tendon autograft.

## Popliteal fossa
Contain popliteal artery, tibial nerve, common popliteal nerve.
Bordered by medial head of gastrocnemius, semimembranosus, lateral head of gastrocnemius, and biceps femoris.

## Toe anatomy
Perfusion with dominant dorsal system in 70% of patients, plantar system in 30%, equivocal 10%.
Diagnosis involves lateral angiogram before toe-to-thumb transfer.

# Lower Extremity Trauma

## Fracture fixation
Bony stabilization increases with interfragmentary compression.
Primary bone healing compression plates, lag screws, tension bands.
Secondary bone healing intramedullary nailing, bridge plating, external fixation, K wires support relative stability.

## Open fractures
IV cephalosporin (in first 3 hours) or equivalent x 72 hours.
Restore length with reduction, splinting.
Assess pulses.

## Gustilo classification
I Clean wound, <1cm.
II Clean wound, >1cm.
III A Adequate soft tissue for coverage. B Inadequate soft tissue for coverage, periosteal stripping. C Arterial injury requiring repair.

## Secondary-bone reconstruction
Masquelet two-stage reconstruction. 1st stage antibiotic spacer placement, allow 4-8 weeks for pseudomembrane to form. 2nd stage replace antibiotic spacer with cancellous bone graft into pseudomembrane.
Ilizarov/bone transport. Perform osteotomy away from fracture site, then distraction osteogenesis. Bone forms by intramembranous ossification.
Capanna technique. Free fibula free flap inside bone allograft. Used for large-gap sarcoma bony reconstruction.

## Limb salvage
Risk factors include popliteal artery injury, ankle/foot fractures.
Ideally, soft-tissue coverage within 10 days from injury.
Can be performed with tibial nerve injury (if nerve is reparable).
Traumatic amputations occur The most common due to ischemia; good functional outcomes in appropriately selected patients.

## Morel-Lavallée lesion
Soft-tissue fascial shear injury with intact skin.
Prone to seroma, lymphatic disruption.
Diagnosis involves MRI for chronic injuries.
Treatment includes compression bandaging, percutaneous aspiration, +/- sclerosing agents.

# Lower Extremity Reconstruction

## Flaps
Pedicled. Propeller. Identify subcutaneous perforator to island of skin. The most common failure due to venous congestion from kinking.
Free tissue transfer. Muscle flaps Fill dead space better. Fasciocutaneous flaps Decreased donor-site morbidity.

## Tissue Expansion
Lower extremity placement has highest complication rate in the body.

# Vascular Diseases

## Lower extremity
Peripheral arterial disease. Claudication that progresses from rest pain to tissue loss. Diagnosis involves palpate pulses, Doppler exam. Diagnosis involves ankle-brachial index. >1 normal. 0.7-0.9 claudication. <0.5 rest pain, tissue loss. Diagnosis involves toe-brachial index for non-compressible vessels (diabetes mellitus).
Venous insufficiency ulcers. Treatment includes elevate, serial compression dressings (Unna boot).
Lymphedema. The most common cause obesity (U.S.), filiarsis infection (worldwide). Diagnosis involves Staging:  0: clinically normal, identified on lymphoscintigraphy. 1: clinically apparent, improves with limb elevation. 2: pitting edema, does not improve with elevation. 3: fibrosis of soft tissues.
Neuropathic foot ulcers. Treat non-infected, non-ischemic ulcers with contact casting. Treatment includes granulocyte-stimulating factor use associated with decreased need for below-knee amputation. Treatment includes medical honey draws fluid from deep to superficial by osmosis. Treatment includes hyberbaric oxygen indicated for exposed bone.

# Aesthetic

## Calf augmentation
Submuscular position for implant associated with lowest complication rate.`
  },

  // Section 3: Craniomaxillofacial
  'craniomaxillofacial': {
    'cleft-lip-palate': `## Cleft Lip and Palate

### Embryology, Epidemiology, and Genetics
**Embryology** Cleft lip (median nasal prominences don't fuse), Cleft palate (medial and lateral palatine processes don't fuse).
**Genetics** One sibling affected 2.5% risk, Two siblings 10%, Parent and sibling 17%, Van der Woude (autosomal dominant) 50% risk.
**Epidemiology** Cleft lip/palate 1 700 (M F 2 1, 15% syndromic), Cleft palate only 1 1500 (M F 1 2, 50% syndromic).

### Cleft Care
**Cleft Lip** Repair at 3-6 months, establish muscular continuity.
**Cleft Palate** Repair at ~1 year, worse speech with delayed repair.
**VPI** Treatment includes buccal musculomucosal flaps, sphincter pharyngoplasty (highest OSA risk), pharyngeal flap.
**Alveolar Bone Grafting** Time with permanent canine (~age 8-12).
**Orthognathic** LeFort I for Class III occlusion.
**CHARGE syndrome** #2 syndromic cleft (Coloboma, Heart, Atresia, Retardation, Genital, Ear).`,

    'facial-fractures': `## Facial Fractures and Skull

### Fractures
**Frontal Sinus** Posterior table fractures risk CSF leak (Diagnosis involves beta-2 transferrin).
**Orbital** Floor fractures MC, repair for sizable defects/persistent diplopia; Entrapment The most common in pediatrics (prompt repair needed).
**NOE Fractures** Risk telecanthus (Markowitz classification), canalicular injury, CSF leak.
**ZMC Fracture** 2-point fixation (simple), 3-point (complex).
**Base of Skull** Contraindication to nasotracheal intubation.

### Reconstruction
**Scalp** Flap if exposed cranium, tissue expansion between galea and temporalis.
**Cranioplasty** >6 sq cm defect; PEEK (The most common complication infection), Methylmethacrylate (exothermic), Hydroxyapatite.
**Positional Plagiocephaly** Treatment includes repositioning, helmet molding >3 months.`,

    'facial-paralysis': `## Facial Paralysis

### Anatomy
**Main trunk** 6-8mm distal to tympanomastoid suture.
**Frontal branch** Pitanguy's line (0.5cm below tragus to 1.5cm above lateral brow).

### Etiologies
**Bell's palsy** 80-90% resolve, Treatment includes steroids if early.
**Möbius** CN VI, VII absence; Treatment includes temporalis transfer or free gracilis.
**Parry-Romberg** Progressive hemifacial atrophy, starts late teens; Treatment includes methotrexate, volume replacement.

### Reanimation
**Dynamic** Free muscle transfer (cross-facial graft vs masseteric nerve), temporalis turnover.
**Static** Autologous slings (lowest complication rate).`,

    'ear-reconstruction': `## Ear Reconstruction

### Congenital
**Embryology** 1st cleft (EAC), 1st/2nd arches (helix - 6 hillocks), Preauricular sinus (incomplete fusion).
**Anomalies** Microtia, Cryptotia (upper 1/3 adherent), Stahl ear (accessory 3rd crus), Lop ear.

### Reconstruction
**Neonatal Molding** Start by 2 weeks (up to 3 months), The most common complication skin ulceration.
**Autologous** Rib cartilage framework, Nagata (2-stage), Brent (3-stage).
**TPF flap** Based on superficial temporal artery, workhorse for coverage.
**Replantation** Venous repair doesn't change success, leech therapy if no vein anastomosis.

### Aesthetic
**Prominent ear** Otoplasty age 6-7, Mustardé suture (antihelical fold), Furnas suture (conchal-mastoid angle).`,

    'mandible-dental-orthognathic': `## Mandible, Orthognathic, and Dental

### Mandible Fractures
**Locations** Parasymphyseal (ORIF +/- MMF), Angle (ORIF, intra-oral approach), Condylar (generally closed with MMF).
**Fixation** Champy technique (external oblique ridge), Reconstruction plate (load-bearing).
**Free flap** Fibula for >5cm defects or XRT setting.

### Tumors
**Ameloblastoma** The most common mandibular tumor, Treatment includes segmental mandibulectomy.
**OKC** #2 benign, associated with Gorlin syndrome (PTCH1).
**Periapical cyst** The most common cyst, from necrotic pulp.

### TMJ
**TMD** The most common women 20-40, pain on palpation of mastication muscles.
**Masseteric Hypertrophy** The most common from bruxism, Treatment includes botulinum toxin.

### Orthognathic
**Class II** BSSO for mandibular advancement.
**Class III** LeFort I for maxillary advancement.
**Vertical Maxillary Excess** "Gummy smile", Tx LeFort I impaction.`,

    'head-neck-tumors': `## Head and Neck Tumors

### Embryology
**Pharyngeal Arches** 1(CN V-mastication), 2(CN VII-facial), 3(CN IX-stylopharyngeus), 4(CN X-pharyngeal/laryngeal), 6(CN XI-SCM/trapezius).

### Oral Cancer
**SCC** Neck dissection for T2+ tumors, Chyle leak The most common complication (triglycerides >110 mg/dL).
**Reconstruction** Free flaps, Total laryngopharyngeal (ALT better speech, jejunum easier inset).
**Oropharyngeal** HPV associated with better outcomes.

### Glandular
**Parotid** 80% of salivary tumors, 80% benign.
Pleomorphic adenoma (80% of benign), Warthin tumors (cystic, bilateral, smokers).
Mucoepidermoid (The most common malignant, The most common in children), Adenoid cystic (perineural invasion).
**Minor Salivary** 50% malignant, The most common in palate, Adenoid cystic MC.

### Lip Reconstruction
Primary closure (≤1/3), Lip switch flaps (1/3-1/2: Abbe, Estlander), Regional (>1/2: Karapandzic, Bernard-Webster).`,

    'congenital-syndromes': `## Congenital Syndromes

### Craniosynostosis
**Apert** Bicoronal, complex syndactyly, FGFR2.
**Crouzon** Complex craniosynostosis, midface retrusion, normal extremities, FGFR2.
**Pfeiffer** Cloverleaf skull, exorbitism, broad thumbs, FGFR2.
**Saethre-Chotzen** Bilateral coronal, low ears, ptosis, TWIST.
**Sagittal** Scaphocephaly, Treatment includes endoscopic (early) vs open vault (late).

### Cleft Syndromes
**Treacher Collins** Microtia, colobomas, cleft palate, retrognathia, TCOF1.
**Robin Sequence** Cleft palate, micrognathia, glossoptosis, Treatment includes prone positioning, mandibular distraction.
**Van der Woude** Lower lip pits, cleft palate, IRF6 (50% transmission).
**Velocardiofacial** 22q11.2 deletion, cleft (submucous), cardiac, hypocalcemia.

### Other
**Goldenhar** #2 congenital facial malformation, hemifacial microsomia, epibulbar dermoids.
**Beckwith-Wiedemann** Macrosomia, omphalocele, macroglossia, chromosome 11.`,
  },
  'breast-cosmetic': {
    'breast-augmentation': `# Breast Augmentation

## Breast Implants

### Aesthetic ideal
45 55 upper pole to lower pole volume.

### FDA Approval
FDA approved age >22 for aesthetic indications. Carries a black box warning. Requires specialized consent form.

### Choices in Augmentation Mammaplasty

**Shell** .
Smooth.
Textured.

**Filling** .
Saline.
Silicone. Modern cohesive gels with less rippling, rupture. Increased cross-linking of silicone improves form stability. More prone to rotation of implant.

**Pocket selection** .
Subpectoral/dual plane (MC). Should perform if upper pole pinch test <2cm. Used for pseudoptosis.
Subglandular.

**Incision selection** .
Inframammary fold (IMF).
Periareolar.
Trans-axillary.

### Surveillance
MRI or US first 5-6 years then every 2-3 years to evaluate for silent rupture.

### Breast Cancer Screening
Mammography Eklund view (displaces the implant toward the chest and pulls the breast tissue anteriorly).

## Complications

**MC** reoperation for size.
**Capsular contracture**. Baker grading I Normal. II Palpable. III Visible. IV Painful. The most common cause biofilm. Subclinical infection associated with indwelling medical devices. Forms due to extracellular polymeric substance matrix causing a surface for bacterial adherence. Slow bacterial growth rate reduces antibiotic efficacy. Reduced risk with IMF incision, subpectoral placement, and textured implants. No evidence to support extended antibiotic courses to prevent.
**Double capsule**. RF OCPs. Symptoms include painless enlargement, becomes firm years after implantation.
**Double bubble**. Two transverse creases at lower pole of breast due to incomplete scoring or release of former IMF when lowering it with an implant. Risk factors include superiorly displaced native IMF. Treatment includes release superficial fascial attachments to skin.
**Snoopy nose deformity**. Gland descends, implant stays in place. Treatment includes mastopexy.
**Animation deformity**. Treatment includes change from subpectoral to subglandular plane, +/- acellular dermal matrix or mesh.
**Rupture**. Dx MRI.
**Galactocele** milk-filled cyst caused by lactiferous duct blockage.
**Pneumothorax**. Symptoms include shortness of breath, chest tightness. Diagnosis involves chest xray.
**Infection**. Atypical mycobacterial infections. More common with cosmetic tourism. Doesn't respond to antibiotics, causes non-healing wounds. Diagnosis involves acid-fast stain and mycobacterial culture. Treatment includes remove implant, debride.
**Breast-implant-associated-ALCL (BIA-ALCL)**: See chapter 3: breast reconstruction.
**Breast implant illness**. Symptoms include vague systemic symptoms (fatigue, brain fog, headaches, anxiety). Diagnosis involves clinical diagnosis, no definitive laboratory or imaging test, consider work up for autoimmune disease. Treatment includes explantation (widely variable outcomes reported). +/- capsulectomy studies don't show a difference in outcomes. Worse outcomes when known autoimmune disease.`,

    'breast-reduction-mastopexy': `# Breast Reduction and Mastopexy

## Embryology

### Ectoderm
Mammary ridge exists from axilla to inguinal region (milk line). Begins week 5-6. Remaining ridge involutes during development.
**Diseases** **Polymastia** accessory breast tissue due to incomplete mammary ridge involution. Can occur in axilla. Symptoms include swelling of mass during menses. Diagnosis involves glandular tissue in lower dermis/fat on pathology. **Supranumery nipple** additional nipple due to incomplete involution of ectodermal ridge along milk line. Polythelia >2 supranumery nipples. Associated with renal cancers and kidney disease. **Amastia** mammary ridge absent, breast and nipple absent. **Amazia** no breast tissue, nipple present. **Inverted nipples** failure of mesenchyme to proliferate.

### Epithelial Cells
Responsible for development of lactiferous ducts.

### Mesoderm
Development of breast parenchyma.

## Breast Aging

### Puberty breast development
Surge of insulin-like growth factor 1 (IGF-1) from breast tissue stimulates pituitary gland.
Estrogen duct growth.
Progesterone lobular development.
Tanner staging ages 8-13.

### Menopause
Decrease in progesterone and estrogen.
Breast involution replacement of parenchyma with fat.
Cooper ligaments laxity.
Decreased elasticity increased ptosis.

## Breast Reduction

### Anatomic Considerations
**Blood supply** Superior internal mammary perforators (60%). Lateral lateral thoracic artery. Medial internal mammary perforators. Inferior external mammary perforators.
**Nerve supply** Sensation intercostal nerves (lateral and anterior cutaneous branches). Nipple-areola complex (NAC) T4 anterolateral and anteromedial branches.

### Planning
Sternal notch to nipple distance 19-21cm ideal.
Nipple to inframammary fold 5-7cm.
Regnault ptosis classification Grade 0 no ptosis. Grade I nipple at level of IMF. Grade II nipple below IMF but above lower pole. Grade III nipple below lower pole (points downward). Pseudoptosis gland below IMF but nipple above.

### Pedicle Selection
**Inferior pedicle**. The most common used. Maintains inferior blood supply and sensation. Better for large reductions. Can accommodate up to 1500g resection.
**Superior pedicle**. Better nipple projection. Good for moderate reductions (<1000g). Better upper pole fullness.
**Superomedial pedicle**. Based on internal mammary perforators. Good projection and sensation.
**Free nipple graft**. For massive reductions (>1500g) or compromised vascularity. Loss of sensation and inability to breastfeed.

### Incision Patterns
**Wise pattern (anchor/inverted T)**. The most common used. Better for larger reductions. Visible scar in IMF.
**Vertical (lollipop)**. Better aesthetics with less scar. Good for moderate reductions. Technique: Lejour, Hall-Findlay.
**Periareolar (Benelli)**. Minimal scar. Limited resection. Higher risk of areolar spreading, nipple flattening.

### Complications
**Nipple necrosis**. Risk factors include smoking, diabetes, large reduction, tension. Treatment includes local wound care, observation for demarcation.
**Fat necrosis**. Firm mass, oil cysts. Diagnosis involves mammography, ultrasound. Treatment includes observation, excision if symptomatic.
**Infection**. Treatment includes antibiotics, drainage if abscess.
**Hematoma**. Early <24 hours, evacuation needed. Late observation.
**Wound dehiscence**. The most common at T-junction. Treatment includes local wound care, secondary closure if needed.
**Hypertrophic scarring**. Treatment includes silicone, steroids, revision.
**Loss of sensation**. Usually temporary, can be permanent.
**Inability to breastfeed**. Higher with free nipple graft, superior pedicle.

## Mastopexy

### Indications
Breast ptosis without volume excess.
Can combine with augmentation.

### Augmentation-Mastopexy
Two options Single stage higher revision rate. Two stages perform mastopexy then return later to perform augmentation.

## Benign Breast Diseases

### Fibroadenoma
Giant fibroadenoma single solitary mass with asymmetric, rapid enlargement of one breast.
Symptoms include firm, rubbery nodule.
Diagnosis involves US.
Diagnosis involves epithelial and stromal proliferation on pathology.

### Juvenile breast hypertrophy
Breast enlargement >3.3 lbs. during puberty.
Diagnosis involves stromal tissue hypertrophy on pathology.

### Phyllodes tumor
Generally benign, high recurrence, rare risk of metastasis.
Symptoms include painless breast mass.
Treatment includes wide surgical margins (>1cm).

### Tuberous breast deformity
Hypomastia/asymmetry, elevated IMF, constricted base, herniated/widened areola.
Treatment includes periareolar radial scoring, tissue expander versus implant.

### Symptomatic galactocele/galactorrhea
Swelling of breasts, milky discharge, no signs of infection or fever.
Thought to be secondary to breast denervation after surgery.
Diagnosis involves prolactin.
Treatment includes bromocriptine (dopamine agonist).

### Mondor disease
Diagnosis involves superficial thrombophlebitis with erythematous, tender cord in the breast.
Treatment includes self-resolves in 4-6 weeks, NSAIDs/pain control.

## Breast Cancer Screening

### Palpable mass on exam
Diagnosis involves diagnostic MMG with US.

### Breast cancer screening prior to reduction
Screening MMG should be performed if age >40.

### Occult breast cancer in reduction mammaplasty specimen
Occurs 0.4% overall, increased to 5.5% with personal history of cancer.`,

    'breast-reconstruction': `# Breast Reconstruction

## Breast Cancer Overview

### Mastectomy Types
**Total (simple) mastectomy**. Removal of breast tissue, nipple-areola complex. Preserves pectoralis major muscle.
**Modified radical mastectomy**. Total mastectomy + axillary lymph node dissection. Preserves pectoralis muscles.
**Skin-sparing mastectomy**. Preserves breast skin envelope. Removes nipple-areola complex. Better aesthetic outcomes.
**Nipple-sparing mastectomy**. Preserves nipple-areola complex and breast skin. Relative indications no ptosis, tumor <5cm, tumor >1cm from nipple, no multi-centric disease. Contraindications include axillary disease, lymphovascular invasion, HER2/neu (H2N)+ on pathology. Nipple necrosis rate associated with incision. Lateral inframammary is lowest, periareolar is highest.
**Contralateral prophylactic mastectomy**. Indications include genetic predisposition, high family risk, patient preference. Increases overall surgical risks compared to unilateral mastectomy.
**Breast-conserving therapy (partial mastectomy [lumpectomy]/XRT)**. Removal of mass with margins, generally with adjuvant XRT. Contraindications include include multi-centric disease, diffuse calcifications on imaging, history of chest radiation, current pregnancy. Reconstruction after breast-conserving therapy not covered by all insurers.

### Neoadjuvant chemotherapy
Can shrink tumor to allow partial mastectomy instead of total mastectomy.

### Hormonal therapy
**Tamoxifen (pre-menopausal)**. Selective estrogen receptor modifier. Consider holding perioperatively due to possible increased thrombosis risk.
**Aromatase inhibitors (post-menopausal)**. Prevents peripheral conversion of estrogen. Does not need to be held perioperatively for elective surgery.

### Radiation (XRT)
Indications include for post-mastectomy XRT tumor >5cm, >3 lymph nodes, + margin.
Indicated in nearly all partial mastectomies (breast-conserving therapy) for cancer. Absolute contraindications for breast-conserving therapy: early pregnancy, multi-centric tumor, diffuse microcalcifications, inflammatory breast cancer, persistently positive margins.
The most common skin dyspigmentation.
Increases failure with implant-based reconstruction, fibrosis to autologous reconstruction. If unknown need for post-mastectomy XRT, reconstruct with tissue expanders, not definitive flap.
Chronic wound after XRT. Biopsy to evaluate for recurrence. Evaluate for rib osteoradionecrosis.

## Implant-Based Reconstruction

### Pocket Positions
Pre-pectoral and subpectoral pocket positions MC.
**Pre-pectoral pocket**. Better medial placement, decreased risk of animation deformity. Higher implant rippling, higher upper pole contour deformity, higher cost.

### Antibiotics Management
Perioperative (prophylactic dose then 24 hours post op) use only, higher infection risk with prolonged courses.

### Types of Tissue Expanders
The most common saline filled via integrated port.
Others air, carbon dioxide rapid expansion, can't deflate.
Not MRI compatible (due to magnet on port).

### Complications
**Post-mastectomy XRT effects on implant**. The most common cause of explantation. Increases capsular contracture (#1 risk factor), seroma, wound-healing problems, infections. Implant/TE exposure in setting of XRT: explant device in OR.
**Risk factors include for salvage failure** deep infection (#1), XRT, obesity, seroma, diabetes mellitus.
**Infected tissue expander, implant**. The most common organism staph aureus (overall), The most common gram negative pseudomonas. Breast implant funnels decrease risk of bacterial contamination.
**Mastectomy skin necrosis**. Treatment includes nitroglycerin ointment initially.
**Breast-implant-associated ALCL (BIA-ALCL)**. Risk factors include history of textured implant (or tissue expander). Contralateral side affected 5% of cases. Symptoms include delayed seroma. Diagnosis involves ultrasound, fine-needle aspiration for cytology. Fluid cytometry: CD30+, ALK-. Wright-Giemsa stain. The most common bacteria: ralstonia. Treatment includes bilateral explantation (risk of contralateral involvement ~5%), total capsulectomy, oncology referral.
**Cyanoacrylate contact dermatitis**. 10-15% incidence, erythema limited to area of incision. Type IV immune response (T-cell mediated to foreign agent). Treatment includes remove offending agent, topical steroids.
**Post-mastectomy pain syndrome**. Symptoms include unilateral chest wall, axilla, upper arm pain from intercostobrachial nerve. Treatment includes gabapentin.

## Autologous Reconstruction

### Abdominal-Based Flaps

**Pre-existing scars** .
Subcostal scar worst for flap perfusion.
Pffanenstiel incision sacrifices superficial drainage of flap, reduces venous congestion of the flap.

**Transverse rectus abdominus musculocutaneous (TRAM) flap**:.
Often pedicled, can be ipsilateral or contralateral.
Arterial supply superior epigastric artery (need intact internal mammary artery [IMA]). Hartrampf zones (from better to worse perfusion) I ipsilateral rectus abdominus skin. II contralateral rectus abdominus skin. III ipsilateral lateral abdominal skin. IV contralateral lateral abdominal skin.
Can perform surgical delay (divide inferior epigastric artery) 2 weeks prior to reduce fat necrosis. Consider for higher BMIs.

**Deep inferior epigastric artery perforator (DIEP) free tissue transfer**:.
Modified Hartrampf zones.
Perforators through rectus abdominus muscle.
Pedicle deep inferior epigastric artery and vein.
Spares rectus muscle (lower donor morbidity than TRAM).
Imaging CTA to map perforators pre-operatively.
Complications include include Abdominal bulge, hernia lower than TRAM but still possible. Fat necrosis peripheral zones III and IV at risk. Flap loss <5%. Donor site seroma.

**Superficial inferior epigastric artery (SIEA) flap**:.
Rare use due to small, inconsistent vessels.
Pedicle superficial inferior epigastric artery.
Advantage no fascial violation.
Present in only ~30% of patients with adequate caliber.

### Other Autologous Options

**Latissimus dorsi flap** .
Pedicled flap based on thoracodorsal artery.
Often needs implant for volume.
Good for partial defects, salvage reconstruction.
The donor site has back contour deformity, seroma.
Advantage reliable, well-vascularized tissue.

**Transverse upper gracilis (TUG) flap**:.
Free flap from medial thigh.
Pedicle medial circumflex femoral artery (ascending branch).
Good for small to moderate breasts.
The donor site has medial thigh scar.

**Profunda artery perforator (PAP) flap**:.
Free flap from posterior thigh.
Pedicle profunda femoris perforators.
Alternative to DIEP for patients without adequate abdominal tissue.
Can be harvested in prone position simultaneously with mastectomy.

**Stacked flaps** .
Two flaps anastomosed to single recipient vessels.
For larger volume needs.
Common bilateral PAP, bilateral TUG.

### Timing of Reconstruction
**Immediate** At time of mastectomy. Advantages Single surgery, better aesthetics, psychological benefit. Disadvantages Longer surgery, may delay adjuvant therapy if complications.
**Delayed** After mastectomy and adjuvant therapy complete. Advantages Staging procedures, all cancer treatment complete. Disadvantages Additional surgery, chest wall changes from XRT.

### Nipple-Areola Reconstruction
Timing 3-6 months after breast mound reconstruction.
**Nipple techniques** Local flaps C-V flap, skate flap, star flap. Nipple sharing from contralateral. 3D tattooing (non-surgical).
**Areola techniques** Tattooing (most common). Skin graft from inner thigh, labia.
Expected flattening of reconstructed nipple over time.`,

    'facial-rejuvenation': `# Facial Rejuvenation

## Facial Analysis
Divide face into vertical thirds (upper, mid, lower) and horizontal fifths.

## Non-Surgical Rejuvenation

### Botulinum Toxin A
**MOA** SNAP-25 blocks acetylcholine at pre-synapse neurotransmitter terminal.
**FDA aesthetic indications** forehead, glabella, lateral eye rhytids. **Glabellar lines**. Procerus horizontal rhytids between nose and medial eyebrow. Corrugator vertical rhytids between nose and eyebrow. Usual dose ~20 units. **Frontalis** horizontal forehead lines, brow elevator.
**Many non-aesthetic indications** migraines, hemifacial dyskinesia, blepharospasm, cervical dystonia, post-stroke upper limb spasticity, urinary problems, etc. **Hyperhidrosis**. Symptoms include bilateral symmetrical sweating, occurs >6 months, onset <25 years, occurs >1 week. Tx ~50 units/axilla.
**Complications**. LD50 (lethal dose for 50% of patients): ~3000 units for a 70kg patient. Eyelid ptosis occurs due to spread to levator palpebrae superioris. Treatment includes apraclonidine (alpha-adrenergic agonist) eye gtts (acts on Muller's muscle).
Unknown use in pregnancy.

### Hyaluronic Acid Fillers
**Characteristics**. G' (modulus): higher value increases stiffness of product.
**Complications**. **Acute arterial compromise/tissue necrosis**. Risk factors include glabella, nasolabial area near ala. Symptoms include skin discoloration, worsening pain. Treatment includes inject hyaluronidase. **Blindness**. Intra-vascular occlusion of central retinal artery. Due to embolism from dorsal nasal artery to internal carotid. Treatment includes immediate retrobulbar injection of hyaluronidase (within 60 minutes).

### Chemical Peels

**Superficial** .
**Glycolic acid peel**. Affects epidermis. Endpoint transparent frosting. Can neutralize with 1% sodium bicarbonate.
**Salicylic acid/Jessner**. Superficial peel. Epidermis (basal layer).

**Intermediate** .
**TCA**. Reaches upper (papillary) dermis. Endpoint: white frosting. Complication: hyperpigmentation. Risk factors include higher Fitzpatrick skin types (IV, V, VI). Treatment includes hydroquinone.

**Deep** .
**Phenol Croton**. Reaches mid dermis (upper reticular dermis). Need cardiac monitoring, electrolyte monitoring. Complication: ventricular dysrhythmia. Related to speed of application. Monitor for 15 minutes after application.
Chemical peels safe to apply to non-undermined areas at same time as rhytidectomy.

### Laser
**CO2, Erbium ablative lasers** The most common for skin resurfacing. Chromophore water (erbium has higher affinity). Prophylaxis with antiviral for HSV due to risk of reactivation. Pretreat for post-inflammatory hyperpigmentation in higher Fitzpatrick skin types (>IV). Treatment includes hydroquinone. The mechanism of action is blocks conversion of tyrosine to dihydroxyphenylalanine to decrease melanin production. **Complications** Hypertrophic scarring. Decrease fluence (energy density), smaller treatment area, avoiding multiple passes. Need to be off isotretinoin for >6 months to reduce risk of abnormal scarring. Hyperpigmentation.

## Surgical Rejuvenation

### Hair Disorders

**Male pattern alopecia (androgenic alopecia)**:.
The most common cause of hair loss.
Norwood-Hamilton classification (I-VII).
Treatment includes minoxidil.

**Alopecia areata** .
T-cell mediated autoimmune response affecting regional hair follicles.
Treatment includes steroid injection.

**Trichotillomania** .
Psychiatric etiology of pulling hair.
Treatment includes psychiatry referral.

**Hair removal** .
Intermittent pulsed light targets melanin of hair follicles.
Electrolysis patients with low skin melanin (Fitzpatrick type I).

**Hair grafting** .
Micrografts 1 to 2 follicles.
Minigrafts 3-4 follicles.
Hair grafts will initially enter catagen phase and then telogen phase a few weeks later. Can take several months before new hairs appear.

### Browlift
**Pretrichial** shortens forehead length.
**Transcoronal** short forehead.
**Endoscopic**. Higher risk of supraorbital nerve injury (numbness to forehead).

### Rhytidectomy

**Anatomy** .
Superficial musculoaponeuotic system (SMAS) contiguous with temperoparietal fascia and platysma.

**Techniques** .
**Posterior incision**. Excision of skin to improve neck skin. Curving along hairline won't distort it.
**SMAS tightening**. Decreases tension on skin closure.
**Minimal access cranial suspension (MACS lift)**. Less skin excision than other techniques; need to extend postauricular incision if needed to remove more skin.
**Short-scar rhytidectomy** similar jawline changes but worse neck management than full-scar rhytidectomy.

**Complications** .
**Hematoma**. Risk factors include hypertension, male. Treatment includes blood-pressure control with clonidine.
**Skin loss**. Treatment includes observe, let demarcate, heal by secondary intention.
**Nerve injuries**. Often self-resolve. Immediate post-operative changes The most common from local injection. In clinic, usually nerve injuries are a neuropraxia. Treatment includes observe for up to 6 months. Highest risk area sub-SMAS near lateral malar eminence.
**Marginal mandibular nerve injury**. Innervates depressor labii inferioris, depressor anguli oris, mentalis. Location deep to platysma and superficial to the facial vein. Diagnosis involves unable to evert lower lip, purse lips, whistle.
**Cervical branch**. Diagnosis involves lower teeth less visible with full smile on affected side.
**Great auricular nerve injury**. Sensation to ear lobe. McKinney's point becomes superficial at midpoint of the sternocleidomastoid (SCM) 6.5cm inferior to the external auditory of SCM. Over resection of skin adjacent to earlobe.
**Parotid duct injury**. Conservative management bland diet, percutaneous drainage, scopolamine patch, glycopyrrolate, botulinum toxin injection.
**Sialocele**. Injury to submandibular gland. Sx Unilateral facial swelling, pain.

### Buccal Fat Reduction
There are three anterior, intermediate, and posterior. Parotid duct passes through anterior lobe (posterior portion).

### Genioplasty

**Anatomy** .
**Genioglossus**. Nerve hypoglossal (CN XII). Runs parallel with the posterior digastric muscle. Injury affects ipsilateral tongue paralysis.

**Osseous** .
Osteotomy to slide inferior mandible anteriorly.

**Implant** .
Porous polyethylene. Allows soft-tissue ingrowth.
Silicone.

**Mandibular contouring** .
Treatment includes square jaw.

### Neck Rejuvenation
Assess skin quality, location of excess (e.g., central, lateral), platysma banding, skin excess.
Treatment includes cryolipolysis, suction-assisted lipectomy, direct excision, lower rhytidectomy.`,

    'rhinoplasty': `# Rhinoplasty and Nasal Reconstruction

## Anatomy

### Upper Lateral Cartilages
**Keystone area** junction to nasal bones. Cartilage is posterior to nasal bones. Inverted-V deformity if disrupted and not corrected.

### Internal Nasal Valve
The most common area of nasal-breathing obstruction.
Septum, upper lateral cartilage, inferior turbinate.

### Depressor Septi Nasi
Anomalous muscle from upper lip to septum.
Changes nose/lip relationship when animated.

## Nasal Analysis

### Assess Patency of Internal Nasal Valves
**Cottle maneuver** distract cheek laterally, ask if nasal breathing improves.
**Rhinomonometry** objective measurement.

### Bulbous Tip
Convex lower lateral cartilages, wide domal width (less than 4mm), wide angle of divergence.

## Nasal Reconstruction

### Nasal Subunits
Sidewalls, ala, soft triangles, dorsum, nasal tip, columella.

### Reconstruction

**<1.5cm defects** .
Healing by secondary intention, primary closure, local flaps (e.g., bilobed).

**1.5-2.5cm defects** .
Local flaps (e.g., bilobed).

**>2.5cm or full-thickness defects** .
Paramedian forehead flap. Pedicle supratrochlear artery. Three stages transfer, intermediate debulking (optional), pedicle division at 3 weeks. Excellent color and texture match. Frontalis muscle orbicularis oris innervated by facial nerve. Can develop forehead paralysis without reinnervation.

**Nasal lining** .
Septal mucosal flap, folded forehead flap, free mucosal graft, full-thickness skin graft.

**Nasal support** .
Cartilage grafts septum, ear, rib.
Bone grafts calvarium, iliac crest.

## Rhinoplasty Techniques

### Dorsal Hump Reduction
Rasp for bony hump.
Scalpel or scissors for cartilaginous hump.
May need osteotomies to close open roof.

### Tip Refinement
Cephalic trim of lower lateral cartilages. Leave at least 6mm strip to maintain support.
Interdomal and intradomal sutures.
Tip grafts shield, cap, onlay.

### Nasal Dorsal Hump Augmentation
Treatment includes septal cartilage or alloplastic materials (acellular dermal matrix, silicone, ePTFE).

### Decreased Nasal Tip Support
Treatment includes septal extension graft, columellar strut graft.

### Alar Flaring
Assess for alar flare reduction at end of case as changing projection can affect alar width.

### Complications

**Inverted-V deformity** collapse of upper lateral cartilages from bony nose.
Treatment includes spreader grafts or auto spreader flaps.

**Alar notching** .
The most common cephalic trim over resected.

**Difficulty with nasal breathing** .
Internal nasal valve from separating upper lateral cartilage.
Treatment includes spreader grafts or auto spreader flaps. Increase radius of internal nasal valve.

**External nasal valve** from over resection of lower lateral cartilages .
Diagnosis involves inward rotation and malposition of lower lateral crura.
Treatment includes lateral crural strut graft.`,

    'eye-aesthetic-reconstructive': `# Eye Aesthetic and Reconstructive

## Pre-Operative Evaluation

### Ptosis
**Marginal reflex distance (MRD)-1**: light reflex on cornea to upper eyelid margin in primary gaze, usual 4-5mm.
**Hering's law** equal innervation of bilateral levator palpebral muscles. Test phenylephrine to stimulate Muller muscle to raise more ptotic eyelid and decrease levator innervation and observe if contralateral eyelid falls.

### Horizontal Laxity
Slant from medial to lateral canthus. Can become negative (downward slanting) with age. Treatment includes canthopexy or canthoplasty.

### Malar Vector
Relationship of globe to malar soft tissues. Can become negative over time from deficient lid support. Risk factors include for lid ectropion. Treatment includes canthopexy or canthoplasty.

### Canalicular/Lacrimal Injury
**RF** medial canthus injuries. Associated with epiphora, telecanthus, ptosis. Anterior displacement of eye punctum affects lacrimal drainage. Commonly in setting of naso-orbito-ethmoidal fractures.
**Dx Jones tests**. I inject fluorescein to medial canaliculus, observe for drainage through the nose (through inferior meatus) for 5 minutes. II if no drainage, irrigate medial canaliculus with saline, observe for drainage to diagnose a partial obstruction.
**Tx** silicone stent x 3-6 months (acute), dacrocystorhinostomy (chronic, salvage).

### Refractory Surgery
**Timing of blepharoplasty after corneal surgery (e.g., LASIK)**. 6 months. Increased risk for dry eyes via change to corneal reflex arc. Eye tear film production:  Outer: lipid (prevents evaporation). Middle: aqueous (lubricates). Inner: mucin (nourishes cornea). Produced by Meibomian glands.

### Rheumatologic Disease
**Sjogren's syndrome**. Symptoms include dry eyes, dry mouth, polyarthritis. Diagnosis involves anti-SSA and anti-SSB serum test.

## Ptosis Repair

### Pre-operative Evaluation
**Levator function** (downward to upward gaze):  Normal: >12mm. Good: 8-12mm. Fair: 5-7mm. Poor: <4mm.

### Options
**Fasanella-Servat** (tarsus/Muller resection): minimal ptosis, good levator function.
**Levator advancement** fair levator function. Senile levator dehiscence suture levator aponeurosis to tarsal plate. Levator is located deep to pre-aponeurotic central fat pad.
**Frontalis sling** poor levator function, use non-absorbable biomaterials.

## Eyelid Reconstruction

### Direct Closure
It can pentagonal excision and closure.

### Lamella
**Anterior** skin. Can be skin grafts, flaps (e.g., Tripier). Post-burn contracture. Treatment includes contracture release, skin grafting.
**Middle** tarsus. Cartilage grafts (e.g., ear) or acellular dermal matrix.
**Posterior** conjunctival. Can be oral mucosa grafts (e.g., palate) or lid-switch flaps.

### Upper Eyelid Flaps
**Cutler-Beard flap**. Lower to upper eyelid switch. Full thickness upper eyelid defects >2/3.

### Lower Eyelid Flaps
**Hughes tarsoconjunctival flap**.
Upper to lower lid switch.

## Aesthetic Eyelid Surgery

### Upper Blepharoplasty
Skin excision up to medial punctum.
**Complications**. Nasal skin webbing from excessive medial skin resection. **Lagophthalmos** incomplete eyelid closure. Treatment includes taping, observation. **Transient ptosis**. Caused by swelling, bruising. Treatment includes observe, usually resolves in a few days. **Lacrimal gland injury** dry eye. **Meibomian gland injury** dry eyes, can be injured with skin-only excision. Produce oil that reduce tear evaporation. **Loss of ocular protection**. Injury to extra-canthal orbicularis oculi muscle innervated by zygomatic branch.

### Lower Lid Blepharoplasty

**Approaches** .
Subconjunctival/skin muscle flap highest rate of ectropion.
Subtarsal.
Transconjunctival lowest rate of ectropion.

**Management of tear trough** .
Release of orbital retaining ligament, fat repositioning.
Anatomic landmark levator labii superioris.

**Complications** .
**Lower lid malposition**. The most common horizontal laxity of tarsoligamentous sling. Diagnosis involves snap-back test (distract 8mm). Treatment includes tarsal strip.
**Injury to inferior oblique**, divides medial/central fat compartments. Symptoms include elevate, abduct the eye.
**Retrobulbar hematoma**. Symptoms include pain, diminished visual acuity (decreased perception of red light initially), bruising, proptosis, decreased ocular movements. Treatment includes immediate lateral canthotomy, STAT ophthalmology consult, then mannitol, furosemide and then OR for orbital decompression.
**Chemosis**. Prolapse of conjunctiva. Treatment includes lubrication, eye patching. Treatment includes conjunctivotomy for severe or refractory.
**Lateral scleral show**. Inadequate canthal support.

### Eyelid Fat

**Normal anatomy** .
Retro orbicularis oculi fat (ROOF) in upper eyelid.
Sub orbicularis oculis fat (SOOF) in lower eyelid.

**Eyelid Xanthelasmas** .
Excess fat deposits, affects lower eyelids.
Treatment includes chemical peels, cryotherapy, laser ablation, direct excision and closure (no margins).

## Congenital

### Blepharoptosis
Delay treatment until age 3 unless significant visual obstruction due to anesthetic risk.

### Insensate Cornea
Diagnosis involves recurrent ulcerations.
Treatment includes supratrochlear to right scleral limbus nerve transfer.

### Limbal Dermoids
Benign congenital tumors of the outer globe.`,

    'body-contouring': `# Body Contouring

## Liposuction

### Overview
Long-term reduction of subcutaneous fat in treated areas without change in untreated areas when weight stable.

### Wetting Solution
Isotonic fluid with epinephrine, lidocaine. Max dose lidocaine 35mg/kg (some studies suggest up to 55). Fluid present in 10-30% of aspirate. Peak lidocaine levels reached at 8-18 hours from injection, quicker above the clavicles.
**Techniques**. **Dry** no tumescence. Estimated blood loss (EBL) 20-40% of aspirate. **Wet** 200-300cc tumescence per area. **Superwet** 1 1 ratio. EBL 1% of aspirate. **Tumescence** 2-3 1 ratio.

### High-Volume Liposuction
>5000cc, should be performed with overnight observation due to risk for volume shifts.

### Devices
**Suction-assisted versus ultrasound-assisted**. No change in outcome. Less surgeon fatigue with ultrasound.
**Laser-assisted** less post-operative pain.
Length of cannula related to flow resistance.
Cannula size related to efficiency and risk of contour abnormality.

### Lymphedema
Relative contraindication for aesthetic indications if pitting edema.

### Complications
**Contour abnormalities**. Avoid zones of adherence (e.g., lateral gluteal depression). Use crisscrossing cannula passes with multiple vectors.

### Fat Grafting

**Adipose-derived stem cells** .
Can differentiate into fibroblasts, keratinocytes directly.
Anatomic areas with highest composition abdomen, inner thighs.

**Gluteal fat grafting** .
Avoid intra-muscular injection/downward trajectory, large cannula (>4mm), inject only while in motion.
**Complication** fat embolism, generally within 72 hours from surgery. Symptoms include shortness of breath, confusion, petechial rash. Treatment includes cardiopulmonary support.

### Non-Invasive Options

**Cryolipolysis** .
The mechanism of action is adipocyte apoptosis through crystallization at -5 to -15 degrees Celsius and ischemia/reperfusion injury.
20-25% reduction of fat in treatment area.
Complications include include The most common transient hypoesthesia. Paradoxical adipose hyperplasia. Abnormal focal increase in subcutaneous fat within treatment area. Risk factors include large applicator, male, Hispanic, abdominal site. Treatment includes observe for 6 months, liposuction.

## Abdominoplasty

### Planning
Scarpa's fascia superficial to rectus fascia.
Superior extent of dissection costal margin.

### Technique
Muscle plication repair diastasis recti.
Umbilical transposition.
Skin undermining and excision.

### Complications
**Hematoma** The most common complication. Risk factors include male.
**Seroma** The most common delayed complication.
**Wound dehiscence** T-junction MC.
**Skin/fat necrosis** Lateral dog ears, excessive tension.
**Umbilical necrosis** Over-dissection, tension.
**Abdominal bulge/hernia** Inadequate fascial repair.
**DVT/PE** Use Caprini score for prophylaxis.
**Sensory changes** Hypesthesia common, usually improves.

### Variations
**Mini-abdominoplasty** Limited undermining, no umbilical transposition.
**Extended abdominoplasty** Includes flanks.
**Circumferential abdominoplasty (lower body lift)**. Addresses: abdomen, flanks, back, buttocks, lateral thighs.
**Belt lipectomy** Similar to lower body lift.

## Massive Weight Loss Surgery

### Post-Bariatric Body Contouring
**Timing** After weight stabilization (>6 months), nutritional optimization.
**Staged procedures** Due to extensive surgery required.
**Body regions** Arms, breasts, abdomen, thighs, buttocks.

### Lower Body Lift
Circumferential excision at waistline.
Addresses Abdomen, flanks, back, buttocks, lateral thighs.
Lifts buttocks and lateral thighs.
Higher complication rate than isolated abdominoplasty.

### Corset Abdominoplasty
Addresses both vertical and horizontal excess.
Trim torso circumferentially.

### Panniculectomy
Removal of pannus only.
Considered functional operation for persistent and recurrent intertriginous ulcerations.
No umbilical transposition, no muscle plication.
Less costly than abdominoplasty.

### Upper Body Lift
Addresses Back rolls, bra rolls, lateral chest.
Incisions Along bra line.

### Medial Thighplasty
Vertical incision along medial thigh.
Addresses medial thigh laxity.

### Complications
Similar to abdominoplasty but higher rates.
Seroma, wound dehiscence, skin necrosis common.
**Lymphedema** Prolonged edema with circumferential technique. Femoral triangle contains lymphatic channels.
DVT/PE prophylaxis critical.

## Extremity Surgeries

### Brachioplasty (Arm Lift)

**Indications** Excess upper arm skin.

**Techniques** .
Liposuction. Pinch test of 1.5 to 3cm with good skin tone/no laxity.
Liposuction-assisted brachioplasty. Facilitates soft-tissue dissection.
Scar location posteromedial most concealed.

**Complications** .
Hypertrophic scarring (#1), wound-healing problems.
**Injury to medial antebrachial cutaneous nerve**. Superficial at 14cm proximal to elbow, travels in medial arm next to basilic vein. Protect by leaving 1cm of fat at deep fascia. No risk with posterior resection.

### Thighplasty/Thigh Lift

**Complications** .
Prolonged edema with circumferential technique.
Femoral triangle is where lymphatic channels are.

## Genital Aesthetic Surgery

### Labiaplasty
**Complications** Hematoma. Risk factors include male.

### Vaginal Rejuvenation
**Vaginoplasty**. **Clitoral hood reduction**. Excise laterally, not anteriorly/clitoral frenulum. Complication injury to sensory nerves at anterior hood.
**Laser rejuvenation** not shown to improve symptoms in post-menopausal women.

## Others

### HIV-Associated Lipodystrophy
Diagnosis involves atrophy of malar and temporal fat, development of buffalo hump/cervical fat deposits associated with use of HAART medications.
Treatment includes fat grafting, poly-l-lactic acid filler to face, liposuction to buffalo hump.`,
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
