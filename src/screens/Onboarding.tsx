/* Mandarin Mitra — onboarding and placement, ON-01 to ON-10.
   The learner should reach their first spoken Chinese sentence in under five
   minutes. Placement is part of that first experience, not a gate before it: it
   can be skipped from ON-07 and abandoned at any point. */

import { useMemo, useState } from 'react';
import { Btn, Chip, Divider, Kicker, Screen, TopBar } from '../design/ui';
import { Icon } from '../design/Icon';
import { SentenceLine, SkeletonStrip } from '../design/Sentence';
import { MM_DV, MM_PY, MM_ZH } from '../design/slots';
import type { Ui } from '../design/slots';
import { useStore } from '../state/store';
import { GOAL_ICON, GOAL_LABEL } from '../state/model';
import type { Goal, ReminderSlot, Settings } from '../state/model';
import { initialPlacement, nextItem, record, score } from '../engine/placement';
import {
  OTP_LENGTH,
  checkPhone,
  cleanName,
  cleanOtpInput,
  displayPhone,
  isValidOtp,
  phoneProblemMessage,
} from '../engine/auth';
import type { PlacementState } from '../engine/placement';
import type { HskLevel, PlacementItem } from '../content/types';
import { PATTERNS } from '../content/patterns';
import { normalise } from '../engine/grader';
import { createTts, micPermission } from '../engine/speech';
import { MicButton } from './MicButton';

type Step =
  | 'welcome'
  | 'signin'
  | 'otp'
  | 'goal'
  | 'helper'
  | 'script'
  | 'mic'
  | 'placementIntro'
  | 'placement'
  | 'pickLevel'
  | 'result'
  | 'reminders';

const DEMO = [
  { slot: 'subject' as const, zh: '我', py: 'wǒ', roman: 'main', deva: 'मैं' },
  { slot: 'time' as const, zh: '明天', py: 'míngtiān', roman: 'kal', deva: 'कल' },
  { slot: 'place' as const, zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' },
  { slot: 'verb' as const, zh: '吃', py: 'chī', roman: 'khaana', deva: 'खाना' },
  { slot: 'object' as const, zh: '饭', py: 'fàn', roman: 'khaaunga', deva: 'खाऊँगा' },
];

const Title = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 29, fontWeight: 400, lineHeight: 1.18, margin: '10px 0 10px' }}>
    {children}
  </h2>
);

const Sub = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--mm-muted)' }}>{children}</p>
);

function Choice({
  label,
  hint,
  icon,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        minHeight: 56,
        textAlign: 'left',
        padding: '12px 14px',
        marginBottom: 9,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${selected ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
        background: selected ? 'color-mix(in srgb, var(--mm-accent) 9%, transparent)' : 'transparent',
        color: 'var(--mm-ink)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 15,
      }}
    >
      {icon && (
        <span style={{ color: selected ? 'var(--mm-accent)' : 'var(--mm-muted)' }}>
          <Icon name={icon} size={18} />
        </span>
      )}
      <span style={{ flex: 1 }}>
        {label}
        {hint && <span style={{ display: 'block', fontSize: 12, color: 'var(--mm-muted)' }}>{hint}</span>}
      </span>
      {selected && (
        <span style={{ color: 'var(--mm-accent)' }}>
          <Icon name="check" size={17} />
        </span>
      )}
    </button>
  );
}

