/* Mandarin Mitra — the Hindi bridge, BR-01 to BR-03.
   Hindi sits below the Chinese, secondary in weight, and disappears entirely when
   the learner picks English only. */

import { useMemo, useState } from 'react';
import { Btn, Divider, Kicker, Screen, TopBar, TransferCard } from '../design/ui';
import { Icon } from '../design/Icon';
import { SentenceLine } from '../design/Sentence';
import { MM_DV, MM_PY, MM_ZH, slotColor } from '../design/slots';
import type { Ui } from '../design/slots';
import { MINI_MODULES, PINYIN_FINALS, PINYIN_INITIALS, PRIMER_BANNER } from '../content/bridge';
import type { MiniModule } from '../content/bridge';
import type { PinyinCell } from '../content/types';
import { PATTERNS } from '../content/patterns';
import { createTts } from '../engine/speech';
import { grade, normalise } from '../engine/grader';
import { useStore } from '../state/store';

/* ── BR-01 "Think it in Hindi" composer ─────────────────────────────────── */

type ComposerStep = 'hindi' | 'chunks' | 'result';

export function HindiComposer({ ui, onClose }: { ui: Ui; onClose: () => void }) {
  const { state } = useStore();
  const tts = useMemo(() => createTts(), []);
  // Composer drills come from patterns that have a positive transfer rule: those
  // are the ones where thinking in Hindi actually helps.
  const pattern = useMemo(
    () => PATTERNS.filter((p) => p.transfer?.positive && p.hsk <= state.hsk)[0] ?? PATTERNS[0],
    [state.hsk],
  );
  const target = pattern?.examples[0];

  const [step, setStep] = useState<ComposerStep>('hindi');
  const [hindi, setHindi] = useState('');
  const [filled, setFilled] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [splitFailed, setSplitFailed] = useState(false);

  if (!pattern || !target) return null;

  const chunks = target.chunks;
  const answer = filled.join('');
  const result = step === 'result' ? grade(answer, target) : null;

  /** The split is what turns the learner's Hindi into coloured chunks. With no
   *  parser behind it, we can only align when the Hindi they typed carries the
   *  words we know; otherwise we say so and fall back to Build freely. */
  const trySplit = () => {
    const h = hindi.toLowerCase();
    const known = chunks.filter((c) => {
      const roman = c.roman?.toLowerCase();
      const deva = c.deva;
      return (roman && h.includes(roman.split(' ')[0] ?? roman)) || (deva && hindi.includes(deva));
    });
    if (known.length < 2) {
      setSplitFailed(true);
      return;
    }
    setStep('chunks');
  };

  if (splitFailed) {
    return (
      <Screen>
        <TopBar onClose={onClose} title="Think it in Hindi" />
        <div style={{ marginTop: 26 }}>
          <Kicker>Let's do it in Chinese directly</Kicker>
          <h2 style={{ fontSize: 25, fontWeight: 400, margin: '8px 0 10px', lineHeight: 1.25 }}>
            We couldn't line that Hindi up.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--mm-muted)', lineHeight: 1.6 }}>
            No matter — build the Chinese sentence straight from the English.
          </p>
        </div>
        <div style={{ marginTop: 22, fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600 }}>
          {target.en}
        </div>
        <div style={{ marginTop: 16 }}>
          <textarea
            value={filled.join('')}
            onChange={(e) => setFilled([e.target.value])}
            rows={2}
            lang="zh"
            placeholder="Type in Chinese"
            style={taStyle}
          />
        </div>
        <div style={{ marginTop: 'auto', padding: '16px 0 20px' }}>
          <Btn disabled={normalise(filled.join('')).length === 0} onClick={() => setStep('result')}>
            Check
          </Btn>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar onClose={onClose} progress={step === 'hindi' ? 0.2 : step === 'chunks' ? 0.6 : 1} title="Think it in Hindi" />

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {['Hindi', 'Chunks', 'Chinese'].map((label, i) => {
          const at = step === 'hindi' ? 0 : step === 'chunks' ? 1 : 2;
          return (
            <span
              key={label}
              style={{
                flex: 1,
                fontSize: 10.5,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: i <= at ? 'var(--mm-accent)' : 'var(--mm-muted)',
                borderTop: `2px solid ${i <= at ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
                paddingTop: 5,
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div style={{ marginTop: 20, fontFamily: 'var(--font-heading)', fontSize: 21, fontWeight: 600, lineHeight: 1.3 }}>
        {target.en}
      </div>

      {step === 'hindi' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--mm-muted)', marginTop: 14 }}>
            Say or type it in Hindi first. Roman or Devanagari, whichever you think in.
          </p>
          <textarea
            value={hindi}
            onChange={(e) => setHindi(e.target.value)}
            rows={2}
            placeholder={ui.hindi === 'deva' ? 'मैं कल ताइपे जाऊँगा' : 'main kal Taipei jaaunga'}
            style={{ ...taStyle, fontFamily: ui.hindi === 'deva' ? MM_DV : MM_PY, fontSize: 18 }}
          />
          <div style={{ marginTop: 'auto', padding: '16px 0 20px' }}>
            <Btn disabled={hindi.trim().length === 0} onClick={trySplit}>
              Split it up
            </Btn>
          </div>
        </>
      )}

      {step === 'chunks' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--mm-muted)', marginTop: 14 }}>
            Your Hindi, in chunks. Fill each Chinese slot below — they are already in Chinese order.
          </p>

          {/* The Hindi chunks, with the active one highlighted. */}
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {chunks.map((c, i) => {
              const col = slotColor(c.slot, ui);
              const on = i === active;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: ui.hindi === 'deva' ? MM_DV : MM_PY,
                    fontSize: 14,
                    lineHeight: 1.8,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px ${on ? 'solid' : 'dashed'} ${col}`,
                    background: on ? `color-mix(in srgb, ${col} 12%, transparent)` : 'transparent',
                    color: on ? col : 'var(--mm-muted)',
                  }}
                >
                  {(ui.hindi === 'deva' ? c.deva : c.roman) ?? '—'}
                </span>
              );
            })}
          </div>

          <Divider margin="18px 0" />

          {/* The Chinese slots, filled one at a time. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {chunks.map((c, i) => {
              const col = slotColor(c.slot, ui);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ color: col, flex: 'none' }}>
                    <Icon name="chevron" size={14} />
                  </span>
                  <input
                    value={filled[i] ?? ''}
                    onFocus={() => setActive(i)}
                    onChange={(e) => {
                      const next = [...filled];
                      next[i] = e.target.value;
                      setFilled(next);
                    }}
                    lang="zh"
                    placeholder={c.py}
                    style={{
                      flex: 1,
                      minHeight: 48,
                      padding: '9px 12px',
                      fontFamily: MM_ZH,
                      fontSize: 20,
                      color: 'var(--mm-ink)',
                      background: 'transparent',
                      border: `1px solid ${i === active ? col : 'var(--mm-line)'}`,
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                  <button
                    onClick={() => {
                      const next = [...filled];
                      next[i] = c.zh;
                      setFilled(next);
                    }}
                    aria-label={`Hint for ${c.py}`}
                    style={{ background: 'none', border: 0, color: 'var(--mm-muted)', cursor: 'pointer', padding: 6 }}
                  >
                    <Icon name="lightbulb" size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', padding: '16px 0 20px' }}>
            <Btn disabled={normalise(filled.join('')).length === 0} onClick={() => setStep('result')}>
              Check
            </Btn>
          </div>
        </>
      )}

      {step === 'result' && result && (
        <>
          <div style={{ marginTop: 20 }}>
            <Kicker color={result.pass ? 'var(--fb-correct)' : 'var(--fb-minor)'}>
              {result.pass ? 'Nice.' : result.diagnoses[0]?.prompt}
            </Kicker>
          </div>
          <div style={{ marginTop: 18 }}>
            <SentenceLine chunks={chunks} ui={ui} size={25} justify="flex-start" />
          </div>
          <button
            onClick={() => tts.speak(target.zh, { rate: state.settings.ttsRate })}
            style={{
              marginTop: 14,
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
              alignSelf: 'flex-start',
            }}
          >
            <Icon name="sound" size={14} />
            Play
          </button>
          {ui.hindi !== 'off' && pattern.transfer && (
            <TransferCard ui={ui} positive={pattern.transfer.positive}>
              {pattern.transfer.text}
            </TransferCard>
          )}
          <div style={{ marginTop: 'auto', padding: '16px 0 20px' }}>
            <Btn onClick={onClose}>Got it</Btn>
          </div>
        </>
      )}
    </Screen>
  );
}

const taStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 62,
  marginTop: 14,
  padding: '12px 13px',
  fontFamily: MM_ZH,
  fontSize: 21,
  lineHeight: 1.4,
  color: 'var(--mm-ink)',
  background: 'transparent',
  border: '1px solid var(--mm-line)',
  borderRadius: 'var(--radius-md)',
  resize: 'none',
};

/* ── BR-02 Indic pinyin primer ──────────────────────────────────────────── */

export function PinyinPrimer({ onClose, onPractise }: { onClose: () => void; onPractise: () => void }) {
  const { state } = useStore();
  const tts = useMemo(() => createTts(), []);
  const [open, setOpen] = useState<PinyinCell | null>(null);

  const grid = (cells: PinyinCell[], title: string) => (
    <div style={{ marginTop: 20 }}>
      <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
        {cells.map((c) => (
          <button
            key={c.py}
            onClick={() => {
              setOpen(c);
              tts.speak(c.py, { rate: state.settings.ttsRate });
            }}
            style={{
              minHeight: 62,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${c.accuracy === 'x' ? 'var(--fb-minor)' : 'var(--mm-line)'}`,
              background: 'var(--mm-surface)',
              color: 'var(--mm-ink)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <span style={{ fontFamily: MM_PY, fontSize: 17 }}>{c.py}</span>
            <span style={{ fontFamily: MM_DV, fontSize: 13, color: 'var(--mm-muted)', lineHeight: 1.7 }}>
              {c.deva ?? (c.accuracy === 'x' ? 'no match' : '—')}
            </span>
            {c.accuracy && (
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 5,
                  fontSize: 10,
                  color: c.accuracy === 'x' ? 'var(--fb-minor)' : 'var(--mm-muted)',
                }}
              >
                {c.accuracy === 'x' ? '✕' : '≈'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Screen>
      <TopBar onClose={onClose} title="Pinyin primer" />

      <div
        style={{
          marginTop: 10,
          border: '1px solid var(--mm-accent)',
          borderRadius: 'var(--radius-md)',
          padding: '11px 13px',
          fontSize: 13,
          lineHeight: 1.6,
          background: 'color-mix(in srgb, var(--mm-accent) 7%, transparent)',
        }}
      >
        {PRIMER_BANNER}
      </div>

      {grid(PINYIN_INITIALS, 'Initials')}
      {grid(PINYIN_FINALS, 'Finals')}

      <div style={{ marginTop: 22, paddingBottom: 20 }}>
        <Btn variant="secondary" onClick={onPractise}>
          Practise these in minimal pairs
        </Btn>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--mm-surface)',
            borderTop: '2px solid var(--mm-accent)',
            borderRadius: '12px 12px 0 0',
            padding: '16px 18px 22px',
            boxShadow: '0 -12px 32px rgba(0,0,0,.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: MM_PY, fontSize: 30 }}>{open.py}</span>
            {open.deva && <span style={{ fontFamily: MM_DV, fontSize: 22, lineHeight: 1.9 }}>{open.deva}</span>}
            <button
              onClick={() => tts.speak(open.py, { rate: state.settings.ttsRate })}
              aria-label="Play"
              style={{ marginLeft: 'auto', background: 'none', border: 0, color: 'var(--mm-accent)', cursor: 'pointer' }}
            >
              <Icon name="sound" size={20} />
            </button>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 10, color: 'var(--mm-muted)' }}>
            {open.note ??
              (open.accuracy === ''
                ? 'Close enough to the Hindi letter to use directly.'
                : 'Near the Hindi letter, but listen for the difference.')}
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 9 }}>
            <Btn variant="secondary" onClick={() => setOpen(null)}>
              Close
            </Btn>
            <Btn onClick={onPractise}>Practise</Btn>
          </div>
        </div>
      )}
    </Screen>
  );
}

/* ── BR-03 Mini-modules ─────────────────────────────────────────────────── */

export function MiniModules({ ui, onClose }: { ui: Ui; onClose: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const mod = MINI_MODULES.find((m) => m.id === openId);

  if (mod) return <ModuleDetail ui={ui} mod={mod} onClose={() => setOpenId(null)} />;

  return (
    <Screen>
      <TopBar onClose={onClose} title="Hindi bridge" />
      <div style={{ marginTop: 18 }}>
        <Kicker>Mini-modules</Kicker>
        <h2 style={{ fontSize: 25, fontWeight: 400, margin: '8px 0 6px' }}>Where Hindi does the heavy lifting</h2>
        <p style={{ fontSize: 13.5, color: 'var(--mm-muted)', lineHeight: 1.6 }}>
          Ten to fifteen items each. Short enough for a bus ride.
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        {MINI_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setOpenId(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              textAlign: 'left',
              minHeight: 68,
              padding: '13px 14px',
              marginBottom: 10,
              border: '1px solid var(--mm-line)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--mm-ink)',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: 'var(--mm-accent)' }}>
              <Icon name={m.kind === 'tree' ? 'tree' : 'book'} size={19} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16 }}>{m.name}</span>
              <span className="mm-num" style={{ display: 'block', fontSize: 12, color: 'var(--mm-muted)' }}>
                {m.items.length} items
              </span>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        ))}
      </div>
      <div style={{ height: 20 }} />
    </Screen>
  );
}

function ModuleDetail({ ui, mod, onClose }: { ui: Ui; mod: MiniModule; onClose: () => void }) {
  const { state } = useStore();
  const tts = useMemo(() => createTts(), []);
  const hindiOf = (i: MiniModule['items'][number]) => (ui.hindi === 'roman' ? i.hindi : i.hindiDeva);

  return (
    <Screen>
      <TopBar onClose={onClose} closeIcon="chevronLeft" title={mod.name} />
      <div style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 25, fontWeight: 400, marginBottom: 8 }}>{mod.name}</h2>
        <p style={{ fontSize: 13.5, color: 'var(--mm-muted)', lineHeight: 1.6 }}>{mod.blurb}</p>
      </div>

      {/* Kinship is drawn as a tree, because the whole point is that the words
          are positions on it: which side, which generation, older or younger. A
          list would lose exactly the thing Hindi and Chinese share. */}
      {mod.kind === 'tree' ? (
        <KinshipTree mod={mod} ui={ui} onPlay={(zh) => tts.speak(zh, { rate: state.settings.ttsRate })} />
      ) : (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mod.items.map((it) => (
            <div
              key={it.zh}
              style={{ border: '1px solid var(--mm-line)', borderRadius: 'var(--radius-md)', padding: '11px 13px' }}
            >
              <Pair item={it} hindi={hindiOf(it)} ui={ui} onPlay={() => tts.speak(it.zh, { rate: state.settings.ttsRate })} />
              {it.note && (
                <p style={{ fontSize: 12, color: 'var(--mm-muted)', marginTop: 8, lineHeight: 1.55 }}>{it.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 24 }} />
    </Screen>
  );
}

function Pair({
  item,
  hindi,
  ui,
  onPlay,
}: {
  item: MiniModule['items'][number];
  hindi: string;
  ui: Ui;
  onPlay: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: MM_ZH, fontSize: 21 }}>{item.zh}</span>
          <span style={{ fontFamily: MM_PY, fontSize: 12.5, color: 'var(--mm-muted)' }}>{item.py}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
          {ui.hindi !== 'off' && (
            <span
              style={{
                fontFamily: ui.hindi === 'roman' ? MM_PY : MM_DV,
                fontSize: 13,
                lineHeight: 1.8,
                color: 'var(--mm-muted)',
              }}
            >
              {hindi}
            </span>
          )}
          <span style={{ fontSize: 11.5, color: 'var(--mm-muted)', opacity: 0.8 }}>{item.en}</span>
        </span>
      </span>
      <button
        onClick={onPlay}
        aria-label={`Play ${item.zh}`}
        style={{ background: 'none', border: 0, color: 'var(--mm-accent)', cursor: 'pointer', padding: 7, flex: 'none' }}
      >
        <Icon name="sound" size={16} />
      </button>
    </div>
  );
}

/* ── the kinship tree ───────────────────────────────────────────────────── */

const SPINE = '1px solid var(--mm-line)';

function KinshipTree({
  mod,
  ui,
  onPlay,
}: {
  mod: MiniModule;
  ui: Ui;
  onPlay: (zh: string) => void;
}) {
  const find = (zh: string) => mod.items.find((it) => it.zh === zh);
  const hindiOf = (it: MiniModule['items'][number]) => (ui.hindi === 'roman' ? it.hindi : it.hindiDeva);

  const Node = ({ zh, highlight }: { zh: string; highlight?: boolean }) => {
    const it = find(zh);
    if (!it) return null;
    return (
      <button
        onClick={() => onPlay(it.zh)}
        aria-label={`${it.zh}, ${it.py}, ${it.en}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1,
          width: '100%',
          minHeight: 48,
          padding: '6px 8px',
          border: `1px solid ${highlight ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
          borderRadius: 'var(--radius-md)',
          background: highlight ? 'color-mix(in srgb, var(--mm-accent) 8%, transparent)' : 'var(--mm-surface)',
          color: 'var(--mm-ink)',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: MM_ZH, fontSize: 17, lineHeight: 1.25 }}>{it.zh}</span>
          <span style={{ fontFamily: MM_PY, fontSize: 10.5, color: 'var(--mm-muted)' }}>{it.py}</span>
        </span>
        {ui.hindi !== 'off' && (
          <span
            style={{
              fontFamily: ui.hindi === 'roman' ? MM_PY : MM_DV,
              fontSize: 11,
              lineHeight: 1.7,
              color: 'var(--mm-muted)',
            }}
          >
            {hindiOf(it)}
          </span>
        )}
      </button>
    );
  };

  /** A generation band: the label on a rule, then one stack per side. */
  const Band = ({
    label,
    left,
    right,
  }: {
    label: string;
    left: string[];
    right: string[];
  }) => (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px' }}>
        <span className="mm-kicker" style={{ color: 'var(--mm-muted)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--mm-line)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 10, borderRight: SPINE }}>
          {left.map((zh) => (
            <Node key={zh} zh={zh} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {right.map((zh) => (
            <Node key={zh} zh={zh} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 18 }}>
      {/* Which side you are counting from is the first question Chinese asks,
          and Hindi asks it too — so it heads the tree. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div className="mm-kicker" style={{ color: 'var(--mm-accent)' }}>
          Mother's side
        </div>
        <div className="mm-kicker" style={{ color: 'var(--mm-accent)' }}>
          Father's side
        </div>
      </div>

      <Band label="Grandparents" left={['外公', '外婆']} right={['爷爷', '奶奶']} />
      <Band label="Their children" left={['妈妈', '舅舅', '姨']} right={['爸爸', '叔叔', '伯伯', '姑姑']} />

      {/* The two spines join above you. */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 0' }}>
        <span style={{ width: '50%', height: 12, borderTop: SPINE, borderLeft: SPINE, borderRight: SPINE, borderRadius: '4px 4px 0 0' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{ width: 1, height: 10, background: 'var(--mm-line)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 8px' }}>
        <span className="mm-kicker" style={{ color: 'var(--mm-muted)', whiteSpace: 'nowrap' }}>
          You and your siblings
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--mm-line)' }} />
      </div>

      {/* Age splits this generation in both languages, so it is an axis, not a list. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Node zh="哥哥" />
        <Node zh="姐姐" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: 'var(--mm-accent)',
            border: '1px solid var(--mm-accent)',
            borderRadius: 20,
            padding: '3px 12px',
          }}
        >
          You
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Node zh="弟弟" />
        <Node zh="妹妹" />
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--mm-muted)', lineHeight: 1.6, marginTop: 14 }}>
        Older above, younger below. Chinese marks the split the way Hindi does —
        {ui.hindi === 'roman' ? ' bade bhai and chhote bhai' : ' बड़े भाई और छोटे भाई'} — where English
        has only "brother".
      </p>
    </div>
  );
}
