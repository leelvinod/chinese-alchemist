/* Mandarin Mitra — feedback, FB-01 to FB-03.
   Two steps: first a prompt to self-correct, then the model answer. Both appear
   in a bottom sheet over the drill, so the learner's own sentence stays visible.
   No red, no failure screen: an error is an amber outline plus a question. */

import { useState } from 'react';
import { Btn, Divider, Sheet, SheetTitle, Shimmer, TransferCard } from '../design/ui';
import { Icon } from '../design/Icon';
import { SentenceLine } from '../design/Sentence';
import type { SentenceChunk } from '../design/Sentence';
import { MM_PY, MM_ZH, fbCorrect, fbMinor } from '../design/slots';
import type { Ui } from '../design/slots';
import type { Diagnosis, GradeResult } from '../engine/grader';
import type { Pattern, Sentence } from '../content/types';
import { ERROR_HINDI_NOTE } from '../engine/errors';
import { toneGlyph } from './Listening';

export type FeedbackPhase = 'grading' | 'correct' | 'minor' | 'self' | 'model' | 'queued' | 'failed';

interface Props {
  phase: FeedbackPhase;
  ui: Ui;
  pattern: Pattern;
  target: Sentence;
  /** The one-line rule for the model-answer card, from the drill. */
  rule?: string;
  result: GradeResult | null;
  /** The learner's first attempt, kept for the model-answer card. */
  firstAttempt: SentenceChunk[] | null;
  onRetry: () => void;
  onNext: () => void;
  onAppeal: () => void;
  onPlay: () => void;
  onRetryGrading?: () => void;
}

export function Feedback({
  phase,
  ui,
  pattern,
  target,
  rule,
  result,
  firstAttempt,
  onRetry,
  onNext,
  onAppeal,
  onPlay,
  onRetryGrading,
}: Props) {
  const [appealed, setAppealed] = useState(false);
  const [transferOpen, setTransferOpen] = useState(true);
  const diag = result?.diagnoses[0];

  if (phase === 'grading') {
    return (
      <Sheet open accent="var(--mm-line)">
        <SheetTitle>Checking…</SheetTitle>
        <Shimmer />
      </Sheet>
    );
  }

  if (phase === 'queued') {
    return (
      <Sheet open accent="var(--mm-line)">
        <SheetTitle>Saved.</SheetTitle>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--mm-muted)' }}>
          You're offline — we'll check this one when you're back, and show the result on Today.
        </p>
        <div style={{ marginTop: 14 }}>
          <Btn onClick={onNext}>Keep going</Btn>
        </div>
      </Sheet>
    );
  }

  if (phase === 'failed') {
    return (
      <Sheet open accent="var(--mm-line)">
        <SheetTitle>Couldn't check this one.</SheetTitle>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--mm-muted)' }}>
          Nothing counts against you. Try again, or move on.
        </p>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {onRetryGrading && <Btn onClick={onRetryGrading}>Try checking again</Btn>}
          <Btn variant="ghost" onClick={onNext}>
            Skip for now
          </Btn>
        </div>
      </Sheet>
    );
  }

  if (phase === 'correct') {
    return (
      <Sheet open accent={fbCorrect(ui)} labelledBy="fb-title">
        <SheetTitle id="fb-title" color={fbCorrect(ui)}>
          Nice.
        </SheetTitle>
        <SentenceLine chunks={target.chunks} ui={ui} size={26} justify="flex-start" />
        <PlayRow onPlay={onPlay} />
        {target.alsoOk && target.alsoOk.length > 0 && (
          <p style={{ fontSize: 12.5, color: 'var(--mm-muted)', marginTop: 10 }}>
            Also natural: {target.alsoOk[0]}
          </p>
        )}
        <div style={{ marginTop: 14 }}>
          <Btn onClick={onNext}>Got it</Btn>
        </div>
      </Sheet>
    );
  }

  if (phase === 'minor') {
    return (
      <Sheet open accent={fbMinor(ui)} labelledBy="fb-title">
        <SheetTitle id="fb-title" color={fbMinor(ui)}>
          Good — one small thing.
        </SheetTitle>
        <SentenceLine chunks={target.chunks} ui={ui} size={25} justify="flex-start" />
        <p style={{ fontSize: 13.5, margin: '12px 0 0' }}>{result?.minorNote}</p>
        <div style={{ marginTop: 14 }}>
          <Btn onClick={onNext}>Got it</Btn>
        </div>
      </Sheet>
    );
  }

  if (phase === 'self') {
    const flagged = (result?.attemptChunks ?? []).map((c) => ({
      ...c,
      state: diag?.chunk && c.zh === diag.chunk ? ('flagged' as const) : ('plain' as const),
    }));
    return (
      <Sheet open accent={fbMinor(ui)} labelledBy="fb-title">
        <SheetTitle id="fb-title" color={fbMinor(ui)}>
          Almost.
        </SheetTitle>
        <SentenceLine
          chunks={flagged}
          ui={{ ...ui, hindi: 'off' }}
          size={24}
          justify="flex-start"
          showHindi={false}
        />
        <p style={{ fontSize: 14, margin: '14px 0 0' }}>{diag?.prompt}</p>
        {diag?.sound && <SoundNote ui={ui} diag={diag} />}
        <div style={{ marginTop: 14 }}>
          <Btn onClick={onRetry}>Try again</Btn>
        </div>
      </Sheet>
    );
  }

  // FB-02 Model answer
  const attempt = (firstAttempt ?? result?.attemptChunks ?? []).map((c) => ({
    ...c,
    state: diag?.chunk && c.zh === diag.chunk ? ('struck' as const) : ('plain' as const),
  }));
  const hindiNote = diag ? ERROR_HINDI_NOTE[diag.code] : undefined;

  return (
    <Sheet open accent="var(--mm-line)">
      <div className="mm-kicker" style={{ color: 'var(--mm-muted)' }}>
        Your answer
      </div>
      <div style={{ marginTop: 6 }}>
        <SentenceLine
          chunks={attempt}
          ui={{ ...ui, hindi: 'off', pinyin: false }}
          size={20}
          justify="flex-start"
          showHindi={false}
        />
      </div>

      <Divider />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="mm-kicker" style={{ color: 'var(--mm-muted)' }}>
          Model answer
        </div>
        <PlayButton onPlay={onPlay} />
      </div>
      <div style={{ marginTop: 10 }}>
        <SentenceLine chunks={target.chunks} ui={ui} size={26} justify="flex-start" />
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.6, margin: '14px 0 0', color: 'var(--mm-muted)' }}>
        {rule ?? pattern.rule}
      </p>

      {diag?.sound && <SoundNote ui={ui} diag={diag} />}

      {/* At most one transfer card per answer, and it can be dismissed. */}
      {ui.hindi !== 'off' && transferOpen && (hindiNote || pattern.transfer) && (
        <TransferCard
          ui={ui}
          positive={!hindiNote && pattern.transfer?.positive}
          onDismiss={() => setTransferOpen(false)}
        >
          {hindiNote ?? pattern.transfer?.text}
        </TransferCard>
      )}

      <div style={{ marginTop: 14 }}>
        <Btn onClick={onNext}>Got it</Btn>
      </div>
      {appealed ? (
        <p style={{ fontSize: 12.5, color: 'var(--mm-muted)', textAlign: 'center', marginTop: 8 }}>
          Thanks — a teacher will check it.
        </p>
      ) : (
        <div style={{ marginTop: 2 }}>
          <Btn
            variant="ghost"
            onClick={() => {
              setAppealed(true);
              onAppeal();
            }}
          >
            This was right
          </Btn>
        </div>
      )}
    </Sheet>
  );
}

