/* Mandarin Mitra — TD-01 Today.
   One big button. Everything else on the screen is secondary. */

import { Banner, Btn, Chip, Kicker, Screen } from '../design/ui';
import { Icon } from '../design/Icon';
import { SentenceLine, SkeletonStrip } from '../design/Sentence';
import type { Ui } from '../design/slots';
import { useStore } from '../state/store';
import { dueCards } from '../engine/srs';
import { planSession } from '../engine/planner';
import { useOnline } from '../state/useUi';

export function Today({
  ui,
  onStart,
  onReview,
  onListening,
  onResumePlacement,
}: {
  ui: Ui;
  onStart: () => void;
  onReview: () => void;
  onListening: () => void;
  onResumePlacement: () => void;
}) {
  const { state, dispatch, storageWorks } = useStore();
  const online = useOnline();
  const p = state.progress;

  const plan = planSession({
    hsk: state.hsk,
    ladders: p.ladders,
    errorCounts: countErrors(p.attempts),
    recentPatternIds: p.sessions.slice(-2).map((s) => s.patternId),
  });

  const due = dueCards(p.cards, state.settings.reviewCap).length;
  const today = new Date().toISOString().slice(0, 10);
  const doneToday = p.sessions.some((s) => s.date === today);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const dateLine = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen>
      <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 400 }}>
            {greeting}
            {state.name ? `, ${state.name}.` : '.'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--mm-muted)' }}>{dateLine}</div>
        </div>
        {p.streak > 0 && <Chip icon="flame">{p.streak}</Chip>}
      </div>

      {/* Signing in and practising look fine without storage, right up until a
          reload throws it all away — so say it plainly instead. */}
      {!storageWorks && (
        <div style={{ marginTop: 16 }}>
          <Banner icon="lock">
            This browser is blocking saved data, so today's progress will not survive a reload. Turn on
            site data, or leave this tab open.
          </Banner>
        </div>
      )}

      {/* Results that landed while the learner was offline. */}
      {state.checked.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Banner icon="check" onClick={() => dispatch({ type: 'clearChecked' })}>
            Checked while you were away: {state.checked.filter((c) => c.result.pass).length} of{' '}
            {state.checked.length} right
          </Banner>
        </div>
      )}

      {!state.placementDone && !state.placementSkipped && (
        <div style={{ marginTop: 16 }}>
          <Banner icon="chart" onClick={onResumePlacement}>
            Finish your level check (4 min left)
          </Banner>
        </div>
      )}

      <div
        style={{
          marginTop: 22,
          border: '1px solid var(--mm-line)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 16px 16px',
        }}
      >
        <Kicker>{doneToday ? 'Done for today' : `Today's ${state.settings.sessionLength} minutes`}</Kicker>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 29,
            fontWeight: 400,
            lineHeight: 1.15,
            margin: '8px 0 4px',
          }}
        >
          {plan.pattern.name}
        </div>
        <div className="mm-num" style={{ fontSize: 12.5, color: 'var(--mm-muted)' }}>
          1 pattern · 2 sentences · about {state.settings.sessionLength} min
        </div>
        <div style={{ marginTop: 14 }}>
          <Btn onClick={onStart}>{doneToday ? 'One more' : 'Start'}</Btn>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 9 }}>
          Today's focus
        </div>
        <SkeletonStrip slots={plan.pattern.skeleton} ui={ui} compact />
        <div style={{ marginTop: 12 }}>
          {plan.pattern.examples[0] && (
            <SentenceLine
              chunks={plan.pattern.examples[0].chunks}
              ui={ui}
              size={22}
              gap={8}
              justify="flex-start"
              state="plain"
              showHindi={false}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {due > 0 && (
          <Chip icon="refresh" onClick={onReview}>
            {due} words due
          </Chip>
        )}
        <Chip icon="sound" onClick={onListening}>
          Listening · 2 min
        </Chip>
        {!online && (
          <Chip icon="refresh">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="x" size={11} />
              Offline
            </span>
          </Chip>
        )}
      </div>

      <div style={{ height: 24 }} />
    </Screen>
  );
}

export function countErrors(attempts: { codes: string[] }[]): Record<string, number> {
  const out: Record<string, number> = {};
  // The planner cares about the live window, not all history.
  for (const a of attempts.slice(-60)) {
    for (const c of a.codes) out[c] = (out[c] ?? 0) + 1;
  }
  return out;
}
