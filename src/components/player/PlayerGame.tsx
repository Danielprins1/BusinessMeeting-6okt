'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Alert, Avatar, Button, Card, Eyebrow, PlayerList, Stack, Standings, Waiting, points } from '@/components/ui';
import { FinalStandings, QuestionHeader, RevealView, RoundPoints, leaderTitle, quoted } from '@/components/game/shared';
import { GameFrame } from '@/components/game/Frame';
import { api, ClientError } from '@/lib/client/api';
import { clearSession, type StoredSession } from '@/lib/client/session';
import { useGame } from '@/lib/client/useGame';
import { MAX_ANSWER_LENGTH } from '@/lib/constants';
import type { GameView } from '@/lib/types';

export function PlayerGame({ code }: { code: string }) {
  const { session, state, offline, refresh } = useGame(code, 'player');

  const noSession = (
    <Card>
      <Stack>
        <h1 className="ui-subtitle">Je doet nog niet mee aan dit spel.</h1>
        <Link href={`/meedoen?code=${encodeURIComponent(code)}`} className="ui-button ui-button--primary ui-button--block">
          Meedoen
        </Link>
        <Link href="/" className="ui-button ui-button--ghost ui-button--block">
          Terug naar start
        </Link>
      </Stack>
    </Card>
  );

  return (
    <GameFrame state={state} offline={offline} noSession={noSession}>
      {state.kind === 'ready' && session && <PlayerPhase view={state.view} session={session} refresh={refresh} />}
    </GameFrame>
  );
}

function PlayerPhase({ view, session, refresh }: { view: GameView; session: StoredSession; refresh: () => Promise<void> }) {
  const router = useRouter();
  const meId = view.me?.id ?? null;

  switch (view.status) {
    case 'LOBBY':
      return (
        <Stack gap="lg">
          <h1 className="ui-bar">Je doet mee!</h1>
          <div className="ui-winner">
            {view.me && <Avatar name={view.me.name} size="lg" />}
            <p className="ui-winner__name">{view.me?.name}</p>
            <p className="ui-muted">Wachten tot de host het spel start...</p>
          </div>
          <Stack gap="sm">
            <Eyebrow>
              {view.players.length} / {view.maxPlayers} spelers · room {view.roomCode}
            </Eyebrow>
            <PlayerList players={view.players} />
          </Stack>
        </Stack>
      );

    case 'SUBMITTING_ANSWERS':
      return (
        <Stack gap="lg">
          {view.question && <QuestionHeader question={view.question} />}
          {view.myAnswer ? (
            <Stack>
              <Alert kind="success">Antwoord opgeslagen!</Alert>
              <Stack gap="sm">
                <p className="ui-pick-label">Jouw antwoord</p>
                <div className="ui-option ui-option--static ui-option--selected">{quoted(view.myAnswer)}</div>
              </Stack>
              <Waiting
                title="Wachten op de andere spelers..."
                text={progressText(view.answerProgress, 'antwoorden binnen')}
              />
            </Stack>
          ) : (
            <AnswerForm key={view.question?.number} session={session} refresh={refresh} />
          )}
        </Stack>
      );

    case 'VOTING':
      return (
        <Stack gap="lg">
          {view.question && <QuestionHeader question={view.question} />}
          <VoteForm key={view.question?.number} view={view} session={session} refresh={refresh} />
        </Stack>
      );

    case 'REVEAL': {
      const mine = view.reveal?.roundPoints.find((p) => p.id === meId);
      return (
        <Stack gap="lg">
          {view.question && <QuestionHeader question={view.question} />}
          {mine && (
            <Card muted>
              <p className="ui-subtitle ui-center">Jij verdient deze ronde +{points(mine.points)}</p>
            </Card>
          )}
          {view.reveal && <RevealView reveal={view.reveal} meId={meId} />}
          {view.reveal && <RoundPoints reveal={view.reveal} standings={view.standings ?? []} meId={meId} />}
        </Stack>
      );
    }

    case 'SCOREBOARD':
      return (
        <Stack gap="lg">
          <h1 className="ui-bar">Tussenstand</h1>
          <p className="ui-score-title">{leaderTitle(view.standings ?? [])}</p>
          <Standings standings={view.standings ?? []} meId={meId} deltas={view.lastRound} />
          <p className="ui-muted ui-center">Wachten op de host...</p>
        </Stack>
      );

    case 'FINISHED':
      return (
        <Stack gap="lg">
          <h1 className="ui-title ui-center">Eindstand</h1>
          <FinalStandings standings={view.standings ?? []} meId={meId} />
          <Card muted>
            <Stack gap="sm">
              <p className="ui-center">Bedankt voor het spelen!</p>
              <p className="ui-muted ui-small ui-center">
                Kiest de host voor opnieuw spelen, dan doe je automatisch weer mee.
              </p>
            </Stack>
          </Card>
          <Button
            variant="ghost"
            block
            onClick={() => {
              clearSession();
              router.push('/');
            }}
          >
            Terug naar start
          </Button>
        </Stack>
      );

    case 'CLOSED':
      return (
        <Card>
          <Stack>
            <h1 className="ui-subtitle">Het spel is afgelopen.</h1>
            <p className="ui-muted">Bedankt voor het spelen!</p>
            <Button
              block
              onClick={() => {
                clearSession();
                router.push('/');
              }}
            >
              Terug naar start
            </Button>
          </Stack>
        </Card>
      );
  }
}

