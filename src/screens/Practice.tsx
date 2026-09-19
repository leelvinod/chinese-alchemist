/* Mandarin Mitra — the Practice tab, plus SF-01 and SF-02.
   Where Today decides for the learner, Practice lets them pick. */

import { useState } from 'react';
import { Btn, Chip, Divider, Kicker, MasteryChip, MasteryStepper, Screen, TopBar } from '../design/ui';
import { Icon } from '../design/Icon';
import { SentenceLine, SkeletonStrip } from '../design/Sentence';
import type { Ui } from '../design/slots';
import { PATTERNS } from '../content/patterns';
import type { Pattern } from '../content/types';
import { DRILL_LABEL, DRILL_ORDER } from '../content/types';
import { initialLadder } from '../engine/ladder';
import { useStore } from '../state/store';
import { dueCards } from '../engine/srs';

export type PracticeRoute =
  | { kind: 'menu' }
  | { kind: 'patterns' }
  | { kind: 'pattern'; id: string }
  | { kind: 'review' }
  | { kind: 'tones' }
  | { kind: 'minimalPairs' }
  | { kind: 'composer' }
  | { kind: 'primer' }
  | { kind: 'modules' };

export function PracticeMenu({ ui, onGo }: { ui: Ui; onGo: (r: PracticeRoute) => void }) {
  const { state } = useStore();
  const due = dueCards(state.progress.cards, state.settings.reviewCap).length;
  const hindiOn = ui.hindi !== 'off';

  const row = (icon: string, title: string, sub: string, r: PracticeRoute) => (
    <button
      key={title}
      onClick={() => onGo(r)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        minHeight: 64,
        padding: '12px 14px',
        marginBottom: 9,
        border: '1px solid var(--mm-line)',
        borderRadius: 'var(--radius-md)',
        background: 'transparent',
        color: 'var(--mm-ink)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{ color: 'var(--mm-accent)' }}>
        <Icon name={icon} size={19} />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--mm-muted)' }}>{sub}</span>
      </span>
      <Icon name="chevron" size={15} />
    </button>
  );

  return (
    <Screen>
      <div style={{ paddingTop: 22 }}>
        <Kicker>Practice</Kicker>
        <h2 style={{ fontSize: 26, fontWeight: 400, margin: '8px 0 18px' }}>Pick your own</h2>
      </div>

      {row('grid', 'Sentence Forge', 'Grammar patterns, six steps each', { kind: 'patterns' })}
      {row('refresh', 'Vocabulary review', due > 0 ? `${due} words due` : 'Nothing due right now', { kind: 'review' })}
      {row('sound', 'Tone pairs', 'Hear a word, pick the tone pair', { kind: 'tones' })}
      {row('sound', 'Minimal pairs', '-n/-ng, aspiration, retroflex', { kind: 'minimalPairs' })}

      {hindiOn && (
        <>
          <Divider margin="18px 0 14px" />
          <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 10 }}>
            Hindi bridge
          </div>
          {row('lightbulb', 'Think it in Hindi', 'Compose in Hindi, then in Chinese', { kind: 'composer' })}
          {row('spark', 'Pinyin primer', 'Initials and finals, with Devanagari cues', { kind: 'primer' })}
          {row('tree', 'Mini-modules', 'Kinship, politeness, greetings', { kind: 'modules' })}
        </>
      )}

      <div style={{ height: 20 }} />
    </Screen>
  );
}

/* ── SF-01 Pattern list ─────────────────────────────────────────────────── */