export function Onboarding({ ui }: { ui: Ui }) {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState<Step>(state.signedIn ? 'goal' : 'welcome');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [resent, setResent] = useState(false);
  const tts = useMemo(() => createTts(), []);

  const s = state.settings;
  const set = (patch: Partial<Settings>) => dispatch({ type: 'setSettings', patch });

  const go = (next: Step) => setStep(next);

  if (step === 'welcome') {
    return (
      <Screen>
        <div style={{ marginTop: 56 }}>
          <Kicker>Mandarin Mitra</Kicker>
          <Title>Speak Chinese in the right order, three minutes a day.</Title>
          <Sub>With Hindi as your helper.</Sub>
        </div>

        <div style={{ marginTop: 34 }}>
          <SkeletonStrip slots={['subject', 'time', 'place', 'verb', 'object']} ui={ui} compact />
          <div style={{ marginTop: 16 }}>
            <SentenceLine chunks={DEMO} ui={ui} size={25} gap={8} justify="flex-start" />
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px 0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn onClick={() => go('signin')}>Get started</Btn>
          <Btn variant="ghost" onClick={() => go('signin')}>
            I have an account
          </Btn>
        </div>
      </Screen>
    );
  }

  if (step === 'signin') {
    const problem = checkPhone(phone);
    const phoneMessage = phoneTouched ? phoneProblemMessage(problem) : null;
    const phoneReady = problem === null;

    return (
      <Screen>
        <TopBar onClose={() => go('welcome')} closeIcon="chevronLeft" title="Sign in" />
        <Title>Sign in</Title>
        <Sub>Your progress rides along with you.</Sub>

        {/* Google first and on its own: it needs nothing typed, so nothing is
            allowed to gate it. */}
        <div style={{ marginTop: 24 }}>
          <Btn
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'signIn', name: cleanName(name) });
              go('goal');
            }}
          >
            <Icon name="user" size={16} />
            Continue with Google
          </Btn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 4px' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--mm-line)' }} />
          <span style={{ fontSize: 11, color: 'var(--mm-muted)' }}>or use your number</span>
          <span style={{ flex: 1, height: 1, background: 'var(--mm-line)' }} />
        </div>

        <div style={{ marginTop: 14 }}>
          <label
            htmlFor="mm-phone"
            style={{ display: 'block', fontSize: 12, color: 'var(--mm-muted)', marginBottom: 6 }}
          >
            Phone number
          </label>
          <input
            id="mm-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            placeholder="+91 98765 43210"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={!!phoneMessage}
            aria-describedby="mm-phone-note"
            style={{ ...inputStyle, borderColor: phoneMessage ? 'var(--fb-minor)' : 'var(--mm-line)' }}
          />
          <div
            id="mm-phone-note"
            style={{
              fontSize: 11.5,
              color: phoneMessage ? 'var(--fb-minor)' : 'var(--mm-muted)',
              marginTop: 6,
              minHeight: 17,
            }}
          >
            {phoneMessage ?? "We'll send a one-time code. No password to remember."}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label
            htmlFor="mm-name"
            style={{ display: 'block', fontSize: 12, color: 'var(--mm-muted)', marginBottom: 6 }}
          >
            Your first name <span style={{ opacity: 0.7 }}>· optional</span>
          </label>
          <input
            id="mm-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Priya"
            autoComplete="given-name"
            style={inputStyle}
          />
          <div style={{ fontSize: 11.5, color: 'var(--mm-muted)', marginTop: 6 }}>
            Only used to greet you.
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
          <Btn
            disabled={!phoneReady}
            onClick={() => {
              setOtp('');
              setOtpError(null);
              setResent(false);
              go('otp');
            }}
          >
            Send me a code
          </Btn>
          {/* A disabled button always says why, so it never reads as broken. */}
          {!phoneReady && (
            <p style={{ fontSize: 11.5, color: 'var(--mm-muted)', textAlign: 'center', marginTop: 8 }}>
              {problem === 'empty' ? 'Enter your number to get a code.' : 'Check the number above.'}
            </p>
          )}
        </div>
      </Screen>
    );
  }

  if (step === 'otp') {
    const ready = isValidOtp(otp);
    return (
      <Screen>
        <TopBar onClose={() => go('signin')} closeIcon="chevronLeft" title="Sign in" />
        <Title>Enter your code</Title>
        <Sub>
          Sent to {displayPhone(phone)}.{' '}
          <button
            onClick={() => go('signin')}
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              color: 'var(--mm-accent)',
              cursor: 'pointer',
              font: 'inherit',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Change number
          </button>
        </Sub>

        <div style={{ marginTop: 24 }}>
          <label
            htmlFor="mm-otp"
            style={{ display: 'block', fontSize: 12, color: 'var(--mm-muted)', marginBottom: 6 }}
          >
            {OTP_LENGTH}-digit code
          </label>
          <input
            id="mm-otp"
            className="mm-code"
            value={otp}
            onChange={(e) => {
              setOtp(cleanOtpInput(e.target.value));
              setOtpError(null);
            }}
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-invalid={!!otpError}
            style={{
              ...inputStyle,
              fontSize: 26,
              letterSpacing: '0.34em',
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
              borderColor: otpError ? 'var(--fb-minor)' : 'var(--mm-line)',
            }}
          />
          <div style={{ fontSize: 11.5, color: otpError ? 'var(--fb-minor)' : 'var(--mm-muted)', marginTop: 8, minHeight: 17 }}>
            {otpError ?? (resent ? 'Code sent again.' : ' ')}
          </div>
        </div>

        {/* No auth backend exists yet, so the app says that outright rather than
            leaving the learner waiting for an SMS that is never coming. */}
        <div
          style={{
            marginTop: 8,
            border: '1px solid var(--mm-line)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--mm-muted)',
          }}
        >
          This build has no SMS service behind it, so no code was actually sent. Type any{' '}
          {OTP_LENGTH} digits to continue.
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Btn
            disabled={!ready}
            onClick={() => {
              if (!isValidOtp(otp)) {
                setOtpError(`The code is ${OTP_LENGTH} digits.`);
                return;
              }
              dispatch({ type: 'signIn', name: cleanName(name) });
              go('goal');
            }}
          >
            Verify and continue
          </Btn>
          {!ready && (
            <p style={{ fontSize: 11.5, color: 'var(--mm-muted)', textAlign: 'center' }}>
              {otp.length === 0
                ? `Enter the ${OTP_LENGTH}-digit code.`
                : `${OTP_LENGTH - otp.length} more ${OTP_LENGTH - otp.length === 1 ? 'digit' : 'digits'}.`}
            </p>
          )}
          <Btn
            variant="ghost"
            onClick={() => {
              setResent(true);
              setOtpError(null);
            }}
          >
            Resend the code
          </Btn>
        </div>
      </Screen>
    );
  }

  if (step === 'goal') {
    return (
      <Screen>
        <TopBar onClose={() => go('signin')} closeIcon="chevronLeft" title="1 of 4" />
        <Title>What are you learning for?</Title>
        <Sub>This shapes which words come first.</Sub>
        <div style={{ marginTop: 22 }}>
          {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => (
            <Choice
              key={g}
              label={GOAL_LABEL[g]}
              icon={GOAL_ICON[g]}
              selected={s.goal === g}
              onClick={() => set({ goal: g })}
            />
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
          <Btn onClick={() => go('helper')}>Next</Btn>
        </div>
      </Screen>
    );
  }

  if (step === 'helper') {
    return (
      <Screen>
        <TopBar onClose={() => go('goal')} closeIcon="chevronLeft" title="2 of 4" />
        <Title>Use Hindi to help with word order and pronunciation?</Title>

        <div
          style={{
            marginTop: 18,
            border: '1px solid var(--mm-line)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 12px',
          }}
        >
          <div style={{ fontFamily: MM_ZH, fontSize: 22 }}>我明天在家吃饭</div>
          <div style={{ fontFamily: MM_PY, fontSize: 12, color: 'var(--mm-muted)', marginTop: 3 }}>
            Wǒ míngtiān zài jiā chī fàn.
          </div>
          <div style={{ fontFamily: MM_PY, fontSize: 13, color: 'var(--mm-muted)', marginTop: 8 }}>
            main kal ghar par khaana khaaunga
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Choice
            label="Yes, Hindi"
            hint="Alignment lines, transfer notes, and a pinyin primer in Devanagari"
            selected={s.hindi !== 'off'}
            onClick={() => set({ hindi: 'deva' })}
          />
          <Choice
            label="English only"
            hint="No Hindi anywhere"
            selected={s.hindi === 'off'}
            onClick={() => set({ hindi: 'off' })}
          />
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
          <Btn onClick={() => go(s.hindi === 'off' ? 'mic' : 'script')}>Next</Btn>
        </div>
      </Screen>
    );
  }

  if (step === 'script') {
    return (
      <Screen>
        <TopBar onClose={() => go('helper')} closeIcon="chevronLeft" title="3 of 4" />
        <Title>Which script for Hindi?</Title>
        <Sub>You can change this any time.</Sub>

        <div style={{ marginTop: 20 }}>
          <button onClick={() => set({ hindi: 'deva' })} style={scriptCard(s.hindi === 'deva')}>
            <div style={{ fontSize: 12, color: 'var(--mm-muted)', marginBottom: 6 }}>Devanagari</div>
            <div style={{ fontFamily: MM_DV, fontSize: 19, lineHeight: 1.9 }}>मैं कल घर पर खाना खाऊँगा</div>
          </button>
          <button onClick={() => set({ hindi: 'roman' })} style={scriptCard(s.hindi === 'roman')}>
            <div style={{ fontSize: 12, color: 'var(--mm-muted)', marginBottom: 6 }}>Roman</div>
            <div style={{ fontFamily: MM_PY, fontSize: 17 }}>main kal ghar par khaana khaaunga</div>
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
          <Btn onClick={() => go('mic')}>Next</Btn>
        </div>
      </Screen>
    );
  }

  if (step === 'mic') {
    return (
      <Screen>
        <TopBar onClose={() => go(s.hindi === 'off' ? 'helper' : 'script')} closeIcon="chevronLeft" title="4 of 4" />
        <Title>Speaking is the point.</Title>
        <Sub>
          We need your microphone to hear your sentences and tell you what to fix. Recordings are graded and then
          dropped — you can delete them any time from Me.
        </Sub>

        <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 170 }}>
          <span style={{ color: 'var(--mm-accent)', opacity: 0.85 }}>
            <Icon name="mic" size={64} />
          </span>
        </div>

        <div style={{ padding: '16px 0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn
            onClick={async () => {
              // The browser prompt only appears on a real capture attempt; this
              // asks for it up front so the primer explains itself first.
              try {
                const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
                stream?.getTracks().forEach((t) => t.stop());
                set({ micAllowed: true });
              } catch {
                const st = await micPermission();
                set({ micAllowed: st === 'granted' });
              }
              go('placementIntro');
            }}
          >
            Turn on the mic
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => {
              set({ micAllowed: false });
              go('placementIntro');
            }}
          >
            Not now
          </Btn>
        </div>
      </Screen>
    );
  }

  if (step === 'placementIntro') {
    return (
      <Screen>
        <TopBar onClose={() => go('mic')} closeIcon="chevronLeft" title="Level check" />
        <Title>Let's find your level.</Title>
        <Sub>
          About 8 minutes. The questions adapt as you go, so there is no score and nothing to fail.
          {!s.micAllowed && ' Speaking is off, so we will skip the spoken items.'}
        </Sub>
        <div style={{ marginTop: 'auto', padding: '16px 0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn onClick={() => go('placement')}>Start the check</Btn>
          {/* Plenty of learners already know roughly where they are, and making
              them sit an eight-minute quiz to say so is a poor trade. */}
          <Btn variant="secondary" onClick={() => go('pickLevel')}>
            I know my level — let me pick
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => {
              dispatch({ type: 'skipPlacement' });
              go('reminders');
            }}
          >
            Skip for now — start at HSK 1
          </Btn>
        </div>
      </Screen>
    );
  }

  if (step === 'pickLevel') {
    return (
      <LevelPicker
        ui={ui}
        current={state.hsk}
        onBack={() => go('placementIntro')}
        onPick={(hsk) => {
          dispatch({
            type: 'finishPlacement',
            hsk,
            note: { strongest: 'You told us', weakest: 'Not measured yet', speakingTested: false },
          });
          go('reminders');
        }}
      />
    );
  }

  if (step === 'placement') {
    return (
      <Placement
        micAllowed={s.micAllowed}
        tts={tts}
        onAbandon={() => {
          dispatch({ type: 'skipPlacement' });
          go('reminders');
        }}
        onDone={(hsk, note) => {
          dispatch({ type: 'finishPlacement', hsk, note });
          go('result');
        }}
      />
    );
  }

  if (step === 'result') {
    const note = state.placementNote;
    return (
      <Screen>
        <TopBar title="Level check" />
        <div style={{ marginTop: 30 }}>
          <Kicker>Your starting point</Kicker>
          <Title>You're around HSK {state.hsk}.</Title>
        </div>
        <Divider margin="20px 0" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
          <Row label="Strongest" value={note?.strongest ?? 'Vocabulary'} />
          <Row label="Needs work" value={note?.weakest ?? 'Word order'} />
          <Row label="First focus" value="Time before the verb" />
          {note && !note.speakingTested && <Row label="Speaking" value="Not tested yet" />}
        </div>
        <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
          <Btn onClick={() => go('reminders')}>Next</Btn>
        </div>
      </Screen>
    );
  }

  // ON-10 Reminders
  const slots: { id: ReminderSlot; label: string; hint: string }[] = [
    { id: 'morning', label: 'Morning commute', hint: '08:30' },
    { id: 'lunch', label: 'After lunch', hint: '14:00' },
    { id: 'evening', label: 'Evening', hint: '21:00' },
    { id: 'custom', label: 'Custom', hint: s.customReminder },
  ];
  const toggle = (id: ReminderSlot) => {
    const has = s.reminders.includes(id);
    const next = has ? s.reminders.filter((r) => r !== id) : [...s.reminders, id].slice(-3);
    set({ reminders: next });
  };

  return (
    <Screen>
      <TopBar title="Reminders" />
      <Title>When should we nudge you?</Title>
      <Sub>Pick up to three. You can answer right inside the notification, without opening the app.</Sub>
      <div style={{ marginTop: 20 }}>
        {slots.map((sl) => (
          <Choice
            key={sl.id}
            label={sl.label}
            hint={sl.hint}
            selected={s.reminders.includes(sl.id)}
            onClick={() => toggle(sl.id)}
          />
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <Chip icon="lightbulb">One sentence keeps your streak today.</Chip>
      </div>
      <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
        <Btn onClick={() => dispatch({ type: 'finishOnboarding' })}>Start my first session</Btn>
      </div>
    </Screen>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
    <span style={{ color: 'var(--mm-muted)' }}>{label}</span>
    <span style={{ textAlign: 'right' }}>{value}</span>
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 48,
  padding: '10px 12px',
  fontSize: 16,
  color: 'var(--mm-ink)',
  background: 'transparent',
  border: '1px solid var(--mm-line)',
  borderRadius: 'var(--radius-md)',
};

const playStyle: React.CSSProperties = {
  width: 92,
  height: 92,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  border: '1px solid var(--mm-accent)',
  background: 'transparent',
  color: 'var(--mm-accent)',
  cursor: 'pointer',
};

const scriptCard = (selected: boolean): React.CSSProperties => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '13px 14px',
  marginBottom: 10,
  borderRadius: 'var(--radius-md)',
  border: `1px solid ${selected ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
  background: selected ? 'color-mix(in srgb, var(--mm-accent) 9%, transparent)' : 'transparent',
  color: 'var(--mm-ink)',
  cursor: 'pointer',
});

/* ── ON-08 Placement ─────────────────────────────────────────────────────── */

function Placement({
  micAllowed,
  tts,
  onDone,
  onAbandon,
}: {
  micAllowed: boolean;
  tts: ReturnType<typeof createTts>;
  onDone: (hsk: HskLevel, note: { strongest: string; weakest: string; speakingTested: boolean }) => void;
  onAbandon: () => void;
}) {
  const [ps, setPs] = useState<PlacementState>(initialPlacement);
  const [tiles, setTiles] = useState<string[]>([]);
  const item = useMemo(() => nextItem(ps, micAllowed), [ps, micAllowed]);

  // The bar fills towards the minimum length, since the test adapts and has no
  // fixed count to show.
  const progress = Math.min(0.95, ps.results.length / 16);

  const submit = (right: boolean) => {
    if (!item) return;
    const next = record(ps, item, right);
    setTiles([]);
    const done = next.done || !nextItem(next, micAllowed) || next.results.length >= 15;
    if (done) {
      const r = score(next);
      onDone(r.level, { strongest: r.strongest, weakest: r.weakest, speakingTested: r.speakingTested });
    } else {
      setPs(next);
    }
  };

  if (!item) {
    const r = score(ps);
    return (
      <Screen>
        <TopBar title="Level check" />
        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <Btn onClick={() => onDone(r.level, r)}>See your level</Btn>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar onClose={onAbandon} progress={progress} title="Level check" />

      {item.kind === 'meaning' && (
        <>
          <div style={{ marginTop: 22, fontSize: 13, color: 'var(--mm-muted)' }}>What does this mean?</div>
          <div style={{ fontFamily: MM_ZH, fontSize: 40, margin: '14px 0 22px' }}>{item.prompt}</div>
          <Options options={item.options ?? []} onPick={(o) => submit(o === item.answer)} />
        </>
      )}

      {item.kind === 'listen' && (
        <>
          <div style={{ marginTop: 22, fontSize: 13, color: 'var(--mm-muted)' }}>Which one did you hear?</div>
          <div style={{ margin: '18px 0 22px', display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => tts.speak(item.prompt)} style={playStyle} aria-label="Play the word">
              <Icon name="sound" size={30} />
            </button>
          </div>
          <Options options={item.options ?? []} zh onPick={(o) => submit(o === item.answer)} />
        </>
      )}

      {item.kind === 'reorder' && (
        <PlacementReorder
          item={item}
          tiles={tiles}
          setTiles={setTiles}
          onSubmit={(built) => submit(normalise(built) === normalise(item.answer))}
        />
      )}

      {item.kind === 'spoken' && (
        <PlacementSpoken item={item} onSubmit={(heard) => submit(normalise(heard) === normalise(item.answer))} />
      )}
    </Screen>
  );
}

function Options({
  options,
  onPick,
  zh,
}: {
  options: string[];
  onPick: (o: string) => void;
  zh?: boolean;
}) {
  return (
    <div>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onPick(o)}
          style={{
            display: 'block',
            width: '100%',
            minHeight: 54,
            textAlign: 'left',
            padding: '13px 14px',
            marginBottom: 9,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--mm-line)',
            background: 'transparent',
            color: 'var(--mm-ink)',
            fontFamily: zh ? MM_ZH : 'var(--font-body)',
            fontSize: zh ? 21 : 15,
            cursor: 'pointer',
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function PlacementReorder({
  item,
  tiles,
  setTiles,
  onSubmit,
}: {
  item: PlacementItem;
  tiles: string[];
  setTiles: (t: string[]) => void;
  onSubmit: (built: string) => void;
}) {
  const all = item.tiles ?? [];
  const pool = all.filter((t) => !tiles.includes(t));
  return (
    <>
      <div style={{ marginTop: 22, fontSize: 13, color: 'var(--mm-muted)' }}>Put the words in Chinese order.</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, fontWeight: 600, marginTop: 6 }}>
        {item.prompt}
      </div>

      <div
        style={{
          marginTop: 20,
          minHeight: 66,
          borderBottom: '1px solid var(--mm-line)',
          paddingBottom: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {tiles.length === 0 ? (
          <span style={{ fontSize: 12.5, color: 'var(--mm-muted)' }}>Tap the words below.</span>
        ) : (
          tiles.map((t, i) => (
            <TileButton key={`${t}-${i}`} zh={t} onClick={() => setTiles(tiles.filter((x) => x !== t))} />
          ))
        )}
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {pool.map((t) => (
          <TileButton key={t} zh={t} onClick={() => setTiles([...tiles, t])} filled />
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
        <Btn disabled={tiles.length !== all.length} onClick={() => onSubmit(tiles.join(''))}>
          Check
        </Btn>
      </div>
    </>
  );
}

function TileButton({ zh, onClick, filled }: { zh: string; onClick: () => void; filled?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        minHeight: 48,
        padding: '8px 14px',
        fontFamily: MM_ZH,
        fontSize: 21,
        border: '1px solid var(--mm-line)',
        borderRadius: 'var(--radius-md)',
        background: filled ? 'var(--mm-surface)' : 'transparent',
        color: 'var(--mm-ink)',
        cursor: 'pointer',
      }}
    >
      {zh}
    </button>
  );
}

function PlacementSpoken({ item, onSubmit }: { item: PlacementItem; onSubmit: (heard: string) => void }) {
  return (
    <>
      <div style={{ marginTop: 22, fontSize: 13, color: 'var(--mm-muted)' }}>Say this in Chinese.</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, fontWeight: 600, marginTop: 6 }}>
        {item.prompt}
      </div>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 200 }}>
        <MicButton seconds={8} onTranscript={(t) => onSubmit(t)} onGiveUp={() => onSubmit('')} />
      </div>
      <div style={{ padding: '8px 0 22px' }}>
        <Btn variant="ghost" onClick={() => onSubmit('')}>
          Skip this one
        </Btn>
      </div>
    </>
  );
}

/* ── Choosing a level instead of sitting the check ──────────────────────── */

interface LevelBand {
  hsk: HskLevel;
  name: string;
  blurb: string;
  words: string;
}

/** What each level means in terms a learner can recognise about themselves,
 *  rather than a syllabus number. Each band shows a sentence from its own
 *  patterns, so the choice is made against real Chinese and not a guess. */
const LEVEL_BANDS: LevelBand[] = [
  { hsk: 1, name: 'Starting out', blurb: 'You know a few words and want the basic sentence in the right order.', words: 'about 150 words' },
  { hsk: 2, name: 'Getting by', blurb: 'You can say what you did and how many, and you want it to sound right.', words: 'about 300 words' },
  { hsk: 3, name: 'Holding a conversation', blurb: 'You can talk about most everyday things and want the finer word order.', words: 'about 600 words' },
  { hsk: 4, name: 'Comfortable', blurb: 'You read and talk freely; you are after the structures that still sound translated.', words: 'about 1,200 words' },
];

function LevelPicker({
  ui,
  current,
  onBack,
  onPick,
}: {
  ui: Ui;
  current: HskLevel;
  onBack: () => void;
  onPick: (hsk: HskLevel) => void;
}) {
  const [picked, setPicked] = useState<HskLevel>(current);
  const sample = (hsk: HskLevel) => PATTERNS.find((p) => p.hsk === hsk)?.examples[0];

  return (
    <Screen>
      <TopBar onClose={onBack} closeIcon="chevronLeft" title="Your level" />
      <Title>Where are you now?</Title>
      <Sub>Pick the one that sounds most like you. You can change it any time in Me.</Sub>

      <div style={{ marginTop: 20 }}>
        {LEVEL_BANDS.map((band) => {
          const on = picked === band.hsk;
          const ex = sample(band.hsk);
          return (
            <button
              key={band.hsk}
              onClick={() => setPicked(band.hsk)}
              aria-pressed={on}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '13px 14px',
                marginBottom: 10,
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${on ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
                background: on ? 'color-mix(in srgb, var(--mm-accent) 9%, transparent)' : 'transparent',
                color: 'var(--mm-ink)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, flex: 1 }}>
                  {band.name}
                </span>
                <span className="mm-num" style={{ fontSize: 11, color: on ? 'var(--mm-accent)' : 'var(--mm-muted)' }}>
                  HSK {band.hsk}
                </span>
              </span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--mm-muted)', lineHeight: 1.55, marginTop: 4 }}>
                {band.blurb}
              </span>
              {/* A real sentence from that level beats any description of it. */}
              {ex && (
                <span style={{ display: 'block', marginTop: 10 }}>
                  <SentenceLine
                    chunks={ex.chunks}
                    ui={{ ...ui, pinyin: true }}
                    size={17}
                    gap={6}
                    justify="flex-start"
                    showHindi={false}
                    state={on ? undefined : 'plain'}
                  />
                </span>
              )}
              <span className="mm-num" style={{ display: 'block', fontSize: 11, color: 'var(--mm-muted)', marginTop: 8 }}>
                {band.words}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', padding: '16px 0 22px' }}>
        <Btn onClick={() => onPick(picked)}>Start at HSK {picked}</Btn>
      </div>
    </Screen>
  );
}
