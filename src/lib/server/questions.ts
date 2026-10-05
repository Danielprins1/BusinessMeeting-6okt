import 'server-only';
import { VRAGEN } from '@/content/vragen';
import { parseQuestions } from './validation';

/** De vaste vragen van het spel, gecontroleerd en genormaliseerd. Alleen server-side. */
export function fixedQuestions() {
  return parseQuestions(VRAGEN.map((v) => ({ question: v.vraag, correctAnswer: v.antwoord })));
}

/**
 * Categorie bij een vraag. Alleen als de opgeslagen vraag nog overeenkomt met
 * het vragenbestand (na een wijziging van de vragen tonen oude spellen geen categorie).
 */
export function categoryFor(position: number, questionText: string): string | null {
  const v = VRAGEN[position];
  return v && v.vraag.replace(/\s+/g, ' ').trim() === questionText ? v.categorie : null;
}
