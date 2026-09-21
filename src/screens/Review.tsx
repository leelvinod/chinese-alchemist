/* Mandarin Mitra — VR-01 vocabulary review.
   One card screen, three facets. Grading buttons sit where thumbs rest and show
   the next interval. When the cap is reached the learner is told, not nagged. */

import { useMemo, useState } from 'react';
import { Btn, Chip, Divider, Kicker, Screen, TopBar } from '../design/ui';
import { Icon } from '../design/Icon';
import { MM_PY, MM_ZH } from '../design/slots';
import { useStore } from '../state/store';
import { GRADES, dueCards, gradeLabel, intervalLabel, nextInterval } from '../engine/srs';
import type { Card, Grade } from '../engine/srs';
import { VOCAB_BY_ID, exampleText } from '../content/vocab';
import { createTts } from '../engine/speech';
import { normalise } from '../engine/grader';
import { MicButton } from './MicButton';

/** The review screen reached from Practice or the due chip. */
export function Review({ onClose }: { onClose: () => void }) {
  const { state } = useStore();
  const cards = useMemo(
    () => dueCards(state.progress.cards, state.settings.reviewCap),
    [state.progress.cards, state.settings.reviewCap],
  );

  if (cards.length === 0) {
    return (
      <Screen>
        <TopBar onClose={onClose} title="Reviews" />
        <div style={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'center' }}>
          <Kicker>All clear</Kicker>
          <p style={{ fontSize: 15, marginTop: 10, lineHeight: 1.6 }}>
            That's today's reviews. The rest are spread over the next few days.
          </p>
        </div>
        <div style={{ padding: '16px 0 22px' }}>
          <Btn onClick={onClose}>Back</Btn>
        </div>
      </Screen>
    );
  }

  return <ReviewRunner cards={cards} onClose={onClose} onDone={onClose} />;
}

