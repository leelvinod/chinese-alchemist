/* Mandarin Mitra — Sentence Forge drills, SF-03 to SF-09.
   All six share one layout (top bar, prompt zone, work zone, helper row, action
   bar) so the learner can move between ladder steps without re-learning the UI.
   Grading and feedback are the same for all of them: attempt, self-correct,
   model answer. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Btn, Chip, HelperRow, Screen, TopBar } from '../design/ui';
import { SentenceLine, SkeletonStrip } from '../design/Sentence';
import type { SentenceChunk } from '../design/Sentence';
import { MM_PY, MM_SLOT, MM_ZH, slotColor } from '../design/slots';
import type { Ui } from '../design/slots';
import { DRILL_INSTRUCTION, DRILL_LABEL, blankIndex } from '../content/types';
import type { DrillItem, Pattern, Sentence } from '../content/types';
import { connectorGuard, grade, normalise } from '../engine/grader';
import type { GradeResult } from '../engine/grader';
import { createTts } from '../engine/speech';
import { Feedback } from './Feedback';
import type { FeedbackPhase } from './Feedback';
import { MicButton } from './MicButton';
import { useOnline } from '../state/useUi';

export interface DrillOutcome {
  pass: boolean;
  firstTry: boolean;
  answer: string;
  codes: GradeResult['diagnoses'][number]['code'][];
  spoken: boolean;
  /** True when the answer went into the offline queue instead of being graded. */
  queued: boolean;
}

interface Props {
  ui: Ui;
  pattern: Pattern;
  drill: DrillItem;
  progress: number;
  title?: string;
  /** Voice answers left today; 0 turns speaking drills into typed ones. */
  voiceLeft: number;
  /** False when the learner declined the mic — speaking drills become typed ones. */
  micAllowed: boolean;
  ttsRate: number;
  onClose: () => void;
  onDone: (o: DrillOutcome) => void;
  onCapReached?: () => void;
}

/** Tiles for the reorder drill, shuffled but never in the right order. */
function shuffled(chunks: SentenceChunk[], extra: SentenceChunk[] = []): SentenceChunk[] {
  const all = [...chunks, ...extra];
  if (all.length < 2) return all;
  const key = all.map((c) => c.zh).join('');
  // Deterministic per drill, so re-rendering does not reshuffle under the thumb.
  let seed = 0;
  for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) % 100_003;
  const out = [...all];
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2_147_483_648;
    const j = seed % (i + 1);
    const a = out[i];
    const b = out[j];
    if (a && b) {
      out[i] = b;
      out[j] = a;
    }
  }
  const same = out.map((c) => c.zh).join('') === chunks.map((c) => c.zh).join('');
  if (same && out.length > 1) {
    const first = out[0];
    const last = out[out.length - 1];
    if (first && last) {
      out[0] = last;
      out[out.length - 1] = first;
    }
  }
  return out;
}

