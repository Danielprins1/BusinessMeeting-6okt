/**
 * DE VRAGEN VAN HET SPEL
 * ------------------------------------------------------------------
 * Pas hier de vragen en juiste antwoorden aan (minimaal 1, maximaal 5).
 * - categorie: klein kopje boven de vraag (zoals "DIEREN")
 * - vraag:     gebruik _____ voor het gat dat spelers invullen
 * - antwoord:  het echte antwoord; houd het kort, zodat het niet opvalt
 *              tussen de verzonnen antwoorden (max. 80 tekens)
 *
 * Na een push naar GitHub zet Render de nieuwe versie automatisch online;
 * een nieuw spel gebruikt dan meteen de nieuwe vragen.
 *
 * LET OP: importeer dit bestand alleen via src/lib/server/questions.ts,
 * nooit vanuit een pagina of component. Dan komen de juiste antwoorden
 * nooit in de browser terecht.
 */
export const VRAGEN: { categorie: string; vraag: string; antwoord: string }[] = [
  {
    categorie: 'Bewustzijnsverruiming',
    vraag: 'Om voorgoed een hoger bewustzijn te bereiken, besloot een Amsterdamse medicijnstudent in 1965 om _____.',
    antwoord: 'Met een tandartsboor een gat in zijn eigen schedel te boren',
  },
  {
    categorie: 'Koninklijk huwelijk',
    vraag: 'Tijdens het huwelijk van Beatrix en Claus gooide iemand _____ naar de Gouden Koets.',
    antwoord: 'Een levende kip',
  },
  {
    categorie: 'Krakersrellen',
    vraag: 'In 1980 werden de krakers uit de Amsterdamse Vondelstraat verdreven met _____.',
    antwoord: 'Tanks',
  },
  {
    categorie: 'Welkom in Amsterdam',
    vraag: 'Om bezoekers bang te maken, hing Amsterdam vroeger bij de ingang van de stad expres _____ op.',
    antwoord: 'De lijken van geëxecuteerde misdadigers',
  },
  {
    categorie: 'Dieren',
    vraag: 'Zonder hoofd kan _____ nog maandenlang doorleven.',
    antwoord: 'Een kakkerlak',
  },
];
