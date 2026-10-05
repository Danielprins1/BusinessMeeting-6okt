/** Spelonderdelen die zowel de host als de spelers tonen. */
import { Avatar, Card, Eyebrow, Stack, Standings, points } from '@/components/ui';
import { POINTS_CORRECT_GUESS } from '@/lib/constants';
import type { QuestionInfo, RevealData, Standing } from '@/lib/types';

/** Donkerblauwe vraagband met categorie, vraag en "vraag x van y". */
export function QuestionHeader({ question, large }: { question: QuestionInfo; large?: boolean }) {
  return (
    <header className={`ui-qhead${large ? ' ui-qhead--large' : ''}`}>
      <p className="ui-qhead__cat">{question.category ?? `Vraag ${question.number}`}</p>
      <h1 className="ui-qhead__text">{question.text}</h1>
      <p className="ui-qhead__count">
        Vraag {question.number} van {question.total}
      </p>
    </header>
  );
}

/** Antwoordtekst tussen aanhalingstekens, zoals op de antwoordlinten. */
export function quoted(text: string) {
  return `“${text}”`;
}

/** Kop boven het klassement, bijv. "DANIEL STAAT BOVENAAN!". */
export function leaderTitle(standings: Standing[]) {
  const leaders = standings.filter((s) => s.rank === 1);
  if (leaders.length === 0 || leaders[0].score === 0) return 'Nog niemand heeft punten';
  if (leaders.length > 1) return 'Gedeelde koppositie!';
  return `${leaders[0].name} staat bovenaan!`;
}

function names(list: { name: string }[]) {
  return list.map((v) => v.name).join(', ');
}

export function RevealView({ reveal, meId }: { reveal: RevealData; meId?: string | null }) {
  return (
    <Stack>
      {reveal.options.map((o) =>
        o.isCorrect ? (
          <div key={o.id} className="ui-reveal ui-reveal--correct">
            <p className="ui-reveal__answer">{quoted(o.text)}</p>
            <p className="ui-reveal__badge">✓ Het echte antwoord</p>
            {o.voters.length > 0 ? (
              <>
                <p>
                  <strong>Goed geraden door:</strong> {names(o.voters)}
                </p>
                <p className="ui-reveal__points">+{points(POINTS_CORRECT_GUESS)} per speler</p>
              </>
            ) : (
              <p>Niemand had het goed.</p>
            )}
          </div>
        ) : (
          <div key={o.id} className="ui-reveal">
            <p className="ui-reveal__answer">{quoted(o.text)}</p>
            <p className="ui-muted">
              Bedacht door <strong>{o.author?.id === meId ? `${o.author?.name} (jij)` : o.author?.name}</strong>
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
              <p className="ui-muted">Niemand trapte erin.</p>
            )}
          </div>
        ),
      )}
    </Stack>
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
      <h2 className="ui-score-title">Punten deze ronde</h2>
      <Standings standings={standings} deltas={deltas} meId={meId} />
    </Stack>
  );
}

export function FinalStandings({ standings, meId }: { standings: Standing[]; meId?: string | null }) {
  const winners = standings.filter((s) => s.rank === 1);
  const runnersUp = standings.filter((s) => s.rank === 2 || s.rank === 3);
  return (
    <Stack gap="lg">
      <Card>
        <div className="ui-winner">
          <Eyebrow>{winners.length > 1 ? 'Winnaars' : 'Winnaar'}</Eyebrow>
          {winners.map((w) => (
            <div key={w.id} className="ui-winner">
              <Avatar name={w.name} size="lg" />
              <p className="ui-winner__name">{w.name}</p>
            </div>
          ))}
          {winners[0] && <p className="ui-subtitle">{points(winners[0].score).toUpperCase()}</p>}
        </div>
      </Card>
      {runnersUp.length > 0 && <Standings standings={runnersUp} meId={meId} />}
      {standings.length > winners.length + runnersUp.length && (
        <Stack gap="sm">
          <h2 className="ui-subtitle">Volledige uitslag</h2>
          <Standings standings={standings} meId={meId} />
        </Stack>
      )}
    </Stack>
  );
}
