import 'server-only';
import { VRAGEN } from '@/content/vragen';
import { parseQuestions } from './validation';

/** De vaste vragen van het spel, gecontroleerd en genormaliseerd. Alleen server-side. */
export function fixedQuestions() {
  return parseQuestions(VRAGEN.map((v) => ({ question: v.vraag, correctAnswer: v.antwoord })));
}
