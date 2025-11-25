import * as XLSX from 'xlsx';
import { Question, Section, Subsection } from '@/types/question';

// Category mapping from file categories to our structure
const categoryMapping: Record<string, { section: string; subsection: string }> = {
  // Comprehensive
  'wound': { section: 'comprehensive', subsection: 'anatomy' },
  'skin': { section: 'comprehensive', subsection: 'skin-lesions' },
  'flap': { section: 'comprehensive', subsection: 'flaps-and-grafts' },
  'graft': { section: 'comprehensive', subsection: 'flaps-and-grafts' },
  'microsurgery': { section: 'comprehensive', subsection: 'microsurgery' },
  'infection': { section: 'comprehensive', subsection: 'infections' },
  'burn': { section: 'comprehensive', subsection: 'burns' },
  'trunk': { section: 'comprehensive', subsection: 'trunk' },
  'chest wall': { section: 'comprehensive', subsection: 'trunk' },
  'gender': { section: 'comprehensive', subsection: 'gender-affirming-surgery' },
  'vascular anomal': { section: 'comprehensive', subsection: 'vascular-anomalies' },
  'hemangioma': { section: 'comprehensive', subsection: 'vascular-anomalies' },
  
  // Hand and Lower Extremity
  'hand trauma': { section: 'hand-lower-extremity', subsection: 'hand-digit-trauma' },
  'digit': { section: 'hand-lower-extremity', subsection: 'hand-digit-trauma' },
  'fracture': { section: 'hand-lower-extremity', subsection: 'hand-digit-trauma' },
  'nerve': { section: 'hand-lower-extremity', subsection: 'hand-nerves' },
  'tendon': { section: 'hand-lower-extremity', subsection: 'hand-tendons' },
  'replant': { section: 'hand-lower-extremity', subsection: 'replantation-vascular' },
  'vascular': { section: 'hand-lower-extremity', subsection: 'replantation-vascular' },
  'wrist': { section: 'hand-lower-extremity', subsection: 'wrist-forearm-injuries' },
  'forearm': { section: 'hand-lower-extremity', subsection: 'wrist-forearm-injuries' },
  'hand tumor': { section: 'hand-lower-extremity', subsection: 'hand-tumors' },
  'dupuytren': { section: 'hand-lower-extremity', subsection: 'hand-inflammation-infections' },
  'arthritis': { section: 'hand-lower-extremity', subsection: 'hand-inflammation-infections' },
  'congenital hand': { section: 'hand-lower-extremity', subsection: 'congenital-pediatric-hand' },
  'pediatric hand': { section: 'hand-lower-extremity', subsection: 'congenital-pediatric-hand' },
  'lower extremity': { section: 'hand-lower-extremity', subsection: 'lower-extremity' },
  'leg': { section: 'hand-lower-extremity', subsection: 'lower-extremity' },
  'foot': { section: 'hand-lower-extremity', subsection: 'lower-extremity' },
  
  // Craniomaxillofacial
  'cleft': { section: 'craniomaxillofacial', subsection: 'cleft-lip-palate' },
  'facial fracture': { section: 'craniomaxillofacial', subsection: 'facial-fractures' },
  'midface': { section: 'craniomaxillofacial', subsection: 'facial-fractures' },
  'orbital': { section: 'craniomaxillofacial', subsection: 'facial-fractures' },
  'facial paralysis': { section: 'craniomaxillofacial', subsection: 'facial-paralysis' },
  'facial nerve': { section: 'craniomaxillofacial', subsection: 'facial-paralysis' },
  'ear': { section: 'craniomaxillofacial', subsection: 'ear-reconstruction' },
  'microtia': { section: 'craniomaxillofacial', subsection: 'ear-reconstruction' },
  'mandible': { section: 'craniomaxillofacial', subsection: 'mandible-dental-orthognathic' },
  'dental': { section: 'craniomaxillofacial', subsection: 'mandible-dental-orthognathic' },
  'orthognathic': { section: 'craniomaxillofacial', subsection: 'mandible-dental-orthognathic' },
  'head and neck': { section: 'craniomaxillofacial', subsection: 'head-neck-tumors' },
  'oral': { section: 'craniomaxillofacial', subsection: 'head-neck-tumors' },
  'cancer': { section: 'craniomaxillofacial', subsection: 'head-neck-tumors' },
  'craniosynostosis': { section: 'craniomaxillofacial', subsection: 'congenital-syndromes' },
  'craniofacial': { section: 'craniomaxillofacial', subsection: 'congenital-syndromes' },
  'syndrome': { section: 'craniomaxillofacial', subsection: 'congenital-syndromes' },
  
  // Breast and Cosmetic
  'breast augmentation': { section: 'breast-cosmetic', subsection: 'breast-augmentation' },
  'breast implant': { section: 'breast-cosmetic', subsection: 'breast-augmentation' },
  'breast reduction': { section: 'breast-cosmetic', subsection: 'breast-reduction-mastopexy' },
  'mastopexy': { section: 'breast-cosmetic', subsection: 'breast-reduction-mastopexy' },
  'breast reconstruction': { section: 'breast-cosmetic', subsection: 'breast-reconstruction' },
  'mastectomy': { section: 'breast-cosmetic', subsection: 'breast-reconstruction' },
  'face': { section: 'breast-cosmetic', subsection: 'facial-rejuvenation' },
  'facelift': { section: 'breast-cosmetic', subsection: 'facial-rejuvenation' },
  'blepharoplasty': { section: 'breast-cosmetic', subsection: 'eye-aesthetic-reconstructive' },
  'rhinoplasty': { section: 'breast-cosmetic', subsection: 'rhinoplasty' },
  'nose': { section: 'breast-cosmetic', subsection: 'rhinoplasty' },
  'body contouring': { section: 'breast-cosmetic', subsection: 'body-contouring' },
  'liposuction': { section: 'breast-cosmetic', subsection: 'body-contouring' },
  'abdominoplasty': { section: 'breast-cosmetic', subsection: 'body-contouring' },
  
  // Core Surgical Principles
  'anesthesia': { section: 'core-surgical', subsection: 'anesthesia' },
  'anesthetic': { section: 'core-surgical', subsection: 'anesthesia' },
  'perioperative': { section: 'core-surgical', subsection: 'perioperative-care' },
  'postoperative': { section: 'core-surgical', subsection: 'perioperative-care' },
  'critical care': { section: 'core-surgical', subsection: 'critical-care' },
  'trauma': { section: 'core-surgical', subsection: 'trauma' },
  'transplant': { section: 'core-surgical', subsection: 'transplantation' },
  'statistic': { section: 'core-surgical', subsection: 'statistics-ethics-practice' },
  'ethics': { section: 'core-surgical', subsection: 'statistics-ethics-practice' },
  'practice management': { section: 'core-surgical', subsection: 'statistics-ethics-practice' },
};

