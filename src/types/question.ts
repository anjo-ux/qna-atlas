export interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  tags: string[];
}

export interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

export interface Subsection {
  id: string;
  title: string;
  questions: Question[];
}
