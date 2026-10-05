import 'server-only';
import { db, publicKey, serviceKey, supabaseUrl } from './supabase';

export type CheckResult = { label: string; ok: boolean; detail: string };

/**
 * Haalt alles wat op een key lijkt uit een foutmelding, zodat deze (openbare)
 * pagina nooit een geheime key laat zien.
 */
function redact(message: string): string {
  return message
    .replace(/sb_(secret|publishable)_[^\s"']*(\s+[^\s"']+)*/g, '[key verborgen]')
    .replace(/eyJ[A-Za-z0-9_\-.]+/g, '[key verborgen]')
    .slice(0, 300);
}

/** Leest de rol uit een (legacy) Supabase-JWT, zonder iets te verifiëren of te tonen. */
function jwtRole(key: string): string | null {
  const part = key.split('.')[1];
  if (!part) return null;
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')).role ?? null;
  } catch {
    return null;
  }
}

function keyKind(key: string): 'secret' | 'public' | 'unknown' {
  if (key.startsWith('sb_secret_')) return 'secret';
  if (key.startsWith('sb_publishable_')) return 'public';
  const role = jwtRole(key);
  if (role === 'service_role') return 'secret';
  if (role === 'anon') return 'public';
  return 'unknown';
}

/**
 * Controleert de koppeling met Supabase, stap voor stap.
 * Toont nooit de waarden van keys, alleen of ze kloppen.
 */
export async function diagnose(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const url = supabaseUrl();
  const anon = publicKey();
  const rawSecret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const secret = serviceKey();

  // 1. Project-URL
  if (!url) {
    results.push({ label: 'Project URL', ok: false, detail: 'NEXT_PUBLIC_SUPABASE_URL is niet ingevuld in Render.' });
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/.test(url) && !url.startsWith('http://127.0.0.1')) {
    results.push({
      label: 'Project URL',
      ok: false,
      detail: `De URL ziet er niet uit als https://<project-id>.supabase.co (nu: ${url}).`,
    });
  } else {
    results.push({ label: 'Project URL', ok: true, detail: url });
  }

  // 2. Publieke key
  if (!anon) {
    results.push({ label: 'Anon / publishable key', ok: false, detail: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is niet ingevuld in Render.' });
  } else {
    const kind = keyKind(anon);
    results.push(
      kind === 'public'
        ? { label: 'Anon / publishable key', ok: true, detail: 'Ingevuld en van het juiste type.' }
        : kind === 'secret'
          ? {
              label: 'Anon / publishable key',
              ok: false,
              detail: 'Hier staat de GEHEIME key. Zet hier de anon / publishable key, en de geheime key alleen bij SUPABASE_SERVICE_ROLE_KEY.',
            }
          : { label: 'Anon / publishable key', ok: false, detail: 'Dit lijkt geen Supabase-key. Controleer of je de hele key hebt gekopieerd.' },
    );
  }

  // 3. Geheime key
  if (!secret) {
    results.push({ label: 'Service role / secret key', ok: false, detail: 'SUPABASE_SERVICE_ROLE_KEY is niet ingevuld in Render.' });
    return results;
  }
  const kind = keyKind(secret);
  if (kind !== 'secret') {
    results.push({
      label: 'Service role / secret key',
      ok: false,
      detail:
        kind === 'public'
          ? 'Hier staat de anon / publishable key. Gebruik de service_role (of secret) key.'
          : 'Dit lijkt geen Supabase-key. Controleer of je de hele key hebt gekopieerd.',
    });
    return results;
  }
  results.push({
    label: 'Service role / secret key',
    ok: true,
    detail: /\S\s+\S/.test(rawSecret.trim())
      ? 'Ingevuld en van het juiste type. Let op: er stond een spatie of regeleinde in de key; die wordt automatisch genegeerd.'
      : 'Ingevuld en van het juiste type.',
  });
  if (!url) return results;

  // 4. Verbinding + tabellen
  try {
    const { error } = await db().from('games').select('id').limit(1);
    if (!error) {
      results.push({ label: 'Database-tabellen', ok: true, detail: 'Verbinding gelukt, tabellen gevonden.' });
    } else if (error.code === '42P01' || error.code === 'PGRST205' || /does not exist|could not find the table/i.test(error.message)) {
      results.push({
        label: 'Database-tabellen',
        ok: false,
        detail: 'De tabellen bestaan niet. Voer het SQL-bestand uit in de SQL Editor van Supabase (zie README, stap 4).',
      });
      return results;
    } else if (error.code === '42501') {
      results.push({
        label: 'Database-tabellen',
        ok: false,
        detail: 'Geen toegang tot de tabellen (permission denied). Voer in de SQL Editor van Supabase het bestand supabase/herstel-rechten.sql uit.',
      });
      return results;
    } else if (/invalid api key|jwt|unauthorized|no api key/i.test(error.message) || error.code === 'PGRST301') {
      results.push({
        label: 'Database-tabellen',
        ok: false,
        detail: 'Supabase weigert de key. Hoort de key wel bij dit project? Kopieer URL en keys opnieuw uit hetzelfde project.',
      });
      return results;
    } else {
      results.push({ label: 'Database-tabellen', ok: false, detail: `Onverwachte fout: ${error.code ?? ''} ${redact(error.message)}` });
      return results;
    }
  } catch (err) {
    results.push({
      label: 'Database-tabellen',
      ok: false,
      detail: `Supabase is niet bereikbaar op deze URL (${redact((err as Error).message)}). Controleer de Project URL.`,
    });
    return results;
  }

  // 5. Spelfuncties
  const { error: fnError } = await db().rpc('close_game', { p_game_id: '00000000-0000-0000-0000-000000000000' });
  if (!fnError) {
    results.push({ label: 'Spelfuncties', ok: true, detail: 'Gevonden.' });
  } else {
    results.push({
      label: 'Spelfuncties',
      ok: false,
      detail:
        fnError.code === 'PGRST202' || /could not find the function/i.test(fnError.message)
          ? 'De spelfuncties ontbreken. Voer het hele SQL-bestand (opnieuw) uit in de SQL Editor.'
          : `Fout bij de spelfuncties: ${fnError.code ?? ''} ${redact(fnError.message)}`,
    });
  }

  // 6. Realtime
  try {
    const res = await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: secret,
        ...(secret.startsWith('sb_') ? {} : { Authorization: `Bearer ${secret}` }),
      },
      body: JSON.stringify({ messages: [{ topic: 'room:STATUS', event: 'refresh', payload: {} }] }),
      signal: AbortSignal.timeout(5000),
    });
    results.push(
      res.ok
        ? { label: 'Realtime', ok: true, detail: 'Werkt.' }
        : {
            label: 'Realtime',
            ok: false,
            detail: `Realtime gaf status ${res.status}. Het spel werkt wel, maar schermen verversen dan elke paar seconden in plaats van direct.`,
          },
    );
  } catch (err) {
    results.push({ label: 'Realtime', ok: false, detail: `Niet bereikbaar: ${redact((err as Error).message)}` });
  }

  return results;
}
