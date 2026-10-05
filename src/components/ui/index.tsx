/**
 * Herbruikbare, neutrale UI-componenten.
 * Ze bevatten geen spellogica; de opmaak komt volledig uit src/styles.
 */
import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import type { PlayerSummary, ProgressEntry, Standing } from '@/lib/types';

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/** Het rode BRANIE-sterretje (✱), getekend als penseelstreken. */
export function Star({ className }: { className?: string }) {
  return (
    <span className={cx('ui-star', className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="17" strokeLinecap="round">
        <path d="M50 10 L52 90" />
        <path d="M14 30 L86 68" />
        <path d="M84 28 L16 72" />
      </svg>
    </span>
  );
}

/** De drie Andreaskruisen uit het Amsterdamse wapen. */
export function Xxx() {
  return (
    <div className="ui-xxx" aria-hidden="true">
      <span>X</span>
      <span>X</span>
      <span>X</span>
    </div>
  );
}

export function Screen({ wide, children }: { wide?: boolean; children: ReactNode }) {
  return <main className={cx('ui-screen', wide && 'ui-screen--wide')}>{children}</main>;
}

export function Stack({ gap, className, children }: { gap?: 'sm' | 'lg'; className?: string; children: ReactNode }) {
  return <div className={cx('ui-stack', gap && `ui-stack--${gap}`, className)}>{children}</div>;
}

export function Row({ align, children }: { align?: 'between' | 'center'; children: ReactNode }) {
  return <div className={cx('ui-row', align && `ui-row--${align}`)}>{children}</div>;
}

export function Card({ muted, className, children }: { muted?: boolean; className?: string; children: ReactNode }) {
  return <section className={cx('ui-card', muted && 'ui-card--muted', className)}>{children}</section>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';
  size?: 'normal' | 'small';
  block?: boolean;
  loading?: boolean;
};

export function Button({ variant = 'primary', size = 'normal', block, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx('ui-button', `ui-button--${variant}`, size === 'small' && 'ui-button--small', block && 'ui-button--block', className)}
    >
      {loading ? 'Even geduld…' : children}
    </button>
  );
}

type FieldProps = { label: string; hint?: ReactNode; error?: string | null };

export function TextField({ label, hint, error, className, ...input }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>{label}</label>
      <input id={id} className={cx('ui-input', className)} aria-invalid={!!error || undefined} {...input} />
      {hint && <span className="ui-hint">{hint}</span>}
      {error && <Alert kind="error">{error}</Alert>}
    </div>
  );
}

export function TextArea({ label, hint, error, ...input }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>{label}</label>
      <textarea id={id} className="ui-textarea" aria-invalid={!!error || undefined} {...input} />
      {hint && <span className="ui-hint">{hint}</span>}
      {error && <Alert kind="error">{error}</Alert>}
    </div>
  );
}

export function Alert({ kind = 'info', children }: { kind?: 'info' | 'error' | 'success'; children: ReactNode }) {
  return (
    <div className={cx('ui-alert', `ui-alert--${kind}`)} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ui-eyebrow">{children}</p>;
}

export function Spinner() {
  return <div className="ui-spinner" aria-hidden="true" />;
}

export function Waiting({ title, text }: { title: string; text?: string }) {
  return (
    <Card>
      <Stack>
        <p className="ui-subtitle ui-center">{title}</p>
        {text && <p className="ui-muted ui-center">{text}</p>}
        <Spinner />
      </Stack>
    </Card>
  );
}

export function RoomCode({ code }: { code: string }) {
  return (
    <div className="ui-roomcode">
      <Eyebrow>Roomcode</Eyebrow>
      <div className="ui-roomcode__code" aria-label={`Roomcode ${code.split('').join(' ')}`}>{code}</div>
    </div>
  );
}

export function Counter({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="ui-center">
      <Eyebrow>{label}</Eyebrow>
      <p className="ui-big-number">
        {value} / {total}
      </p>
    </div>
  );
}

/** Rondje met de eerste letter van de naam; de kleur hangt vast aan de naam. */
export function Avatar({ name, size }: { name: string; size?: 'sm' | 'lg' }) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return (
    <span className={cx('ui-avatar', `ui-avatar--${(hash % 6) + 1}`, size && `ui-avatar--${size}`)} aria-hidden="true">
      {Array.from(name.trim())[0] ?? '?'}
    </span>
  );
}

export function PlayerList({
  players,
  columns,
  onRemove,
}: {
  players: PlayerSummary[];
  columns?: boolean;
  onRemove?: (player: PlayerSummary) => void;
}) {
  if (players.length === 0) return <p className="ui-muted">Nog niemand…</p>;
  return (
    <ul className={cx('ui-list', columns && 'ui-list--columns')}>
      {players.map((p) => (
        <li key={p.id} className="ui-list__item">
          <Avatar name={p.name} size="sm" />
          <span className="ui-list__grow">{p.name}</span>
          <span className={cx('ui-dot', p.connected && 'ui-dot--online')} title={p.connected ? 'Verbonden' : 'Geen verbinding'} />
          {onRemove && (
            <Button variant="ghost" size="small" onClick={() => onRemove(p)} aria-label={`${p.name} verwijderen`}>
              ✕
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ProgressList({ entries }: { entries: ProgressEntry[] }) {
  return (
    <ul className="ui-list ui-list--columns">
      {entries.map((e) => (
        <li key={e.id} className={cx('ui-list__item', e.done ? 'ui-list__item--done' : 'ui-list__item--todo')}>
          <span className="ui-check" aria-hidden="true">{e.done ? '✓' : '○'}</span>
          <span>{e.name}</span>
          <span className="sr-only">{e.done ? '(klaar)' : '(nog bezig)'}</span>
        </li>
      ))}
    </ul>
  );
}

export function points(n: number) {
  return `${n} ${n === 1 ? 'punt' : 'punten'}`;
}

/**
 * Klassement: avatar, naam, (optioneel) punten van de laatste ronde en het totaal.
 */
export function Standings({
  standings,
  meId,
  deltas,
}: {
  standings: Standing[];
  meId?: string | null;
  deltas?: Record<string, number>;
}) {
  return (
    <ol className="ui-standings ui-stagger">
      {standings.map((s, i) => {
        const delta = deltas?.[s.id] ?? 0;
        return (
          <li
            key={s.id}
            className={cx('ui-standings__item', s.id === meId && 'ui-standings__item--me')}
            style={{ '--i': i } as CSSProperties}
          >
            <Avatar name={s.name} />
            <span className="ui-standings__name">
              <span className="sr-only">{s.rank}e plaats: </span>
              {s.name}
              {s.id === meId && ' (jij)'}
            </span>
            <span className="ui-standings__delta" style={{ '--i': i } as CSSProperties}>
              {delta > 0 ? `+${delta}` : ''}
            </span>
            <span className="ui-standings__score" aria-label={points(s.score)}>
              {s.score}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