export function ReviewRunner({
  cards,
  progress,
  onClose,
  onDone,
}: {
  cards: Card[];
  progress?: number;
  onClose: () => void;
  onDone: (reviewed: number) => void;
}) {
  const { state, dispatch } = useStore();
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState('');
  const [attempted, setAttempted] = useState(false);
  const tts = useMemo(() => createTts(), []);

  const card = cards[i];
  if (!card) {
    return (
      <Screen>
        <TopBar onClose={onClose} title="Reviews" />
        <div style={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'center' }}>
          <p style={{ fontSize: 15, lineHeight: 1.6 }}>
            That's today's reviews. The rest are spread over the next few days.
          </p>
        </div>
        <div style={{ padding: '16px 0 22px' }}>
          <Btn onClick={() => onDone(cards.length)}>Done</Btn>
        </div>
      </Screen>
    );
  }

  // Imported words share the deck with the built-in ones, so both are resolved.
  const w = VOCAB_BY_ID[card.wordId] ?? state.imported.find((x) => x.id === card.wordId);
  if (!w) {
    // A card whose word has left the content set is skipped rather than shown blank.
    return (
      <Screen>
        <TopBar onClose={onClose} title="Reviews" />
        <div style={{ margin: 'auto' }}>
          <Btn onClick={() => setI(i + 1)}>Next</Btn>
        </div>
      </Screen>
    );
  }

  // Pinyin fades on the front for words the learner has mastered.
  const showPinyinFront = state.settings.pinyin === 'always' || (state.settings.pinyin === 'fade' && !card.mastered);

  const next = () => {
    setRevealed(false);
    setTyped('');
    setAttempted(false);
    if (i + 1 >= cards.length) onDone(cards.length);
    else setI(i + 1);
  };

  const gradeIt = (g: Grade) => {
    dispatch({ type: 'gradeCard', card, grade: g });
    next();
  };

  const play = () => tts.speak(exampleText(w), { rate: state.settings.ttsRate });
  const playWord = () => tts.speak(w.zh, { rate: state.settings.ttsRate });

  const [before, after] = splitExample(w.example);
  const facetLabel =
    card.facet === 'meaning' ? 'Meaning' : card.facet === 'production' ? 'Production' : 'Listening';

  return (
    <Screen>
      <TopBar onClose={onClose} progress={progress ?? (i + 1) / cards.length} title={`${facetLabel} · ${i + 1}/${cards.length}`} />

      <div style={{ marginTop: 20, flex: 1 }}>
        {/* ── Front ── */}
        {card.facet === 'meaning' && (
          <>
            <div style={{ fontSize: 13, color: 'var(--mm-muted)' }}>What does the highlighted word mean?</div>
            <div style={{ marginTop: 16, fontFamily: MM_ZH, fontSize: 25, lineHeight: 1.5 }}>
              {before}
              <span
                style={{
                  color: 'var(--mm-accent)',
                  borderBottom: '2px solid var(--mm-accent)',
                  paddingBottom: 2,
                }}
              >
                {w.zh}
              </span>
              {after}
            </div>
            {showPinyinFront && (
              <div style={{ fontFamily: MM_PY, fontSize: 13, color: 'var(--mm-muted)', marginTop: 8 }}>
                {w.examplePy}
              </div>
            )}
          </>
        )}

        {card.facet === 'production' && (
          <>
            <div style={{ fontSize: 13, color: 'var(--mm-muted)' }}>Fill the gap.</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, marginTop: 8 }}>
              {w.en}
            </div>
            <div style={{ marginTop: 16, fontFamily: MM_ZH, fontSize: 25, lineHeight: 1.5 }}>
              {before}
              <span
                style={{
                  display: 'inline-block',
                  minWidth: 62,
                  borderBottom: '1.5px dashed var(--mm-accent)',
                }}
              >
                {typed}
              </span>
              {after}
            </div>
            {!revealed && (
              <div style={{ marginTop: 20 }}>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Type the word"
                  lang="zh"
                  style={{
                    width: '100%',
                    minHeight: 48,
                    padding: '10px 12px',
                    fontFamily: MM_ZH,
                    fontSize: 20,
                    color: 'var(--mm-ink)',
                    background: 'transparent',
                    border: '1px solid var(--mm-line)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                {state.settings.micAllowed && (
                  <div style={{ marginTop: 16, display: 'grid', placeItems: 'center' }}>
                    <MicButton
                      seconds={null}
                      label="Or say it"
                      onTranscript={(t) => {
                        setTyped(t);
                        setAttempted(true);
                        setRevealed(true);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {card.facet === 'listening' && (
          <>
            <div style={{ fontSize: 13, color: 'var(--mm-muted)' }}>What did you hear?</div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={playWord}
                aria-label="Play the word"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid var(--mm-accent)',
                  background: 'transparent',
                  color: 'var(--mm-accent)',
                  cursor: 'pointer',
                }}
              >
                <Icon name="sound" size={34} />
              </button>
            </div>
            {/* Every audio-only prompt has a visual fallback for hearing-impaired learners. */}
            {!tts.available && (
              <p style={{ marginTop: 18, fontSize: 13, textAlign: 'center', color: 'var(--mm-muted)' }}>
                Audio is unavailable here. The word is <span style={{ fontFamily: MM_ZH, fontSize: 19 }}>{w.zh}</span>.
              </p>
            )}
          </>
        )}

        {/* ── Back ── */}
        {revealed && (
          <div className="mm-fade-up" style={{ marginTop: 22 }}>
            <Divider margin="0 0 14px" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: MM_ZH, fontSize: 30 }}>{w.zh}</span>
              <span style={{ fontFamily: MM_PY, fontSize: 15, color: 'var(--mm-muted)' }}>{w.py}</span>
              <button
                onClick={playWord}
                aria-label="Play"
                style={{ background: 'none', border: 0, color: 'var(--mm-accent)', cursor: 'pointer', padding: 4 }}
              >
                <Icon name="sound" size={16} />
              </button>
            </div>
            <div style={{ fontSize: 15, marginTop: 6 }}>{w.en}</div>

            {card.facet === 'production' && attempted && (
              <div style={{ fontSize: 13, marginTop: 8, color: 'var(--mm-muted)' }}>
                {normalise(typed) === normalise(w.zh) ? 'That matches.' : `You said ${typed || '—'}.`}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {w.measure && <Chip>measure {w.measure}</Chip>}
              {w.collocation && <Chip>{w.collocation}</Chip>}
              {w.split && <Chip icon="swap">split: {w.split}</Chip>}
            </div>

            <div style={{ marginTop: 14, fontFamily: MM_ZH, fontSize: 19, lineHeight: 1.5 }}>{exampleText(w)}</div>
            <div style={{ fontFamily: MM_PY, fontSize: 12.5, color: 'var(--mm-muted)', marginTop: 4 }}>
              {w.examplePy}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--mm-muted)', marginTop: 4 }}>{w.exampleEn}</div>
            <button
              onClick={play}
              style={{
                marginTop: 10,
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
              Play the sentence
            </button>
          </div>
        )}
      </div>

      {/* ── Action bar ── */}
      <div style={{ padding: '14px 0 20px', flex: 'none' }}>
        {revealed ? (
          <div style={{ display: 'flex', gap: 6 }}>
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => gradeIt(g)}
                style={{
                  flex: 1,
                  minHeight: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  border: `1px solid ${g === 'again' ? 'var(--mm-line)' : 'var(--mm-accent)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  color: g === 'again' ? 'var(--mm-muted)' : 'var(--mm-accent)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {gradeLabel(g)}
                <span
                  className="mm-num"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 10, opacity: 0.8 }}
                >
                  {intervalLabel(nextInterval(card, g))}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <Btn
            onClick={() => {
              if (card.facet === 'production') setAttempted(true);
              setRevealed(true);
            }}
          >
            Show
          </Btn>
        )}
      </div>
    </Screen>
  );
}

/** The example split around the target word, so it can be highlighted or blanked. */
function splitExample(example: string): [string, string] {
  const open = example.indexOf('{');
  const close = example.indexOf('}');
  if (open === -1 || close === -1) return [example, ''];
  return [example.slice(0, open), example.slice(close + 1)];
}
