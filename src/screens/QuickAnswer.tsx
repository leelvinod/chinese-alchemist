/* Mandarin Mitra — NT-01, the answer-in-notification surface.
   A notification cannot host a microphone, so the spec's fallback is this: a
   lightweight overlay that opens straight into SF-08 without the home screen.
   One prompt, one answer, one result line, then out. Answering here keeps the
   streak, which is the whole point — the learner never opened the app. */

import { useMemo, useState } from 'react';
import { Btn, Kicker, Screen } from '../design/ui';
import { Icon } from '../design/Icon';
import { SentenceLine } from '../design/Sentence';
import { MM_ZH, fbCorrect, fbMinor } from '../design/slots';
import type { Ui } from '../design/slots';
import { PATTERNS } from '../content/patterns';
import type { DrillItem, Pattern } from '../content/types';
import { grade, normalise } from '../engine/grader';
import type { GradeResult } from '../engine/grader';
import { resultCopy } from '../engine/reminders';
import { createTts } from '../engine/speech';
import { useStore } from '../state/store';
import { MicButton } from './MicButton';

type Phase = 'ask' | 'checking' | 'done';

/** The drill the notification named, or the first spoken drill at the learner's
 *  level when it named none (or named one that has since been removed). */
function resolveDrill(drillId: string | null, hsk: number): { pattern: Pattern; drill: DrillItem } | null {
  if (drillId) {
    for (const p of PATTERNS) {
      const d = p.drills.find((x) => x.id === drillId);
      if (d) return { pattern: p, drill: d };
    }
  }
  for (const p of PATTERNS) {
    if (p.hsk > Math.max(1, hsk)) continue;
    const d = p.drills.find((x) => x.kind === 'sayit');
    if (d) return { pattern: p, drill: d };
  }
  return null;
}

export function QuickAnswer({
  ui,
  drillId,
  onClose,
  onOpenApp,
}: {
  ui: Ui;
  drillId: string | null;
  /** Dismiss the overlay without opening the app at all. */
  onClose: () => void;
  /** Open the full app, landing on the correction when there is one. */
  onOpenApp: (patternId: string) => void;
}) {
  const { state, dispatch, voiceLeft } = useStore();
  const tts = useMemo(() => createTts(), []);
  const found = useMemo(() => resolveDrill(drillId, state.hsk), [drillId, state.hsk]);

  const [phase, setPhase] = useState<Phase>('ask');
  const [typed, setTyped] = useState('');
  const [useKeyboard, setUseKeyboard] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [answer, setAnswer] = useState('');

  if (!found) {
    return (
      <Screen>
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--mm-muted)' }}>Nothing to practise right now.</p>
          <div style={{ marginTop: 14 }}>
            <Btn onClick={onClose}>Close</Btn>
          </div>
        </div>
      </Screen>
    );
  }

  const { pattern, drill } = found;
  const target = drill.target;
  // Speaking is off here for the same reasons as anywhere else, and the overlay
  // has to stay answerable, so it falls back to typing rather than dead-ending.
  const typing = useKeyboard || !state.settings.micAllowed || voiceLeft <= 0;

  const submit = (answer: string, spoken: boolean) => {
    setAnswer(answer);
    setPhase('checking');
    window.setTimeout(() => {
      const r = grade(answer, target, { loose: true, spoken });
      setResult(r);
      setPhase('done');
      dispatch({
        type: 'logAttempt',
        patternId: pattern.id,
        drillId: drill.id,
        answer,
        correction: target.zh,
        firstTry: r.pass,
        pass: r.pass,
        codes: r.diagnoses.map((d) => d.code),
        spoken,
      });
    }, 700);
  };

  return (
    <Screen>
      {/* No tabs, no Today: this is the notification's own surface. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0 6px', flex: 'none' }}>
        <span style={{ color: 'var(--mm-accent)' }}>
          <Icon name="mic" size={16} />
        </span>
        <Kicker>One sentence</Kicker>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            marginLeft: 'auto',
            width: 44,
            height: 44,
            marginRight: -12,
            display: 'grid',
            placeItems: 'center',
            background: 'none',
            border: 0,
            color: 'var(--mm-muted)',
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <div style={{ marginTop: 16, flex: 'none' }}>
        <div style={{ fontSize: 13, color: 'var(--mm-muted)' }}>
          {phase === 'ask' ? (typing ? 'Type this in Chinese.' : 'Say this in Chinese.') : 'The prompt was'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 23,
            fontWeight: 600,
            marginTop: 6,
            lineHeight: 1.3,
          }}
        >
          {target.en}
        </div>
      </div>

      {phase === 'ask' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 220 }}>
          {typing ? (
            <>
              <textarea
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                rows={2}
                lang="zh"
                placeholder="Type in Chinese"
                style={{
                  width: '100%',
                  minHeight: 62,
                  padding: '12px 13px',
                  fontFamily: MM_ZH,
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: 'var(--mm-ink)',
                  background: 'transparent',
                  border: '1px solid var(--mm-line)',
                  borderRadius: 'var(--radius-md)',
                  resize: 'none',
                }}
              />
              <div style={{ marginTop: 14 }}>
                <Btn disabled={typed.trim().length === 0} onClick={() => submit(typed, false)}>
                  Check
                </Btn>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <MicButton seconds={8} onTranscript={(t) => submit(t, true)} onGiveUp={() => setUseKeyboard(true)} />
            </div>
          )}
        </div>
      )}

      {phase === 'checking' && (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--mm-muted)' }}>Checking…</span>
        </div>
      )}

      {phase === 'done' && result && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: 22 }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 20,
              color: result.pass ? fbCorrect(ui) : fbMinor(ui),
            }}
          >
            {resultCopy(result.pass, target.zh)}
          </div>

          {/* What the learner actually produced, when it was not the model answer. */}
          {answer && normalise(answer) !== normalise(target.zh) && (
            <div style={{ marginTop: 12 }}>
              <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 4 }}>
                You said
              </div>
              <div style={{ fontFamily: MM_ZH, fontSize: 19, opacity: 0.6 }}>{answer}</div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <SentenceLine chunks={target.chunks} ui={ui} size={24} justify="flex-start" />
          </div>

          <button
            onClick={() => tts.speak(target.zh, { rate: state.settings.ttsRate })}
            style={{
              marginTop: 14,
              alignSelf: 'flex-start',
              display: 'inline-flex',
              gap: 6,
              alignItems: 'center',
              minHeight: 36,
              padding: '0 12px',
              border: '1px solid var(--mm-line)',
              borderRadius: 20,
              background: 'none',
              color: 'var(--mm-ink)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            <Icon name="sound" size={14} />
            Play
          </button>

          <p className="mm-num" style={{ fontSize: 12.5, color: 'var(--mm-muted)', marginTop: 16, lineHeight: 1.6 }}>
            Streak: {state.progress.streak} {state.progress.streak === 1 ? 'day' : 'days'}. Answered without opening
            the app.
          </p>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ padding: '14px 0 22px', display: 'flex', flexDirection: 'column', gap: 9, flex: 'none' }}>
          {/* A miss opens the app at the correction, which is where FB-01 lives. */}
          <Btn onClick={() => (result?.pass ? onClose() : onOpenApp(pattern.id))}>
            {result?.pass ? 'Done' : 'Fix it'}
          </Btn>
          <Btn variant="ghost" onClick={() => onOpenApp(pattern.id)}>
            Open the app
          </Btn>
        </div>
      )}
    </Screen>
  );
}