function categorizeQuestion(category: string, subcategory: string): { section: string; subsection: string } {
  const combined = `${category} ${subcategory}`.toLowerCase();
  
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (combined.includes(key)) {
      return value;
    }
  }
  
  // Default to comprehensive if no match
  return { section: 'comprehensive', subsection: 'anatomy' };
}

function stripHtml(html: string): string {
  return html
    .replace(/<div>/g, '\n')
    .replace(/<\/div>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\\/g, '')
    .trim();
}

export async function loadQuestions(): Promise<Section[]> {
  const response = await fetch('/data/questions.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

  const questions: Question[] = [];
  
  // Skip header rows and process data
  for (let i = 12; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 6) continue;
    
    const [id, , categoryPath, questionHtml, answerHtml, tags] = row;
    if (!questionHtml || !answerHtml) continue;
    
    // Parse category path (e.g., "In service exam - practice questions::Head and Neck::Cancer")
    const categoryParts = categoryPath.split('::').map(p => p.trim());
    const category = categoryParts[categoryParts.length - 2] || categoryParts[0] || '';
    const subcategory = categoryParts[categoryParts.length - 1] || '';
    
    const { section, subsection } = categorizeQuestion(category, subcategory);
    
    questions.push({
      id: id || `q-${i}`,
      question: stripHtml(questionHtml),
      answer: stripHtml(answerHtml),
      category: section,
      subcategory: subsection,
      tags: tags ? tags.split(/\s+/).filter(Boolean) : [],
    });
  }

  // Organize into sections
  const sectionMap = new Map<string, Map<string, Question[]>>();
  
  questions.forEach(q => {
    if (!sectionMap.has(q.category)) {
      sectionMap.set(q.category, new Map());
    }
    const subsectionMap = sectionMap.get(q.category)!;
    if (!subsectionMap.has(q.subcategory)) {
      subsectionMap.set(q.subcategory, []);
    }
    subsectionMap.get(q.subcategory)!.push(q);
  });

  return createSectionStructure(sectionMap);
}

