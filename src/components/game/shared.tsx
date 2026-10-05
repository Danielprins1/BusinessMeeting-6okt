/** Spelonderdelen die zowel de host als de spelers tonen. */
import type { CSSProperties } from 'react';
import { Avatar, Stack, Standings, Xxx, points } from '@/components/ui';
import { POINTS_CORRECT_GUESS } from '@/lib/constants';
import type { QuestionInfo, RevealData, Standing } from '@/lib/types';

/** Volgnummer voor de "één voor één"-animatie. */
export function order(i: number): CSSProperties {
  return { '--i': i } as CSSProperties;
}

/** Rode vraagband: kopje in handschrift, de vraag, en de drie Andreaskruisen. */
export function QuestionHeader({ question, large }: { question: QuestionInfo; large?: boolean }) {
  return (
    <header className={`ui-qhead${large ? ' ui-qhead--large' : ''}`}>
      <p className="ui-qhead__cat">{question.category ?? `Vraag ${question.number}`}</p>
      <h1 className="ui-qhead__text">{question.text}</h1>
      <p className="ui-qhead__count">
        Vraag {question.number} van {question.total}
      </p>
      <Xxx />
    </header>
  );
}

/** Antwoordtekst tussen aanhalingstekens, zoals op de antwoordkaarten. */
export function quoted(text: string) {
  return `“${text}”`;
}

/** Kop boven het klassement. */
export function leaderTitle(standings: Standing[]) {
  const leaders = standings.filter((s) => s.rank === 1);
  if (leaders.length === 0 || leaders[0].score === 0) return 'Nog niemand heeft punten, joh';
  if (leaders.length > 1) return 'Nek-aan-nek!';
  return `${leaders[0].name} heeft de meeste branie!`;
}

function names(list: { name: string }[]) {
  return list.map((v) => v.name).join(', ');
}

/** De onthulling: eerst het echte antwoord (met stempel), daarna de nepantwoorden één voor één. */
export function RevealView({ reveal, meId }: { reveal: RevealData; meId?: string | null }) {
  return (
    <div className="ui-stack ui-stagger">
      {reveal.options.map((o, i) =>
        o.isCorrect ? (
          <div key={o.id} className="ui-reveal ui-reveal--correct" style={order(i)}>
            <p className="ui-reveal__badge">✓ Echt gebeurd!</p>
            <p className="ui-reveal__answer">{o.text}</p>
            {o.voters.length > 0 ? (
              <>
                <p>
                  <strong>Goed gezien door:</strong> {names(o.voters)}
                </p>
                <p className="ui-reveal__points">+{points(POINTS_CORRECT_GUESS)} per speler</p>
              </>
            ) : (
              <p>Niemand had het goed. Wie had dat gedacht?</p>
            )}
          </div>
        ) : (
          <div key={o.id} className="ui-reveal" style={order(i)}>
            <p className="ui-reveal__answer">{quoted(o.text)}</p>
            <p className="ui-muted">
              Verzonnen door <strong>{o.author?.id === meId ? `${o.author?.name} (jij)` : o.author?.name}</strong>
            </p>
            {o.voters.length > 0 ? (
              <>
                <p>
                  <strong>
                    {o.voters.length} {o.voters.length === 1 ? 'speler trapte' : 'spelers trapten'} erin:
                  </strong>{' '}
                  {names(o.voters)}
                </p>
                <p className="ui-reveal__points">
                  {o.author?.name}: +{points(o.authorPoints)}
                </p>
              </>
            ) : (
              <p className="ui-muted">Niemand trapte erin. Jammer joh.</p>
            )}
          </div>
        ),
      )}
    </div>
  );
}

/** Klassement met de punten van deze ronde erbij ("+2"). */
export function RoundPoints({
  reveal,
  standings,
  meId,
}: {
  reveal: RevealData;
  standings: Standing[];
  meId?: string | null;
}) {
  const deltas = Object.fromEntries(reveal.roundPoints.map((p) => [p.id, p.points]));
  return (
    <Stack gap="sm">
      <h2 className="ui-pick-label">Punten deze ronde</h2>
      <Standings standings={standings} deltas={deltas} meId={meId} />
    </Stack>
  );
}

/** Eindstand: groot olijfgroen vlak met de winnaar, daaronder de rest. */
export function FinalStandings({ standings, meId }: { standings: Standing[]; meId?: string | null }) {
  const winners = standings.filter((s) => s.rank === 1);
  const others = standings.filter((s) => s.rank !== 1);
  return (
    <Stack gap="lg">
      <section className="ui-quote-screen">
        <p className="ui-quote-screen__line">
          Amsterdam verandert.
          <br />
          De <span className="ui-scribble">branie</span> blijft.
        </p>
        <p className="ui-script" style={{ fontSize: 'var(--text-xl)' }}>
          {winners.length > 1 ? 'en de winnaars zijn…' : 'en de winnaar is…'}
        </p>
        {winners.map((w) => (
          <div key={w.id} className="ui-winner">
            <Avatar name={w.name} size="lg" />
            <p className="ui-winner__name">{w.name}</p>
          </div>
        ))}
        {winners[0] && <p className="ui-subtitle">{points(winners[0].score).toUpperCase()}</p>}
      </section>
      {others.length > 0 && <Standings standings={others} meId={meId} />}
    </Stack>
  );
}