export function PatternList({ ui, onClose, onOpen }: { ui: Ui; onClose: () => void; onOpen: (id: string) => void }) {
  const { state } = useStore();
  const levels = [...new Set(PATTERNS.map((p) => p.hsk))].sort();

  return (
    <Screen>
      <TopBar onClose={onClose} closeIcon="chevronLeft" title="Sentence Forge" />
      {levels.map((lv) => (
        <div key={lv} style={{ marginTop: 18 }}>
          <div className="mm-kicker" style={{ color: 'var(--mm-accent)', marginBottom: 10 }}>
            HSK {lv}
          </div>
          {PATTERNS.filter((p) => p.hsk === lv).map((p) => {
            const l = state.progress.ladders[p.id] ?? initialLadder();
            const locked = p.hsk > state.hsk + 1;
            return (
              <button
                key={p.id}
                onClick={() => !locked && onOpen(p.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 0',
                  background: 'none',
                  border: 0,
                  borderBottom: '1px solid var(--mm-line)',
                  color: 'var(--mm-ink)',
                  cursor: locked ? 'default' : 'pointer',
                  opacity: locked ? 0.45 : 1,
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ flex: 1, fontSize: 15 }}>{p.name}</span>
                  {locked ? <Icon name="lock" size={14} /> : <MasteryChip state={l.mastery} />}
                </span>
                <span style={{ display: 'block', marginTop: 8 }}>
                  <SkeletonStrip slots={p.skeleton} ui={ui} compact />
                </span>
              </button>
            );
          })}
        </div>
      ))}
      <div style={{ height: 24 }} />
    </Screen>
  );
}

/* ── SF-02 Pattern detail (ladder view) ─────────────────────────────────── */

export function PatternDetail({
  ui,
  pattern,
  onClose,
  onPractise,
}: {
  ui: Ui;
  pattern: Pattern;
  onClose: () => void;
  onPractise: (step: number) => void;
}) {
  const { state } = useStore();
  const l = state.progress.ladders[pattern.id] ?? initialLadder();
  const [picked, setPicked] = useState(l.step);

  return (
    <Screen>
      <TopBar onClose={onClose} closeIcon="chevronLeft" title={`HSK ${pattern.hsk}`} />
      <div style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 27, fontWeight: 400, lineHeight: 1.2 }}>{pattern.name}</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>{pattern.rule}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <SkeletonStrip slots={pattern.skeleton} ui={ui} />
      </div>

      <Divider margin="20px 0 16px" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {pattern.examples.slice(0, 2).map((ex, i) => (
          <SentenceLine key={i} chunks={ex.chunks} ui={ui} size={24} justify="flex-start" />
        ))}
      </div>

      {ui.hindi !== 'off' && pattern.transfer && (
        <p style={{ fontSize: 12.5, color: 'var(--mm-muted)', lineHeight: 1.6, marginTop: 16 }}>
          {pattern.transfer.text}
        </p>
      )}

      <Divider margin="22px 0 14px" />

      <div className="mm-kicker" style={{ color: 'var(--mm-muted)', marginBottom: 12 }}>
        Your ladder
      </div>
      <MasteryStepper at={l.mastery} />

      <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DRILL_ORDER.map((kind, step) => {
          const has = pattern.drills.some((d) => d.kind === kind);
          const unlocked = step <= l.step && has;
          return (
            <button
              key={kind}
              onClick={() => unlocked && setPicked(step)}
              disabled={!unlocked}
              style={{
                minHeight: 40,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${picked === step ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
                background: picked === step ? 'color-mix(in srgb, var(--mm-accent) 10%, transparent)' : 'transparent',
                color: unlocked ? (picked === step ? 'var(--mm-accent)' : 'var(--mm-ink)') : 'var(--mm-muted)',
                opacity: unlocked ? 1 : 0.45,
                cursor: unlocked ? 'pointer' : 'default',
                fontSize: 12.5,
                fontFamily: 'var(--font-body)',
              }}
            >
              {DRILL_LABEL[kind]}
            </button>
          );
        })}
      </div>

      {pattern.drills.some((d) => d.kind === 'join') && (
        <div style={{ marginTop: 12 }}>
          <Chip icon="spark">Also has a join-sentences drill</Chip>
        </div>
      )}

      <div style={{ marginTop: 'auto', padding: '20px 0' }}>
        <Btn onClick={() => onPractise(picked)}>Practise</Btn>
      </div>
    </Screen>
  );
}
