/* Mandarin Mitra — sentence primitives.
   A chunk is one slot's worth of a sentence: pinyin over hanzi over the Hindi
   alignment cell. Every screen that shows Chinese uses these, so word order
   reads the same way everywhere. */

import { MM_DV, MM_PY, MM_SLOT, MM_ZH, slotColor, slotTint } from './slots';
import type { SlotId, Ui } from './slots';
import { Icon } from './Icon';

/** How a chunk is drawn inside feedback. */
export type ChunkState = 'plain' | 'struck' | 'flagged' | 'missing';

export interface SentenceChunk {
  slot: SlotId;
  zh: string;
  py: string;
  /** Hindi alignment, Roman script. */
  roman?: string;
  /** Hindi alignment, Devanagari. */
  deva?: string;
  /** Hindi puts this chunk in a different position — show the swap affordance. */
  swap?: boolean;
  state?: ChunkState;
}

interface ChunkProps {
  c: SentenceChunk;
  ui: Ui;
  size?: number;
  state?: ChunkState;
  showHindi?: boolean;
  onClick?: () => void;
  onSwapClick?: (c: SentenceChunk) => void;
}

export function Chunk({ c, ui, size = 27, state, showHindi = true, onClick, onSwapClick }: ChunkProps) {
  const col = slotColor(c.slot, ui);
  const s = MM_SLOT[c.slot];
  const st = state ?? c.state;
  const plain = st === 'plain';
  const hi = ui.hindi === 'deva' ? c.deva : ui.hindi === 'roman' ? c.roman : null;
  const label = `${c.zh}, ${c.py}, ${s?.label ?? ''}`;

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? label : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: onClick ? 'pointer' : 'inherit',
      }}
    >
      {ui.pinyin && (
        <span
          style={{
            fontFamily: MM_PY,
            fontSize: Math.max(11.5, size * 0.42),
            lineHeight: 1.25,
            color: 'var(--mm-muted)',
          }}
        >
          {c.py}
        </span>
      )}
      <span
        aria-label={label}
        style={{
          fontFamily: MM_ZH,
          fontSize: size,
          lineHeight: 1.35,
          color: plain ? 'var(--mm-ink)' : col,
          borderBottom: plain ? '1px solid transparent' : `${s?.bw ?? 2}px ${s?.bs ?? 'solid'} ${col}`,
          paddingBottom: 2,
          textDecoration: st === 'struck' ? 'line-through' : 'none',
          opacity: st === 'struck' ? 0.5 : 1,
          outline: st === 'flagged' ? `1.5px dashed ${col}` : 'none',
          outlineOffset: 4,
          borderRadius: 2,
        }}
      >
        {c.zh}
      </span>
      {showHindi && hi && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: ui.hindi === 'deva' ? MM_DV : MM_PY,
            fontSize: Math.max(12, size * 0.4),
            lineHeight: 1.55,
            color: 'var(--mm-muted)',
            borderBottom: `1px solid ${plain ? 'var(--mm-line)' : slotTint(c.slot, ui, 55)}`,
            paddingBottom: 1,
          }}
        >
          {hi}
          {c.swap && (
            <button
              type="button"
              aria-label={`Hindi puts ${c.zh} in a different place — explain`}
              onClick={(e) => {
                e.stopPropagation();
                onSwapClick?.(c);
              }}
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 16,
                height: 16,
                padding: 0,
                border: 0,
                background: 'none',
                color: col,
                cursor: 'pointer',
              }}
            >
              <Icon name="swap" size={12} />
            </button>
          )}
        </span>
      )}
    </span>
  );
}

interface SentenceLineProps {
  chunks: readonly SentenceChunk[];
  ui: Ui;
  size?: number;
  state?: ChunkState;
  showHindi?: boolean;
  gap?: number;
  justify?: 'center' | 'flex-start';
  onSwapClick?: (c: SentenceChunk) => void;
}

export function SentenceLine({
  chunks,
  ui,
  size = 27,
  state,
  showHindi = true,
  gap = 8,
  justify = 'center',
  onSwapClick,
}: SentenceLineProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: justify,
        gap: `4px ${gap}px`,
      }}
    >
      {chunks.map((c, i) => (
        <Chunk
          key={`${c.zh}-${i}`}
          c={c}
          ui={ui}
          size={size}
          state={c.state ?? state}
          showHindi={showHindi}
          onSwapClick={onSwapClick}
        />
      ))}
    </div>
  );
}

interface SkeletonStripProps {
  slots: readonly SlotId[];
  ui: Ui;
  compact?: boolean;
  /** Index of the slot the learner has to fill — drawn as a dashed outline. */
  empty?: number;
}

/** The slot skeleton — the pattern shown without words. */
export function SkeletonStrip({ slots, ui, compact, empty }: SkeletonStripProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 5 : 7, alignItems: 'center' }}>
      {slots.map((id, i) => {
        const s = MM_SLOT[id];
        const col = slotColor(id, ui);
        const isEmpty = empty === i;
        return (
          <span
            key={`${id}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              color: col,
              fontFamily: 'var(--font-body)',
              fontSize: compact ? 10 : 11.5,
              letterSpacing: '0.04em',
              padding: compact ? '2px 7px' : '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: `${isEmpty ? 1.5 : 1}px ${isEmpty ? 'dashed' : 'solid'} ${col}`,
              background: isEmpty ? 'transparent' : slotTint(id, ui, ui.dark ? 16 : 9),
            }}
          >
            <Icon name={s?.icon ?? 'box'} size={compact ? 10 : 12} />
            {s?.label}
          </span>
        );
      })}
    </div>
  );
}

/** Render a plain Chinese string with pinyin, when there are no slots to show. */
export function PlainZh({ zh, py, size = 22 }: { zh: string; py?: string; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {py && (
        <span style={{ fontFamily: MM_PY, fontSize: Math.max(11, size * 0.42), color: 'var(--mm-muted)' }}>
          {py}
        </span>
      )}
      <span style={{ fontFamily: MM_ZH, fontSize: size, lineHeight: 1.35 }}>{zh}</span>
    </span>
  );
}
