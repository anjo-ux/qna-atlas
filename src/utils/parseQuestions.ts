import * as XLSX from 'xlsx';
import { Question, Section, Subsection } from '@/types/question';
import { reviewContent } from '@/data/reviewContent';

const sectionStructure = {
  'comprehensive': {
    title: 'Section 1: Comprehensive',
    subsections: { 'anatomy': 'Anatomy', 'skin-lesions': 'Skin Lesions', 'flaps-and-grafts': 'Flaps and Grafts', 'microsurgery': 'Microsurgery', 'infections': 'Infections', 'burns': 'Burns', 'trunk': 'Trunk', 'gender-affirming-surgery': 'Gender-Affirming Surgery', 'vascular-anomalies': 'Vascular Anomalies' }
  },
  'hand-lower-extremity': { title: 'Section 2: Hand and Lower Extremity', subsections: { 'hand-digit-trauma': 'Hand and Digit Trauma', 'hand-nerves': 'Hand Nerves', 'hand-tendons': 'Hand Tendons', 'replantation-vascular': 'Replantation and Vascular', 'wrist-forearm-injuries': 'Wrist and Forearm Injuries', 'hand-tumors': 'Hand Tumors', 'hand-inflammation-infections': 'Hand Inflammation and Infections', 'congenital-pediatric-hand': 'Congenital and Pediatric Hand', 'lower-extremity': 'Lower Extremity' }},
  'craniomaxillofacial': { title: 'Section 3: Craniomaxillofacial', subsections: { 'cleft-lip-palate': 'Cleft Lip and Palate', 'facial-fractures': 'Facial Fractures', 'facial-paralysis': 'Facial Paralysis', 'ear-reconstruction': 'Ear Reconstruction', 'mandible-dental-orthognathic': 'Mandible, Dental, and Orthognathic', 'head-neck-tumors': 'Head and Neck Tumors', 'congenital-syndromes': 'Congenital Syndromes' }},
  'breast-cosmetic': { title: 'Section 4: Breast and Cosmetic', subsections: { 'breast-augmentation': 'Breast Augmentation', 'breast-reduction-mastopexy': 'Breast Reduction and Mastopexy', 'breast-reconstruction': 'Breast Reconstruction', 'facial-rejuvenation': 'Facial Rejuvenation', 'rhinoplasty': 'Rhinoplasty', 'eye-aesthetic-reconstructive': 'Eye Aesthetic and Reconstructive', 'body-contouring': 'Body Contouring' }},
  'core-surgical': { title: 'Section 5: Core Surgical Principles', subsections: { 'anesthesia': 'Anesthesia', 'perioperative-care': 'Perioperative Care', 'critical-care': 'Critical Care', 'trauma': 'Trauma', 'transplantation': 'Transplantation', 'statistics-ethics-practice': 'Statistics, Ethics, and Practice Management' }}
};

const categoryKeywordMapping: Record<string, { section: string; subsection: string }> = {
  'wound': { section: 'comprehensive', subsection: 'anatomy' }, 'skin': { section: 'comprehensive', subsection: 'skin-lesions' }, 'flap': { section: 'comprehensive', subsection: 'flaps-and-grafts' }, 'infection': { section: 'comprehensive', subsection: 'infections' }, 'burn': { section: 'comprehensive', subsection: 'burns' }
};

function categorizeQuestion(path: string): { section: string; subsection: string } {
  const lower = path.toLowerCase();
  for (const [key, val] of Object.entries(categoryKeywordMapping)) {
    if (lower.includes(key)) return val;
  }
  return { section: 'comprehensive', subsection: 'anatomy' };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\\/g, '').trim();
}

export async function loadQuestions(): Promise<Section[]> {
  const response = await fetch('/data/questions.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }) as string[][];

  const questions: Question[] = [];
  for (let i = 12; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 6) continue;
    const [id, , categoryPath, questionHtml, answerHtml, tags] = row;
    if (!questionHtml || !answerHtml) continue;
    const { section, subsection } = categorizeQuestion(categoryPath || '');
    if (subsection === 'anatomy') continue;
    questions.push({ id: id || `q-${i}`, question: stripHtml(questionHtml), answer: stripHtml(answerHtml), category: section, subcategory: subsection, tags: tags ? tags.split(/\s+/).filter(Boolean) : [] });
  }

  const sectionMap = new Map<string, Map<string, Question[]>>();
  questions.forEach(q => {
    if (!sectionMap.has(q.category)) sectionMap.set(q.category, new Map());
    const subsectionMap = sectionMap.get(q.category)!;
    if (!subsectionMap.has(q.subcategory)) subsectionMap.set(q.subcategory, []);
    subsectionMap.get(q.subcategory)!.push(q);
  });

  return Object.keys(sectionStructure).map(sectionId => {
    const subsectionMap = sectionMap.get(sectionId) || new Map();
    const subsections: Subsection[] = [];
    const sectionKey = sectionId as keyof typeof sectionStructure;
    const section = sectionStructure[sectionKey];
    
    Object.keys(section.subsections).forEach(subsectionId => {
      const questionsForSubsection = subsectionMap.get(subsectionId) || [];
      
      // Get content from reviewContent with proper typing
      const sectionContent = reviewContent[sectionKey as keyof typeof reviewContent];
      const content = sectionContent?.subsections?.[subsectionId as keyof typeof sectionContent.subsections] as string | undefined;
      
      if (content || questionsForSubsection.length > 0) {
        const subsectionKey = subsectionId as keyof typeof section.subsections;
        subsections.push({ 
          id: subsectionId, 
          title: section.subsections[subsectionKey], 
          content, 
          questions: questionsForSubsection 
        });
      }
    });
    return { id: sectionId, title: sectionStructure[sectionId as keyof typeof sectionStructure].title, subsections };
  }).filter(s => s.subsections.length > 0);
}

export function getSectionStructure() { return sectionStructure; }
export function updateSubsectionTitle(sectionId: string, subsectionId: string, newTitle: string) { localStorage.setItem(`subsection-${sectionId}-${subsectionId}`, newTitle); }
export function getSubsectionTitle(sectionId: string, subsectionId: string): string {
  const saved = localStorage.getItem(`subsection-${sectionId}-${subsectionId}`);
  if (saved) return saved;
  const section = sectionStructure[sectionId as keyof typeof sectionStructure];
  return section?.subsections[subsectionId as keyof typeof section.subsections] || subsectionId;
}
