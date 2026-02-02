import type { Question } from '@/types/question';

export interface ParsedQuestionForReview {
  text: string;
  choices: { letter: string; text: string }[];
  correctAnswer: string | null;
}

function toChoiceLetter(captured: string): string {
  const upper = captured.toUpperCase();
  if (/[A-F]/.test(upper)) return upper;
  const n = parseInt(captured, 10);
  if (n >= 1 && n <= 6) return String.fromCharCode(64 + n);
  return upper;
}

export function parseQuestionForReview(question: Question): ParsedQuestionForReview {
  let questionText = question.question;
  const choices: { letter: string; text: string }[] = [];
  const choiceLineRegex = /^([A-Fa-f1-6])\s*[.)]\s*(.+)$|^\s*\(([A-Fa-f1-6])\)\s*(.+)$/;

  const lines = questionText.split('\n');
  let choicesOnSeparateLines = false;

  for (const line of lines) {
    const m = line.match(choiceLineRegex);
    if (m && (m[2]?.trim() || m[4]?.trim())) {
      choicesOnSeparateLines = true;
      break;
    }
  }

  if (choicesOnSeparateLines) {
    const textLines: string[] = [];
    for (const line of lines) {
      const m = line.match(choiceLineRegex);
      if (m) {
        const letter = toChoiceLetter(m[1] || m[3] || '');
        const text = (m[2] || m[4] || '').trim();
        if (letter && text && /^[A-F]$/.test(letter)) choices.push({ letter, text });
      } else if (line.trim()) textLines.push(line);
    }
    questionText = textLines.join('\n');
  } else {
    const questionMarkers = ['?', ':', '.'];
    let lastMarkerIndex = -1;
    for (const marker of questionMarkers) {
      const index = questionText.lastIndexOf(marker);
      if (index > lastMarkerIndex) lastMarkerIndex = index;
    }
    if (lastMarkerIndex !== -1) {
      const beforeMarker = questionText.substring(0, lastMarkerIndex + 1);
      const afterMarker = questionText.substring(lastMarkerIndex + 1);
      const choiceMatches = Array.from(afterMarker.matchAll(/([A-Fa-f1-6])\s*[.)]\s*/g));
      if (choiceMatches.length >= 2 && choiceMatches.length <= 6) {
        const extractedChoices: { letter: string; text: string }[] = [];
        for (let i = 0; i < choiceMatches.length; i++) {
          const letter = toChoiceLetter(choiceMatches[i][1]);
          if (!/^[A-F]$/.test(letter)) continue;
          const startIndex = choiceMatches[i].index! + choiceMatches[i][0].length;
          const endIndex = i < choiceMatches.length - 1 ? choiceMatches[i + 1].index! : afterMarker.length;
          const text = afterMarker.substring(startIndex, endIndex).trim();
          if (text) extractedChoices.push({ letter, text });
        }
        if (extractedChoices.length >= 2 && extractedChoices.length <= 6) {
          choices.push(...extractedChoices);
          questionText = beforeMarker;
        }
      }
    }
  }

  const correctMatch = question.answer.match(
    /(?:correct answer is|answer is|correct response is|response is)\s*(?:option\s+)?([A-F])/i
  );
  let correctAnswer: string | null = correctMatch ? correctMatch[1].toUpperCase() : null;
  // Fallback: answer may start with "A)" or "A.\n" then explanation (e.g. AI-generated or Excel)
  if (!correctAnswer) {
    const leading = question.answer.match(/^\s*([A-F])\)/);
    if (leading) correctAnswer = leading[1].toUpperCase();
  }

  return { text: questionText.trim(), choices, correctAnswer };
}