function createSectionStructure(sectionMap: Map<string, Map<string, Question[]>>): Section[] {
  const sectionOrder = [
    { id: 'comprehensive', title: 'Section 1: Comprehensive' },
    { id: 'hand-lower-extremity', title: 'Section 2: Hand & Lower Extremity' },
    { id: 'craniomaxillofacial', title: 'Section 3: Craniomaxillofacial' },
    { id: 'breast-cosmetic', title: 'Section 4: Breast & Cosmetic' },
    { id: 'core-surgical', title: 'Section 5: Core Surgical Principles' },
  ];

  const subsectionTitles: Record<string, string> = {
    'anatomy': 'Anatomy',
    'skin-lesions': 'Skin Lesions',
    'flaps-and-grafts': 'Flaps and Grafts',
    'microsurgery': 'Microsurgery',
    'infections': 'Infections',
    'burns': 'Burns',
    'trunk': 'Trunk',
    'gender-affirming-surgery': 'Gender-Affirming Surgery',
    'vascular-anomalies': 'Vascular Anomalies',
    'hand-digit-trauma': 'Hand and Digit Trauma',
    'hand-nerves': 'Hand Nerves',
    'hand-tendons': 'Hand Tendons',
    'replantation-vascular': 'Replantation and Vascular',
    'wrist-forearm-injuries': 'Wrist and Forearm Injuries',
    'hand-tumors': 'Hand Tumors',
    'hand-inflammation-infections': 'Hand Inflammation and Infections',
    'congenital-pediatric-hand': 'Congenital and Pediatric Hand',
    'lower-extremity': 'Lower Extremity',
    'cleft-lip-palate': 'Cleft Lip and Palate',
    'facial-fractures': 'Facial Fractures',
    'facial-paralysis': 'Facial Paralysis',
    'ear-reconstruction': 'Ear Reconstruction',
    'mandible-dental-orthognathic': 'Mandible, Dental, and Orthognathic',
    'head-neck-tumors': 'Head and Neck Tumors',
    'congenital-syndromes': 'Congenital Syndromes',
    'breast-augmentation': 'Breast Augmentation',
    'breast-reduction-mastopexy': 'Breast Reduction and Mastopexy',
    'breast-reconstruction': 'Breast Reconstruction',
    'facial-rejuvenation': 'Facial Rejuvenation',
    'rhinoplasty': 'Rhinoplasty',
    'eye-aesthetic-reconstructive': 'Eye Aesthetic and Reconstructive',
    'body-contouring': 'Body Contouring',
    'anesthesia': 'Anesthesia',
    'perioperative-care': 'Perioperative Care',
    'critical-care': 'Critical Care',
    'trauma': 'Trauma',
    'transplantation': 'Transplantation',
    'statistics-ethics-practice': 'Statistics, Ethics, and Practice Management',
  };

  return sectionOrder.map(({ id, title }) => {
    const subsectionMap = sectionMap.get(id) || new Map();
    const subsections: Subsection[] = [];
    
    subsectionMap.forEach((questions, subsectionId) => {
      subsections.push({
        id: subsectionId,
        title: subsectionTitles[subsectionId] || subsectionId,
        questions,
      });
    });

    // Sort subsections by their natural order
    subsections.sort((a, b) => {
      const order = Object.keys(subsectionTitles);
      return order.indexOf(a.id) - order.indexOf(b.id);
    });

    return { id, title, subsections };
  }).filter(section => section.subsections.length > 0);
}
