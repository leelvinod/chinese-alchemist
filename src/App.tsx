/* Mandarin Mitra — the app shell.
   Four bottom tabs; every drill is a full-screen modal that hides them. The
   phone frame only appears on wide screens, so the layout under test is always
   the 360–412 dp portrait one. */

import { useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import { useThemeVars, useUi } from './state/useUi';
import { Icon } from './design/Icon';
import { Onboarding } from './screens/Onboarding';
import { Today } from './screens/Today';
import { Session } from './screens/Session';
import { Review } from './screens/Review';
import { ProgressScreen } from './screens/Progress';
import { Me, Paywall } from './screens/Me';
import { PatternDetail, PatternList, PracticeMenu } from './screens/Practice';
import type { PracticeRoute } from './screens/Practice';
import { MinimalPairs, TonePairs } from './screens/Listening';
import { HindiComposer, MiniModules, PinyinPrimer } from './screens/Bridge';
import { Drill } from './screens/Drill';
import { QuickAnswer } from './screens/QuickAnswer';
import { useReminders } from './state/useReminders';
import { clearQuickAnswerUrl, quickAnswerRequest } from './engine/notify';
import { PATTERN_BY_ID } from './content/patterns';
import { pickDrill } from './engine/planner';
import { initialLadder } from './engine/ladder';
import type { Ui } from './design/slots';
import './design/tokens.css';

type Tab = 'today' | 'practice' | 'progress' | 'me';

type Modal =
  | { kind: 'none' }
  | { kind: 'session' }
  | { kind: 'paywall' }
  | { kind: 'placement' }
  | { kind: 'freeDrill'; patternId: string; step: number }
  | PracticeRoute;

function Shell() {
  const { state, dispatch, voiceLeft } = useStore();
  const ui = useUi();
  const themeVars = useThemeVars(ui);
  const [tab, setTab] = useState<Tab>('today');
  const [modal, setModal] = useState<Modal>({ kind: 'none' });

  // NT-01: a reminder opens the quick-answer overlay, not the home screen. The
  // request is read once and cleared, so a reload does not reopen it.
  const [quick, setQuick] = useState<{ drillId: string | null } | null>(() => {
    if (typeof window === 'undefined') return null;
    const req = quickAnswerRequest(window.location.search);
    if (req) clearQuickAnswerUrl();
    return req;
  });

  useReminders(useCallback((drillId: string | null) => setQuick({ drillId }), []));

  // Anything queued offline is checked on launch too, not only on the online event.
  useEffect(() => {
    if (state.queue.length > 0 && navigator.onLine !== false) dispatch({ type: 'drain' });
  }, [state.queue.length, dispatch]);

  const close = () => setModal({ kind: 'none' });

  if (quick && state.onboarded) {
    return (
      <Frame themeVars={themeVars} ui={ui}>
        <QuickAnswer
          ui={ui}
          drillId={quick.drillId}
          onClose={() => setQuick(null)}
          onOpenApp={(patternId) => {
            setQuick(null);
            setTab('today');
            const ladder = state.progress.ladders[patternId] ?? initialLadder();
            setModal({ kind: 'freeDrill', patternId, step: ladder.step });
          }}
        />
      </Frame>
    );
  }

  if (!state.onboarded || modal.kind === 'placement') {
    return (
      <Frame themeVars={themeVars} ui={ui}>
        <Onboarding ui={ui} />
      </Frame>
    );
  }

  const modalScreen = renderModal(
    modal,
    ui,
    voiceLeft,
    state.settings.micAllowed,
    state.settings.ttsRate,
    close,
    setModal,
  );

  return (
    <Frame themeVars={themeVars} ui={ui}>
      {modalScreen ?? (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            {tab === 'today' && (
              <Today
                ui={ui}
                onStart={() => setModal({ kind: 'session' })}
                onReview={() => setModal({ kind: 'review' })}
                onListening={() => setModal({ kind: 'tones' })}
                onResumePlacement={() => setModal({ kind: 'placement' })}
              />
            )}
            {tab === 'practice' && <PracticeMenu ui={ui} onGo={(r) => setModal(r)} />}
            {tab === 'progress' && (
              <ProgressScreen
                ui={ui}
                onPractise={(patternId) => {
                  const ladder = state.progress.ladders[patternId] ?? initialLadder();
                  setModal({ kind: 'freeDrill', patternId, step: ladder.step });
                }}
              />
            )}
            {tab === 'me' && (
              <Me
                onRetakePlacement={() => setModal({ kind: 'placement' })}
                onPaywall={() => setModal({ kind: 'paywall' })}
                onPrimer={() => setModal({ kind: 'primer' })}
              />
            )}
          </div>
          <TabBar tab={tab} onChange={setTab} />
        </div>
      )}
    </Frame>
  );
}

function renderModal(
  modal: Modal,
  ui: Ui,
  voiceLeft: number,
  micAllowed: boolean,
  ttsRate: number,
  close: () => void,
  setModal: (m: Modal) => void,
) {
  switch (modal.kind) {
    case 'none':
    case 'menu':
    case 'placement':
      return null;
    case 'session':
      return <Session ui={ui} onClose={close} onPaywall={() => setModal({ kind: 'paywall' })} />;
    case 'paywall':
      return <Paywall onClose={close} />;
    case 'review':
      return <Review onClose={close} />;
    case 'tones':
      return <TonePairs onClose={close} />;
    case 'minimalPairs':
      return <MinimalPairs ui={ui} onClose={close} />;
    case 'composer':
      return <HindiComposer ui={ui} onClose={close} />;
    case 'primer':
      return <PinyinPrimer onClose={close} onPractise={() => setModal({ kind: 'minimalPairs' })} />;
    case 'modules':
      return <MiniModules ui={ui} onClose={close} />;
    case 'patterns':
      return <PatternList ui={ui} onClose={close} onOpen={(id) => setModal({ kind: 'pattern', id })} />;
    case 'pattern': {
      const pattern = PATTERN_BY_ID[modal.id];
      if (!pattern) return null;
      return (
        <PatternDetail
          ui={ui}
          pattern={pattern}
          onClose={() => setModal({ kind: 'patterns' })}
          onPractise={(step) => setModal({ kind: 'freeDrill', patternId: pattern.id, step })}
        />
      );
    }
    case 'freeDrill': {
      const pattern = PATTERN_BY_ID[modal.patternId];
      if (!pattern) return null;
      return (
        <FreeDrill
          ui={ui}
          patternId={modal.patternId}
          step={modal.step}
          voiceLeft={voiceLeft}
          micAllowed={micAllowed}
          ttsRate={ttsRate}
          onClose={close}
          onPaywall={() => setModal({ kind: 'paywall' })}
        />
      );
    }
    default:
      return null;
  }
}

/** A single drill picked from Practice or from an error detail, outside a session. */
function FreeDrill({
  ui,
  patternId,
  step,
  voiceLeft,
  micAllowed,
  ttsRate,
  onClose,
  onPaywall,
}: {
  ui: Ui;
  patternId: string;
  step: number;
  voiceLeft: number;
  micAllowed: boolean;
  ttsRate: number;
  onClose: () => void;
  onPaywall: () => void;
}) {
  const { dispatch } = useStore();
  const pattern = PATTERN_BY_ID[patternId];
  if (!pattern) return null;
  const drill = pickDrill(pattern, step);

  return (
    <Drill
      key={drill.id}
      ui={ui}
      pattern={pattern}
      drill={drill}
      progress={0.5}
      voiceLeft={voiceLeft}
      micAllowed={micAllowed}
      ttsRate={ttsRate}
      onClose={onClose}
      onCapReached={onPaywall}
      onDone={(o) => {
        dispatch({
          type: 'logAttempt',
          patternId,
          drillId: drill.id,
          answer: o.answer,
          correction: drill.target.zh,
          firstTry: o.firstTry,
          pass: o.pass,
          codes: o.codes,
          spoken: o.spoken,
        });
        onClose();
      }}
    />
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const tabs: [Tab, string, string][] = [
    ['today', 'home', 'Today'],
    ['practice', 'grid', 'Practice'],
    ['progress', 'chart', 'Progress'],
    ['me', 'user', 'Me'],
  ];
  return (
    <nav
      style={{
        display: 'flex',
        borderTop: '1px solid var(--mm-line)',
        background: 'var(--mm-bg)',
        paddingInline: 6,
        flex: 'none',
      }}
    >
      {tabs.map(([id, icon, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-current={tab === id ? 'page' : undefined}
          style={{
            flex: 1,
            minHeight: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'none',
            border: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 10.5,
            color: tab === id ? 'var(--mm-accent)' : 'var(--mm-muted)',
          }}
        >
          <Icon name={icon} size={19} />
          {label}
        </button>
      ))}
    </nav>
  );
}

/** On a phone the app fills the viewport. On a desktop it sits in a 412 dp frame
 *  so the design is always reviewed at the width it ships at. */
function Frame({
  children,
  themeVars,
  ui,
}: {
  children: React.ReactNode;
  themeVars: React.CSSProperties;
  ui: Ui;
}) {
  const [wide, setWide] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth > 560));
  useEffect(() => {
    const on = () => setWide(window.innerWidth > 560);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = ui.dark ? 'dark' : 'light';
  }, [ui.dark]);

  if (!wide) {
    return (
      <div style={{ ...themeVars, height: '100%', background: 'var(--mm-bg)', color: 'var(--mm-ink)' }}>{children}</div>
    );
  }

  return (
    <div
      style={{
        ...themeVars,
        minHeight: '100%',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: ui.dark ? '#121110' : '#e6e4e4',
      }}
    >
      <div
        style={{
          width: 412,
          height: 'min(880px, calc(100vh - 48px))',
          overflow: 'hidden',
          borderRadius: 26,
          border: '1px solid var(--mm-line)',
          background: 'var(--mm-bg)',
          color: 'var(--mm-ink)',
          boxShadow: '0 20px 60px rgba(0,0,0,.28)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
