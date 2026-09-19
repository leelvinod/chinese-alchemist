/* Mandarin Mitra — the 3-minute session, SS-01 to SS-02.
   Intro, one drill at the learner's ladder step, one spoken sentence on the same
   pattern, up to 8 reviews, then the result. The planner picks the step; the
   learner just presses Start. */

import { useMemo, useState } from 'react';
import { Btn, Divider, Kicker, MasteryStepper, Screen, Toast, TopBar, TransferCard } from '../design/ui';
import { SentenceLine, SkeletonStrip } from '../design/Sentence';
import type { Ui } from '../design/slots';
import { useStore } from '../state/store';
import { planSession } from '../engine/planner';
import { advance, initialLadder } from '../engine/ladder';
import { dueCards } from '../engine/srs';
import { LADDER_LABELS } from '../design/ui';
import { Drill } from './Drill';
import type { DrillOutcome } from './Drill';
import { ReviewRunner } from './Review';
import { countErrors } from './Today';
import type { ErrorCode } from '../engine/errors';

type Stage = 'intro' | 'drill' | 'spoken' | 'reviews' | 'complete';

export function Session({ ui, onClose, onPaywall }: { ui: Ui; onClose: () => void; onPaywall: () => void }) {
  const { state, dispatch, voiceLeft } = useStore();
  const [stage, setStage] = useState<Stage>('intro');
  const [toast, setToast] = useState<string | null>(null);
  const [tally, setTally] = useState({ done: 0, firstTry: 0, reviews: 0 });

  const plan = useMemo(
    () =>
      planSession(
        {
          hsk: state.hsk,
          ladders: state.progress.ladders,
          errorCounts: countErrors(state.progress.attempts) as Partial<Record<ErrorCode, number>>,
          recentPatternIds: state.progress.sessions.slice(-2).map((s) => s.patternId),
        },
        state.settings.sessionLength === 3 ? 8 : state.settings.sessionLength === 5 ? 14 : 25,
      ),
    // The plan is fixed for the length of the session: re-planning mid-session
    // would move the goalposts under the learner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const pattern = plan.pattern;
  const ladderBefore = state.progress.ladders[pattern.id] ?? initialLadder();
  const drill = plan.drill;
  const spoken = plan.spoken;
  const reviews = useMemo(
    () => dueCards(state.progress.cards, Math.min(plan.reviewCap, state.settings.reviewCap)),
    // Same reason: the review queue is drawn once, at the start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const record = (o: DrillOutcome, spokenStep: boolean) => {
    dispatch({
      type: 'logAttempt',
      patternId: pattern.id,
      drillId: spokenStep ? (spoken?.id ?? drill.id) : drill.id,
      answer: o.answer,
      correction: spokenStep ? (spoken?.target.zh ?? '') : drill.target.zh,
      firstTry: o.firstTry,
      pass: o.pass,
      codes: o.codes,
      spoken: o.spoken,
    });
    setTally((t) => ({ ...t, done: t.done + 1, firstTry: t.firstTry + (o.firstTry ? 1 : 0) }));

    // The ladder toast is subtle and only ever shown for a promotion.
    const move = advance(ladderBefore, o.firstTry);
    if (move.moved === 'up' && !spokenStep) {
      setToast(`Next step unlocked: ${labelFor(move.next.step)}`);
      window.setTimeout(() => setToast(null), 2600);
    }
  };

  if (stage === 'intro') {
    const example = pattern.examples[0];
    return (
      <Screen>
        <TopBar onClose={onClose} progress={0.08} title={pattern.name} />
        <div style={{ marginTop: 28 }}>
          <Kicker>Today's pattern</Kicker>
          <h2 style={{ fontSize: 31, fontWeight: 400, margin: '8px 0 12px', lineHeight: 1.15 }}>{pattern.name}</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.65 }}>{pattern.rule}</p>
        </div>
        <div style={{ marginTop: 26 }}>
          <SkeletonStrip slots={pattern.skeleton} ui={ui} />
        </div>
        <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1px solid var(--mm-line)' }}>
          {example && <SentenceLine chunks={example.chunks} ui={ui} size={28} gap={9} justify="flex-start" />}
        </div>
        {ui.hindi !== 'off' && pattern.transfer && (
          <TransferCard ui={ui} positive={pattern.transfer.positive}>
            {pattern.transfer.text}
          </TransferCard>
        )}
        <div style={{ marginTop: 'auto', padding: '16px 0 20px' }}>
          <Btn onClick={() => setStage('drill')}>Begin</Btn>
        </div>
      </Screen>
    );
  }

  if (stage === 'drill') {
    return (
      <>
        <Drill
          key={drill.id}
          ui={ui}
          pattern={pattern}
          drill={drill}
          progress={0.35}
          title={`${labelFor(ladderBefore.step)} · 1 of 2`}
          voiceLeft={voiceLeft}
          micAllowed={state.settings.micAllowed}
          ttsRate={state.settings.ttsRate}
          onClose={onClose}
          onCapReached={onPaywall}
          onDone={(o) => {
            record(o, false);
            setStage(spoken ? 'spoken' : reviews.length > 0 ? 'reviews' : 'complete');
          }}
        />
        {toast && <Toast>{toast}</Toast>}
      </>
    );
  }

  if (stage === 'spoken' && spoken) {
    return (
      <Drill
        key={spoken.id}
        ui={ui}
        pattern={pattern}
        drill={spoken}
        progress={0.7}
        title="Say it · 2 of 2"
        voiceLeft={voiceLeft}
        micAllowed={state.settings.micAllowed}
        ttsRate={state.settings.ttsRate}
        onClose={onClose}
        onCapReached={onPaywall}
        onDone={(o) => {
          record(o, true);
          setStage(reviews.length > 0 ? 'reviews' : 'complete');
        }}
      />
    );
  }

  if (stage === 'reviews') {
    return (
      <ReviewRunner
        cards={reviews}
        progress={0.85}
        onClose={onClose}
        onDone={(n) => {
          setTally((t) => ({ ...t, reviews: n }));
          setStage('complete');
        }}
      />
    );
  }

  return (
    <Complete
      patternName={pattern.name}
      tally={tally}
      before={ladderBefore.step}
      after={(state.progress.ladders[pattern.id] ?? ladderBefore).step}
      mastery={(state.progress.ladders[pattern.id] ?? ladderBefore).mastery}
      streak={state.progress.streak}
      onDone={() => {
        dispatch({
          type: 'finishSession',
          patternId: pattern.id,
          drillsDone: tally.done,
          firstTryCorrect: tally.firstTry,
          reviewsDone: tally.reviews,
        });
        onClose();
      }}
      onMore={() => {
        dispatch({
          type: 'finishSession',
          patternId: pattern.id,
          drillsDone: tally.done,
          firstTryCorrect: tally.firstTry,
          reviewsDone: tally.reviews,
        });
        setStage('drill');
        setTally({ done: 0, firstTry: 0, reviews: 0 });
      }}
    />
  );
}

