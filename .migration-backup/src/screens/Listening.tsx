/* Mandarin Mitra — LS-01 tone-pair trainer and LS-02 minimal pairs.
   Both are fast, tap-only drills. Tones are shown with contour glyphs, never a
   second colour system. */

import { useMemo, useState } from 'react';
import { Btn, Chip, Divider, Kicker, Screen, TopBar } from '../design/ui';
import { Icon } from '../design/Icon';
import { MM_DV, MM_PY, MM_ZH } from '../design/slots';
import type { Ui } from '../design/slots';
import { MINIMAL_PAIRS, TONE_PAIRS, TTS_VOICES } from '../content/listening';
import { useStore } from '../state/store';
import { createTts } from '../engine/speech';

/** Tones are shape, not colour. */
export const TONE_GLYPH = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '·'] as const;
export const toneGlyph = (t: number) => TONE_GLYPH[Math.max(0, Math.min(4, t - 1))] ?? '·';

export function TonePairs({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const tts = useMemo(() => createTts(), []);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<[number, number] | null>(null);
  const [neutral, setNeutral] = useState(false);
  const [done, setDone] = useState(false);

  const item = TONE_PAIRS[i % TONE_PAIRS.length];
  // A random voice per item, from the hosted set, named in the corner so the
  // learner knows it is changing on purpose.
  const voiceIndex = useMemo(() => i % TTS_VOICES.length, [i]);
  const voiceName = TTS_VOICES[voiceIndex] ?? TTS_VOICES[0];

  if (!item) return null;

  const play = () =>
    tts.speak(item.zh, {
      rate: state.settings.ttsRate,
      voiceIndex: state.settings.voiceVariety ? voiceIndex : 0,
    });

  const answer = item.tones;
  const correct = pick !== null && pick[0] === answer[0] && pick[1] === answer[1];

  const submit = (a: number, b: number) => {
    setPick([a, b]);
    const right = a === answer[0] && b === answer[1];
    dispatch({ type: 'tonePairResult', key: `${answer[0]}-${answer[1]}`, right });
  };

  if (done) {
    return <ToneHeatmap onClose={onClose} />;
  }

  return (
    <Screen>
      <TopBar onClose={onClose} progress={(i % 10) / 10} title={`Tone pairs · ${(i % 10) + 1}/10`} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--mm-muted)' }}>Which tone pair did you hear?</div>
        <div style={{ fontSize: 10.5, color: 'var(--mm-muted)' }}>{voiceName}</div>
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={play}
          aria-label="Play the word"
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--mm-accent)',
            background: 'transparent',
            color: 'var(--mm-accent)',
            cursor: 'pointer',
          }}
        >
          <Icon name="sound" size={30} />
        </button>
      </div>

      {/* 4×4 grid, tone 1–4 × tone 1–4, with a neutral-tone toggle row. */}
      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
          {[1, 2, 3, 4].flatMap((a) =>
            [1, 2, 3, 4].map((b) => {
              const second = neutral ? 5 : b;
              const chosen = pick?.[0] === a && pick?.[1] === second;
              const isAnswer = pick !== null && a === answer[0] && second === answer[1];
              return (
                <button
                  key={`${a}-${b}`}
                  onClick={() => pick === null && submit(a, second)}
                  aria-label={`tone ${a} then tone ${second}`}
                  style={{
                    minHeight: 54,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isAnswer ? 'var(--fb-correct)' : chosen ? 'var(--fb-minor)' : 'var(--mm-line)'}`,
                    background: isAnswer
                      ? 'color-mix(in srgb, var(--fb-correct) 14%, transparent)'
                      : 'var(--mm-surface)',
                    color: 'var(--mm-ink)',
                    cursor: pick === null ? 'pointer' : 'default',
                    fontSize: 19,
                    fontFamily: MM_PY,
                  }}
                >
                  {toneGlyph(a)}
                  {toneGlyph(second)}
                </button>
              );
            }),
          )}
        </div>

        <button
          onClick={() => setNeutral((v) => !v)}
          aria-pressed={neutral}
          style={{
            marginTop: 10,
            minHeight: 44,
            width: '100%',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${neutral ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
            background: neutral ? 'color-mix(in srgb, var(--mm-accent) 10%, transparent)' : 'transparent',
            color: neutral ? 'var(--mm-accent)' : 'var(--mm-muted)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Second syllable is neutral (·)
        </button>
      </div>

      {pick !== null && (
        <div className="mm-fade-up" style={{ marginTop: 20 }}>
          <Divider margin="0 0 12px" />
          <div style={{ fontSize: 13, color: correct ? 'var(--fb-correct)' : 'var(--fb-minor)' }}>
            {correct ? 'That is the pair.' : 'Not quite — here it is.'}
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: MM_ZH, fontSize: 30 }}>{item.zh}</span>
            <span style={{ fontFamily: MM_PY, fontSize: 15, color: 'var(--mm-muted)' }}>{item.py}</span>
          </div>
          {/* The correct contours drawn over the syllables. */}
          <div style={{ marginTop: 6, display: 'flex', gap: 16, fontFamily: MM_PY, fontSize: 22 }}>
            {answer.map((t, k) => (
              <span key={k} style={{ color: 'var(--mm-accent)' }}>
                {toneGlyph(t)}
                <span style={{ fontSize: 11, color: 'var(--mm-muted)', marginLeft: 4 }}>
                  {t === 5 ? 'neutral' : `tone ${t}`}
                </span>
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--mm-muted)', marginTop: 6 }}>{item.en}</div>
        </div>
      )}

      <div style={{ marginTop: 'auto', padding: '14px 0 20px', display: 'flex', gap: 10 }}>
        {pick !== null && (
          <Btn
            onClick={() => {
              setPick(null);
              setNeutral(false);
              if ((i + 1) % 10 === 0) setDone(true);
              setI(i + 1);
            }}
          >
            Next
          </Btn>
        )}
        {pick === null && (
          <Btn variant="ghost" onClick={() => setDone(true)}>
            See my heatmap
          </Btn>
        )}
      </div>
    </Screen>
  );
}

/** The summary heatmap reuses the same 4×4 grid component shape. */
function ToneHeatmap({ onClose }: { onClose: () => void }) {
  const { state } = useStore();
  const stats = state.progress.tonePairStats;
  return (
    <Screen>
      <TopBar onClose={onClose} title="Tone pairs" />
      <div style={{ marginTop: 20 }}>
        <Kicker>Your accuracy</Kicker>
        <h2 style={{ fontSize: 25, fontWeight: 400, margin: '8px 0 4px' }}>Which pairs still slip</h2>
        <p style={{ fontSize: 13, color: 'var(--mm-muted)', lineHeight: 1.6 }}>
          Rows are the first syllable, columns the second.
        </p>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
        <span />
        {[1, 2, 3, 4].map((b) => (
          <span key={b} style={{ textAlign: 'center', fontSize: 11, color: 'var(--mm-muted)', fontFamily: MM_PY }}>
            {toneGlyph(b)}
          </span>
        ))}
        {[1, 2, 3, 4].map((a) => (
          <span key={a} style={{ display: 'contents' }}>
            <span style={{ textAlign: 'center', fontSize: 11, color: 'var(--mm-muted)', fontFamily: MM_PY, alignSelf: 'center' }}>
              {toneGlyph(a)}
            </span>
            {[1, 2, 3, 4].map((b) => {
              const s = stats[`${a}-${b}`];
              const rate = s && s.total > 0 ? s.right / s.total : null;
              return (
                <span
                  key={b}
                  title={s ? `${s.right}/${s.total}` : 'not yet tested'}
                  style={{
                    minHeight: 42,
                    borderRadius: 3,
                    border: '1px solid var(--mm-line)',
                    background:
                      rate === null
                        ? 'transparent'
                        : `color-mix(in srgb, var(--mm-accent) ${Math.round(rate * 60)}%, transparent)`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 10.5,
                    color: 'var(--mm-muted)',
                  }}
                  className="mm-num"
                >
                  {rate === null ? '—' : `${Math.round(rate * 100)}%`}
                </span>
              );
            })}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '16px 0 20px' }}>
        <Btn onClick={onClose}>Done</Btn>
      </div>
    </Screen>
  );
}

/* ── LS-02 Minimal pairs ────────────────────────────────────────────────── */

export function MinimalPairs({ ui, onClose }: { ui: Ui; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const tts = useMemo(() => createTts(), []);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<'a' | 'b' | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [tally, setTally] = useState<Record<string, { right: number; total: number }>>({});

  const item = MINIMAL_PAIRS[i];
  if (!item || i >= 10) {
    return (
      <Screen>
        <TopBar onClose={onClose} title="Minimal pairs" />
        <div style={{ marginTop: 24 }}>
          <Kicker>Result</Kicker>
          <h2 style={{ fontSize: 25, fontWeight: 400, margin: '8px 0 16px' }}>How each contrast went</h2>
          {Object.entries(tally).map(([contrast, s]) => (
            <div
              key={contrast}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--mm-line)',
                fontSize: 14,
              }}
            >
              <span>{contrast}</span>
              <span className="mm-num" style={{ color: 'var(--mm-muted)' }}>
                {s.right}/{s.total}
              </span>
            </div>
          ))}
          {Object.keys(tally).length === 0 && (
            <p style={{ fontSize: 13.5, color: 'var(--mm-muted)' }}>Nothing answered yet.</p>
          )}
        </div>
        <div style={{ marginTop: 'auto', padding: '16px 0 20px' }}>
          <Btn onClick={onClose}>Done</Btn>
        </div>
      </Screen>
    );
  }

  const played = item[item.answer];
  const play = () => tts.speak(played.zh, { rate: state.settings.ttsRate });

  const choose = (which: 'a' | 'b') => {
    setPick(which);
    const right = which === item.answer;
    dispatch({ type: 'minimalPairResult', contrast: item.contrast, right });
    setTally((t) => {
      const s = t[item.contrast] ?? { right: 0, total: 0 };
      return { ...t, [item.contrast]: { right: s.right + (right ? 1 : 0), total: s.total + 1 } };
    });
  };

  const option = (which: 'a' | 'b') => {
    const o = item[which];
    const isAnswer = pick !== null && which === item.answer;
    const chosenWrong = pick === which && which !== item.answer;
    return (
      <button
        key={which}
        onClick={() => pick === null && choose(which)}
        style={{
          flex: 1,
          minHeight: 92,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${isAnswer ? 'var(--fb-correct)' : chosenWrong ? 'var(--fb-minor)' : 'var(--mm-line)'}`,
          background: isAnswer ? 'color-mix(in srgb, var(--fb-correct) 12%, transparent)' : 'var(--mm-surface)',
          color: 'var(--mm-ink)',
          cursor: pick === null ? 'pointer' : 'default',
        }}
      >
        <span style={{ fontFamily: MM_ZH, fontSize: 24 }}>{o.zh}</span>
        <span style={{ fontFamily: MM_PY, fontSize: 13, color: 'var(--mm-muted)' }}>{o.py}</span>
        <span style={{ fontSize: 11, color: 'var(--mm-muted)' }}>{o.en}</span>
      </button>
    );
  };

  return (
    <Screen>
      <TopBar onClose={onClose} progress={i / 10} title={`Minimal pairs · ${i + 1}/10`} />

      <div style={{ marginTop: 14, fontSize: 13, color: 'var(--mm-muted)' }}>
        Which one did you hear? <span style={{ opacity: 0.8 }}>({item.contrast})</span>
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={play}
          aria-label="Play the word"
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--mm-accent)',
            background: 'transparent',
            color: 'var(--mm-accent)',
            cursor: 'pointer',
          }}
        >
          <Icon name="sound" size={30} />
        </button>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
        {option('a')}
        {option('b')}
      </div>

      {ui.hindi !== 'off' && item.hindiHint && (
        <div style={{ marginTop: 16 }}>
          {hintOpen ? (
            <div
              style={{
                display: 'flex',
                gap: 9,
                alignItems: 'flex-start',
                border: '1px solid var(--mm-line)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
              }}
            >
              <span style={{ fontFamily: MM_DV, fontSize: 12, color: 'var(--mm-accent)', flex: 'none' }}>हिं</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.55 }}>{item.hindiHint}</span>
            </div>
          ) : (
            <Chip icon="lightbulb" onClick={() => setHintOpen(true)}>
              Hindi hint
            </Chip>
          )}
        </div>
      )}

      <div style={{ marginTop: 'auto', padding: '14px 0 20px' }}>
        {pick !== null && (
          <Btn
            onClick={() => {
              setPick(null);
              setHintOpen(false);
              setI(i + 1);
            }}
          >
            Next
          </Btn>
        )}
      </div>
    </Screen>
  );
}
