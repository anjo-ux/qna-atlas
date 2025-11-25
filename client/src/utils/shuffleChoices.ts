import { Question } from '@/types/question';

export interface ShuffledQuestion extends Question {
  choiceOrder?: string[]; // Stores the shuffled order of choices (A, B, C, D, E)
}

/**
 * Shuffles the answer choices for a question
 * Stores the shuffled order in choiceOrder property
 */
export function shuffleQuestionChoices(question: Question): ShuffledQuestion {
  const choices = ['A', 'B', 'C', 'D', 'E'];
  
  // Create a shuffled copy of the choices array
  const shuffled = [...choices].sort(() => Math.random() - 0.5);
  
  return {
    ...question,
    choiceOrder: shuffled,
  };
}

/**
 * Shuffles all questions in an array
 */
export function shuffleAllQuestions(questions: Question[]): ShuffledQuestion[] {
  return questions.map(shuffleQuestionChoices);
}