/** Tone and phoneme feedback, kept coarse: one syllable, one contour, no pitch
 *  track. Tones are shape, never a second colour system. */
function SoundNote({ ui, diag }: { ui: Ui; diag: Diagnosis }) {
  const s = diag.sound;
  if (!s) return null;
  const c = fbMinor(ui);
  const toneNote = s.wantTone !== s.gotTone && s.wantPy.slice(0, -1) !== s.gotPy.slice(0, -1);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: `1px solid ${c}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        marginTop: 12,
      }}
    >
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
        <span style={{ fontFamily: MM_PY, fontSize: 22, color: c, lineHeight: 1 }}>
          {toneGlyph(s.wantTone)}
        </span>
        <span style={{ fontSize: 9.5, color: 'var(--mm-muted)', marginTop: 3 }}>wanted</span>
      </span>
      <span style={{ fontSize: 12.5, lineHeight: 1.55, flex: 1 }}>
        <span style={{ fontFamily: MM_ZH, fontSize: 17 }}>{s.wantZh}</span>{' '}
        <span style={{ fontFamily: MM_PY, color: 'var(--mm-muted)' }}>{s.wantPy}</span>
        <span style={{ display: 'block', color: 'var(--mm-muted)', marginTop: 2 }}>
          We heard <span style={{ fontFamily: MM_PY }}>{s.gotPy}</span>
          {toneNote ? '' : ` — tone ${s.gotTone === 5 ? 'neutral' : s.gotTone}, not ${s.wantTone === 5 ? 'neutral' : s.wantTone}`}
          .
        </span>
      </span>
    </div>
  );
}

function PlayButton({ onPlay }: { onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      style={{
        display: 'flex',
        gap: 5,
        alignItems: 'center',
        minHeight: 36,
        background: 'none',
        border: '1px solid var(--mm-line)',
        borderRadius: 20,
        padding: '0 12px',
        color: 'var(--mm-ink)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
      }}
    >
      <Icon name="sound" size={14} />
      Play
    </button>
  );
}

const PlayRow = ({ onPlay }: { onPlay: () => void }) => (
  <div style={{ marginTop: 12 }}>
    <PlayButton onPlay={onPlay} />
  </div>
);
