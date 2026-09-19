/* Mandarin Mitra — PR-01 and PR-02.
   The Progress tab answers one question: what's broken, and is it getting better?
   Error trends come first, not vanity totals. */

import { useMemo, useState } from 'react';
import { Btn, Divider, EmptyState, Kicker, Screen, TopBar } from '../design/ui';
import { Icon } from '../design/Icon';
import { MM_ZH } from '../design/slots';
import { useStore } from '../state/store';
import { ERROR_HINDI_NOTE, ERROR_NAME } from '../engine/errors';
import type { ErrorCode } from '../engine/errors';
import { PATTERN_BY_ID, PATTERNS } from '../content/patterns';
import { LADDER_LABELS } from '../design/ui';
import type { AttemptLog } from '../state/model';
import type { Ui } from '../design/slots';

const WEEK = 7 * 86_400_000;

/** Counts per week, oldest first, for the sparklines. */
function weeklyCounts(attempts: readonly AttemptLog[], code: ErrorCode, weeks: number): number[] {
  const now = Date.now();
  return Array.from({ length: weeks }, (_, i) => {
    const from = now - (weeks - i) * WEEK;
    const to = from + WEEK;
    return attempts.filter((a) => {
      const t = new Date(a.at).getTime();
      return t >= from && t < to && a.codes.includes(code);
    }).length;
  });
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const w = 58;
  const h = 18;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ display: 'block', flex: 'none' }}>
      <polyline points={pts} fill="none" stroke="var(--mm-accent)" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function ProgressScreen({ ui, onPractise }: { ui: Ui; onPractise: (patternId: string) => void }) {
  const { state } = useStore();
  const [openCode, setOpenCode] = useState<ErrorCode | null>(null);
  const p = state.progress;

  const top = useMemo(() => {
    const counts = new Map<ErrorCode, number>();
    for (const a of p.attempts) {
      for (const c of a.codes) counts.set(c as ErrorCode, (counts.get(c as ErrorCode) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [p.attempts]);

  if (openCode) {
    return <ErrorDetail ui={ui} code={openCode} onClose={() => setOpenCode(null)} onPractise={onPractise} />;
  }

  // Trends appear after three sessions, so the numbers mean something.
  if (p.sessions.length < 3) {
    return (
      <Screen>
        <TopBar title="Progress" />
        <div style={{ marginTop: 20 }}>
          <Kicker>Progress</Kicker>
          <h2 style={{ fontSize: 26, fontWeight: 400, margin: '8px 0 0' }}>Nothing to read yet</h2>
        </div>
        <EmptyState>
          Your trends appear after 3 sessions.
          <br />
          {p.sessions.length} done so far.
        </EmptyState>
        <WeekStrip days={p.activeDays} />
        <div style={{ height: 24 }} />
      </Screen>
    );
  }

  const headline = buildHeadline(p.attempts, top);
  const known = p.seenWords.length;
  const used = p.producedWords.length;

  return (
    <Screen>
      <TopBar title="Progress" />

      <div style={{ marginTop: 18 }}>
        <Kicker>Where you are</Kicker>
        <h2 style={{ fontSize: 24, fontWeight: 400, margin: '8px 0 0', lineHeight: 1.3 }}>{headline}</h2>
      </div>

      <Divider margin="20px 0 14px" />

      <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 6 }}>
        Top issues
      </div>
      {top.length === 0 ? (
        <p style={{ fontSize: 13.5, color: 'var(--mm-muted)' }}>Nothing recurring — keep going.</p>
      ) : (
        top.map(([code, n]) => {
          const series = weeklyCounts(p.attempts, code, 4);
          const first = series[0] ?? 0;
          const last = series[series.length - 1] ?? 0;
          const worse = last > first;
          return (
            <button
              key={code}
              onClick={() => setOpenCode(code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left',
                minHeight: 56,
                padding: '10px 0',
                background: 'none',
                border: 0,
                borderBottom: '1px solid var(--mm-line)',
                color: 'var(--mm-ink)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.4 }}>
                {ERROR_NAME[code]}
                <span className="mm-num" style={{ display: 'block', fontSize: 11, color: 'var(--mm-muted)' }}>
                  {n} {n === 1 ? 'time' : 'times'}
                </span>
              </span>
              <Sparkline values={series} />
              {/* Up is bad for errors, so the arrow is labelled. */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 10.5,
                  color: worse ? 'var(--fb-minor)' : 'var(--fb-correct)',
                  flex: 'none',
                }}
              >
                <Icon name={worse ? 'up' : 'down'} size={12} />
                {worse ? 'more' : 'fewer'}
              </span>
            </button>
          );
        })
      )}

      <Divider margin="22px 0 14px" />

      <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 10 }}>
        Pattern map
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
        {LADDER_LABELS.map((label, i) => {
          const ids = PATTERNS.filter((pt) => (p.ladders[pt.id]?.mastery ?? 0) === i).map((pt) => pt.id);
          return (
            <div
              key={label}
              style={{
                border: '1px solid var(--mm-line)',
                borderRadius: 'var(--radius-md)',
                padding: '9px 5px',
                textAlign: 'center',
              }}
            >
              <div className="mm-num" style={{ fontSize: 19, color: ids.length > 0 ? 'var(--mm-accent)' : 'var(--mm-muted)' }}>
                {ids.length}
              </div>
              <div style={{ fontSize: 9, color: 'var(--mm-muted)', marginTop: 2, lineHeight: 1.3 }}>{label}</div>
            </div>
          );
        })}
      </div>

      <Divider margin="22px 0 14px" />

      <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 10 }}>
        Know vs use
      </div>
      <Bar label="Recognise" value={known} max={Math.max(known, 1)} />
      <Bar label="Use in production" value={used} max={Math.max(known, 1)} />
      <p className="mm-num" style={{ fontSize: 12.5, color: 'var(--mm-muted)', marginTop: 8 }}>
        You recognise {known} words and use {used}.
      </p>

      <WeekStrip days={p.activeDays} />
      <div style={{ height: 24 }} />
    </Screen>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mm-muted)' }}>
        <span>{label}</span>
        <span className="mm-num">{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--mm-line)', borderRadius: 3, marginTop: 4 }}>
        <div
          style={{
            width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%`,
            height: '100%',
            background: 'var(--mm-accent)',
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}

/** Seven dots for active days. No streak pressure here. */
function WeekStrip({ days }: { days: readonly string[] }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) };
  });
  return (
    <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--mm-line)' }}>
      <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 10 }}>
        This week
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {last7.map((d) => {
          const on = days.includes(d.key);
          return (
            <div key={d.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: `1.5px solid ${on ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
                  background: on ? 'var(--mm-accent)' : 'transparent',
                }}
              />
              <span style={{ fontSize: 9.5, color: 'var(--mm-muted)' }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The headline is generated from data: the top issue and its four-week direction. */
function buildHeadline(attempts: readonly AttemptLog[], top: [ErrorCode, number][]): string {
  const first = top[0];
  if (!first) return 'No recurring issues yet. Keep the daily sentence going.';
  const series = weeklyCounts(attempts, first[0], 4);
  const early = (series[0] ?? 0) + (series[1] ?? 0);
  const late = (series[2] ?? 0) + (series[3] ?? 0);
  const name = ERROR_NAME[first[0]].toLowerCase();
  if (early === 0) return `Your top issue: ${name}.`;
  const change = Math.round(((early - late) / early) * 100);
  if (change > 5) return `Your top issue: ${name}. Down ${change}% in 3 weeks.`;
  if (change < -5) return `Your top issue: ${name}. Up ${Math.abs(change)}% in 3 weeks.`;
  return `Your top issue: ${name}. Holding steady.`;
}

/* ── PR-02 Error type detail ────────────────────────────────────────────── */

function ErrorDetail({
  ui,
  code,
  onClose,
  onPractise,
}: {
  ui: Ui;
  code: ErrorCode;
  onClose: () => void;
  onPractise: (patternId: string) => void;
}) {
  const { state } = useStore();
  const p = state.progress;
  const recent = p.attempts.filter((a) => a.codes.includes(code)).slice(-3).reverse();
  const series = weeklyCounts(p.attempts, code, 8);
  const hindi = ERROR_HINDI_NOTE[code];
  const pattern = PATTERNS.find((pt) => pt.targets.includes(code));
  const max = Math.max(1, ...series);

  return (
    <Screen>
      <TopBar onClose={onClose} closeIcon="chevronLeft" title="Error detail" />
      <div style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 25, fontWeight: 400, lineHeight: 1.25 }}>{ERROR_NAME[code]}</h2>
        {pattern && (
          <p style={{ fontSize: 13.5, color: 'var(--mm-muted)', marginTop: 8, lineHeight: 1.6 }}>{pattern.rule}</p>
        )}
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 10 }}>
          Last 8 weeks
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 70 }}>
          {series.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(2, (v / max) * 56)}px`,
                  background: v > 0 ? 'var(--mm-accent)' : 'var(--mm-line)',
                  borderRadius: 2,
                }}
              />
              <span className="mm-num" style={{ fontSize: 9, color: 'var(--mm-muted)' }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Divider margin="22px 0 14px" />

      <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 10 }}>
        Your recent examples
      </div>
      {recent.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--mm-muted)' }}>None recorded yet.</p>
      ) : (
        recent.map((a, i) => (
          <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--mm-line)' }}>
            <div style={{ fontFamily: MM_ZH, fontSize: 18, textDecoration: 'line-through', opacity: 0.55 }}>
              {a.answer || '—'}
            </div>
            <div style={{ fontFamily: MM_ZH, fontSize: 20, marginTop: 4 }}>{a.correction}</div>
            <div style={{ fontSize: 11, color: 'var(--mm-muted)', marginTop: 4 }}>
              {PATTERN_BY_ID[a.patternId]?.name ?? a.patternId} ·{' '}
              {new Date(a.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </div>
          </div>
        ))
      )}

      {ui.hindi !== 'off' && hindi && (
        <div
          style={{
            border: '1px solid var(--mm-line)',
            borderRadius: 'var(--radius-md)',
            padding: '11px 13px',
            fontSize: 12.5,
            lineHeight: 1.6,
            color: 'var(--mm-muted)',
          }}
        >
          {hindi}
        </div>
      )}

      {pattern && (
        <div style={{ marginTop: 'auto', padding: '20px 0' }}>
          <Btn onClick={() => onPractise(pattern.id)}>Practise this</Btn>
        </div>
      )}
    </Screen>
  );
}
