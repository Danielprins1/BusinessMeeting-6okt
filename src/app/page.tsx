'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Screen, Stack } from '@/components/ui';
import { APP_NAME } from '@/lib/constants';
import { api, ClientError } from '@/lib/client/api';
import { loadSession, saveSession, type StoredSession } from '@/lib/client/session';

export default function StartPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<StoredSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setSaved(loadSession()), []);

  /** Maakt direct een room aan met de vaste vragen; wie klikt wordt host. */
  async function startGame() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.createGame();
      saveSession({ role: 'host', roomCode: res.roomCode, token: res.hostToken });
      router.push(`/host/${res.roomCode}`);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : 'Er ging iets mis. Probeer het opnieuw.');
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Stack gap="lg">
        <Stack gap="sm">
          <h1 className="ui-title ui-center">{APP_NAME}</h1>
          <p className="ui-muted ui-center">
            Verzin een geloofwaardig nepantwoord, laat de anderen erin trappen en raad zelf welk antwoord echt is.
          </p>
        </Stack>

        <Stack>
          <Button block onClick={startGame} loading={busy}>
            Spel starten
          </Button>
          <Link href="/meedoen" className="ui-button ui-button--secondary ui-button--block">
            Meedoen
          </Link>
          {error && (
            <Alert kind="error">
              {error}{' '}
              <Link href="/status">Controleer de instellingen</Link>
            </Alert>
          )}
        </Stack>

        {saved && (
          <Card muted>
            <Stack gap="sm">
              <p className="ui-small">
                Je zat nog in een spel ({saved.role === 'host' ? 'als host' : `als ${saved.name ?? 'speler'}`}, room{' '}
                <strong>{saved.roomCode}</strong>).
              </p>
              <Link
                href={saved.role === 'host' ? `/host/${saved.roomCode}` : `/spel/${saved.roomCode}`}
                className="ui-button ui-button--ghost ui-button--block"
              >
                Terug naar het spel
              </Link>
            </Stack>
          </Card>
        )}
      </Stack>
    </Screen>
  );
}