export function Drill({
  ui,
  pattern,
  drill,
  progress,
  title,
  voiceLeft,
  micAllowed,
  ttsRate,
  onClose,
  onDone,
  onCapReached,
}: Props) {
  const online = useOnline();
  const tts = useMemo(() => createTts(), []);
  const target = drill.target;

  const [phase, setPhase] = useState<FeedbackPhase | 'input'>('input');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [firstAttempt, setFirstAttempt] = useState<SentenceChunk[] | null>(null);
  const [hint, setHint] = useState(false);
  const [hindiOpen, setHindiOpen] = useState(false);

  // Reorder / fill state
  const pool = useMemo(() => shuffled(target.chunks, drill.distractors ?? []), [target, drill.distractors]);
  const [placed, setPlaced] = useState<string[]>([]);
  // Typed / spoken state
  const [text, setText] = useState('');
  const [useKeyboard, setUseKeyboard] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  const spokenDrill = drill.kind === 'sayit';
  const voiceBlocked = spokenDrill && voiceLeft <= 0;
  // Speaking is off when the learner declined the mic, when the free voice cap is
  // spent, or when they asked for the keyboard. Every one of those falls back to
  // typing rather than leaving the drill unanswerable.
  const typing = !spokenDrill || useKeyboard || voiceBlocked || !micAllowed;

  const answerText =
    drill.kind === 'reorder'
      ? placed.join('')
      : drill.kind === 'fill'
        ? buildFilled(target, drill, text)
        : text;

  const guard = connectorGuard(answerText);
  const ready = drill.kind === 'reorder' ? placed.length === target.chunks.length : normalise(answerText).length > 0;

  const check = () => {
    setPhase('grading');
    const loose = drill.kind === 'build' || drill.kind === 'sayit' || drill.kind === 'join';

    // Graded production offline is queued, and the next drill continues.
    if (!online && (loose || drill.kind === 'translate')) {
      timer.current = window.setTimeout(() => setPhase('queued'), 500);
      return;
    }

    timer.current = window.setTimeout(() => {
      const r = grade(answerText, target, { loose });
      setResult(r);
      if (attempt === 0) setFirstAttempt(r.attemptChunks);

      if (r.verdict === 'correct') setPhase('correct');
      else if (r.verdict === 'minor') setPhase('minor');
      else if (attempt === 0) {
        setAttempt(1);
        setPhase('self');
      } else setPhase('model');
    }, 900);
  };

  const finish = (queued = false) => {
    const pass = queued ? true : (result?.pass ?? false);
    onDone({
      pass,
      firstTry: attempt === 0 && pass,
      answer: answerText,
      codes: result?.diagnoses.map((d) => d.code) ?? [],
      spoken: spokenDrill && !typing,
      queued,
    });
  };

  const retry = () => {
    setPhase('input');
    // Take back only the flagged chunk, so the learner fixes rather than rebuilds.
    const flagged = result?.diagnoses[0]?.chunk;
    if (drill.kind === 'reorder' && flagged) setPlaced((p) => p.filter((z) => z !== flagged));
  };

  const playTarget = () => tts.speak(target.zh, { rate: ttsRate });

  const sheetPhase: FeedbackPhase | null = phase === 'input' ? null : phase;

  return (
    <Screen>
      <TopBar onClose={onClose} progress={progress} title={title ?? DRILL_LABEL[drill.kind]} />

      {!online && (
        <div style={{ marginBottom: 8 }}>
          <Chip icon="refresh">Offline — answers are saved and checked later</Chip>
        </div>
      )}

      <div style={{ marginTop: 10, flex: 'none' }}>
        <div style={{ fontSize: 13, color: 'var(--mm-muted)' }}>
          {drill.ask ??
            (spokenDrill && typing ? 'Type this in Chinese.' : DRILL_INSTRUCTION[drill.kind])}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 23,
            fontWeight: 600,
            marginTop: 6,
            lineHeight: 1.25,
          }}
        >
          {drill.kind === 'fill' ? <FillPrompt target={target} drill={drill} ui={ui} /> : target.en}
        </div>
      </div>

      {/* Transform shows the original greyed above the editable field. */}
      {drill.kind === 'transform' && drill.from && (
        <div style={{ marginTop: 14, opacity: 0.45 }}>
          <SentenceLine
            chunks={drill.from.chunks}
            ui={{ ...ui, hindi: 'off' }}
            size={20}
            state="plain"
            showHindi={false}
            justify="flex-start"
          />
        </div>
      )}

      {drill.kind === 'join' && drill.clauses && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {drill.clauses.map((c) => (
            <div
              key={c}
              style={{
                fontFamily: MM_ZH,
                fontSize: 19,
                border: '1px solid var(--mm-line)',
                borderRadius: 'var(--radius-md)',
                padding: '9px 12px',
              }}
            >
              {c}
            </div>
          ))}
        </div>
      )}

      {/* ── Work zone ── */}
      {drill.kind === 'reorder' ? (
        <ReorderWork
          ui={ui}
          pool={pool}
          placed={placed}
          setPlaced={setPlaced}
          locked={phase !== 'input'}
          coloured={phase === 'correct' || phase === 'model' || phase === 'minor'}
          flagged={result?.diagnoses[0]?.chunk}
        />
      ) : spokenDrill && !typing ? (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 200 }}>
          <MicButton
            seconds={8}
            onTranscript={(t) => {
              setText(t);
              // The transcript is the answer; grade it as soon as it lands.
              setPhase('grading');
              timer.current = window.setTimeout(() => {
                const r = grade(t, target, { loose: true });
                setResult(r);
                if (attempt === 0) setFirstAttempt(r.attemptChunks);
                setPhase(r.verdict === 'correct' ? 'correct' : attempt === 0 ? 'self' : 'model');
                if (attempt === 0 && r.verdict !== 'correct') setAttempt(1);
              }, 700);
            }}
            onGiveUp={() => setUseKeyboard(true)}
          />
        </div>
      ) : (
        <TypedWork
          ui={ui}
          value={text}
          onChange={setText}
          chips={drill.kind === 'fill' ? drill.chips : undefined}
          placeholder={drill.kind === 'fill' ? 'Type or pick a word' : 'Type in Chinese (pinyin IME)'}
          guard={guard}
          locked={phase !== 'input'}
        />
      )}

      {voiceBlocked && (
        <div style={{ marginTop: 10 }}>
          <Chip icon="lock" onClick={onCapReached}>
            Today's free speaking is used up — typing for now
          </Chip>
        </div>
      )}

      {spokenDrill && !micAllowed && !voiceBlocked && (
        <div style={{ marginTop: 10 }}>
          <Chip icon="mic">Speaking is off — turn the mic on in Me to say your answers</Chip>
        </div>
      )}

      {hint && (
        <div style={{ marginTop: 16 }}>
          <SkeletonStrip slots={pattern.skeleton} ui={ui} compact />
        </div>
      )}

      {hindiOpen && ui.hindi !== 'off' && (
        <div style={{ marginTop: 14 }}>
          <SentenceLine
            chunks={target.chunks.map((c) => ({ slot: c.slot, zh: '', py: '', roman: c.roman, deva: c.deva }))}
            ui={ui}
            size={18}
            justify="flex-start"
          />
        </div>
      )}

      <HelperRow
        ui={ui}
        onHint={() => setHint(true)}
        hintOn={hint}
        onHindi={() => setHindiOpen((v) => !v)}
        hindiOn={hindiOpen}
        onListen={drill.kind === 'reorder' || drill.kind === 'fill' ? undefined : playTarget}
      />

      <div style={{ padding: '12px 0 20px', display: 'flex', gap: 10, flex: 'none' }}>
        <Btn variant="ghost" style={{ width: 84 }} onClick={() => finish()}>
          Skip
        </Btn>
        <Btn onClick={check} disabled={!ready || phase !== 'input'}>
          Check
        </Btn>
      </div>

      {sheetPhase && (
        <Feedback
          phase={sheetPhase}
          ui={ui}
          pattern={pattern}
          target={target}
          rule={drill.rule}
          result={result}
          firstAttempt={firstAttempt}
          onRetry={retry}
          onNext={() => finish(sheetPhase === 'queued')}
          onAppeal={() => {}}
          onPlay={playTarget}
          onRetryGrading={check}
        />
      )}
    </Screen>
  );
}

