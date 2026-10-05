/**
 * DE VRAGEN VAN HET SPEL
 * ------------------------------------------------------------------
 * Pas hier de vragen en juiste antwoorden aan (minimaal 1, maximaal 5).
 * - categorie: klein kopje boven de vraag (zoals "DIEREN")
 * - vraag:     kort en simpel; spelers verzinnen een kort antwoord
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
    categorie: 'Anno 1965',
    vraag: 'Wat deed een Amsterdamse student in 1965 bij zichzelf om voorgoed high te blijven?',
    antwoord: 'Een gat in zijn hoofd boren',
  },
  {
    categorie: 'Anno 1966',
    vraag: 'Wat gooide iemand naar de Gouden Koets bij de bruiloft van Beatrix en Claus?',
    antwoord: 'Een levende kip',
  },
  {
    categorie: 'Anno 1980',
    vraag: 'Waarmee werden de krakers uit de Vondelstraat gehaald?',
    antwoord: 'Tanks',
  },
  {
    categorie: 'Vroeger',
    vraag: 'Wat hing Amsterdam bij de ingang van de stad om bezoekers bang te maken?',
    antwoord: 'Lijken van misdadigers',
  },
  {
    categorie: 'Stadsdieren',
    vraag: 'Welk beestje leeft gewoon door zonder kop?',
    antwoord: 'Een kakkerlak',
  },
];