const labelFor = (step: number) => LADDER_LABELS[Math.min(step, LADDER_LABELS.length - 1)] ?? 'Introduced';

/* ── SS-02 Session complete ─────────────────────────────────────────────── */

function Complete({
  patternName,
  tally,
  before,
  after,
  mastery,
  streak,
  onDone,
  onMore,
}: {
  patternName: string;
  tally: { done: number; firstTry: number; reviews: number };
  before: number;
  after: number;
  mastery: number;
  streak: number;
  onDone: () => void;
  onMore: () => void;
}) {
  return (
    <Screen>
      <TopBar onClose={onDone} progress={1} title="Done" />
      <div style={{ marginTop: 30 }}>
        <Kicker>Session complete</Kicker>
        <h2 style={{ fontSize: 29, fontWeight: 400, margin: '10px 0 0', lineHeight: 1.2 }}>
          {patternName}: {tally.firstTry} of {tally.done} correct on the first try.
        </h2>
      </div>

      <div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid var(--mm-line)' }}>
        {after !== before && (
          <div style={{ fontSize: 12, color: 'var(--mm-muted)', marginBottom: 10 }}>
            {after > before ? 'Moved up' : 'Eased off'}: {labelFor(before)} → {labelFor(after)}
          </div>
        )}
        <MasteryStepper at={mastery} />
      </div>

      {tally.reviews > 0 && (
        <>
          <Divider margin="20px 0 14px" />
          <div className="mm-num" style={{ fontSize: 13.5 }}>
            {tally.reviews} words reviewed.
          </div>
        </>
      )}

      <div
        className="mm-num"
        style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--mm-line)', fontSize: 13.5 }}
      >
        Streak: {streak} {streak === 1 ? 'day' : 'days'}. One sentence a day keeps it.
      </div>

      <div style={{ marginTop: 'auto', padding: '16px 0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn onClick={onDone}>Done</Btn>
        <Btn variant="secondary" onClick={onMore}>
          Keep going · 5 min
        </Btn>
      </div>
    </Screen>
  );
}