/* ── the reorder work zone ─────────────────────────────────────────────── */

function ReorderWork({
  ui,
  pool,
  placed,
  setPlaced,
  locked,
  coloured,
  flagged,
}: {
  ui: Ui;
  pool: SentenceChunk[];
  placed: string[];
  setPlaced: (p: string[] | ((prev: string[]) => string[])) => void;
  locked: boolean;
  coloured: boolean;
  flagged?: string;
}) {
  const byZh = new Map(pool.map((c) => [c.zh, c]));
  const remaining = pool.filter((c) => !placed.includes(c.zh));

  const tile = (c: SentenceChunk, inAnswer: boolean) => {
    const spec = MM_SLOT[c.slot];
    // Tiles take slot colours only after checking, so the colour never gives
    // the answer away.
    const col = coloured ? slotColor(c.slot, ui) : 'var(--mm-ink)';
    const isFlagged = !coloured && flagged === c.zh;
    return (
      <button
        key={`${c.zh}-${inAnswer}`}
        onClick={() =>
          !locked &&
          setPlaced((prev) => (inAnswer ? prev.filter((z) => z !== c.zh) : [...prev, c.zh]))
        }
        style={{
          minHeight: 48,
          padding: '8px 14px',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          border: isFlagged
            ? `1.5px dashed ${slotColor(c.slot, ui)}`
            : `1px solid ${coloured ? col : 'var(--mm-line)'}`,
          borderBottomWidth: coloured ? spec?.bw : undefined,
          borderBottomStyle: coloured ? spec?.bs : undefined,
          borderRadius: 'var(--radius-md)',
          background: inAnswer ? 'transparent' : 'var(--mm-surface)',
          color: col,
          cursor: locked ? 'default' : 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        {ui.pinyin && <span style={{ fontFamily: MM_PY, fontSize: 11.5, color: 'var(--mm-muted)' }}>{c.py}</span>}
        <span style={{ fontFamily: MM_ZH, fontSize: 21, lineHeight: 1.25 }}>{c.zh}</span>
      </button>
    );
  };

  return (
    <>
      <div
        style={{
          marginTop: 20,
          minHeight: 78,
          borderBottom: '1px solid var(--mm-line)',
          paddingBottom: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {placed.length === 0 ? (
          <span style={{ fontSize: 12.5, color: 'var(--mm-muted)' }}>Tap the words below to build the sentence.</span>
        ) : (
          placed.map((z) => {
            const c = byZh.get(z);
            return c ? tile(c, true) : null;
          })
        )}
      </div>
      <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {remaining.map((c) => tile(c, false))}
      </div>
    </>
  );
}

/* ── the typed work zone ───────────────────────────────────────────────── */

function TypedWork({
  ui,
  value,
  onChange,
  chips,
  placeholder,
  guard,
  locked,
}: {
  ui: Ui;
  value: string;
  onChange: (v: string) => void;
  chips?: string[];
  placeholder: string;
  guard: ReturnType<typeof connectorGuard>;
  locked: boolean;
}) {
  const [guardOpen, setGuardOpen] = useState(false);
  return (
    <div style={{ marginTop: 20 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={locked}
        rows={2}
        lang="zh"
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

      {/* The live connector guard: a dotted placeholder for the missing half. */}
      {guard && (
        <button
          onClick={() => setGuardOpen((v) => !v)}
          style={{
            marginTop: 9,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 36,
            padding: '0 11px',
            border: '1.5px dashed var(--mm-accent)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--mm-accent)',
            fontFamily: MM_ZH,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          {guard.label}
        </button>
      )}
      {guard && guardOpen && (
        <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.6, color: 'var(--mm-muted)' }}>
          {guard.first} pairs with {guard.label.replace(/[…?]/g, '')}.
          {ui.hindi !== 'off' && ` In Hindi: ${guard.hindi}.`}
        </div>
      )}

      {chips && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              disabled={locked}
              style={{
                minHeight: 48,
                padding: '8px 14px',
                fontFamily: MM_ZH,
                fontSize: 20,
                border: `1px solid ${value === c ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
                borderRadius: 'var(--radius-md)',
                background: value === c ? 'color-mix(in srgb, var(--mm-accent) 10%, transparent)' : 'var(--mm-surface)',
                color: 'var(--mm-ink)',
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── fill-the-slot helpers ─────────────────────────────────────────────── */

/** The prompt line with the blanked slot drawn as an outlined gap. */
function FillPrompt({ target, drill, ui }: { target: Sentence; drill: DrillItem; ui: Ui }) {
  const idx = blankIndex(drill);
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      {target.chunks.map((c, i) =>
        i === idx ? (
          <span
            key={i}
            aria-label={`missing ${MM_SLOT[c.slot]?.label}`}
            style={{
              display: 'inline-block',
              minWidth: 54,
              height: 34,
              borderRadius: 'var(--radius-md)',
              border: `1.5px dashed ${slotColor(c.slot, ui)}`,
            }}
          />
        ) : (
          <span key={i} style={{ fontFamily: MM_ZH, fontSize: 24 }}>
            {c.zh}
          </span>
        ),
      )}
      <span style={{ fontSize: 14, color: 'var(--mm-muted)', fontFamily: 'var(--font-body)' }}>({target.en})</span>
    </span>
  );
}

/** Splice the learner's word into the blank so the whole sentence can be graded. */
function buildFilled(target: Sentence, drill: DrillItem, typed: string): string {
  const idx = blankIndex(drill);
  if (idx === -1) return typed;
  return target.chunks.map((c, i) => (i === idx ? typed : c.zh)).join('');
}