function progressText(entries: GameView['answerProgress'], label: string) {
  if (!entries) return undefined;
  return `${entries.filter((e) => e.done).length} / ${entries.length} ${label}`;
}

function AnswerForm({ session, refresh }: { session: StoredSession; refresh: () => Promise<void> }) {
  const inputId = useId();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return setError('Vul een antwoord in.');
    setBusy(true);
    setError(null);
    try {
      await api.submitAnswer(session.roomCode, session.token, answer);
      await refresh();
    } catch (err) {
      const code = err instanceof ClientError ? err.code : null;
      if (code === 'ALREADY_SUBMITTED' || code === 'PHASE_CLOSED') {
        await refresh();
      }
      setError(err instanceof ClientError ? err.message : 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack>
        <p className="ui-pick-label">Verzin een geloofwaardig antwoord</p>
        <p className="ui-muted ui-small ui-center">Laat de anderen erin trappen!</p>
        <div className="ui-frame">
          <label htmlFor={inputId} className="sr-only">
            Jouw antwoord
          </label>
          <textarea
            id={inputId}
            className="ui-answer-input"
            value={answer}
            rows={2}
            placeholder="Typ je antwoord…"
            onChange={(e) => {
              setAnswer(e.target.value.replace(/\n/g, ' '));
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            maxLength={MAX_ANSWER_LENGTH}
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="send"
            aria-invalid={!!error || undefined}
          />
          <span className="ui-frame__count" aria-hidden="true">
            {MAX_ANSWER_LENGTH - answer.length}
          </span>
          <div className="ui-frame__submit">
            <Button type="submit" block loading={busy}>
              Antwoord insturen
            </Button>
          </div>
        </div>
        {error && <Alert kind="error">{error}</Alert>}
      </Stack>
    </form>
  );
}

function VoteForm({ view, session, refresh }: { view: GameView; session: StoredSession; refresh: () => Promise<void> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const voted = view.myVoteOptionId ?? null;

  async function submit() {
    if (!selected) return setError('Kies eerst een antwoord.');
    setBusy(true);
    setError(null);
    try {
      await api.vote(session.roomCode, session.token, selected);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  return (
    <Stack>
      <h2 className="ui-pick-label">Welk antwoord is echt?</h2>
      {voted && <Alert kind="success">Stem opgeslagen! Wachten op de rest...</Alert>}
      <div className="ui-stack ui-stack--sm" role="radiogroup" aria-label="Antwoorden">
        {view.options?.map((o) => {
          const isSelected = (voted ?? selected) === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!!voted || o.isOwn || busy}
              onClick={() => {
                setSelected(o.id);
                setError(null);
              }}
              className={`ui-option${o.isOwn ? ' ui-option--own' : ''}${isSelected ? ' ui-option--selected' : ''}`}
            >
              <span>{quoted(o.text)}</span>
              {o.isOwn && <span className="ui-option__note">Jouw antwoord</span>}
              {voted === o.id && <span className="ui-option__note">Jouw stem</span>}
            </button>
          );
        })}
      </div>
      {error && <Alert kind="error">{error}</Alert>}
      {!voted && (
        <Button block onClick={submit} disabled={!selected} loading={busy}>
          Stem insturen
        </Button>
      )}
      {!voted && <p className="ui-muted ui-small ui-center">Je stem is definitief en kan daarna niet meer worden gewijzigd.</p>}
      {voted && (
        <p className="ui-muted ui-small ui-center">{progressText(view.voteProgress, 'spelers hebben gestemd')}</p>
      )}
    </Stack>
  );
}
