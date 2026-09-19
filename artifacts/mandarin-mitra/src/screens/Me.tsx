/* Mandarin Mitra — ME-01 Me and settings, and PW-01 the paywall.
   Settings are grouped the way the handoff groups them, and every control here
   changes something the learner can see immediately. */

import { useState } from 'react';
import { Btn, Chip, Kicker, Screen, TopBar } from '../design/ui';
import { Icon } from '../design/Icon';
import { MM_DV, MM_PY, MM_ZH } from '../design/slots';
import { useStore } from '../state/store';
import { FREE_VOICE_CAP, GOAL_LABEL } from '../state/model';
import type { Goal, ReminderSlot, Settings } from '../state/model';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div className="mm-kicker" style={{ color: 'var(--mm-accent)', marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 56,
        padding: '10px 0',
        borderBottom: '1px solid var(--mm-line)',
      }}
    >
      <span style={{ flex: 1, fontSize: 14 }}>
        {label}
        {hint && <span style={{ display: 'block', fontSize: 11.5, color: 'var(--mm-muted)' }}>{hint}</span>}
      </span>
      <span style={{ flex: 'none' }}>{children}</span>
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  labels,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  labels?: Record<string, string>;
}) {
  return (
    <span style={{ display: 'inline-flex', border: '1px solid var(--mm-line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {options.map((o, i) => (
        <button
          key={String(o)}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          style={{
            minHeight: 40,
            padding: '0 11px',
            border: 0,
            borderLeft: i > 0 ? '1px solid var(--mm-line)' : undefined,
            background: value === o ? 'color-mix(in srgb, var(--mm-accent) 13%, transparent)' : 'transparent',
            color: value === o ? 'var(--mm-accent)' : 'var(--mm-muted)',
            cursor: 'pointer',
            fontSize: 12.5,
            fontFamily: 'var(--font-body)',
          }}
        >
          {labels?.[String(o)] ?? String(o)}
        </button>
      ))}
    </span>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        border: `1px solid ${on ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
        background: on ? 'color-mix(in srgb, var(--mm-accent) 18%, transparent)' : 'transparent',
        cursor: 'pointer',
        padding: 2,
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: on ? 'var(--mm-accent)' : 'var(--mm-muted)',
          transition: 'background .15s',
        }}
      />
    </button>
  );
}

export function Me({
  onRetakePlacement,
  onPaywall,
  onPrimer,
}: {
  onRetakePlacement: () => void;
  onPaywall: () => void;
  onPrimer: () => void;
}) {
  const { state, dispatch, voiceLeft } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const s = state.settings;
  const set = (patch: Partial<Settings>) => dispatch({ type: 'setSettings', patch });

  return (
    <Screen>
      <div style={{ paddingTop: 22 }}>
        <Kicker>Me</Kicker>
        <h2 style={{ fontSize: 26, fontWeight: 400, margin: '8px 0 4px' }}>{state.name || 'Your account'}</h2>
        <div className="mm-num" style={{ fontSize: 12.5, color: 'var(--mm-muted)' }}>
          HSK {state.hsk} · {GOAL_LABEL[s.goal]} · {s.plus ? 'Plus' : 'Free'}
        </div>
      </div>

      {!s.plus && (
        <div style={{ marginTop: 16 }}>
          <Chip icon="mic" onClick={onPaywall} accent>
            {voiceLeft === Infinity ? 'Unlimited speaking' : `${voiceLeft} of ${FREE_VOICE_CAP} voice answers left today`}
          </Chip>
        </div>
      )}

      <Group title="Learning">
        <Row label="Goal">
          <Segmented
            value={s.goal}
            options={['hsk', 'work', 'travel', 'curious'] as Goal[]}
            onChange={(g) => set({ goal: g })}
            labels={{ hsk: 'HSK', work: 'Work', travel: 'Travel', curious: 'Curious' }}
          />
        </Row>
        <Row label="Level" hint={`Currently HSK ${state.hsk}`}>
          <Btn variant="secondary" style={{ width: 'auto', minHeight: 40, fontSize: 13 }} onClick={onRetakePlacement}>
            Re-take
          </Btn>
        </Row>
        <Row label="Daily review cap" hint="Reviews are spread, never stacked">
          <Segmented value={s.reviewCap} options={[20, 40, 80]} onChange={(v) => set({ reviewCap: v })} />
        </Row>
        <Row label="Session length">
          <Segmented
            value={s.sessionLength}
            options={[3, 5, 10] as const}
            onChange={(v) => set({ sessionLength: v })}
            labels={{ 3: '3 min', 5: '5 min', 10: '10 min' }}
          />
        </Row>
      </Group>

      <Group title="Helper language">
        <Row label="Hindi bridge" hint="Alignment lines, transfer notes, primer">
          <Toggle on={s.hindi !== 'off'} label="Hindi bridge" onChange={(v) => set({ hindi: v ? 'deva' : 'off' })} />
        </Row>
        {s.hindi !== 'off' && (
          <>
            <Row label="Script">
              <Segmented
                value={s.hindi}
                options={['deva', 'roman'] as const}
                onChange={(v) => set({ hindi: v })}
                labels={{ deva: 'कल', roman: 'kal' }}
              />
            </Row>
            <Row label="Show alignment line by default">
              <Toggle on={s.alignment} label="Alignment line" onChange={(v) => set({ alignment: v })} />
            </Row>
            <Row label="Pinyin primer" hint="Initials and finals with Devanagari cues">
              <Btn variant="secondary" style={{ width: 'auto', minHeight: 40, fontSize: 13 }} onClick={onPrimer}>
                Open
              </Btn>
            </Row>
          </>
        )}
      </Group>

      <Group title="Display">
        <Row label="Pinyin">
          <Segmented
            value={s.pinyin}
            options={['always', 'fade', 'off'] as const}
            onChange={(v) => set({ pinyin: v })}
            labels={{ always: 'Always', fade: 'Fade', off: 'Off' }}
          />
        </Row>
        <Row label="Chinese text size">
          <Segmented
            value={s.zhScale}
            options={[1, 1.15, 1.3] as const}
            onChange={(v) => set({ zhScale: v })}
            labels={{ 1: 'A', 1.15: 'A+', 1.3: 'A++' }}
          />
        </Row>
        <Row label="Theme">
          <Segmented
            value={s.theme}
            options={['light', 'dark', 'system'] as const}
            onChange={(v) => set({ theme: v })}
            labels={{ light: 'Light', dark: 'Dark', system: 'Auto' }}
          />
        </Row>
        <Row label="Slot colours" hint="Mono uses line style and icons only">
          <Segmented
            value={s.monoSlots ? 'mono' : 'colour'}
            options={['colour', 'mono'] as const}
            onChange={(v) => set({ monoSlots: v === 'mono' })}
            labels={{ colour: 'Colour', mono: 'Mono' }}
          />
        </Row>
      </Group>

      <Group title="Reminders">
        <Row label="Time slots" hint={s.reminders.length === 0 ? 'None' : s.reminders.join(', ')}>
          <span style={{ display: 'flex', gap: 5 }}>
            {(['morning', 'lunch', 'evening'] as ReminderSlot[]).map((r) => (
              <button
                key={r}
                onClick={() =>
                  set({
                    reminders: s.reminders.includes(r)
                      ? s.reminders.filter((x) => x !== r)
                      : [...s.reminders, r].slice(-3),
                  })
                }
                aria-pressed={s.reminders.includes(r)}
                style={{
                  minHeight: 40,
                  minWidth: 40,
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${s.reminders.includes(r) ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
                  background: 'transparent',
                  color: s.reminders.includes(r) ? 'var(--mm-accent)' : 'var(--mm-muted)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {r[0]?.toUpperCase()}
              </button>
            ))}
          </span>
        </Row>
        <Row label="Answer in the notification" hint="Keep your streak without opening the app">
          <Toggle
            on={s.answerInNotification}
            label="Answer in notification"
            onChange={(v) => set({ answerInNotification: v })}
          />
        </Row>
      </Group>

      <Group title="Audio">
        <Row label="Speech speed">
          <Segmented
            value={s.ttsRate}
            options={[0.8, 1] as const}
            onChange={(v) => set({ ttsRate: v })}
            labels={{ 0.8: '0.8×', 1: '1×' }}
          />
        </Row>
        <Row label="Voice variety" hint="Rotate voices so the ear does not settle">
          <Toggle on={s.voiceVariety} label="Voice variety" onChange={(v) => set({ voiceVariety: v })} />
        </Row>
        <Row label="Microphone" hint={s.micAllowed ? 'On' : 'Off — speaking drills fall back to typing'}>
          <Toggle on={s.micAllowed} label="Microphone" onChange={(v) => set({ micAllowed: v })} />
        </Row>
      </Group>

      <Group title="Account">
        <Row label="Plan" hint={s.plus ? 'Plus — unlimited speaking' : 'Free — 5 voice answers a day'}>
          <Btn variant="secondary" style={{ width: 'auto', minHeight: 40, fontSize: 13 }} onClick={onPaywall}>
            {s.plus ? 'Manage' : 'See Plus'}
          </Btn>
        </Row>
        <Row label="Export data" hint="Your words, patterns and progress as JSON">
          <Btn
            variant="secondary"
            style={{ width: 'auto', minHeight: 40, fontSize: 13 }}
            onClick={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'mandarin-mitra-export.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export
          </Btn>
        </Row>
        <Row label="Delete everything" hint="Progress, recordings and settings on this device">
          {confirmReset ? (
            <span style={{ display: 'flex', gap: 6 }}>
              <Btn
                variant="secondary"
                style={{ width: 'auto', minHeight: 40, fontSize: 13 }}
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </Btn>
              <Btn
                style={{ width: 'auto', minHeight: 40, fontSize: 13 }}
                onClick={() => {
                  dispatch({ type: 'reset' });
                  setConfirmReset(false);
                }}
              >
                Delete
              </Btn>
            </span>
          ) : (
            <Btn
              variant="secondary"
              style={{ width: 'auto', minHeight: 40, fontSize: 13 }}
              onClick={() => setConfirmReset(true)}
            >
              Delete
            </Btn>
          )}
        </Row>
      </Group>

      {/* A live sample, so a change to script or size is visible without leaving. */}
      <div
        style={{
          marginTop: 24,
          border: '1px solid var(--mm-line)',
          borderRadius: 'var(--radius-md)',
          padding: '13px 14px',
        }}
      >
        <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 8 }}>
          Sample
        </div>
        <div style={{ fontFamily: MM_ZH, fontSize: 24 * s.zhScale, lineHeight: 1.4 }}>我明天去台北</div>
        {s.pinyin !== 'off' && (
          <div style={{ fontFamily: MM_PY, fontSize: 12.5, color: 'var(--mm-muted)', marginTop: 3 }}>
            Wǒ míngtiān qù Táiběi.
          </div>
        )}
        {s.hindi !== 'off' && (
          <div
            style={{
              fontFamily: s.hindi === 'deva' ? MM_DV : MM_PY,
              fontSize: 13,
              lineHeight: 1.9,
              color: 'var(--mm-muted)',
              marginTop: 4,
            }}
          >
            {s.hindi === 'deva' ? 'मैं कल ताइपे जाऊँगा' : 'main kal Taipei jaaunga'}
          </div>
        )}
      </div>

      <div style={{ height: 28 }} />
    </Screen>
  );
}

/* ── PW-01 Paywall ──────────────────────────────────────────────────────── */

const PRICE_MONTH = '₹299';
const PRICE_YEAR = '₹2,499';

export function Paywall({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [plan, setPlan] = useState<'month' | 'year'>('year');

  const rows: [string, string, string][] = [
    ['Speaking practice', `${FREE_VOICE_CAP} a day`, 'Unlimited'],
    ['Instant correction', 'Yes', 'Yes'],
    ['Hindi bridge', 'Yes', 'Yes'],
    ['Answer from notifications', 'Yes', 'Yes'],
    ['Pattern ladders', 'HSK 1–2', 'HSK 1–4'],
  ];

  return (
    <Screen>
      <TopBar onClose={onClose} title="Plus" />
      <div style={{ marginTop: 16 }}>
        <Kicker>Mandarin Mitra Plus</Kicker>
        <h2 style={{ fontSize: 27, fontWeight: 400, margin: '8px 0 8px', lineHeight: 1.25 }}>
          Unlimited speaking practice with instant correction
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--mm-muted)', lineHeight: 1.6 }}>
          You have used today's {FREE_VOICE_CAP} free voice answers. Speaking drills become typed drills until
          tomorrow.
        </p>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--mm-muted)', paddingBottom: 7, borderBottom: '1px solid var(--mm-line)' }}>
          <span style={{ flex: 1 }} />
          <span style={{ width: 74, textAlign: 'center' }}>Free</span>
          <span style={{ width: 74, textAlign: 'center', color: 'var(--mm-accent)' }}>Plus</span>
        </div>
        {rows.map(([label, free, plus]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              minHeight: 46,
              fontSize: 13,
              borderBottom: '1px solid var(--mm-line)',
            }}
          >
            <span style={{ flex: 1 }}>{label}</span>
            <span style={{ width: 74, textAlign: 'center', color: 'var(--mm-muted)' }}>{free}</span>
            <span style={{ width: 74, textAlign: 'center', color: 'var(--mm-accent)' }}>{plus}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 9 }}>
        {(['month', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            style={{
              flex: 1,
              minHeight: 78,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${plan === p ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
              background: plan === p ? 'color-mix(in srgb, var(--mm-accent) 9%, transparent)' : 'transparent',
              color: 'var(--mm-ink)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--mm-muted)' }}>{p === 'month' ? 'Monthly' : 'Yearly'}</span>
            <span className="mm-num" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19 }}>
              {p === 'month' ? PRICE_MONTH : PRICE_YEAR}
            </span>
            {p === 'year' && <span style={{ fontSize: 10.5, color: 'var(--mm-accent)' }}>Save 30%</span>}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', fontSize: 11.5, color: 'var(--mm-muted)' }}>
        <Icon name="check" size={13} />
        UPI or card. Cancel any time.
      </div>

      <div style={{ marginTop: 'auto', padding: '18px 0 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Btn
          onClick={() => {
            // No payment provider is wired up in this first version; this flips the
            // entitlement locally so the rest of the app can be exercised.
            dispatch({ type: 'setSettings', patch: { plus: true } });
            onClose();
          }}
        >
          {state.settings.plus ? 'You have Plus' : `Get Plus · ${plan === 'month' ? PRICE_MONTH : PRICE_YEAR}`}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>
          Continue free
        </Btn>
      </div>
    </Screen>
  );
}
