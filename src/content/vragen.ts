/**
 * DE VRAGEN VAN HET SPEL
 * ------------------------------------------------------------------
 * Pas hier de vragen en juiste antwoorden aan (minimaal 1, maximaal 5).
 * Na een push naar GitHub zet Render de nieuwe versie automatisch online;
 * een nieuw spel gebruikt dan meteen de nieuwe vragen.
 *
 * LET OP: importeer dit bestand alleen via src/lib/server/questions.ts,
 * nooit vanuit een pagina of component. Dan komen de juiste antwoorden
 * nooit in de browser terecht.
 */
export const VRAGEN: { vraag: string; antwoord: string }[] = [
  { vraag: 'Placeholder vraag 1 – hier komt later de eerste vraag.', antwoord: 'Placeholder-antwoord 1' },
  { vraag: 'Placeholder vraag 2 – hier komt later de tweede vraag.', antwoord: 'Placeholder-antwoord 2' },
  { vraag: 'Placeholder vraag 3 – hier komt later de derde vraag.', antwoord: 'Placeholder-antwoord 3' },
  { vraag: 'Placeholder vraag 4 – hier komt later de vierde vraag.', antwoord: 'Placeholder-antwoord 4' },
  { vraag: 'Placeholder vraag 5 – hier komt later de vijfde vraag.', antwoord: 'Placeholder-antwoord 5' },
];
