import Link from 'next/link';
import { Card, Screen, Stack } from '@/components/ui';
import { diagnose } from '@/lib/server/diagnose';

export const dynamic = 'force-dynamic';

/** Controlepagina: laat zien of de koppeling met Supabase goed is ingesteld. */
export default async function StatusPage() {
  const results = await diagnose();
  const allOk = results.every((r) => r.ok);

  return (
    <Screen>
      <Stack gap="lg">
        <h1 className="ui-bar">Status</h1>
        <p className={allOk ? 'ui-alert ui-alert--success' : 'ui-alert ui-alert--error'}>
          {allOk ? 'Alles is goed ingesteld. Je kunt een spel starten.' : 'Er klopt iets niet. Zie de rode punten hieronder.'}
        </p>
        <ul className="ui-list">
          {results.map((r) => (
            <li key={r.label} className="ui-list__item">
              <span className="ui-check" style={{ color: r.ok ? 'var(--color-success)' : 'var(--color-error)' }}>
                {r.ok ? '✓' : '✕'}
              </span>
              <span className="ui-list__grow">
                <strong>{r.label}</strong>
                <br />
                <span className="ui-small">{r.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <Card muted>
          <p className="ui-small">
            Wijzig je iets bij de omgevingsvariabelen in Render, wacht dan tot de nieuwe versie live is en ververs deze
            pagina.
          </p>
        </Card>
        <Link href="/" className="ui-button ui-button--ghost ui-button--block">
          Terug naar start
        </Link>
      </Stack>
    </Screen>
  );
}
